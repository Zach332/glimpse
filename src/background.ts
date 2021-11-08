import * as browser from 'webextension-polyfill';
import { IDBService } from './app/idb-service';
import { DataSourceType } from './app/interfaces/data-source-type';
import { PageId } from './app/interfaces/page-id';

function isValidPage(url: string) {
  return !(
    url.startsWith('moz-extension://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('about:') ||
    url.startsWith('chrome://')
  );
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
