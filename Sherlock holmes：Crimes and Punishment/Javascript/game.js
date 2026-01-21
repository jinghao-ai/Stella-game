// ==================== 游戏初始化 ====================
function initGame() {
    console.log('初始化游戏主系统...');
    
    // 设置初始场景
    showScene("office");
    
    // 显示初始对话
    showCurrentDialogue();
    
    // 绑定全局点击事件
    document.addEventListener('click', function(e) {
        // 排除特定元素的点击
        if (e.target.closest('.control-buttons') || 
            e.target.closest('.control-panel') ||
            e.target.closest('.evidence-item') ||
            e.target.closest('.deduction-option') ||
            e.target.closest('.door-detection-content') ||
            e.target.closest('#experiment-scene')) {
            return;
        }
        
        // 推进对话
        advanceDialogue();
    });
}

// ==================== 化学实验功能 ====================
function initChemicalExperiment() {
    console.log('初始化化学实验系统');
    
    // 保留原始的showScene调用
    showScene("experiment");
    
    // 使用完整的实验系统
    initExperiment();
}

// ==================== 门锁检测功能 ====================
function initDoorDetection() {
    console.log('初始化门锁检测系统');
    changeScene("door");
    
    // 获取所有元素
    const doorContainer = document.getElementById('doorContainer');
    const doorPanel = document.getElementById('doorPanel');
    const doorHandle = document.getElementById('doorHandle');
    const resultsPanel = document.getElementById('resultsPanel');
    const enterZone = document.getElementById('enterZone');
    const roomView = document.getElementById('roomView');
    const hint = document.getElementById('hint');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const doorOpenBtn = document.getElementById('doorOpenBtn');
    const doorEnterBtn = document.getElementById('doorEnterBtn');
    
    // ...（门锁检测的详细代码）
}

// ==================== 控制面板系统 ====================
function initControlPanels() {
    console.log('初始化控制面板系统...');

    // 获取所有按钮和面板
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    const musicPanel = document.getElementById('music-panel');
    const musicPanelClose = document.getElementById('music-panel-close');

    const saveToggleBtn = document.getElementById('save-toggle-btn');
    const savePanel = document.getElementById('save-panel');
    const savePanelClose = document.getElementById('save-panel-close');

    const mapToggleBtn = document.getElementById('map-toggle-btn');
    const mapPanel = document.getElementById('map-detail-modal');
    const mapPanelClose = document.getElementById('map-detail-close');
    const exploreMapBtn = document.getElementById('explore-map');

    const bookToggleBtn = document.getElementById('book-toggle-btn');
    const bookPanel = document.getElementById('book-panel');
    const bookPanelClose = document.getElementById('book-panel-close');
    const bookExitBtn = document.getElementById('book-exit-btn');

    // ...（控制面板的详细代码）
}

// ==================== 关闭所有面板 ====================
function closeAllPanels() {
    const panels = [
        document.getElementById('music-panel'),
        document.getElementById('save-panel'),
        document.getElementById('map-detail-modal'),
        document.getElementById('book-panel')
    ];

    panels.forEach(panel => {
        if (panel) {
            panel.classList.remove('active');
        }
    });
}

// ==================== 页面加载完成后初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化...');
    
    // 初始化游戏
    initGame();
    
    // 初始化控制面板
    initControlPanels();
    
    // 初始化音乐系统
    if (typeof initMusicSystem === 'function') {
        initMusicSystem();
    }
    
    // 初始化存档系统
    window.gameSaveSystem = new GameSaveSystem();
    
    console.log('所有系统初始化完成！');
});
