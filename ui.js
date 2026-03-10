// ============================================
// UI SYSTEM - Rendering & User Interaction
// ============================================

const UI = (() => {
    // Cache DOM elements
    const $ = id => document.getElementById(id);

    function getSpriteImg(spriteObj, className = '') {
        if (!spriteObj) return '';
        const uri = SpriteEngine.render(spriteObj.pixels, spriteObj.palette);
        return '<img src="' + uri + '" class="' + className + '" style="width:100%;height:100%;object-fit:contain;image-rendering:pixelated">';
    }

    // Render relic bar (map + combat)
    function renderRelicBar(gameState, containerId) {
        const container = $(containerId);
        if (!container) return;
        container.innerHTML = '';
        for (const relic of gameState.relics) {
            const item = document.createElement('div');
            item.className = 'relic-bar-item';
            item.title = relic.name + ': ' + relic.description;
            item.innerHTML = getSpriteImg(relic.sprite) || relic.emoji || '?';
            container.appendChild(item);
        }
    }

    // Show turn banner
    function showTurnBanner(isPlayerTurn) {
        const banner = $('turn-banner');
        const text = $('turn-banner-text');
        if (!banner || !text) return;

        banner.classList.remove('active', 'enemy-turn');
        // Force reflow for re-animation
        void banner.offsetWidth;

        text.textContent = isPlayerTurn ? 'YOUR TURN' : 'ENEMY TURN';
        if (!isPlayerTurn) banner.classList.add('enemy-turn');
        banner.classList.add('active');

        setTimeout(() => banner.classList.remove('active', 'enemy-turn'), 1600);
    }


    // Show/hide screens
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = $(screenId);
        if (screen) screen.classList.add('active');
    }

    // ==========================================
    // TITLE SCREEN
    // ==========================================
    function initTitleScreen() {
        // Create particles
        const container = $('title-particles');
        container.innerHTML = '';
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.className = 'title-particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (3 + Math.random() * 5) + 's';
            p.style.animationDelay = (Math.random() * 5) + 's';
            p.style.width = (2 + Math.random() * 3) + 'px';
            p.style.height = p.style.width;
            container.appendChild(p);
        }
    }

    // ==========================================
    // MAP SCREEN
    // ==========================================
    function updateMapScreen(gameState) {
        $('map-hp').textContent = gameState.hp;
        $('map-max-hp').textContent = gameState.maxHp;
        $('map-gold').textContent = gameState.gold;
        $('map-act').textContent = gameState.act;
        $('map-floor').textContent = gameState.floor;

        const actNames = { 1: 'Act 1 - 塔の麓', 2: 'Act 2 - 深淵の都市', 3: 'Act 3 - 尖塔の頂' };
        $('act-title').textContent = actNames[gameState.act] || `Act ${gameState.act}`;

        // Render map
        const canvas = $('map-canvas');
        const nodesContainer = $('map-nodes');
        if (gameState.map) {
            renderMap(gameState.map, canvas, nodesContainer);
        }

        // Render relic bar on map
        renderRelicBar(gameState, 'map-relic-bar');
    }

    // ==========================================
    // COMBAT SCREEN
    // ==========================================
    function updateCombat(gameState, combatState) {
        if (!combatState) return;

        // Update player info
        $('combat-hp').textContent = gameState.hp;
        $('combat-max-hp').textContent = gameState.maxHp;
        $('player-hp-text').textContent = `${gameState.hp}/${gameState.maxHp}`;

        // HP bar
        const hpPercent = Math.max(0, (gameState.hp / gameState.maxHp) * 100);
        $('player-hp-bar').style.width = hpPercent + '%';

        // Block
        $('combat-block').textContent = combatState.playerBlock;
        $('block-display').style.display = combatState.playerBlock > 0 ? 'flex' : 'none';

        // Block overlay on HP bar
        const blockPercent = Math.min(100, (combatState.playerBlock / gameState.maxHp) * 100);
        $('player-block-bar').style.width = blockPercent + '%';

        // Energy
        $('energy-current').textContent = combatState.energy;
        $('energy-max').textContent = combatState.maxEnergy;

        // Draw/Discard counts
        $('draw-count').textContent = combatState.drawPile.length;
        $('discard-count').textContent = combatState.discardPile.length;

        // Combat background
        const combatBg = $('combat-bg');
        combatBg.className = 'combat-bg act' + gameState.act;

        // Render enemies
        renderEnemies(combatState, gameState);

        // Render hand
        renderHand(combatState, gameState);

        // Render player buffs
        renderPlayerBuffs(combatState);

        // Render potions
        renderPotions(gameState, combatState);

        // Render relic bar in combat
        renderRelicBar(gameState, 'combat-relic-bar');

        // End turn button state
        $('btn-end-turn').disabled = !combatState.isPlayerTurn;
        $('btn-end-turn').style.opacity = combatState.isPlayerTurn ? '1' : '0.5';
    }

    function renderEnemies(combatState, gameState) {
        const area = $('enemies-area');
        area.innerHTML = '';

        const hideIntent = gameState.relics.some(r => r.downside === 'noIntent');

        for (let i = 0; i < combatState.enemies.length; i++) {
            const enemy = combatState.enemies[i];
            if (enemy.dead) continue;

            const container = document.createElement('div');
            container.className = 'enemy-container';
            container.dataset.enemyIndex = i;

            // Intent
            const intent = document.createElement('div');
            intent.className = 'enemy-intent';
            if (enemy.currentIntent && !hideIntent) {
                const move = enemy.currentIntent;
                const intentInfo = getIntentDisplay(move, enemy);
                intent.className = 'enemy-intent ' + intentInfo.className;
                intent.innerHTML = intentInfo.html;
            } else if (hideIntent) {
                intent.className = 'enemy-intent intent-unknown';
                intent.innerHTML = '❓';
            }
            container.appendChild(intent);

            // Sprite
            const sprite = document.createElement('div');
            sprite.className = 'enemy-sprite';
            sprite.id = 'enemy-sprite-' + enemy.uid;
            sprite.innerHTML = getSpriteImg(enemy.sprite, 'enemy-sprite-img') || enemy.emoji || '👾';
            container.appendChild(sprite);

            // HP bar
            const hpContainer = document.createElement('div');
            hpContainer.className = 'enemy-hp-bar-container';

            const hpBg = document.createElement('div');
            hpBg.className = 'hp-bar-bg';

            const hpFill = document.createElement('div');
            hpFill.className = 'hp-bar-fill';
            hpFill.style.width = Math.max(0, (enemy.hp / enemy.maxHp) * 100) + '%';
            hpBg.appendChild(hpFill);

            if (enemy.block > 0) {
                const blockBar = document.createElement('div');
                blockBar.className = 'hp-bar-block';
                blockBar.style.width = Math.min(100, (enemy.block / enemy.maxHp) * 100) + '%';
                hpBg.appendChild(blockBar);
            }

            hpContainer.appendChild(hpBg);

            const hpText = document.createElement('span');
            hpText.className = 'hp-text';
            hpText.textContent = `${enemy.hp}/${enemy.maxHp}` + (enemy.block > 0 ? ` 🛡️${enemy.block}` : '');
            hpContainer.appendChild(hpText);

            container.appendChild(hpContainer);

            // Enemy name
            const nameEl = document.createElement('span');
            nameEl.className = 'hp-text';
            nameEl.style.fontSize = '0.7rem';
            nameEl.style.color = '#aaa';
            nameEl.textContent = enemy.name;
            container.appendChild(nameEl);

            // Buffs
            const buffsEl = document.createElement('div');
            buffsEl.className = 'enemy-buffs';
            const buffEntries = Object.entries(enemy.buffs).filter(([k, v]) => v && v !== 0);
            for (const [key, val] of buffEntries) {
                const buffEl = document.createElement('span');
                const buffInfo = getBuffDisplay(key, val);
                buffEl.className = 'buff-icon ' + (buffInfo.positive ? 'buff-positive' : 'buff-negative');
                buffEl.textContent = buffInfo.text;
                buffEl.title = buffInfo.tooltip;
                buffsEl.appendChild(buffEl);
            }
            container.appendChild(buffsEl);

            area.appendChild(container);
        }
    }

    function getIntentDisplay(move, enemy) {
        let damage = 0;
        let hits = move.hits || 1;

        if (move.type === 'attack' || move.type === 'attack_defend' || move.type === 'attack_debuff') {
            damage = Array.isArray(move.damage) ? move.damage[1] : (move.damage || 0);
            damage += (enemy.buffs.strength || 0);
            if (enemy.buffs.weak) damage = Math.floor(damage * 0.75);
            damage = Math.max(0, damage);
            if (Array.isArray(hits)) hits = hits[Math.min(enemy.turnCount, hits.length - 1)];
        }

        switch (move.type) {
            case 'attack':
                return {
                    className: 'intent-attack',
                    html: `⚔️ ${damage}${hits > 1 ? ` × ${hits}` : ''}`
                };
            case 'attack_defend':
                return {
                    className: 'intent-attack',
                    html: `⚔️ ${damage} 🛡️`
                };
            case 'attack_debuff':
                return {
                    className: 'intent-attack',
                    html: `⚔️ ${damage}${hits > 1 ? ` × ${hits}` : ''} ⬇️`
                };
            case 'defend':
                return { className: 'intent-defend', html: '🛡️ 防御' };
            case 'buff':
                return { className: 'intent-buff', html: '⬆️ 強化' };
            case 'debuff':
                return { className: 'intent-debuff', html: '⬇️ デバフ' };
            case 'summon':
                return { className: 'intent-buff', html: '📢 召喚' };
            case 'none':
                return { className: 'intent-unknown', html: '💤' };
            default:
                return { className: 'intent-unknown', html: '❓' };
        }
    }

    function getBuffDisplay(key, value) {
        const buffs = {
            strength: { text: `💪${value}`, positive: value > 0, tooltip: `筋力 ${value}` },
            dexterity: { text: `🏃${value}`, positive: value > 0, tooltip: `敏捷性 ${value}` },
            vulnerable: { text: `💥${value}`, positive: false, tooltip: `脆弱 ${value}ターン` },
            weak: { text: `😵${value}`, positive: false, tooltip: `弱体化 ${value}ターン` },
            frail: { text: `🦴${value}`, positive: false, tooltip: `フレイル ${value}ターン` },
            ritual: { text: `🕯️${value}`, positive: true, tooltip: `儀式 ${value}` },
            enrage: { text: `😡${value}`, positive: true, tooltip: `激怒 ${value}` },
            thorns: { text: `🦔${value}`, positive: true, tooltip: `棘 ${value}` },
            poison: { text: `☠️${value}`, positive: false, tooltip: `毒 ${value}` },
            intangible: { text: `👻`, positive: true, tooltip: '無形' },
            flight: { text: `🕊️${value}`, positive: true, tooltip: `飛行 ${value}` },
            demonForm: { text: `😈${value}`, positive: true, tooltip: `デーモンフォーム +${value}筋力/ターン` },
            metallicize: { text: `🔩${value}`, positive: true, tooltip: `メタリサイズ ${value}ブロック/ターン` },
            barricade: { text: `🧱`, positive: true, tooltip: 'バリケード' },
            brutality: { text: `💀`, positive: true, tooltip: 'ブルータリティ' },
            corruption: { text: `☠️`, positive: true, tooltip: 'コラプション' },
            juggernaut: { text: `🛡️${value}`, positive: true, tooltip: `ジャガーノート ${value}` },
            regen: { text: `💚${value}`, positive: true, tooltip: `再生 ${value}/ターン` },
            penNibReady: { text: `✒️2x`, positive: true, tooltip: 'ペンニブ: 次のアタック2倍' },
            conserveEnergy: { text: `🍦`, positive: true, tooltip: 'エネルギー保存' },
            sneckoEye: { text: `🐍`, positive: false, tooltip: '混乱' },
        };
        return buffs[key] || { text: `${key}:${value}`, positive: value > 0, tooltip: key };
    }

    function renderHand(combatState, gameState) {
        const handArea = $('hand-area');
        handArea.innerHTML = '';

        const handSize = combatState.hand.length;
        const maxSpread = 60; // max degree spread
        const spreadAngle = Math.min(maxSpread, handSize * 6);

        for (let i = 0; i < handSize; i++) {
            const card = combatState.hand[i];
            const cardEl = createCardElement(card, gameState, combatState);

            // Fan positioning
            const midIdx = (handSize - 1) / 2;
            const offset = i - midIdx;
            const angle = (spreadAngle / Math.max(handSize - 1, 1)) * offset;
            const yOffset = Math.abs(offset) * 5;

            cardEl.style.transform = `rotate(${angle * 0.5}deg) translateY(${yOffset}px)`;
            cardEl.style.zIndex = i + 1;
            cardEl.dataset.handIndex = i;

            // Can play check
            if (!combatState.isPlayerTurn || !CombatManager.canPlayCard(card, gameState)) {
                cardEl.classList.add('unplayable');
            }

            // Click to play
            cardEl.addEventListener('click', (e) => {
                if (!combatState.isPlayerTurn) return;
                if (cardEl.classList.contains('unplayable')) {
                    AudioSystem.play('error');
                    return;
                }
                handleCardClick(card, gameState);
            });

            handArea.appendChild(cardEl);
        }
    }

    function createCardElement(card, gameState, combatState) {
        const el = document.createElement('div');
        el.className = `card ${card.type}`;
        if (card.upgraded) el.classList.add('upgraded');

        // Cost
        if (card.cost >= 0) {
            const costEl = document.createElement('div');
            costEl.className = 'card-cost';
            let displayCost = card.cost;
            if (combatState && combatState.playerBuffs?.corruption && card.type === CardType.SKILL) {
                displayCost = 0;
            }
            costEl.textContent = displayCost;
            el.appendChild(costEl);
        } else if (card.cost === -1) {
            const costEl = document.createElement('div');
            costEl.className = 'card-cost';
            costEl.textContent = 'X';
            el.appendChild(costEl);
        }

        // Name
        const nameEl = document.createElement('div');
        nameEl.className = 'card-name';
        nameEl.textContent = card.name;
        el.appendChild(nameEl);

        // Image
        const imgEl = document.createElement('div');
        imgEl.className = 'card-image';
        imgEl.innerHTML = getSpriteImg(card.sprite, 'card-sprite-img') || card.icon || '🃏';
        el.appendChild(imgEl);

        // Type line
        const typeLine = document.createElement('div');
        typeLine.className = 'card-type-line';
        const typeNames = {
            [CardType.ATTACK]: 'アタック',
            [CardType.SKILL]: 'スキル',
            [CardType.POWER]: 'パワー',
            [CardType.STATUS]: 'ステータス',
            [CardType.CURSE]: 'カース'
        };
        typeLine.textContent = typeNames[card.type] || card.type;
        el.appendChild(typeLine);

        // Description
        const descEl = document.createElement('div');
        descEl.className = 'card-desc';
        let desc = getCardDescription(card);

        // Add damage with strength for attacks
        if (card.type === CardType.ATTACK && combatState) {
            const str = combatState.playerBuffs?.strength || 0;
            if (str !== 0 && card.damage !== undefined) {
                const totalDmg = Math.max(0, card.damage + str);
                desc = desc.replace(`${card.damage}ダメージ`, `<span class="damage-num">${totalDmg}</span>ダメージ`);
            }
        }

        // Add block with dexterity
        if (card.block && combatState) {
            const dex = combatState.playerBuffs?.dexterity || 0;
            if (dex !== 0) {
                const totalBlock = Math.max(0, card.block + dex);
                desc = desc.replace(`${card.block}ブロック`, `<span class="block-num">${totalBlock}</span>ブロック`);
            }
        }

        descEl.innerHTML = desc;
        el.appendChild(descEl);

        // Rarity bar
        const rarityBar = document.createElement('div');
        rarityBar.className = `card-rarity-bar ${card.rarity}`;
        el.appendChild(rarityBar);

        return el;
    }

    let selectedCard = null;
    let targetMode = false;

    function handleCardClick(card, gameState) {
        const combatState = CombatManager.getState();
        if (!combatState || !combatState.isPlayerTurn) return;

        // Self-targeting or AOE cards
        if (card.target === 'self' || card.target === 'all' || card.target === 'random' || card.type === CardType.POWER) {
            CombatManager.playCard(card, null, gameState);
            return;
        }

        // Single target: need to select enemy
        const aliveEnemies = combatState.enemies.filter(e => !e.dead);
        if (aliveEnemies.length === 1) {
            // Auto-target single enemy
            const idx = combatState.enemies.indexOf(aliveEnemies[0]);
            CombatManager.playCard(card, idx, gameState);
            return;
        }

        // Multiple enemies: enter target mode
        selectedCard = card;
        targetMode = true;
        highlightTargetableEnemies(true);
    }

    function highlightTargetableEnemies(highlight) {
        document.querySelectorAll('.enemy-container').forEach(el => {
            if (highlight) {
                el.classList.add('targeted');
                el.style.cursor = 'crosshair';
            } else {
                el.classList.remove('targeted');
                el.style.cursor = 'pointer';
            }
        });
    }

    // ==========================================
    // POPUPS & EFFECTS
    // ==========================================
    function showPopup(targetId, text, type) {
        const container = $('popup-container');
        const popup = document.createElement('div');
        popup.className = `damage-popup ${type}`;
        popup.textContent = text;

        let x, y;
        if (targetId === 'player') {
            const playerEl = $('player-character');
            if (playerEl) {
                const rect = playerEl.getBoundingClientRect();
                x = rect.left + rect.width / 2;
                y = rect.top;
            } else {
                x = window.innerWidth / 2;
                y = window.innerHeight * 0.6;
            }
        } else {
            const enemyEl = document.getElementById('enemy-sprite-' + targetId);
            if (enemyEl) {
                const rect = enemyEl.getBoundingClientRect();
                x = rect.left + rect.width / 2;
                y = rect.top;
            } else {
                x = window.innerWidth / 2;
                y = window.innerHeight * 0.3;
            }
        }

        // Add some randomness
        x += (Math.random() - 0.5) * 40;
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';

        container.appendChild(popup);
        setTimeout(() => popup.remove(), 1000);
    }

    function shakeEnemy(uid) {
        const el = document.getElementById('enemy-sprite-' + uid);
        if (el) {
            el.classList.add('hit');
            setTimeout(() => el.classList.remove('hit'), 300);
        }
    }

    function shakePlayer() {
        const el = document.querySelector('.player-sprite');
        if (el) {
            el.classList.add('hit');
            setTimeout(() => el.classList.remove('hit'), 400);
        }
        // Screen shake
        const combatScreen = $('combat-screen');
        combatScreen.classList.add('screen-shake');
        setTimeout(() => combatScreen.classList.remove('screen-shake'), 300);
    }

    function screenFlash() {
        const flash = document.createElement('div');
        flash.className = 'screen-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
    }

    // ==========================================
    // REWARD SCREEN
    // ==========================================
    function showRewards(gameState, rewards) {
        showScreen('reward-screen');
        const list = $('reward-list');
        list.innerHTML = '';

        for (const reward of rewards) {
            const item = document.createElement('div');
            item.className = 'reward-item';

            switch (reward.type) {
                case 'gold':
                    item.innerHTML = `<span class="reward-icon">💰</span><span>${reward.amount} ゴールド</span>`;
                    item.addEventListener('click', () => {
                        if (!gameState.relics.some(r => r.downside === 'noGold')) {
                            gameState.gold += reward.amount;
                            AudioSystem.play('gold');
                        }
                        item.style.display = 'none';
                    });
                    break;
                case 'card':
                    item.innerHTML = `<span class="reward-icon">🃏</span><span>カード報酬</span>`;
                    item.addEventListener('click', () => {
                        showCardReward(gameState, reward.cards);
                        item.style.display = 'none';
                    });
                    break;
                case 'relic':
                    item.innerHTML = `<span class="reward-icon" style="width:24px;height:24px;display:inline-block;vertical-align:middle">${getSpriteImg(reward.relic.sprite) || reward.relic.emoji}</span><span>${reward.relic.name}</span>`;
                    item.addEventListener('click', () => {
                        addRelic(gameState, reward.relic);
                        item.style.display = 'none';
                    });
                    break;
                case 'potion':
                    item.innerHTML = `<span class="reward-icon" style="width:24px;height:24px;display:inline-block;vertical-align:middle">${getSpriteImg(reward.potion.sprite) || reward.potion.emoji}</span><span>${reward.potion.name}</span>`;
                    item.addEventListener('click', () => {
                        addPotion(gameState, reward.potion);
                        item.style.display = 'none';
                    });
                    break;
            }

            list.appendChild(item);
        }
    }

    function showCardReward(gameState, cards) {
        showScreen('card-reward-screen');
        const list = $('card-reward-list');
        list.innerHTML = '';

        for (const card of cards) {
            const cardEl = createCardElement(card, gameState, null);
            cardEl.addEventListener('click', () => {
                gameState.deck.push(card);
                AudioSystem.play('cardPlay');
                showScreen('reward-screen');
            });
            list.appendChild(cardEl);
        }
    }

    function addRelic(gameState, relic) {
        // Check if already owned
        if (gameState.relics.some(r => r.id === relic.id)) return;

        const relicInstance = { ...relic };
        gameState.relics.push(relicInstance);
        AudioSystem.play('powerUp');

        // On pickup effects
        if (relic.effect?.type === 'maxHPAndHeal') {
            gameState.maxHp += relic.effect.amount;
            gameState.hp = gameState.maxHp;
        }

        // Extra energy relics
        if (relic.effect?.type === 'extraEnergy') {
            gameState.maxEnergy += relic.effect.amount;
        }

        showPopup('player', relic.name + '!', 'buff');
    }

    function addPotion(gameState, potion) {
        const emptyIdx = gameState.potions.findIndex(p => p === null);
        if (emptyIdx >= 0) {
            gameState.potions[emptyIdx] = { ...potion };
            AudioSystem.play('powerUp');
        }
    }

    // ==========================================
    // POTIONS IN COMBAT
    // ==========================================
    function renderPotions(gameState, combatState) {
        const container = $('potion-slots');
        container.innerHTML = '';

        for (let i = 0; i < gameState.potions.length; i++) {
            const slot = document.createElement('div');
            slot.className = 'potion-slot' + (gameState.potions[i] ? '' : ' empty');

            if (gameState.potions[i]) {
                slot.innerHTML = getSpriteImg(gameState.potions[i].sprite) || gameState.potions[i].emoji;
                slot.title = `${gameState.potions[i].name}: ${gameState.potions[i].description}`;

                const potionIdx = i;
                slot.addEventListener('click', () => {
                    if (!combatState || !combatState.isPlayerTurn) return;

                    const potion = gameState.potions[potionIdx];
                    if (!potion) return;

                    if (potion.target === 'single') {
                        // Need target selection
                        const aliveEnemies = combatState.enemies.filter(e => !e.dead);
                        if (aliveEnemies.length === 1) {
                            const idx = combatState.enemies.indexOf(aliveEnemies[0]);
                            CombatManager.usePotion(potionIdx, idx, gameState);
                        } else {
                            selectedCard = null;
                            targetMode = true;
                            window._potionUseIndex = potionIdx;
                            highlightTargetableEnemies(true);
                        }
                    } else {
                        CombatManager.usePotion(potionIdx, null, gameState);
                    }
                });
            } else {
                slot.innerHTML = '<div style="width:100%;height:100%;border:1px dashed #555;border-radius:50%"></div>';
            }

            container.appendChild(slot);
        }
    }

    // ==========================================
    // REST SITE
    // ==========================================
    function showRestSite(gameState) {
        showScreen('rest-screen');
    }

    // ==========================================
    // SHOP
    // ==========================================
    function showShop(gameState) {
        showScreen('shop-screen');
        $('shop-gold').textContent = gameState.gold;

        const discount = gameState.relics.some(r => r.id === 'membership_card') ? 0.5 : 1;

        // Generate shop cards
        const shopCardsEl = $('shop-cards');
        shopCardsEl.innerHTML = '';
        const shopCards = [];
        for (let i = 0; i < 5; i++) {
            const rarity = i < 3 ? CardRarity.COMMON : (i < 4 ? CardRarity.UNCOMMON : CardRarity.RARE);
            const pool = getRandomCards(1, rarity);
            if (pool.length > 0) shopCards.push(createCard(pool[0]));
        }

        for (const card of shopCards) {
            const price = Math.floor(getCardPrice(card) * discount);
            const item = document.createElement('div');
            item.className = 'shop-item';

            const cardEl = createCardElement(card, gameState, null);
            cardEl.style.transform = 'none';
            item.appendChild(cardEl);

            const priceEl = document.createElement('div');
            priceEl.className = 'shop-price';
            priceEl.textContent = `💰 ${price}`;
            item.appendChild(priceEl);

            item.addEventListener('click', () => {
                if (gameState.gold >= price && !item.classList.contains('sold')) {
                    gameState.gold -= price;
                    gameState.deck.push(card);
                    item.classList.add('sold');
                    $('shop-gold').textContent = gameState.gold;
                    AudioSystem.play('shop');
                } else {
                    AudioSystem.play('error');
                }
            });

            shopCardsEl.appendChild(item);
        }

        // Generate shop relics
        const shopRelicsEl = $('shop-relics');
        shopRelicsEl.innerHTML = '';
        const shopRelicItems = [];
        for (let i = 0; i < 3; i++) {
            const relic = getRandomRelic(i === 2 ? RelicRarity.SHOP : null);
            if (relic && !gameState.relics.some(r => r.id === relic.id)) {
                shopRelicItems.push(relic);
            }
        }

        for (const relic of shopRelicItems) {
            const price = Math.floor(getRelicPrice(relic) * discount);
            const item = document.createElement('div');
            item.className = 'shop-item';
            item.innerHTML = `
                <div style="width:40px;height:40px;margin:auto">${getSpriteImg(relic.sprite) || relic.emoji}</div>
                <span style="font-size:0.8rem">${relic.name}</span>
                <span style="font-size:0.7rem;color:#999">${relic.description}</span>
                <div class="shop-price">💰 ${price}</div>
            `;

            item.addEventListener('click', () => {
                if (gameState.gold >= price && !item.classList.contains('sold')) {
                    gameState.gold -= price;
                    addRelic(gameState, relic);
                    item.classList.add('sold');
                    $('shop-gold').textContent = gameState.gold;
                    AudioSystem.play('shop');
                } else {
                    AudioSystem.play('error');
                }
            });

            shopRelicsEl.appendChild(item);
        }

        // Generate shop potions
        const shopPotionsEl = $('shop-potions');
        shopPotionsEl.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const potion = getRandomPotion();
            const price = Math.floor(50 * discount);
            const item = document.createElement('div');
            item.className = 'shop-item';
            item.innerHTML = `
                <div style="width:40px;height:40px;margin:auto">${getSpriteImg(potion.sprite) || potion.emoji}</div>
                <span style="font-size:0.8rem">${potion.name}</span>
                <span style="font-size:0.7rem;color:#999">${potion.description}</span>
                <div class="shop-price">💰 ${price}</div>
            `;

            item.addEventListener('click', () => {
                if (gameState.gold >= price && !item.classList.contains('sold')) {
                    gameState.gold -= price;
                    addPotion(gameState, potion);
                    item.classList.add('sold');
                    $('shop-gold').textContent = gameState.gold;
                    AudioSystem.play('shop');
                } else {
                    AudioSystem.play('error');
                }
            });

            shopPotionsEl.appendChild(item);
        }

        // Card removal
        const removePrice = Math.floor(75 * discount);
        $('btn-remove-card').textContent = `カード削除（${removePrice}💰）`;
    }

    function getCardPrice(card) {
        const prices = {
            [CardRarity.COMMON]: [45, 55],
            [CardRarity.UNCOMMON]: [68, 82],
            [CardRarity.RARE]: [135, 165]
        };
        const range = prices[card.rarity] || [50, 60];
        return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
    }

    function getRelicPrice(relic) {
        const prices = {
            [RelicRarity.COMMON]: [150, 160],
            [RelicRarity.UNCOMMON]: [250, 270],
            [RelicRarity.RARE]: [280, 310],
            [RelicRarity.SHOP]: [140, 160]
        };
        const range = prices[relic.rarity] || [200, 220];
        return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
    }

    // ==========================================
    // EVENT SCREEN
    // ==========================================
    function showEvent(gameState, event) {
        showScreen('event-screen');
        $('event-image').innerHTML = getSpriteImg(event.sprite) || event.emoji || '❓';
        $('event-title').textContent = event.name;
        $('event-description').textContent = event.description;

        const choicesEl = $('event-choices');
        choicesEl.innerHTML = '';

        for (const choice of event.choices) {
            // Check requirements
            if (choice.requirement) {
                if (choice.requirement.gold && gameState.gold < choice.requirement.gold) continue;
            }

            const btn = document.createElement('div');
            btn.className = 'event-choice';
            btn.innerHTML = `
                <div>${choice.text}</div>
                ${choice.desc ? `<div class="event-choice-result">${choice.desc}</div>` : ''}
            `;

            btn.addEventListener('click', () => {
                AudioSystem.play('click');
                window.Game.processEventChoice(choice, gameState);
            });

            choicesEl.appendChild(btn);
        }
    }

    // ==========================================
    // UPGRADE SCREEN
    // ==========================================
    function showUpgradeScreen(gameState, callback) {
        showScreen('upgrade-screen');
        const list = $('upgrade-card-list');
        list.innerHTML = '';

        const upgradeable = gameState.deck.filter(c => !c.upgraded && c.upgradeName);

        for (const card of upgradeable) {
            const cardEl = createCardElement(card, gameState, null);
            cardEl.addEventListener('click', () => {
                upgradeCard(card);
                AudioSystem.play('powerUp');
                showPopup('player', card.name + ' アップグレード!', 'buff');
                if (callback) callback();
            });
            list.appendChild(cardEl);
        }
    }

    // ==========================================
    // CARD REMOVAL SCREEN
    // ==========================================
    function showCardRemoveScreen(gameState, callback) {
        showScreen('card-remove-screen');
        const list = $('remove-card-list');
        list.innerHTML = '';

        for (let i = 0; i < gameState.deck.length; i++) {
            const card = gameState.deck[i];
            const cardEl = createCardElement(card, gameState, null);
            const idx = i;
            cardEl.addEventListener('click', () => {
                gameState.deck.splice(idx, 1);
                AudioSystem.play('click');
                showPopup('player', card.name + ' を削除!', 'debuff');
                if (callback) callback();
            });
            list.appendChild(cardEl);
        }
    }

    // ==========================================
    // DECK VIEW MODAL
    // ==========================================
    function showDeckModal(gameState) {
        const modal = $('deck-modal');
        modal.classList.add('active');

        const list = $('deck-card-list');
        list.innerHTML = '';

        const sortedDeck = [...gameState.deck].sort((a, b) => {
            const typeOrder = { attack: 0, skill: 1, power: 2, status: 3, curse: 4 };
            return (typeOrder[a.type] || 5) - (typeOrder[b.type] || 5);
        });

        for (const card of sortedDeck) {
            const cardEl = createCardElement(card, gameState, null);
            cardEl.style.cursor = 'default';
            list.appendChild(cardEl);
        }
    }

    function showRelicModal(gameState) {
        const modal = $('relic-modal');
        modal.classList.add('active');

        const list = $('relic-list-modal');
        list.innerHTML = '';

        for (const relic of gameState.relics) {
            const item = document.createElement('div');
            item.className = 'relic-item';
            item.innerHTML = `
                <div class="relic-icon-display">${getSpriteImg(relic.sprite) || relic.emoji}</div>
                <div class="relic-info">
                    <div class="relic-name">${relic.name}</div>
                    <div class="relic-desc">${relic.description}</div>
                </div>
            `;
            list.appendChild(item);
        }
    }

    // ==========================================
    // GAME OVER / VICTORY
    // ==========================================
    function showGameOver(gameState, victory) {
        const screenId = victory ? 'victory-screen' : 'gameover-screen';
        showScreen(screenId);

        const statsEl = $(victory ? 'victory-stats' : 'gameover-stats');
        statsEl.innerHTML = `
            <div><span>到達フロア</span><span>Act ${gameState.act} - Floor ${gameState.floor}</span></div>
            <div><span>デッキ枚数</span><span>${gameState.deck.length}</span></div>
            <div><span>獲得ゴールド</span><span>${gameState.totalGoldEarned || gameState.gold}</span></div>
            <div><span>レリック数</span><span>${gameState.relics.length}</span></div>
            <div><span>戦闘回数</span><span>${gameState.combatCount || 0}</span></div>
        `;
    }

    // ==========================================
    // TREASURE
    // ==========================================
    function showTreasure(gameState, relic) {
        showScreen('treasure-screen');
        const content = $('treasure-content');
        content.innerHTML = `
            <div style="width:80px;height:80px;margin:10px auto">${getSpriteImg(relic.sprite) || relic.emoji}</div>
            <div style="font-weight:700;margin-bottom:5px">${relic.name}</div>
            <div style="font-size:0.9rem;color:#999">${relic.description}</div>
        `;
    }

    // ==========================================
    // PLAYER BUFFS
    // ==========================================
    function renderPlayerBuffs(combatState) {
        const container = $('player-buffs');
        container.innerHTML = '';

        const buffs = combatState.playerBuffs;
        for (const [key, val] of Object.entries(buffs)) {
            if (!val || val === 0 || key === 'tempStrength' || key === 'savedEnergy' || key === 'cardLimit') continue;
            const buffInfo = getBuffDisplay(key, val);
            const el = document.createElement('span');
            el.className = 'buff-icon ' + (buffInfo.positive ? 'buff-positive' : 'buff-negative');
            el.textContent = buffInfo.text;
            el.title = buffInfo.tooltip;
            container.appendChild(el);
        }
    }

    return {
        showScreen,
        initTitleScreen,
        updateMapScreen,
        updateCombat,
        showPopup,
        shakeEnemy,
        shakePlayer,
        screenFlash,
        showRewards,
        showCardReward,
        showRestSite,
        showShop,
        showEvent,
        showUpgradeScreen,
        showCardRemoveScreen,
        showDeckModal,
        showRelicModal,
        showGameOver,
        showTreasure,
        addRelic,
        addPotion,
        renderPotions,
        createCardElement,

        // Getter for target mode
        get targetMode() { return targetMode; },
        set targetMode(v) { targetMode = v; },
        get selectedCard() { return selectedCard; },
        set selectedCard(v) { selectedCard = v; },
        highlightTargetableEnemies,
        showTurnBanner
    };
})();
