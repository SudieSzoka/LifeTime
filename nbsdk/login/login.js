sdk_translatePage();
const sdkOauth2 = sdk_oauth2();

try {
  const icons = chrome.runtime.getManifest().icons;
  let maxSize = 0;
  let largestIcon = '';

  for (const size in icons) {
    const numericSize = parseInt(size, 10);
    if (numericSize > maxSize) {
      maxSize = numericSize;
      largestIcon = icons[size];
    }
  }

  if (largestIcon) {
    document.getElementById('logo').src = chrome.runtime.getURL(largestIcon);
  }

  document.getElementById('nksdkName').innerText = chrome.runtime.getManifest().name || '';
} catch (e) {
  console.error('获取图标或扩展名称时出错:', e);
}

document.getElementById('signInBtn').addEventListener('click', () => {
    chrome.windows.create({
        url: `https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A//www.googleapis.com/auth/userinfo.email&access_type=offline&include_granted_scopes=true&response_type=code&client_id=${sdkOauth2.client_id}&state=${sdk_appid()}&redirect_uri=${sdkOauth2.redirect_uri}`,
        type: "popup",
        width: Math.round(window.screen.width / 2),
		height: Math.round(window.screen.height / 2),
		left: Math.round(window.screen.width / 4),
		top: Math.round(window.screen.height / 4)
    }, popupWin => {
        let listener = function (changes, namespace) {
            if (namespace === 'local' && changes.userInfo) {
                chrome.storage.onChanged.removeListener(listener);
                chrome.windows.remove(popupWin.id);
                window.location.replace(chrome.runtime.getURL(sdk_extractURLParameter(window.location.href, 'ori')));
            }
        };
        chrome.storage.onChanged.addListener(listener);
    });
});