

// ����Ӧ�ó���ID
function sdk_appid() {
    return 'todayearn';
}

// ����API��URL
function sdk_api() {
    return 'https://hk.extensiondata.com/v2';
}

// ����OAuth2����
function sdk_oauth2() {
    return {
        client_id: '302141211753-1ktvertkqcsnu87qel2r3li76mg1llth.apps.googleusercontent.com',
        redirect_uri: 'https%3A//rapid-waterfall-273a.chromeextensions.workers.dev/oauth2callback'
    };
}











// ���������������ֵ���Ϣ
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "NbSdk_expired") {//��Ա���ں���Ҫ�Զ���ִ�еĴ���
		console.log('��Ա���ں���Ҫ�Զ���ִ�еĴ���');
		chrome.storage.local.set({nbsdk_vip: 0});
		
		
		
		return false;
	}


	if (request.action === "NbSdk_paySuccess") {//֧���ɹ�����Ҫ�Զ���ִ�еĴ���
		console.log('֧���ɹ�����Ҫ�Զ���ִ�еĴ���');
		chrome.storage.local.set({nbsdk_vip: 1});
		
		
		
		
		return false;
	}
	
	
	if (request.action === "NbSdk_vipSuccess") {//�����ڶ����ڣ���Ҫ�Զ���ִ�еĴ���
		console.log('�����ڶ����ڣ���Ҫ�Զ���ִ�еĴ���');
		chrome.storage.local.set({nbsdk_vip: 1});
		
		
		
		
		return false;
	}
	
	if (request.action == 'openPopup') {
		chrome.tabs.create({'url': chrome.runtime.getURL("popup.html?web=1")});
		return false;
	}
});