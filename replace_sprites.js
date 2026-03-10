const fs = require('fs');

// 1. cards.js
let cards = fs.readFileSync('cards.js', 'utf8');
cards = cards.replace(/icon:\s*['"][^'"]+['"]/g, (match, offset, str) => {
    // Find preceding type to determine sprite
    const beforeStr = str.slice(Math.max(0, offset - 100), offset);
    if (beforeStr.includes('CardType.ATTACK')) return "sprite: SPRITES.cardAttack";
    if (beforeStr.includes('CardType.SKILL')) return "sprite: SPRITES.cardSkill";
    if (beforeStr.includes('CardType.POWER')) return "sprite: SPRITES.cardPower";
    if (beforeStr.includes('CardType.STATUS')) return "sprite: SPRITES.cardStatus";
    if (beforeStr.includes('CardType.CURSE')) return "sprite: SPRITES.cardCurse";
    return "sprite: SPRITES.cardSkill"; // fallback
});
fs.writeFileSync('cards.js', cards);

// 2. enemies.js
let enemies = fs.readFileSync('enemies.js', 'utf8');
enemies = enemies.replace(/emoji:\s*['"][^'"]+['"]/g, "sprite: SPRITES.slimeS"); // Default fallback
const enemySpriteMap = {
    'louse': 'louse',
    'slime_s': 'slimeS',
    'slime_m': 'slimeM',
    'slime_l': 'slimeL',
    'jaw_worm': 'jawWorm',
    'cultist': 'cultist',
    'lagavulin': 'lagavulin',
    'gremlin_nob': 'gremlinNob',
    'sentry': 'sentry',
    'the_guardian': 'theGuardian',
    'hexaghost': 'hexaghost',
    'slime_boss': 'slimeBoss',
    'byrd': 'byrd',
    'chosen': 'chosen',
    'sphere': 'sphere',
    'mugger': 'mugger',
    'looter': 'looter',
    'gremlin_leader': 'gremlinLeader',
    'slaver': 'slavers', // includes different types of slavers
    'book_of_stabbing': 'bookOfStabbing',
    'champ': 'champ',
    'automaton': 'automaton',
    'collector': 'collector',
    'darkling': 'darkling',
    'spire_growth': 'spireGrowth',
    'maw': 'maw',
    'giant_head': 'giantHead',
    'nemesis': 'nemesis',
    'reptomancer': 'reptomancer',
    'dagger': 'daggers',
    'donu': 'donu',
    'deca': 'deca',
    'time_eater': 'timeEater',
    'awakened_one': 'awakenedOne'
};

for (const [key, sprite] of Object.entries(enemySpriteMap)) {
    const regex = new RegExp(`(id:\\s*['"]${key}[^'"]*['"][\\s\\S]*?)sprite:\\s*SPRITES\\.slimeS`, 'g');
    enemies = enemies.replace(regex, `$1sprite: SPRITES.${sprite}`);
}
fs.writeFileSync('enemies.js', enemies);

// 3. relics.js
let relics = fs.readFileSync('relics.js', 'utf8');
relics = relics.replace(/emoji:\s*['"][^'"]+['"]/g, (match, offset, str) => {
    const beforeStr = str.slice(Math.max(0, offset - 150), offset);
    if (beforeStr.includes('POTION_DATABASE =')) return "sprite: SPRITES.potionGeneric";
    // Check if we are inside POTION_DATABASE currently
    let isPotion = false;
    let braceCount = 0;
    const potionIndex = str.indexOf('POTION_DATABASE =');
    if (potionIndex > -1 && offset > potionIndex) isPotion = true;
    
    if (isPotion) return "sprite: SPRITES.potionGeneric";
    
    // Blood relic check
    if (beforeStr.includes('burning_blood')) return "sprite: SPRITES.relicBlood";
    
    return "sprite: SPRITES.relicGeneric";
});

// Fix potential issues where potions might not be caught accurately due to simple check
const relicDbStart = relics.indexOf('const RELIC_DATABASE');
const potionDbStart = relics.indexOf('const POTION_DATABASE');

let relicPart = relics.substring(0, potionDbStart);
relicPart = relicPart.replace(/sprite:\s*SPRITES\.potionGeneric/g, "sprite: SPRITES.relicGeneric");

let potionPart = relics.substring(potionDbStart);
potionPart = potionPart.replace(/sprite:\s*SPRITES\.relicGeneric/g, "sprite: SPRITES.potionGeneric");

fs.writeFileSync('relics.js', relicPart + potionPart);

// 4. events.js
let events = fs.readFileSync('events.js', 'utf8');
events = events.replace(/emoji:\s*['"][^'"]+['"]/g, "sprite: SPRITES.eventGeneric");
fs.writeFileSync('events.js', events);

console.log("Replacement completed.");
