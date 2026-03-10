// ============================================
// RELIC SYSTEM - Relic Definitions & Effects
// ============================================

const RelicRarity = { STARTER: 'starter', COMMON: 'common', UNCOMMON: 'uncommon', RARE: 'rare', BOSS: 'boss', SHOP: 'shop', EVENT: 'event' };

const RELIC_DATABASE = {
    // === STARTER ===
    burning_blood: {
        id: 'burning_blood', name: 'バーニングブラッド', sprite: SPRITES.relicBlood,
        rarity: RelicRarity.STARTER,
        description: '戦闘終了時、HP6回復。',
        trigger: 'onCombatEnd', effect: { type: 'heal', amount: 6 }
    },

    // === COMMON ===
    anchor: {
        id: 'anchor', name: 'アンカー', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.COMMON,
        description: '毎戦闘開始時、10ブロックを得る。',
        trigger: 'onCombatStart', effect: { type: 'block', amount: 10 }
    },
    bag_of_marbles: {
        id: 'bag_of_marbles', name: 'ビー玉袋', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.COMMON,
        description: '毎戦闘開始時、全ての敵に1脆弱を付与。',
        trigger: 'onCombatStart', effect: { type: 'vulnerableAll', amount: 1 }
    },
    blood_vial: {
        id: 'blood_vial', name: '血液バイアル', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.COMMON,
        description: '毎戦闘開始時、HP2回復。',
        trigger: 'onCombatStart', effect: { type: 'heal', amount: 2 }
    },
    bronze_scales: {
        id: 'bronze_scales', name: 'ブロンズスケイル', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.COMMON,
        description: '攻撃を受けるたびに3ダメージを返す。',
        trigger: 'onAttacked', effect: { type: 'thorns', amount: 3 }
    },
    centennial_puzzle: {
        id: 'centennial_puzzle', name: '百年パズル', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.COMMON,
        description: '初めてダメージを受けた時、3枚ドロー。',
        trigger: 'onFirstDamage', effect: { type: 'draw', amount: 3 },
        usedThisCombat: false
    },
    lantern: {
        id: 'lantern', name: 'ランタン', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.COMMON,
        description: '毎戦闘開始時、1エネルギーを得る。',
        trigger: 'onCombatStart', effect: { type: 'energy', amount: 1 }
    },
    nunchaku: {
        id: 'nunchaku', name: 'ヌンチャク', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.COMMON,
        description: 'アタックを10回プレイするたびに1エネルギーを得る。',
        trigger: 'onAttackPlayed', effect: { type: 'energy', amount: 1, every: 10 },
        counter: 0
    },
    oddly_smooth_stone: {
        id: 'oddly_smooth_stone', name: 'やけに滑らかな石', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.COMMON,
        description: '毎戦闘開始時、敏捷性1を得る。',
        trigger: 'onCombatStart', effect: { type: 'dexterity', amount: 1 }
    },
    pen_nib: {
        id: 'pen_nib', name: 'ペンニブ', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.COMMON,
        description: 'アタックを10回プレイすると、次のアタックダメージ2倍。',
        trigger: 'onAttackPlayed', effect: { type: 'doubleDamage', every: 10 },
        counter: 0
    },
    vajra: {
        id: 'vajra', name: 'ヴァジュラ', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.COMMON,
        description: '毎戦闘開始時、筋力1を得る。',
        trigger: 'onCombatStart', effect: { type: 'strength', amount: 1 }
    },

    // === UNCOMMON ===
    kunai: {
        id: 'kunai', name: 'クナイ', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.UNCOMMON,
        description: 'アタックを3回プレイするたびに敏捷性1を得る。',
        trigger: 'onAttackPlayed', effect: { type: 'dexterity', amount: 1, every: 3 },
        counter: 0
    },
    shuriken: {
        id: 'shuriken', name: '手裏剣', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.UNCOMMON,
        description: 'アタックを3回プレイするたびに筋力1を得る。',
        trigger: 'onAttackPlayed', effect: { type: 'strength', amount: 1, every: 3 },
        counter: 0
    },
    ornamental_fan: {
        id: 'ornamental_fan', name: '扇子', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.UNCOMMON,
        description: 'アタックを3回プレイするたびに4ブロック。',
        trigger: 'onAttackPlayed', effect: { type: 'block', amount: 4, every: 3 },
        counter: 0
    },
    horn_cleat: {
        id: 'horn_cleat', name: 'ホーンクリート', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.UNCOMMON,
        description: '毎ターン2ターン目に14ブロック。',
        trigger: 'onTurnStart', effect: { type: 'block', amount: 14, onTurn: 2 }
    },
    letter_opener: {
        id: 'letter_opener', name: 'レターオープナー', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.UNCOMMON,
        description: 'スキルを3回プレイするたびに全敵に5ダメージ。',
        trigger: 'onSkillPlayed', effect: { type: 'damageAll', amount: 5, every: 3 },
        counter: 0
    },
    meat_on_the_bone: {
        id: 'meat_on_the_bone', name: '骨付き肉', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.UNCOMMON,
        description: 'HP50%以下で戦闘終了時、HP12回復。',
        trigger: 'onCombatEnd', effect: { type: 'healIfLow', amount: 12, threshold: 0.5 }
    },
    mercury_hourglass: {
        id: 'mercury_hourglass', name: '水銀の砂時計', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.UNCOMMON,
        description: '毎ターン開始時、全ての敵に3ダメージ。',
        trigger: 'onTurnStart', effect: { type: 'damageAll', amount: 3 }
    },
    mummified_hand: {
        id: 'mummified_hand', name: 'ミイラの手', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.UNCOMMON,
        description: 'パワーカードをプレイするたびに、手札のランダムなカードのコストを0にする。',
        trigger: 'onPowerPlayed', effect: { type: 'reduceCost' }
    },
    paper_krane: {
        id: 'paper_krane', name: '折り鶴', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.UNCOMMON,
        description: '弱体化時の攻撃ダメージ減少が25%から40%に増加。',
        trigger: 'passive', effect: { type: 'weaknessIncrease' }
    },
    self_forming_clay: {
        id: 'self_forming_clay', name: '自己成形粘土', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.UNCOMMON,
        description: 'HPを失うたびに次のターン3ブロック。',
        trigger: 'onHPLoss', effect: { type: 'blockNextTurn', amount: 3 }
    },

    // === RARE ===
    dead_branch: {
        id: 'dead_branch', name: '枯れ枝', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.RARE,
        description: 'カードを消滅するたびにランダムなカードを手札に加える。',
        trigger: 'onExhaust', effect: { type: 'addRandomCard' }
    },
    girya: {
        id: 'girya', name: 'ギルヤ', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.RARE,
        description: '焚き火で鍛錬を選択可能。筋力1プラス（最大3回）。',
        trigger: 'rest', effect: { type: 'liftOption', maxUses: 3 },
        uses: 0
    },
    ice_cream: {
        id: 'ice_cream', name: 'アイスクリーム', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.RARE,
        description: 'エネルギーがターンをまたいで保存される。',
        trigger: 'passive', effect: { type: 'conserveEnergy' }
    },
    incense_burner: {
        id: 'incense_burner', name: '香炉', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.RARE,
        description: '6ターンごとに無形を1ターン得る。',
        trigger: 'onTurnEnd', effect: { type: 'intangible', every: 6 },
        counter: 0
    },
    tungsten_rod: {
        id: 'tungsten_rod', name: 'タングステンロッド', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.RARE,
        description: 'HPを失う時、1軽減する。',
        trigger: 'passive', effect: { type: 'reduceHPLoss', amount: 1 }
    },
    torii: {
        id: 'torii', name: '鳥居', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.RARE,
        description: '5以下のダメージを受ける時、1に軽減する。',
        trigger: 'passive', effect: { type: 'reduceLowDamage', threshold: 5 }
    },

    // === BOSS ===
    black_star: {
        id: 'black_star', name: 'ブラックスター', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.BOSS,
        description: 'エリート戦でレリックを追加で1つ獲得。',
        trigger: 'onEliteKill', effect: { type: 'extraRelic' }
    },
    cursed_key: {
        id: 'cursed_key', name: '呪いの鍵', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.BOSS,
        description: '1エネルギー増加。宝箱を開けるとカースを得る。',
        trigger: 'passive', effect: { type: 'extraEnergy', amount: 1 },
        downside: 'curseOnChest'
    },
    ectoplasm: {
        id: 'ectoplasm', name: 'エクトプラズム', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.BOSS,
        description: '1エネルギー増加。ゴールドを得られなくなる。',
        trigger: 'passive', effect: { type: 'extraEnergy', amount: 1 },
        downside: 'noGold'
    },
    runic_dome: {
        id: 'runic_dome', name: 'ルーンドーム', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.BOSS,
        description: '1エネルギー増加。敵のインテントが見えなくなる。',
        trigger: 'passive', effect: { type: 'extraEnergy', amount: 1 },
        downside: 'noIntent'
    },
    snecko_eye: {
        id: 'snecko_eye', name: 'スネッコアイ', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.BOSS,
        description: '毎ターン2枚追加ドロー。引いたカードのコストがランダム(0-3)。',
        trigger: 'onTurnStart', effect: { type: 'drawExtra', amount: 2, randomCost: true }
    },
    velvet_choker: {
        id: 'velvet_choker', name: 'ベルベットチョーカー', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.BOSS,
        description: '1エネルギー増加。1ターンに6枚までしかカードを使えない。',
        trigger: 'passive', effect: { type: 'extraEnergy', amount: 1 },
        downside: 'cardLimit', cardLimit: 6
    },

    // === SHOP ===
    membership_card: {
        id: 'membership_card', name: '会員カード', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.SHOP,
        description: 'ショップの価格が50%OFF。',
        trigger: 'passive', effect: { type: 'shopDiscount', amount: 0.5 }
    },
    hand_drill: {
        id: 'hand_drill', name: 'ハンドドリル', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.SHOP,
        description: '敵のブロックを壊した時、2脆弱を付与。',
        trigger: 'onBlockBreak', effect: { type: 'vulnerable', amount: 2 }
    },
    lee_waffle: {
        id: 'lee_waffle', name: 'ワッフル', sprite: SPRITES.relicGeneric,
        rarity: RelicRarity.SHOP,
        description: '最大HPを7増加。HPを全回復。',
        trigger: 'onPickup', effect: { type: 'maxHPAndHeal', amount: 7 }
    }
};

// === POTION DATABASE ===
const POTION_DATABASE = {
    fire_potion: {
        id: 'fire_potion', name: '火炎ポーション', sprite: SPRITES.potionGeneric,
        description: '敵1体に20ダメージ。',
        target: 'single', effect: { type: 'damage', amount: 20 }
    },
    block_potion: {
        id: 'block_potion', name: '防御ポーション', sprite: SPRITES.potionGeneric,
        description: '12ブロックを得る。',
        target: 'self', effect: { type: 'block', amount: 12 }
    },
    energy_potion: {
        id: 'energy_potion', name: 'エネルギーポーション', sprite: SPRITES.potionGeneric,
        description: '2エネルギーを得る。',
        target: 'self', effect: { type: 'energy', amount: 2 }
    },
    strength_potion: {
        id: 'strength_potion', name: '筋力ポーション', sprite: SPRITES.potionGeneric,
        description: '筋力2を得る。',
        target: 'self', effect: { type: 'strength', amount: 2 }
    },
    dexterity_potion: {
        id: 'dexterity_potion', name: '敏捷ポーション', sprite: SPRITES.potionGeneric,
        description: '敏捷性2を得る。',
        target: 'self', effect: { type: 'dexterity', amount: 2 }
    },
    regen_potion: {
        id: 'regen_potion', name: '再生ポーション', sprite: SPRITES.potionGeneric,
        description: '5ターンの間、毎ターンHP5回復。',
        target: 'self', effect: { type: 'regen', amount: 5, turns: 5 }
    },
    swift_potion: {
        id: 'swift_potion', name: '迅速ポーション', sprite: SPRITES.potionGeneric,
        description: 'カードを3枚ドロー。',
        target: 'self', effect: { type: 'draw', amount: 3 }
    },
    fear_potion: {
        id: 'fear_potion', name: '恐怖ポーション', sprite: SPRITES.potionGeneric,
        description: '敵1体に3脆弱を付与。',
        target: 'single', effect: { type: 'vulnerable', amount: 3 }
    },
    weak_potion: {
        id: 'weak_potion', name: '弱体ポーション', sprite: SPRITES.potionGeneric,
        description: '敵1体に3弱体化を付与。',
        target: 'single', effect: { type: 'weak', amount: 3 }
    },
    poison_potion: {
        id: 'poison_potion', name: '毒ポーション', sprite: SPRITES.potionGeneric,
        description: '敵1体に6毒を付与。',
        target: 'single', effect: { type: 'poison', amount: 6 }
    },
    explosive_potion: {
        id: 'explosive_potion', name: '爆発ポーション', sprite: SPRITES.potionGeneric,
        description: '全ての敵に10ダメージ。',
        target: 'all', effect: { type: 'damageAll', amount: 10 }
    },
    fairy_bottle: {
        id: 'fairy_bottle', name: '妖精ビン', sprite: SPRITES.potionGeneric,
        description: 'HPが0になった時、HP30%で復活。',
        target: 'self', effect: { type: 'revive', amount: 0.3 }
    }
};

function getRandomRelic(rarity = null) {
    let pool = Object.values(RELIC_DATABASE).filter(r => {
        if (r.rarity === RelicRarity.STARTER) return false;
        if (rarity && r.rarity !== rarity) return false;
        return true;
    });
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
}

function getRandomPotion() {
    const pool = Object.values(POTION_DATABASE);
    return pool[Math.floor(Math.random() * pool.length)];
}

function getBossRelicChoices() {
    const pool = Object.values(RELIC_DATABASE).filter(r => r.rarity === RelicRarity.BOSS);
    const shuffled = pool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
}
