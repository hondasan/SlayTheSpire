// ============================================
// MAP SYSTEM - Procedural Map Generation
// ============================================

const NodeType = {
    MONSTER: 'monster',
    ELITE: 'elite',
    REST: 'rest',
    SHOP: 'shop',
    EVENT: 'event',
    TREASURE: 'treasure',
    BOSS: 'boss'
};

const NODE_ICONS = {
    [NodeType.MONSTER]: 'nodeMonster',
    [NodeType.ELITE]: 'nodeElite',
    [NodeType.REST]: 'nodeRest',
    [NodeType.SHOP]: 'nodeShop',
    [NodeType.EVENT]: 'nodeEvent',
    [NodeType.TREASURE]: 'nodeTreasure',
    [NodeType.BOSS]: 'nodeBoss'
};

const NODE_COLORS = {
    [NodeType.MONSTER]: '#cc4444',
    [NodeType.ELITE]: '#ff8800',
    [NodeType.REST]: '#44cc44',
    [NodeType.SHOP]: '#ffdd00',
    [NodeType.EVENT]: '#8888ff',
    [NodeType.TREASURE]: '#ffaa00',
    [NodeType.BOSS]: '#ff2222'
};

// Generate a full map for one Act
function generateMap(act) {
    const floors = 15;
    const pathCount = Math.floor(Math.random() * 2) + 4; // 4-5 paths
    const width = 7; // horizontal positions

    const map = {
        act: act,
        floors: [],
        paths: []
    };

    // Generate nodes per floor
    for (let floor = 0; floor < floors; floor++) {
        const floorNodes = [];
        let nodeCount;

        if (floor === 0) {
            // First floor: multiple starting points
            nodeCount = pathCount;
        } else if (floor === floors - 1) {
            // Last floor before boss: rest site
            nodeCount = Math.floor(Math.random() * 2) + 2;
        } else if (floor === 7) {
            // Mid-point: treasure
            nodeCount = Math.floor(Math.random() * 2) + 1;
        } else {
            nodeCount = Math.floor(Math.random() * 3) + 2; // 2-4 nodes
        }

        // Ensure max nodes
        nodeCount = Math.min(nodeCount, width);

        // Pick positions
        const positions = getSpreadPositions(nodeCount, width);

        for (const pos of positions) {
            const nodeType = getNodeType(floor, floors, act);
            floorNodes.push({
                id: `${act}-${floor}-${pos}`,
                floor: floor,
                x: pos,
                type: nodeType,
                visited: false,
                available: floor === 0,
                connections: []
            });
        }

        map.floors.push(floorNodes);
    }

    // Add boss node
    const bossNode = {
        id: `${act}-boss`,
        floor: floors,
        x: Math.floor(width / 2),
        type: NodeType.BOSS,
        visited: false,
        available: false,
        connections: []
    };
    map.floors.push([bossNode]);

    // Generate paths (connect nodes between floors)
    generatePaths(map);

    return map;
}

function getSpreadPositions(count, width) {
    const positions = [];
    const step = width / (count + 1);
    for (let i = 0; i < count; i++) {
        let pos = Math.round(step * (i + 1));
        // Add slight randomness
        pos += Math.floor(Math.random() * 2) - 1;
        pos = Math.max(0, Math.min(width - 1, pos));
        // Avoid duplicates
        while (positions.includes(pos)) {
            pos = (pos + 1) % width;
        }
        positions.push(pos);
    }
    return positions.sort((a, b) => a - b);
}

function getNodeType(floor, totalFloors, act) {
    // Floor 0: always monster
    if (floor === 0) return NodeType.MONSTER;

    // Last floor before boss: always rest
    if (floor === totalFloors - 1) return NodeType.REST;

    // Mid treasure
    if (floor === 7) return Math.random() < 0.5 ? NodeType.TREASURE : NodeType.EVENT;

    // Normal distribution
    const roll = Math.random();
    const eliteChance = act === 1 ? 0.08 : (act === 2 ? 0.1 : 0.12);

    if (roll < 0.40) return NodeType.MONSTER;
    if (roll < 0.40 + eliteChance) return NodeType.ELITE;
    if (roll < 0.55 + eliteChance) return NodeType.EVENT;
    if (roll < 0.68 + eliteChance) return NodeType.REST;
    if (roll < 0.78 + eliteChance) return NodeType.SHOP;
    if (roll < 0.85 + eliteChance) return NodeType.TREASURE;
    return NodeType.MONSTER;
}

function generatePaths(map) {
    const floors = map.floors;

    for (let f = 0; f < floors.length - 1; f++) {
        const currentFloor = floors[f];
        const nextFloor = floors[f + 1];

        if (nextFloor.length === 0) continue;

        // Each node connects to 1-2 nodes in next floor
        for (const node of currentFloor) {
            // Find closest node(s) in next floor
            const sorted = [...nextFloor].sort((a, b) =>
                Math.abs(a.x - node.x) - Math.abs(b.x - node.x)
            );

            // Connect to closest
            const connectCount = Math.random() < 0.4 ? 2 : 1;
            for (let i = 0; i < Math.min(connectCount, sorted.length); i++) {
                if (!node.connections.includes(sorted[i].id)) {
                    node.connections.push(sorted[i].id);
                }
            }
        }

        // Ensure every next floor node has at least one incoming connection
        for (const nextNode of nextFloor) {
            const hasIncoming = currentFloor.some(n => n.connections.includes(nextNode.id));
            if (!hasIncoming) {
                // Connect from closest current node
                const closest = [...currentFloor].sort((a, b) =>
                    Math.abs(a.x - nextNode.x) - Math.abs(b.x - nextNode.x)
                )[0];
                if (closest) {
                    closest.connections.push(nextNode.id);
                }
            }
        }
    }
}

// Render map on canvas
function renderMap(map, canvas, nodesContainer) {
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    const totalFloors = map.floors.length;
    const floorHeight = 80;
    const totalHeight = (totalFloors + 1) * floorHeight + 60;
    const width = container.clientWidth;

    canvas.width = width;
    canvas.height = totalHeight;
    nodesContainer.style.height = totalHeight + 'px';

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paths (bottom to top in Slay the Spire style)
    for (let f = 0; f < map.floors.length - 1; f++) {
        const currentFloor = map.floors[f];
        for (const node of currentFloor) {
            const fromY = totalHeight - (f + 1) * floorHeight;
            const fromX = getNodeScreenX(node.x, width);

            for (const connId of node.connections) {
                const targetNode = findNodeById(map, connId);
                if (!targetNode) continue;

                const toY = totalHeight - (targetNode.floor + 1) * floorHeight;
                const toX = getNodeScreenX(targetNode.x, width);

                let isDashed = true;

                // Color based on visit state
                if (node.visited && targetNode.visited) {
                    // Path taken (solid, dark gray)
                    ctx.strokeStyle = 'rgba(80, 80, 90, 0.8)';
                    ctx.lineWidth = 4;
                    isDashed = false;
                } else if (node.visited && targetNode.available) {
                    // Next possible path (bright dotted)
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.lineWidth = 3;
                    isDashed = true;
                } else if (!node.visited && node.available) {
                    // Start of game available paths (faint dotted)
                    ctx.strokeStyle = 'rgba(100, 100, 110, 0.4)';
                    ctx.lineWidth = 2;
                    isDashed = true;
                } else {
                    // Future / Unreachable paths (faint dotted)
                    ctx.strokeStyle = 'rgba(70, 70, 80, 0.3)';
                    ctx.lineWidth = 2;
                    isDashed = true;
                }

                if (isDashed) {
                    ctx.setLineDash([6, 8]);
                } else {
                    ctx.setLineDash([]);
                }

                ctx.beginPath();
                ctx.moveTo(fromX, fromY);
                // Slight curve upwards
                const midY = (fromY + toY) / 2;
                ctx.bezierCurveTo(fromX, midY + 10, toX, midY - 10, toX, toY);
                ctx.stroke();
            }
        }
    }

    ctx.setLineDash([]);

    // Remove old node elements
    nodesContainer.innerHTML = '';

    // Draw node icons
    for (let f = 0; f < map.floors.length; f++) {
        const floor = map.floors[f];
        for (const node of floor) {
            const y = totalHeight - (f + 1) * floorHeight;
            const x = getNodeScreenX(node.x, width);

            const nodeEl = document.createElement('div');
            nodeEl.className = 'map-node';
            if (node.visited) nodeEl.classList.add('visited');
            if (node.available) nodeEl.classList.add('available');
            nodeEl.style.left = (x - 22) + 'px';
            nodeEl.style.top = (y - 22) + 'px';
            const spriteId = NODE_ICONS[node.type];
            const sprite = SPRITES[spriteId];
            if (sprite) {
                nodeEl.innerHTML = '<img src="' + SpriteEngine.render(sprite.pixels, sprite.palette) + '" style="width:100%;height:100%;object-fit:contain;image-rendering:pixelated">';
            } else {
                nodeEl.textContent = '❓';
            }
            nodeEl.dataset.nodeId = node.id;

            // Tooltip
            nodeEl.title = getNodeTypeName(node.type);

            nodesContainer.appendChild(nodeEl);
        }
    }

    // Scroll to current available nodes
    const firstAvailable = map.floors.find(f => f.some(n => n.available));
    if (firstAvailable) {
        const availNode = firstAvailable.find(n => n.available);
        if (availNode) {
            const scrollY = totalHeight - (availNode.floor + 1) * floorHeight - container.clientHeight / 2;
            container.scrollTop = Math.max(0, scrollY);
        }
    }
}

function getNodeScreenX(nodeX, screenWidth) {
    const padding = 60;
    const usableWidth = screenWidth - padding * 2;
    return padding + (nodeX / 6) * usableWidth;
}

function findNodeById(map, nodeId) {
    for (const floor of map.floors) {
        for (const node of floor) {
            if (node.id === nodeId) return node;
        }
    }
    return null;
}

function getNodeTypeName(type) {
    const names = {
        [NodeType.MONSTER]: '通常戦闘',
        [NodeType.ELITE]: 'エリート戦闘',
        [NodeType.REST]: '焚き火',
        [NodeType.SHOP]: 'ショップ',
        [NodeType.EVENT]: 'イベント',
        [NodeType.TREASURE]: '宝箱',
        [NodeType.BOSS]: 'ボス'
    };
    return names[type] || type;
}

// After visiting a node, update availability
function updateMapAvailability(map, visitedNodeId) {
    const node = findNodeById(map, visitedNodeId);
    if (!node) return;

    node.visited = true;
    node.available = false;

    // Make all nodes unavailable first
    for (const floor of map.floors) {
        for (const n of floor) {
            if (!n.visited) n.available = false;
        }
    }

    // Make connected nodes available
    for (const connId of node.connections) {
        const connNode = findNodeById(map, connId);
        if (connNode && !connNode.visited) {
            connNode.available = true;
        }
    }
}
