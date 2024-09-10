let settings = {
    dailyEarnings: 1000,
    workStartTime: '08:00',
    workEndTime: '17:00',
    retirementYear: new Date().getFullYear() + 30, // 默认设置为30年后退休
    careerStartYear: new Date().getFullYear() - 5, // 新增：默认设置为5年前开始工作
    backgroundImage: null
};
let currentQuote = ''; // 添加这行

// 加载设置
function loadSettings() {
    if (chrome && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get('settings', (data) => {
            if (data.settings) {
                settings = data.settings;
                applySettings();
            } else {
                loadFromLocalStorage();
            }
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

function setRandomBackground(retryCount = 0) {
    if (settings.backgroundImage) {
        document.body.style.backgroundImage = `url('${settings.backgroundImage}')`;
        return;
    }

    const imageUrl = `https://source.unsplash.com/random/1920x1080/?nature,landscape&t=${Date.now()}`;
    const defaultImageUrl = 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&h=1080';
    
    document.body.style.backgroundImage = `url('${defaultImageUrl}')`;

    fetch(imageUrl)
        .then(response => {
            console.log('Fetch response:', response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.url;
        })
        .then(url => {
            console.log('Image URL:', url);
            const img = new Image();
            img.onload = function() {
                console.log('Image loaded successfully');
                document.body.style.transition = 'background-image 0.5s ease-in-out';
                document.body.style.backgroundImage = `url('${url}')`;
                lastBackgroundUrl = url;
            };
            img.onerror = function(e) {
                console.error('Image load error:', e);
                throw new Error('Failed to load image');
            };
            img.src = url;
        })
        .catch(error => {
            console.error('Error setting background image:', error);
            if (retryCount < 3) {
                console.log(`Retrying... Attempt ${retryCount + 1}`);
                setTimeout(() => setRandomBackground(retryCount + 1), 1000);
            } else {
                console.warn('Max retry attempts reached. Using default background.');
            }
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
    
    if (day === 0 || day === 6 || now < startTime || now > endTime) {
        if (!currentQuote) {
            currentQuote = getRandomQuote();
        }
        earningsElement.innerHTML = currentQuote;
        return;
    }

    // 重置 currentQuote，以便在下一个非工作时间重新获取新的名言
    currentQuote = '';

    const totalWorkMs = endTime - startTime;
    const workedMs = now - startTime;
    const progress = workedMs / totalWorkMs;
    const todayEarnings = settings.dailyEarnings * progress;

    earningsElement.innerHTML = `今日已赚: ¥${todayEarnings.toFixed(2)}`;
}

// 删除 animateEarnings 函数，因为我们不再需要它了

// 修改 updateUI 函数，使其每秒更新一次
function updateUI() {
    updateCountdown();
    updateEarnings();
}

// 初始化和定时更新
function init() {
    setRandomBackground();
    loadSettings();
    setInterval(updateUI, 100); // 每秒更新一次UI

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
