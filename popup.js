document.addEventListener('DOMContentLoaded', function() {
    chrome.runtime.sendMessage({action: "openIndex"});
    window.close();
});