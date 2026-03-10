// ============================================
// ENEMY SYSTEM - Enemy Definitions & AI
// ============================================

const ENEMY_DATABASE = {
    // ========== ACT 1 NORMAL ENEMIES ==========
    jaw_worm: {
        id: 'jaw_worm', name: 'ジョーワーム', sprite: SPRITES.jawWorm,
        hp: [40, 44], act: 1, type: 'normal',
        moves: [
            { id: 'chomp', name: '噛みつき', type: 'attack', damage: 11, weight: 45 },
            { id: 'thrash', name: 'スラッシュ', type: 'attack_defend', damage: 7, block: 5, weight: 30 },
            { id: 'bellow', name: '咆哮', type: 'buff', effects: [{ type: 'strength', amount: 3 }, { type: 'block', amount: 6 }], weight: 25 }
        ]
    },
    louse_red: {
        id: 'louse_red', name: '赤シラミ', sprite: SPRITES.louse,
        hp: [10, 15], act: 1, type: 'normal',
        moves: [
            { id: 'bite', name: '噛みつき', type: 'attack', damage: [5, 7], weight: 75 },
            { id: 'grow', name: '成長', type: 'buff', effects: [{ type: 'strength', amount: 3 }], weight: 25 }
        ]
    },
    louse_green: {
        id: 'louse_green', name: '緑シラミ', sprite: SPRITES.louse,
        hp: [11, 17], act: 1, type: 'normal',
        moves: [
            { id: 'bite', name: '噛みつき', type: 'attack', damage: [5, 7], weight: 75 },
            { id: 'spikyShell', name: 'トゲ殻', type: 'buff', effects: [{ type: 'curl', amount: [3, 7] }], weight: 25 }
        ]
    },
    cultist: {
        id: 'cultist', name: 'カルティスト', sprite: SPRITES.cultist,
        hp: [48, 54], act: 1, type: 'normal',
        moves: [
            { id: 'darkStrike', name: '闇の一撃', type: 'attack', damage: 6, weight: 100 },
        ],
        onStart: [{ type: 'ritual', amount: 3 }]
    },
    slime_s: {
        id: 'slime_s', name: '小スライム', sprite: SPRITES.slimeS,
        hp: [8, 14], act: 1, type: 'normal',
        moves: [
            { id: 'tackle', name: 'タックル', type: 'attack', damage: [3, 5], weight: 70 },
            { id: 'lick', name: '舐める', type: 'debuff', effects: [{ type: 'weak', amount: 1 }], weight: 30 }
        ]
    },
    blue_slaver: {
        id: 'blue_slaver', name: '青スレイバー', sprite: SPRITES.slimeS,
        hp: [46, 50], act: 1, type: 'normal',
        moves: [
            { id: 'stab', name: '刺突', type: 'attack', damage: 12, weight: 60 },
            { id: 'rake', name: '引っかき', type: 'attack_debuff', damage: 7, effects: [{ type: 'weak', amount: 1 }], weight: 40 }
        ]
    },
    fungi_beast: {
        id: 'fungi_beast', name: 'キノコ獣', sprite: SPRITES.slimeS,
        hp: [22, 28], act: 1, type: 'normal',
        moves: [
            { id: 'bite', name: '噛みつき', type: 'attack', damage: 6, weight: 60 },
            { id: 'grow', name: '胞子', type: 'buff', effects: [{ type: 'strength', amount: 3 }], weight: 40 }
        ]
    },

    // ========== ACT 1 ELITE ENEMIES ==========
    gremlin_nob: {
        id: 'gremlin_nob', name: 'グレムリンノブ', sprite: SPRITES.gremlinNob,
        hp: [82, 86], act: 1, type: 'elite',
        moves: [
            { id: 'bellow', name: '怒号', type: 'buff', effects: [{ type: 'enrage', amount: 2 }], weight: 0, firstTurn: true },
            { id: 'rush', name: '突撃', type: 'attack', damage: 14, weight: 34 },
            { id: 'skullBash', name: '頭突き', type: 'attack_debuff', damage: 6, effects: [{ type: 'vulnerable', amount: 2 }], weight: 33 },
        ]
    },
    lagavulin: {
        id: 'lagavulin', name: 'ラガヴュリン', sprite: SPRITES.lagavulin,
        hp: [109, 111], act: 1, type: 'elite',
        moves: [
            { id: 'sleep', name: '睡眠', type: 'defend', block: 8, weight: 0, turns: 3 },
            { id: 'attack', name: '攻撃', type: 'attack', damage: 18, weight: 50 },
            { id: 'siphon', name: '吸収', type: 'attack_debuff', damage: 10, effects: [{ type: 'dexterityDown', amount: -1 }, { type: 'strengthDown', amount: -1 }], weight: 50 }
        ]
    },
    sentries: {
        id: 'sentries', name: 'セントリー', sprite: SPRITES.slimeS,
        hp: [38, 42], act: 1, type: 'elite', count: 3,
        moves: [
            { id: 'bolt', name: 'ボルト', type: 'attack', damage: 9, weight: 50 },
            { id: 'dazed', name: 'ぼんやり', type: 'debuff', effects: [{ type: 'addDazed', amount: 2 }], weight: 50 }
        ]
    },

    // ========== ACT 1 BOSSES ==========
    slime_boss: {
        id: 'slime_boss', name: 'スライムボス', sprite: SPRITES.slimeBoss,
        hp: [140, 140], act: 1, type: 'boss',
        moves: [
            { id: 'goop', name: 'グープスプレー', type: 'debuff', effects: [{ type: 'addSlimed', amount: 3 }], weight: 35 },
            { id: 'preparing', name: '準備中', type: 'none', weight: 30 },
            { id: 'slam', name: 'スラム', type: 'attack', damage: 35, weight: 35 },
        ]
    },
    the_guardian: {
        id: 'the_guardian', name: 'ガーディアン', sprite: SPRITES.theGuardian,
        hp: [240, 240], act: 1, type: 'boss',
        moves: [
            { id: 'fierceStrike', name: '猛攻', type: 'attack', damage: 32, weight: 35 },
            { id: 'rollAttack', name: 'ローリング', type: 'attack', damage: 9, weight: 30 },
            { id: 'shieldMode', name: 'シールドモード', type: 'defend', block: 20, weight: 35 }
        ]
    },
    hexaghost: {
        id: 'hexaghost', name: 'ヘキサゴースト', sprite: SPRITES.hexaghost,
        hp: [250, 250], act: 1, type: 'boss',
        moves: [
            { id: 'activate', name: '起動', type: 'none', weight: 0, firstTurn: true },
            { id: 'divider', name: 'ディバイダー', type: 'attack', damage: 6, hits: 6, weight: 30 },
            { id: 'sear', name: '焦がし', type: 'attack', damage: 6, effects: [{ type: 'addBurn', amount: 1 }], weight: 35 },
            { id: 'inferno', name: '業火', type: 'attack', damage: 2, hits: 6, effects: [{ type: 'addBurn', amount: 3 }], weight: 20 }
        ]
    },

    // ========== ACT 2 NORMAL ENEMIES ==========
    chosen: {
        id: 'chosen', name: 'チョーズン', sprite: SPRITES.chosen,
        hp: [95, 99], act: 2, type: 'normal',
        moves: [
            { id: 'poke', name: '突き', type: 'attack', damage: 5, hits: 3, weight: 40 },
            { id: 'zap', name: 'ザップ', type: 'attack_debuff', damage: 18, effects: [{ type: 'vulnerable', amount: 2 }], weight: 35 },
            { id: 'hex', name: 'ヘックス', type: 'debuff', effects: [{ type: 'hex', amount: 1 }], weight: 25 }
        ]
    },
    byrd: {
        id: 'byrd', name: 'バード', sprite: SPRITES.byrd,
        hp: [25, 31], act: 2, type: 'normal',
        moves: [
            { id: 'peck', name: 'つつき', type: 'attack', damage: 1, hits: 5, weight: 40 },
            { id: 'fly', name: '飛翔', type: 'buff', effects: [{ type: 'flight', amount: 3 }], weight: 30 },
            { id: 'swoop', name: '急降下', type: 'attack', damage: 12, weight: 30 }
        ]
    },
    snecko: {
        id: 'snecko', name: 'スネッコ', sprite: SPRITES.slimeS,
        hp: [114, 120], act: 2, type: 'normal',
        moves: [
            { id: 'bite', name: '噛みつき', type: 'attack', damage: 15, weight: 45 },
            { id: 'tail', name: '尻尾', type: 'attack_debuff', damage: 8, effects: [{ type: 'weak', amount: 2 }], weight: 30 },
            { id: 'glare', name: '睨み', type: 'debuff', effects: [{ type: 'confused' }], weight: 25 }
        ]
    },
    shelled_parasite: {
        id: 'shelled_parasite', name: '殻付き寄生虫', sprite: SPRITES.slimeS,
        hp: [68, 72], act: 2, type: 'normal',
        moves: [
            { id: 'doubleStrike', name: '二連撃', type: 'attack', damage: 6, hits: 2, weight: 40 },
            { id: 'suck', name: '吸収', type: 'attack', damage: 10, effects: [{ type: 'heal', amount: 5 }], weight: 30 },
            { id: 'fell', name: '殻化', type: 'defend', block: 14, effects: [{ type: 'frail', amount: 2 }], weight: 30 }
        ]
    },
    snake_plant: {
        id: 'snake_plant', name: 'スネークプラント', sprite: SPRITES.slimeS,
        hp: [75, 79], act: 2, type: 'normal',
        moves: [
            { id: 'chomp', name: '噛みつき', type: 'attack', damage: 7, hits: 3, weight: 50 },
            { id: 'enfeeble', name: '弱体', type: 'debuff', effects: [{ type: 'weak', amount: 2 }, { type: 'frail', amount: 2 }], weight: 50 }
        ]
    },

    // ========== ACT 2 ELITE ENEMIES ==========
    gremlin_leader: {
        id: 'gremlin_leader', name: 'グレムリンリーダー', sprite: SPRITES.gremlinLeader,
        hp: [140, 148], act: 2, type: 'elite',
        moves: [
            { id: 'encourage', name: '鼓舞', type: 'buff', effects: [{ type: 'strengthAll', amount: 3 }], weight: 35 },
            { id: 'rally', name: '召集', type: 'summon', effects: [{ type: 'summonGremlin' }], weight: 30 },
            { id: 'strike', name: '攻撃', type: 'attack', damage: 6, hits: 3, weight: 35 }
        ]
    },
    book_of_stabbing: {
        id: 'book_of_stabbing', name: '刺突の書', sprite: SPRITES.bookOfStabbing,
        hp: [160, 168], act: 2, type: 'elite',
        moves: [
            { id: 'multiStab', name: '連続刺突', type: 'attack', damage: 6, hits: [2, 3, 4], weight: 70 },
            { id: 'singleStab', name: '一刺し', type: 'attack', damage: 21, weight: 30 }
        ],
        escalating: true
    },
    taskmaster: {
        id: 'taskmaster', name: 'タスクマスター', sprite: SPRITES.slimeS,
        hp: [54, 60], act: 2, type: 'elite', count: 2,
        moves: [
            { id: 'scourgingWhip', name: '鞭打ち', type: 'attack_debuff', damage: 7, effects: [{ type: 'addWound', amount: 2 }], weight: 100 }
        ]
    },

    // ========== ACT 2 BOSSES ==========
    bronze_automaton: {
        id: 'bronze_automaton', name: 'ブロンズオートマトン', sprite: SPRITES.slimeS,
        hp: [300, 300], act: 2, type: 'boss',
        moves: [
            { id: 'spawn', name: '生成', type: 'summon', weight: 0, firstTurn: true },
            { id: 'boost', name: 'ブースト', type: 'buff', effects: [{ type: 'strength', amount: 3 }], weight: 30 },
            { id: 'flail', name: 'フレイル', type: 'attack', damage: 7, hits: 2, weight: 35 },
            { id: 'hyperBeam', name: 'ハイパービーム', type: 'attack', damage: 45, weight: 20, cooldown: 3 }
        ]
    },
    the_champ: {
        id: 'the_champ', name: 'チャンプ', sprite: SPRITES.slimeS,
        hp: [420, 420], act: 2, type: 'boss',
        moves: [
            { id: 'defensiveStance', name: '防御態勢', type: 'attack_defend', damage: 12, block: 18, weight: 30 },
            { id: 'faceSlap', name: 'ビンタ', type: 'attack_debuff', damage: 14, effects: [{ type: 'frail', amount: 2 }], weight: 25 },
            { id: 'heavySlam', name: '重撃', type: 'attack', damage: 18, weight: 25 },
            { id: 'execute', name: '処刑', type: 'attack', damage: 10, hits: 2, weight: 20 }
        ],
        phaseAt: 0.5 // HP50%以下でフェーズ2
    },
    collector: {
        id: 'collector', name: 'コレクター', sprite: SPRITES.collector,
        hp: [282, 282], act: 2, type: 'boss',
        moves: [
            { id: 'initialSpawn', name: '初期召喚', type: 'summon', weight: 0, firstTurn: true },
            { id: 'fireball', name: 'ファイアボール', type: 'attack', damage: 18, weight: 35 },
            { id: 'buff', name: '強化', type: 'buff', effects: [{ type: 'strength', amount: 3 }], weight: 30 },
            { id: 'mega', name: 'メガデバフ', type: 'debuff', effects: [{ type: 'weak', amount: 3 }, { type: 'vulnerable', amount: 3 }], weight: 20 }
        ]
    },

    // ========== ACT 3 NORMAL ENEMIES ==========
    darkling: {
        id: 'darkling', name: 'ダークリング', sprite: SPRITES.darkling,
        hp: [48, 56], act: 3, type: 'normal',
        moves: [
            { id: 'nip', name: '噛み', type: 'attack', damage: 8, hits: 2, weight: 45 },
            { id: 'chomp', name: '大噛み', type: 'attack', damage: 18, weight: 25 },
            { id: 'harden', name: '硬化', type: 'defend', block: 12, effects: [{ type: 'regenSelf', amount: 5 }], weight: 30 }
        ],
        revive: true
    },
    writhing_mass: {
        id: 'writhing_mass', name: 'ライジングマス', sprite: SPRITES.slimeS,
        hp: [160, 160], act: 3, type: 'normal',
        moves: [
            { id: 'multiStrike', name: '連撃', type: 'attack', damage: 7, hits: 3, weight: 30 },
            { id: 'strongStrike', name: '強撃', type: 'attack', damage: 32, weight: 25 },
            { id: 'implant', name: '移植', type: 'debuff', effects: [{ type: 'addParasite' }], weight: 20 },
            { id: 'wither', name: '衰弱', type: 'debuff', effects: [{ type: 'weak', amount: 2 }, { type: 'vulnerable', amount: 2 }], weight: 25 }
        ]
    },
    giant_head: {
        id: 'giant_head', name: 'ジャイアントヘッド', sprite: SPRITES.giantHead,
        hp: [500, 500], act: 3, type: 'normal',
        moves: [
            { id: 'count', name: 'カウント', type: 'attack', damage: 13, weight: 50 },
            { id: 'glare', name: '睨み', type: 'debuff', effects: [{ type: 'weak', amount: 1 }], weight: 30 },
            { id: 'bigAttack', name: '大攻撃', type: 'attack', damage: 40, weight: 20, turnThreshold: 5 }
        ]
    },
    reptomancer: {
        id: 'reptomancer', name: 'レプトマンサー', sprite: SPRITES.reptomancer,
        hp: [180, 190], act: 3, type: 'normal',
        moves: [
            { id: 'snakeStrike', name: '蛇撃', type: 'attack', damage: 13, hits: 2, weight: 40 },
            { id: 'summon', name: '召喚', type: 'summon', effects: [{ type: 'summonDagger' }], weight: 30 },
            { id: 'bigBite', name: '大噛み', type: 'attack', damage: 30, weight: 30 }
        ]
    },
    spiker: {
        id: 'spiker', name: 'スパイカー', sprite: SPRITES.slimeS,
        hp: [42, 56], act: 3, type: 'normal',
        moves: [
            { id: 'cut', name: '切り', type: 'attack', damage: 7, hits: 2, weight: 50 },
            { id: 'spike', name: 'トゲ', type: 'buff', effects: [{ type: 'thorns', amount: 2 }], weight: 50 }
        ]
    },

    // ========== ACT 3 ELITE ENEMIES ==========
    nemesis: {
        id: 'nemesis', name: 'ネメシス', sprite: SPRITES.nemesis,
        hp: [185, 185], act: 3, type: 'elite',
        moves: [
            { id: 'debilitate', name: '衰弱化', type: 'debuff', effects: [{ type: 'addBurn', amount: 5 }], weight: 30 },
            { id: 'scythe', name: '大鎌', type: 'attack', damage: 45, weight: 40 },
            { id: 'intangible', name: '無形化', type: 'buff', effects: [{ type: 'intangible' }], weight: 30 }
        ]
    },
    giant_head_elite: {
        id: 'giant_head_elite', name: 'ジャイアントヘッド', sprite: SPRITES.giantHead,
        hp: [500, 500], act: 3, type: 'elite',
        moves: [
            { id: 'count', name: 'カウント', type: 'attack', damage: 13, weight: 50 },
            { id: 'glare', name: '睨み', type: 'debuff', effects: [{ type: 'weak', amount: 1 }], weight: 30 },
            { id: 'bigAttack', name: '大攻撃', type: 'attack', damage: 40, weight: 20 }
        ]
    },
    reptomancer_elite: {
        id: 'reptomancer_elite', name: 'レプトマンサー', sprite: SPRITES.reptomancer,
        hp: [190, 200], act: 3, type: 'elite',
        moves: [
            { id: 'snakeStrike', name: '蛇撃', type: 'attack', damage: 16, hits: 2, weight: 40 },
            { id: 'summon', name: '召喚', type: 'summon', effects: [{ type: 'summonDagger' }], weight: 30 },
            { id: 'bigBite', name: '大噛み', type: 'attack', damage: 34, weight: 30 }
        ]
    },

    // ========== ACT 3 BOSSES ==========
    awakened_one: {
        id: 'awakened_one', name: '覚醒者', sprite: SPRITES.awakenedOne,
        hp: [300, 300], act: 3, type: 'boss',
        moves: [
            { id: 'slash', name: '斬撃', type: 'attack', damage: 20, weight: 40 },
            { id: 'darkEcho', name: '闇のエコー', type: 'attack_debuff', damage: 12, effects: [{ type: 'vulnerable', amount: 1 }], weight: 30 },
            { id: 'soulStrike', name: '魂撃', type: 'attack', damage: 6, hits: 4, weight: 30 }
        ],
        phaseAt: 0, // 倒すとフェーズ2
        phase2Hp: [300, 300],
        phase2Moves: [
            { id: 'rebirth', name: '再生', type: 'buff', effects: [{ type: 'strength', amount: 2 }, { type: 'heal', amount: 10 }], weight: 25 },
            { id: 'darkSlash', name: '闇斬', type: 'attack', damage: 25, weight: 40 },
            { id: 'voidSlam', name: '虚空', type: 'attack', damage: 40, weight: 20 },
            { id: 'hyper', name: 'ダーク', type: 'attack', damage: 10, hits: 4, weight: 15 }
        ]
    },
    donu_deca: {
        id: 'donu_deca', name: 'ドヌ＆デカ', sprite: SPRITES.donu,
        hp: [250, 250], act: 3, type: 'boss', count: 2,
        moves: [
            { id: 'beamCircle', name: 'ビームサークル', type: 'attack', damage: 10, hits: 2, weight: 40 },
            { id: 'circle', name: 'バフ', type: 'buff', effects: [{ type: 'strength', amount: 2 }], weight: 30 },
            { id: 'squash', name: '押し潰し', type: 'attack', damage: 25, weight: 30 }
        ],
        paired: true,
        partner: {
            name: 'デカヘドロン', sprite: SPRITES.slimeS,
            hp: [250, 250],
            moves: [
                { id: 'protect', name: '防御', type: 'defend', block: 16, weight: 40 },
                { id: 'smash', name: '粉砕', type: 'attack', damage: 30, weight: 35 },
                { id: 'debuff', name: 'デバフ', type: 'debuff', effects: [{ type: 'weak', amount: 2 }, { type: 'frail', amount: 2 }], weight: 25 }
            ]
        }
    },
    time_eater: {
        id: 'time_eater', name: 'タイムイーター', sprite: SPRITES.timeEater,
        hp: [456, 456], act: 3, type: 'boss',
        moves: [
            { id: 'reverberate', name: '反響', type: 'attack', damage: 7, hits: 3, weight: 30 },
            { id: 'headSlam', name: 'ヘッドスラム', type: 'attack_debuff', damage: 26, effects: [{ type: 'addDazed', amount: 2 }], weight: 25 },
            { id: 'sundial', name: '日時計', type: 'defend', block: 20, effects: [{ type: 'heal', amount: 20 }], weight: 25 },
            { id: 'ripple', name: 'さざ波', type: 'attack', damage: 32, weight: 20 }
        ],
        cardCountPhase: 12 // 12枚プレイごとにバフ
    },

    // ========== MINIONS ==========
    gremlin_minion: {
        id: 'gremlin_minion', name: 'グレムリン', sprite: SPRITES.slimeS,
        hp: [10, 14], act: 2, type: 'minion',
        moves: [
            { id: 'scratch', name: '引っかき', type: 'attack', damage: [4, 6], weight: 100 }
        ]
    },
    dagger: {
        id: 'dagger', name: 'ダガー', sprite: SPRITES.daggers,
        hp: [20, 25], act: 3, type: 'minion',
        moves: [
            { id: 'stab', name: '突き', type: 'attack', damage: 9, weight: 60 },
            { id: 'explode', name: '自爆', type: 'attack', damage: 25, weight: 40, selfDestruct: true }
        ]
    }
};

// Get enemies for a specific encounter
function getEnemyEncounter(act, type) {
    const pool = Object.values(ENEMY_DATABASE).filter(e => e.act === act && e.type === type);
    if (pool.length === 0) return [];

    if (type === 'boss') {
        const boss = pool[Math.floor(Math.random() * pool.length)];
        return createEnemyInstances(boss);
    }

    // For normal/elite, pick 1-3 enemies
    if (type === 'elite') {
        const elite = pool[Math.floor(Math.random() * pool.length)];
        return createEnemyInstances(elite);
    }

    // Normal encounter: 1-3 random enemies
    const count = Math.random() < 0.4 ? 1 : (Math.random() < 0.6 ? 2 : 3);
    const enemies = [];
    for (let i = 0; i < count; i++) {
        const template = pool[Math.floor(Math.random() * pool.length)];
        const instances = createEnemyInstances(template);
        enemies.push(instances[0]);
    }
    return enemies;
}

function createEnemyInstances(template) {
    const instances = [];
    const count = template.count || 1;

    if (template.paired && template.partner) {
        // Create paired enemies (like Donu & Deca)
        instances.push(createSingleEnemy(template, 0));
        const partnerTemplate = {
            ...template,
            ...template.partner,
            id: template.id + '_partner'
        };
        instances.push(createSingleEnemy(partnerTemplate, 1));
        return instances;
    }

    for (let i = 0; i < count; i++) {
        instances.push(createSingleEnemy(template, i));
    }
    return instances;
}

function createSingleEnemy(template, index) {
    const hpRange = template.hp;
    const hp = Array.isArray(hpRange) ?
        Math.floor(Math.random() * (hpRange[1] - hpRange[0] + 1)) + hpRange[0] :
        hpRange;

    return {
        uid: Math.random().toString(36).substr(2, 9),
        id: template.id,
        name: template.name + (template.count > 1 ? ` ${index + 1}` : ''),
        emoji: template.emoji,
        hp: hp,
        maxHp: hp,
        block: 0,
        buffs: {},
        moves: JSON.parse(JSON.stringify(template.moves)),
        type: template.type,
        turnCount: 0,
        lastMoveId: null,
        currentIntent: null,
        onStart: template.onStart ? [...template.onStart] : [],
        phaseAt: template.phaseAt,
        phase2Hp: template.phase2Hp,
        phase2Moves: template.phase2Moves,
        escalating: template.escalating,
        revive: template.revive,
        cardCountPhase: template.cardCountPhase,
        dead: false,
        phase: 1
    };
}

// Decide next move for enemy
function decideEnemyMove(enemy) {
    const moves = enemy.moves;
    if (!moves || moves.length === 0) return null;

    // First turn moves
    if (enemy.turnCount === 0) {
        const firstTurnMove = moves.find(m => m.firstTurn);
        if (firstTurnMove) return firstTurnMove;

        // OnStart effects
        if (enemy.onStart && enemy.onStart.length > 0) {
            return { id: 'onStart', type: 'buff', effects: enemy.onStart };
        }
    }

    // Weighted random selection (avoid repeating same move 3 times)
    let available = moves.filter(m => !m.firstTurn);
    if (available.length === 0) available = moves;

    // Remove moves used too many times in a row
    if (enemy.lastMoveId && available.length > 1) {
        const sameCount = enemy.consecutiveSameMove || 0;
        if (sameCount >= 2) {
            available = available.filter(m => m.id !== enemy.lastMoveId);
        }
    }

    const totalWeight = available.reduce((sum, m) => sum + (m.weight || 1), 0);
    let roll = Math.random() * totalWeight;
    for (const move of available) {
        roll -= (move.weight || 1);
        if (roll <= 0) return move;
    }
    return available[available.length - 1];
}

// Resolve damage value (may be range)
function resolveValue(val) {
    if (Array.isArray(val)) {
        return Math.floor(Math.random() * (val[1] - val[0] + 1)) + val[0];
    }
    return val;
}
