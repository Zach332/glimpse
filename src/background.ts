import * as browser from 'webextension-polyfill';
import { DataService } from './app/data.service';
import { Database } from './app/database';
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

async function addPage(page: Page, dataSource: DataSource) {
  if (dataSource.dataSourceId[0] === DataSourceType.Window) {
    const tab = await browser.tabs.create({
      url: page.url,
      active: false,
      windowId: dataSource.dataSourceId[1],
    });
    return DataService.getPageIdFromTab(tab);
  }
  const bookmark = await browser.bookmarks.create({
    parentId: dataSource.dataSourceId[1],
    title: page.title,
    url: page.url,
  });
  return DataService.getPageIdFromBookmark(bookmark);
}

async function removePage(page: Page) {
  if (page.pageId[0] === DataSourceType.Window) {
    browser.tabs.remove(page.pageId[2]);
  } else {
    browser.bookmarks.remove(page.pageId[2]);
  }
}

function removePages(pages: Page[]) {
  pages.forEach((page) => {
    removePage(page);
  });
}

async function moveOrCopyPage(
  source: Page,
  destination: DataSource,
  currentTabId: number | undefined,
  operation: Operation,
) {
  if (currentTabId === source.pageId[2]) {
    return;
  }
  const db = new Database();
  // Collect IDB-stored page data for page
  const image = (await db.images.get(source.pageId))?.image;
  const timeLastAccessed = (await db.accessTimes.get(source.pageId))?.accessTime;
  let favicon: string | undefined;
  if (source.pageId[0] === DataSourceType.Window) {
    favicon = (await browser.tabs.get(source.pageId[2])).favIconUrl!;
  } else {
    favicon = (await db.favicons.get(source.pageId))?.favicon;
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
      removePage(source);
    }
    newPageId = await addPage(source, destination);
  }

  // Put page data in IDB
  if (data[0]) {
    db.images.put({
      pageId: newPageId,
      image: data[0],
    });
  }
  if (data[1]) {
    db.accessTimes.put({
      pageId: newPageId,
      accessTime: data[1],
    });
  }
  if (data[2] && newPageId[0] === DataSourceType.Folder) {
    db.favicons.put({
      pageId: newPageId,
      favicon: data[2],
    });
  }
}

async function moveOrCopyPages(
  sources: Page[],
  destination: DataSource,
  activeTab: number | undefined,
  operation: Operation,
) {
  sources.forEach((source) => {
    moveOrCopyPage(source, destination, activeTab, operation);
  });
}

browser.runtime.onMessage.addListener(async (message) => {
  const db = new Database();
  if (message.type === 'addWindow') {
    const currentWindow = message.currentWindow;
    const currentWindowGlimpseTabId = message.currentWindowGlimpseTabId;
    const name = message.name;
    const initialPages = message.initialPages;
    const copy = message.copy;

    // Create new window
    const newWindow = await browser.windows.create({
      focused: true,
      state: currentWindow.state,
    });

    const newWindowGlimpseTabId = (await browser.tabs.query({ windowId: newWindow.id }))[0].id!;

    // Add name to new window (if specified)
    if (name) {
      await db.names.put(name, newWindow.id!);
    }

    const dataSource = DataService.convertWindowToDataSource(newWindow);

    // Add initial pages to new window
    if (initialPages) {
      if (copy) {
        moveOrCopyPages(initialPages, await dataSource, currentWindowGlimpseTabId, Operation.Copy);
      } else {
        moveOrCopyPages(initialPages, await dataSource, currentWindowGlimpseTabId, Operation.Move);
      }

      // Once a tab in the new window is created, remove the glimpse tab in the new window
      browser.tabs.onCreated.addListener(function closeGlimpseTabAfterNewTabOpened(tab) {
        if (tab.windowId === newWindow.id) {
          browser.tabs.remove(newWindowGlimpseTabId);
        }
        browser.tabs.onCreated.removeListener(closeGlimpseTabAfterNewTabOpened);
      });

      // For the window -> window move case, listen for attachment
      browser.tabs.onAttached.addListener(function closeGlimpseTabAfterTabMoved(tabId, attachInfo) {
        if (attachInfo.newWindowId === newWindow.id) {
          browser.tabs.remove(newWindowGlimpseTabId);
        }
        browser.tabs.onAttached.removeListener(closeGlimpseTabAfterTabMoved);
      });
    }

    // Close glimpse tab in current window
    browser.tabs.remove(currentWindowGlimpseTabId);
  } else if (message.type === 'switchToTab') {
    const destinationWindowId = message.destinationWindowId;
    const destinationTabId = message.destinationTabId;
    const glimpseTabId = message.glimpseTabId;

    browser.windows.update(destinationWindowId, { focused: true });
    browser.tabs.update(destinationTabId, { active: true });
    browser.tabs.remove(glimpseTabId);
  } else if (message.type === 'removePage') {
    const page = message.page;
    removePage(page);
  } else if (message.type === 'movePages') {
    const sources = message.sources;
    const destination = message.destination;
    const activeTab = message.activeTab;
    moveOrCopyPages(sources, destination, activeTab, Operation.Move);
  } else if (message.type === 'copyPages') {
    const sources = message.sources;
    const destination = message.destination;
    const activeTab = message.activeTab;
    moveOrCopyPages(sources, destination, activeTab, Operation.Copy);
  } else if (message.type === 'removePages') {
    const pages = message.pages;
    removePages(pages);
  }
});

async function captureTab() {
  const db = new Database();
  const initialCurrentPage = await browser.tabs
    .query({ active: true, currentWindow: true })
    .then((tabs) => tabs[0]);
  if (initialCurrentPage && isValidPage(initialCurrentPage.url!)) {
    try {
      const image = await browser.tabs.captureVisibleTab();
      const currentTab = await browser.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs) => tabs[0]);
      if (initialCurrentPage.id! === currentTab.id!) {
        db.images.put({
          pageId: DataService.getPageIdFromTab(currentTab),
          image,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
}

browser.webNavigation.onCompleted.addListener(async (details) => {
  const db = new Database();
  if (details.frameId === 0 && isValidPage(details.url)) {
    try {
      const image = await browser.tabs.captureVisibleTab();
      const currentTab = await browser.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs) => tabs[0]);
      if (details.tabId === currentTab.id!) {
        db.images.put({
          pageId: DataService.getPageIdFromTab(currentTab),
          image,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
});

browser.tabs.onActivated.addListener(async (activeInfo) => {
  const db = new Database();
  try {
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
        db.images.put({
          pageId: DataService.getPageIdFromTab(currentTab),
          image,
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

browser.bookmarks.onCreated.addListener(async (id, bookmark) => {
  const db = new Database();
  const initialCurrentTab = await browser.tabs
    .query({ active: true, currentWindow: true })
    .then((tabs) => tabs[0]);
  if (isValidPage(initialCurrentTab.url!)) {
    try {
      const image = await browser.tabs.captureVisibleTab();
      const currentTab = await browser.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs) => tabs[0]);
      if (bookmark.url! === currentTab.url!) {
        const pageId = DataService.getPageIdFromBookmark(bookmark);
        db.images.put({
          pageId,
          image,
        });
        db.favicons.put({
          pageId,
          favicon: currentTab.favIconUrl!,
        });
        db.accessTimes.put({
          pageId,
          accessTime: Date.now(),
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
});

browser.bookmarks.onMoved.addListener(async (id, moveInfo) => {
  const db = new Database();
  const originalPageId: PageId = [DataSourceType.Folder, moveInfo.oldParentId, id];
  const image = (await db.images.get(originalPageId))?.image;
  const accessTime = (await db.accessTimes.get(originalPageId))?.accessTime;
  const favicon = (await db.favicons.get(originalPageId))?.favicon;

  db.deletePageData([DataSourceType.Folder, moveInfo.oldParentId, id]);

  const newPageId: PageId = [DataSourceType.Folder, moveInfo.parentId!, id!];
  if (image) {
    db.images.put({
      pageId: newPageId,
      image,
    });
  }
  if (accessTime) {
    db.accessTimes.put({
      pageId: newPageId,
      accessTime,
    });
  }
  if (favicon) {
    db.favicons.put({
      pageId: newPageId,
      favicon,
    });
  }
});

browser.tabs.onCreated.addListener((tab) => {
  const db = new Database();
  db.accessTimes.put({
    pageId: DataService.getPageIdFromTab(tab),
    accessTime: Date.now(),
  });
});

browser.tabs.onActivated.addListener((activeInfo) => {
  const db = new Database();
  browser.windows.getCurrent().then((activeWindow) => {
    if (activeWindow.id === activeInfo.windowId) {
      db.accessTimes.put({
        pageId: [DataSourceType.Window, activeInfo.windowId, activeInfo.tabId],
        accessTime: Date.now(),
      });
    }
  });
});

browser.windows.onFocusChanged.addListener(async (windowId) => {
  const db = new Database();
  const activeTabInWindow = await browser.tabs
    .query({ active: true, windowId })
    .then((tabs) => tabs[0]);
  if (activeTabInWindow.id) {
    db.accessTimes.put({
      pageId: [DataSourceType.Window, windowId, activeTabInWindow.id],
      accessTime: Date.now(),
    });
  }
});

browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
  const db = new Database();
  db.deletePageData([DataSourceType.Window, removeInfo.windowId, tabId]);
});

browser.bookmarks.onRemoved.addListener((id, removeInfo) => {
  const db = new Database();
  db.deletePageData([DataSourceType.Folder, removeInfo.parentId, id]);
});

browser.runtime.onStartup.addListener(() => {
  const db = new Database();
  db.deleteSessionData();
});
