let settings = {
    dailyEarnings: 1000,
    workStartTime: '08:00',
    workEndTime: '17:00',
    retirementYear: new Date().getFullYear() + 30, // 默认设置为30年后退休
    careerStartYear: new Date().getFullYear() - 5, // 新增：默认设置为5年前开始工作
    backgroundImage: null,
    currencyType: 'CNY' // 添加默认货币类型
};
let currentQuote = ''; // 添加这行

// 加载设置
function loadSettings() {
    if (chrome && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get('settings', (data) => {
            if (data.settings) {
                settings = data.settings;
            } else {
                console.warn('No settings found in Chrome storage. Using default settings.');
            }
            applySettings();
        });
    } else {
        console.warn('Chrome storage API not available. Using localStorage.');
        loadFromLocalStorage();
    }
}

// 新增 loadFromLocalStorage 函数
function loadFromLocalStorage() {
    const storedSettings = localStorage.getItem('settings');
    if (storedSettings) {
        settings = JSON.parse(storedSettings);
    }
    applySettings();
}

// 新增 applySettings 函数
function applySettings() {
    if (settings.backgroundImage) {
        document.body.style.backgroundImage = `url('${settings.backgroundImage}')`;
    }
    updateUI();
    // 强制立即更新倒计时和进度条
    updateCountdown();
}

// 保存设置
function saveSettings() {
    settings.dailyEarnings = parseFloat(document.getElementById('dailyEarnings').value);
    settings.workStartTime = document.getElementById('workStartTime').value;
    settings.workEndTime = document.getElementById('workEndTime').value;
    settings.retirementYear = parseInt(document.getElementById('retirementYear').value);
    settings.careerStartYear = parseInt(document.getElementById('careerStartYear').value); // 新增
    settings.currencyType = document.getElementById('currencyType').value; // 添加这行

    const backgroundImageInput = document.getElementById('backgroundImage');
    const file = backgroundImageInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            settings.backgroundImage = e.target.result;
            saveSettingsToStorage();
        };
        reader.readAsDataURL(file);
    } else {
        saveSettingsToStorage();
    }
}

// 修改 saveSettingsToStorage 函数
function saveSettingsToStorage() {
    if (chrome && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({settings: settings}, () => {
            onSettingsSaved();
        });
    } else {
        console.warn('Chrome storage API not available. Using localStorage.');
        localStorage.setItem('settings', JSON.stringify(settings));
        onSettingsSaved();
    }
}

// 新增 onSettingsSaved 函数
function onSettingsSaved() {
    document.getElementById('settingsPanel').classList.add('hidden');
    applySettings(); // 使用 applySettings 替代 updateUI
}

// 设置背景图片
let lastBackgroundUrl = '';

function setRandomBackground() {
    if (settings.backgroundImage) {
        document.body.style.backgroundImage = `url('${settings.backgroundImage}')`;
        return;
    }

    const cachedBackgroundUrl = localStorage.getItem('lastBackgroundUrl');
    if (cachedBackgroundUrl) {
        document.body.style.backgroundImage = `url('${cachedBackgroundUrl}')`;
    } else {
        // 从本地图片文件夹随机选择一张图片
        const localImages = ['image1.png']; // 替换为实际的图片文件名
        const randomLocalImage = localImages[Math.floor(Math.random() * localImages.length)];
        document.body.style.backgroundImage = `url('images/bgs/${randomLocalImage}')`;
    }

    // 尝试获取新的背景图片
    fetchNewBackgroundImage();
}

function fetchNewBackgroundImage() {
    const imageUrl = `https://picsum.photos/1920/1080?random=${Date.now()}`;

    fetch(imageUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.url;
        })
        .then(url => {
            const img = new Image();
            img.onload = function() {
                document.body.style.transition = 'background-image 0.5s ease-in-out';
                document.body.style.backgroundImage = `url('${url}')`;
                localStorage.setItem('lastBackgroundUrl', url); // 缓存新的背景图片URL
            };
            img.onerror = function() {
                console.warn('Failed to load image from web. Using local background.');
            };
            img.src = url;
        })
        .catch(error => {
            console.warn('Error fetching new background image:', error.message);
            // 保持当前背景图片，不进行更改
        });
}

// 计算并显示倒计时和进度条
function updateCountdown() {
    const now = new Date();
    const countdownElement = document.getElementById('countdown');
    
    const timeLeft = {
        day: 24 - now.getHours(),
        week: 7 - now.getDay(),
        month: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate(),
        year: new Date(now.getFullYear() + 1, 0, 1).getTime() - now.getTime(),
        retirement: settings.retirementYear - now.getFullYear()
    };

    const totalCareerYears = settings.retirementYear - settings.careerStartYear;
    const yearsWorked = now.getFullYear() - settings.careerStartYear;
    const yearsLeft = settings.retirementYear - now.getFullYear();

    const progress = {
        day: ((24 - timeLeft.day) / 24) * 100,
        week: ((7 - timeLeft.week) / 7) * 100,
        month: ((new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - timeLeft.month) / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()) * 100,
        year: ((365 - Math.ceil(timeLeft.year / (1000 * 60 * 60 * 24))) / 365) * 100,
        retirement: ((yearsWorked / totalCareerYears) * 100).toFixed(2)
    };

    countdownElement.innerHTML = `
        <p>今天还剩 ${timeLeft.day} 小时</p>
        <div class="progress-bar"><div class="progress progress-day" style="width: ${progress.day}%"></div></div>
        <p>本周还剩 ${timeLeft.week} 天</p>
        <div class="progress-bar"><div class="progress progress-week" style="width: ${progress.week}%"></div></div>
        <p>本月还剩 ${timeLeft.month} 天</p>
        <div class="progress-bar"><div class="progress progress-month" style="width: ${progress.month}%"></div></div>
        <p>今年还剩 ${Math.ceil(timeLeft.year / (1000 * 60 * 60 * 24))} 天</p>
        <div class="progress-bar"><div class="progress progress-year" style="width: ${progress.year}%"></div></div>
        <p>还有 ${yearsLeft} 年退休</p>
        <div class="progress-bar"><div class="progress progress-retirement" style="width: ${progress.retirement}%"></div></div>
    `;
}

// 添加一个随机名言数组
const quotes = [
    "生活不是等待暴风雨过去，而是学会在雨中跳舞。",
    "成功不是最终的，失败也不是致命的，重要的是继续前进的勇气。",
    "每一个不曾起舞的日子，都是对生命的辜负。",
    "人生就像一杯茶，不会苦一辈子，但总会苦一阵子。",
    "不要等待机会，而要创造机会。"
];

// 获取随机名言的函数
function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

// 修改 updateEarnings 函数
function updateEarnings() {
    const now = new Date();
    const day = now.getDay();
    const earningsElement = document.getElementById('earnings');

    const [startHour, startMinute] = settings.workStartTime.split(':').map(Number);
    const [endHour, endMinute] = settings.workEndTime.split(':').map(Number);
    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute, 0, 0);
    const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute, 0, 0);
    
    console.log('Current time:', now);
    console.log('Start time:', startTime);
    console.log('End time:', endTime);
    console.log('Day:', day);

    if (day === 0 || day === 6 || now < startTime || now > endTime) {
        console.log('Not work time');
        if (!currentQuote) {
            currentQuote = getRandomQuote();
        }
        earningsElement.innerHTML = currentQuote;
        return;
    }

    console.log('Calculating earnings');
    // 重置 currentQuote，以便在下一个非工作时间重新获取新的名言
    currentQuote = '';

    const totalWorkMs = endTime - startTime;
    const workedMs = now - startTime;
    const progress = workedMs / totalWorkMs;
    const todayEarnings = settings.dailyEarnings * progress;

    const currencySymbols = {
        'CNY': '¥',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥'
    };

    const currencySymbol = currencySymbols[settings.currencyType] || '¥';

    earningsElement.innerHTML = `今日已赚: ${currencySymbol}${todayEarnings.toFixed(2)}`;
}

// 删除 animateEarnings 函数，因为我们不再需要它了

// 修改 updateUI 函数，使其每秒更新一次
function updateUI() {
    updateCountdown();
    updateEarnings();
}

// 初始化和定时更新
function init() {
    console.log('Initializing...');
    setRandomBackground();
    loadSettings();
    setInterval(() => {
        console.log('Updating UI...');
        updateUI();
    }, 100); // 每秒更新一次UI

    document.getElementById('settingsBtn').addEventListener('click', showSettings);

    document.getElementById('saveSettings').addEventListener('click', () => {
        saveSettings();
        hideSettings();
    });

    document.getElementById('closeSettings').addEventListener('click', hideSettings);

    // 填充设置面板的初始值
    document.getElementById('dailyEarnings').value = settings.dailyEarnings;
    document.getElementById('workStartTime').value = settings.workStartTime;
    document.getElementById('workEndTime').value = settings.workEndTime;
    document.getElementById('retirementYear').value = settings.retirementYear;
    document.getElementById('careerStartYear').value = settings.careerStartYear; // 新增
    document.getElementById('currencyType').value = settings.currencyType; // 添加这行

    document.getElementById('backgroundImage').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.body.style.backgroundImage = `url('${e.target.result}')`;
            };
            reader.readAsDataURL(file);
        }
    });

    // 添加登录按钮事件监听器
    document.getElementById('loginButton').addEventListener('click', function() {
        window.location.href = chrome.runtime.getURL("/nbsdk/login/login.html?ori=" + window.location.pathname);
    });

    // 添加支付按钮事件监听器
    document.getElementById('payButton').addEventListener('click', function() {
        chrome.windows.create({
            url: chrome.runtime.getURL("/nbsdk/payment/payment.html"),
            type: "popup",
            width: Math.round(window.screen.width / 2),
            height: Math.round(window.screen.height / 1.8),
            left: Math.round(window.screen.width / 4),
            top: Math.round(window.screen.height / 4)
        });
    });

    // 检查用户登录状态
    chrome.storage.local.get('userInfo', function(result) {
        if (result.userInfo) {
            document.getElementById('loginButton').style.display = 'none';
        } else {
            document.getElementById('payButton').style.display = 'none';
        }
    });
}

// 确保在 DOMContentLoaded 事件后执行初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function showSettings() {
    document.getElementById('settingsPanel').classList.remove('hidden');
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    document.body.appendChild(overlay);
}

function hideSettings() {
    document.getElementById('settingsPanel').classList.add('hidden');
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.remove();
    }
}
