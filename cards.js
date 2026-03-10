// ============================================
// CARD SYSTEM - Card Definitions & Logic
// ============================================

const CardType = { ATTACK: 'attack', SKILL: 'skill', POWER: 'power', STATUS: 'status', CURSE: 'curse' };
const CardRarity = { STARTER: 'starter', COMMON: 'common', UNCOMMON: 'uncommon', RARE: 'rare', SPECIAL: 'special' };

// Card Factory
function createCard(id, overrides = {}) {
    const template = CARD_DATABASE[id];
    if (!template) { console.error('Unknown card:', id); return null; }
    const card = {
        ...JSON.parse(JSON.stringify(template)),
        uid: Math.random().toString(36).substr(2, 9),
        upgraded: false,
        ...overrides
    };
    return card;
}

function upgradeCard(card) {
    if (card.upgraded || !card.upgradeName) return false;
    card.upgraded = true;
    card.name = card.upgradeName;
    if (card.upgradeCost !== undefined) card.cost = card.upgradeCost;
    if (card.upgradeDamage !== undefined) card.damage = card.upgradeDamage;
    if (card.upgradeBlock !== undefined) card.block = card.upgradeBlock;
    if (card.upgradeMagic !== undefined) card.magic = card.upgradeMagic;
    if (card.upgradeDesc) card.description = card.upgradeDesc;
    if (card.upgradeHits !== undefined) card.hits = card.upgradeHits;
    return true;
}

function getCardDescription(card) {
    let desc = card.description;
    if (card.damage !== undefined) desc = desc.replace('{D}', card.damage);
    if (card.block !== undefined) desc = desc.replace('{B}', card.block);
    if (card.magic !== undefined) desc = desc.replace('{M}', card.magic);
    if (card.hits !== undefined) desc = desc.replace('{H}', card.hits);
    return desc;
}

function getRandomCards(count, rarity = null, type = null) {
    let pool = Object.keys(CARD_DATABASE).filter(id => {
        const c = CARD_DATABASE[id];
        if (c.rarity === CardRarity.STARTER || c.rarity === CardRarity.SPECIAL) return false;
        if (c.type === CardType.STATUS || c.type === CardType.CURSE) return false;
        if (rarity && c.rarity !== rarity) return false;
        if (type && c.type !== type) return false;
        return true;
    });
    const result = [];
    while (result.length < count && pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length);
        result.push(pool.splice(idx, 1)[0]);
    }
    return result;
}

function getCardRewardPool(act) {
    const cards = [];
    // Rarity weights: Common 60%, Uncommon 30%, Rare 10%
    for (let i = 0; i < 3; i++) {
        const roll = Math.random();
        let rarity;
        if (roll < 0.6) rarity = CardRarity.COMMON;
        else if (roll < 0.9) rarity = CardRarity.UNCOMMON;
        else rarity = CardRarity.RARE;
        const pool = getRandomCards(1, rarity);
        if (pool.length > 0) cards.push(pool[0]);
    }
    // Ensure unique
    const unique = [...new Set(cards)];
    while (unique.length < 3) {
        const extra = getRandomCards(1);
        if (extra.length > 0 && !unique.includes(extra[0])) unique.push(extra[0]);
    }
    return unique.slice(0, 3).map(id => createCard(id));
}

// ============================================
// CARD DATABASE
// ============================================
const CARD_DATABASE = {
    // === STARTER CARDS ===
    strike: {
        id: 'strike', name: 'ストライク', upgradeName: 'ストライク+',
        type: CardType.ATTACK, rarity: CardRarity.STARTER,
        cost: 1, damage: 6, upgradeDamage: 9,
        sprite: SPRITES.cardAttack, description: '{D}ダメージを与える。',
        upgradeDesc: '{D}ダメージを与える。',
        target: 'single'
    },
    defend: {
        id: 'defend', name: 'ディフェンド', upgradeName: 'ディフェンド+',
        type: CardType.SKILL, rarity: CardRarity.STARTER,
        cost: 1, block: 5, upgradeBlock: 8,
        sprite: SPRITES.cardSkill, description: '{B}ブロックを得る。',
        upgradeDesc: '{B}ブロックを得る。',
        target: 'self'
    },
    bash: {
        id: 'bash', name: 'バッシュ', upgradeName: 'バッシュ+',
        type: CardType.ATTACK, rarity: CardRarity.STARTER,
        cost: 2, damage: 8, upgradeDamage: 10,
        magic: 2, upgradeMagic: 3,
        sprite: SPRITES.cardSkill, description: '{D}ダメージを与え、{M}脆弱を付与する。',
        upgradeDesc: '{D}ダメージを与え、{M}脆弱を付与する。',
        target: 'single',
        effects: [{ type: 'vulnerable', amount: '{M}', target: 'enemy' }]
    },

    // === COMMON ATTACKS ===
    anger: {
        id: 'anger', name: 'アンガー', upgradeName: 'アンガー+',
        type: CardType.ATTACK, rarity: CardRarity.COMMON,
        cost: 0, damage: 6, upgradeDamage: 8,
        sprite: SPRITES.cardAttack, description: '{D}ダメージ。このカードのコピーを捨て札に加える。',
        upgradeDesc: '{D}ダメージ。このカードのコピーを捨て札に加える。',
        target: 'single',
        effects: [{ type: 'copyToDiscard' }]
    },
    cleave: {
        id: 'cleave', name: 'クリーヴ', upgradeName: 'クリーヴ+',
        type: CardType.ATTACK, rarity: CardRarity.COMMON,
        cost: 1, damage: 8, upgradeDamage: 11,
        sprite: SPRITES.cardAttack, description: '全ての敵に{D}ダメージ。',
        upgradeDesc: '全ての敵に{D}ダメージ。',
        target: 'all'
    },
    clothesline: {
        id: 'clothesline', name: 'クロスライン', upgradeName: 'クロスライン+',
        type: CardType.ATTACK, rarity: CardRarity.COMMON,
        cost: 2, damage: 12, upgradeDamage: 14,
        magic: 2, upgradeMagic: 3,
        sprite: SPRITES.cardSkill, description: '{D}ダメージ。{M}弱体化を付与する。',
        upgradeDesc: '{D}ダメージ。{M}弱体化を付与する。',
        target: 'single',
        effects: [{ type: 'weak', amount: '{M}', target: 'enemy' }]
    },
    headbutt: {
        id: 'headbutt', name: 'ヘッドバット', upgradeName: 'ヘッドバット+',
        type: CardType.ATTACK, rarity: CardRarity.COMMON,
        cost: 1, damage: 9, upgradeDamage: 12,
        sprite: SPRITES.cardAttack, description: '{D}ダメージ。捨て札のカード1枚を山札の上に置く。',
        upgradeDesc: '{D}ダメージ。捨て札のカード1枚を山札の上に置く。',
        target: 'single'
    },
    ironWave: {
        id: 'ironWave', name: 'アイアンウェーブ', upgradeName: 'アイアンウェーブ+',
        type: CardType.ATTACK, rarity: CardRarity.COMMON,
        cost: 1, damage: 5, upgradeDamage: 7,
        block: 5, upgradeBlock: 7,
        sprite: SPRITES.cardSkill, description: '{B}ブロックを得る。{D}ダメージ。',
        upgradeDesc: '{B}ブロックを得る。{D}ダメージ。',
        target: 'single'
    },
    pommelStrike: {
        id: 'pommelStrike', name: 'ポンメルストライク', upgradeName: 'ポンメルストライク+',
        type: CardType.ATTACK, rarity: CardRarity.COMMON,
        cost: 1, damage: 9, upgradeDamage: 10,
        magic: 1, upgradeMagic: 2,
        sprite: SPRITES.cardSkill, description: '{D}ダメージ。カードを{M}枚引く。',
        upgradeDesc: '{D}ダメージ。カードを{M}枚引く。',
        target: 'single',
        effects: [{ type: 'draw', amount: '{M}' }]
    },
    twinStrike: {
        id: 'twinStrike', name: 'ツインストライク', upgradeName: 'ツインストライク+',
        type: CardType.ATTACK, rarity: CardRarity.COMMON,
        cost: 1, damage: 5, upgradeDamage: 7,
        hits: 2,
        sprite: SPRITES.cardSkill, description: '{D}ダメージを{H}回与える。',
        upgradeDesc: '{D}ダメージを{H}回与える。',
        target: 'single'
    },
    wildStrike: {
        id: 'wildStrike', name: 'ワイルドストライク', upgradeName: 'ワイルドストライク+',
        type: CardType.ATTACK, rarity: CardRarity.COMMON,
        cost: 1, damage: 12, upgradeDamage: 17,
        sprite: SPRITES.cardAttack, description: '{D}ダメージ。山札にキズを1枚加える。',
        upgradeDesc: '{D}ダメージ。山札にキズを1枚加える。',
        target: 'single',
        effects: [{ type: 'addWound' }]
    },
    bodySlam: {
        id: 'bodySlam', name: 'ボディスラム', upgradeName: 'ボディスラム+',
        type: CardType.ATTACK, rarity: CardRarity.COMMON,
        cost: 1, upgradeCost: 0,
        damage: 0,
        sprite: SPRITES.cardSkill, description: '現在のブロック値に等しいダメージ。',
        upgradeDesc: '現在のブロック値に等しいダメージ。',
        target: 'single',
        effects: [{ type: 'bodySlam' }]
    },
    clash: {
        id: 'clash', name: 'クラッシュ', upgradeName: 'クラッシュ+',
        type: CardType.ATTACK, rarity: CardRarity.COMMON,
        cost: 0, damage: 14, upgradeDamage: 18,
        sprite: SPRITES.cardAttack, description: '手札がアタックのみの時のみ使用可能。{D}ダメージ。',
        upgradeDesc: '手札がアタックのみの時のみ使用可能。{D}ダメージ。',
        target: 'single',
        playCondition: 'onlyAttacks'
    },
    swordBoomerang: {
        id: 'swordBoomerang', name: 'ソードブーメラン', upgradeName: 'ソードブーメラン+',
        type: CardType.ATTACK, rarity: CardRarity.COMMON,
        cost: 1, damage: 3, upgradeDamage: 3,
        hits: 3, upgradeHits: 4,
        sprite: SPRITES.cardSkill, description: 'ランダムな敵に{D}ダメージを{H}回。',
        upgradeDesc: 'ランダムな敵に{D}ダメージを{H}回。',
        target: 'random'
    },

    // === COMMON SKILLS ===
    armaments: {
        id: 'armaments', name: 'アーマメンツ', upgradeName: 'アーマメンツ+',
        type: CardType.SKILL, rarity: CardRarity.COMMON,
        cost: 1, block: 5, upgradeBlock: 5,
        sprite: SPRITES.cardSkill, description: '{B}ブロック。手札のカード1枚をアップグレード。',
        upgradeDesc: '{B}ブロック。手札の全カードをアップグレード。',
        target: 'self'
    },
    shrugItOff: {
        id: 'shrugItOff', name: 'シュラグイットオフ', upgradeName: 'シュラグイットオフ+',
        type: CardType.SKILL, rarity: CardRarity.COMMON,
        cost: 1, block: 8, upgradeBlock: 11,
        magic: 1,
        sprite: SPRITES.cardSkill, description: '{B}ブロック。カードを{M}枚引く。',
        upgradeDesc: '{B}ブロック。カードを{M}枚引く。',
        target: 'self',
        effects: [{ type: 'draw', amount: '{M}' }]
    },
    trueGrit: {
        id: 'trueGrit', name: 'トゥルーグリット', upgradeName: 'トゥルーグリット+',
        type: CardType.SKILL, rarity: CardRarity.COMMON,
        cost: 1, block: 7, upgradeBlock: 9,
        sprite: SPRITES.cardSkill, description: '{B}ブロック。手札からランダムに1枚消滅。',
        upgradeDesc: '{B}ブロック。手札から1枚選んで消滅。',
        target: 'self',
        effects: [{ type: 'exhaustRandom' }]
    },
    warCry: {
        id: 'warCry', name: 'ウォークライ', upgradeName: 'ウォークライ+',
        type: CardType.SKILL, rarity: CardRarity.COMMON,
        cost: 0, magic: 1, upgradeMagic: 2,
        sprite: SPRITES.cardSkill, description: 'カードを{M}枚引く。カード1枚を山札の上に置く。消滅。',
        upgradeDesc: 'カードを{M}枚引く。カード1枚を山札の上に置く。消滅。',
        target: 'self',
        exhaust: true,
        effects: [{ type: 'draw', amount: '{M}' }]
    },
    havoc: {
        id: 'havoc', name: 'ハヴォック', upgradeName: 'ハヴォック+',
        type: CardType.SKILL, rarity: CardRarity.COMMON,
        cost: 1, upgradeCost: 0,
        sprite: SPRITES.cardSkill, description: '山札の一番上のカードをプレイし、消滅させる。',
        upgradeDesc: '山札の一番上のカードをプレイし、消滅させる。',
        target: 'self'
    },
    flex: {
        id: 'flex', name: 'フレックス', upgradeName: 'フレックス+',
        type: CardType.SKILL, rarity: CardRarity.COMMON,
        cost: 0, magic: 2, upgradeMagic: 4,
        sprite: SPRITES.cardSkill, description: '筋力を{M}得る。ターン終了時、筋力を{M}失う。',
        upgradeDesc: '筋力を{M}得る。ターン終了時、筋力を{M}失う。',
        target: 'self',
        effects: [{ type: 'tempStrength', amount: '{M}' }]
    },
    sentinel: {
        id: 'sentinel', name: 'センチネル', upgradeName: 'センチネル+',
        type: CardType.SKILL, rarity: CardRarity.COMMON,
        cost: 1, block: 5, upgradeBlock: 8,
        sprite: SPRITES.cardSkill, description: '{B}ブロック。このカードが消滅すると、{M}エネルギーを得る。',
        upgradeDesc: '{B}ブロック。このカードが消滅すると、{M}エネルギーを得る。',
        magic: 2, upgradeMagic: 3,
        target: 'self'
    },

    // === UNCOMMON ATTACKS ===
    carnage: {
        id: 'carnage', name: 'カーネイジ', upgradeName: 'カーネイジ+',
        type: CardType.ATTACK, rarity: CardRarity.UNCOMMON,
        cost: 2, damage: 20, upgradeDamage: 28,
        sprite: SPRITES.cardSkill, description: 'エセリアル。{D}ダメージ。',
        upgradeDesc: 'エセリアル。{D}ダメージ。',
        target: 'single',
        ethereal: true
    },
    hemokinesis: {
        id: 'hemokinesis', name: 'ヘモキネシス', upgradeName: 'ヘモキネシス+',
        type: CardType.ATTACK, rarity: CardRarity.UNCOMMON,
        cost: 1, damage: 15, upgradeDamage: 20,
        sprite: SPRITES.cardSkill, description: 'HP2を失う。{D}ダメージ。',
        upgradeDesc: 'HP2を失う。{D}ダメージ。',
        target: 'single',
        effects: [{ type: 'loseHP', amount: 2 }]
    },
    pummel: {
        id: 'pummel', name: 'パンメル', upgradeName: 'パンメル+',
        type: CardType.ATTACK, rarity: CardRarity.UNCOMMON,
        cost: 1, damage: 2, hits: 4, upgradeHits: 5,
        sprite: SPRITES.cardSkill, description: '{D}ダメージを{H}回。消滅。',
        upgradeDesc: '{D}ダメージを{H}回。消滅。',
        target: 'single',
        exhaust: true
    },
    rampage: {
        id: 'rampage', name: 'ランページ', upgradeName: 'ランページ+',
        type: CardType.ATTACK, rarity: CardRarity.UNCOMMON,
        cost: 1, damage: 8, upgradeDamage: 8,
        magic: 5, upgradeMagic: 8,
        sprite: SPRITES.cardSkill, description: '{D}ダメージ。この戦闘中、使うたびにダメージが{M}増える。',
        upgradeDesc: '{D}ダメージ。この戦闘中、使うたびにダメージが{M}増える。',
        target: 'single',
        effects: [{ type: 'rampage' }]
    },
    uppercut: {
        id: 'uppercut', name: 'アッパーカット', upgradeName: 'アッパーカット+',
        type: CardType.ATTACK, rarity: CardRarity.UNCOMMON,
        cost: 2, damage: 13, upgradeDamage: 13,
        magic: 1, upgradeMagic: 2,
        sprite: SPRITES.cardSkill, description: '{D}ダメージ。{M}弱体化と{M}脆弱を付与。',
        upgradeDesc: '{D}ダメージ。{M}弱体化と{M}脆弱を付与。',
        target: 'single',
        effects: [
            { type: 'weak', amount: '{M}', target: 'enemy' },
            { type: 'vulnerable', amount: '{M}', target: 'enemy' }
        ]
    },
    dropkick: {
        id: 'dropkick', name: 'ドロップキック', upgradeName: 'ドロップキック+',
        type: CardType.ATTACK, rarity: CardRarity.UNCOMMON,
        cost: 1, damage: 5, upgradeDamage: 8,
        sprite: SPRITES.cardAttack, description: '{D}ダメージ。敵が脆弱状態なら+1エネルギー、カード1枚ドロー。',
        upgradeDesc: '{D}ダメージ。敵が脆弱状態なら+1エネルギー、カード1枚ドロー。',
        target: 'single',
        effects: [{ type: 'dropkick' }]
    },
    whirlwind: {
        id: 'whirlwind', name: 'ワールウィンド', upgradeName: 'ワールウィンド+',
        type: CardType.ATTACK, rarity: CardRarity.UNCOMMON,
        cost: -1, damage: 5, upgradeDamage: 8,
        sprite: SPRITES.cardSkill, description: '全ての敵に{D}ダメージをX回。消滅。',
        upgradeDesc: '全ての敵に{D}ダメージをX回。消滅。',
        target: 'all',
        exhaust: true,
        effects: [{ type: 'whirlwind' }]
    },

    // === UNCOMMON SKILLS ===
    battleTrance: {
        id: 'battleTrance', name: 'バトルトランス', upgradeName: 'バトルトランス+',
        type: CardType.SKILL, rarity: CardRarity.UNCOMMON,
        cost: 0, magic: 3, upgradeMagic: 4,
        sprite: SPRITES.cardSkill, description: 'カードを{M}枚引く。このターン追加のカードを引けなくなる。',
        upgradeDesc: 'カードを{M}枚引く。このターン追加のカードを引けなくなる。',
        target: 'self',
        effects: [{ type: 'draw', amount: '{M}' }, { type: 'noDraw' }]
    },
    bloodletting: {
        id: 'bloodletting', name: 'ブラッドレッティング', upgradeName: 'ブラッドレッティング+',
        type: CardType.SKILL, rarity: CardRarity.UNCOMMON,
        cost: 0, magic: 2, upgradeMagic: 3,
        sprite: SPRITES.cardSkill, description: 'HP3を失う。{M}エネルギー得る。',
        upgradeDesc: 'HP3を失う。{M}エネルギー得る。',
        target: 'self',
        effects: [{ type: 'loseHP', amount: 3 }, { type: 'gainEnergy', amount: '{M}' }]
    },
    disarm: {
        id: 'disarm', name: 'ディスアーム', upgradeName: 'ディスアーム+',
        type: CardType.SKILL, rarity: CardRarity.UNCOMMON,
        cost: 1, magic: 2, upgradeMagic: 3,
        sprite: SPRITES.cardSkill, description: '敵の筋力を{M}減少。消滅。',
        upgradeDesc: '敵の筋力を{M}減少。消滅。',
        target: 'single',
        exhaust: true,
        effects: [{ type: 'reduceStrength', amount: '{M}', target: 'enemy' }]
    },
    entrench: {
        id: 'entrench', name: 'エントレンチ', upgradeName: 'エントレンチ+',
        type: CardType.SKILL, rarity: CardRarity.UNCOMMON,
        cost: 2, upgradeCost: 1,
        sprite: SPRITES.cardSkill, description: '現在のブロックを2倍にする。',
        upgradeDesc: '現在のブロックを2倍にする。',
        target: 'self',
        effects: [{ type: 'doubleBlock' }]
    },
    flameBarrier: {
        id: 'flameBarrier', name: 'フレイムバリア', upgradeName: 'フレイムバリア+',
        type: CardType.SKILL, rarity: CardRarity.UNCOMMON,
        cost: 2, block: 12, upgradeBlock: 16,
        magic: 4, upgradeMagic: 6,
        sprite: SPRITES.cardSkill, description: '{B}ブロック。このターン攻撃を受ける度に{M}ダメージを与える。',
        upgradeDesc: '{B}ブロック。このターン攻撃を受ける度に{M}ダメージを与える。',
        target: 'self',
        effects: [{ type: 'flameBarrier', amount: '{M}' }]
    },
    ghostlyArmor: {
        id: 'ghostlyArmor', name: 'ゴーストアーマー', upgradeName: 'ゴーストアーマー+',
        type: CardType.SKILL, rarity: CardRarity.UNCOMMON,
        cost: 1, block: 10, upgradeBlock: 13,
        sprite: SPRITES.cardSkill, description: 'エセリアル。{B}ブロック。',
        upgradeDesc: 'エセリアル。{B}ブロック。',
        target: 'self',
        ethereal: true
    },
    infernalBlade: {
        id: 'infernalBlade', name: 'インファーナルブレード', upgradeName: 'インファーナルブレード+',
        type: CardType.SKILL, rarity: CardRarity.UNCOMMON,
        cost: 1, upgradeCost: 0,
        sprite: SPRITES.cardSkill, description: 'ランダムなアタックを手札に加える。コスト0。消滅。',
        upgradeDesc: 'ランダムなアタックを手札に加える。コスト0。消滅。',
        target: 'self',
        exhaust: true
    },
    powerThrough: {
        id: 'powerThrough', name: 'パワースルー', upgradeName: 'パワースルー+',
        type: CardType.SKILL, rarity: CardRarity.UNCOMMON,
        cost: 1, block: 15, upgradeBlock: 20,
        sprite: SPRITES.cardSkill, description: '{B}ブロック。手札にキズ2枚を加える。',
        upgradeDesc: '{B}ブロック。手札にキズ2枚を加える。',
        target: 'self',
        effects: [{ type: 'addWoundToHand', amount: 2 }]
    },
    secondWind: {
        id: 'secondWind', name: 'セカンドウィンド', upgradeName: 'セカンドウィンド+',
        type: CardType.SKILL, rarity: CardRarity.UNCOMMON,
        cost: 1, block: 5, upgradeBlock: 7,
        sprite: SPRITES.cardSkill, description: '手札の非アタックカード全てを消滅。それぞれに{B}ブロック。',
        upgradeDesc: '手札の非アタックカード全てを消滅。それぞれに{B}ブロック。',
        target: 'self'
    },
    seeingRed: {
        id: 'seeingRed', name: 'シーイングレッド', upgradeName: 'シーイングレッド+',
        type: CardType.SKILL, rarity: CardRarity.UNCOMMON,
        cost: 1, upgradeCost: 0,
        sprite: SPRITES.cardSkill, description: '2エネルギーを得る。消滅。',
        upgradeDesc: '2エネルギーを得る。消滅。',
        target: 'self',
        exhaust: true,
        effects: [{ type: 'gainEnergy', amount: 2 }]
    },
    shockwave: {
        id: 'shockwave', name: 'ショックウェーブ', upgradeName: 'ショックウェーブ+',
        type: CardType.SKILL, rarity: CardRarity.UNCOMMON,
        cost: 2, magic: 3, upgradeMagic: 5,
        sprite: SPRITES.cardSkill, description: '全ての敵に{M}弱体化と{M}脆弱を付与。消滅。',
        upgradeDesc: '全ての敵に{M}弱体化と{M}脆弱を付与。消滅。',
        target: 'self',
        exhaust: true,
        effects: [{ type: 'weakAll', amount: '{M}' }, { type: 'vulnerableAll', amount: '{M}' }]
    },

    // === RARE ATTACKS ===
    bludgeon: {
        id: 'bludgeon', name: 'ブラッジョン', upgradeName: 'ブラッジョン+',
        type: CardType.ATTACK, rarity: CardRarity.RARE,
        cost: 3, damage: 32, upgradeDamage: 42,
        sprite: SPRITES.cardAttack, description: '{D}ダメージ。',
        upgradeDesc: '{D}ダメージ。',
        target: 'single'
    },
    feed: {
        id: 'feed', name: 'フィード', upgradeName: 'フィード+',
        type: CardType.ATTACK, rarity: CardRarity.RARE,
        cost: 1, damage: 10, upgradeDamage: 12,
        magic: 3, upgradeMagic: 4,
        sprite: SPRITES.cardSkill, description: '{D}ダメージ。この攻撃で敵を倒すと最大HP{M}増加。消滅。',
        upgradeDesc: '{D}ダメージ。この攻撃で敵を倒すと最大HP{M}増加。消滅。',
        target: 'single',
        exhaust: true,
        effects: [{ type: 'feed', amount: '{M}' }]
    },
    fiendFire: {
        id: 'fiendFire', name: 'フィーンドファイア', upgradeName: 'フィーンドファイア+',
        type: CardType.ATTACK, rarity: CardRarity.RARE,
        cost: 2, damage: 7, upgradeDamage: 10,
        sprite: SPRITES.cardAttack, description: '手札のカードを全て消滅。消滅したカード1枚につき{D}ダメージ。消滅。',
        upgradeDesc: '手札のカードを全て消滅。消滅したカード1枚につき{D}ダメージ。消滅。',
        target: 'single',
        exhaust: true,
        effects: [{ type: 'fiendFire' }]
    },
    immolate: {
        id: 'immolate', name: 'イモレイト', upgradeName: 'イモレイト+',
        type: CardType.ATTACK, rarity: CardRarity.RARE,
        cost: 2, damage: 21, upgradeDamage: 28,
        sprite: SPRITES.cardAttack, description: '全ての敵に{D}ダメージ。捨て札にやけど1枚を加える。',
        upgradeDesc: '全ての敵に{D}ダメージ。捨て札にやけど1枚を加える。',
        target: 'all',
        effects: [{ type: 'addBurnToDiscard' }]
    },
    reaper: {
        id: 'reaper', name: 'リーパー', upgradeName: 'リーパー+',
        type: CardType.ATTACK, rarity: CardRarity.RARE,
        cost: 2, damage: 4, upgradeDamage: 5,
        sprite: SPRITES.cardAttack, description: '全ての敵に{D}ダメージ。ブロックされなかったダメージ分HP回復。消滅。',
        upgradeDesc: '全ての敵に{D}ダメージ。ブロックされなかったダメージ分HP回復。消滅。',
        target: 'all',
        exhaust: true,
        effects: [{ type: 'reaper' }]
    },

    // === RARE SKILLS ===
    impervious: {
        id: 'impervious', name: 'インパービアス', upgradeName: 'インパービアス+',
        type: CardType.SKILL, rarity: CardRarity.RARE,
        cost: 2, block: 30, upgradeBlock: 40,
        sprite: SPRITES.cardSkill, description: '{B}ブロック。消滅。',
        upgradeDesc: '{B}ブロック。消滅。',
        target: 'self',
        exhaust: true
    },
    offering: {
        id: 'offering', name: 'オファリング', upgradeName: 'オファリング+',
        type: CardType.SKILL, rarity: CardRarity.RARE,
        cost: 0, magic: 3, upgradeMagic: 5,
        sprite: SPRITES.cardSkill, description: 'HP6を失う。2エネルギーを得る。カードを{M}枚引く。消滅。',
        upgradeDesc: 'HP6を失う。2エネルギーを得る。カードを{M}枚引く。消滅。',
        target: 'self',
        exhaust: true,
        effects: [{ type: 'loseHP', amount: 6 }, { type: 'gainEnergy', amount: 2 }, { type: 'draw', amount: '{M}' }]
    },
    limitBreak: {
        id: 'limitBreak', name: 'リミットブレイク', upgradeName: 'リミットブレイク+',
        type: CardType.SKILL, rarity: CardRarity.RARE,
        cost: 1,
        sprite: SPRITES.cardSkill, description: '筋力を2倍にする。消滅。',
        upgradeDesc: '筋力を2倍にする。',
        target: 'self',
        exhaust: true,
        effects: [{ type: 'doubleStrength' }]
    },
    exhume: {
        id: 'exhume', name: 'エグシューム', upgradeName: 'エグシューム+',
        type: CardType.SKILL, rarity: CardRarity.RARE,
        cost: 1, upgradeCost: 0,
        sprite: SPRITES.cardSkill, description: '消滅パイルのカードを1枚手札に戻す。消滅。',
        upgradeDesc: '消滅パイルのカードを1枚手札に戻す。消滅。',
        target: 'self',
        exhaust: true
    },

    // === COMMON POWERS ===
    inflame: {
        id: 'inflame', name: 'インフレイム', upgradeName: 'インフレイム+',
        type: CardType.POWER, rarity: CardRarity.UNCOMMON,
        cost: 1, magic: 2, upgradeMagic: 3,
        sprite: SPRITES.cardPower, description: '筋力を{M}得る。',
        upgradeDesc: '筋力を{M}得る。',
        target: 'self',
        effects: [{ type: 'strength', amount: '{M}' }]
    },
    metallicize: {
        id: 'metallicize', name: 'メタリサイズ', upgradeName: 'メタリサイズ+',
        type: CardType.POWER, rarity: CardRarity.UNCOMMON,
        cost: 1, magic: 3, upgradeMagic: 4,
        sprite: SPRITES.cardPower, description: '毎ターン終了時、{M}ブロックを得る。',
        upgradeDesc: '毎ターン終了時、{M}ブロックを得る。',
        target: 'self',
        effects: [{ type: 'metallicize', amount: '{M}' }]
    },

    // === RARE POWERS ===
    demonForm: {
        id: 'demonForm', name: 'デーモンフォーム', upgradeName: 'デーモンフォーム+',
        type: CardType.POWER, rarity: CardRarity.RARE,
        cost: 3, magic: 2, upgradeMagic: 3,
        sprite: SPRITES.cardPower, description: '毎ターン開始時、筋力を{M}得る。',
        upgradeDesc: '毎ターン開始時、筋力を{M}得る。',
        target: 'self',
        effects: [{ type: 'demonForm', amount: '{M}' }]
    },
    barricade: {
        id: 'barricade', name: 'バリケード', upgradeName: 'バリケード+',
        type: CardType.POWER, rarity: CardRarity.RARE,
        cost: 3, upgradeCost: 2,
        sprite: SPRITES.cardPower, description: 'ブロックがターン開始時に消えなくなる。',
        upgradeDesc: 'ブロックがターン開始時に消えなくなる。',
        target: 'self',
        effects: [{ type: 'barricade' }]
    },
    brutality: {
        id: 'brutality', name: 'ブルータリティ', upgradeName: 'ブルータリティ+',
        type: CardType.POWER, rarity: CardRarity.UNCOMMON,
        cost: 0,
        sprite: SPRITES.cardPower, description: '毎ターン開始時、HP1を失いカード1枚引く。',
        upgradeDesc: '毎ターン開始時、HP1を失いカード1枚引く。',
        target: 'self',
        effects: [{ type: 'brutality' }]
    },
    corruption: {
        id: 'corruption', name: 'コラプション', upgradeName: 'コラプション+',
        type: CardType.POWER, rarity: CardRarity.RARE,
        cost: 3, upgradeCost: 2,
        sprite: SPRITES.cardPower, description: 'スキルのコストが0になる。使用後消滅する。',
        upgradeDesc: 'スキルのコストが0になる。使用後消滅する。',
        target: 'self',
        effects: [{ type: 'corruption' }]
    },
    juggernaut: {
        id: 'juggernaut', name: 'ジャガーノート', upgradeName: 'ジャガーノート+',
        type: CardType.POWER, rarity: CardRarity.UNCOMMON,
        cost: 2, magic: 5, upgradeMagic: 7,
        sprite: SPRITES.cardPower, description: 'ブロックを得るたびにランダムな敵に{M}ダメージ。',
        upgradeDesc: 'ブロックを得るたびにランダムな敵に{M}ダメージ。',
        target: 'self',
        effects: [{ type: 'juggernaut', amount: '{M}' }]
    },

    // === STATUS CARDS ===
    wound: {
        id: 'wound', name: 'キズ',
        type: CardType.STATUS, rarity: CardRarity.SPECIAL,
        cost: -2, sprite: SPRITES.cardStatus, description: 'プレイ不可。',
        target: 'none', unplayable: true
    },
    dazed: {
        id: 'dazed', name: 'ぼんやり',
        type: CardType.STATUS, rarity: CardRarity.SPECIAL,
        cost: -2, sprite: SPRITES.cardStatus, description: 'プレイ不可。エセリアル。',
        target: 'none', unplayable: true, ethereal: true
    },
    burn: {
        id: 'burn', name: 'やけど',
        type: CardType.STATUS, rarity: CardRarity.SPECIAL,
        cost: -2, sprite: SPRITES.cardStatus, description: 'プレイ不可。ターン終了時、2ダメージ。',
        target: 'none', unplayable: true,
        effects: [{ type: 'burnDamage', amount: 2 }]
    },

    // === CURSE CARDS ===
    ascendersBane: {
        id: 'ascendersBane', name: '登塔者の呪い',
        type: CardType.CURSE, rarity: CardRarity.SPECIAL,
        cost: -2, sprite: SPRITES.cardCurse, description: 'プレイ不可。消滅不可。',
        target: 'none', unplayable: true
    },
    decay: {
        id: 'decay', name: '衰退',
        type: CardType.CURSE, rarity: CardRarity.SPECIAL,
        cost: -2, sprite: SPRITES.cardCurse, description: 'ターン終了時、2ダメージ。',
        target: 'none', unplayable: true
    },
    regret: {
        id: 'regret', name: '後悔',
        type: CardType.CURSE, rarity: CardRarity.SPECIAL,
        cost: -2, sprite: SPRITES.cardCurse, description: 'ターン終了時、手札枚数分のHP失う。',
        target: 'none', unplayable: true
    },
    parasite: {
        id: 'parasite', name: '寄生虫',
        type: CardType.CURSE, rarity: CardRarity.SPECIAL,
        cost: -2, sprite: SPRITES.cardCurse, description: 'プレイ不可。削除時最大HP3減少。',
        target: 'none', unplayable: true
    }
};

function getStarterDeck() {
    const deck = [];
    for (let i = 0; i < 5; i++) deck.push(createCard('strike'));
    for (let i = 0; i < 4; i++) deck.push(createCard('defend'));
    deck.push(createCard('bash'));
    return deck;
}
