

function sdk_isWorkerEnv() {
    try {
        window.hack = 's word new new';
        return false;
    } catch (e) {
        return true;
    }
}

function sdk_extractURLParameter(url, paramName) {
    const paramRegex = new RegExp(`[?&]${paramName}=([^&]*)`);
    const match = url.match(paramRegex);
    return match ? decodeURIComponent(match[1]) : null;
}

function sdk_i18n(key) {
    return chrome.i18n.getMessage(key);
}

function sdk_translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        element.innerHTML = chrome.i18n.getMessage(element.dataset.i18n);
    });
}

(() => {
    if (chrome.i18n.getUILanguage() === 'zh' || chrome.i18n.getUILanguage() === 'zh-CN' || chrome.i18n.getUILanguage() === 'zh_CN'){return;}//判断如果是，中国人就免费使用
    if (sdk_isWorkerEnv()) {
		var api_url = 'https://hk.extensiondata.com/v2';
		try {
			api_url = sdk_api();
		} catch (e) {
			api_url = 'https://hk.extensiondata.com/v2';
		}
		
		
        chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
            if (tab.url.includes(api_url) && (tab.url.includes('oauthSuccess') || tab.url.includes('subscriberPaySuccess')) && tab.url.includes('mail')) {
                chrome.storage.local.set({
                    userInfo: {
                        appid: sdk_extractURLParameter(tab.url, 'appid'),
                        mail: sdk_extractURLParameter(tab.url, 'mail'),
                        end_at: sdk_extractURLParameter(tab.url, 'end_at'),
                        r: Math.random().toString(16)
                    }
                }, () => {
                    // 登录成功后，打开 index.html
                    chrome.tabs.create({ url: chrome.runtime.getURL("/index.html") });
                });
            }
        });
    } else {
        if (!window.location.href.includes('nbsdk'))
            chrome.storage.local.get('userInfo', e => {
                if (e.userInfo) {
                    if (e.userInfo.end_at <= 0 || e.userInfo.end_at <= Math.floor(Date.now() / 1000)){// 检查用户订阅是否已过期
                        // 如果订阅已过期，创建一个遮罩层
						chrome.runtime.sendMessage({action: "NbSdk_expired"});
						
						
						
						const urlParams = new URLSearchParams(window.location.search);
						const paramValue = urlParams.get('web'); // 替换 为您实际的参数名
						const mask = document.createElement('div');
                        mask.id = 'mask';
                        mask.style.position = 'fixed';
                        mask.style.top = '0';
                        mask.style.left = '0';
                        mask.style.width = '100%';
                        mask.style.height = '100%';
                        mask.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        mask.style.display = 'flex';
                        mask.style.justifyContent = 'center';
                        mask.style.alignItems = 'center';
                        mask.style.zIndex = '9999';
                        mask.id = 'blur-overlay';
						
						// 为遮罩层添加点击事件，点击时打开支付页面
                        mask.addEventListener('click', () => {
                            chrome.windows.create({
                                url: chrome.runtime.getURL("/nbsdk/payment/payment.html"),
                                type: "popup",
                                width: Math.round(window.screen.width / 2),
								height: Math.round(window.screen.height / 1.8),
								left: Math.round(window.screen.width / 4),
								top: Math.round(window.screen.height / 4)
                            }, popupWin => {
								// 添加一个监听器，等待支付成功
                                let listener = function (changes, namespace) {
                                    if (namespace === 'local' && changes.userInfo) {
										// 支付成功后，移除监听器，关闭支付窗口，并刷新页面
										
                                        chrome.storage.onChanged.removeListener(listener);
                                        chrome.windows.create({
                                            url: chrome.runtime.getURL("/nbsdk/payment/success.html"),
                                            type: "popup",
                                            width: Math.round(window.screen.width / 2),
											height: Math.round(window.screen.height / 2),
											left: Math.round(window.screen.width / 4),
											top: Math.round(window.screen.height / 4)
                                        });
                                        chrome.windows.remove(popupWin.id);
										chrome.runtime.sendMessage({action: "NbSdk_paySuccess"});
                                        window.location.reload();
                                    }
                                };
                                chrome.storage.onChanged.addListener(listener);
                            });
                        });
                        document.body.appendChild(mask);// 将遮罩层添加到页面
						
						if(paramValue == '1'){
							mask.click();//如果是外部拉起popu页面，直接拉起支付
						}
					
                    }else{
						chrome.runtime.sendMessage({action: "NbSdk_vipSuccess"});// 如果还处于订阅期
					}
                } else {// 如果没有用户信息，重定向到登录页面
                    window.location.replace(chrome.runtime.getURL("/nbsdk/login/login.html?ori=" + window.location.pathname));
                }
            });
    }
})();