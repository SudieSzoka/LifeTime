let settings = {
    dailyEarnings: 1000,
    workStartTime: '08:00',
    workEndTime: '17:00',
    retirementYear: new Date().getFullYear() + 30 // 默认设置为30年后
};

// 加载设置
function loadSettings() {
    if (chrome && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get('settings', (data) => {
            if (data.settings) {
                settings = data.settings;
            }
            updateUI();
        });
    } else {
        console.warn('Chrome storage API not available. Using default settings.');
        updateUI();
    }
}

// 保存设置
function saveSettings() {
    settings.dailyEarnings = parseFloat(document.getElementById('dailyEarnings').value);
    settings.workStartTime = document.getElementById('workStartTime').value;
    settings.workEndTime = document.getElementById('workEndTime').value;
    settings.retirementYear = parseInt(document.getElementById('retirementYear').value);

    if (chrome && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({settings: settings}, () => {
            document.getElementById('settingsPanel').classList.add('hidden');
            updateUI();
        });
    } else {
        console.warn('Chrome storage API not available. Settings will not be saved.');
        document.getElementById('settingsPanel').classList.add('hidden');
        updateUI();
    }
}

// 设置背景图片
function setRandomBackground() {
    const imageUrl = `https://source.unsplash.com/random/1920x1080/?nature,landscape`;
    fetch(imageUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch image');
            }
            return response.url;
        })
        .then(url => {
            const img = new Image();
            img.onload = function() {
                document.body.style.backgroundImage = `url('${url}')`;
            };
            img.onerror = function() {
                throw new Error('Failed to load image');
            };
            img.src = url;
        })
        .catch(error => {
            console.error('Error setting background image:', error);
            // 使用备用图片 URL 或设置背景颜色
            document.body.style.backgroundImage = `url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&h=1080')`;
            // 或者使用纯色背景
            // document.body.style.backgroundColor = '#34495e';
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

    const progress = {
        day: ((24 - timeLeft.day) / 24) * 100,
        week: ((7 - timeLeft.week) / 7) * 100,
        month: ((new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - timeLeft.month) / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()) * 100,
        year: ((365 - Math.ceil(timeLeft.year / (1000 * 60 * 60 * 24))) / 365) * 100
    };

    countdownElement.innerHTML = `
        <p>今天还剩${timeLeft.day}小时</p>
        <div class="progress-bar"><div class="progress progress-day" style="width: ${progress.day}%"></div></div>
        <p>本周还剩${timeLeft.week}天</p>
        <div class="progress-bar"><div class="progress progress-week" style="width: ${progress.week}%"></div></div>
        <p>本月还剩${timeLeft.month}天</p>
        <div class="progress-bar"><div class="progress progress-month" style="width: ${progress.month}%"></div></div>
        <p>今年还剩${Math.ceil(timeLeft.year / (1000 * 60 * 60 * 24))}天</p>
        <div class="progress-bar"><div class="progress progress-year" style="width: ${progress.year}%"></div></div>
        <p>距离退休还有${timeLeft.retirement}年</p>
    `;
}

// 计算并显示今日收入
function updateEarnings() {
    const now = new Date();
    const day = now.getDay();
    const earningsElement = document.getElementById('earnings');

    if (day === 0 || day === 6) {
        earningsElement.textContent = "今天不上班，好好休息";
        return;
    }

    const [startHour, startMinute] = settings.workStartTime.split(':').map(Number);
    const [endHour, endMinute] = settings.workEndTime.split(':').map(Number);
    const startTime = new Date(now.setHours(startHour, startMinute, 0, 0));
    const endTime = new Date(now.setHours(endHour, endMinute, 0, 0));
    
    if (now < startTime || now > endTime) {
        earningsElement.textContent = "非工作时间";
        return;
    }

    const workHours = (now - startTime) / (1000 * 60 * 60);
    const totalWorkHours = (endTime - startTime) / (1000 * 60 * 60);
    const todayEarnings = (settings.dailyEarnings / totalWorkHours) * workHours;

    earningsElement.textContent = `今日已赚: ¥${todayEarnings.toFixed(2)}`;
}

// 更新UI
function updateUI() {
    updateCountdown();
    updateEarnings();
}

// 初始化和定时更新
function init() {
    setRandomBackground();
    loadSettings();
    setInterval(updateUI, 60000); // 每分钟更新一次UI

    document.getElementById('settingsBtn').addEventListener('click', () => {
        document.getElementById('settingsPanel').classList.toggle('hidden');
    });

    document.getElementById('saveSettings').addEventListener('click', saveSettings);

    // 填充设置面板的初始值
    document.getElementById('dailyEarnings').value = settings.dailyEarnings;
    document.getElementById('workStartTime').value = settings.workStartTime;
    document.getElementById('workEndTime').value = settings.workEndTime;
    document.getElementById('retirementYear').value = settings.retirementYear;
}

// 确保在 DOMContentLoaded 事件后执行初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
