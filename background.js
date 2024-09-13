importScripts("/nbsdk/config.js", "/nbsdk/nbsdk.js");

chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.create({ url: 'newtab.html' });
  });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "openPopup") {
        chrome.tabs.create({'url': chrome.runtime.getURL("popup.html?web=1")});
    }
});