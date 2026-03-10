// ============================================
// SPRITES SYSTEM - Pixel Art Data and Renderer
// ============================================

const SpriteEngine = (() => {
    // Renders a pixel array to an SVG Data URI string
    function renderSVG(pixelArray, palette) {
        if (!pixelArray || pixelArray.length === 0) return '';
        
        const width = pixelArray[0].length;
        const height = pixelArray.length;
        
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">`;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const char = pixelArray[y][x];
                if (char !== '0' && char !== ' ') {
                    let colorIndex;
                    if (char >= 'a' && char <= 'f') {
                        colorIndex = 10 + (char.charCodeAt(0) - 'a'.charCodeAt(0));
                    } else {
                        colorIndex = parseInt(char, 10);
                    }
                    
                    const color = palette[colorIndex];
                    if (color && color !== 'transparent') {
                        svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}" />`;
                    }
                }
            }
        }
        svg += '</svg>';
        // Unicode base64 encoding
        return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    }

    // Cache generated Image objects for canvas drawing
    const imageCache = {};

    function getCanvasImage(spriteObj) {
        if (!spriteObj) return null;
        
        // Cache key based on sprite reference (assuming object ref stays constant)
        const cacheKey = spriteObj.id || JSON.stringify(spriteObj.pixels);
        
        if (imageCache[cacheKey]) {
            return imageCache[cacheKey];
        }

        const uri = renderSVG(spriteObj.pixels, spriteObj.palette);
        const img = new Image();
        img.src = uri;
        
        imageCache[cacheKey] = img;
        return img;
    }

    return {
        render: renderSVG,
        getCanvasImage: getCanvasImage
    };
})();

// Palettes
// 0: transparent, 1: outline/dark, 2: main base, 3: main shadow, 4: main highlight, 5: sub color 1, 6: sub color 2...
const PALETTES = {
    player: ['transparent', '#1a1a2e', '#e94560', '#5334c4', '#fff', '#e2a45e'],
    red:    ['transparent', '#222222', '#e53935', '#b71c1c', '#ffcdd2', '#ffeb3b'],
    blue:   ['transparent', '#222222', '#1e88e5', '#0d47a1', '#bbdefb', '#fbc02d'],
    green:  ['transparent', '#222222', '#43a047', '#1b5e20', '#c8e6c9', '#ffb300'],
    purple: ['transparent', '#222222', '#8e24aa', '#4a148c', '#e1bee7', '#81c784'],
    gold:   ['transparent', '#3e2723', '#fbc02d', '#f57f17', '#fff9c4', '#bcaaa4'],
    gray:   ['transparent', '#111111', '#757575', '#424242', '#e0e0e0', '#29b6f6'],
    brown:  ['transparent', '#211005', '#795548', '#4e342e', '#d7ccc8', '#388e3c'],
    pink:   ['transparent', '#222222', '#d81b60', '#880e4f', '#f8bbd0', '#ffd54f'],
    map:    ['transparent', '#000000', '#ffffff', '#cccccc', '#ff3333', '#111111']
};

const SPRITES = {
    // ==========================================
    // PLAYER
    // ==========================================
    player: {
        id: 'player',
        palette: PALETTES.player,
        pixels: [
            "  111   ",
            " 15551  ",
            " 11511  ",
            " 12221  ",
            "1322231 ",
            "1132311 ",
            "1112111 ",
            "  111   "
        ]
    },

    // ==========================================
    // ICONS
    // ==========================================
    cardAttack: {
        id: 'cardAttack',
        palette: PALETTES.red,
        pixels: [
            "  111   ",
            "  121   ",
            " 11411  ",
            " 11211  ",
            "  121   ",
            "  121   ",
            "  131   ",
            "  111   "
        ]
    },
    cardSkill: {
        id: 'cardSkill',
        palette: PALETTES.green,
        pixels: [
            "   111  ",
            "  12221 ",
            " 142221 ",
            " 12221  ",
            " 11221  ",
            "  1221  ",
            "  121   ",
            "   1    "
        ]
    },
    cardPower: {
        id: 'cardPower',
        palette: PALETTES.blue,
        pixels: [
            " 11  11 ",
            "1411121 ",
            " 12121  ",
            "  121   ",
            "  121   ",
            " 12121  ",
            "1211121 ",
            " 11  11 "
        ]
    },
    cardStatus: {
        id: 'cardStatus',
        palette: PALETTES.gray,
        pixels: [
            "  111   ",
            " 12221  ",
            "1211121 ",
            "1221221 ",
            " 11111  ",
            "   1    ",
            "   1    ",
            "  111   "
        ]
    },
    cardCurse: {
        id: 'cardCurse',
        palette: [...PALETTES.purple],
        pixels: [
            "   11   ",
            "  1221  ",
            " 121121 ",
            " 112211 ",
            " 122221 ",
            "  1221  ",
            "   11   ",
            "   11   "
        ]
    },
    
    // ==========================================
    // ENEMIES
    // ==========================================
    louse: {
        id: 'louse',
        palette: PALETTES.green,
        pixels: [
            "        ",
            "        ",
            "  1111  ",
            " 122221 ",
            "11422211",
            "12222221",
            " 155551 ",
            " 111111 "
        ]
    },
    slimeS: {
        id: 'slimeS',
        palette: PALETTES.green,
        pixels: [
            "        ",
            "        ",
            "        ",
            "  111   ",
            " 14221  ",
            " 121121 ",
            "12222221",
            " 111111 "
        ]
    },
    slimeM: {
        id: 'slimeM',
        palette: PALETTES.green,
        pixels: [
            "        ",
            "  1111  ",
            " 142221 ",
            "12222221",
            "12122121",
            "12222221",
            "12222221",
            " 111111 "
        ]
    },
    slimeL: {
        id: 'slimeL',
        palette: PALETTES.green,
        pixels: [
            "  1111  ",
            " 142221 ",
            "12222221",
            "12122121",
            "12222221",
            "12211221",
            "12222221",
            "11111111"
        ]
    },
    jawWorm: {
        id: 'jawWorm',
        palette: PALETTES.red,
        pixels: [
            "   1    ",
            "  141   ",
            " 12221  ",
            "1212221 ",
            "1112211 ",
            "1222221 ",
            " 11111  ",
            "  121   "
        ]
    },
    cultist: {
        id: 'cultist',
        palette: PALETTES.blue,
        pixels: [
            "  121   ",
            " 12221  ",
            "1142111 ",
            " 12221  ",
            " 12121  ",
            " 12221  ",
            " 12221  ",
            " 11111  "
        ]
    },
    gremlinNob: {
        id: 'gremlinNob',
        palette: PALETTES.red,
        pixels: [
            " 111111 ",
            " 142221 ",
            "1121211 ",
            "12222221",
            " 121121 ",
            " 122221 ",
            " 122221 ",
            " 111111 "
        ]
    },
    lagavulin: {
        id: 'lagavulin',
        palette: PALETTES.gray,
        pixels: [
            "  111   ",
            " 12221  ",
            " 11111  ",
            "1221221 ",
            "1421221 ",
            "1222221 ",
            "1222221 ",
            " 11111  "
        ]
    },
    sentry: {
        id: 'sentry',
        palette: PALETTES.gray,
        pixels: [
            "  111   ",
            " 14221  ",
            " 12521  ",
            "1222221 ",
            " 11111  ",
            "  121   ",
            " 11111  ",
            " 12221  "
        ]
    },
    theGuardian: {
        id: 'theGuardian',
        palette: PALETTES.gold,
        pixels: [
            " 111111 ",
            "12242221",
            "11255211",
            "12222221",
            "12222221",
            " 112211 ",
            " 121121 ",
            " 11  11 "
        ]
    },
    hexaghost: {
        id: 'hexaghost',
        palette: PALETTES.purple,
        pixels: [
            "  111   ",
            " 11411  ",
            "1122211 ",
            "1212121 ",
            "1122211 ",
            " 11211  ",
            "  111   ",
            "   1    "
        ]
    },
    slimeBoss: {
        id: 'slimeBoss',
        palette: PALETTES.green,
        pixels: [
            "  1111  ",
            " 142221 ",
            "12222221",
            "11122111",
            "12222221",
            "12222221",
            " 155551 ",
            " 111111 "
        ]
    },
    byrd: {
        id: 'byrd',
        palette: PALETTES.gray,
        pixels: [
            "   11   ",
            " 11211  ",
            " 14221  ",
            "1122211 ",
            "1222221 ",
            "  111   ",
            "  1 1   ",
            "  1 1   "
        ]
    },
    chosen: {
        id: 'chosen',
        palette: PALETTES.purple,
        pixels: [
            "  111   ",
            " 12421  ",
            " 11111  ",
            " 12521  ",
            " 11211  ",
            " 12221  ",
            "  111   ",
            "  1 1   "
        ]
    },
    sphere: {
        id: 'sphere',
        palette: PALETTES.blue,
        pixels: [
            "  111   ",
            " 12241  ",
            " 12221  ",
            "1222221 ",
            "1222221 ",
            " 12221  ",
            " 12221  ",
            "  111   "
        ]
    },
    mugger: {
        id: 'mugger',
        palette: PALETTES.gray,
        pixels: [
            "  111   ",
            " 12121  ",
            " 12221  ",
            "1111111 ",
            " 14221  ",
            " 12221  ",
            " 12221  ",
            " 11111  "
        ]
    },
    looter: {
        id: 'looter',
        palette: PALETTES.brown,
        pixels: [
            "  111   ",
            " 12121  ",
            " 12221  ",
            "1111111 ",
            " 14221  ",
            " 12221  ",
            " 12221  ",
            " 11111  "
        ]
    },
    gremlinLeader: {
        id: 'gremlinLeader',
        palette: PALETTES.red,
        pixels: [
            " 111111 ",
            " 122221 ",
            "11122111",
            " 152251 ",
            " 122221 ",
            "11111111",
            "  1221  ",
            "  1111  "
        ]
    },
    slavers: {
        id: 'slavers',
        palette: PALETTES.red,
        pixels: [
            "   11   ",
            "  1221  ",
            " 112211 ",
            " 142221 ",
            " 122221 ",
            " 122221 ",
            "  1111  ",
            "  1  1  "
        ]
    },
    bookOfStabbing: {
        id: 'bookOfStabbing',
        palette: PALETTES.gray,
        pixels: [
            " 111111 ",
            " 124221 ",
            "11222211",
            "12122121",
            "12222221",
            "12211221",
            " 122221 ",
            " 111111 "
        ]
    },
    champ: {
        id: 'champ',
        palette: PALETTES.gold,
        pixels: [
            "  1111  ",
            " 152251 ",
            "11222211",
            " 122221 ",
            " 122221 ",
            " 122221 ",
            " 122221 ",
            " 111111 "
        ]
    },
    automaton: {
        id: 'automaton',
        palette: PALETTES.gold,
        pixels: [
            "  1111  ",
            " 142221 ",
            "11255211",
            "12222221",
            "12222221",
            "11222211",
            " 122221 ",
            " 111111 "
        ]
    },
    collector: {
        id: 'collector',
        palette: PALETTES.purple,
        pixels: [
            " 111111 ",
            "11222211",
            "12122121",
            "12222221",
            " 142221 ",
            " 112211 ",
            "  1221  ",
            "  1111  "
        ]
    },
    darkling: {
        id: 'darkling',
        palette: PALETTES.gray,
        pixels: [
            "  111   ",
            " 12421  ",
            "1222221 ",
            "1212121 ",
            "1222221 ",
            " 12221  ",
            "  111   ",
            "   1    "
        ]
    },
    spireGrowth: {
        id: 'spireGrowth',
        palette: PALETTES.green,
        pixels: [
            "   11   ",
            "  1421  ",
            " 122221 ",
            "12222221",
            "12122121",
            " 122221 ",
            "  1111  ",
            "   11   "
        ]
    },
    maw: {
        id: 'maw',
        palette: PALETTES.red,
        pixels: [
            "  1111  ",
            " 124221 ",
            "12211221",
            " 122221 ",
            " 122221 ",
            "12211221",
            " 122221 ",
            "  1111  "
        ]
    },
    giantHead: {
        id: 'giantHead',
        palette: PALETTES.gray,
        pixels: [
            " 111111 ",
            "12242221",
            "12122121",
            "12222221",
            "12211221",
            "12222221",
            "12222221",
            " 111111 "
        ]
    },
    nemesis: {
        id: 'nemesis',
        palette: PALETTES.purple,
        pixels: [
            "  111   ",
            " 11411  ",
            "1122211 ",
            "1212121 ",
            "1122211 ",
            " 11211  ",
            "  111   ",
            "   1    "
        ]
    },
    reptomancer: {
        id: 'reptomancer',
        palette: PALETTES.green,
        pixels: [
            "  1111  ",
            " 124221 ",
            "11212211",
            " 122221 ",
            " 122221 ",
            " 122221 ",
            " 111111 ",
            "  1  1  "
        ]
    },
    daggers: {
        id: 'daggers',
        palette: PALETTES.gray,
        pixels: [
            "   11   ",
            "   11   ",
            "  1221  ",
            "  1421  ",
            "  1221  ",
            "  1551  ",
            "   11   ",
            "   11   "
        ]
    },
    donu: {
        id: 'donu',
        palette: PALETTES.gold,
        pixels: [
            "  1111  ",
            " 122421 ",
            "12211221",
            "121  121",
            "121  121",
            "12211221",
            " 122221 ",
            "  1111  "
        ]
    },
    deca: {
        id: 'deca',
        palette: PALETTES.blue,
        pixels: [
            "   11   ",
            "  1221  ",
            " 124221 ",
            "12222221",
            "12222221",
            " 122221 ",
            "  1221  ",
            "   11   "
        ]
    },
    timeEater: {
        id: 'timeEater',
        palette: PALETTES.blue,
        pixels: [
            "  1111  ",
            " 142221 ",
            "12511521",
            "12122121",
            "12511521",
            "12222221",
            " 122221 ",
            " 111111 "
        ]
    },
    awakenedOne: {
        id: 'awakenedOne',
        palette: PALETTES.blue,
        pixels: [
            " 11  11 ",
            "12111121",
            "14222221",
            "12122121",
            " 122221 ",
            " 122221 ",
            " 122221 ",
            "  1111  "
        ]
    },

    // ==========================================
    // MAP NODES
    // ==========================================
    nodeMonster: {
        id: 'nodeMonster',
        palette: PALETTES.gray,
        pixels: [
            "1   1  1",
            " 1 1  1 ",
            "  1  1  ",
            " 1 11   ",
            "1   11  ",
            "     11 ",
            "      11",
            "       1"
        ]
    },
    nodeElite: {
        id: 'nodeElite',
        palette: PALETTES.red,
        pixels: [
            "1      1",
            " 1 11 1 ",
            "  1221  ",
            "   11   ",
            "  1221  ",
            "  1221  ",
            "   11   ",
            "   11   "
        ]
    },
    nodeRest: {
        id: 'nodeRest',
        palette: PALETTES.gold,
        pixels: [
            "   11   ",
            "  1441  ",
            " 122221 ",
            "11222211",
            "12222221",
            "11222211",
            "  1111  ",
            "  1111  "
        ]
    },
    nodeShop: {
        id: 'nodeShop',
        palette: PALETTES.gray,
        pixels: [
            " 1     1",
            " 1111111",
            "  15551 ",
            "  15551 ",
            "  15551 ",
            "   111  ",
            "   1 1  ",
            "   1 1  "
        ]
    },
    nodeEvent: {
        id: 'nodeEvent',
        palette: PALETTES.blue,
        pixels: [
            "  111   ",
            " 12221  ",
            " 11121  ",
            "   121  ",
            "  121   ",
            "  111   ",
            "  121   ",
            "  111   "
        ]
    },
    nodeTreasure: {
        id: 'nodeTreasure',
        palette: PALETTES.gold,
        pixels: [
            "        ",
            "  1111  ",
            " 122221 ",
            "11111111",
            "15511551",
            "12222221",
            "12222221",
            " 111111 "
        ]
    },
    nodeBoss: {
        id: 'nodeBoss',
        palette: PALETTES.purple,
        pixels: [
            " 1    1 ",
            " 111111 ",
            "11422211",
            "12122121",
            "12222221",
            "11211211",
            " 122221 ",
            " 111111 "
        ]
    },

    // ==========================================
    // RELICS
    // ==========================================
    relicGeneric: {
        id: 'relicGeneric',
        palette: PALETTES.gold,
        pixels: [
            "  111   ",
            " 12421  ",
            "1222221 ",
            " 12221  ",
            " 12221  ",
            "  111   ",
            "  151   ",
            "  111   "
        ]
    },
    relicBlood: {
        id: 'relicBlood',
        palette: PALETTES.red,
        pixels: [
            "   11   ",
            "  1221  ",
            " 124221 ",
            "12222221",
            "12211221",
            "12222221",
            " 122221 ",
            "  1111  "
        ]
    },

    // ==========================================
    // POTIONS
    // ==========================================
    potionGeneric: {
        id: 'potionGeneric',
        palette: PALETTES.green,
        pixels: [
            "   11   ",
            "   11   ",
            "  1111  ",
            " 155551 ",
            "12242221",
            "12222221",
            " 122221 ",
            "  1111  "
        ]
    },

    // ==========================================
    // EVENTS
    // ==========================================
    eventGeneric: {
        id: 'eventGeneric',
        palette: PALETTES.gray,
        pixels: [
            "  1111  ",
            " 122221 ",
            "12211121",
            "12222221",
            " 122221 ",
            " 122221 ",
            "  1111  ",
            "  1  1  "
        ]
    }
};
