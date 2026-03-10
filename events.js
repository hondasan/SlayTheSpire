// ============================================
// EVENT SYSTEM - Random Event Definitions
// ============================================

const EVENT_DATABASE = {
    // === ACT 1 EVENTS ===
    big_fish: {
        id: 'big_fish', name: '大きな魚', sprite: SPRITES.eventGeneric, act: [1, 2, 3],
        description: '川で巨大な魚を見つけた。不思議な光を放っている...',
        choices: [
            { text: '食べる', desc: 'HP最大まで回復', effects: [{ type: 'healFull' }] },
            { text: 'バナナに変える', desc: 'レリックを1つ入手', effects: [{ type: 'addRelic' }] },
            { text: '立ち去る', desc: '何も起きない', effects: [] }
        ]
    },
    mushrooms: {
        id: 'mushrooms', name: '不思議なキノコ', sprite: SPRITES.eventGeneric, act: [1],
        description: '暗い洞窟の中で奇妙な光るキノコを見つけた。',
        choices: [
            { text: '食べる', desc: 'HP25回復 or HP10失う（50%）', effects: [{ type: 'gamble', win: { type: 'heal', amount: 25 }, lose: { type: 'damage', amount: 10 } }] },
            { text: '踏みつぶす', desc: '戦闘（キノコ獣 × 2）', effects: [{ type: 'fight', enemies: ['fungi_beast'], count: 2, reward: true }] },
            { text: '立ち去る', desc: '', effects: [] }
        ]
    },
    living_wall: {
        id: 'living_wall', name: '生きた壁', sprite: SPRITES.eventGeneric, act: [1, 2],
        description: '壁が生きているように脈打っている。何か提案してくるようだ...',
        choices: [
            { text: '力を捧げる', desc: 'カード1枚を削除', effects: [{ type: 'removeCard' }] },
            { text: '魂を捧げる', desc: 'カード1枚をアップグレード', effects: [{ type: 'upgradeCard' }] },
            { text: '壁を無視する', desc: '', effects: [] }
        ]
    },
    golden_idol: {
        id: 'golden_idol', name: '黄金の偶像', sprite: SPRITES.eventGeneric, act: [1],
        description: '古代の祭壇に黄金の偶像が置かれている。罠のようにも見えるが...',
        choices: [
            { text: '偶像を取る', desc: '250ゴールド。呪いを得る', effects: [{ type: 'gold', amount: 250 }, { type: 'addCurse' }] },
            { text: '立ち去る', desc: '', effects: [] }
        ]
    },
    scrap_ooze: {
        id: 'scrap_ooze', name: 'スクラップウーズ', sprite: SPRITES.eventGeneric, act: [1],
        description: '不気味なスライムがレリックを飲み込んでいる...',
        choices: [
            { text: '手を突っ込む', desc: 'HP 最大の25%ダメージ、レリック入手', effects: [{ type: 'damagePercent', amount: 0.25 }, { type: 'addRelic' }] },
            { text: '立ち去る', desc: '', effects: [] }
        ]
    },
    winding_halls: {
        id: 'winding_halls', name: '曲がりくねった廊下', sprite: SPRITES.eventGeneric, act: [1, 2],
        description: '廊下が終わりなく続いている...',
        choices: [
            { text: '左へ', desc: 'HP10失う、カード追加', effects: [{ type: 'damage', amount: 10 }, { type: 'addRandomCard' }] },
            { text: '右へ', desc: 'HP回復20', effects: [{ type: 'heal', amount: 20 }] },
            { text: '直進', desc: '50ゴールド', effects: [{ type: 'gold', amount: 50 }] }
        ]
    },

    // === ACT 2 EVENTS ===
    the_colosseum: {
        id: 'the_colosseum', name: 'コロッセウム', sprite: SPRITES.eventGeneric, act: [2],
        description: '闘技場の歓声が聞こえる。参加すれば名声とゴールドが手に入るだろう。',
        choices: [
            { text: '参加する', desc: '戦闘。勝利で100ゴールド＋レリック', effects: [{ type: 'fight', enemies: ['chosen'], count: 2, reward: true, bonusGold: 100, bonusRelic: true }] },
            { text: '観客として見る', desc: '25ゴールド', effects: [{ type: 'gold', amount: 25 }] }
        ]
    },
    the_library: {
        id: 'the_library', name: '図書館', sprite: SPRITES.eventGeneric, act: [2, 3],
        description: '古びた図書館を見つけた。知識が詰まった本がずらりと並んでいる。',
        choices: [
            { text: '読む', desc: 'カード3枚から1枚選択', effects: [{ type: 'cardReward', count: 3 }] },
            { text: '寝る', desc: 'HP全体の30%回復', effects: [{ type: 'healPercent', amount: 0.3 }] }
        ]
    },
    forgotten_altar: {
        id: 'forgotten_altar', name: '忘れられた祭壇', sprite: SPRITES.eventGeneric, act: [2],
        description: '古代の祭壇が静かに佇んでいる。捧げ物を求めているようだ。',
        choices: [
            { text: 'ゴールドを捧げる（100）', desc: 'レリック入手', effects: [{ type: 'payGold', amount: 100 }, { type: 'addRelic' }], requirement: { gold: 100 } },
            { text: '血を捧げる', desc: 'HP最大の30%失う、レアカード入手', effects: [{ type: 'damagePercent', amount: 0.3 }, { type: 'addRareCard' }] },
            { text: '立ち去る', desc: '', effects: [] }
        ]
    },
    masked_bandits: {
        id: 'masked_bandits', name: '仮面の盗賊', sprite: SPRITES.eventGeneric, act: [2],
        description: '仮面をつけた盗賊たちに囲まれた！',
        choices: [
            { text: '全ゴールドを渡す', desc: 'ゴールドを全て失う', effects: [{ type: 'loseAllGold' }] },
            { text: '戦う', desc: '戦闘', effects: [{ type: 'fight', enemies: ['blue_slaver'], count: 3, reward: true }] }
        ]
    },
    ancient_writing: {
        id: 'ancient_writing', name: '古代の碑文', sprite: SPRITES.eventGeneric, act: [2, 3],
        description: '古代の文字が壁に刻まれている。読むことができそうだ...',
        choices: [
            { text: '解読する', desc: 'カード1枚アップグレード', effects: [{ type: 'upgradeCard' }] },
            { text: '削り取る', desc: 'カード1枚削除', effects: [{ type: 'removeCard' }] }
        ]
    },

    // === ACT 3 EVENTS ===
    mysterious_sphere: {
        id: 'mysterious_sphere', name: '謎の球体', sprite: SPRITES.eventGeneric, act: [3],
        description: '光り輝く球体が浮かんでいる。触れると何かが起こりそうだ...',
        choices: [
            { text: '触れる', desc: '戦闘→レリック入手', effects: [{ type: 'fight', enemies: ['darkling'], count: 2, reward: true, bonusRelic: true }] },
            { text: '立ち去る', desc: '', effects: [] }
        ]
    },
    secret_portal: {
        id: 'secret_portal', name: '秘密のポータル', sprite: SPRITES.eventGeneric, act: [3],
        description: '壁の裂け目から不思議な光が漏れている...',
        choices: [
            { text: '入る', desc: '次のフロアへスキップ、HP20失う', effects: [{ type: 'damage', amount: 20 }, { type: 'skipFloor' }] },
            { text: '無視する', desc: '', effects: [] }
        ]
    },
    falling: {
        id: 'falling', name: '落下', sprite: SPRITES.eventGeneric, act: [3],
        description: '足元の床が突然抜けた！',
        choices: [
            { text: '着地を試みる', desc: 'HP15失う or HP5失う（50%）', effects: [{ type: 'gamble', win: { type: 'damage', amount: 5 }, lose: { type: 'damage', amount: 15 } }] },
            { text: 'カードを手放す', desc: 'カード1枚失う', effects: [{ type: 'removeCard' }] }
        ]
    },
    mind_bloom: {
        id: 'mind_bloom', name: '精神の華', sprite: SPRITES.eventGeneric, act: [3],
        description: '美しい花が咲き誇る庭園。不思議な力を感じる...',
        choices: [
            { text: '戦いの記憶', desc: 'ボス戦闘（追加レリック）', effects: [{ type: 'fightBoss', bonusRelic: true }] },
            { text: '金の記憶', desc: '999ゴールド、呪い2枚', effects: [{ type: 'gold', amount: 999 }, { type: 'addCurse' }, { type: 'addCurse' }] },
            { text: '安らぎの記憶', desc: 'HP全回復、全カードアップグレード', effects: [{ type: 'healFull' }, { type: 'upgradeAll' }] }
        ]
    },
    tomb_of_lord: {
        id: 'tomb_of_lord', name: '王の墓', sprite: SPRITES.eventGeneric, act: [3],
        description: '荘厳な墓を発見した。宝物が眠っているかもしれない...',
        choices: [
            { text: '墓を暴く', desc: 'レリック入手、呪い追加', effects: [{ type: 'addRelic' }, { type: 'addCurse' }] },
            { text: '祈りを捧げる', desc: 'HP全回復', effects: [{ type: 'healFull' }] },
            { text: '立ち去る', desc: '', effects: [] }
        ]
    }
};

function getRandomEvent(act) {
    const pool = Object.values(EVENT_DATABASE).filter(e => e.act.includes(act));
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
}
