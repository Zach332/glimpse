import { DataService } from './app/data.service';
import { TabPageData } from './app/interfaces/tab-page-data';

chrome.webNavigation.onCommitted.addListener((details) => {
  // Do not index extension or browser pages
  if (
    details.url.startsWith('moz-extension://') ||
    details.url.startsWith('chrome-extension://') ||
    details.url.startsWith('about:') ||
    details.url.startsWith('chrome://')
  ) {
    return;
  }
  if (details.frameId === 0) {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const currentTab = tabs[0];
      if (currentTab.id === details.tabId) {
        // TODO: Change to upsert
        const tabPageData = await DataService.getTabPageData(details.tabId);
        if (!tabPageData) {
          DataService.insertPageData(<TabPageData>{
            title: currentTab.title,
            url: currentTab.url,
            tabId: currentTab.id,
          });
        }
      }
    });
  }
});

chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) {
    chrome.tabs.captureVisibleTab(async (dataUrl) => {
      const tabPageData = await DataService.getTabPageData(details.tabId);
      if (tabPageData) {
        chrome.tabs.get(details.tabId, (tab) => {
          if (tab.title) {
            tabPageData.title = tab!.title;
          }
          if (tab.url) {
            tabPageData.url = tab.url;
          }
          tabPageData.image = dataUrl;
          DataService.updatePageData(tabPageData);
        });
      }
    });
  }
});

// TODO: Remove timeout once Chrome 93 is released (Aug 31st?)
chrome.tabs.onActivated.addListener((activeInfo) => {
  setTimeout(() => {
    chrome.tabs.captureVisibleTab(async (dataUrl) => {
      if (!chrome.runtime.lastError) {
        const tabPageData = await DataService.getTabPageData(activeInfo.tabId);
        if (tabPageData) {
          tabPageData.image = dataUrl;
          DataService.updatePageData(tabPageData);
        }
      }
    });
  }, 500);
});
