// ============================================
// AUDIO SYSTEM - Web Audio API SE Generator
// ============================================

const AudioSystem = (() => {
    let ctx = null;
    let muted = false;

    function getCtx() {
        if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return ctx;
    }

    function play(type) {
        if (muted) return;
        try {
            const c = getCtx();
            switch(type) {
                case 'cardPlay': cardPlaySound(c); break;
                case 'cardDraw': cardDrawSound(c); break;
                case 'attack': attackSound(c); break;
                case 'heavyAttack': heavyAttackSound(c); break;
                case 'block': blockSound(c); break;
                case 'heal': healSound(c); break;
                case 'hit': hitSound(c); break;
                case 'death': deathSound(c); break;
                case 'gold': goldSound(c); break;
                case 'buff': buffSound(c); break;
                case 'debuff': debuffSound(c); break;
                case 'click': clickSound(c); break;
                case 'turnEnd': turnEndSound(c); break;
                case 'victory': victorySound(c); break;
                case 'defeat': defeatSound(c); break;
                case 'powerUp': powerUpSound(c); break;
                case 'poison': poisonSound(c); break;
                case 'shop': shopSound(c); break;
                case 'error': errorSound(c); break;
            }
        } catch(e) { /* ignore audio errors */ }
    }

    function createOsc(c, type, freq, duration, vol = 0.15) {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, c.currentTime);
        g.gain.setValueAtTime(vol, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
        o.connect(g);
        g.connect(c.destination);
        o.start(c.currentTime);
        o.stop(c.currentTime + duration);
    }

    function createNoise(c, duration, vol = 0.08) {
        const bufferSize = c.sampleRate * duration;
        const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const source = c.createBufferSource();
        source.buffer = buffer;
        const g = c.createGain();
        g.gain.setValueAtTime(vol, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
        source.connect(g);
        g.connect(c.destination);
        source.start(c.currentTime);
    }

    function cardPlaySound(c) {
        createOsc(c, 'sine', 600, 0.1, 0.1);
        createOsc(c, 'sine', 800, 0.08, 0.08);
    }

    function cardDrawSound(c) {
        createNoise(c, 0.05, 0.04);
        createOsc(c, 'sine', 1200, 0.05, 0.05);
    }

    function attackSound(c) {
        createNoise(c, 0.15, 0.12);
        createOsc(c, 'sawtooth', 200, 0.15, 0.08);
    }

    function heavyAttackSound(c) {
        createNoise(c, 0.25, 0.15);
        createOsc(c, 'sawtooth', 120, 0.2, 0.1);
        createOsc(c, 'square', 80, 0.3, 0.06);
    }

    function blockSound(c) {
        createOsc(c, 'triangle', 300, 0.12, 0.1);
        createOsc(c, 'triangle', 500, 0.08, 0.08);
    }

    function healSound(c) {
        createOsc(c, 'sine', 400, 0.3, 0.1);
        setTimeout(() => createOsc(c, 'sine', 600, 0.2, 0.08), 100);
        setTimeout(() => createOsc(c, 'sine', 800, 0.15, 0.06), 200);
    }

    function hitSound(c) {
        createNoise(c, 0.12, 0.1);
        createOsc(c, 'square', 150, 0.1, 0.06);
    }

    function deathSound(c) {
        createOsc(c, 'sawtooth', 300, 0.5, 0.1);
        createOsc(c, 'sawtooth', 200, 0.6, 0.08);
        createNoise(c, 0.4, 0.1);
    }

    function goldSound(c) {
        createOsc(c, 'sine', 1000, 0.1, 0.08);
        setTimeout(() => createOsc(c, 'sine', 1400, 0.1, 0.06), 60);
    }

    function buffSound(c) {
        createOsc(c, 'sine', 500, 0.15, 0.08);
        setTimeout(() => createOsc(c, 'sine', 700, 0.12, 0.06), 80);
    }

    function debuffSound(c) {
        createOsc(c, 'sine', 400, 0.15, 0.08);
        setTimeout(() => createOsc(c, 'sine', 250, 0.2, 0.06), 80);
    }

    function clickSound(c) {
        createOsc(c, 'sine', 800, 0.06, 0.06);
    }

    function turnEndSound(c) {
        createOsc(c, 'triangle', 500, 0.15, 0.08);
        createOsc(c, 'triangle', 400, 0.1, 0.06);
    }

    function victorySound(c) {
        const notes = [523, 659, 784, 1047];
        notes.forEach((f, i) => {
            setTimeout(() => createOsc(c, 'sine', f, 0.3, 0.1), i * 150);
        });
    }

    function defeatSound(c) {
        createOsc(c, 'sawtooth', 200, 0.8, 0.1);
        createOsc(c, 'sine', 150, 1.0, 0.06);
    }

    function powerUpSound(c) {
        createOsc(c, 'sine', 300, 0.2, 0.08);
        setTimeout(() => createOsc(c, 'sine', 500, 0.2, 0.08), 100);
        setTimeout(() => createOsc(c, 'sine', 800, 0.3, 0.1), 200);
    }

    function poisonSound(c) {
        createOsc(c, 'sine', 250, 0.2, 0.06);
        createNoise(c, 0.1, 0.05);
    }

    function shopSound(c) {
        createOsc(c, 'sine', 800, 0.1, 0.06);
        setTimeout(() => createOsc(c, 'sine', 1000, 0.08, 0.05), 80);
    }

    function errorSound(c) {
        createOsc(c, 'square', 200, 0.15, 0.06);
        setTimeout(() => createOsc(c, 'square', 150, 0.2, 0.06), 100);
    }

    return { play, toggleMute: () => { muted = !muted; return muted; } };
})();
