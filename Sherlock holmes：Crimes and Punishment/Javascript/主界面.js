// 全局状态
let currentEpisode = 1;
let gameState = JSON.parse(localStorage.getItem('save')) || {clues: [], moralPoints: 0, endings: {}};
let currentLang = 'zh-CN';
 document.addEventListener('DOMContentLoaded', function() {
            const devNotes = document.getElementById('dev-notes');
            const logoScreen = document.getElementById('logo-screen');
            const continuePrompt = document.querySelector('.continue-prompt');
            const logoWrapper = document.querySelector('.logo-wrapper');
            const logoSubtitle = document.querySelector('.logo-subtitle');
            const logoUpload = document.getElementById('logo-upload');
            const logoFile = document.getElementById('logo-file');
            const logoDisplay = document.getElementById('logo-display');
            
            // 初始显示开发人员提示
            setTimeout(() => {
                continuePrompt.style.display = 'block';
            }, 8000);
            
            // 点击屏幕继续
            document.addEventListener('click', handleClick);
            document.addEventListener('keydown', handleKeyPress);
        });

        function handleClick() {
            proceedFromDevNotes();
        }
// 剧情数据：深入分支
const episodes = {
    1: { // Ep1: 布莱克彼得的命运 - 分支：线索收集 -> 推理/行动 -> 3结局
        title: { 'zh-CN': 'Episode 1: 布莱克彼得的命运', 'en': 'Episode 1: The Fate of Black Peter' },
        scenes: [
            // Scene 0: 开场
            {
                text: { 'zh-CN': '1895年7月，Forest Row小屋。船长彼得·凯里，“黑彼得”，被鱼叉钉死在墙上。华生，你是第一个目击者。', 'en': 'July 1895, Forest Row cabin. Captain Peter Carey, "Black Peter", harpooned to the wall. Watson, you\'re first on scene.' },
                choices: [
                    { text: { 'zh-CN': '检查鱼叉（线索: harpoon）', 'en': 'Examine harpoon' }, nextScene: 1, clue: 'harpoon' },
                    { text: { 'zh-CN': '搜查日记（线索: journal）', 'en': 'Search journal' }, nextScene: 2, clue: 'journal' },
                    { text: { 'zh-CN': '审问邻居斯坦利·霍普金斯', 'en': 'Question neighbor Stanley Hopkins' }, nextScene: 3, clue: 'hopkins' }
                ]
            },
            // Scene 1: 鱼叉分支
            {
                text: { 'zh-CN': '鱼叉上有盐渍和捕鲸油迹，指向“海星号”船。黑彼得曾是海盗，藏匿赃金。', 'en': 'Harpoon has salt and whaling oil, links to "Sea Star". Black Peter was a pirate, hid stolen gold.' },
                choices: [
                    { text: { 'zh-CN': '追踪船员名单', 'en': 'Trace crew list' }, nextScene: 4, clue: 'crew' },
                    { text: { 'zh-CN': '忽略，返回贝克街（道德-1）', 'en': 'Ignore, return to Baker Street' }, nextScene: 0, moral: -1 }
                ]
            },
            // Scene 2: 日记分支
            {
                text: { 'zh-CN': '日记记录海盗掠夺：父亲被杀的约翰·霍普利·内利根（凶手真名）。黄金藏在船板下。', 'en': 'Journal logs pirate raids: John Hopley Neligan (real killer), whose father was murdered. Gold hidden under ship planks.' },
                choices: [
                    { text: { 'zh-CN': '伪造身份调查霍普金斯', 'en': 'Disguise as inspector' }, nextScene: 5, clue: 'disguise' },
                    { text: { 'zh-CN': '烧毁日记（道德-2）', 'en': 'Burn journal' }, nextScene: 0, moral: -2 }
                ]
            },
            // Scene 3: 霍普金斯分支（早期错误）
            {
                text: { 'zh-CN': '霍普金斯声称无辜，但眼神闪烁。福尔摩斯警告：别急于下结论。', 'en': 'Hopkins claims innocence, but shifty eyes. Holmes warns: Don\'t jump to conclusions.' },
                choices: [
                    { text: { 'zh-CN': '逮捕他（坏分支）', 'en': 'Arrest him' }, nextScene: 6, moral: -1 },
                    { text: { 'zh-CN': '继续调查', 'en': 'Continue investigating' }, nextScene: 0 }
                ]
            },
            // Scene 4: 船员追踪
            {
                text: { 'zh-CN': '名单显示内利根失踪多年。线索指向伪装的霍普金斯。', 'en': 'Crew list shows Neligan missing. Clues point to disguised Hopkins.' },
                choices: [
                    { text: { 'zh-CN': '前往船坞', 'en': 'Go to docks' }, nextScene: 7, clue: 'docks' }
                ]
            },
            // Scene 5: 伪装调查
            {
                text: { 'zh-CN': '伪装下，霍普金斯（内利根）露馅：他为父报仇，偷金。', 'en': 'In disguise, Hopkins (Neligan) slips: Revenge for father, stole gold.' },
                choices: [
                    { text: { 'zh-CN': '推理揭露（好道德+2）', 'en': 'Deduce and reveal' }, nextScene: 8, moral: 2 },
                    { text: { 'zh-CN': '直接逮捕（中道德+1）', 'en': 'Arrest directly' }, nextScene: 9, moral: 1 }
                ]
            },
            // Scene 6: 错误逮捕（坏结局路径）
            {
                text: { 'zh-CN': '逮捕霍普金斯后，真凶逃脱。黄金失踪，正义蒙羞。', 'en': 'Arrest wrong man, real killer escapes. Gold lost, justice shamed.' },
                choices: [{ text: { 'zh-CN': '结局：错误之罚', 'en': 'Ending: Punishment of Error' }, action: 'ending', ending: 'bad' }]
            },
            // Scene 7: 船坞（需多线索）
            {
                text: { condition: () => gameState.clues.length >= 3, text: { 'zh-CN': '船坞中发现血迹，确认内利根路径。', 'en': 'Blood at docks confirms Neligan.' }, choices: [{ text: { 'zh-CN': '追击', 'en': 'Pursue' }, nextScene: 5 }] },
                // Fallback if condition false
                text: { 'zh-CN': '线索不足，无法推进。返回重查。', 'en': 'Insufficient clues. Backtrack.' },
                choices: [{ text: { 'zh-CN': '返回初始', 'en': 'Return to start' }, nextScene: 0 }]
            },
            // Scene 8: 好结局
            {
                text: { 'zh-CN': '内利根自首，赎罪。福尔摩斯：罪有罚，但宽恕可解。', 'en': 'Neligan surrenders, redeems. Holmes: Crime has punishment, but forgiveness frees.' },
                choices: [{ text: { 'zh-CN': '返回菜单', 'en': 'Back to menu' }, action: 'menu' }]
            },
            // Scene 9: 中结局
            {
                text: { 'zh-CN': '逮捕内利根，黄金回收。但他咒骂：复仇无罪！', 'en': 'Arrest Neligan, recover gold. But he curses: Revenge is no sin!' },
                choices: [{ text: { 'zh-CN': '返回菜单', 'en': 'Back to menu' }, action: 'menu' }]
            }
        ]
    },
    2: { // Ep2: 罗马浴场事件 - 分支：蒸汽谜团 -> 文物阴谋 -> 3结局
        title: { 'zh-CN': 'Episode 2: 罗马浴场事件', 'en': 'Episode 2: The Roman Bath Incident' },
        scenes: [
            // Scene 0: 开场
            {
                text: { 'zh-CN': 'Strand Lane罗马浴场，考古学家罗德尼·本特克利夫爵士，死于锁死的蒸汽室。蒸汽掩盖一切。', 'en': 'Strand Lane Roman Baths, archaeologist Sir Rodney Bentcliffe dead in locked steam room. Steam hides all.' },
                choices: [
                    { text: { 'zh-CN': '检查蒸汽室锁（线索: lock）', 'en': 'Examine steam room lock' }, nextScene: 1, clue: 'lock' },
                    { text: { 'zh-CN': '检验尸体（线索: body）', 'en': 'Examine body' }, nextScene: 2, clue: 'body' },
                    { text: { 'zh-CN': '审问管理员', 'en': 'Question keeper' }, nextScene: 3, clue: 'keeper' }
                ]
            },
            // Scene 1: 锁分支
            {
                text: { 'zh-CN': '锁从内侧拧紧，但有刮痕——伪造自杀？蒸汽室高温加速死亡。', 'en': 'Lock twisted from inside, but scratches—faked suicide? Heat accelerated death.' },
                choices: [
                    { text: { 'zh-CN': '测试蒸汽阀门', 'en': 'Test steam valves' }, nextScene: 4, clue: 'valve' },
                    { text: { 'zh-CN': '忽略（道德-1）', 'en': 'Ignore' }, nextScene: 0, moral: -1 }
                ]
            },
            // Scene 2: 尸体分支
            {
                text: { 'zh-CN': '尸体握罗马硬币，硫磺中毒迹象。硬币是失窃文物，价值连城。', 'en': 'Body clutches Roman coin, sulfur poisoning. Coin is stolen artifact, priceless.' },
                choices: [
                    { text: { 'zh-CN': '追踪文物来源', 'en': 'Trace artifact source' }, nextScene: 5, clue: 'artifact' },
                    { text: { 'zh-CN': '销毁硬币（道德-2）', 'en': 'Destroy coin' }, nextScene: 0, moral: -2 }
                ]
            },
            // Scene 3: 管理员分支
            {
                text: { 'zh-CN': '管理员 alibi：蒸汽时在外。但动机：被发现偷文物。', 'en': 'Keeper\'s alibi: Outside during steam. Motive: Caught stealing artifact.' },
                choices: [
                    { text: { 'zh-CN': '搜查住所', 'en': 'Search home' }, nextScene: 6, moral: 1 },
                    { text: { 'zh-CN': '相信他（坏分支）', 'en': 'Believe him' }, nextScene: 7, moral: -1 }
                ]
            },
            // Scene 4: 阀门
            {
                text: { 'zh-CN': '阀门被篡改，远程释放蒸汽。凶手从通风口逃脱。', 'en': 'Valve tampered, remote steam release. Killer escaped via vent.' },
                choices: [{ text: { 'zh-CN': '检查通风', 'en': 'Check vent' }, nextScene: 8, clue: 'vent' }]
            },
            // Scene 5: 文物追踪
            {
                text: { 'zh-CN': '硬币来自本特克利夫的罗马挖掘，管理员曾是助手。', 'en': 'Coin from Bentcliffe\'s Roman dig, keeper was assistant.' },
                choices: [{ text: { 'zh-CN': '对抗管理员', 'en': 'Confront keeper' }, nextScene: 3 }]
            },
            // Scene 6: 搜查住所
            {
                text: { 'zh-CN': '住所藏赃物：多枚罗马币。管理员崩溃。', 'en': 'Home hides loot: More Roman coins. Keeper cracks.' },
                choices: [
                    { text: { 'zh-CN': '推理动机（好+2）', 'en': 'Deduce motive' }, nextScene: 9, moral: 2 },
                    { text: { 'zh-CN': '暴力逼供（中+0）', 'en': 'Rough interrogation' }, nextScene: 10, moral: 0 }
                ]
            },
            // Scene 7: 相信管理员（坏结局）
            {
                text: { 'zh-CN': '真凶逍遥，浴场诅咒延续。福尔摩斯叹息。', 'en': 'Real killer free, bath curse lingers. Holmes sighs.' },
                choices: [{ text: { 'zh-CN': '结局：浴场的幽灵', 'en': 'Ending: Bath\'s Ghost' }, action: 'ending', ending: 'bad' }]
            },
            // Scene 8: 通风（需多线索）
            {
                text: { condition: () => gameState.clues.length >= 3, text: { 'zh-CN': '通风口指纹匹配管理员。完美拼图。', 'en': 'Vent fingerprints match keeper. Puzzle complete.' }, choices: [{ text: { 'zh-CN': '逮捕', 'en': 'Arrest' }, nextScene: 6 }] },
                text: { 'zh-CN': '线索不足。重查。', 'en': 'Clues lacking. Retrace.' },
                choices: [{ text: { 'zh-CN': '返回', 'en': 'Return' }, nextScene: 0 }]
            },
            // Scene 9: 好结局
            {
                text: { 'zh-CN': '管理员招供：谋财害命，蒸汽掩盖。赎罪之路开启。', 'en': 'Keeper confesses: Murder for wealth, steam cover. Path to redemption opens.' },
                choices: [{ text: { 'zh-CN': '返回菜单', 'en': 'Back to menu' }, action: 'menu' }]
            },
            // Scene 10: 中结局
            {
                text: { 'zh-CN': '逼供得证，文物回收。但灵魂的罚未解。', 'en': 'Confession via force, artifacts recovered. But soul\'s punishment unresolved.' },
                choices: [{ text: { 'zh-CN': '返回菜单', 'en': 'Back to menu' }, action: 'menu' }]
            }
        ]
    }
};

// 初始化（扩展：加载gameState）
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupEventListeners();
    updateLanguage(currentLang);
    if (localStorage.getItem('cutsceneSeen') !== 'true') {
        playCutscene();
    } else {
        showMainMenu();
    }
});

 // 启动logo序列：2s后淡出，立即显化主菜单
    setTimeout(() => {
        const logo = document.getElementById('logo');
        logo.classList.add('fade-out'); // CSS淡出logo
        setTimeout(() => {
            logo.classList.remove('active'); // 隐藏logo
            showMainMenu(); // 显化主菜单（CSS自动淡入）
            localStorage.setItem('logoSeen', 'true'); // 记住，避免刷新重播
        }, 1000); // 1s过渡时间，匹配CSS
    }, 2000); // logo显示2s，调整为你的需求
{};

// 显示主菜单：简单opacity淡入
function showMainMenu() {
    const mainMenu = document.getElementById('main-menu');
    mainMenu.classList.add('active');
    mainMenu.style.opacity = '0'; // 先隐
    setTimeout(() => {
        mainMenu.style.opacity = '1'; // 1s内淡入
    }, 100);
    document.getElementById('game-scene').classList.remove('active');
}

// 原其他函数不变：setupEventListeners, loadSettings, updateLanguage, startGame, loadScene, showEnding 等
function setupEventListeners() {
    document.querySelectorAll('.episode').forEach(ep => {
        ep.addEventListener('click', (e) => {
            currentEpisode = parseInt(e.currentTarget.dataset.episode);
            startGame();
        });
    });

    document.getElementById('settings-btn').addEventListener('click', () => {
        document.getElementById('settings-modal').style.display = 'block';
    });

    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('settings-modal').style.display = 'none';
    });

    document.getElementById('apply-settings').addEventListener('click', () => {
        const audioVol = document.getElementById('audio-slider').value;
        const quality = document.getElementById('quality-select').value;
        const lang = document.getElementById('language-select').value;
        localStorage.setItem('settings', JSON.stringify({audio: audioVol, quality, lang}));
        if (lang !== currentLang) {
            currentLang = lang;
            updateLanguage(lang);
            location.reload();
        }
        document.getElementById('settings-modal').style.display = 'none';
    });

    document.getElementById('back-to-menu').addEventListener('click', showMainMenu);
    document.getElementById('exit-btn').addEventListener('click', () => alert('退出游戏'));
}

function loadSettings() {
    const saved = localStorage.getItem('settings');
    if (saved) {
        const {audio, quality, lang} = JSON.parse(saved);
        document.getElementById('audio-slider').value = audio || 50;
        document.getElementById('quality-select').value = quality || 'medium';
        currentLang = lang || 'zh-CN';
        document.getElementById('language-select').value = currentLang;
    }
}

function updateLanguage(lang) {
    document.querySelector('.title h1').textContent = lang === 'zh-CN' ? '罪与罚：福尔摩斯探案' : 'Crimes & Punishments: Holmes Case';
    // ... 原episode更新 ...
}

let currentSceneIndex = 0;
function startGame() {
    gameState = {clues: [], moralPoints: 0};
    document.getElementById('main-menu').classList.remove('active');
    document.getElementById('game-scene').classList.add('active');
    currentSceneIndex = 0;
    loadScene();
}


// 加载场景（深入：条件检查、动态结局）
function loadScene() {
    const episode = episodes[currentEpisode];
    if (!episode || currentSceneIndex >= episode.scenes.length) {
        showEnding();
        return;
    }
    const scene = episode.scenes[currentSceneIndex];
    let displayText = scene.text;
    if (typeof scene.text === 'object' && scene.text.condition) {
        if (!scene.text.condition()) {
            displayText = scene.text.fallback || scene.text;
        }
    }
    document.getElementById('dialogue-text').textContent = displayText[currentLang];
    document.getElementById('ending-display').style.display = 'none';
    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';
    (scene.choices || []).forEach((choice) => {
        const btn = document.createElement('button');
        btn.textContent = choice.text[currentLang];
        btn.addEventListener('click', () => {
            if (choice.action === 'menu') {
                showMainMenu();
            } else if (choice.action === 'ending') {
                gameState.endings[currentEpisode] = choice.ending;
                showEnding();
            } else {
                if (choice.clue) gameState.clues.push(choice.clue);
                if (choice.moral !== undefined) gameState.moralPoints += choice.moral;
                currentSceneIndex = choice.nextScene || (currentSceneIndex + 1);
                loadScene();
                localStorage.setItem('save', JSON.stringify(gameState));
            }
        });
        choicesDiv.appendChild(btn);
    });
}

// 新增：显示结局
function showEnding() {
    const endingDiv = document.getElementById('ending-display');
    const points = gameState.moralPoints;
    let endingText = '';
    if (points >= 2) {
        endingText = { 'zh-CN': '好结局：正义与赎罪并存。', 'en': 'Good Ending: Justice and redemption coexist.' };
    } else if (points <= -1) {
        endingText = { 'zh-CN': '坏结局：罪恶逍遥，罚在心中。', 'en': 'Bad Ending: Evil roams free, punishment in the heart.' };
    } else {
        endingText = { 'zh-CN': '中结局：真相揭开，但代价沉重。', 'en': 'Neutral Ending: Truth uncovered, but at heavy cost.' };
    }
    document.getElementById('dialogue-text').textContent = endingText[currentLang];
    document.getElementById('choices').innerHTML = '<button id="back-to-menu">返回菜单</button>';
    document.getElementById('back-to-menu').addEventListener('click', showMainMenu);
    endingDiv.style.display = 'block';
    localStorage.removeItem('save'); // 清除存档，重新开始
    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '<button>返回菜单</button>';
    choicesDiv.querySelector('button').addEventListener('click', showMainMenu);
}
// 播放开场动画（扩展：可跳过）
function playCutscene() {
    const cutscene = document.getElementById('cutscene');
    cutscene.style.display = 'block';
    setTimeout(() => {
        cutscene.style.opacity = '1';
    }, 100);
    setTimeout(() => {
        cutscene.style.opacity = '0';
        setTimeout(() => {
            cutscene.style.display = 'none';
            showMainMenu();
            localStorage.setItem('cutsceneSeen', 'true');
        }, 1000);
    }, 5000); // 5秒后淡出
}