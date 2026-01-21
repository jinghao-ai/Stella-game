function advanceDialogue() {
    const currentDialogue = window.storyScript[window.currentDialogueIndex];
    
    // 首先检查是否有特殊动作需要处理
    if (currentDialogue) {
        // 检查是否是自由搏击游戏
        if (currentDialogue.action === "startFightingGame") {
            startFightingMinigame();
            return;
        }
        
        // 检查是否是对峙游戏
        if (currentDialogue.action === "startConfrontation") {
            startConfrontationMinigame();
            return;
        }
        
        // 处理其他场景切换动作
        if (currentDialogue.action === "switchToStairs") {
            showScene("stairs");
            window.currentScene = "stairs";
        } else if (currentDialogue.action === "switchToBloodScene") {
            showScene("blood-scene");
            window.currentScene = "blood-scene";
        } else if (currentDialogue.action === "switchToExhibitionScene") {
            showScene("exhibition-scene");
            window.currentScene = "exhibition-scene";
        } else if (currentDialogue.action === "switchToDeskScene") {
            showScene("desk-scene");
            window.currentScene = "desk-scene";
        } else if (currentDialogue.action === "switchToExperimentScene") {
            showScene("experiment-scene");
            window.currentScene = "experiment-scene";
        } else if (currentDialogue.action === "switchToPoliceStation") {
            showScene("police-station");
            window.currentScene = "police-station";
        } else if (currentDialogue.action === "switchToPoliceCollection1") {
            showScene("police-collection1-scene");
            window.currentScene = "police-collection1-scene";
        } else if (currentDialogue.action === "switchToPoliceCollection2") {
            showScene("police-collection2-scene");
            window.currentScene = "police-collection2-scene";
        } else if (currentDialogue.action === "switchToBedroom") {
            showScene("bedroom-scene");
            window.currentScene = "bedroom-scene";
        } else if (currentDialogue.action === "switchToDebateScene") {
            showScene("debate-scene");
            window.currentScene = "debate-scene";
        } else if (currentDialogue.action === "switchToCrimeScene") {
            showScene("crime-scene");
            window.currentScene = "crime-scene";
        } else if (currentDialogue.action === "switchToBarScene") {
            showScene("bar-scene");
            window.currentScene = "bar-scene";
        } else if (currentDialogue.action === "switchToOfficeAfterBar") {
            showScene("office2");
            window.currentScene = "office2";
        } else if (currentDialogue.action === "switchToInvestigation") {
            showScene("investigation-scene");
            window.currentScene = "investigation-scene";
        }
    }
    
    // 只有在没有特殊游戏动作的情况下才推进对话索引
    if (currentDialogue && 
        currentDialogue.action !== "startFightingGame" && 
        currentDialogue.action !== "startConfrontation") {
        window.currentDialogueIndex++;
    }
    
    // 检查特殊场景
    if (window.currentDialogueIndex === window.storyScript.findIndex(d => d.scene === "door")) {
        initDoorDetection();
        return;
    }
    
    if (window.currentDialogueIndex === window.storyScript.findIndex(d => d.scene === "experiment")) {
        initChemicalExperiment();
        return;
    }
    
    if (window.currentDialogueIndex < window.storyScript.length) {
        showCurrentDialogue();
    }
}

// ==================== 在血迹场景返回按钮
document.getElementById('return-from-blood')?.addEventListener('click', function() {
    // 切换到展品架场景
    showScene('exhibition-scene');
    window.currentScene = 'exhibition-scene';
});

// =在展品架场景返回按钮  
document.getElementById('return-from-exhibition')?.addEventListener('click', function() {
    // 切换到木桌场景
    showScene('desk-scene');
    window.currentScene = 'desk-scene';
});

// =在木桌场景返回按钮（全屏返回/重置酒杯按钮）
document.getElementById('resetBtn')?.addEventListener('click', function() {
    // 切换到办公室2场景
    showScene('office2');
    window.currentScene = 'office2';
    // 需要确保对话索引正确
    window.currentDialogueIndex = window.storyScript.findIndex(d => d.scene === "office2");
    showCurrentDialogue();
});

// ==================== 对峙小游戏初始化 ====================
function initConfrontationGame() {
    const pushBtn = document.getElementById('confrontation-push-btn');
    const defendBtn = document.getElementById('confrontation-defend-btn');
    const idleBtn = document.getElementById('confrontation-idle-btn');
    const expressionHint = document.getElementById('confrontation-hint');
    const staminaInner = document.querySelector('#confrontation-scene .stamina-inner');
    const staminaCircle = document.querySelector('#confrontation-scene .stamina-circle');
    const returnBarBtn = document.getElementById('confrontation-return-btn');
    
    // AI策略相关元素
    const aiPushCount = document.getElementById('ai-push-count');
    const aiDefendCount = document.getElementById('ai-defend-count');
    const aiIdleCount = document.getElementById('ai-idle-count');
    const aiPattern = document.getElementById('ai-pattern');
    
    let stamina = 70;
    let patrickAction = '';
    let gameInterval;
    let gameEnded = false;
    
    // AI学习系统
    let playerHistory = [];
    const maxHistorySize = 10;
    let aiStrategy = {
        push: 0.33,    // 初始概率
        defend: 0.33,
        idle: 0.34,
        pattern: '随机'
    };
    
    // 玩家行为统计
    let playerStats = {
        push: 0,
        defend: 0,
        idle: 0
    };

    // 初始化游戏
    function init() {
        startGameLoop();
        
        // 按钮事件
        pushBtn.addEventListener('mousedown', function() {
            if (!gameEnded) handlePlayerAction('push');
        });
        
        defendBtn.addEventListener('mousedown', function() {
            if (!gameEnded) handlePlayerAction('defend');
        });
        
        idleBtn.addEventListener('mousedown', function() {
            if (!gameEnded) handlePlayerAction('idle');
        });
        
        // 返回酒吧按钮事件
        returnBarBtn.addEventListener('click', function() {
            switchScene('bar-scene');
            gameEnded = true;
            clearInterval(gameInterval);
        });
        
        // 键盘事件
        document.addEventListener('keydown', function(e) {
            if (gameEnded) return;
            
            if (e.key === 'a' || e.key === 'A') {
                handlePlayerAction('push');
            } else if (e.key === 'd' || e.key === 'D') {
                handlePlayerAction('defend');
            } else if (e.code === 'Space') {
                e.preventDefault();
                handlePlayerAction('idle');
            } else if (e.key === 'Escape') {
                switchScene('bar-scene');
                gameEnded = true;
                clearInterval(gameInterval);
            }
        });
    }
    
    // 开始游戏循环
    function startGameLoop() {
        gameInterval = setInterval(function() {
            if (gameEnded) return;
            
            // 根据AI策略生成帕特里克的动作
            patrickAction = generatePatrickAction();
            
            // 显示动作提示
            expressionHint.textContent = `帕特里克准备：${getActionText(patrickAction)}`;
            expressionHint.classList.add('show');
            
            setTimeout(function() {
                expressionHint.classList.remove('show');
            }, 2000);
            
        }, 3000);
    }
    
    // 根据AI策略生成帕特里克的行动
    function generatePatrickAction() {
        const rand = Math.random();
        let action;
        
        if (rand < aiStrategy.push) {
            action = 'push';
        } else if (rand < aiStrategy.push + aiStrategy.defend) {
            action = 'defend';
        } else {
            action = 'idle';
        }
        
        return action;
    }
    
    // 更新AI策略
    function updateAIStrategy(playerAction) {
        // 记录玩家行为
        playerHistory.push(playerAction);
        playerStats[playerAction]++;
        
        // 限制历史记录大小
        if (playerHistory.length > maxHistorySize) {
            const removedAction = playerHistory.shift();
            playerStats[removedAction]--;
        }
        
        // 分析玩家模式
        analyzePlayerPattern();
        
        // 根据玩家模式调整AI策略
        adjustAIStrategy();
        
        // 更新UI显示
        updateAIInfo();
    }
    
    // 分析玩家行为模式
    function analyzePlayerPattern() {
        const total = playerHistory.length;
        if (total === 0) return;
        
        const pushRatio = playerStats.push / total;
        const defendRatio = playerStats.defend / total;
        const idleRatio = playerStats.idle / total;
        
        // 判断玩家模式
        if (pushRatio > 0.6) {
            aiStrategy.pattern = '进攻型';
        } else if (defendRatio > 0.6) {
            aiStrategy.pattern = '防御型';
        } else if (idleRatio > 0.6) {
            aiStrategy.pattern = '保守型';
        } else if (Math.abs(pushRatio - defendRatio) < 0.2) {
            aiStrategy.pattern = '平衡型';
        } else {
            aiStrategy.pattern = '随机';
        }
    }
    
    // 调整AI策略
    function adjustAIStrategy() {
        const total = playerHistory.length;
        if (total < 3) return; // 需要足够的数据
        
        const pushRatio = playerStats.push / total;
        const defendRatio = playerStats.defend / total;
        const idleRatio = playerStats.idle / total;
        
        // 根据玩家模式调整概率
        if (aiStrategy.pattern === '进攻型') {
            // 对抗进攻型玩家：增加防御概率
            aiStrategy.defend = Math.min(0.6, pushRatio + 0.2);
            aiStrategy.push = (1 - aiStrategy.defend) * 0.4;
            aiStrategy.idle = (1 - aiStrategy.defend) * 0.6;
        } else if (aiStrategy.pattern === '防御型') {
            // 对抗防御型玩家：增加空闲概率（诱导其进攻）
            aiStrategy.idle = Math.min(0.5, defendRatio + 0.2);
            aiStrategy.push = (1 - aiStrategy.idle) * 0.6;
            aiStrategy.defend = (1 - aiStrategy.idle) * 0.4;
        } else if (aiStrategy.pattern === '保守型') {
            // 对抗保守型玩家：增加进攻概率
            aiStrategy.push = Math.min(0.6, idleRatio + 0.3);
            aiStrategy.defend = (1 - aiStrategy.push) * 0.3;
            aiStrategy.idle = (1 - aiStrategy.push) * 0.7;
        } else {
            // 平衡或随机模式：保持相对平衡
            aiStrategy.push = 0.33;
            aiStrategy.defend = 0.33;
            aiStrategy.idle = 0.34;
        }
        
        // 确保概率和为1
        const sum = aiStrategy.push + aiStrategy.defend + aiStrategy.idle;
        aiStrategy.push /= sum;
        aiStrategy.defend /= sum;
        aiStrategy.idle /= sum;
    }
    
    // 更新AI信息显示
    function updateAIInfo() {
        aiPushCount.textContent = `推: ${playerStats.push}次`;
        aiDefendCount.textContent = `挡: ${playerStats.defend}次`;
        aiIdleCount.textContent = `空闲: ${playerStats.idle}次`;
        aiPattern.textContent = `当前模式: ${aiStrategy.pattern}`;
    }
    
    // 处理玩家动作
    function handlePlayerAction(playerAction) {
        // 更新AI策略
        updateAIStrategy(playerAction);
        
        // 根据玩家动作和帕特里克动作判断结果
        let staminaChange = 0;
        let message = '';
        
        if (patrickAction === 'push') {
            if (playerAction === 'defend') {
                // 正确防御
                staminaChange = 5;
                message = '成功防御！';
            } else if (playerAction === 'push') {
                // 力量对抗
                staminaChange = -15;
                message = '力量对抗，消耗大量耐力！';
            } else {
                // 空闲时被推
                staminaChange = -20;
                message = '被推中，受到较大伤害！';
            }
        } else if (patrickAction === 'defend') {
            if (playerAction === 'push') {
                // 正确攻击
                staminaChange = 5;
                message = '成功突破防御！';
            } else if (playerAction === 'defend') {
                // 双方防御
                staminaChange = -5;
                message = '双方防御，轻微消耗耐力';
            } else {
                // 空闲对防御
                staminaChange = 5;
                message = '休息恢复耐力';
            }
        } else { // patrickAction === 'idle'
            if (playerAction === 'idle') {
                // 双方休息
                staminaChange = 10;
                message = '双方休息，恢复耐力';
            } else {
                // 攻击空闲的对手
                staminaChange = -10;
                message = '攻击落空，消耗耐力';
            }
        }
        
        // 更新耐力
        updateStamina(staminaChange);
        
        // 显示结果消息
        showMessage(message);
    }
    
    // 更新耐力
    function updateStamina(change) {
        stamina += change;
        
        // 限制耐力在0-100之间
        stamina = Math.max(0, Math.min(100, stamina));
        
        // 更新UI
        staminaInner.textContent = `${stamina}%`;
        
        // 更新圆形耐力条
        const percentage = stamina;
        if (percentage > 70) {
            staminaCircle.style.background = `conic-gradient(#4caf50 0%, #4caf50 ${percentage}%, #f44336 ${percentage}%, #f44336 100%)`;
        } else if (percentage > 30) {
            staminaCircle.style.background = `conic-gradient(#ff9800 0%, #ff9800 ${percentage}%, #f44336 ${percentage}%, #f44336 100%)`;
        } else {
            staminaCircle.style.background = `conic-gradient(#f44336 0%, #f44336 ${percentage}%, #f44336 ${percentage}%, #f44336 100%)`;
        }
        
        // 检查游戏结束条件
        if (stamina <= 0) {
            endGame(false);
        } else if (stamina >= 100) {
            endGame(true);
        }
    }
    
    // 显示消息
    function showMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.position = 'absolute';
        messageEl.style.top = '50%';
        messageEl.style.left = '50%';
        messageEl.style.transform = 'translate(-50%, -50%)';
        messageEl.style.backgroundColor = 'rgba(30, 20, 10, 0.8)';
        messageEl.style.color = '#ffb74d';
        messageEl.style.padding = '10px 20px';
        messageEl.style.borderRadius = '5px';
        messageEl.style.border = '1px solid #5d4037';
        messageEl.style.zIndex = '10';
        messageEl.style.fontSize = '18px';
        
        document.getElementById('confrontation-game-container').appendChild(messageEl);
        
        setTimeout(function() {
            messageEl.remove();
        }, 1500);
    }
    
    // 结束游戏
    function endGame(isWin) {
        clearInterval(gameInterval);
        gameEnded = true;
        
        const message = isWin ? '你赢了！耐力已满！' : '你输了！耐力耗尽！';
        showMessage(message);
        
        // 显示返回酒吧按钮
        setTimeout(function() {
            returnBarBtn.style.display = 'block';
        }, 2000);
    }
    
    // 获取动作文本
    function getActionText(action) {
        switch(action) {
            case 'push': return '推';
            case 'defend': return '挡';
            case 'idle': return '空闲';
            default: return '';
        }
    }
    
    // 初始化游戏
    init();
}

// ==================== 完整整合修复（已添加安全修复代码） ====================
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM内容加载完成，开始初始化...');
    
    // 延迟初始化，确保所有元素都已加载
    setTimeout(function() {
        console.log('执行延迟初始化...');
        
        // 确保所有面板初始状态正确
        const panelIds = ['music-panel', 'save-panel', 'map-detail-modal', 'book-panel'];
        panelIds.forEach(id => {
            const panel = document.getElementById(id);
            if (panel) {
                panel.style.display = 'none';
                panel.classList.remove('active');
            }
        });
        
        // 确保控制按钮存在并重置事件
        const buttonIds = [
            'music-toggle-btn', 'save-toggle-btn',
            'map-toggle-btn', 'book-toggle-btn'
        ];
        
        buttonIds.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                // 移除所有现有事件监听器
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
            }
        });
        
        // 重新初始化控制面板系统
        if (typeof initControlPanels === 'function') {
            initControlPanels();
        }
        
        console.log('延迟初始化完成');
    }, 500);
    
    // ==================== 修复2: 确保点击外部关闭面板 ====================
    document.addEventListener('click', function(e) {
        // 检查是否点击在控制按钮或面板内
        const isControlButton = e.target.closest('.control-btn');
        const isPanel = e.target.closest('.control-panel');
        
        if (!isControlButton && !isPanel) {
            // 点击外部，关闭所有面板
            const panels = document.querySelectorAll('.control-panel');
            panels.forEach(panel => {
                panel.classList.remove('active');
                panel.style.display = 'none';
            });
        }
    });
    
    // ==================== 修复3: ESC键关闭所有面板 ====================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const panels = document.querySelectorAll('.control-panel');
            panels.forEach(panel => {
                panel.classList.remove('active');
                panel.style.display = 'none';
            });
        }
    });
    
    // ==================== 修复4: 确保所有场景都能正常显示 ====================
    // 备份原始showScene函数
    const originalShowScene = window.showScene;
    
    // 创建安全的场景切换包装器
    window.showScene = function(sceneName) {
        console.log('切换到场景:', sceneName);
        
        // 关闭所有面板
        const panels = document.querySelectorAll('.control-panel');
        panels.forEach(panel => {
            panel.classList.remove('active');
            panel.style.display = 'none';
        });
        
        // 调用原始函数
        if (originalShowScene && typeof originalShowScene === 'function') {
            return originalShowScene(sceneName);
        }
        
        // 如果原始函数不存在，使用备用方法
        const allScenes = document.querySelectorAll('.scene');
        allScenes.forEach(scene => {
            scene.classList.remove('active');
            scene.style.display = 'none';
        });
        
        const targetScene = document.getElementById(sceneName + '-scene');
        if (targetScene) {
            targetScene.classList.add('active');
            targetScene.style.display = 'block';
            return true;
        }
        
        return false;
    };
    
    // ==================== 修复5: 确保化学药水显影效果正确 ====================
    // 化学药水显影容器应该在最上层
    const chemicalReveal = document.getElementById('chemical-reveal');
    if (chemicalReveal) {
        chemicalReveal.style.zIndex = '20000';
    }
    
    console.log('安全修复完成，所有现有功能保持完好');
    
    // ==================== 验证所有互动场景功能 ====================
    // 这个函数用来验证所有互动场景的功能是否正常
    function validateAllInteractiveScenes() {
        console.log('验证互动场景功能...');
        
        const interactiveScenes = [
            {
                id: 'door-scene',
                name: '门锁检测场景',
                validate: function() {
                    return document.getElementById('door-scene') && 
                           typeof initDoorDetection === 'function';
                }
            },
            {
                id: 'blood-scene',
                name: '血迹场景',
                validate: function() {
                    return document.getElementById('blood-scene') && 
                           typeof initBloodScene === 'function';
                }
            },
            {
                id: 'exhibition-scene',
                name: '展品架场景',
                validate: function() {
                    return document.getElementById('exhibition-scene') && 
                           typeof initExhibitionScene === 'function';
                }
            },
            {
                id: 'desk-scene',
                name: '木桌拼图场景',
                validate: function() {
                    return document.getElementById('desk-scene') && 
                           typeof initDeskScene === 'function';
                }
            },
            {
                id: 'police-collection1-scene',
                name: '警察局收集场景1',
                validate: function() {
                    return document.getElementById('police-collection1-scene') && 
                           typeof initPoliceCollection1 === 'function';
                }
            },
            {
                id: 'police-collection2-scene',
                name: '警察局收集场景2',
                validate: function() {
                    return document.getElementById('police-collection2-scene') && 
                           typeof initPoliceCollection2 === 'function';
                }
            },
            {
                id: 'debate-scene',
                name: '辩论赛场景',
                validate: function() {
                    return document.getElementById('debate-scene') && 
                           typeof initDebateScene === 'function';
                }
            },
            {
                id: 'experiment-scene',
                name: '化学实验场景',
                validate: function() {
                    return document.getElementById('experiment-scene') && 
                           typeof initChemicalExperiment === 'function';
                }
            },
            {
                id: 'confrontation-scene',
                name: '对峙小游戏场景',
                validate: function() {
                    return document.getElementById('confrontation-scene') && 
                           typeof initConfrontationGame === 'function';
                }
            },
            {
                id: 'fighting-scene',
                name: '自由搏击场景',
                validate: function() {
                    return document.getElementById('fighting-scene') && 
                           typeof FightingGame === 'function';
                }
            }
        ];
        
        const controlPanels = [
            { id: 'music-panel', name: '音乐控制面板' },
            { id: 'save-panel', name: '存档面板' },
            { id: 'map-detail-modal', name: '地图详情面板' },
            { id: 'book-panel', name: '书展面板' }
        ];
        
        // 验证互动场景
        console.log('=== 互动场景验证结果 ===');
        interactiveScenes.forEach(scene => {
            const isValid = scene.validate();
            console.log(`${scene.name}: ${isValid ? '✓ 正常' : '✗ 异常'}`);
        });
        
        // 验证控制面板
        console.log('=== 控制面板验证结果 ===');
        controlPanels.forEach(panel => {
            const element = document.getElementById(panel.id);
            console.log(`${panel.name}: ${element ? '✓ 存在' : '✗ 缺失'}`);
        });
        
        return true;
    }
    
    // 在页面加载后验证
    setTimeout(validateAllInteractiveScenes, 2000);
    
    // 验证脚本 - 不修改任何功能，只检查状态
    (function() {
        console.log('=== 游戏功能完整性检查 ===');
        
        // 检查1: 所有场景是否存在
        const requiredScenes = [
            'office', 'stairs', 'door', 'study', 'blood', 'exhibition', 'desk',
            'police-station', 'police-collection1', 'police-collection2',
            'bedroom', 'office2', 'interrogation', 'crime', 'bar',
            'debate', 'experiment', 'confrontation', 'fighting'
        ];
        
        const missingScenes = requiredScenes.filter(sceneId => 
            !document.getElementById(sceneId + '-scene')
        );
        
        if (missingScenes.length > 0) {
            console.warn('缺失的场景:', missingScenes);
        } else {
            console.log('✓ 所有场景都存在');
        }
        
        // 检查2: 关键JavaScript函数是否存在
        const requiredFunctions = [
            'showScene', 'advanceDialogue', 'initGame', 'initControlPanels',
            'initMusicSystem', 'initDoorDetection', 'initChemicalExperiment',
            'collectEvidence', 'collectCharacter', 'showMessage'
        ];
        
        const missingFunctions = requiredFunctions.filter(funcName => 
            typeof window[funcName] !== 'function'
        );
        
        if (missingFunctions.length > 0) {
            console.warn('缺失的函数:', missingFunctions);
        } else {
            console.log('✓ 所有关键函数都存在');
        }
        
        // 检查3: 控制按钮和面板
        const requiredElements = [
            'music-toggle-btn', 'save-toggle-btn', 'map-toggle-btn', 'book-toggle-btn',
            'music-panel', 'save-panel', 'map-detail-modal', 'book-panel'
        ];
        
        const missingElements = requiredElements.filter(elementId => 
            !document.getElementById(elementId)
        );
        
        if (missingElements.length > 0) {
            console.warn('缺失的元素:', missingElements);
        } else {
            console.log('✓ 所有控制元素都存在');
        }
        
        console.log('=== 检查完成 ===');
    })();
    // ==================== 安全修复代码结束 ====================
    
    console.log('初始化完整游戏系统...');
    
    // ==================== 1. 角色配置 ====================
    window.leftCharacters = {
        "watson": { name: "华生", color: "#ff6b35", imageUrl: "../STELLA/华生.png" },
        "gong-yanxi": { name: "莱斯特雷德", color: "#9b59b6", imageUrl: "../STELLA/莱斯特雷德.png" },
        "li-meili": { name: "凯瑞太太", color: "#e67e22", imageUrl: "../STELLA/Hudson.png" },
        "wang-jianguo": { name: "王建国", color: "#e74c3c", imageUrl: "../STELLA/王建国.png" },
        "zhang-xiaolong": { name: "约翰·霍普利·奈里根", color: "#f1c40f", imageUrl: "../STELLA/Hatterley.png" },
        "patrick": { name: "帕特里克", color: "#95a5a6", imageUrl: "../STELLA/patrick.png" }
    };

    window.rightCharacters = {
        "detective": { name: "福尔摩斯", color: "#3498db", imageUrl: "../STELLA/福尔摩斯.png" },
        "watson": { name: "华生", color: "#ff6b35", imageUrl: "../STELLA/华生.png" }
    };

      // ==================== 2. 游戏状态变量 ====================
    window.currentDialogueIndex = 0;
    window.currentScene = "office";
    window.isTransitioning = false;
    window.gameCompleted = false;
    window.gameStartTime = Date.now();
    
    // ==================== 3. 门锁检测状态 ====================
    window.doorDetectedAreas = new Set();
    window.doorOpened = false;
    window.doorCompleted = false;

    // ==================== 4. 化学实验状态 ====================
    window.addedSequence = [];
    window.currentMixtureColor = null;
    window.mixtureHeight = 0;
    window.isExperimentComplete = false;
    window.testTubes = [
        { id: 1, color: "#ffd700", name: "黄色试剂A", height: "85%" },
        { id: 2, color: "#ffd700", name: "黄色试剂B", height: "75%" },
        { id: 3, color: "#c0c0c0", name: "无色试剂A", height: "80%" },
        { id: 4, color: "#c0c0c0", name: "无色试剂B", height: "70%" },
        { id: 5, color: "#00008b", name: "深蓝色试剂A", height: "90%" },
        { id: 6, color: "#00008b", name: "深蓝色试剂B", height: "65%" },
        { id: 7, color: "#32cd32", name: "绿色试剂", height: "60%" }
    ];
    window.correctOrder = [5, 7, 6, 1, 3, 2, 4];
    
    // ==================== 5. 书页系统全局变量 ====================
    window.collectedEvidence = []; // 收集的证据数组
    window.encounteredCharacters = []; // 遇到的人物数组（除福尔摩斯和华生外）
    
    // ==================== 6. 道具收集状态 ====================
    window.evidenceDefinitions = {
        // 血迹场景证据
        'blood_journal': {
            id: 'blood_journal',
            name: '日记本',
            description: '在血迹现场发现的日记本，记录了受害者的最后活动。日记本封面为深红色，边缘有磨损痕迹，显示频繁使用。',
            icon: '📓',
            foundTime: '',
            location: '血迹现场',
            importance: '关键证据'
        },
        'blood_knife': {
            id: 'blood_knife',
            name: '折叠刀',
            description: '在血迹现场发现的折叠刀，刀柄为木制，有明显的使用痕迹。刀刃部分有微小缺口，可能用于特定目的。',
            icon: '🔪',
            foundTime: '',
            location: '血迹现场',
            importance: '重要物证'
        },
        
        // 展品架场景证据
        'whale_tooth': {
            id: 'whale_tooth',
            name: '巨头鲸牙齿',
            description: '从虚拟展品架上获得的巨头鲸牙齿模型。牙齿呈浅白色，表面有自然的生长纹理，长约20厘米，呈圆锥形。',
            icon: '🦷',
            foundTime: '',
            location: '虚拟展品架',
            importance: '稀有收藏'
        },
        'harpoon': {
            id: 'harpoon',
            name: '传统捕鲸鱼叉',
            description: '从虚拟展品架上获得的传统捕鲸鱼叉。鱼叉尖端由锻铁制成，带有倒刺设计，柄部有使用痕迹。',
            icon: '🎯',
            foundTime: '',
            location: '虚拟展品架',
            importance: '历史文物'
        },
        
        // 木桌拼图场景证据
        'classic_glass1': {
            id: 'classic_glass1',
            name: '古典杯一号',
            description: '精致的古典杯，由厚实的水晶玻璃制成。杯身低矮，杯口为平口设计，适合盛装威士忌等烈酒。',
            icon: '🥃',
            foundTime: '',
            location: '木桌场景',
            importance: '收藏品'
        },
        'classic_glass2': {
            id: 'classic_glass2',
            name: '古典杯二号',
            description: '另一古典杯，比第一个略小，杯身更加圆润。适合盛装白兰地或波本威士忌，平口设计便于饮用。',
            icon: '🥃',
            foundTime: '',
            location: '木桌场景',
            importance: '收藏品'
        },
        'pirate_puzzle': {
            id: 'pirate_puzzle',
            name: '海盗船拼图',
            description: '从信封中解开的海盗船拼图，拼接后显示一艘18世纪海盗船的轮廓。图案逐渐淡化后显现烟草影子。',
            icon: '🚢',
            foundTime: '',
            location: '木桌场景',
            importance: '解密证据'
        },
        
        // ==================== 警察局收集场景证据 ====================
        'pen': {
            id: 'pen',
            name: '细长钢笔',
            description: '在警察局发现的细长钢笔，笔身有金色装饰环...',
            icon: '🖊️',
            foundTime: '',
            location: '警察局收集室',
            importance: '普通物证'
        },
        'boots': {
            id: 'boots',
            name: '长筒靴子',
            description: '在警察局发现的长筒靴子，蓝色皮革材质...',
            icon: '👢',
            foundTime: '',
            location: '警察局收集室',
            importance: '重要物证'
        },
        'gold_ring': {
            id: 'gold_ring',
            name: '精致金戒指',
            description: '在警察局发现的精致金戒指...',
            icon: '💍',
            foundTime: '',
            location: '警察局收藏室',
            importance: '珍贵物证'
        },
        'silk_handkerchief': {
            id: 'silk_handkerchief',
            name: '丝绸手帕',
            description: '在警察局发现的精致丝绸手帕...',
            icon: '🧣',
            foundTime: '',
            location: '警察局收藏室',
            importance: '普通物证'
        },
        
        // ==================== 自由搏击游戏证据 ====================
        'fighting_victory': {
            id: 'fighting_victory',
            name: '击败酒吧保镖',
            description: '你在酒吧中击败了约翰·霍普利·奈里根，证明了自己的实力，获得了他提供的情报。',
            icon: '🥊',
            location: '老酒馆',
            importance: '关键成就'
        },
        
        // ==================== 对峙小游戏证据 ====================
        'confrontation_victory': {
            id: 'confrontation_victory',
            name: '赢得手腕比试',
            description: '你在酒吧中与帕特里克比试手腕并获胜，证明了自己的力量。',
            icon: '💪',
            location: '老酒馆',
            importance: '次要成就'
        }
    };

    // ==================== 7. 故事脚本（包含自由搏击和对峙游戏触发对话） ====================
    window.storyScript = [
        { scene: "office", speaker: "华生", text: "福尔摩斯先生，莱斯特雷德警长来找您，他说最近有一件案子一定会让你很感兴趣。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "office", speaker: "福尔摩斯", text: "嗯？请让他进来。最近伦敦的犯罪率似乎又上升了。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "office", speaker: "莱斯特雷德", text: "福尔摩斯先生，给您找了个不错的案子。一位名叫彼得·凯瑞的男士——人称'布莱克·彼得'——被杀害了。", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "office", speaker: "福尔摩斯", text: "布莱克·彼得？那个曾经的捕鲸船船长？我记得他退休后在乡间有座庄园。", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "office", speaker: "莱斯特雷德", text: "正是他。他的管家今天早上发现他死在书房里，胸部中了一刀。现场没有明显的闯入痕迹。", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "office", speaker: "福尔摩斯", text: "华生，看来我们有新案子了。莱斯特雷德，带我们去现场。", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "right", nextAction: "switchToStairs" },
 // 场景切换
            { scene: "transition", speaker: "", text: "前往案发现场...", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "none" },

        // ==================== 楼梯/案发现场对话 ====================
        { scene: "stairs", speaker: "莱斯特雷德", text: "福尔摩斯先生！我在这儿！快过来！", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "stairs", speaker: "福尔摩斯", text: "这楼梯上有滴落的血迹，看来受害者受伤后曾试图离开书房。", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "stairs", speaker: "莱斯特雷德", text: "是的，我们在书房门口发现了更多血迹。门是锁着的，管家用备用钥匙打开的。", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "stairs", speaker: "福尔摩斯", text: "锁着的门？这很有意思。让我检查一下门锁。", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "right", action: "startDoorDetection" },

        // ==================== 门锁检测后返回书房场景 ====================
        { scene: "study", speaker: "福尔摩斯", text: "门锁有明显的撬动痕迹。有人试图用工具打开这扇门，但没有成功。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "study", speaker: "华生", text: "那么凶手是怎么进来的？窗户都是锁着的。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "study", speaker: "福尔摩斯", text: "这正是我们需要解答的问题。看看这个书房，文件散落一地，抽屉都被翻过了。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "study", speaker: "华生", text: "凶手在找什么东西。等等，地板上有更多血迹，一直延伸到书架后面。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "study", speaker: "福尔摩斯", text: "好眼力，华生。让我们跟着血迹看看。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "right", action: "switchToBloodScene" },

        // ==================== 血迹场景互动后对话 ====================
        { scene: "study", speaker: "福尔摩斯", text: "血迹在这里中断了。但我们在现场找到了受害者的日记和一把折叠刀。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "study", speaker: "华生", text: "这把刀很特别，不是普通的餐具。刀柄上有奇怪的图案。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "study", speaker: "福尔摩斯", text: "这是捕鲸人用的折叠刀。墙上这些展品也很有意思。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "right", action: "switchToExhibitionScene" },

        // ==================== 展品架场景互动后对话 ====================
        { scene: "study", speaker: "福尔摩斯", text: "巨头鲸牙齿和捕鲸鱼叉。看来布莱克·彼得对自己曾经的职业很自豪。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "study", speaker: "华生", text: "但鱼叉架上少了一支鱼叉，标签写着'已出借展览'。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "study", speaker: "福尔摩斯", text: "有意思。看看这张书桌，上面有两个古典杯和一封信。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "right", action: "switchToDeskScene" },

        // ==================== 木桌拼图场景互动后返回办公室2号场景 ====================
        { scene: "office2", speaker: "福尔摩斯", text: "华生，从警察局的资料来看，这个案子比我们想象的更复杂。我们需要重新审视所有线索。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "office2", speaker: "华生", text: "你指什么？我们已经检查了现场，收集了证据。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "office2", speaker: "福尔摩斯", text: "那把折叠刀，华生。刀刃上有微小的缺口，我怀疑是用于某种特定目的。我需要做一些化学分析。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "office2", speaker: "华生", text: "化学分析？你想检测什么？", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "office2", speaker: "福尔摩斯", text: "刀上的残留物，还有我们在书房发现的那封被烧毁的信件残片。跟我来实验室。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "right", action: "switchToExperimentScene" },

        // ==================== 化学实验场景成功后的对话 ====================
        { scene: "experiment", speaker: "福尔摩斯", text: "化学药剂制备完成。现在让我们看看这封信到底隐藏着什么秘密。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "right" },
        // 化学实验互动成功后显示涂抹药水按钮
        // 涂抹药水后显示信件内容，然后：
        { scene: "experiment", speaker: "福尔摩斯", text: "果然如我所料。这封信提到了'货物'和'老地方'。布莱克·彼得参与了某种非法活动。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "experiment", speaker: "华生", text: "走私？但信上没写具体是什么货物。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "experiment", speaker: "福尔摩斯", text: "我们需要去警察局查查布莱克·彼得的背景，看看他最近和什么人有往来。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "right", action: "switchToPoliceStation" },

        // ==================== 警察局场景对话 ====================
        { scene: "police-station", speaker: "福尔摩斯", text: "案件报告都在这里了，但我发现了一些矛盾之处。", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "police-station", speaker: "莱斯特雷德", text: "什么矛盾？我们调查了他的商业伙伴王建国，他有不在场证明。", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "police-station", speaker: "福尔摩斯", text: "不是王建国。报告里提到在受害者家中发现了几件物品，但清单不完整。我需要看看物证收集室。", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "right", action: "switchToPoliceCollection1" },

        // ==================== 警察局收集场景1互动后对话 ====================
        { scene: "police-station", speaker: "福尔摩斯", text: "这支钢笔和长筒靴子...它们不属于布莱克·彼得。", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "police-station", speaker: "莱斯特雷德", text: "你怎么知道？", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "police-station", speaker: "福尔摩斯", text: "钢笔上有牙印，说明主人习惯咬笔杆。布莱克·彼得是吸烟斗的，不会这么做。靴子尺寸也比他平时穿的小一号。还有其他物证吗？", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "right", action: "switchToPoliceCollection2" },

        // ==================== 警察局收集场景2互动后对话 ====================
        { scene: "police-station", speaker: "福尔摩斯", text: "金戒指和丝绸手帕...这些都是女性用品。布莱克·彼得是独居，这些东西不应该出现在他家里。", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "police-station", speaker: "莱斯特雷德", text: "也许是访客留下的？", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "police-station", speaker: "福尔摩斯", text: "或许。但我们还需要检查受害者的卧室，看看是否有其他线索。", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "right", action: "switchToBedroom" },

        // ==================== 卧室场景对话 ====================
        { scene: "bedroom", speaker: "福尔摩斯", text: "床铺很整齐，没有打斗的痕迹。但是床头柜的抽屉有被翻动的迹象。", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "bedroom", speaker: "莱斯特雷德", text: "管家说布莱克·彼得有失眠的毛病，经常半夜起来看书。", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "bedroom", speaker: "福尔摩斯", text: "看看这个。一本关于海洋生物的书，但其中几页被撕掉了。", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "bedroom", speaker: "华生", text: "撕掉的部分可能包含重要信息。等等，书页边缘有烧焦的痕迹。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "bedroom", speaker: "福尔摩斯", text: "看来有人试图销毁证据。我们需要审问嫌疑人，看看他们怎么解释这些矛盾之处。", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "right", action: "switchToDebateScene" },

        // ==================== 辩论赛场景互动后返回审讯室 ====================
        { scene: "interrogation", speaker: "福尔摩斯", text: "王先生，我们需要谈谈你和布莱克彼得的关系。", leftCharacter: "wang-jianguo", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "interrogation", speaker: "王建国", text: "我已经告诉警察了，我们只是商业伙伴。他的死和我没关系。", leftCharacter: "wang-jianguo", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "interrogation", speaker: "福尔摩斯", text: "但你们最近在生意上有分歧，不是吗？关于一批'特殊货物'的运输问题。", leftCharacter: "wang-jianguo", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "interrogation", speaker: "王建国", text: "我...我不知道你在说什么。", leftCharacter: "wang-jianguo", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "interrogation", speaker: "福尔摩斯", text: "我想我们需要再次检查案发现场。莱斯特雷德，我们去老酒馆看看，听说那里有些有趣的消息。", leftCharacter: "wang-jianguo", rightCharacter: "detective", activeCharacter: "right", action: "switchToCrimeScene" },

        // ==================== 案发现场（二次检查）对话 ====================
        { scene: "crime", speaker: "福尔摩斯", text: "我们需要再次检查案发现场，也许上次我们遗漏了什么重要线索。", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "crime", speaker: "莱斯特雷德", text: "我们已经检查过三遍了，福尔摩斯先生。", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "crime", speaker: "福尔摩斯", text: "但没问过酒馆里的人。布莱克·彼得经常去'海巫'酒馆，那里的人可能知道些什么。", leftCharacter: "gong-yanxi", rightCharacter: "detective", activeCharacter: "right", action: "switchToBarScene" },

        // ==================== 酒馆场景对话 ====================
        { scene: "bar", speaker: "约翰·霍普利·奈里根", text: "有什么事情吗？", leftCharacter: "zhang-xiaolong", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "bar", speaker: "福尔摩斯", text: "关于布莱克·彼得。听说他常来这里。", leftCharacter: "zhang-xiaolong", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "bar", speaker: "约翰·霍普利·奈里根", text: "布莱克？是的，他有时候来。但最近没见到他。", leftCharacter: "zhang-xiaolong", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "bar", speaker: "福尔摩斯", text: "他有没有和什么人起过争执？", leftCharacter: "zhang-xiaolong", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "bar", speaker: "约翰·霍普利·奈里根", text: "他有时候和帕特里克玩扳手腕。帕特里克就在那边。", leftCharacter: "zhang-xiaolong", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "bar", speaker: "帕特里克", text: "听说你很有力气？敢不敢和我比试一下手腕？看看谁能坚持更久。", leftCharacter: "patrick", rightCharacter: "detective", activeCharacter: "left", action: "startConfrontation" },

        // ==================== 对峙小游戏后返回酒馆继续对话 ====================
        { scene: "bar", speaker: "帕特里克", text: "你赢了。好吧，我告诉你。布莱克最近很紧张，说有人跟踪他。", leftCharacter: "patrick", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "bar", speaker: "福尔摩斯", text: "跟踪他？什么人？", leftCharacter: "patrick", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "bar", speaker: "帕特里克", text: "他没说清楚。但提到过'牙齿'和'金子'。听起来很奇怪。", leftCharacter: "patrick", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "bar", speaker: "约翰·霍普利·奈里根", text: "听说你也是个练家子？敢不敢跟我过两招？打赢了我就告诉你一些有用的信息。", leftCharacter: "zhang-xiaolong", rightCharacter: "detective", activeCharacter: "left", action: "startFightingGame" },

        // ==================== 自由搏击游戏后返回酒馆继续对话 ====================
        { scene: "bar", speaker: "约翰·霍普利·奈里根", text: "好身手。好吧，我告诉你。布莱克死前一周，有个陌生人来这里打听过他。", leftCharacter: "zhang-xiaolong", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "bar", speaker: "福尔摩斯", text: "陌生人？长什么样子？", leftCharacter: "zhang-xiaolong", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "bar", speaker: "约翰·霍普利·奈里根", text: "高个子，戴帽子，说话有外国口音。他问布莱克什么时候出海。", leftCharacter: "zhang-xiaolong", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "bar", speaker: "福尔摩斯", text: "出海？布莱克已经退休多年了。华生，我们回办公室，我需要整理一下线索。", leftCharacter: "zhang-xiaolong", rightCharacter: "detective", activeCharacter: "right", action: "switchToOfficeAfterBar" },

        // ==================== 办公室场景（酒馆后）新对话 ====================
        { scene: "office2", speaker: "福尔摩斯", text: "华生，把所有的线索都写在黑板上。我们有：被撬的门锁、不属于受害者的物品、被烧毁的信件、关于出海的问题。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "office2", speaker: "华生", text: "还有鱼叉架上缺失的鱼叉，以及帕特里克提到的'牙齿'和'金子'。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "office2", speaker: "福尔摩斯", text: "没错。我认为布莱克·彼得并没有完全退休。他可能还在参与某种海上活动，也许是走私。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "office2", speaker: "华生", text: "走私什么？象牙？黄金？", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "office2", speaker: "福尔摩斯", text: "不，华生。更可能是鲸鱼制品。巨头鲸牙齿在某些地方很值钱。我需要出去一下。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "right" },
        { scene: "office2", speaker: "华生", text: "你要去哪？", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "left" },
        { scene: "office2", speaker: "福尔摩斯", text: "去验证一个假设。等我回来，我们应该就能知道真相了。", leftCharacter: "watson", rightCharacter: "detective", activeCharacter: "right", action: "switchToInvestigation" }
    ];

    // ==================== 8. 自由搏击游戏变量 ====================
    window.preFightingState = null; // 保存进入搏击前的游戏状态
    window.fightingGameVictory = false; // 记录搏击游戏胜负
    
    // ==================== 9. 对峙小游戏变量 ====================
    window.preConfrontationState = null; // 保存进入对峙前的游戏状态
    window.confrontationVictory = false; // 记录对峙游戏胜负

    // ==================== 10. 初始化核心游戏系统 ====================
    initGame();
    
    // ==================== 11. 初始化控制面板系统 ====================
    initControlPanels();
    
    // ==================== 12. 初始化音乐系统 ====================
    initMusicSystem();
    
    // ==================== 13. 初始化存档系统 ====================
    window.gameSaveSystem = new GameSaveSystem();
    
    // ==================== 14. 初始化地图系统 ====================
    if (window.mapSystem && typeof window.mapSystem.init === 'function') {
        window.mapSystem.init();
    }
    
    // ==================== 15. 初始化书页系统 ====================
    updateBookPage1();
    updateBookPage2();
    
    // ==================== 16. 初始化自由搏击游戏系统 ====================
    // 创建全局自由搏击游戏实例
    window.fightingGame = new FightingGame();
    
    // 在侦探游戏中添加触发自由搏击的对话（确保触发对话在故事脚本中）
    addFightingGameToStory();
    
    // 修改advanceDialogue函数以支持自由搏击和对峙游戏
    setupFightingGameDialogue();
    setupConfrontationGameDialogue();
    
    console.log('完整游戏系统初始化完成！');
});

// ==================== 自由搏击游戏系统 ====================
class FightingGame {
    constructor() {
        // 游戏状态
        this.playerHealth = 100;
        this.enemyHealth = 150;
        this.comboCount = 0;
        this.lastActionTime = 0;
        this.isPlayerBlocking = false;
        this.isPlayerDodging = false;
        this.gameActive = false;
        this.soundEnabled = true;
        
        // AI系统状态
        this.aiLearningLevel = 0;
        this.playerActionHistory = [];
        this.playerPatternAnalysis = {
            attackFrequency: 0.5,
            defenseFrequency: 0.3,
            dodgeFrequency: 0.2,
            comboPatterns: [],
            favoriteAttack: 'leftPunch',
            weakness: 'none'
        };
        
        // 困难模式参数
        this.DIFFICULTY = {
            enemyDamage: 12,
            enemyAttackSpeed: 800,
            playerDamage: 6,
            enemyHealth: 150
        };
        
        // 绑定方法
        this.init = this.init.bind(this);
        this.startGame = this.startGame.bind(this);
        this.resetFight = this.resetFight.bind(this);
        this.leftPunch = this.leftPunch.bind(this);
        this.rightPunch = this.rightPunch.bind(this);
        this.block = this.block.bind(this);
        this.dodge = this.dodge.bind(this);
        this.exitToDetectiveGame = this.exitToDetectiveGame.bind(this);
    }
    
    init() {
        console.log('初始化自由搏击游戏...');
        
        // 获取DOM元素
        this.startScreen = document.getElementById('startScreen');
        this.startButton = document.getElementById('startButton');
        this.gameContainer = document.getElementById('gameContainer');
        this.completionScreen = document.getElementById('completionScreen');
        this.restartButton = document.getElementById('restartButton');
        this.soundToggle = document.getElementById('soundToggle');
        this.soundStatus = document.getElementById('soundStatus');
        this.soundIndicator = document.getElementById('soundIndicator');
        this.aiStatus = document.getElementById('aiStatus');
        this.completionMessage = document.getElementById('completionMessage');
        
        this.playerFighter = document.getElementById('playerFighter');
        this.enemyFighter = document.getElementById('enemyFighter');
        this.playerHealthBar = document.getElementById('playerHealth');
        this.enemyHealthBar = document.getElementById('enemyHealth');
        this.comboDisplay = document.getElementById('comboDisplay');
        this.actionFeedback = document.getElementById('actionFeedback');
        this.enemyAction = document.getElementById('enemyAction');
        this.hitEffect = document.getElementById('hitEffect');
        this.blockEffect = document.getElementById('blockEffect');
        
        // 音效元素
        this.punchSound = document.getElementById('punchSound');
        this.hitSound = document.getElementById('hitSound');
        this.blockSound = document.getElementById('blockSound');
        this.victorySound = document.getElementById('victorySound');
        
        // 创建返回侦探游戏按钮
        this.createReturnButton();
        
        // 绑定事件
        this.bindEvents();
    }
    
    createReturnButton() {
        const returnBtn = document.createElement('button');
        returnBtn.className = 'return-to-detective-btn';
        returnBtn.innerHTML = '<i class="fas fa-arrow-left"></i>';
        returnBtn.title = '返回侦探游戏';
        returnBtn.addEventListener('click', () => this.exitToDetectiveGame());
        
        // 添加到游戏容器
        const fightScene = document.querySelector('#fighting-scene .fight-scene');
        if (fightScene) {
            fightScene.appendChild(returnBtn);
        }
    }
    
    bindEvents() {
        // 开始游戏
        if (this.startButton) {
            this.startButton.addEventListener('click', () => {
                this.startScreen.classList.add('hidden');
                setTimeout(() => {
                    this.gameContainer.classList.add('active');
                    this.startGame();
                }, 500);
            });
        }
        
        // 重新开始游戏
        if (this.restartButton) {
            this.restartButton.addEventListener('click', () => {
                this.completionScreen.classList.remove('active');
                this.resetFight();
            });
        }
        
        // 音效开关
        if (this.soundToggle) {
            this.soundToggle.addEventListener('change', () => {
                this.soundEnabled = this.soundToggle.checked;
                this.soundStatus.textContent = this.soundEnabled ? '开启' : '关闭';
                this.soundIndicator.innerHTML = this.soundEnabled ? '🔊 音效开启' : '🔇 音效关闭';
            });
        }
        
        // 键盘事件监听
        document.addEventListener('keydown', (e) => {
            if (!this.gameActive || e.repeat) return;
            
            switch(e.code) {
                case 'KeyA':
                    this.leftPunch();
                    break;
                case 'KeyD':
                    this.rightPunch();
                    break;
                case 'KeyF':
                    this.block();
                    break;
                case 'KeyE':
                    this.dodge();
                    break;
                case 'KeyR':
                    this.resetFight();
                    break;
                case 'Escape':
                    this.exitToDetectiveGame();
                    break;
            }
        });
    }
    
    startGame() {
        this.gameActive = true;
        this.resetFight();
    }
    
    exitToDetectiveGame() {
        // 返回酒吧场景
        showScene("bar");
        
        // 如果赢得了比赛，推进对话
        if (window.fightingGameVictory) {
            // 收集证据：证明你击败了酒吧保镖
            collectEvidence({
                id: 'fighting_victory',
                name: '击败酒吧保镖',
                description: '你在酒吧中击败了约翰·霍普利·奈里根，证明了自己的实力，获得了他提供的情报。',
                icon: '🥊',
                location: '老酒馆',
                importance: '关键成就'
            });
            
            // 推进对话
            window.currentDialogueIndex++;
            showCurrentDialogue();
        }
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            switch(type) {
                case 'punch':
                    // 攻击音效
                    const punchOsc = audioContext.createOscillator();
                    const punchGain = audioContext.createGain();
                    punchOsc.connect(punchGain);
                    punchGain.connect(audioContext.destination);
                    punchOsc.frequency.value = 150 + Math.random() * 50;
                    punchOsc.type = 'square';
                    punchGain.gain.setValueAtTime(0.3, audioContext.currentTime);
                    punchGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    punchOsc.start(audioContext.currentTime);
                    punchOsc.stop(audioContext.currentTime + 0.1);
                    break;
                    
                case 'hit':
                    // 受击音效
                    const hitOsc = audioContext.createOscillator();
                    const hitGain = audioContext.createGain();
                    hitOsc.connect(hitGain);
                    hitGain.connect(audioContext.destination);
                    hitOsc.frequency.value = 80 + Math.random() * 30;
                    hitOsc.type = 'sawtooth';
                    hitGain.gain.setValueAtTime(0.4, audioContext.currentTime);
                    hitGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    hitOsc.start(audioContext.currentTime);
                    hitOsc.stop(audioContext.currentTime + 0.2);
                    break;
                    
                case 'block':
                    // 格挡音效
                    const blockOsc1 = audioContext.createOscillator();
                    const blockOsc2 = audioContext.createOscillator();
                    const blockGain = audioContext.createGain();
                    blockOsc1.connect(blockGain);
                    blockOsc2.connect(blockGain);
                    blockGain.connect(audioContext.destination);
                    blockOsc1.frequency.value = 300;
                    blockOsc2.frequency.value = 600;
                    blockOsc1.type = 'square';
                    blockOsc2.type = 'square';
                    blockGain.gain.setValueAtTime(0.3, audioContext.currentTime);
                    blockGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    blockOsc1.start(audioContext.currentTime);
                    blockOsc2.start(audioContext.currentTime);
                    blockOsc1.stop(audioContext.currentTime + 0.3);
                    blockOsc2.stop(audioContext.currentTime + 0.3);
                    break;
                    
                case 'victory':
                    // 胜利音效
                    const victoryOsc = audioContext.createOscillator();
                    const victoryGain = audioContext.createGain();
                    victoryOsc.connect(victoryGain);
                    victoryGain.connect(audioContext.destination);
                    victoryOsc.frequency.setValueAtTime(523.25, audioContext.currentTime);
                    victoryOsc.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
                    victoryOsc.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
                    victoryOsc.type = 'sine';
                    victoryGain.gain.setValueAtTime(0, audioContext.currentTime);
                    victoryGain.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.05);
                    victoryGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                    victoryOsc.start(audioContext.currentTime);
                    victoryOsc.stop(audioContext.currentTime + 0.5);
                    break;
            }
        } catch (error) {
            console.log('音效播放失败:', error);
        }
    }
    
    updateAIStatus() {
        const statusText = [
            "🤖 AI分析中...",
            "🤔 学习你的攻击模式",
            "🧠 已识别你的战斗风格",
            "⚡ 调整策略应对你的战术",
            "🔥 完全适应你的战斗方式"
        ];
        
        if (this.aiStatus) {
            this.aiStatus.textContent = statusText[Math.min(this.aiLearningLevel, statusText.length - 1)];
            
            // 根据AI学习等级调整颜色
            const colors = ["#ffffff", "#1dd1a1", "#ff9f43", "#ff6b6b", "#9b59b6"];
            this.aiStatus.style.color = colors[Math.min(this.aiLearningLevel, colors.length - 1)];
        }
    }
    
    analyzePlayerPattern(action) {
        // 记录玩家动作
        this.playerActionHistory.push({
            action: action,
            timestamp: Date.now(),
            playerHealth: this.playerHealth,
            enemyHealth: this.enemyHealth
        });
        
        // 只保留最近20个动作
        if (this.playerActionHistory.length > 20) {
            this.playerActionHistory.shift();
        }
        
        // 计算动作频率
        const totalActions = this.playerActionHistory.length;
        const attackCount = this.playerActionHistory.filter(a => a.action === 'leftPunch' || a.action === 'rightPunch').length;
        const defenseCount = this.playerActionHistory.filter(a => a.action === 'block').length;
        const dodgeCount = this.playerActionHistory.filter(a => a.action === 'dodge').length;
        
        this.playerPatternAnalysis.attackFrequency = attackCount / totalActions;
        this.playerPatternAnalysis.defenseFrequency = defenseCount / totalActions;
        this.playerPatternAnalysis.dodgeFrequency = dodgeCount / totalActions;
        
        // 检测连击模式
        if (this.playerActionHistory.length >= 3) {
            const lastThree = this.playerActionHistory.slice(-3).map(a => a.action);
            if (lastThree.every(a => a === 'leftPunch' || a === 'rightPunch')) {
                if (!this.playerPatternAnalysis.comboPatterns.includes('aggressive')) {
                    this.playerPatternAnalysis.comboPatterns.push('aggressive');
                }
            }
            
            if (lastThree.filter(a => a === 'block' || a === 'dodge').length >= 2) {
                if (!this.playerPatternAnalysis.comboPatterns.includes('defensive')) {
                    this.playerPatternAnalysis.comboPatterns.push('defensive');
                }
            }
        }
        
        // 检测最喜欢的攻击方式
        const leftPunchCount = this.playerActionHistory.filter(a => a.action === 'leftPunch').length;
        const rightPunchCount = this.playerActionHistory.filter(a => a.action === 'rightPunch').length;
        
        this.playerPatternAnalysis.favoriteAttack = leftPunchCount > rightPunchCount ? 'leftPunch' : 'rightPunch';
        
        // 检测弱点
        if (this.playerPatternAnalysis.defenseFrequency < 0.1) {
            this.playerPatternAnalysis.weakness = '防御不足';
        } else if (this.playerPatternAnalysis.dodgeFrequency < 0.1) {
            this.playerPatternAnalysis.weakness = '闪避不足';
        } else if (this.playerHealth < 30) {
            this.playerPatternAnalysis.weakness = '低血量';
        } else {
            this.playerPatternAnalysis.weakness = 'none';
        }
        
        // 根据分析的数据量提升AI学习等级
        if (totalActions >= 5 && this.aiLearningLevel < 1) this.aiLearningLevel = 1;
        if (totalActions >= 10 && this.aiLearningLevel < 2) this.aiLearningLevel = 2;
        if (totalActions >= 15 && this.aiLearningLevel < 3) this.aiLearningLevel = 3;
        if (totalActions >= 20 && this.aiLearningLevel < 4) this.aiLearningLevel = 4;
        
        this.updateAIStatus();
    }
    
    getAIStrategy() {
        const strategy = {
            attackProbability: 0.7,
            blockProbability: 0.15,
            dodgeProbability: 0.15,
            specialTactic: null
        };
        
        // 根据AI学习等级调整基础策略
        if (this.aiLearningLevel >= 1) {
            // 如果玩家攻击频率高，增加防御概率
            if (this.playerPatternAnalysis.attackFrequency > 0.6) {
                strategy.attackProbability = 0.5;
                strategy.blockProbability = 0.3;
                strategy.dodgeProbability = 0.2;
            }
            
            // 如果玩家防御频率高，增加攻击变化
            if (this.playerPatternAnalysis.defenseFrequency > 0.4) {
                strategy.attackProbability = 0.8;
                strategy.blockProbability = 0.1;
                strategy.dodgeProbability = 0.1;
            }
        }
        
        if (this.aiLearningLevel >= 2) {
            // 针对玩家的弱点
            if (this.playerPatternAnalysis.weakness === '防御不足') {
                strategy.attackProbability = 0.9;
                strategy.specialTactic = '连续攻击';
            } else if (this.playerPatternAnalysis.weakness === '闪避不足') {
                strategy.attackProbability = 0.8;
                strategy.blockProbability = 0.2;
                strategy.specialTactic = '重击';
            } else if (this.playerPatternAnalysis.weakness === '低血量') {
                strategy.attackProbability = 0.85;
                strategy.specialTactic = '终结攻击';
            }
        }
        
        if (this.aiLearningLevel >= 3) {
            // 针对玩家的连击模式
            if (this.playerPatternAnalysis.comboPatterns.includes('aggressive')) {
                strategy.blockProbability = 0.4;
                strategy.attackProbability = 0.5;
                strategy.dodgeProbability = 0.1;
                strategy.specialTactic = '反击';
            }
            
            if (this.playerPatternAnalysis.comboPatterns.includes('defensive')) {
                strategy.attackProbability = 0.9;
                strategy.specialTactic = '破防攻击';
            }
        }
        
        return strategy;
    }
    
    updateHealthBars() {
        if (this.playerHealthBar) {
            this.playerHealthBar.style.width = this.playerHealth + '%';
            const playerHealthText = this.playerHealthBar.parentElement.querySelector('.health-text');
            if (playerHealthText) playerHealthText.textContent = `玩家 HP: ${this.playerHealth}%`;
        }
        
        if (this.enemyHealthBar) {
            this.enemyHealthBar.style.width = (this.enemyHealth / this.DIFFICULTY.enemyHealth * 100) + '%';
            const enemyHealthText = this.enemyHealthBar.parentElement.querySelector('.health-text');
            if (enemyHealthText) enemyHealthText.textContent = `敌人 HP: ${this.enemyHealth}/${this.DIFFICULTY.enemyHealth}`;
        }
        
        // 检查游戏是否结束
        if (this.playerHealth <= 0) {
            this.gameActive = false;
            this.showActionFeedback("你被击败了！");
            if (this.completionMessage) this.completionMessage.textContent = "AI已经学会了你的战斗模式，下次尝试不同的策略吧！";
            setTimeout(() => {
                if (this.completionScreen) this.completionScreen.classList.add('active');
            }, 2000);
            
            // 设置失败标志
            window.fightingGameVictory = false;
        } else if (this.enemyHealth <= 0) {
            this.gameActive = false;
            this.showActionFeedback("胜利！");
            this.playSound('victory');
            
            let message = "恭喜你成功击败对手！你的格斗技巧令人印象深刻。";
            if (this.aiLearningLevel >= 3) {
                message = "太棒了！你成功击败了已经适应你战斗风格的AI！";
            } else if (this.aiLearningLevel >= 1) {
                message = "恭喜获胜！AI刚开始学习你的战斗模式。";
            }
            if (this.completionMessage) this.completionMessage.textContent = message;
            
            setTimeout(() => {
                if (this.completionScreen) this.completionScreen.classList.add('active');
            }, 2000);
            
            // 设置胜利标志
            window.fightingGameVictory = true;
        }
    }
    
    showActionFeedback(text) {
        if (!this.actionFeedback) return;
        this.actionFeedback.textContent = text;
        this.actionFeedback.style.opacity = '1';
        
        setTimeout(() => {
            this.actionFeedback.style.opacity = '0';
        }, 1000);
    }
    
    showEnemyAction(text) {
        if (!this.enemyAction) return;
        this.enemyAction.textContent = text;
        this.enemyAction.style.opacity = '1';
        
        setTimeout(() => {
            this.enemyAction.style.opacity = '0';
        }, 1000);
    }
    
    updateCombo() {
        const now = Date.now();
        if (now - this.lastActionTime < 2000) {
            this.comboCount++;
        } else {
            this.comboCount = 1;
        }
        
        this.lastActionTime = now;
        
        if (this.comboDisplay) {
            this.comboDisplay.textContent = `连击: ${this.comboCount}`;
            this.comboDisplay.style.opacity = '1';
        }
        
        setTimeout(() => {
            if (Date.now() - this.lastActionTime > 2000) {
                if (this.comboDisplay) this.comboDisplay.style.opacity = '0';
            }
        }, 2000);
    }
    
    showHitEffect(x, y) {
        if (!this.hitEffect) return;
        this.hitEffect.style.left = x + '%';
        this.hitEffect.style.top = y + '%';
        this.hitEffect.style.opacity = '0.8';
        
        this.hitEffect.animate([
            { transform: 'scale(0.5)', opacity: 0 },
            { transform: 'scale(1)', opacity: 0.8 },
            { transform: 'scale(1.2)', opacity: 0 }
        ], {
            duration: 500,
            iterations: 1
        });
        
        setTimeout(() => {
            this.hitEffect.style.opacity = '0';
        }, 500);
    }
    
    showBlockEffect() {
        if (!this.blockEffect) return;
        this.blockEffect.style.left = '50%';
        this.blockEffect.style.top = '50%';
        this.blockEffect.style.opacity = '0.5';
        
        this.blockEffect.animate([
            { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0 },
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.5 },
            { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 0 }
        ], {
            duration: 500,
            iterations: 1
        });
        
        setTimeout(() => {
            this.blockEffect.style.opacity = '0';
        }, 500);
    }
    
    leftPunch() {
        if (!this.gameActive) return;
        
        if (this.playerFighter) {
            this.playerFighter.classList.add('punching');
            setTimeout(() => {
                this.playerFighter.classList.remove('punching');
            }, 300);
        }
        
        this.enemyHealth = Math.max(0, this.enemyHealth - this.DIFFICULTY.playerDamage);
        this.updateHealthBars();
        
        this.showHitEffect(30, 50);
        this.showActionFeedback('左勾拳!');
        this.playSound('punch');
        this.updateCombo();
        
        // 记录玩家行为
        this.analyzePlayerPattern('leftPunch');
        
        // AI回应
        setTimeout(() => this.enemyAI(), 500);
    }
    
    rightPunch() {
        if (!this.gameActive) return;
        
        if (this.playerFighter) {
            this.playerFighter.classList.add('punching');
            setTimeout(() => {
                this.playerFighter.classList.remove('punching');
            }, 300);
        }
        
        this.enemyHealth = Math.max(0, this.enemyHealth - this.DIFFICULTY.playerDamage);
        this.updateHealthBars();
        
        this.showHitEffect(30, 50);
        this.showActionFeedback('右勾拳!');
        this.playSound('punch');
        this.updateCombo();
        
        // 记录玩家行为
        this.analyzePlayerPattern('rightPunch');
        
        // AI回应
        setTimeout(() => this.enemyAI(), 500);
    }
    
    block() {
        if (!this.gameActive) return;
        
        this.isPlayerBlocking = true;
        if (this.playerFighter) this.playerFighter.classList.add('blocking');
        this.showBlockEffect();
        this.showActionFeedback('格挡!');
        this.playSound('block');
        
        setTimeout(() => {
            this.isPlayerBlocking = false;
            if (this.playerFighter) this.playerFighter.classList.remove('blocking');
        }, 1000);
        
        this.updateCombo();
        
        // 记录玩家行为
        this.analyzePlayerPattern('block');
    }
    
    dodge() {
        if (!this.gameActive) return;
        
        this.isPlayerDodging = true;
        if (this.playerFighter) this.playerFighter.classList.add('dodging');
        this.showActionFeedback('闪避!');
        
        setTimeout(() => {
            this.isPlayerDodging = false;
            if (this.playerFighter) this.playerFighter.classList.remove('dodging');
        }, 500);
        
        this.updateCombo();
        
        // 记录玩家行为
        this.analyzePlayerPattern('dodge');
    }
    
    enemyAttack() {
        if (!this.gameActive) return;
        
        const strategy = this.getAIStrategy();
        const action = Math.random();
        
        if (action < strategy.attackProbability) {
            // 攻击
            const attackType = Math.random() > 0.5 ? 'punch' : 'kick';
            
            if (attackType === 'punch') {
                if (this.enemyFighter) this.enemyFighter.classList.add('punching');
                
                // 根据AI策略显示不同的动作文本
                let actionText = '敌人出拳!';
                if (strategy.specialTactic === '重击') actionText = '敌人重拳出击!';
                if (strategy.specialTactic === '终结攻击') actionText = '敌人试图终结战斗!';
                if (strategy.specialTactic === '破防攻击') actionText = '敌人使用破防攻击!';
                
                this.showEnemyAction(actionText);
                
                setTimeout(() => {
                    if (this.enemyFighter) this.enemyFighter.classList.remove('punching');
                }, 300);
                
                this.showHitEffect(70, 50);
                
                let damage = this.DIFFICULTY.enemyDamage;
                
                // 根据AI策略调整伤害
                if (strategy.specialTactic === '重击') damage = Math.floor(damage * 1.5);
                if (strategy.specialTactic === '终结攻击' && this.playerHealth < 30) damage = Math.floor(damage * 1.8);
                if (strategy.specialTactic === '破防攻击' && this.isPlayerBlocking) damage = Math.floor(damage * 1.3);
                
                if (this.isPlayerBlocking) {
                    damage = Math.floor(damage * 0.3);
                    this.showActionFeedback('格挡成功!');
                    this.playSound('block');
                } else {
                    this.playSound('hit');
                }
                
                if (this.isPlayerDodging && Math.random() > 0.3) {
                    damage = 0;
                    this.showActionFeedback('成功闪避!');
                }
                
                this.playerHealth = Math.max(0, this.playerHealth - damage);
                this.updateHealthBars();
            } else {
                let actionText = '敌人踢击!';
                if (strategy.specialTactic === '连续攻击') actionText = '敌人连续踢击!';
                
                this.showEnemyAction(actionText);
                this.showHitEffect(70, 60);
                
                let damage = this.DIFFICULTY.enemyDamage + 2;
                
                if (this.isPlayerBlocking) {
                    damage = Math.floor(damage * 0.5);
                    this.showActionFeedback('格挡成功!');
                    this.playSound('block');
                } else {
                    this.playSound('hit');
                }
                
                if (this.isPlayerDodging && Math.random() > 0.5) {
                    damage = 0;
                    this.showActionFeedback('成功闪避!');
                }
                
                this.playerHealth = Math.max(0, this.playerHealth - damage);
                this.updateHealthBars();
            }
            
            // 如果是连续攻击，快速再次攻击
            if (strategy.specialTactic === '连续攻击' && Math.random() > 0.5) {
                setTimeout(() => {
                    if (this.gameActive) this.enemyAttack();
                }, 300);
            }
        } else if (action < strategy.attackProbability + strategy.blockProbability) {
            // 格挡
            if (this.enemyFighter) this.enemyFighter.classList.add('blocking');
            this.showEnemyAction('敌人格挡!');
            
            setTimeout(() => {
                if (this.enemyFighter) this.enemyFighter.classList.remove('blocking');
            }, 800);
        } else {
            // 闪避
            if (this.enemyFighter) this.enemyFighter.classList.add('dodging');
            this.showEnemyAction('敌人闪避!');
            
            setTimeout(() => {
                if (this.enemyFighter) this.enemyFighter.classList.remove('dodging');
            }, 500);
        }
        
        // 根据AI学习等级调整攻击速度
        let nextActionTime = this.DIFFICULTY.enemyAttackSpeed;
        if (this.aiLearningLevel >= 2) nextActionTime = Math.max(500, nextActionTime - 100);
        if (this.aiLearningLevel >= 3) nextActionTime = Math.max(400, nextActionTime - 100);
        if (this.aiLearningLevel >= 4) nextActionTime = Math.max(300, nextActionTime - 100);
        
        nextActionTime += Math.random() * 500;
        setTimeout(() => this.enemyAI(), nextActionTime);
    }
    
    enemyAI() {
        if (!this.gameActive) return;
        this.enemyAttack();
    }
    
    resetFight() {
        this.playerHealth = 100;
        this.enemyHealth = this.DIFFICULTY.enemyHealth;
        this.comboCount = 0;
        this.isPlayerBlocking = false;
        this.isPlayerDodging = false;
        this.gameActive = true;
        
        // 重置AI状态
        this.aiLearningLevel = 0;
        this.playerActionHistory = [];
        this.playerPatternAnalysis = {
            attackFrequency: 0.5,
            defenseFrequency: 0.3,
            dodgeFrequency: 0.2,
            comboPatterns: [],
            favoriteAttack: 'leftPunch',
            weakness: 'none'
        };
        
        this.updateHealthBars();
        this.updateAIStatus();
        if (this.comboDisplay) this.comboDisplay.style.opacity = '0';
        this.showActionFeedback('战斗开始!');
        
        setTimeout(() => this.enemyAI(), 2000);
    }
}

// ==================== 自由搏击游戏集成函数 ====================

// 在侦探游戏中添加触发自由搏击的对话
function addFightingGameToStory() {
    // 检查是否已经添加了触发对话
    const hasFightingTrigger = window.storyScript.some(d => d.action === "startFightingGame");
    
    if (!hasFightingTrigger) {
        // 在故事脚本中查找酒吧场景的位置
        const barSceneIndex = window.storyScript.findIndex(d => d.scene === "bar");
        if (barSceneIndex !== -1) {
            // 在酒吧对话之后添加自由搏击触发
            window.storyScript.splice(barSceneIndex + 1, 0, {
                scene: "bar",
                speaker: "约翰·霍普利·奈里根",
                text: "听说你也是个练家子？敢不敢跟我过两招？打赢了我就告诉你一些有用的信息。",
                leftCharacter: "zhang-xiaolong",
                rightCharacter: "detective",
                activeCharacter: "left",
                action: "startFightingGame"
            });
        }
    }
}

// 设置自由搏击游戏对话触发
function setupFightingGameDialogue() {
    // 保存原始advanceDialogue函数
    const originalAdvanceDialogue = window.advanceDialogue;
    
    // 创建新的advanceDialogue函数
    window.advanceDialogue = function() {
        // 检查当前对话是否有特殊动作
        const currentDialogue = window.storyScript[window.currentDialogueIndex];
        
        if (currentDialogue && currentDialogue.action === "startFightingGame") {
            // 启动自由搏击游戏
            startFightingMinigame();
            return; // 暂停对话推进
        }
        
        // 调用原始函数
        return originalAdvanceDialogue.apply(this, arguments);
    };
}

// 设置对峙游戏对话触发
function setupConfrontationGameDialogue() {
    // 保存原始advanceDialogue函数
    const originalAdvanceDialogue = window.advanceDialogue;
    
    // 修改advanceDialogue函数以支持对峙游戏
    window.advanceDialogue = function() {
        // 检查当前对话是否有特殊动作
        const currentDialogue = window.storyScript[window.currentDialogueIndex];
        
        if (currentDialogue && currentDialogue.action === "startConfrontation") {
            // 启动对峙小游戏
            startConfrontationMinigame();
            return; // 暂停对话推进
        }
        
        // 调用原始函数
        return originalAdvanceDialogue.apply(this, arguments);
    };
}

// 启动自由搏击小游戏
function startFightingMinigame() {
    console.log('启动自由搏击小游戏');
    
    // 切换到自由搏击场景
    showScene("fighting-scene");
    
    // 初始化自由搏击游戏
    if (window.fightingGame && typeof window.fightingGame.init === 'function') {
        window.fightingGame.init();
    }
    
    // 保存当前侦探游戏状态
    window.preFightingState = {
        currentDialogueIndex: window.currentDialogueIndex,
        currentScene: window.currentScene
    };
}

// 启动对峙小游戏
function startConfrontationMinigame() {
    console.log('启动对峙小游戏');
    
    // 切换到对峙场景
    showScene("confrontation-scene");
    
    // 初始化对峙游戏
    if (typeof initConfrontationGame === 'function') {
        setTimeout(initConfrontationGame, 100);
    }
    
    // 保存当前侦探游戏状态
    window.preConfrontationState = {
        currentDialogueIndex: window.currentDialogueIndex,
        currentScene: window.currentScene
    };
}

// ==================== 警察局收集场景1：钢笔和靴子 ====================
function initPoliceCollection1() {
    console.log('初始化警察局收集场景1');
    
    const scene = document.getElementById('police-collection1-scene');
    if (!scene) return;
    
    // 获取DOM元素
    const penItem = document.getElementById('penItem');
    const leftBoot = document.getElementById('leftBoot');
    const rightBoot = document.getElementById('rightBoot');
    const statusMessage = document.getElementById('statusMessage');
    const returnBtn = document.getElementById('return-from-collection1');
    
    // 收集状态
    let penCollected = false;
    let bootsCollected = false;
    
    // 钢笔收集功能
    if (penItem) {
        penItem.addEventListener('click', function() {
            if (!penCollected) {
                // 调用主游戏的证据收集函数
                if (window.collectEvidence && window.collectEvidence('pen')) {
                    // 钢笔消失效果
                    this.style.opacity = '0';
                    this.style.transform = 'scale(0.5)';
                    
                    // 更新状态
                    penCollected = true;
                    if (statusMessage) statusMessage.textContent = '细长钢笔已收集！';
                    
                    // 延迟移除钢笔元素
                    setTimeout(() => {
                        this.style.display = 'none';
                    }, 500);
                    
                    // 检查是否全部收集
                    checkCollection1Complete();
                } else {
                    if (statusMessage) statusMessage.textContent = '钢笔已经收集过了！';
                }
            }
        });
    }
    
    // 长筒靴子收集功能
    function collectBoots() {
        if (!bootsCollected) {
            // 调用主游戏的证据收集函数
            if (window.collectEvidence && window.collectEvidence('boots')) {
                // 两只靴子一起消失效果
                if (leftBoot) {
                    leftBoot.style.opacity = '0';
                    leftBoot.style.transform = 'scale(0.5) translateX(-10px)';
                }
                if (rightBoot) {
                    rightBoot.style.opacity = '0';
                    rightBoot.style.transform = 'scale(0.5) translateX(10px)';
                }
                
                // 更新状态
                bootsCollected = true;
                if (statusMessage) statusMessage.textContent = '长筒靴子已收集！';
                
                // 延迟移除靴子元素
                setTimeout(() => {
                    if (leftBoot && leftBoot.parentNode) {
                        leftBoot.parentNode.style.display = 'none';
                    }
                }, 500);
                
                // 检查是否全部收集
                    checkCollection1Complete();
            } else {
                if (statusMessage) statusMessage.textContent = '靴子已经收集过了！';
            }
        }
    }
    
    // 为两只靴子添加点击事件
    if (leftBoot) leftBoot.addEventListener('click', collectBoots);
    if (rightBoot) rightBoot.addEventListener('click', collectBoots);
    
    // 检查所有物品是否收集完成
    function checkCollection1Complete() {
        if (penCollected && bootsCollected) {
            setTimeout(() => {
                if (statusMessage) {
                    statusMessage.textContent = '恭喜！所有物品已收集完成！';
                }
            }, 600);
        }
    }
    
    // 返回按钮
    if (returnBtn) {
        returnBtn.addEventListener('click', function() {
            showScene('police-station'); // 返回警察局场景
        });
    }
    
    // 初始状态提示
    if (statusMessage) statusMessage.textContent = '点击木框中的钢笔或长筒靴子开始收集';
}

// ==================== 警察局收集场景2：金戒指和手帕 ====================
function initPoliceCollection2() {
    console.log('初始化警察局收集场景2');
    
    const scene = document.getElementById('police-collection2-scene');
    if (!scene) return;
    
    // 收集状态对象
    const collectionState = {
        ring: false,
        handkerchief: false
    };
    
    // DOM元素
    const ring = document.getElementById('ring');
    const handkerchief = document.getElementById('handkerchief');
    const ringStatus = document.getElementById('ring-status');
    const handkerchiefStatus = document.getElementById('handkerchief-status');
    const successOverlay = document.getElementById('success-overlay');
    const successTitle = document.getElementById('success-title');
    const successText = document.getElementById('success-text');
    const closeBtn = document.getElementById('close-btn');
    const collectionData = document.getElementById('collection-data');
    const returnBtn = document.getElementById('return-from-collection2');
    
    // 收集动画效果
    function collectAnimation(element, type) {
        // 添加闪光效果
        const flash = document.createElement('div');
        flash.style.position = 'absolute';
        flash.style.top = '50%';
        flash.style.left = '50%';
        flash.style.transform = 'translate(-50%, -50%)';
        flash.style.width = '200px';
        flash.style.height = '200px';
        flash.style.borderRadius = '50%';
        flash.style.background = type === 'ring' 
            ? 'radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, transparent 70%)' 
            : 'radial-gradient(circle, rgba(147, 112, 219, 0.8) 0%, transparent 70%)';
        flash.style.zIndex = '10';
        flash.style.animation = 'pulse 0.8s ease-out';
        
        element.appendChild(flash);
        
        // 移除闪光效果
        setTimeout(() => {
            flash.remove();
        }, 800);
        
        // 物品消失动画
        element.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        element.style.opacity = '0';
        element.style.transform = type === 'ring' 
            ? 'rotate(360deg) scale(0)' 
            : 'rotate(-360deg) scale(0)';
    }
    
    // 更新收集数据展示
    function updateCollectionData() {
        if (collectionData) {
            collectionData.textContent = JSON.stringify(collectionState, null, 2);
        }
    }
    
    // 显示收集成功消息
    function showSuccessMessage(itemName, evidenceId) {
        if (successTitle) successTitle.textContent = `${itemName} 收集成功！`;
        if (successText) successText.textContent = `${itemName} 已添加到你的收藏中`;
        if (successOverlay) successOverlay.classList.add('active');
    }
    
    // 收集戒指
    if (ring) {
        ring.addEventListener('click', function() {
            if (collectionState.ring) return;
            
            // 调用主游戏的证据收集函数
            if (window.collectEvidence && window.collectEvidence('gold_ring')) {
                // 更新状态
                collectionState.ring = true;
                if (ringStatus) {
                    ringStatus.textContent = "已收集";
                    ringStatus.classList.add('collected');
                }
                
                // 播放收集动画
                collectAnimation(this, 'ring');
                
                // 显示成功消息
                setTimeout(() => {
                    showSuccessMessage("精致金戒指", 'gold_ring');
                }, 500);
                
                // 更新收集数据
                updateCollectionData();
                
                // 检查是否全部收集完成
                if (collectionState.ring && collectionState.handkerchief) {
                    setTimeout(() => {
                        if (successText) {
                            successText.textContent = "所有物品已收集完成！";
                        }
                    }, 1000);
                }
            }
        });
    }
    
    // 收集手帕
    if (handkerchief) {
        handkerchief.addEventListener('click', function() {
            if (collectionState.handkerchief) return;
            
            // 调用主游戏的证据收集函数
            if (window.collectEvidence && window.collectEvidence('silk_handkerchief')) {
                // 更新状态
                collectionState.handkerchief = true;
                if (handkerchiefStatus) {
                    handkerchiefStatus.textContent = "已收集";
                    handkerchiefStatus.classList.add('collected');
                }
                
                // 播放收集动画
                collectAnimation(this, 'handkerchief');
                
                // 显示成功消息
                setTimeout(() => {
                    showSuccessMessage("精致丝绸手帕", 'silk_handkerchief');
                }, 500);
                
                // 更新收集数据
                updateCollectionData();
                
                // 检查是否全部收集完成
                if (collectionState.ring && collectionState.handkerchief) {
                    setTimeout(() => {
                        if (successText) {
                            successText.textContent = "所有物品已收集完成！";
                        }
                    }, 1000);
                }
            }
        });
    }
    
    // 关闭成功消息
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            if (successOverlay) successOverlay.classList.remove('active');
        });
    }
    
    // 返回按钮
    if (returnBtn) {
        returnBtn.addEventListener('click', function() {
            if (successOverlay) successOverlay.classList.remove('active');
            showScene('police-station'); // 返回警察局场景
        });
    }
    
    // 初始更新收集数据
    updateCollectionData();
}

// ==================== 在故事脚本中添加前往收集场景的选项 ====================
// 在警察局场景中添加对话选项
function addCollectionOptionsToPoliceStation() {
    const policeStationScene = document.getElementById('police-station-scene');
    if (!policeStationScene) return;
    
    // 创建收集选项容器
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'collection-options';
    optionsContainer.innerHTML = `
        <div class="collection-option" id="go-to-collection1">
            <i class="fas fa-pen"></i>
            <span>检查物证收集室1（钢笔和靴子）</span>
        </div>
        <div class="collection-option" id="go-to-collection2">
            <i class="fas fa-ring"></i>
            <span>检查物证收集室2（金戒指和手帕）</span>
        </div>
    `;
    
    // 添加到警察局场景
    policeStationScene.appendChild(optionsContainer);
    
    // 添加点击事件
    document.getElementById('go-to-collection1')?.addEventListener('click', function() {
        showScene('police-collection1-scene');
    });
    
    document.getElementById('go-to-collection2')?.addEventListener('click', function() {
        showScene('police-collection2-scene');
    });
}

// ==================== 存档系统修复版 ====================
class GameSaveSystem {
    constructor() {
        this.saveKey = 'black-peter-saves';
        this.maxSaves = 6;
        this.saves = [];
        this.loadSaves();
    }

    loadSaves() {
        const savesJson = localStorage.getItem(this.saveKey);
        this.saves = savesJson ? JSON.parse(savesJson) : [];
        this.saves.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    saveSaves() {
        localStorage.setItem(this.saveKey, JSON.stringify(this.saves));
    }

    createSave(isAutoSave = false) {
        // 检查存档数量是否达到上限
        if (this.saves.length >= this.maxSaves) {
            if (isAutoSave) {
                // 自动保存：达到上限时不创建新存档，也不提示
                console.log('自动保存：存档已达上限(6个)，跳过保存');
                return null;
            } else {
                // 手动保存：达到上限时提示用户
                this.showSaveMessage('存档已达上限(6个)，请删除旧存档后再创建新存档', 'warning');
                return null;
            }
        }
        
        // 获取当前游戏状态
        const gameState = this.getCurrentGameState();
        if (!gameState) return null;
        
        const now = new Date();
        const saveId = `save_${now.getTime()}`;
        let saveTitle = isAutoSave ? '自动存档' : '手动存档';
        
        // 如果是手动存档，添加序号
        if (!isAutoSave) {
            const manualSaveCount = this.saves.filter(s => !s.isAutoSave).length;
            saveTitle = `手动存档 ${manualSaveCount + 1}`;
        }
        
        const newSave = {
            id: saveId,
            title: saveTitle,
            timestamp: now.toISOString(),
            gameState: gameState,
            isAutoSave: isAutoSave,
            progress: this.calculateProgress(gameState)
        };
        
        this.saves.unshift(newSave);
        this.saveSaves();
        this.renderSaveList();
        
        if (!isAutoSave) {
            this.showSaveMessage('游戏已保存', 'success');
        } else {
            console.log('自动保存完成，当前存档数:', this.saves.length);
        }
        
        return saveId;
    }

    getCurrentGameState() {
        return {
            currentDialogueIndex: window.currentDialogueIndex,
            currentScene: window.currentScene,
            timestamp: Date.now(),
            collectedEvidence: window.collectedEvidence || [],
            encounteredCharacters: window.encounteredCharacters || [],
            storyProgress: Math.round((window.currentDialogueIndex / window.storyScript.length) * 100)
        };
    }

    calculateProgress(gameState) {
        return gameState.storyProgress || Math.round((gameState.currentDialogueIndex / window.storyScript.length) * 100);
    }

    renderSaveList() {
        const saveListContainer = document.getElementById('save-list-container');
        const emptySaves = document.getElementById('empty-saves');
        
        if (!saveListContainer) return;
        
        saveListContainer.innerHTML = '';
        
        if (this.saves.length === 0) {
            if (emptySaves) emptySaves.style.display = 'block';
            return;
        }
        
        if (emptySaves) emptySaves.style.display = 'none';
        
        this.saves.forEach(save => {
            const saveItem = this.createSaveItem(save);
            saveListContainer.appendChild(saveItem);
        });
    }

    createSaveItem(save) {
        const now = new Date();
        const saveTime = new Date(save.timestamp);
        const timeDiff = now.getTime() - saveTime.getTime();
        
        let timeDisplay;
        if (timeDiff < 60000) {
            timeDisplay = '刚刚';
        } else if (timeDiff < 3600000) {
            const minutes = Math.floor(timeDiff / 60000);
            timeDisplay = `${minutes}分钟前`;
        } else if (timeDiff < 86400000) {
            const hours = Math.floor(timeDiff / 3600000);
            timeDisplay = `${hours}小时前`;
        } else {
            const days = Math.floor(timeDiff / 86400000);
            timeDisplay = `${days}天前`;
        }
        
        const saveItem = document.createElement('div');
        saveItem.className = 'save-item';
        saveItem.innerHTML = `
            <div class="save-item-header">
                <div class="save-item-title">${save.title}</div>
                <div class="save-item-time">${timeDisplay}</div>
            </div>
            <div class="save-item-content">
                <div class="save-item-scene">进度: ${save.progress}%</div>
                <div class="save-item-progress">场景: ${save.gameState.currentScene}</div>
            </div>
            <div class="save-item-actions">
                <button class="save-item-btn load-btn" data-save-id="${save.id}">
                    <i class="fas fa-play"></i> 加载
                </button>
                <button class="save-item-btn delete-btn" data-save-id="${save.id}">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </div>
        `;
        
        const loadBtn = saveItem.querySelector('.load-btn');
        const deleteBtn = saveItem.querySelector('.delete-btn');
        
        if (loadBtn) {
            loadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.loadSave(save.id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteSave(save.id);
            });
        }
        
        return saveItem;
    }

    loadSave(saveId) {
        const save = this.saves.find(s => s.id === saveId);
        if (!save) {
            this.showSaveMessage('存档加载失败', 'error');
            return false;
        }
        
        window.currentDialogueIndex = save.gameState.currentDialogueIndex;
        window.currentScene = save.gameState.currentScene;
        
        // 恢复收集数据
        if (save.gameState.collectedEvidence) {
            window.collectedEvidence = save.gameState.collectedEvidence;
            updateBookPage2();
        }
        
        if (save.gameState.encounteredCharacters) {
            window.encounteredCharacters = save.gameState.encounteredCharacters;
            updateBookPage1();
        }
        
        showScene(window.currentScene);
        setTimeout(() => {
            showCurrentDialogue();
        }, 500);
        
        this.closeSavePanel();
        this.showSaveMessage('存档加载成功', 'success');
        return true;
    }

    deleteSave(saveId) {
        if (!confirm('确定要删除这个存档吗？')) return false;
        
        const index = this.saves.findIndex(s => s.id === saveId);
        if (index !== -1) {
            const deletedTitle = this.saves[index].title;
            this.saves.splice(index, 1);
            this.saveSaves();
            this.renderSaveList();
            this.showSaveMessage(`存档"${deletedTitle}"已删除`, 'success');
            return true;
        }
        return false;
    }

    showSaveMessage(message, type = 'success') {
        // 移除已有的消息
        const existingMessage = document.querySelector('.save-message');
        if (existingMessage) existingMessage.remove();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'save-message';
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'success' ? 'rgba(46, 204, 113, 0.9)' : 
                        type === 'warning' ? 'rgba(243, 156, 18, 0.9)' : 
                        'rgba(231, 76, 60, 0.9)'};
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            z-index: 10000;
            font-size: 1.1em;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: fadeInOut 3s forwards;
        `;
        
        document.body.appendChild(messageDiv);
        
        // 添加淡入淡出动画样式
        if (!document.querySelector('#save-message-styles')) {
            const style = document.createElement('style');
            style.id = 'save-message-styles';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translate(-50%, -50%) translateY(20px); }
                    10% { opacity: 1; transform: translate(-50%, -50%) translateY(0); }
                    90% { opacity: 1; transform: translate(-50%, -50%) translateY(0); }
                    100% { opacity: 0; transform: translate(-50%, -50%) translateY(-20px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    closeSavePanel() {
        const panel = document.getElementById('save-panel');
        if (panel) panel.classList.remove('active');
    }

    // 检查是否可以创建新存档
    canCreateNewSave(isAutoSave = false) {
        if (this.saves.length >= this.maxSaves) {
            if (isAutoSave) {
                console.log('自动保存：存档已达上限，跳过检查');
            }
            return false;
        }
        return true;
    }
}

// ==================== 修改自动保存逻辑 ====================
function setupAutoSave() {
    // 在关键节点自动保存
    let lastAutoSaveIndex = -1;
    
    // 监听对话推进
    const originalAdvanceDialogue = window.advanceDialogue;
    window.advanceDialogue = function() {
        const result = originalAdvanceDialogue.apply(this, arguments);
        
        // 每隔5个对话自动保存一次
        if (window.currentDialogueIndex % 5 === 0 && 
            window.currentDialogueIndex !== lastAutoSaveIndex &&
            window.gameSaveSystem) {
            
            console.log('触发自动保存检查，当前存档数:', window.gameSaveSystem.saves.length);
            window.gameSaveSystem.createSave(true);
            lastAutoSaveIndex = window.currentDialogueIndex;
        }
        
        return result;
    };
    
    // 监听场景切换
    const originalShowScene = window.showScene;
    window.showScene = function(sceneName) {
        const result = originalShowScene.apply(this, arguments);
        
        // 重要场景切换时自动保存
        const importantScenes = ['door', 'experiment', 'investigation', 'deduction', 'ending'];
        if (importantScenes.includes(sceneName) && window.gameSaveSystem) {
            console.log('重要场景切换，触发自动保存');
            window.gameSaveSystem.createSave(true);
        }
        
        return result;
    };
}

// ==================== 证据收集系统扩展 ====================
function collectEvidence(evidenceId) {
    if (!evidenceId || !window.evidenceDefinitions[evidenceId]) {
        console.error('无效的证据ID:', evidenceId);
        return false;
    }
    
    // 检查是否已收集
    if (window.collectedEvidence.find(e => e.id === evidenceId)) {
        console.log('证据已收集:', window.evidenceDefinitions[evidenceId].name);
        return false;
    }
    
    // 创建证据副本并添加时间戳
    const evidenceData = {
        ...window.evidenceDefinitions[evidenceId],
        foundTime: new Date().toLocaleString(),
        collectedIndex: window.collectedEvidence.length // 记录收集顺序
    };
    
    // 添加到收集数组
    window.collectedEvidence.push(evidenceData);
    console.log('新证据收集:', evidenceData.name);
    
    // 更新书展页面
    updateBookPage2();
    
    // 显示收集提示
    showEvidenceCollectedMessage(evidenceData.name, evidenceData.icon);
    
    // 保存到存档
    if (window.gameSaveSystem) {
        window.gameSaveSystem.createSave(true); // 自动保存
    }
    
    return true;
}

// 显示收集成功消息
function showEvidenceCollectedMessage(evidenceName, evidenceIcon) {
    const message = document.createElement('div');
    message.className = 'evidence-collected-message';
    message.innerHTML = `
        <div class="evidence-collected-content">
            <div class="evidence-collected-icon">${evidenceIcon}</div>
            <div class="evidence-collected-text">
                <strong>新证据收集！</strong><br>
                ${evidenceName}
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(message);
    
    // 动画显示
    setTimeout(() => {
        message.classList.add('show');
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 300);
    }, 3000);
}

// ==================== 三个互动场景的初始化函数 ====================

// 血迹场景初始化
function initBloodScene() {
    console.log('初始化血迹场景');
    
    // 加载血迹场景内容
    fetch('scenes/blood-scene.html')
        .then(response => response.text())
        .then(html => {
            const bloodScene = document.getElementById('blood-scene');
            if (bloodScene) {
                bloodScene.innerHTML = html;
                setupBloodSceneInteractions();
            }
        })
        .catch(error => console.error('加载血迹场景失败:', error));
}

// 血迹场景交互设置
function setupBloodSceneInteractions() {
    // 获取血迹场景中的元素
    const journal = document.getElementById('journal');
    const knife = document.getElementById('knife');
    const completionMessage = document.getElementById('completionMessage');
    
    if (!journal || !knife) return;
    
    let journalCollected = false;
    let knifeCollected = false;
    
    // 收集道具
    function collectProp(propType) {
        if (propType === 'journal' && !journalCollected) {
            journal.classList.add('collected');
            journalCollected = true;
            collectEvidence('blood_journal');
        } else if (propType === 'knife' && !knifeCollected) {
            knife.classList.add('collected');
            knifeCollected = true;
            collectEvidence('blood_knife');
        }
        
        // 检查是否全部收集完成
        if (journalCollected && knifeCollected) {
            setTimeout(() => {
                if (completionMessage) {
                    completionMessage.classList.add('show');
                }
            }, 1000);
        }
    }
    
    // 绑定事件
    journal.addEventListener('click', () => collectProp('journal'));
    knife.addEventListener('click', () => collectProp('knife'));
}

// 展品架场景初始化
function initExhibitionScene() {
    console.log('初始化展品架场景');
    
    fetch('scenes/exhibition-scene.html')
        .then(response => response.text())
        .then(html => {
            const exhibitionScene = document.getElementById('exhibition-scene');
            if (exhibitionScene) {
                exhibitionScene.innerHTML = html;
                setupExhibitionSceneInteractions();
            }
        })
        .catch(error => console.error('加载展品架场景失败:', error));
}

function setupExhibitionSceneInteractions() {
    const dustArea = document.getElementById('dustArea');
    const cleanButton = document.getElementById('cleanButton');
    const virtualChest = document.getElementById('virtualChest');
    
    if (!dustArea || !cleanButton) return;
    
    let isCleaned = false;
    
    cleanButton.addEventListener('click', function() {
        if (isCleaned) return;
        
        // 清理动画
        dustArea.style.cursor = 'default';
        cleanButton.textContent = '清理中...';
        
        // 显示虚拟箱子
        setTimeout(() => {
            if (virtualChest) virtualChest.style.display = 'flex';
            cleanButton.style.display = 'none';
            isCleaned = true;
            
            // 收集证据
            collectEvidence('whale_tooth');
            setTimeout(() => {
                collectEvidence('harpoon');
            }, 500);
        }, 1000);
    });
}

// 木桌拼图场景初始化
function initDeskScene() {
    console.log('初始化木桌拼图场景');
    
    fetch('scenes/desk-scene.html')
        .then(response => response.text())
        .then(html => {
            const deskScene = document.getElementById('desk-scene');
            if (deskScene) {
                deskScene.innerHTML = html;
                setupDeskSceneInteractions();
            }
        })
        .catch(error => console.error('加载木桌场景失败:', error));
}

function setupDeskSceneInteractions() {
    // 这里需要实现木桌场景的交互逻辑
    // 包括酒杯点击、拼图旋转等
    console.log('设置木桌场景交互');
    
    // 简化的收集逻辑
    const glasses = document.querySelectorAll('.classic-glass');
    const letter = document.querySelector('.letter');
    
    glasses.forEach((glass, index) => {
        glass.addEventListener('click', () => {
            if (index === 0) collectEvidence('classic_glass1');
            else collectEvidence('classic_glass2');
        });
    });
    
    if (letter) {
        letter.addEventListener('click', () => {
            collectEvidence('pirate_puzzle');
        });
    }
}

// ==================== 扩展书展页面更新函数 ====================
function updateBookPage2() {
    const evidenceGrid = document.querySelector('.evidence-grid');
    if (!evidenceGrid) return;
    
    // 清空现有内容
    evidenceGrid.innerHTML = '';
    
    // 按照收集顺序显示证据（最多8个）
    const maxEvidence = 8;
    const displayEvidence = window.collectedEvidence.slice(0, maxEvidence);
    
    displayEvidence.forEach((evidence, index) => {
        if (index >= maxEvidence) return;
        
        const item = document.createElement('div');
        item.className = 'book-evidence-item';
        item.dataset.id = evidence.id;
        item.dataset.name = evidence.name;
        item.dataset.index = index;
        
        item.innerHTML = `
            ${evidence.icon}
            <span class="evidence-sub-icon">${index + 1}</span>
        `;
        
        // 点击显示详细信息
        item.addEventListener('click', function() {
            showEvidenceDetail(evidence);
        });
        
        evidenceGrid.appendChild(item);
    });
    
    // 填充剩余的空位
    const remainingSlots = maxEvidence - Math.min(displayEvidence.length, maxEvidence);
    for (let i = 0; i < remainingSlots; i++) {
        const item = document.createElement('div');
        item.className = 'book-evidence-item';
        item.innerHTML = '?';
        item.addEventListener('click', function() {
            alert('尚未收集到该证据');
        });
        evidenceGrid.appendChild(item);
    }
    
    // 更新右侧信件区域
    updateEvidenceDetailDisplay();
}

// 显示证据详细信息
function showEvidenceDetail(evidence) {
    const letterTitle = document.querySelector('.book-page-title');
    const letterText = document.querySelector('.book-letter-text');
    const evidenceGrid = document.querySelector('.evidence-grid');
    
    if (!letterTitle || !letterText || !evidenceGrid) return;
    
    // 更新标题
    letterTitle.textContent = evidence.name;
    
    // 更新描述
    letterText.innerHTML = `
        <p><strong>证据编号：</strong>${evidence.id}</p>
        <p><strong>发现时间：</strong>${evidence.foundTime}</p>
        <p><strong>发现地点：</strong>${evidence.location}</p>
        <p><strong>重要程度：</strong>${evidence.importance}</p>
        <p><strong>详细描述：</strong></p>
        <p>${evidence.description}</p>
    `;
    
    // 移除所有激活状态
    evidenceGrid.querySelectorAll('.book-evidence-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 激活当前选中的证据
    const activeItem = evidenceGrid.querySelector(`.book-evidence-item[data-id="${evidence.id}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// 更新证据详情显示
function updateEvidenceDetailDisplay() {
    const letterTitle = document.querySelector('.book-page-title');
    const letterText = document.querySelector('.book-letter-text');
    
    if (!letterTitle || !letterText) return;
    
    // 如果有收集到的证据，显示最后一个
    if (window.collectedEvidence.length > 0) {
        const lastEvidence = window.collectedEvidence[window.collectedEvidence.length - 1];
        showEvidenceDetail(lastEvidence);
    } else {
        // 默认显示
        letterTitle.textContent = '赫特里的信';
        letterText.innerHTML = `
            <p>在赫特里的房间中发现了这封被烧毁的信件残片。通过适当的化学药剂还原，信件上的字迹得以显现。</p>
            <p>信件内容：</p>
            <p>"...约定的时间即将到来，货物已准备妥当。老地方见，记住，不要告诉任何人，特别是那个爱管闲事的侦探..."</p>
            <p>信件没有署名，但从纸张质量和墨水分析来看，与赫特里书房的其他信件一致。这封信可能是他试图销毁的重要证据。</p>
        `;
    }
}

// ==================== 场景切换时加载相应场景 ====================
// 修改现有的showScene函数
const originalShowScene = window.showScene;
window.showScene = function(sceneName) {
    // 调用原始函数
    originalShowScene.apply(this, arguments);
    
    // 根据场景名称初始化特定场景
    switch(sceneName) {
        case 'blood-scene':
            setTimeout(initBloodScene, 100);
            break;
        case 'exhibition-scene':
            setTimeout(initExhibitionScene, 100);
            break;
        case 'desk-scene':
            setTimeout(initDeskScene, 100);
            break;
        case 'police-collection1-scene':
            setTimeout(initPoliceCollection1, 100);
            break;
        case 'police-collection2-scene':
            setTimeout(initPoliceCollection2, 100);
            break;
        case 'debate-scene': // 新增：辩论赛场景
            setTimeout(initDebateScene, 100);
            break;
        case 'fighting-scene': // 新增：自由搏击场景
            console.log('切换到自由搏击场景');
            break;
        case 'confrontation-scene': // 新增：对峙小游戏场景
            console.log('切换到对峙小游戏场景');
            setTimeout(initConfrontationGame, 100);
            break;
    }
    
    return true;
};

// ==================== 在地图系统中添加三个新场景 ====================
// 扩展地图系统的goToLocation函数
if (typeof window.mapSystem !== 'undefined') {
    const originalGoToLocation = window.mapSystem.goToLocation;
    window.mapSystem.goToLocation = function(location) {
        // 处理三个新场景
        switch(location) {
            case 'blood-scene':
                window.currentScene = 'blood-scene';
                showScene('blood-scene');
                return;
            case 'exhibition-scene':
                window.currentScene = 'exhibition-scene';
                showScene('exhibition-scene');
                return;
            case 'desk-scene':
                window.currentScene = 'desk-scene';
                showScene('desk-scene');
                return;
        }
        
        // 原有逻辑
        if (originalGoToLocation) {
            originalGoToLocation.apply(this, arguments);
        }
    };
}

// ==================== 初始化存档系统 ====================
document.addEventListener('DOMContentLoaded', function() {
    // 创建存档系统实例
    window.gameSaveSystem = new GameSaveSystem();
    
    // 设置自动保存
    setupAutoSave();
    
    // 绑定手动保存按钮
    const newSaveBtn = document.getElementById('new-save-btn');
    if (newSaveBtn) {
        newSaveBtn.addEventListener('click', function() {
            if (window.gameSaveSystem) {
                window.gameSaveSystem.createSave(false);
            }
        });
    }
    
    // 初始渲染存档列表
    setTimeout(() => {
        if (window.gameSaveSystem) {
            window.gameSaveSystem.renderSaveList();
        }
    }, 1000);
});

// ==================== 地图系统修改部分 ====================
if (typeof window.mapSystem === 'undefined') {
    window.mapSystem = {
        init: function() {
            console.log('初始化地图系统...');
            this.setupEventListeners();
        },
        
        setupEventListeners: function() {
            // 绑定地点按钮点击事件
            document.querySelectorAll('.goto-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const location = btn.dataset.location;
                    this.goToLocation(location);
                });
            });
        },
        
        goToLocation: function(location) {
            console.log('前往地点:', location);
            
            // 关闭地图面板
            closeAllPanels();
            
            // 根据地点跳转到对应场景
            switch(location) {
                case 'baker-street':
                    // 贝克街对应办公室场景
                    window.currentScene = 'office';
                    window.currentDialogueIndex = window.storyScript.findIndex(d => d.scene === 'office');
                    showScene('office');
                    break;
                    
                case 'police-station':
                    // 警察局对应警察局场景
                    window.currentScene = 'police-station';
                    window.currentDialogueIndex = window.storyScript.findIndex(d => d.scene === 'police-station');
                    showScene('police-station');
                    break;
                    
                case 'woodman-manor':
                    // 伍德曼庄园对应楼梯或案发现场场景
                    window.currentScene = 'stairs';
                    window.currentDialogueIndex = window.storyScript.findIndex(d => d.scene === 'stairs');
                    showScene('stairs');
                    break;
                    
                case 'tavern':
                    // 老酒馆对应酒吧场景
                    window.currentScene = 'bar';
                    window.currentDialogueIndex = window.storyScript.findIndex(d => d.scene === 'bar');
                    showScene('bar');
                    break;
                    
                default:
                    console.log('未知地点:', location);
                    return;
            }
            
            // 显示该场景的第一段对话
            setTimeout(() => {
                showCurrentDialogue();
            }, 500);
        }
    };
}

// ==================== 人物收集系统 ====================
function collectCharacter(characterData) {
    if (!characterData || !characterData.id || !characterData.name) {
        console.error('无效的人物数据');
        return;
    }
    
    // 检查是否已收集
    const alreadyCollected = window.encounteredCharacters.find(c => c.id === characterData.id);
    if (alreadyCollected) {
        console.log('人物已收集:', characterData.name);
        return;
    }
    
    // 添加到收集列表
    window.encounteredCharacters.push(characterData);
    console.log('新人物收集:', characterData.name);
    
    // 更新书页显示
    updateBookPage1();
}

// ==================== 更新书页面板 ====================
function updateBookPage1() {
    const portraitGrid = document.querySelector('.portrait-grid');
    if (!portraitGrid) return;
    
    // 清空现有内容
    portraitGrid.innerHTML = '';
    
    // 按照收集顺序显示人物
    window.encounteredCharacters.forEach((character, index) => {
        if (index >= 9) return; // 只显示前9个
        
        const slot = document.createElement('div');
        slot.className = 'portrait-slot filled';
        slot.dataset.id = character.id;
        slot.dataset.name = character.name;
        
        slot.innerHTML = `
            <div class="portrait-number">${index + 1}</div>
        `;
        
        // 点击显示详细信息
        slot.addEventListener('click', function() {
            const characterName = document.querySelector('.book-character-name');
            const characterDescription = document.querySelector('.book-character-description');
            
            if (characterName) characterName.textContent = character.name;
            if (characterDescription) {
                characterDescription.innerHTML = `
                    <p>${character.description || '暂无详细描述'}</p>
                    <p>首次遇见：${character.firstEncounter || '未知时间'}</p>
                    <p>身份：${character.role || '未知'}</p>
                    <p>与案件关系：${character.relation || '未知'}</p>
                `;
            }
        });
        
        portraitGrid.appendChild(slot);
    });
    
    // 填充剩余的空位
    const remainingSlots = 9 - Math.min(window.encounteredCharacters.length, 9);
    for (let i = 0; i < remainingSlots; i++) {
        const slot = document.createElement('div');
        slot.className = 'portrait-slot';
        slot.innerHTML = `<div class="portrait-number">?</div>`;
        portraitGrid.appendChild(slot);
    }
}

// ==================== 核心游戏功能 ====================
function initGame() {
    console.log('初始化游戏...');
    
    // 显示初始场景
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
            e.target.closest('#experiment-scene') ||
            e.target.closest('#chemical-reveal') ||
            e.target.closest('#map-panel') ||
            e.target.closest('#book-panel') ||
            e.target.closest('#save-panel') ||
            e.target.closest('#music-panel') ||
            e.target.closest('.collection-options')) { // 添加排除收集选项
            return;
        }
        
        // 推进对话
        advanceDialogue();
    });
    
    // 在警察局场景添加收集选项
    setTimeout(() => {
        addCollectionOptionsToPoliceStation();
    }, 1000);
}

function showCurrentDialogue() {
    if (window.currentDialogueIndex >= window.storyScript.length) {
        console.log('对话结束');
        return;
    }
    
    const dialogue = window.storyScript[window.currentDialogueIndex];
    
    // 更新场景
    if (dialogue.scene !== window.currentScene) {
        showScene(dialogue.scene);
        window.currentScene = dialogue.scene;
    }
    
    // 更新对话显示
    updateDialogueDisplay(dialogue);
    
    // 更新角色
    updateCharacters(dialogue);
}

function updateDialogueDisplay(dialogue) {
    const sceneElement = document.getElementById(`${window.currentScene}-scene`);
    if (!sceneElement) return;
    
    const dialogueElement = sceneElement.querySelector('.dialogue-system');
    if (dialogueElement) {
        const speakerElement = dialogueElement.querySelector('.speaker-name');
        const textElement = dialogueElement.querySelector('.dialogue-text');
        
        if (speakerElement) speakerElement.textContent = dialogue.speaker;
        if (textElement) textElement.textContent = dialogue.text;
    }
    
    // 检查是否为新人物的对话
    if (dialogue.speaker && dialogue.speaker !== "福尔摩斯" && dialogue.speaker !== "华生") {
        // 检查这个说话者是否已经收集过
        const existingCharacter = window.encounteredCharacters.find(c => c.name === dialogue.speaker);
        
        if (!existingCharacter) {
            // 收集新人物
            const characterData = {
                id: `character_${Date.now()}`,
                name: dialogue.speaker,
                firstEncounter: new Date().toLocaleString(),
                description: `在对话中首次遇见${dialogue.speaker}`,
                role: '案件相关人员',
                relation: '待查明'
            };
            collectCharacter(characterData);
        }
    }
}

function updateCharacters(dialogue) {
    const sceneElement = document.getElementById(`${window.currentScene}-scene`);
    if (!sceneElement) return;
    
    // 更新左侧角色
    if (dialogue.leftCharacter) {
        const leftCharElement = sceneElement.querySelector('.character:first-child');
        if (leftCharElement) {
            const character = window.leftCharacters[dialogue.leftCharacter];
            if (character) {
                leftCharElement.className = `character ${dialogue.leftCharacter}`;
                leftCharElement.querySelector('.character-name').textContent = character.name;
                leftCharElement.querySelector('.character-name').style.color = character.color;
                
                // 更新角色图片
                const characterImage = leftCharElement.querySelector('.character-image');
                if (characterImage && character.imageUrl) {
                    characterImage.style.backgroundImage = `url('${character.imageUrl}')`;
                }
                
                if (dialogue.activeCharacter === 'left') {
                    leftCharElement.classList.add('active');
                    leftCharElement.classList.remove('inactive');
                } else {
                    leftCharElement.classList.remove('active');
                    leftCharElement.classList.add('inactive');
                }
            }
        }
    }
    
    // 更新右侧角色
    if (dialogue.rightCharacter) {
        const rightCharElement = sceneElement.querySelector('.character:last-child');
        if (rightCharElement) {
            const character = window.rightCharacters[dialogue.rightCharacter];
            if (character) {
                rightCharElement.className = `character ${dialogue.rightCharacter}`;
                rightCharElement.querySelector('.character-name').textContent = character.name;
                rightCharElement.querySelector('.character-name').style.color = character.color;
                
                // 更新角色图片
                const characterImage = rightCharElement.querySelector('.character-image');
                if (characterImage && character.imageUrl) {
                    characterImage.style.backgroundImage = `url('${character.imageUrl}')`;
                }
                
                if (dialogue.activeCharacter === 'right') {
                    rightCharElement.classList.add('active');
                    rightCharElement.classList.remove('inactive');
                } else {
                    rightCharElement.classList.remove('active');
                    rightCharElement.classList.add('inactive');
                }
            }
        }
    }
}

function advanceDialogue() {
    window.currentDialogueIndex++;
    
    // 检查特殊场景
    if (window.currentDialogueIndex === window.storyScript.findIndex(d => d.scene === "door")) {
        initDoorDetection();
        return;
    }
    
    if (window.currentDialogueIndex === window.storyScript.findIndex(d => d.scene === "experiment")) {
        initChemicalExperiment();
        return;
    }
    
    if (window.currentDialogueIndex < window.storyScript.length) {
        showCurrentDialogue();
    }
}

// ==================== 控制面板系统（修复版）====================
function initControlPanels() {
    console.log('初始化控制面板系统（修复版）...');
    
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

    const bookToggleBtn = document.getElementById('book-toggle-btn');
    const bookPanel = document.getElementById('book-panel');
    const bookPanelClose = document.getElementById('book-panel-close');

    // 确保所有面板初始状态正确
    [musicPanel, savePanel, mapPanel, bookPanel].forEach(panel => {
        if (panel) {
            panel.style.display = 'none';
            panel.classList.remove('active');
        }
    });

    // 音乐面板
    if (musicToggleBtn && musicPanel) {
        musicToggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('音乐面板按钮点击');
            
            const isActive = musicPanel.classList.contains('active');
            closeAllPanels();
            
            if (!isActive) {
                musicPanel.style.display = 'block';
                setTimeout(() => musicPanel.classList.add('active'), 10);
            }
        });
        
        if (musicPanelClose) {
            musicPanelClose.addEventListener('click', function(e) {
                e.stopPropagation();
                musicPanel.classList.remove('active');
                setTimeout(() => musicPanel.style.display = 'none', 300);
            });
        }
    }

    // 存档面板
    if (saveToggleBtn && savePanel) {
        saveToggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('存档面板按钮点击');
            
            const isActive = savePanel.classList.contains('active');
            closeAllPanels();
            
            if (!isActive) {
                savePanel.style.display = 'block';
                setTimeout(() => {
                    savePanel.classList.add('active');
                    if (window.gameSaveSystem) {
                        window.gameSaveSystem.renderSaveList();
                    }
                }, 10);
            }
        });
        
        if (savePanelClose) {
            savePanelClose.addEventListener('click', function(e) {
                e.stopPropagation();
                savePanel.classList.remove('active');
                setTimeout(() => savePanel.style.display = 'none', 300);
            });
        }
    }

    // 地图面板
    if (mapToggleBtn && mapPanel) {
        mapToggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('地图面板按钮点击');
            
            const isActive = mapPanel.classList.contains('active');
            closeAllPanels();
            
            if (!isActive) {
                mapPanel.style.display = 'block';
                setTimeout(() => {
                    mapPanel.classList.add('active');
                    initMapTabs();
                }, 10);
            }
        });
        
        if (mapPanelClose) {
            mapPanelClose.addEventListener('click', function(e) {
                e.stopPropagation();
                mapPanel.classList.remove('active');
                setTimeout(() => mapPanel.style.display = 'none', 300);
            });
        }
    }

    // 书展面板
    if (bookToggleBtn && bookPanel) {
        bookToggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('书展面板按钮点击');
            
            const isActive = bookPanel.classList.contains('active');
            closeAllPanels();
            
            if (!isActive) {
                bookPanel.style.display = 'block';
                setTimeout(() => {
                    bookPanel.classList.add('active');
                    initBookPanel();
                }, 10);
            }
        });
        
        if (bookPanelClose) {
            bookPanelClose.addEventListener('click', function(e) {
                e.stopPropagation();
                bookPanel.classList.remove('active');
                setTimeout(() => bookPanel.style.display = 'none', 300);
            });
        }
    }

    // 点击外部关闭面板（优化版）
    document.addEventListener('click', function(e) {
        const isControlButton = e.target.closest('.control-btn');
        const isPanel = e.target.closest('.control-panel');
        const isPanelClose = e.target.closest('.panel-close');
        
        // 如果点击的是关闭按钮，不执行外部点击逻辑
        if (isPanelClose) return;
        
        // 如果点击的不是控制按钮或面板内部，关闭所有面板
        if (!isControlButton && !isPanel) {
            closeAllPanels();
        }
    });

    // ESC键关闭所有面板
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            closeAllPanels();
        }
    });

    console.log('控制面板系统初始化完成');
}

// 关闭所有面板的修复函数
function closeAllPanels() {
    console.log('关闭所有面板');
    
    const panels = [
        document.getElementById('music-panel'),
        document.getElementById('save-panel'),
        document.getElementById('map-detail-modal'),
        document.getElementById('book-panel')
    ];
    
    panels.forEach(panel => {
        if (panel) {
            panel.classList.remove('active');
            // 添加过渡动画后再隐藏
            setTimeout(() => {
                panel.style.display = 'none';
            }, 300);
        }
    });
}

function closeAllPanels() {
    ['music-panel', 'save-panel', 'map-detail-modal', 'book-panel'].forEach(id => {
        const panel = document.getElementById(id);
        if (panel) panel.classList.remove('active');
    });
}

function initMapTabs() {
    const tabs = document.querySelectorAll('.detail-tab');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            const targetPane = document.getElementById(tabId + '-tab');
            if (targetPane) targetPane.classList.add('active');
        });
    });
}

function initBookPanel() {
    const bookTabs = document.querySelectorAll('.book-tab');
    const bookPages = document.querySelectorAll('.book-page');

    bookTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            bookTabs.forEach(t => t.classList.remove('active'));
            bookPages.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            const pageId = this.id.replace('book-tab', 'book-page');
            const targetPage = document.getElementById(pageId);
            if (targetPage) targetPage.classList.add('active');
        });
    });
}

// ==================== 音乐系统 ====================
function initMusicSystem() {
    console.log('初始化音乐系统...');
    
    // 创建全局音乐播放器
    window.globalMusicPlayer = new GlobalMusicPlayer();
    
    // 绑定音乐控制事件
    const musicSelect = document.getElementById('music-select');
    const playMusicBtn = document.getElementById('play-music');
    const stopMusicBtn = document.getElementById('stop-music');
    const volumeSlider = document.getElementById('music-volume-slider');
    
    if (musicSelect) {
        musicSelect.addEventListener('change', function() {
            window.globalMusicPlayer.changeMusic(this.value);
            if (this.value !== 'none') {
                setTimeout(() => {
                    window.globalMusicPlayer.play();
                }, 500);
            } else {
                window.globalMusicPlayer.stop();
            }
        });
    }
    
    if (playMusicBtn) {
        playMusicBtn.addEventListener('click', function() {
            if (window.globalMusicPlayer.isPlaying) {
                window.globalMusicPlayer.pause();
                this.innerHTML = '<i class="fas fa-play"></i> 播放';
            } else {
                window.globalMusicPlayer.play();
                this.innerHTML = '<i class="fas fa-pause"></i> 暂停';
            }
        });
    }
    
    if (stopMusicBtn) {
        stopMusicBtn.addEventListener('click', function() {
            window.globalMusicPlayer.stop();
            if (playMusicBtn) {
                playMusicBtn.innerHTML = '<i class="fas fa-play"></i> 播放';
            }
        });
    }
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            window.globalMusicPlayer.setVolume(this.value / 100);
        });
    }
}

class GlobalMusicPlayer {
    constructor() {
        this.audio = document.getElementById('global-music') || this.createAudioElement();
        this.currentMusic = null;
        this.isPlaying = false;
        this.volume = 0.3;
        this.audio.volume = this.volume;
    }
    
    createAudioElement() {
        const audio = document.createElement('audio');
        audio.id = 'global-music';
        audio.loop = true;
        document.body.appendChild(audio);
        return audio;
    }

    changeMusic(musicType) {
        if (this.currentMusic === musicType) return;
        this.currentMusic = musicType;
        
        let musicUrl = '';
        if (musicType === 'music1') {
            musicUrl = 'https://assets.mixkit.co/music/preview/mixkit-mysterious-space-1173.mp3';
        } else if (musicType === 'music2') {
            musicUrl = 'https://assets.mixkit.co/music/preview/mixkit-sad-classical-piano-667.mp3';
        }
        
        if (musicUrl) {
            this.audio.src = musicUrl;
            this.audio.load();
        }
    }

    play() {
        if (this.currentMusic && this.currentMusic !== 'none') {
            this.audio.play().then(() => {
                this.isPlaying = true;
            }).catch(error => {
                console.log('播放被阻止:', error);
            });
        }
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
    }

    setVolume(volume) {
        this.volume = volume;
        this.audio.volume = volume;
        const volumeValue = document.getElementById('music-volume-value');
        if (volumeValue) {
            volumeValue.textContent = Math.round(volume * 100) + '%';
        }
    }
}

// ==================== 门锁检测系统 ====================
function initDoorDetection() {
    console.log('初始化门锁检测系统');
    showScene("door");
    
    // 重置状态
    window.doorDetectedAreas = new Set();
    window.doorOpened = false;
    window.doorCompleted = false;
    
    // 获取元素
    const doorContainer = document.getElementById('doorContainer');
    const suspiciousAreas = document.querySelectorAll('.suspicious-area');
    const resultItems = document.querySelectorAll('.result-item');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const doorOpenBtn = document.getElementById('doorOpenBtn');
    const resetBtn = document.getElementById('resetBtn');
    const hint = document.getElementById('hint');
    
    if (!doorContainer) {
        console.error('门锁检测元素未找到');
        return;
    }
    
    // 重置所有状态
    function resetDoorDetection() {
        suspiciousAreas.forEach(area => area.classList.remove('active'));
        resultItems.forEach(item => item.classList.remove('active'));
        window.doorDetectedAreas.clear();
        if (doorOpenBtn) doorOpenBtn.style.display = 'none';
        if (progressBar) progressBar.style.width = '0%';
        if (progressText) progressText.textContent = '检测进度: 0%';
        if (hint) hint.textContent = '点击门锁上的标记区域进行检测';
    }
    
    // 更新提示
    function updateHint(message) {
        if (hint) hint.textContent = message;
    }
    
    // 更新进度
    function updateProgress() {
        const progress = Math.round((window.doorDetectedAreas.size / 3) * 100);
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `检测进度: ${progress}%`;
    }
    
    // 检查是否完成
    function checkDoorCompletion() {
        if (window.doorDetectedAreas.size === 3) {
            if (doorOpenBtn) doorOpenBtn.style.display = 'block';
            updateHint('所有区域检测完成！可以打开门了');
            window.doorCompleted = true;
        }
    }
    
    // 可疑区域点击事件
    suspiciousAreas.forEach(area => {
        area.addEventListener('click', function() {
            const areaId = this.getAttribute('data-id');
            
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                window.doorDetectedAreas.delete(areaId);
                document.querySelector(`.result-item[data-id="${areaId}"]`)?.classList.remove('active');
            } else {
                this.classList.add('active');
                window.doorDetectedAreas.add(areaId);
                document.querySelector(`.result-item[data-id="${areaId}"]`)?.classList.add('active');
                updateHint(`已检测区域 ${areaId}`);
            }
            
            updateProgress();
            checkDoorCompletion();
        });
    });
    
    // 开门按钮
    if (doorOpenBtn) {
        doorOpenBtn.addEventListener('click', function() {
            if (!window.doorCompleted) return;
            
            if (doorContainer) doorContainer.classList.add('open');
            window.doorOpened = true;
            updateHint('门正在打开...');
            
            setTimeout(() => {
                updateHint('门已打开！点击继续进入房间');
                window.doorCompleted = true;
            }, 1500);
        });
    }
    
    // 重置按钮
    if (resetBtn) {
        resetBtn.addEventListener('click', resetDoorDetection);
    }
    
    // 初始化
    resetDoorDetection();
}

// ==================== 化学实验系统 ====================
function initChemicalExperiment() {
    console.log('初始化化学实验系统');
    showScene("experiment");
    
    // 重置状态
    window.addedSequence = [];
    window.currentMixtureColor = null;
    window.mixtureHeight = 0;
    window.isExperimentComplete = false;
    
    // 初始化实验
    initExperiment();
}

function initExperiment() {
    console.log('开始化学实验...');
    
    // 创建试管
    createTestTubes();
    
    // 设置锥形瓶事件
    setupFlaskEvents();
    
    // 绑定按钮事件
    bindExperimentEvents();
    
    // 更新序列显示
    updateSequenceDisplay();
}

function createTestTubes() {
    const tubesContainer = document.querySelector('.test-tube-rack');
    if (!tubesContainer) return;
    
    tubesContainer.innerHTML = '';
    
    window.testTubes.forEach(tube => {
        const tubeElement = document.createElement('div');
        tubeElement.className = 'test-tube';
        tubeElement.id = `tube-${tube.id}`;
        tubeElement.draggable = true;
        tubeElement.dataset.id = tube.id;
        tubeElement.dataset.color = tube.color;
        tubeElement.dataset.name = tube.name;
        
        tubeElement.innerHTML = `
            <div class="tube-label">${tube.id}</div>
            <div class="tube-body">
                <div class="tube-liquid" style="background-color: ${tube.color}; height: ${tube.height};"></div>
            </div>
            <div class="tube-stand"></div>
        `;
        
        tubeElement.addEventListener('dragstart', handleDragStart);
        tubesContainer.appendChild(tubeElement);
    });
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
    e.target.classList.add('dragging');
}

function setupFlaskEvents() {
    const flask = document.getElementById('flask');
    if (!flask) return;
    
    flask.addEventListener('dragover', handleDragOver);
    flask.addEventListener('drop', handleDrop);
    flask.addEventListener('dragleave', handleDragLeave);
}

function handleDragOver(e) {
    e.preventDefault();
    e.target.classList.add('dragover');
}

function handleDragLeave(e) {
    e.target.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('dragover');
    
    const tubeId = parseInt(e.dataTransfer.getData('text/plain'));
    const draggingElement = document.querySelector('.test-tube.dragging');
    
    if (draggingElement) {
        draggingElement.classList.remove('dragging');
    }
    
    // 检查是否已添加
    if (window.addedSequence.includes(tubeId)) {
        showMessage(`试管 ${tubeId} 已经添加过了！`, 'error');
        return;
    }
    
    // 检查是否已满
    if (window.addedSequence.length >= 7) {
        showMessage('已经添加了7个试管，请验证顺序或重新开始', 'error');
        return;
    }
    
    // 添加到序列
    addToSequence(tubeId);
}

function addToSequence(tubeId) {
    window.addedSequence.push(tubeId);
    updateSequenceDisplay();
    
    // 获取试管信息
    const tube = window.testTubes.find(t => t.id === tubeId);
    updateMixtureColor(tube.color);
    
    // 更新混合液高度
    window.mixtureHeight += 12;
    const mixtureElement = document.getElementById('mixture');
    if (mixtureElement) {
        mixtureElement.style.height = `${window.mixtureHeight}%`;
    }
}

function updateSequenceDisplay() {
    const sequenceDisplay = document.getElementById('sequence-display');
    if (!sequenceDisplay) return;
    
    if (window.addedSequence.length === 0) {
        sequenceDisplay.innerHTML = '<div class="empty-sequence">暂无添加，请将试管拖拽到锥形瓶中</div>';
        return;
    }
    
    sequenceDisplay.innerHTML = '';
    
    window.addedSequence.forEach((tubeId, index) => {
        const tube = window.testTubes.find(t => t.id === tubeId);
        const sequenceItem = document.createElement('div');
        sequenceItem.className = 'sequence-item';
        sequenceItem.innerHTML = `
            <div class="sequence-color" style="background-color: ${tube.color};"></div>
            <div class="sequence-number">${index + 1}</div>
        `;
        sequenceDisplay.appendChild(sequenceItem);
    });
}

function updateMixtureColor(newColor) {
    if (!window.currentMixtureColor) {
        window.currentMixtureColor = newColor;
    } else {
        // 颜色混合
        const mixColor = blendColors(window.currentMixtureColor, newColor);
        window.currentMixtureColor = mixColor;
    }
    
    const mixtureElement = document.getElementById('mixture');
    if (mixtureElement) {
        mixtureElement.style.backgroundColor = window.currentMixtureColor;
    }
}

function blendColors(color1, color2) {
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
    
    const r = Math.floor((r1 + r2) / 2);
    const g = Math.floor((g1 + g2) / 2);
    const b = Math.floor((b1 + b2) / 2);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function bindExperimentEvents() {
    const checkBtn = document.getElementById('check-btn');
    const resetBtn = document.getElementById('reset-btn-exp');
    const returnBtn = document.getElementById('return-to-office-btn');
    
    if (checkBtn) {
        checkBtn.addEventListener('click', checkSequence);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetExperiment);
    }
    
    if (returnBtn) {
        returnBtn.addEventListener('click', function() {
            if (window.isExperimentComplete) {
                showScene("office");
                advanceDialogue();
            } else {
                showMessage('请先完成化学实验', 'error');
            }
        });
    }
}

function checkSequence() {
    if (window.addedSequence.length !== window.correctOrder.length) {
        showMessage(`您只添加了 ${window.addedSequence.length} 种试剂，需要添加 ${window.correctOrder.length} 种`, 'error');
        return;
    }
    
    // 检查顺序
    let isCorrect = true;
    for (let i = 0; i < window.correctOrder.length; i++) {
        if (window.addedSequence[i] !== window.correctOrder[i]) {
            isCorrect = false;
            break;
        }
    }
    
    if (isCorrect) {
        window.isExperimentComplete = true;
        showMessage('恭喜！化学药剂制备成功！', 'success');
    } else {
        showMessage('添加顺序不正确，请重新尝试', 'error');
    }
}

function resetExperiment() {
    window.addedSequence = [];
    window.currentMixtureColor = null;
    window.mixtureHeight = 0;
    
    const mixtureElement = document.getElementById('mixture');
    if (mixtureElement) {
        mixtureElement.style.height = '0';
        mixtureElement.style.backgroundColor = 'transparent';
    }
    
    updateSequenceDisplay();
}

// ==================== 辩论赛模拟器系统（完整整合） ====================
function initDebateScene() {
    console.log('初始化辩论赛模拟器');
    
    // 辩论数据
    const debateData = {
        options: [
            {
                id: 1,
                text: "AI提高生产效率，创造更多就业机会",
                affirmative: "人工智能将极大提高生产效率，解放人类劳动力，使人们有更多时间从事创造性工作。历史证明技术革命会创造新的就业岗位，AI时代同样如此。",
                negative: "AI可能导致大规模失业，特别是对低技能劳动者的冲击最大。AI创造的岗位需要高技能，转型困难会导致社会断层。",
                correct: false
            },
            {
                id: 2,
                text: "AI在医疗领域有巨大潜力",
                affirmative: "AI在医疗领域的应用已经展现出巨大潜力，能够帮助医生更准确地诊断疾病。AI是工具而非替代品，人类与AI协作能取得更好成果。",
                negative: "AI决策缺乏人类的情感和道德判断，可能带来不可预见的风险。技术发展速度远超监管能力，风险管控存在滞后性。",
                correct: false
            },
            {
                id: 3,
                text: "AI助力解决全球性问题",
                affirmative: "人工智能可以处理海量数据，帮助人类解决气候变化等复杂全球性问题。算法偏见可以通过更完善的数据和监管来解决。",
                negative: "AI系统可能存在算法偏见，加剧社会不平等问题。AI系统的黑箱特性使其决策难以审查，可能隐藏歧视和偏见。",
                correct: false
            },
            {
                id: 4,
                text: "AI推动经济创新与发展",
                affirmative: "AI将创造数万亿美元的经济价值，推动全球经济增长。AI技术成本正在下降，云计算使中小企业也能享受AI服务。",
                negative: "AI可能导致财富进一步集中，加剧贫富差距。AI垄断问题比传统垄断更严重，可能抑制创新和竞争。",
                correct: true  // 这是正确选项
            }
        ],
        finalOption: {
            id: 5,
            text: "AI是人类文明进步的必然选择",
            affirmative: "AI是第四次工业革命的核心，将全面提升人类生活质量。人类有成功管理核技术等高风险技术的经验，可以类似管理AI。国际合作可以确保AI发展惠及全人类，而非加剧不平等。",
            negative: "AI的潜在风险规模空前，可能威胁人类文明存续。利益驱动可能导致安全措施被忽视，直到灾难发生才采取行动。"
        },
        rebuttalOptions: [
            {
                id: 1,
                text: "数据反驳 - 引用相关研究数据",
                content: "根据世界经济论坛的报告，到2025年，AI将创造1200万个新工作岗位，远超其可能取代的750万个岗位。"
            },
            {
                id: 2,
                text: "逻辑反驳 - 指出对方逻辑漏洞",
                content: "您的论点存在滑坡谬误，从AI可能带来的风险直接推断风险大于机遇，忽视了技术进步的历史规律和社会适应能力。"
            },
            {
                id: 3,
                text: "实例反驳 - 引用成功案例",
                content: "以AlphaFold为例，AI在蛋白质结构预测方面的突破已经为生物医学研究带来革命性进展，这充分证明AI的积极影响。"
            },
            {
                id: 4,
                text: "价值反驳 - 强调人类价值观",
                content: "AI作为工具，其价值取决于如何使用。历史上每一项重大技术都有风险，但人类通过伦理规范和法律法规成功驾驭了这些技术。"
            }
        ],
        // 审讯室对话数据
        interrogationDialogs: [
            {
                speaker: "interrogator",
                text: "好了，辩论已经结束。现在我们需要谈谈你在这场辩论中表现出的问题。"
            },
            {
                speaker: "suspect",
                text: "什么问题？我只是在表达我的观点。"
            },
            {
                speaker: "interrogator",
                text: "你的论点中存在多处逻辑漏洞，特别是关于AI可能导致大规模失业的部分。"
            },
            {
                speaker: "suspect",
                text: "那些都是基于实际研究和数据的论点。"
            },
            {
                speaker: "interrogator",
                text: "但你没有考虑到技术发展会创造新的就业机会，这是历史已经证明的事实。"
            },
            {
                speaker: "suspect",
                text: "也许你是对的，但我仍然担心AI可能带来的风险。"
            },
            {
                speaker: "interrogator",
                text: "合理的担忧是必要的，但过度悲观会阻碍技术进步。我们需要平衡风险和机遇。"
            },
            {
                speaker: "suspect",
                text: "我明白了。这场辩论确实让我重新思考了这个问题。"
            }
        ]
    };

    // 当前辩论状态
    let currentState = {
        selectedOptions: [],
        currentRound: 0,
        gameCompleted: false,
        currentSelectedOption: null,
        selectedRebuttal: null,
        interrogationStep: 0
    };
    
    // DOM元素
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const rebuttalBtn = document.getElementById('rebuttal-btn');
    const interrogationBtn = document.getElementById('interrogation-btn');
    const affirmativeArgs = document.getElementById('affirmative-arguments');
    const negativeArgs = document.getElementById('negative-arguments');
    const affirmativeOptions = document.getElementById('affirmative-options');
    const victoryMessage = document.getElementById('victory-message');
    const rebuttalDialog = document.getElementById('rebuttal-dialog');
    const dialogOverlay = document.getElementById('dialog-overlay');
    const closeDialog = document.getElementById('close-dialog');
    const cancelDialog = document.getElementById('cancel-dialog');
    const submitRebuttal = document.getElementById('submit-rebuttal');
    const rebuttalOptions = document.getElementById('rebuttal-options');
    const dialogContent = document.getElementById('dialog-content');
    const affirmativeCurrentContent = document.getElementById('affirmative-current-content');
    const negativeCurrentContent = document.getElementById('negative-current-content');
    const interrogationScene = document.getElementById('interrogation-scene');
    const interrogatorDialog = document.getElementById('interrogator-dialog');
    const suspectDialog = document.getElementById('suspect-dialog');
    const continueInterrogationBtn = document.getElementById('continue-interrogation');
    const backToDebateBtn = document.getElementById('back-to-debate');
    
    // 开始辩论
    function startDebate() {
        resetDebate();
        createOptions();
        if (startBtn) startBtn.disabled = true;
        if (rebuttalBtn) rebuttalBtn.disabled = false;
        
        // 初始化当前论点对话框
        if (affirmativeCurrentContent) affirmativeCurrentContent.textContent = "请选择一个论点开始辩论...";
        if (negativeCurrentContent) negativeCurrentContent.textContent = "等待正方提出论点...";
    }
    
    // 创建选项按钮
    function createOptions() {
        if (!affirmativeOptions) return;
        affirmativeOptions.innerHTML = '';
        
        debateData.options.forEach(option => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'option-btn';
            optionBtn.textContent = option.text;
            optionBtn.dataset.id = option.id;
            
            optionBtn.addEventListener('click', function() {
                handleOptionSelection(option);
            });
            
            affirmativeOptions.appendChild(optionBtn);
        });
    }
    
    // 处理选项选择
    function handleOptionSelection(option) {
        if (currentState.gameCompleted) return;
        
        // 记录当前选择的选项
        currentState.currentSelectedOption = option;
        
        // 禁用所有选项按钮
        const allOptionBtns = document.querySelectorAll('#debate-scene .option-btn');
        allOptionBtns.forEach(btn => {
            btn.disabled = true;
        });
        
        // 记录已选选项
        currentState.selectedOptions.push(option.id);
        
        // 更新当前论点对话框
        if (affirmativeCurrentContent) affirmativeCurrentContent.textContent = option.affirmative;
        
        // 添加正方论点到历史记录
        addArgument('affirmative', option.affirmative);
        
        // 稍作延迟后添加反方反驳
        setTimeout(() => {
            // 更新反方当前论点对话框
            if (negativeCurrentContent) negativeCurrentContent.textContent = option.negative;
            
            // 添加反方论点到历史记录
            addArgument('negative', option.negative);
            
            // 检查是否选择了正确选项
            if (option.correct) {
                // 正确选项 - 进入下一阶段
                setTimeout(() => {
                    addFinalOption();
                }, 1000);
            } else {
                // 错误选项 - 重新启用未选择的选项
                setTimeout(() => {
                    enableRemainingOptions();
                }, 1000);
            }
        }, 800);
    }
    
    // 启用剩余的选项
    function enableRemainingOptions() {
        const allOptionBtns = document.querySelectorAll('#debate-scene .option-btn');
        allOptionBtns.forEach(btn => {
            if (!currentState.selectedOptions.includes(parseInt(btn.dataset.id))) {
                btn.disabled = false;
            }
        });
        
        // 重置当前论点对话框
        if (affirmativeCurrentContent) affirmativeCurrentContent.textContent = "请重新选择一个论点...";
        if (negativeCurrentContent) negativeCurrentContent.textContent = "等待正方重新选择论点...";
    }
    
    // 添加最终选项
    function addFinalOption() {
        if (!affirmativeOptions) return;
        
        const finalOptionBtn = document.createElement('button');
        finalOptionBtn.className = 'option-btn';
        finalOptionBtn.textContent = debateData.finalOption.text;
        finalOptionBtn.style.backgroundColor = '#2ecc71';
        
        finalOptionBtn.addEventListener('click', function() {
            // 禁用所有选项按钮
            const allOptionBtns = document.querySelectorAll('#debate-scene .option-btn');
            allOptionBtns.forEach(btn => {
                btn.disabled = true;
            });
            
            // 更新正方当前论点对话框
            if (affirmativeCurrentContent) affirmativeCurrentContent.textContent = debateData.finalOption.affirmative;
            
            // 添加正方最终论点
            addArgument('affirmative', debateData.finalOption.affirmative);
            
            // 稍作延迟后添加反方最终反驳
            setTimeout(() => {
                // 更新反方当前论点对话框
                if (negativeCurrentContent) negativeCurrentContent.textContent = debateData.finalOption.negative;
                
                // 添加反方最终反驳
                addArgument('negative', debateData.finalOption.negative);
                
                // 稍作延迟后显示胜利消息
                setTimeout(() => {
                    if (victoryMessage) victoryMessage.style.display = 'block';
                    currentState.gameCompleted = true;
                    if (rebuttalBtn) rebuttalBtn.disabled = true;
                    // 显示返回审讯室按钮
                    if (interrogationBtn) interrogationBtn.style.display = 'inline-block';
                }, 1000);
            }, 800);
        });
        
        affirmativeOptions.appendChild(finalOptionBtn);
        finalOptionBtn.disabled = false;
    }
    
    // 打开反驳对话框
    function openRebuttalDialog() {
        if (currentState.gameCompleted) return;
        
        // 清空之前的选项
        if (!rebuttalOptions) return;
        rebuttalOptions.innerHTML = '';
        
        // 添加反驳选项
        debateData.rebuttalOptions.forEach(option => {
            const optionEl = document.createElement('div');
            optionEl.className = 'rebuttal-option';
            optionEl.textContent = option.text;
            optionEl.dataset.id = option.id;
            
            optionEl.addEventListener('click', function() {
                // 移除之前选中的样式
                document.querySelectorAll('#debate-scene .rebuttal-option').forEach(el => {
                    el.style.backgroundColor = '#f8f9fa';
                });
                
                // 添加选中样式
                this.style.backgroundColor = '#3498db';
                this.style.color = 'white';
                
                // 记录选中的反驳选项
                currentState.selectedRebuttal = option;
            });
            
            rebuttalOptions.appendChild(optionEl);
        });
        
        // 显示对话框和遮罩层
        if (rebuttalDialog) rebuttalDialog.style.display = 'block';
        if (dialogOverlay) dialogOverlay.style.display = 'block';
    }
    
    // 关闭反驳对话框
    function closeRebuttalDialog() {
        if (rebuttalDialog) rebuttalDialog.style.display = 'none';
        if (dialogOverlay) dialogOverlay.style.display = 'none';
        currentState.selectedRebuttal = null;
    }
    
    // 处理反驳提交
    function handleRebuttalSubmission() {
        if (!currentState.selectedRebuttal) {
            alert('请先选择一个反驳策略！');
            return;
        }
        
        // 更新正方当前论点对话框
        if (affirmativeCurrentContent) affirmativeCurrentContent.textContent = currentState.selectedRebuttal.content;
        
        // 添加正方反驳论点
        addArgument('affirmative', currentState.selectedRebuttal.content);
        
        // 关闭对话框
        closeRebuttalDialog();
        
        // 稍作延迟后添加反方回应
        setTimeout(() => {
            let negativeResponse = "";
            
            // 根据当前选择的选项生成不同的反方回应
            if (currentState.currentSelectedOption) {
                if (currentState.currentSelectedOption.correct) {
                    negativeResponse = "您的反驳有一定道理，但AI带来的系统性风险仍然不容忽视。我们需要更严格的监管框架。";
                } else {
                    negativeResponse = "您的观点虽然有力，但未能完全解决AI可能带来的根本性问题。技术发展速度远超社会适应能力。";
                }
            } else {
                negativeResponse = "有趣的观点，但AI的风险远不止于此。我们需要更全面的风险评估。";
            }
            
            // 更新反方当前论点对话框
            if (negativeCurrentContent) negativeCurrentContent.textContent = negativeResponse;
            
            // 添加反方回应
            addArgument('negative', negativeResponse);
        }, 800);
    }
    
    // 显示审讯室场景
    function showInterrogationScene() {
        const debateArea = document.querySelector('#debate-scene .debate-area');
        const debateInfo = document.querySelector('#debate-scene .debate-info');
        const controls = document.querySelector('#debate-scene .controls');
        
        // 隐藏辩论区域和胜利消息
        if (debateArea) debateArea.style.display = 'none';
        if (debateInfo) debateInfo.style.display = 'none';
        if (victoryMessage) victoryMessage.style.display = 'none';
        if (controls) controls.style.display = 'none';
        
        // 显示审讯室场景
        if (interrogationScene) {
            interrogationScene.style.display = 'flex';
            
            // 重置审讯对话
            currentState.interrogationStep = 0;
            if (interrogatorDialog) interrogatorDialog.innerHTML = '';
            if (suspectDialog) suspectDialog.innerHTML = '';
            
            // 开始审讯对话
            continueInterrogation();
        }
    }
    
    // 继续审讯
    function continueInterrogation() {
        if (currentState.interrogationStep >= debateData.interrogationDialogs.length) {
            // 审讯结束
            if (continueInterrogationBtn) continueInterrogationBtn.disabled = true;
            return;
        }
        
        const dialog = debateData.interrogationDialogs[currentState.interrogationStep];
        const messageEl = document.createElement('div');
        messageEl.className = 'message';
        messageEl.textContent = dialog.text;
        
        if (dialog.speaker === 'interrogator') {
            messageEl.classList.add('interrogator-message');
            if (interrogatorDialog) interrogatorDialog.appendChild(messageEl);
        } else {
            messageEl.classList.add('suspect-message');
            if (suspectDialog) suspectDialog.appendChild(messageEl);
        }
        
        // 滚动到底部
        if (interrogatorDialog) interrogatorDialog.scrollTop = interrogatorDialog.scrollHeight;
        if (suspectDialog) suspectDialog.scrollTop = suspectDialog.scrollHeight;
        
        currentState.interrogationStep++;
        
        // 如果是最后一条消息，禁用继续按钮
        if (currentState.interrogationStep >= debateData.interrogationDialogs.length && continueInterrogationBtn) {
            continueInterrogationBtn.disabled = true;
        }
    }
    
    // 返回辩论场景
    function backToDebate() {
        // 隐藏审讯室场景
        if (interrogationScene) interrogationScene.style.display = 'none';
        
        // 显示辩论区域和控制按钮
        const debateArea = document.querySelector('#debate-scene .debate-area');
        const debateInfo = document.querySelector('#debate-scene .debate-info');
        const controls = document.querySelector('#debate-scene .controls');
        
        if (debateArea) debateArea.style.display = 'flex';
        if (debateInfo) debateInfo.style.display = 'block';
        if (controls) controls.style.display = 'block';
        
        // 重新启用继续审讯按钮
        if (continueInterrogationBtn) continueInterrogationBtn.disabled = false;
    }
    
    // 添加论点
    function addArgument(side, content) {
        const argumentsContainer = side === 'affirmative' ? affirmativeArgs : negativeArgs;
        if (!argumentsContainer) return;
        
        const argumentEl = document.createElement('div');
        argumentEl.className = 'argument';
        argumentEl.innerHTML = `
            <div class="content">${content}</div>
        `;
        
        argumentsContainer.appendChild(argumentEl);
        argumentsContainer.scrollTop = argumentsContainer.scrollHeight;
    }
    
    // 重置辩论
    function resetDebate() {
        currentState = {
            selectedOptions: [],
            currentRound: 0,
            gameCompleted: false,
            currentSelectedOption: null,
            selectedRebuttal: null,
            interrogationStep: 0
        };
        
        if (affirmativeArgs) affirmativeArgs.innerHTML = '';
        if (negativeArgs) negativeArgs.innerHTML = '';
        if (affirmativeOptions) affirmativeOptions.innerHTML = '';
        if (victoryMessage) victoryMessage.style.display = 'none';
        if (startBtn) startBtn.disabled = false;
        if (rebuttalBtn) rebuttalBtn.disabled = true;
        if (interrogationBtn) interrogationBtn.style.display = 'none';
        
        // 清空当前论点对话框
        if (affirmativeCurrentContent) affirmativeCurrentContent.textContent = "";
        if (negativeCurrentContent) negativeCurrentContent.textContent = "";
        
        // 确保辩论区域和控件可见
        const debateArea = document.querySelector('#debate-scene .debate-area');
        const debateInfo = document.querySelector('#debate-scene .debate-info');
        const controls = document.querySelector('#debate-scene .controls');
        
        if (debateArea) debateArea.style.display = 'flex';
        if (debateInfo) debateInfo.style.display = 'block';
        if (controls) controls.style.display = 'block';
        if (interrogationScene) interrogationScene.style.display = 'none';
    }
    
    // 初始化事件监听器
    function initEventListeners() {
        // 开始辩论按钮事件
        if (startBtn) {
            startBtn.addEventListener('click', startDebate);
        }
        
        // 重置按钮事件
        if (resetBtn) {
            resetBtn.addEventListener('click', resetDebate);
        }
        
        // 反驳按钮事件
        if (rebuttalBtn) {
            rebuttalBtn.addEventListener('click', openRebuttalDialog);
        }
        
        // 审讯室按钮事件
        if (interrogationBtn) {
            interrogationBtn.addEventListener('click', showInterrogationScene);
        }
        
        // 继续审讯按钮事件
        if (continueInterrogationBtn) {
            continueInterrogationBtn.addEventListener('click', continueInterrogation);
        }
        
        // 返回辩论按钮事件
        if (backToDebateBtn) {
            backToDebateBtn.addEventListener('click', backToDebate);
        }
        
        // 对话框事件
        if (closeDialog) {
            closeDialog.addEventListener('click', closeRebuttalDialog);
        }
        
        if (cancelDialog) {
            cancelDialog.addEventListener('click', closeRebuttalDialog);
        }
        
        if (submitRebuttal) {
            submitRebuttal.addEventListener('click', handleRebuttalSubmission);
        }
        
        // 点击遮罩层关闭对话框
        if (dialogOverlay) {
            dialogOverlay.addEventListener('click', closeRebuttalDialog);
        }
    }
    
    // 初始化函数
    function init() {
        console.log('初始化辩论赛模拟器事件监听器');
        initEventListeners();
        resetDebate();
    }
    
    // 执行初始化
    init();
}

// ==================== 确保所有功能可用 ====================
// 添加到全局作用域
window.initGame = initGame;
window.initControlPanels = initControlPanels;
window.initMusicSystem = initMusicSystem;
window.initDoorDetection = initDoorDetection;
window.initChemicalExperiment = initChemicalExperiment;
window.showScene = showScene;
window.advanceDialogue = advanceDialogue;
window.showMessage = showMessage;
window.closeAllPanels = closeAllPanels;
window.collectCharacter = collectCharacter;
window.collectEvidence = collectEvidence;
window.updateBookPage1 = updateBookPage1;
window.updateBookPage2 = updateBookPage2;
window.initPoliceCollection1 = initPoliceCollection1;
window.initPoliceCollection2 = initPoliceCollection2;
window.addCollectionOptionsToPoliceStation = addCollectionOptionsToPoliceStation;
window.initDebateScene = initDebateScene; // 新增辩论赛场景初始化函数
window.startFightingMinigame = startFightingMinigame; // 新增自由搏击游戏启动函数
window.startConfrontationMinigame = startConfrontationMinigame; // 新增对峙小游戏启动函数
window.initConfrontationGame = initConfrontationGame; // 新增对峙小游戏初始化函数
window.FightingGame = FightingGame; // 暴露自由搏击游戏类

console.log('游戏系统完整加载完成！');
// ==================== 系统优化和问题修复 ====================

// ==================== 核心场景管理器 ====================
class SceneManager {
    constructor() {
        this.currentScene = 'office';
        this.isTransitioning = false;
        this.sceneStack = [];
    }
    
    // 安全的场景切换函数
    switchToScene(sceneName, skipHistory = false) {
        if (this.isTransitioning) {
            console.log('场景切换中，请稍候...');
            return false;
        }
        
        // 验证场景是否存在
        const sceneElement = document.getElementById(`${sceneName}-scene`);
        if (!sceneElement) {
            console.error(`场景 ${sceneName} 不存在`);
            return false;
        }
        
        this.isTransitioning = true;
        
        // 保存当前场景到历史栈（除非明确跳过）
        if (!skipHistory && this.currentScene !== sceneName) {
            this.sceneStack.push(this.currentScene);
        }
        
        // 关闭所有面板
        this.closeAllPanels();
        
        // 切换场景
        const result = this.showScene(sceneName);
        
        // 延迟重置过渡状态
        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
        
        return result;
    }
    
    // 返回上一个场景
    goBack() {
        if (this.sceneStack.length > 0) {
            const previousScene = this.sceneStack.pop();
            return this.switchToScene(previousScene, true);
        }
        return false;
    }
    
    // 核心场景显示函数
    showScene(sceneName) {
        try {
            // 隐藏所有场景
            document.querySelectorAll('.scene').forEach(scene => {
                scene.classList.remove('active');
                scene.style.display = 'none';
            });
            
            // 显示目标场景
            const targetScene = document.getElementById(`${sceneName}-scene`);
            if (targetScene) {
                targetScene.style.display = 'block';
                setTimeout(() => {
                    targetScene.classList.add('active');
                }, 10);
                
                this.currentScene = sceneName;
                console.log(`场景切换到: ${sceneName}`);
                
                // 初始化特定场景功能
                this.initSceneSpecificFeatures(sceneName);
                
                return true;
            }
        } catch (error) {
            console.error('场景切换错误:', error);
        }
        
        return false;
    }
    
    // 初始化特定场景的功能
    initSceneSpecificFeatures(sceneName) {
        const initFunctions = {
            'blood-scene': () => setTimeout(initBloodScene, 100),
            'exhibition-scene': () => setTimeout(initExhibitionScene, 100),
            'desk-scene': () => setTimeout(initDeskScene, 100),
            'police-collection1-scene': () => setTimeout(initPoliceCollection1, 100),
            'police-collection2-scene': () => setTimeout(initPoliceCollection2, 100),
            'debate-scene': () => setTimeout(initDebateScene, 100),
            'confrontation-scene': () => setTimeout(initConfrontationGame, 100),
            'fighting-scene': () => {
                console.log('初始化自由搏击场景');
                if (window.fightingGame && typeof window.fightingGame.init === 'function') {
                    setTimeout(() => window.fightingGame.init(), 100);
                }
            }
        };
        
        if (initFunctions[sceneName]) {
            initFunctions[sceneName]();
        }
    }
    
    // 关闭所有控制面板
    closeAllPanels() {
        const panels = ['music-panel', 'save-panel', 'map-detail-modal', 'book-panel'];
        panels.forEach(panelId => {
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.classList.remove('active');
                panel.style.display = 'none';
            }
        });
    }
}

// ==================== 对话系统优化 ====================
class DialogueManager {
    constructor() {
        this.currentIndex = 0;
        this.storyScript = window.storyScript || [];
    }
    
    // 安全推进对话
    advanceDialogue() {
        if (this.currentIndex >= this.storyScript.length - 1) {
            console.log('对话已结束');
            return false;
        }
        
        this.currentIndex++;
        return this.showCurrentDialogue();
    }
    
    // 显示当前对话
    showCurrentDialogue() {
        const dialogue = this.storyScript[this.currentIndex];
        if (!dialogue) return false;
        
        // 处理特殊动作
        if (dialogue.action) {
            return this.handleSpecialAction(dialogue.action);
        }
        
        // 切换场景（如果需要）
        if (dialogue.scene && dialogue.scene !== (window.sceneManager ? window.sceneManager.currentScene : window.currentScene)) {
            if (window.sceneManager) {
                window.sceneManager.switchToScene(dialogue.scene);
            } else {
                showScene(dialogue.scene);
            }
        }
        
        // 更新对话显示
        this.updateDialogueDisplay(dialogue);
        this.updateCharacters(dialogue);
        
        return true;
    }
    
    // 处理特殊动作
    handleSpecialAction(action) {
        const actions = {
            'startFightingGame': () => {
                if (window.sceneManager) {
                    window.sceneManager.switchToScene('fighting-scene');
                } else {
                    showScene('fighting-scene');
                    if (window.fightingGame && typeof window.fightingGame.init === 'function') {
                        setTimeout(() => window.fightingGame.init(), 100);
                    }
                }
                return true;
            },
            'startConfrontation': () => {
                if (window.sceneManager) {
                    window.sceneManager.switchToScene('confrontation-scene');
                } else {
                    showScene('confrontation-scene');
                    setTimeout(initConfrontationGame, 100);
                }
                return true;
            },
            'switchToStairs': () => window.sceneManager ? window.sceneManager.switchToScene('stairs') : showScene('stairs'),
            'switchToBloodScene': () => window.sceneManager ? window.sceneManager.switchToScene('blood-scene') : showScene('blood-scene'),
            'switchToExhibitionScene': () => window.sceneManager ? window.sceneManager.switchToScene('exhibition-scene') : showScene('exhibition-scene'),
            'switchToDeskScene': () => window.sceneManager ? window.sceneManager.switchToScene('desk-scene') : showScene('desk-scene'),
            'switchToExperimentScene': () => window.sceneManager ? window.sceneManager.switchToScene('experiment-scene') : showScene('experiment-scene'),
            'switchToPoliceStation': () => window.sceneManager ? window.sceneManager.switchToScene('police-station') : showScene('police-station'),
            'switchToPoliceCollection1': () => window.sceneManager ? window.sceneManager.switchToScene('police-collection1-scene') : showScene('police-collection1-scene'),
            'switchToPoliceCollection2': () => window.sceneManager ? window.sceneManager.switchToScene('police-collection2-scene') : showScene('police-collection2-scene'),
            'switchToBedroom': () => window.sceneManager ? window.sceneManager.switchToScene('bedroom-scene') : showScene('bedroom-scene'),
            'switchToDebateScene': () => window.sceneManager ? window.sceneManager.switchToScene('debate-scene') : showScene('debate-scene'),
            'switchToCrimeScene': () => window.sceneManager ? window.sceneManager.switchToScene('crime-scene') : showScene('crime-scene'),
            'switchToBarScene': () => window.sceneManager ? window.sceneManager.switchToScene('bar-scene') : showScene('bar-scene'),
            'switchToOfficeAfterBar': () => window.sceneManager ? window.sceneManager.switchToScene('office2') : showScene('office2'),
            'switchToInvestigation': () => window.sceneManager ? window.sceneManager.switchToScene('investigation-scene') : showScene('investigation-scene')
        };
        
        if (actions[action]) {
            return actions[action]();
        }
        
        console.warn('未知的特殊动作:', action);
        return false;
    }
    
    // 更新对话显示
    updateDialogueDisplay(dialogue) {
        const currentScene = window.sceneManager ? window.sceneManager.currentScene : window.currentScene;
        const sceneElement = document.getElementById(`${currentScene}-scene`);
        if (!sceneElement) return;
        
        const dialogueSystem = sceneElement.querySelector('.dialogue-system');
        if (!dialogueSystem) return;
        
        const speakerElement = dialogueSystem.querySelector('.speaker-name');
        const textElement = dialogueSystem.querySelector('.dialogue-text');
        
        if (speakerElement) speakerElement.textContent = dialogue.speaker || '';
        if (textElement) textElement.textContent = dialogue.text || '';
    }
    
    // 更新角色显示
    updateCharacters(dialogue) {
        // 使用现有的角色更新逻辑
        const currentScene = window.sceneManager ? window.sceneManager.currentScene : window.currentScene;
        updateCharacters({ ...dialogue, scene: currentScene });
    }
}

// ==================== 控制面板系统增强 ====================
class ControlPanelManager {
    constructor() {
        this.panels = {
            music: { toggle: 'music-toggle-btn', panel: 'music-panel', close: 'music-panel-close' },
            save: { toggle: 'save-toggle-btn', panel: 'save-panel', close: 'save-panel-close' },
            map: { toggle: 'map-toggle-btn', panel: 'map-detail-modal', close: 'map-detail-close' },
            book: { toggle: 'book-toggle-btn', panel: 'book-panel', close: 'book-panel-close' }
        };
        
        this.init();
    }
    
    init() {
        // 初始化所有面板事件
        Object.keys(this.panels).forEach(panelType => {
            this.initPanel(panelType);
        });
        
        // 绑定全局事件
        this.bindGlobalEvents();
    }
    
    initPanel(panelType) {
        const panelConfig = this.panels[panelType];
        const toggleBtn = document.getElementById(panelConfig.toggle);
        const panel = document.getElementById(panelConfig.panel);
        const closeBtn = document.getElementById(panelConfig.close);
        
        if (toggleBtn && panel) {
            // 清理已存在的事件监听器
            const newBtn = toggleBtn.cloneNode(true);
            toggleBtn.parentNode.replaceChild(newBtn, toggleBtn);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.togglePanel(panelType);
            });
        }
        
        if (closeBtn && panel) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closePanel(panelType);
            });
        }
        
        // 确保面板初始状态正确
        if (panel) {
            panel.style.display = 'none';
            panel.classList.remove('active');
        }
    }
    
    togglePanel(panelType) {
        const panelConfig = this.panels[panelType];
        const panel = document.getElementById(panelConfig.panel);
        
        if (!panel) return;
        
        const isActive = panel.classList.contains('active');
        
        // 关闭所有面板
        this.closeAllPanels();
        
        if (!isActive) {
            // 打开指定面板
            panel.style.display = 'block';
            setTimeout(() => {
                panel.classList.add('active');
                this.onPanelOpened(panelType);
            }, 10);
        }
    }
    
    closePanel(panelType) {
        const panelConfig = this.panels[panelType];
        const panel = document.getElementById(panelConfig.panel);
        
        if (panel) {
            panel.classList.remove('active');
            setTimeout(() => {
                panel.style.display = 'none';
            }, 300);
        }
    }
    
    closeAllPanels() {
        Object.keys(this.panels).forEach(panelType => {
            this.closePanel(panelType);
        });
    }
    
    onPanelOpened(panelType) {
        // 面板打开后的回调函数
        switch (panelType) {
            case 'save':
                if (window.gameSaveSystem) {
                    window.gameSaveSystem.renderSaveList();
                }
                break;
            case 'map':
                if (typeof initMapTabs === 'function') {
                    initMapTabs();
                }
                break;
            case 'book':
                if (typeof initBookPanel === 'function') {
                    initBookPanel();
                }
                break;
        }
    }
    
    bindGlobalEvents() {
        // 点击外部关闭面板
        document.addEventListener('click', (e) => {
            const isControlButton = e.target.closest('.control-btn');
            const isPanel = e.target.closest('.control-panel');
            
            if (!isControlButton && !isPanel) {
                this.closeAllPanels();
            }
        });
        
        // ESC键关闭所有面板
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.closeAllPanels();
            }
        });
    }
}

// ==================== 增强存档系统 ====================
class EnhancedSaveSystem extends GameSaveSystem {
    constructor() {
        super();
        this.autoSaveEnabled = true;
        this.lastAutoSaveIndex = -1;
    }
    
    // 创建存档时确保面板状态正确
    createSave(isAutoSave = false) {
        // 保存前关闭所有面板以确保状态一致
        if (window.controlPanelManager) {
            window.controlPanelManager.closeAllPanels();
        } else if (typeof closeAllPanels === 'function') {
            closeAllPanels();
        }
        
        return super.createSave(isAutoSave);
    }
    
    // 加载存档后恢复场景
    loadSave(saveId) {
        const save = this.saves.find(s => s.id === saveId);
        if (!save) return false;
        
        // 恢复游戏状态
        window.currentDialogueIndex = save.gameState.currentDialogueIndex;
        window.currentScene = save.gameState.currentScene;
        
        // 恢复收集数据
        if (save.gameState.collectedEvidence) {
            window.collectedEvidence = [...save.gameState.collectedEvidence];
            if (typeof updateBookPage2 === 'function') {
                updateBookPage2();
            }
        }
        
        if (save.gameState.encounteredCharacters) {
            window.encounteredCharacters = [...save.gameState.encounteredCharacters];
            if (typeof updateBookPage1 === 'function') {
                updateBookPage1();
            }
        }
        
        // 切换到保存的场景
        if (window.sceneManager) {
            window.sceneManager.switchToScene(window.currentScene);
        } else if (typeof showScene === 'function') {
            showScene(window.currentScene);
        }
        
        // 显示保存的对话
        setTimeout(() => {
            if (window.dialogueManager) {
                window.dialogueManager.showCurrentDialogue();
            } else if (typeof showCurrentDialogue === 'function') {
                showCurrentDialogue();
            }
        }, 500);
        
        this.closeSavePanel();
        this.showSaveMessage('存档加载成功', 'success');
        
        return true;
    }
}

// ==================== 修复对话推进函数 ====================
function fixAdvanceDialogue() {
    // 保存原始函数
    const originalAdvanceDialogue = window.advanceDialogue;
    
    // 创建新的对话推进函数
    window.advanceDialogue = function() {
        // 使用优化后的对话管理器
        if (window.dialogueManager) {
            return window.dialogueManager.advanceDialogue();
        }
        
        // 降级到原始实现
        if (originalAdvanceDialogue) {
            return originalAdvanceDialogue.apply(this, arguments);
        }
        
        // 最后的降级方案
        window.currentDialogueIndex++;
        if (window.currentDialogueIndex < window.storyScript.length) {
            if (typeof showCurrentDialogue === 'function') {
                showCurrentDialogue();
            }
        }
        return true;
    };
}

// ==================== 修复场景切换函数 ====================
function fixShowScene() {
    // 保存原始函数
    const originalShowScene = window.showScene;
    
    // 创建新的场景切换函数
    window.showScene = function(sceneName) {
        // 使用优化后的场景管理器
        if (window.sceneManager) {
            return window.sceneManager.switchToScene(sceneName);
        }
        
        // 降级到原始实现
        if (originalShowScene) {
            return originalShowScene.apply(this, arguments);
        }
        
        // 最后的降级方案
        const allScenes = document.querySelectorAll('.scene');
        allScenes.forEach(scene => {
            scene.classList.remove('active');
            scene.style.display = 'none';
        });
        
        const targetScene = document.getElementById(sceneName + '-scene');
        if (targetScene) {
            targetScene.classList.add('active');
            targetScene.style.display = 'block';
            window.currentScene = sceneName;
            return true;
        }
        return false;
    };
}

// ==================== 确保面板关闭功能 ====================
function fixCloseAllPanels() {
    window.closeAllPanels = function() {
        if (window.controlPanelManager) {
            window.controlPanelManager.closeAllPanels();
        } else {
            // 原始实现
            const panels = ['music-panel', 'save-panel', 'map-detail-modal', 'book-panel'];
            panels.forEach(panelId => {
                const panel = document.getElementById(panelId);
                if (panel) {
                    panel.classList.remove('active');
                    panel.style.display = 'none';
                }
            });
        }
    };
}

// ==================== 系统初始化和修复 ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('开始系统优化和修复...');
    
    // 1. 初始化场景管理器（如果不存在）
    if (!window.sceneManager) {
        window.sceneManager = new SceneManager();
        console.log('场景管理器已初始化');
    }
    
    // 2. 初始化对话管理器（如果不存在）
    if (!window.dialogueManager) {
        window.dialogueManager = new DialogueManager();
        console.log('对话管理器已初始化');
    }
    
    // 3. 初始化控制面板管理器（如果不存在）
    if (!window.controlPanelManager) {
        window.controlPanelManager = new ControlPanelManager();
        console.log('控制面板管理器已初始化');
    }
    
    // 4. 替换存档系统为增强版
    if (window.gameSaveSystem && !(window.gameSaveSystem instanceof EnhancedSaveSystem)) {
        const oldSaves = window.gameSaveSystem.saves || [];
        window.gameSaveSystem = new EnhancedSaveSystem();
        window.gameSaveSystem.saves = oldSaves;
        window.gameSaveSystem.saveSaves();
        console.log('存档系统已升级');
    }
    
    // 5. 修复关键函数
    fixAdvanceDialogue();
    fixShowScene();
    fixCloseAllPanels();
    
    // 6. 确保所有必需的全局函数存在
    window.collectCharacter = window.collectCharacter || function(characterData) {
        if (!characterData || !characterData.id || !characterData.name) return;
        
        const alreadyCollected = window.encounteredCharacters.find(c => c.id === characterData.id);
        if (alreadyCollected) return;
        
        window.encounteredCharacters.push(characterData);
        if (typeof updateBookPage1 === 'function') {
            updateBookPage1();
        }
    };
    
    window.collectEvidence = window.collectEvidence || function(evidenceId) {
        if (!evidenceId || !window.evidenceDefinitions[evidenceId]) return false;
        
        if (window.collectedEvidence.find(e => e.id === evidenceId)) return false;
        
        const evidenceData = {
            ...window.evidenceDefinitions[evidenceId],
            foundTime: new Date().toLocaleString(),
            collectedIndex: window.collectedEvidence.length
        };
        
        window.collectedEvidence.push(evidenceData);
        if (typeof updateBookPage2 === 'function') {
            updateBookPage2();
        }
        
        if (window.gameSaveSystem) {
            window.gameSaveSystem.createSave(true);
        }
        
        return true;
    };
    
    console.log('系统优化和修复完成！');
});

// ==================== 确保向后兼容性 ====================
// 保持所有原有函数的可用性
window.initGame = window.initGame || initGame;
window.initControlPanels = window.initControlPanels || initControlPanels;
window.initMusicSystem = window.initMusicSystem || initMusicSystem;
window.initDoorDetection = window.initDoorDetection || initDoorDetection;
window.initChemicalExperiment = window.initChemicalExperiment || initChemicalExperiment;
window.showMessage = window.showMessage || showMessage;
window.updateBookPage1 = window.updateBookPage1 || updateBookPage1;
window.updateBookPage2 = window.updateBookPage2 || updateBookPage2;

console.log('游戏系统优化补丁已应用！');
