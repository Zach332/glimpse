import * as browser from 'webextension-polyfill';
import { DataService } from './app/data.service';
import { ImageService } from './app/image-service';
import { DataSourceType } from './app/interfaces/data-source-type';

browser.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId === 0) {
    const currentTab = browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => tabs[0]);
    const image = browser.tabs.captureVisibleTab();
    if (details.tabId === (await currentTab).id! && DataService.isValidPage(details.url)) {
      ImageService.putImage([DataSourceType.Window, (await currentTab).id!], await image);
    }
  }
});

browser.tabs.onActivated.addListener((activeInfo) => {
  // TODO: Remove timeout at some point (https://bugs.chromium.org/p/chromium/issues/detail?id=1213925)
  setTimeout(async () => {
    if (
      !browser.runtime.lastError &&
      DataService.isValidPage((await browser.tabs.get(activeInfo.tabId)).url!)
    ) {
      const image = browser.tabs.captureVisibleTab();
      ImageService.putImage([DataSourceType.Window, activeInfo.tabId], await image);
    }
  }, 500);
});
