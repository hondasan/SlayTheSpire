// ============================================
// COMBAT SYSTEM - Turn-based Battle Engine
// ============================================

const CombatManager = (() => {
    let state = null;

    function initCombat(gameState, enemies) {
        state = {
            enemies: enemies,
            drawPile: [],
            hand: [],
            discardPile: [],
            exhaustPile: [],
            energy: gameState.maxEnergy,
            maxEnergy: gameState.maxEnergy,
            turn: 0,
            playerBlock: 0,
            playerBuffs: { ...gameState.combatBuffs || {} },
            isPlayerTurn: true,
            cardsPlayedThisTurn: 0,
            attacksPlayedThisTurn: 0,
            noDraw: false,
            flameBarrier: 0,
            combatOver: false,
            cardPlayedCount: 0,
            rampageBonuses: {},
            pendingBlockNextTurn: 0
        };

        // Initialize draw pile from player deck
        state.drawPile = [...gameState.deck].map(c => ({ ...c }));
        shuffleArray(state.drawPile);

        // Apply relics: combat start
        triggerRelics(gameState, 'onCombatStart');

        // Apply enemy onStart effects
        for (const enemy of state.enemies) {
            if (enemy.onStart) {
                for (const effect of enemy.onStart) {
                    if (effect.type === 'ritual') {
                        enemy.buffs.ritual = (enemy.buffs.ritual || 0) + effect.amount;
                    }
                }
            }
            // Decide first intent
            const move = decideEnemyMove(enemy);
            enemy.currentIntent = move;
        }

        // Start first turn
        startPlayerTurn(gameState);

        return state;
    }

    function startPlayerTurn(gameState) {
        state.turn++;
        state.isPlayerTurn = true;
        state.cardsPlayedThisTurn = 0;
        state.attacksPlayedThisTurn = 0;
        state.noDraw = false;
        state.flameBarrier = 0;

        // Reset block (unless barricade)
        if (!state.playerBuffs.barricade) {
            state.playerBlock = 0;
        }

        // Pending block from relics
        if (state.pendingBlockNextTurn > 0) {
            state.playerBlock += state.pendingBlockNextTurn;
            state.pendingBlockNextTurn = 0;
        }

        // Energy
        state.energy = state.maxEnergy;
        if (state.playerBuffs.conserveEnergy && state.playerBuffs.savedEnergy) {
            state.energy += state.playerBuffs.savedEnergy;
            state.playerBuffs.savedEnergy = 0;
        }

        // Relic: on turn start
        triggerRelics(gameState, 'onTurnStart');

        // Buff: demon form
        if (state.playerBuffs.demonForm) {
            state.playerBuffs.strength = (state.playerBuffs.strength || 0) + state.playerBuffs.demonForm;
            UI.showPopup('player', `筋力+${state.playerBuffs.demonForm}`, 'buff');
        }

        // Buff: brutality
        if (state.playerBuffs.brutality) {
            gameState.hp -= 1;
            UI.showPopup('player', '-1', 'damage');
            drawCards(gameState, 1);
        }

        // Buff: metallicize at turn start (actually end, but we handle regen here)
        if (state.playerBuffs.regen) {
            const regenAmt = state.playerBuffs.regen;
            gameState.hp = Math.min(gameState.maxHp, gameState.hp + regenAmt);
            state.playerBuffs.regenTurns = (state.playerBuffs.regenTurns || 0) - 1;
            if (state.playerBuffs.regenTurns <= 0) {
                delete state.playerBuffs.regen;
                delete state.playerBuffs.regenTurns;
            }
            UI.showPopup('player', `+${regenAmt}`, 'heal');
        }

        // Draw cards
        const drawCount = 5 + (state.playerBuffs.extraDraw || 0);
        drawCards(gameState, drawCount);

        // Snecko eye: randomize costs
        if (state.playerBuffs.sneckoEye) {
            for (const card of state.hand) {
                if (card.cost >= 0) {
                    card.cost = Math.floor(Math.random() * 4);
                }
            }
        }

        UI.updateCombat(gameState, state);
        UI.showTurnBanner(true);
    }

    function drawCards(gameState, count) {
        if (state.noDraw) return;

        for (let i = 0; i < count; i++) {
            if (state.hand.length >= 10) break; // Max hand size

            if (state.drawPile.length === 0) {
                if (state.discardPile.length === 0) break;
                state.drawPile = [...state.discardPile];
                state.discardPile = [];
                shuffleArray(state.drawPile);
            }

            const card = state.drawPile.pop();
            state.hand.push(card);
            AudioSystem.play('cardDraw');
        }
    }

    function canPlayCard(card, gameState) {
        if (card.unplayable) return false;
        if (card.cost === -2) return false; // Unplayable status
        if (card.cost > state.energy && card.cost !== -1) return false;

        // Velvet Choker check
        if (state.playerBuffs.cardLimit && state.cardsPlayedThisTurn >= state.playerBuffs.cardLimit) return false;

        // Clash condition
        if (card.playCondition === 'onlyAttacks') {
            const hasNonAttack = state.hand.some(c => c.type !== CardType.ATTACK && c !== card);
            if (hasNonAttack) return false;
        }

        // Corruption: skills cost 0
        if (state.playerBuffs.corruption && card.type === CardType.SKILL) {
            return true;
        }

        return true;
    }

    function playCard(card, targetEnemyIndex, gameState) {
        if (!state.isPlayerTurn || state.combatOver) return false;
        if (!canPlayCard(card, gameState)) {
            AudioSystem.play('error');
            return false;
        }

        AudioSystem.play('cardPlay');

        // Pay energy
        let cost = card.cost;
        if (state.playerBuffs.corruption && card.type === CardType.SKILL) {
            cost = 0;
        }
        if (cost === -1) {
            // X cost card
            cost = state.energy;
        }
        if (cost > 0) state.energy -= cost;

        state.cardsPlayedThisTurn++;
        state.cardPlayedCount++;

        // Remove from hand
        const handIdx = state.hand.indexOf(card);
        if (handIdx >= 0) state.hand.splice(handIdx, 1);

        // Resolve card effects
        const target = targetEnemyIndex !== null && targetEnemyIndex !== undefined ?
            state.enemies[targetEnemyIndex] : null;

        // Calculate damage with modifiers
        let damage = card.damage || 0;
        if (card.type === CardType.ATTACK) {
            state.attacksPlayedThisTurn++;

            // Body slam: damage = current block
            if (card.effects?.some(e => e.type === 'bodySlam')) {
                damage = state.playerBlock;
            }

            // Strength
            damage += (state.playerBuffs.strength || 0);

            // Rampage bonus
            if (card.effects?.some(e => e.type === 'rampage')) {
                const rampageKey = card.uid;
                damage += (state.rampageBonuses[rampageKey] || 0);
                state.rampageBonuses[rampageKey] = (state.rampageBonuses[rampageKey] || 0) + (card.magic || 5);
            }

            // Pen Nib double damage
            if (state.playerBuffs.penNibReady) {
                damage *= 2;
                state.playerBuffs.penNibReady = false;
                UI.showPopup('player', 'ペンニブ!', 'buff');
            }

            // Weak debuff
            if (state.playerBuffs.weak) {
                damage = Math.floor(damage * 0.75);
            }

            damage = Math.max(0, damage);
        }

        // Calculate block
        let block = card.block || 0;
        if (block > 0) {
            block += (state.playerBuffs.dexterity || 0);
            if (state.playerBuffs.frail) {
                block = Math.floor(block * 0.75);
            }
            block = Math.max(0, block);
        }

        // Apply effects
        const hits = card.hits || 1;

        if (card.type === CardType.ATTACK) {
            if (card.target === 'all') {
                // AOE attack
                for (const enemy of state.enemies) {
                    if (enemy.dead) continue;
                    for (let h = 0; h < hits; h++) {
                        dealDamageToEnemy(enemy, damage, gameState, card);
                    }
                }
                AudioSystem.play('heavyAttack');
            } else if (card.target === 'random') {
                for (let h = 0; h < hits; h++) {
                    const aliveEnemies = state.enemies.filter(e => !e.dead);
                    if (aliveEnemies.length === 0) break;
                    const randEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
                    dealDamageToEnemy(randEnemy, damage, gameState, card);
                }
                AudioSystem.play('attack');
            } else if (target) {
                // Single target
                for (let h = 0; h < hits; h++) {
                    if (target.dead) break;
                    dealDamageToEnemy(target, damage, gameState, card);
                }
                AudioSystem.play('attack');
            }

            // Whirlwind: X times
            if (card.effects?.some(e => e.type === 'whirlwind')) {
                for (let x = 1; x < cost; x++) { // already did once
                    for (const enemy of state.enemies) {
                        if (enemy.dead) continue;
                        dealDamageToEnemy(enemy, damage, gameState, card);
                    }
                }
            }

            // Fiend Fire
            if (card.effects?.some(e => e.type === 'fiendFire') && target) {
                const handCopy = [...state.hand];
                let fiendDmg = 0;
                for (const c of handCopy) {
                    exhaustCard(c, gameState);
                    fiendDmg++;
                }
                for (let i = 1; i < fiendDmg; i++) {
                    dealDamageToEnemy(target, damage, gameState, card);
                }
            }

            // Reaper: lifesteal
            if (card.effects?.some(e => e.type === 'reaper')) {
                // Healing is handled in dealDamageToEnemy for reaper
            }

            // Trigger attack-played relics
            triggerRelics(gameState, 'onAttackPlayed');
        }

        // Apply block
        if (block > 0) {
            state.playerBlock += block;
            AudioSystem.play('block');
            UI.showPopup('player', `+${block}🛡️`, 'block');

            // Juggernaut
            if (state.playerBuffs.juggernaut) {
                const aliveEnemies = state.enemies.filter(e => !e.dead);
                if (aliveEnemies.length > 0) {
                    const jTarget = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
                    dealDamageToEnemy(jTarget, state.playerBuffs.juggernaut, gameState, null);
                }
            }
        }

        // Process special effects
        if (card.effects) {
            for (const effect of card.effects) {
                const amount = resolveEffectAmount(effect.amount, card);
                processEffect(effect, amount, target, gameState, cost);
            }
        }

        // Corruption: skills exhaust
        if (state.playerBuffs.corruption && card.type === CardType.SKILL) {
            card.exhaust = true;
        }

        // Skill played relic trigger
        if (card.type === CardType.SKILL) {
            triggerRelics(gameState, 'onSkillPlayed');
        }

        // Power played relic trigger
        if (card.type === CardType.POWER) {
            triggerRelics(gameState, 'onPowerPlayed');
        }

        // Handle card destination
        if (card.exhaust) {
            exhaustCard(card, gameState);
        } else if (card.type !== CardType.POWER) {
            state.discardPile.push(card);
        }
        // Powers just disappear

        // Ethereal cards in hand at end of turn are handled in endPlayerTurn

        // Check for enemy deaths
        checkEnemyDeaths(gameState, card);

        // Check combat end
        if (areAllEnemiesDead()) {
            endCombat(gameState, true);
            return true;
        }

        // Time Eater check
        if (state.enemies.some(e => e.cardCountPhase)) {
            const timeEater = state.enemies.find(e => e.cardCountPhase);
            if (state.cardPlayedCount % timeEater.cardCountPhase === 0) {
                timeEater.buffs.strength = (timeEater.buffs.strength || 0) + 2;
                timeEater.block += 10;
                UI.showPopup(timeEater.uid, '時間切れ!', 'buff');
            }
        }

        UI.updateCombat(gameState, state);
        return true;
    }

    function resolveEffectAmount(amount, card) {
        if (typeof amount === 'string' && amount.startsWith('{')) {
            const key = amount.replace('{', '').replace('}', '');
            return card[key.toLowerCase()] || card.magic || 0;
        }
        return amount || 0;
    }

    function processEffect(effect, amount, target, gameState, xCost) {
        switch (effect.type) {
            case 'vulnerable':
                if (target) {
                    target.buffs.vulnerable = (target.buffs.vulnerable || 0) + amount;
                    UI.showPopup(target.uid, `脆弱${amount}`, 'debuff');
                    AudioSystem.play('debuff');
                }
                break;
            case 'weak':
                if (target) {
                    target.buffs.weak = (target.buffs.weak || 0) + amount;
                    UI.showPopup(target.uid, `弱体化${amount}`, 'debuff');
                    AudioSystem.play('debuff');
                }
                break;
            case 'weakAll':
                for (const e of state.enemies) {
                    if (e.dead) continue;
                    e.buffs.weak = (e.buffs.weak || 0) + amount;
                    UI.showPopup(e.uid, `弱体化${amount}`, 'debuff');
                }
                AudioSystem.play('debuff');
                break;
            case 'vulnerableAll':
                for (const e of state.enemies) {
                    if (e.dead) continue;
                    e.buffs.vulnerable = (e.buffs.vulnerable || 0) + amount;
                    UI.showPopup(e.uid, `脆弱${amount}`, 'debuff');
                }
                AudioSystem.play('debuff');
                break;
            case 'draw':
                drawCards(gameState, amount);
                break;
            case 'noDraw':
                state.noDraw = true;
                break;
            case 'gainEnergy':
                state.energy += amount;
                UI.showPopup('player', `+${amount}⚡`, 'buff');
                break;
            case 'loseHP':
                gameState.hp -= amount;
                UI.showPopup('player', `-${amount}`, 'damage');
                triggerRelics(gameState, 'onHPLoss');
                if (gameState.hp <= 0) {
                    endCombat(gameState, false);
                }
                break;
            case 'strength':
                state.playerBuffs.strength = (state.playerBuffs.strength || 0) + amount;
                UI.showPopup('player', `筋力+${amount}`, 'buff');
                AudioSystem.play('powerUp');
                break;
            case 'tempStrength':
                state.playerBuffs.strength = (state.playerBuffs.strength || 0) + amount;
                state.playerBuffs.tempStrength = (state.playerBuffs.tempStrength || 0) + amount;
                UI.showPopup('player', `筋力+${amount}(一時)`, 'buff');
                break;
            case 'doubleStrength':
                const str = state.playerBuffs.strength || 0;
                state.playerBuffs.strength = str * 2;
                UI.showPopup('player', `筋力2倍!`, 'buff');
                AudioSystem.play('powerUp');
                break;
            case 'reduceStrength':
                if (target) {
                    target.buffs.strength = (target.buffs.strength || 0) - amount;
                    UI.showPopup(target.uid, `筋力-${amount}`, 'debuff');
                }
                break;
            case 'doubleBlock':
                state.playerBlock *= 2;
                UI.showPopup('player', `ブロック2倍!`, 'buff');
                break;
            case 'demonForm':
                state.playerBuffs.demonForm = (state.playerBuffs.demonForm || 0) + amount;
                UI.showPopup('player', `デーモンフォーム!`, 'buff');
                AudioSystem.play('powerUp');
                break;
            case 'barricade':
                state.playerBuffs.barricade = true;
                UI.showPopup('player', 'バリケード!', 'buff');
                AudioSystem.play('powerUp');
                break;
            case 'metallicize':
                state.playerBuffs.metallicize = (state.playerBuffs.metallicize || 0) + amount;
                UI.showPopup('player', `メタリサイズ${amount}`, 'buff');
                AudioSystem.play('powerUp');
                break;
            case 'brutality':
                state.playerBuffs.brutality = true;
                UI.showPopup('player', 'ブルータリティ!', 'buff');
                break;
            case 'corruption':
                state.playerBuffs.corruption = true;
                UI.showPopup('player', 'コラプション!', 'buff');
                AudioSystem.play('powerUp');
                break;
            case 'juggernaut':
                state.playerBuffs.juggernaut = (state.playerBuffs.juggernaut || 0) + amount;
                UI.showPopup('player', 'ジャガーノート!', 'buff');
                AudioSystem.play('powerUp');
                break;
            case 'flameBarrier':
                state.flameBarrier = amount;
                UI.showPopup('player', `フレイムバリア${amount}`, 'buff');
                break;
            case 'copyToDiscard':
                // Copy this card to discard
                break;
            case 'addWound':
                state.drawPile.push(createCard('wound'));
                shuffleArray(state.drawPile);
                break;
            case 'addWoundToHand':
                for (let i = 0; i < (amount || 2); i++) {
                    if (state.hand.length < 10) {
                        state.hand.push(createCard('wound'));
                    }
                }
                break;
            case 'addBurnToDiscard':
                state.discardPile.push(createCard('burn'));
                break;
            case 'exhaustRandom':
                if (state.hand.length > 0) {
                    const idx = Math.floor(Math.random() * state.hand.length);
                    exhaustCard(state.hand[idx], gameState);
                }
                break;
            case 'feed':
                // Handled in dealDamageToEnemy
                break;
            case 'dropkick':
                if (target && target.buffs.vulnerable) {
                    state.energy += 1;
                    drawCards(gameState, 1);
                    UI.showPopup('player', '+1⚡ +1🃏', 'buff');
                }
                break;
        }
    }

    function dealDamageToEnemy(enemy, baseDamage, gameState, card) {
        if (enemy.dead) return 0;

        let damage = baseDamage;

        // Vulnerable check on enemy
        if (enemy.buffs.vulnerable) {
            damage = Math.floor(damage * 1.5);
        }

        // Apply to block first
        let actualDamage = damage;
        if (enemy.block > 0) {
            if (enemy.block >= actualDamage) {
                enemy.block -= actualDamage;
                actualDamage = 0;
            } else {
                actualDamage -= enemy.block;
                // Block break relic trigger
                triggerRelics(gameState, 'onBlockBreak', enemy);
                enemy.block = 0;
            }
        }

        if (actualDamage > 0) {
            enemy.hp -= actualDamage;
            UI.showPopup(enemy.uid, `-${actualDamage}`, 'damage');
            UI.shakeEnemy(enemy.uid);

            // Reaper effect: heal unblocked damage
            if (card?.effects?.some(e => e.type === 'reaper')) {
                gameState.hp = Math.min(gameState.maxHp, gameState.hp + actualDamage);
                UI.showPopup('player', `+${actualDamage}`, 'heal');
            }
        } else {
            UI.showPopup(enemy.uid, '0', 'block');
        }

        return actualDamage;
    }

    function exhaustCard(card, gameState) {
        const idx = state.hand.indexOf(card);
        if (idx >= 0) state.hand.splice(idx, 1);
        state.exhaustPile.push(card);

        // Dead Branch relic
        if (gameState.relics.some(r => r.id === 'dead_branch')) {
            const randomCards = getRandomCards(1);
            if (randomCards.length > 0) {
                const newCard = createCard(randomCards[0]);
                newCard.cost = 0;
                if (state.hand.length < 10) {
                    state.hand.push(newCard);
                }
            }
        }
    }

    function checkEnemyDeaths(gameState, card) {
        for (const enemy of state.enemies) {
            if (enemy.hp <= 0 && !enemy.dead) {
                enemy.dead = true;
                enemy.hp = 0;
                AudioSystem.play('death');

                // Feed effect
                if (card?.effects?.some(e => e.type === 'feed')) {
                    const feedAmt = card.magic || 3;
                    gameState.maxHp += feedAmt;
                    gameState.hp += feedAmt;
                    UI.showPopup('player', `最大HP+${feedAmt}`, 'heal');
                }
            }
        }
    }

    function areAllEnemiesDead() {
        return state.enemies.every(e => e.dead);
    }

    function endPlayerTurn(gameState) {
        if (!state.isPlayerTurn || state.combatOver) return;

        state.isPlayerTurn = false;
        AudioSystem.play('turnEnd');

        // Ethereal cards exhaust
        const etherealCards = state.hand.filter(c => c.ethereal);
        for (const card of etherealCards) {
            exhaustCard(card, gameState);
        }

        // Temp strength removal
        if (state.playerBuffs.tempStrength) {
            state.playerBuffs.strength -= state.playerBuffs.tempStrength;
            state.playerBuffs.tempStrength = 0;
        }

        // Metallicize
        if (state.playerBuffs.metallicize) {
            state.playerBlock += state.playerBuffs.metallicize;
            UI.showPopup('player', `+${state.playerBuffs.metallicize}🛡️`, 'block');
        }

        // Conserve energy
        if (state.playerBuffs.conserveEnergy) {
            state.playerBuffs.savedEnergy = state.energy;
        }

        // Burn damage
        const burns = state.hand.filter(c => c.id === 'burn');
        for (const burn of burns) {
            gameState.hp -= 2;
            UI.showPopup('player', '-2🔥', 'damage');
        }

        // Decay damage
        const decays = state.hand.filter(c => c.id === 'decay');
        for (const d of decays) {
            gameState.hp -= 2;
            UI.showPopup('player', '-2', 'damage');
        }

        // Regret damage
        const regrets = state.hand.filter(c => c.id === 'regret');
        for (const r of regrets) {
            gameState.hp -= state.hand.length;
            UI.showPopup('player', `-${state.hand.length}`, 'damage');
        }

        // Discard hand
        while (state.hand.length > 0) {
            state.discardPile.push(state.hand.pop());
        }

        // Incense burner
        if (gameState.relics.some(r => r.id === 'incense_burner')) {
            const relic = gameState.relics.find(r => r.id === 'incense_burner');
            relic.counter = (relic.counter || 0) + 1;
            if (relic.counter >= 6) {
                state.playerBuffs.intangible = 1;
                relic.counter = 0;
                UI.showPopup('player', '無形!', 'buff');
            }
        }

        if (gameState.hp <= 0) {
            endCombat(gameState, false);
            return;
        }

        // Enemy turns
        UI.updateCombat(gameState, state);
        UI.showTurnBanner(false);
        setTimeout(() => executeEnemyTurns(gameState), 800);
    }

    function executeEnemyTurns(gameState) {
        let delay = 0;
        const turnActions = [];

        for (const enemy of state.enemies) {
            if (enemy.dead) continue;

            const move = enemy.currentIntent;
            if (!move) continue;

            turnActions.push({ enemy, move, delay });
            delay += 500;
        }

        // Execute sequentially with delays
        let actionIdx = 0;
        function executeNext() {
            if (actionIdx >= turnActions.length || state.combatOver) {
                // After all enemy actions, start next player turn
                if (!state.combatOver) {
                    // Tick down enemy buffs
                    for (const enemy of state.enemies) {
                        if (enemy.dead) continue;
                        tickEnemyBuffs(enemy);
                        enemy.turnCount++;
                        enemy.block = 0;
                        // Decide next intent
                        const nextMove = decideEnemyMove(enemy);
                        if (nextMove && enemy.currentIntent && nextMove.id === enemy.currentIntent.id) {
                            enemy.consecutiveSameMove = (enemy.consecutiveSameMove || 0) + 1;
                        } else {
                            enemy.consecutiveSameMove = 0;
                        }
                        enemy.lastMoveId = nextMove?.id;
                        enemy.currentIntent = nextMove;
                    }

                    // Tick player debuffs
                    tickPlayerBuffs();

                    startPlayerTurn(gameState);
                }
                return;
            }

            const { enemy, move } = turnActions[actionIdx];
            actionIdx++;

            executeEnemyAction(enemy, move, gameState);

            if (gameState.hp <= 0) {
                endCombat(gameState, false);
                return;
            }

            setTimeout(executeNext, 500);
        }

        executeNext();
    }

    function executeEnemyAction(enemy, move, gameState) {
        if (!move || enemy.dead) return;

        // Ritual buff (cultist)
        if (enemy.buffs.ritual) {
            enemy.buffs.strength = (enemy.buffs.strength || 0) + enemy.buffs.ritual;
            UI.showPopup(enemy.uid, `筋力+${enemy.buffs.ritual}`, 'buff');
        }

        switch (move.type) {
            case 'attack':
                executeEnemyAttack(enemy, move, gameState);
                break;
            case 'attack_defend':
                executeEnemyAttack(enemy, move, gameState);
                enemy.block += move.block || 0;
                UI.showPopup(enemy.uid, `+${move.block}🛡️`, 'block');
                break;
            case 'attack_debuff':
                executeEnemyAttack(enemy, move, gameState);
                if (move.effects) applyEnemyEffects(enemy, move.effects, gameState);
                break;
            case 'defend':
                enemy.block += move.block || 0;
                if (move.block) UI.showPopup(enemy.uid, `+${move.block}🛡️`, 'block');
                if (move.effects) applyEnemyEffects(enemy, move.effects, gameState);
                break;
            case 'buff':
                if (move.effects) applyEnemyEffects(enemy, move.effects, gameState);
                break;
            case 'debuff':
                if (move.effects) applyEnemyEffects(enemy, move.effects, gameState);
                break;
            case 'summon':
                // Simplified summon
                if (move.effects) applyEnemyEffects(enemy, move.effects, gameState);
                break;
            case 'none':
                // Do nothing (preparing)
                UI.showPopup(enemy.uid, '...', 'buff');
                break;
        }

        // Enrage (Gremlin Nob)
        if (enemy.buffs.enrage && state.cardsPlayedThisTurn > 0) {
            // Enrage logic: gains strength when player plays skill (handled differently)
        }

        UI.updateCombat(gameState, state);
    }

    function executeEnemyAttack(enemy, move, gameState) {
        let baseDamage = resolveValue(move.damage || 0);
        let damage = baseDamage + (enemy.buffs.strength || 0);
        if (enemy.buffs.weak) {
            damage = Math.floor(damage * 0.75);
        }
        damage = Math.max(0, damage);

        const hits = move.hits || 1;
        const resolvedHits = Array.isArray(hits) ?
            hits[Math.min(enemy.turnCount, hits.length - 1)] : hits;

        for (let h = 0; h < resolvedHits; h++) {
            dealDamageToPlayer(damage, gameState, enemy);
            if (gameState.hp <= 0) return;
        }
    }

    function dealDamageToPlayer(damage, gameState, source) {
        // Intangible
        if (state.playerBuffs.intangible) {
            damage = 1;
        }

        // Torii
        if (gameState.relics.some(r => r.id === 'torii') && damage <= 5 && damage > 0) {
            damage = 1;
        }

        let actualDamage = damage;

        // Apply block
        if (state.playerBlock > 0) {
            if (state.playerBlock >= actualDamage) {
                state.playerBlock -= actualDamage;
                actualDamage = 0;
            } else {
                actualDamage -= state.playerBlock;
                state.playerBlock = 0;
            }
        }

        // Tungsten rod
        if (actualDamage > 0 && gameState.relics.some(r => r.id === 'tungsten_rod')) {
            actualDamage = Math.max(0, actualDamage - 1);
        }

        if (actualDamage > 0) {
            gameState.hp -= actualDamage;
            UI.showPopup('player', `-${actualDamage}`, 'damage');
            UI.shakePlayer();
            AudioSystem.play('hit');

            // Flame Barrier
            if (state.flameBarrier > 0 && source) {
                dealDamageToEnemy(source, state.flameBarrier, gameState, null);
            }

            // Bronze Scales
            if (gameState.relics.some(r => r.id === 'bronze_scales') && source) {
                dealDamageToEnemy(source, 3, gameState, null);
            }

            // Self Forming Clay
            if (gameState.relics.some(r => r.id === 'self_forming_clay')) {
                state.pendingBlockNextTurn += 3;
            }

            // Centennial Puzzle (first damage)
            const centPuzzle = gameState.relics.find(r => r.id === 'centennial_puzzle');
            if (centPuzzle && !centPuzzle.usedThisCombat) {
                centPuzzle.usedThisCombat = true;
                drawCards(gameState, 3);
            }

            triggerRelics(gameState, 'onHPLoss');

            // Check fairy bottle
            if (gameState.hp <= 0) {
                const fairyIdx = gameState.potions.findIndex(p => p && p.id === 'fairy_bottle');
                if (fairyIdx >= 0) {
                    gameState.hp = Math.floor(gameState.maxHp * 0.3);
                    gameState.potions[fairyIdx] = null;
                    UI.showPopup('player', '妖精の復活!', 'heal');
                    AudioSystem.play('heal');
                }
            }
        } else {
            UI.showPopup('player', '0', 'block');
            AudioSystem.play('block');
        }

        checkEnemyDeaths(gameState, null);
    }

    function applyEnemyEffects(enemy, effects, gameState) {
        for (const effect of effects) {
            const amount = resolveValue(effect.amount || 0);
            switch (effect.type) {
                case 'strength':
                    enemy.buffs.strength = (enemy.buffs.strength || 0) + amount;
                    UI.showPopup(enemy.uid, `筋力+${amount}`, 'buff');
                    break;
                case 'block':
                    enemy.block += amount;
                    UI.showPopup(enemy.uid, `+${amount}🛡️`, 'block');
                    break;
                case 'vulnerable':
                    state.playerBuffs.vulnerable = (state.playerBuffs.vulnerable || 0) + amount;
                    UI.showPopup('player', `脆弱${amount}`, 'debuff');
                    break;
                case 'weak':
                    state.playerBuffs.weak = (state.playerBuffs.weak || 0) + amount;
                    UI.showPopup('player', `弱体化${amount}`, 'debuff');
                    break;
                case 'frail':
                    state.playerBuffs.frail = (state.playerBuffs.frail || 0) + amount;
                    UI.showPopup('player', `脆弱化${amount}`, 'debuff');
                    break;
                case 'enrage':
                    enemy.buffs.enrage = (enemy.buffs.enrage || 0) + amount;
                    UI.showPopup(enemy.uid, `激怒${amount}`, 'buff');
                    break;
                case 'curl':
                    enemy.block += resolveValue(amount);
                    UI.showPopup(enemy.uid, `丸まり`, 'buff');
                    break;
                case 'heal':
                    enemy.hp = Math.min(enemy.maxHp, enemy.hp + amount);
                    UI.showPopup(enemy.uid, `+${amount}`, 'heal');
                    break;
                case 'addDazed':
                    for (let i = 0; i < amount; i++) {
                        state.discardPile.push(createCard('dazed'));
                    }
                    UI.showPopup('player', `ぼんやり+${amount}`, 'debuff');
                    break;
                case 'addWound':
                    for (let i = 0; i < amount; i++) {
                        state.discardPile.push(createCard('wound'));
                    }
                    UI.showPopup('player', `キズ+${amount}`, 'debuff');
                    break;
                case 'addBurn':
                    for (let i = 0; i < amount; i++) {
                        state.discardPile.push(createCard('burn'));
                    }
                    UI.showPopup('player', `やけど+${amount}`, 'debuff');
                    break;
                case 'addParasite':
                    state.discardPile.push(createCard('parasite'));
                    UI.showPopup('player', '寄生虫!', 'debuff');
                    break;
                case 'strengthAll':
                    for (const e of state.enemies) {
                        if (e.dead) continue;
                        e.buffs.strength = (e.buffs.strength || 0) + amount;
                    }
                    break;
                case 'summonGremlin':
                    const gremlin = createSingleEnemy(ENEMY_DATABASE.gremlin_minion, state.enemies.length);
                    gremlin.currentIntent = decideEnemyMove(gremlin);
                    state.enemies.push(gremlin);
                    break;
                case 'summonDagger':
                    const dagger = createSingleEnemy(ENEMY_DATABASE.dagger, state.enemies.length);
                    dagger.currentIntent = decideEnemyMove(dagger);
                    state.enemies.push(dagger);
                    break;
                case 'intangible':
                    enemy.buffs.intangible = 1;
                    UI.showPopup(enemy.uid, '無形!', 'buff');
                    break;
                case 'dexterityDown':
                    state.playerBuffs.dexterity = (state.playerBuffs.dexterity || 0) + amount;
                    UI.showPopup('player', `敏捷性${amount}`, 'debuff');
                    break;
                case 'strengthDown':
                    state.playerBuffs.strength = (state.playerBuffs.strength || 0) + amount;
                    UI.showPopup('player', `筋力${amount}`, 'debuff');
                    break;
                case 'thorns':
                    enemy.buffs.thorns = (enemy.buffs.thorns || 0) + amount;
                    break;
                case 'confused':
                    state.playerBuffs.sneckoEye = true;
                    UI.showPopup('player', '混乱!', 'debuff');
                    break;
                case 'regenSelf':
                    enemy.hp = Math.min(enemy.maxHp, enemy.hp + amount);
                    UI.showPopup(enemy.uid, `+${amount}`, 'heal');
                    break;
                case 'flight':
                    enemy.buffs.flight = amount;
                    break;
                case 'ritual':
                    enemy.buffs.ritual = (enemy.buffs.ritual || 0) + amount;
                    UI.showPopup(enemy.uid, `儀式${amount}`, 'buff');
                    break;
                case 'hex':
                    // Simplified
                    state.discardPile.push(createCard('dazed'));
                    UI.showPopup('player', 'ヘックス!', 'debuff');
                    break;
                case 'addSlimed':
                    for (let i = 0; i < amount; i++) {
                        state.discardPile.push(createCard('wound'));
                    }
                    UI.showPopup('player', 'スライム!', 'debuff');
                    break;
            }
        }
    }

    function tickEnemyBuffs(enemy) {
        if (enemy.buffs.vulnerable) {
            enemy.buffs.vulnerable--;
            if (enemy.buffs.vulnerable <= 0) delete enemy.buffs.vulnerable;
        }
        if (enemy.buffs.weak) {
            enemy.buffs.weak--;
            if (enemy.buffs.weak <= 0) delete enemy.buffs.weak;
        }
        if (enemy.buffs.intangible) {
            enemy.buffs.intangible--;
            if (enemy.buffs.intangible <= 0) delete enemy.buffs.intangible;
        }
    }

    function tickPlayerBuffs() {
        if (state.playerBuffs.vulnerable) {
            state.playerBuffs.vulnerable--;
            if (state.playerBuffs.vulnerable <= 0) delete state.playerBuffs.vulnerable;
        }
        if (state.playerBuffs.weak) {
            state.playerBuffs.weak--;
            if (state.playerBuffs.weak <= 0) delete state.playerBuffs.weak;
        }
        if (state.playerBuffs.frail) {
            state.playerBuffs.frail--;
            if (state.playerBuffs.frail <= 0) delete state.playerBuffs.frail;
        }
        if (state.playerBuffs.intangible) {
            state.playerBuffs.intangible--;
            if (state.playerBuffs.intangible <= 0) delete state.playerBuffs.intangible;
        }
    }

    function triggerRelics(gameState, trigger, extraData) {
        for (const relic of gameState.relics) {
            if (relic.trigger !== trigger) continue;

            const effect = relic.effect;
            switch (effect.type) {
                case 'heal':
                    gameState.hp = Math.min(gameState.maxHp, gameState.hp + effect.amount);
                    UI.showPopup('player', `+${effect.amount}`, 'heal');
                    break;
                case 'healIfLow':
                    if (gameState.hp / gameState.maxHp <= effect.threshold) {
                        gameState.hp = Math.min(gameState.maxHp, gameState.hp + effect.amount);
                        UI.showPopup('player', `+${effect.amount}`, 'heal');
                    }
                    break;
                case 'block':
                    if (effect.onTurn && state && state.turn !== effect.onTurn) break;
                    if (state) state.playerBlock += effect.amount;
                    UI.showPopup('player', `+${effect.amount}🛡️`, 'block');
                    break;
                case 'vulnerableAll':
                    if (state) {
                        for (const e of state.enemies) {
                            if (e.dead) continue;
                            e.buffs.vulnerable = (e.buffs.vulnerable || 0) + effect.amount;
                        }
                    }
                    break;
                case 'energy':
                    if (state) state.energy += effect.amount;
                    break;
                case 'strength':
                    if (state) {
                        state.playerBuffs.strength = (state.playerBuffs.strength || 0) + effect.amount;
                    }
                    break;
                case 'dexterity':
                    if (state) {
                        state.playerBuffs.dexterity = (state.playerBuffs.dexterity || 0) + effect.amount;
                    }
                    break;
                case 'damageAll':
                    if (state) {
                        for (const e of state.enemies) {
                            if (e.dead) continue;
                            dealDamageToEnemy(e, effect.amount, gameState, null);
                        }
                    }
                    break;
                case 'doubleDamage':
                    if (relic.counter !== undefined && effect.every) {
                        relic.counter++;
                        if (relic.counter >= effect.every) {
                            state.playerBuffs.penNibReady = true;
                            relic.counter = 0;
                        }
                    }
                    break;
                case 'drawExtra':
                    if (state) {
                        drawCards(gameState, effect.amount);
                        if (effect.randomCost) {
                            state.playerBuffs.sneckoEye = true;
                        }
                    }
                    break;
                case 'reduceCost':
                    if (state && state.hand.length > 0) {
                        const validCards = state.hand.filter(c => c.cost > 0);
                        if (validCards.length > 0) {
                            const rc = validCards[Math.floor(Math.random() * validCards.length)];
                            rc.cost = 0;
                        }
                    }
                    break;
                case 'addRandomCard':
                    if (state) {
                        const cards = getRandomCards(1);
                        if (cards.length > 0 && state.hand.length < 10) {
                            state.hand.push(createCard(cards[0]));
                        }
                    }
                    break;
                case 'vulnerable':
                    if (extraData && !extraData.dead) {
                        extraData.buffs.vulnerable = (extraData.buffs.vulnerable || 0) + effect.amount;
                    }
                    break;
                case 'blockNextTurn':
                    if (state) state.pendingBlockNextTurn += effect.amount;
                    break;
                case 'thorns':
                    // Handled in dealDamageToPlayer
                    break;
                default:
                    // Counter-based relics
                    if (relic.counter !== undefined && effect.every) {
                        relic.counter++;
                        if (relic.counter >= effect.every) {
                            relic.counter = 0;
                            // Apply the effect
                            if (effect.type === 'strength' && state) {
                                state.playerBuffs.strength = (state.playerBuffs.strength || 0) + effect.amount;
                            } else if (effect.type === 'dexterity' && state) {
                                state.playerBuffs.dexterity = (state.playerBuffs.dexterity || 0) + effect.amount;
                            } else if (effect.type === 'block' && state) {
                                state.playerBlock += effect.amount;
                            } else if (effect.type === 'energy' && state) {
                                state.energy += effect.amount;
                            }
                        }
                    }
                    break;
            }
        }
    }

    function endCombat(gameState, victory) {
        if (state.combatOver) return;
        state.combatOver = true;

        if (victory) {
            AudioSystem.play('victory');
            // Trigger combat end relics (like Burning Blood)
            triggerRelics(gameState, 'onCombatEnd');

            // Reset centennial puzzle
            const centPuzzle = gameState.relics.find(r => r.id === 'centennial_puzzle');
            if (centPuzzle) centPuzzle.usedThisCombat = false;
        } else {
            AudioSystem.play('defeat');
        }

        // Clear combat buffs
        gameState.combatBuffs = {};

        return victory;
    }

    // Potion usage
    function usePotion(potionIndex, targetEnemyIndex, gameState) {
        const potion = gameState.potions[potionIndex];
        if (!potion) return false;

        const target = targetEnemyIndex !== null && targetEnemyIndex !== undefined ?
            state.enemies[targetEnemyIndex] : null;
        const effect = potion.effect;

        switch (effect.type) {
            case 'damage':
                if (target) {
                    dealDamageToEnemy(target, effect.amount, gameState, null);
                    AudioSystem.play('attack');
                }
                break;
            case 'damageAll':
                for (const e of state.enemies) {
                    if (e.dead) continue;
                    dealDamageToEnemy(e, effect.amount, gameState, null);
                }
                AudioSystem.play('heavyAttack');
                break;
            case 'block':
                state.playerBlock += effect.amount;
                UI.showPopup('player', `+${effect.amount}🛡️`, 'block');
                break;
            case 'energy':
                state.energy += effect.amount;
                UI.showPopup('player', `+${effect.amount}⚡`, 'buff');
                break;
            case 'strength':
                state.playerBuffs.strength = (state.playerBuffs.strength || 0) + effect.amount;
                UI.showPopup('player', `筋力+${effect.amount}`, 'buff');
                break;
            case 'dexterity':
                state.playerBuffs.dexterity = (state.playerBuffs.dexterity || 0) + effect.amount;
                UI.showPopup('player', `敏捷性+${effect.amount}`, 'buff');
                break;
            case 'regen':
                state.playerBuffs.regen = effect.amount;
                state.playerBuffs.regenTurns = effect.turns;
                UI.showPopup('player', `再生${effect.amount}`, 'buff');
                break;
            case 'draw':
                drawCards(gameState, effect.amount);
                break;
            case 'vulnerable':
                if (target) {
                    target.buffs.vulnerable = (target.buffs.vulnerable || 0) + effect.amount;
                    UI.showPopup(target.uid, `脆弱${effect.amount}`, 'debuff');
                }
                break;
            case 'weak':
                if (target) {
                    target.buffs.weak = (target.buffs.weak || 0) + effect.amount;
                    UI.showPopup(target.uid, `弱体化${effect.amount}`, 'debuff');
                }
                break;
            case 'poison':
                if (target) {
                    target.buffs.poison = (target.buffs.poison || 0) + effect.amount;
                    UI.showPopup(target.uid, `毒${effect.amount}`, 'debuff');
                }
                break;
        }

        gameState.potions[potionIndex] = null;
        checkEnemyDeaths(gameState, null);

        if (areAllEnemiesDead()) {
            endCombat(gameState, true);
        }

        UI.updateCombat(gameState, state);
        return true;
    }

    function getState() { return state; }

    return {
        initCombat,
        playCard,
        endPlayerTurn,
        canPlayCard,
        usePotion,
        drawCards,
        getState,
        areAllEnemiesDead
    };
})();

// Utility
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
