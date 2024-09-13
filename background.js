if (typeof importScripts === 'function') {
    importScripts("/nbsdk/config.js", "/nbsdk/nbsdk.js");
}

chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.create({ url: 'index.html' });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "openPopup") {
        chrome.tabs.create({'url': chrome.runtime.getURL("popup.html?web=1")});
    } else if (message.action === "loginSuccess") {
        // 登录成功后打开新标签页
        chrome.tabs.create({'url': chrome.runtime.getURL("index.html")});
    } else if (message.action === "openIndex") {
        chrome.tabs.create({'url': chrome.runtime.getURL("index.html")});
    }
});

// 删除以下代码块
// document.addEventListener('DOMContentLoaded', function() {
//     document.getElementById('openIndex').addEventListener('click', function() {
//         chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
//     });
// });