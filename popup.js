document.getElementById("loginButton").addEventListener("click", function() {
    console.log("Login button clicked");
    // 在这里调用nbsdk.js中的登录逻辑
});



document.addEventListener('DOMContentLoaded', function() {
    const payButton = document.getElementById('payButton');
    
    payButton.addEventListener('click', function() {
        chrome.runtime.sendMessage({action: "openPopup"});
        window.close(); // 关闭当前的popup窗口
    });
});