

// 返回应用程序ID
function sdk_appid() {
    return 'todayearn';
}

// 返回API的URL
function sdk_api() {
    return 'https://hk.extensiondata.com/v2';
}

// 返回OAuth2配置
function sdk_oauth2() {
    return {
        client_id: '302141211753-1ktvertkqcsnu87qel2r3li76mg1llth.apps.googleusercontent.com',
        redirect_uri: 'https%3A//rapid-waterfall-273a.chromeextensions.workers.dev/oauth2callback'
    };
}











// 监听来自其他部分的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "NbSdk_expired") {//会员到期后，需要自定义执行的代码
		console.log('会员到期后，需要自定义执行的代码');
		chrome.storage.local.set({nbsdk_vip: 0});
		
		
		
		return false;
	}


	if (request.action === "NbSdk_paySuccess") {//支付成功后，需要自定义执行的代码
		console.log('支付成功后，需要自定义执行的代码');
		chrome.storage.local.set({nbsdk_vip: 1});
		
		
		
		
		return false;
	}
	
	
	if (request.action === "NbSdk_vipSuccess") {//还处于订阅期，需要自定义执行的代码
		console.log('还处于订阅期，需要自定义执行的代码');
		chrome.storage.local.set({nbsdk_vip: 1});
		
		
		
		
		return false;
	}
	
	if (request.action == 'openPopup') {
		chrome.tabs.create({'url': chrome.runtime.getURL("popup.html?web=1")});
		return false;
	}
});