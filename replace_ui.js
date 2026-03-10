const fs = require('fs');

// 1. map.js
let mapjs = fs.readFileSync('map.js', 'utf8');
mapjs = mapjs.replace(/const NODE_ICONS = {[\s\S]*?};/, `const NODE_ICONS = {
    [NodeType.MONSTER]: 'nodeMonster',
    [NodeType.ELITE]: 'nodeElite',
    [NodeType.REST]: 'nodeRest',
    [NodeType.SHOP]: 'nodeShop',
    [NodeType.EVENT]: 'nodeEvent',
    [NodeType.TREASURE]: 'nodeTreasure',
    [NodeType.BOSS]: 'nodeBoss'
};`);

mapjs = mapjs.replace(/nodeEl\.textContent = NODE_ICONS\[node\.type\];/, `const spriteId = NODE_ICONS[node.type];
            const sprite = SPRITES[spriteId];
            if (sprite) {
                nodeEl.innerHTML = '<img src="' + SpriteEngine.render(sprite.pixels, sprite.palette) + '" style="width:100%;height:100%;object-fit:contain;image-rendering:pixelated">';
            } else {
                nodeEl.textContent = '❓';
            }`);
fs.writeFileSync('map.js', mapjs);

// 2. ui.js
let uijs = fs.readFileSync('ui.js', 'utf8');

// Insert helper function
const helperFn = `
    function getSpriteImg(spriteObj, className = '') {
        if (!spriteObj) return '';
        const uri = SpriteEngine.render(spriteObj.pixels, spriteObj.palette);
        return '<img src="' + uri + '" class="' + className + '" style="width:100%;height:100%;object-fit:contain;image-rendering:pixelated">';
    }
`;
uijs = uijs.replace(/const \$ = id => document\.getElementById\(id\);/, `const $ = id => document.getElementById(id);\n${helperFn}`);

// 2a. Enemy sprite
uijs = uijs.replace(/sprite\.textContent = enemy\.emoji;/, `sprite.innerHTML = getSpriteImg(enemy.sprite, 'enemy-sprite-img') || enemy.emoji || '👾';`);

// 2b. Card sprite
uijs = uijs.replace(/imgEl\.textContent = card\.icon \|\| '🃏';/, `imgEl.innerHTML = getSpriteImg(card.sprite, 'card-sprite-img') || card.icon || '🃏';`);

// 2c. Reward icons
uijs = uijs.replace(/<span class="reward-icon">\$\{reward\.relic\.emoji\}<\/span>/, `<span class="reward-icon" style="width:24px;height:24px;display:inline-block;vertical-align:middle">\${getSpriteImg(reward.relic.sprite) || reward.relic.emoji}</span>`);
uijs = uijs.replace(/<span class="reward-icon">\$\{reward\.potion\.emoji\}<\/span>/, `<span class="reward-icon" style="width:24px;height:24px;display:inline-block;vertical-align:middle">\${getSpriteImg(reward.potion.sprite) || reward.potion.emoji}</span>`);

// 2d. Shop icons
uijs = uijs.replace(/<span style="font-size:2rem">\$\{relic\.emoji\}<\/span>/, `<div style="width:40px;height:40px;margin:auto">\${getSpriteImg(relic.sprite) || relic.emoji}</div>`);
uijs = uijs.replace(/<span style="font-size:2rem">\$\{potion\.emoji\}<\/span>/, `<div style="width:40px;height:40px;margin:auto">\${getSpriteImg(potion.sprite) || potion.emoji}</div>`);

// 2e. Event images
uijs = uijs.replace(/\$\('event-image'\)\.textContent = event\.emoji;/, `$('event-image').innerHTML = getSpriteImg(event.sprite) || event.emoji || '❓';`);

// 2f. Potion slot
uijs = uijs.replace(/slot\.textContent = gameState\.potions\[i\]\.emoji;/, `slot.innerHTML = getSpriteImg(gameState.potions[i].sprite) || gameState.potions[i].emoji;`);
uijs = uijs.replace(/slot\.textContent = '⬜';/, `slot.innerHTML = '<div style="width:100%;height:100%;border:1px dashed #555;border-radius:50%"></div>';`);

// 2g. Relic modal
uijs = uijs.replace(/<div class="relic-icon-display">\$\{relic\.emoji\}<\/div>/, `<div class="relic-icon-display">\${getSpriteImg(relic.sprite) || relic.emoji}</div>`);

// 2h. Treasure
uijs = uijs.replace(/<div style="font-size:2\.5rem;margin:10px 0">\$\{relic\.emoji\}<\/div>/, `<div style="width:80px;height:80px;margin:10px auto">\${getSpriteImg(relic.sprite) || relic.emoji}</div>`);

fs.writeFileSync('ui.js', uijs);

console.log("UI updates completed.");
