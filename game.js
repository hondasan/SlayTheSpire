// ============================================
// GAME ENGINE - Main State & Flow Control
// ============================================

window.Game = (() => {
    let gameState = null;

    function createNewGame() {
        gameState = {
            hp: 80,
            maxHp: 80,
            gold: 99,
            deck: getStarterDeck(),
            relics: [{ ...RELIC_DATABASE.burning_blood }],
            potions: [null, null, null],
            act: 1,
            floor: 0,
            map: null,
            maxEnergy: 3,
            combatBuffs: {},
            combatCount: 0,
            totalGoldEarned: 99,
            currentNode: null
        };

        // Generate map for Act 1
        gameState.map = generateMap(1);

        // Show map
        UI.showScreen('map-screen');
        UI.updateMapScreen(gameState);

        // Setup map click handlers
        setupMapListeners();
    }

    function setupMapListeners() {
        const nodesContainer = document.getElementById('map-nodes');

        nodesContainer.addEventListener('click', (e) => {
            const nodeEl = e.target.closest('.map-node');
            if (!nodeEl) return;

            const nodeId = nodeEl.dataset.nodeId;
            const node = findNodeById(gameState.map, nodeId);
            if (!node || !node.available) {
                AudioSystem.play('error');
                return;
            }

            AudioSystem.play('click');
            visitNode(node);
        });
    }

    function visitNode(node) {
        // Update map
        updateMapAvailability(gameState.map, node.id);
        gameState.floor++;
        gameState.currentNode = node;

        switch (node.type) {
            case NodeType.MONSTER:
                startCombat('normal');
                break;
            case NodeType.ELITE:
                startCombat('elite');
                break;
            case NodeType.BOSS:
                startCombat('boss');
                break;
            case NodeType.REST:
                UI.showRestSite(gameState);
                break;
            case NodeType.SHOP:
                UI.showShop(gameState);
                break;
            case NodeType.EVENT:
                const event = getRandomEvent(gameState.act);
                if (event) {
                    UI.showEvent(gameState, event);
                } else {
                    returnToMap();
                }
                break;
            case NodeType.TREASURE:
                openTreasure();
                break;
        }
    }

    // ==========================================
    // COMBAT
    // ==========================================
    function startCombat(type) {
        const enemies = getEnemyEncounter(gameState.act, type);
        if (enemies.length === 0) {
            returnToMap();
            return;
        }

        gameState.combatCount++;
        UI.showScreen('combat-screen');
        CombatManager.initCombat(gameState, enemies);

        // Setup enemy click handler for targeting
        setupCombatListeners();
    }

    function setupCombatListeners() {
        const enemiesArea = document.getElementById('enemies-area');

        // Remove old listeners by replacing
        const newArea = enemiesArea.cloneNode(false);
        enemiesArea.parentNode.replaceChild(newArea, enemiesArea);

        newArea.id = 'enemies-area';

        newArea.addEventListener('click', (e) => {
            const enemyContainer = e.target.closest('.enemy-container');
            if (!enemyContainer) return;

            const enemyIndex = parseInt(enemyContainer.dataset.enemyIndex);
            const combatState = CombatManager.getState();
            if (!combatState || !combatState.isPlayerTurn) return;

            if (UI.targetMode) {
                // Card targeting
                if (UI.selectedCard) {
                    CombatManager.playCard(UI.selectedCard, enemyIndex, gameState);
                    UI.selectedCard = null;
                    UI.targetMode = false;
                    UI.highlightTargetableEnemies(false);
                }
                // Potion targeting
                else if (window._potionUseIndex !== undefined) {
                    CombatManager.usePotion(window._potionUseIndex, enemyIndex, gameState);
                    window._potionUseIndex = undefined;
                    UI.targetMode = false;
                    UI.highlightTargetableEnemies(false);
                }
            }
        });

        // Re-render enemies
        const combatState = CombatManager.getState();
        if (combatState) {
            UI.updateCombat(gameState, combatState);
        }
    }

    function onCombatEnd(victory) {
        if (victory) {
            const combatState = CombatManager.getState();
            const nodeType = gameState.currentNode?.type;

            // Generate rewards
            const rewards = [];

            // Gold reward
            const goldBase = nodeType === 'boss' ? [90, 120] :
                            nodeType === 'elite' ? [25, 35] : [10, 20];
            const goldAmount = Math.floor(Math.random() * (goldBase[1] - goldBase[0] + 1)) + goldBase[0];
            if (!gameState.relics.some(r => r.downside === 'noGold')) {
                rewards.push({ type: 'gold', amount: goldAmount });
                gameState.totalGoldEarned += goldAmount;
            }

            // Card reward
            const cardReward = getCardRewardPool(gameState.act);
            rewards.push({ type: 'card', cards: cardReward });

            // Potion chance
            if (Math.random() < 0.4 && gameState.potions.some(p => p === null)) {
                rewards.push({ type: 'potion', potion: getRandomPotion() });
            }

            // Elite: relic reward
            if (nodeType === 'elite' || nodeType === NodeType.ELITE) {
                const relic = getRandomRelic();
                if (relic) rewards.push({ type: 'relic', relic: relic });
            }

            // Boss: show boss relic choices (simplified to add one)
            if (nodeType === 'boss' || nodeType === NodeType.BOSS) {
                const bossRelic = getRandomRelic(RelicRarity.RARE);
                if (bossRelic) rewards.push({ type: 'relic', relic: bossRelic });
            }

            UI.showRewards(gameState, rewards);
        } else {
            // Game over
            UI.showGameOver(gameState, false);
        }
    }

    // ==========================================
    // REST SITE
    // ==========================================
    function handleRest() {
        const healAmount = Math.floor(gameState.maxHp * 0.3);
        gameState.hp = Math.min(gameState.maxHp, gameState.hp + healAmount);
        UI.showPopup('player', `+${healAmount} HP`, 'heal');
        AudioSystem.play('heal');
        setTimeout(() => returnToMap(), 1000);
    }

    function handleSmith() {
        UI.showUpgradeScreen(gameState, () => {
            returnToMap();
        });
    }

    // ==========================================
    // TREASURE
    // ==========================================
    function openTreasure() {
        const relic = getRandomRelic();
        if (relic) {
            // Check cursed key
            if (gameState.relics.some(r => r.downside === 'curseOnChest')) {
                gameState.deck.push(createCard('regret'));
            }
            UI.showTreasure(gameState, relic);
            window._treasureRelic = relic;
        } else {
            returnToMap();
        }
    }

    function takeTreasure() {
        if (window._treasureRelic) {
            UI.addRelic(gameState, window._treasureRelic);
            window._treasureRelic = null;
        }
        returnToMap();
    }

    // ==========================================
    // EVENTS
    // ==========================================
    function processEventChoice(choice, gs) {
        for (const effect of choice.effects) {
            switch (effect.type) {
                case 'heal':
                    gs.hp = Math.min(gs.maxHp, gs.hp + effect.amount);
                    UI.showPopup('player', `+${effect.amount} HP`, 'heal');
                    AudioSystem.play('heal');
                    break;
                case 'healFull':
                    gs.hp = gs.maxHp;
                    UI.showPopup('player', 'HP全回復!', 'heal');
                    AudioSystem.play('heal');
                    break;
                case 'healPercent':
                    const hAmt = Math.floor(gs.maxHp * effect.amount);
                    gs.hp = Math.min(gs.maxHp, gs.hp + hAmt);
                    UI.showPopup('player', `+${hAmt} HP`, 'heal');
                    AudioSystem.play('heal');
                    break;
                case 'damage':
                    gs.hp -= effect.amount;
                    UI.showPopup('player', `-${effect.amount}`, 'damage');
                    AudioSystem.play('hit');
                    break;
                case 'damagePercent':
                    const dAmt = Math.floor(gs.maxHp * effect.amount);
                    gs.hp -= dAmt;
                    UI.showPopup('player', `-${dAmt}`, 'damage');
                    AudioSystem.play('hit');
                    break;
                case 'gold':
                    gs.gold += effect.amount;
                    gs.totalGoldEarned += effect.amount;
                    UI.showPopup('player', `+${effect.amount}💰`, 'gold');
                    AudioSystem.play('gold');
                    break;
                case 'payGold':
                    gs.gold -= effect.amount;
                    break;
                case 'loseAllGold':
                    gs.gold = 0;
                    break;
                case 'addRelic':
                    const relic = getRandomRelic();
                    if (relic) UI.addRelic(gs, relic);
                    break;
                case 'addCurse':
                    const curses = ['decay', 'regret', 'parasite'];
                    const curseId = curses[Math.floor(Math.random() * curses.length)];
                    gs.deck.push(createCard(curseId));
                    UI.showPopup('player', '呪い追加!', 'debuff');
                    AudioSystem.play('debuff');
                    break;
                case 'removeCard':
                    UI.showCardRemoveScreen(gs, () => returnToMap());
                    return; // Don't return to map yet
                case 'upgradeCard':
                    UI.showUpgradeScreen(gs, () => returnToMap());
                    return;
                case 'upgradeAll':
                    for (const card of gs.deck) {
                        if (!card.upgraded && card.upgradeName) {
                            upgradeCard(card);
                        }
                    }
                    UI.showPopup('player', '全カードアップグレード!', 'buff');
                    break;
                case 'addRandomCard':
                    const cards = getRandomCards(1);
                    if (cards.length > 0) {
                        gs.deck.push(createCard(cards[0]));
                        UI.showPopup('player', 'カード追加!', 'buff');
                    }
                    break;
                case 'addRareCard':
                    const rareCards = getRandomCards(1, CardRarity.RARE);
                    if (rareCards.length > 0) {
                        gs.deck.push(createCard(rareCards[0]));
                        UI.showPopup('player', 'レアカード追加!', 'buff');
                    }
                    break;
                case 'cardReward':
                    const rewardCards = getCardRewardPool(gs.act);
                    UI.showCardReward(gs, rewardCards);
                    return;
                case 'gamble':
                    if (Math.random() < 0.5) {
                        processEventChoice({ effects: [effect.win] }, gs);
                    } else {
                        processEventChoice({ effects: [effect.lose] }, gs);
                    }
                    break;
                case 'fight':
                    startCombat('normal');
                    return;
                case 'fightBoss':
                    startCombat('boss');
                    return;
                case 'skipFloor':
                    gameState.floor++;
                    break;
            }
        }

        // Check death
        if (gs.hp <= 0) {
            UI.showGameOver(gs, false);
            return;
        }

        setTimeout(() => returnToMap(), 800);
    }

    // ==========================================
    // MAP NAVIGATION
    // ==========================================
    function returnToMap() {
        // Check if we need to advance act
        const currentNode = gameState.currentNode;
        if (currentNode && currentNode.type === NodeType.BOSS) {
            if (gameState.act < 3) {
                advanceAct();
                return;
            } else {
                // Victory!
                UI.showGameOver(gameState, true);
                return;
            }
        }

        UI.showScreen('map-screen');
        UI.updateMapScreen(gameState);
        setupMapListeners();
    }

    function advanceAct() {
        gameState.act++;
        gameState.floor = 0;
        gameState.map = generateMap(gameState.act);

        UI.showScreen('map-screen');
        UI.updateMapScreen(gameState);
        setupMapListeners();

        UI.showPopup('player', `Act ${gameState.act} 開始!`, 'buff');
        AudioSystem.play('powerUp');
    }

    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    function setupGlobalListeners() {
        // Title screen
        document.getElementById('btn-new-game').addEventListener('click', () => {
            AudioSystem.play('click');
            createNewGame();
        });

        // End turn
        document.getElementById('btn-end-turn').addEventListener('click', () => {
            if (!gameState) return;
            CombatManager.endPlayerTurn(gameState);
        });

        // Reward skip
        document.getElementById('btn-reward-skip').addEventListener('click', () => {
            AudioSystem.play('click');
            returnToMap();
        });

        // Card reward skip
        document.getElementById('btn-card-skip').addEventListener('click', () => {
            AudioSystem.play('click');
            UI.showScreen('reward-screen');
        });

        // Rest actions
        document.getElementById('btn-rest').addEventListener('click', () => {
            AudioSystem.play('click');
            handleRest();
        });

        document.getElementById('btn-smith').addEventListener('click', () => {
            AudioSystem.play('click');
            handleSmith();
        });

        // Upgrade cancel
        document.getElementById('btn-upgrade-cancel').addEventListener('click', () => {
            AudioSystem.play('click');
            returnToMap();
        });

        // Shop leave
        document.getElementById('btn-shop-leave').addEventListener('click', () => {
            AudioSystem.play('click');
            returnToMap();
        });

        // Shop card removal
        document.getElementById('btn-remove-card').addEventListener('click', () => {
            const discount = gameState.relics.some(r => r.id === 'membership_card') ? 0.5 : 1;
            const price = Math.floor(75 * discount);
            if (gameState.gold >= price) {
                gameState.gold -= price;
                UI.showCardRemoveScreen(gameState, () => {
                    UI.showShop(gameState);
                });
            } else {
                AudioSystem.play('error');
            }
        });

        // Treasure take
        document.getElementById('btn-treasure-take').addEventListener('click', () => {
            AudioSystem.play('click');
            takeTreasure();
        });

        // Card remove cancel
        document.getElementById('btn-remove-cancel').addEventListener('click', () => {
            AudioSystem.play('click');
            returnToMap();
        });

        // Deck view
        document.getElementById('btn-deck-view').addEventListener('click', () => {
            if (gameState) UI.showDeckModal(gameState);
        });
        document.getElementById('btn-deck-close').addEventListener('click', () => {
            document.getElementById('deck-modal').classList.remove('active');
        });

        // Relic view
        document.getElementById('btn-relic-view').addEventListener('click', () => {
            if (gameState) UI.showRelicModal(gameState);
        });
        document.getElementById('btn-relic-close').addEventListener('click', () => {
            document.getElementById('relic-modal').classList.remove('active');
        });

        // Retry buttons
        document.getElementById('btn-retry').addEventListener('click', () => {
            AudioSystem.play('click');
            createNewGame();
        });
        document.getElementById('btn-victory-retry').addEventListener('click', () => {
            AudioSystem.play('click');
            createNewGame();
        });

        // Close modals on background click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });

        // Cancel target mode on right click / escape
        document.addEventListener('contextmenu', (e) => {
            if (UI.targetMode) {
                e.preventDefault();
                UI.targetMode = false;
                UI.selectedCard = null;
                window._potionUseIndex = undefined;
                UI.highlightTargetableEnemies(false);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (UI.targetMode) {
                    UI.targetMode = false;
                    UI.selectedCard = null;
                    window._potionUseIndex = undefined;
                    UI.highlightTargetableEnemies(false);
                }
                // Close modals
                document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
            }
        });

        // Monitor combat end
        setInterval(() => {
            if (!gameState) return;
            const combatState = CombatManager.getState();
            if (combatState && combatState.combatOver) {
                if (CombatManager.areAllEnemiesDead()) {
                    if (document.getElementById('combat-screen').classList.contains('active')) {
                        setTimeout(() => onCombatEnd(true), 500);
                        // Prevent re-triggering
                        combatState.combatOver = 'handled';
                    }
                } else if (gameState.hp <= 0) {
                    if (document.getElementById('combat-screen').classList.contains('active')) {
                        setTimeout(() => onCombatEnd(false), 500);
                        combatState.combatOver = 'handled';
                    }
                }
            }
        }, 200);
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================
    function init() {
        UI.initTitleScreen();
        setupGlobalListeners();
        UI.showScreen('title-screen');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        getState: () => gameState,
        processEventChoice,
        returnToMap
    };
})();
