import * as browser from 'webextension-polyfill';
import { DataService } from './app/data.service';
import { IDBService } from './app/idb-service';
import { DataSource } from './app/interfaces/data-source';
import { DataSourceType } from './app/interfaces/data-source-type';
import { Operation } from './app/interfaces/operation';
import { Page } from './app/interfaces/page';
import { PageId } from './app/interfaces/page-id';

let captureTabOIntervalId: NodeJS.Timeout;

function isValidPage(url: string) {
  return !(
    url.startsWith('moz-extension://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('about:') ||
    url.startsWith('chrome://')
  );
}

browser.runtime.onMessage.addListener(async (message) => {
  if (message.type === 'addWindow') {
    // Create new window
    const newWindow = await browser.windows.create({
      focused: true,
      state: message.currentWindow.state,
    });

    const glimpseTabId = (await browser.tabs.query({ windowId: newWindow.id }))[0].id!;

    // Add name to new window (if specified)
    if (message.name) {
      await IDBService.putName(newWindow.id!, message.name);
    }

    const dataSource = DataService.convertWindowToDataSource(newWindow);

    // Add initial pages to new window
    if (message.initialPages) {
      if (message.copy) {
        DataService.copyPages(message.initialPages, await dataSource);
      } else {
        DataService.movePages(message.initialPages, await dataSource);
      }

      // Once a tab in the new window is created, remove the glimpse tab
      browser.tabs.onCreated.addListener(function closeGlimpseTabAfterNewTabOpened(tab) {
        if (tab.windowId === newWindow.id) {
          browser.tabs.remove(glimpseTabId);
        }
        browser.tabs.onCreated.removeListener(closeGlimpseTabAfterNewTabOpened);
      });

      // For the window -> window move case, listen for attachment
      browser.tabs.onAttached.addListener(function closeGlimpseTabAfterTabMoved(tabId, attachInfo) {
        if (attachInfo.newWindowId === newWindow.id) {
          browser.tabs.remove(glimpseTabId);
        }
        browser.tabs.onAttached.removeListener(closeGlimpseTabAfterTabMoved);
      });
    }
  } else if (message.type === 'moveOrCopyPage') {
    const source: Page = message.source;
    const destination: DataSource = message.destination;
    const operation: Operation = message.operation;

    // Collect IDB-stored page data for page
    const image = IDBService.getImage(source.pageId);
    const timeLastAccessed = IDBService.getTimeLastAccessed(source.pageId);
    let favicon: Promise<string | undefined>;
    if (source.pageId[0] === DataSourceType.Window) {
      favicon = browser.tabs.get(source.pageId[2]).then((tab) => tab.favIconUrl!);
    } else {
      favicon = IDBService.getFavicon(source.pageId);
    }
    const data = await Promise.all([image, timeLastAccessed, favicon]);

    // Move or copy page
    let newPageId: PageId | undefined;
    if (
      source.pageId[0] === DataSourceType.Window &&
      destination.dataSourceId[0] === DataSourceType.Window &&
      operation === Operation.Move
    ) {
      const tab = (await browser.tabs.move(source.pageId[2], {
        index: -1,
        windowId: destination.dataSourceId[1],
      })) as browser.Tabs.Tab;
      newPageId = DataService.getPageIdFromTab(tab);
    } else {
      if (operation === Operation.Move) {
        DataService.removePage(source);
      }
      newPageId = await DataService.addPage(source, destination);
    }

    // Put page data in IDB
    if (data[0]) {
      IDBService.putImage(newPageId, data[0]);
    }
    if (data[1]) {
      IDBService.putTimeLastAccessed(newPageId, data[1]);
    }
    if (data[2] && newPageId[0] === DataSourceType.Folder) {
      IDBService.putFavicon(newPageId, data[2]);
    }
  } else if (message.type === 'removePages') {
    message.pages.forEach((page: Page) => {
      DataService.removePage(page);
    });
  }
});

async function captureTab() {
  const initialCurrentPage = await browser.tabs
    .query({ active: true, currentWindow: true })
    .then((tabs) => tabs[0]);
  if (initialCurrentPage && isValidPage(initialCurrentPage.url!)) {
    const image = await browser.tabs.captureVisibleTab();
    const currentTab = await browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => tabs[0]);
    if (initialCurrentPage.id! === currentTab.id!) {
      IDBService.putImage([DataSourceType.Window, currentTab.windowId!, currentTab.id!], image);
    }
  }
}

browser.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId === 0 && isValidPage(details.url)) {
    const image = await browser.tabs.captureVisibleTab();
    const currentTab = await browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => tabs[0]);
    if (details.tabId === currentTab.id!) {
      IDBService.putImage([DataSourceType.Window, currentTab.windowId!, currentTab.id!], image);
    }
  }
});

browser.tabs.onActivated.addListener(async (activeInfo) => {
  if (captureTabOIntervalId) {
    clearInterval(captureTabOIntervalId);
  }
  captureTabOIntervalId = setInterval(captureTab, 1000);
  const initialCurrentPage = await browser.tabs.get(activeInfo.tabId);
  if (!browser.runtime.lastError && isValidPage(initialCurrentPage.url!)) {
    const image = await browser.tabs.captureVisibleTab();
    const currentTab = await browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => tabs[0]);
    if (initialCurrentPage.id! === currentTab.id!) {
      IDBService.putImage([DataSourceType.Window, currentTab.windowId!, currentTab.id!], image);
    }
  }
});

browser.bookmarks.onCreated.addListener(async (id, bookmark) => {
  const initialCurrentTab = await browser.tabs
    .query({ active: true, currentWindow: true })
    .then((tabs) => tabs[0]);
  if (isValidPage(initialCurrentTab.url!)) {
    const image = await browser.tabs.captureVisibleTab();
    const currentTab = await browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => tabs[0]);
    if (bookmark.url! === currentTab.url!) {
      const pageId: PageId = [DataSourceType.Folder, bookmark.parentId!, bookmark.id!];
      IDBService.putImage(pageId, image);
      IDBService.putTimeLastAccessed(pageId, Date.now());
      IDBService.putFavicon(pageId, currentTab.favIconUrl!);
    }
  }
});

browser.tabs.onCreated.addListener((tab) => {
  IDBService.putTimeLastAccessed([DataSourceType.Window, tab.windowId!, tab.id!], Date.now());
});

browser.tabs.onActivated.addListener((activeInfo) => {
  IDBService.putTimeLastAccessed(
    [DataSourceType.Window, activeInfo.windowId, activeInfo.tabId],
    Date.now(),
  );
});

browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
  IDBService.deletePageData([DataSourceType.Window, removeInfo.windowId, tabId]);
});

browser.runtime.onStartup.addListener(() => {
  IDBService.deleteSessionData();
});
