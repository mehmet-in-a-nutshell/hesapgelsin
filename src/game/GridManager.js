/**
 * GridManager.js
 * Manages cafe room grid, layout placement, collision checking,
 * seating capacity, decoration atmosphere stats, and pathfinder grid updates.
 */

import { Pathfinder } from '../engine/Pathfinder.js';

export const ITEM_CATALOG = {
  // --- TABLES ---
  TABLE_BASIC: {
    id: 'TABLE_BASIC',
    name: 'Ahşap Bistro Masası',
    category: 'tables',
    price: 3600,
    repairCostRatio: 0.20,
    width: 1,
    height: 1,
    capacity: 2,
    comfortBonus: 5,
    description: 'Küçük ve şık 2 kişilik bistro masası.'
  },
  TABLE_WOOD: {
    id: 'TABLE_WOOD',
    name: 'Cilalı Meşe Masa',
    category: 'tables',
    price: 6000,
    repairCostRatio: 0.20,
    width: 1,
    height: 1,
    capacity: 2,
    comfortBonus: 12,
    description: 'Kaliteli meşe ağacından yapılmış dayanıklı masa.'
  },
  TABLE_PREMIUM: {
    id: 'TABLE_PREMIUM',
    name: 'Mermer & Pirinç Masa',
    category: 'tables',
    price: 13500,
    repairCostRatio: 0.20,
    width: 1,
    height: 1,
    capacity: 4,
    comfortBonus: 25,
    description: 'Lüks mermer kaplama 4 kişilik VIP masası.'
  },

  // --- CHAIRS ---
  CHAIR_BASIC: {
    id: 'CHAIR_BASIC',
    name: 'Ahşap Sandalye',
    category: 'chairs',
    price: 1250,
    repairCostRatio: 0.20,
    width: 1,
    height: 1,
    comfortBonus: 3,
    description: 'Temel rahatlıkta ahşap sandalye.'
  },
  CHAIR_COMFORT: {
    id: 'CHAIR_COMFORT',
    name: 'Kumaş Koltuk',
    category: 'chairs',
    price: 2700,
    repairCostRatio: 0.20,
    width: 1,
    height: 1,
    comfortBonus: 10,
    description: 'Yumuşak süngerli konforlu koltuk.'
  },
  CHAIR_SOFA: {
    id: 'CHAIR_SOFA',
    name: 'Deri Köşe Koltuğu',
    category: 'chairs',
    price: 6000,
    repairCostRatio: 0.20,
    width: 1,
    height: 1,
    comfortBonus: 20,
    description: 'Müşterilerin uzun süre keyif yapabileceği lüks deri koltuk.'
  },

  // --- COUNTERS ---
  COUNTER_BASIC: {
    id: 'COUNTER_BASIC',
    name: 'Servis Bankosu & Kasa',
    category: 'counters',
    price: 6000,
    repairCostRatio: 0.30,
    width: 1,
    height: 1,
    isCounter: true,
    description: 'Müşteri siparişlerinin alındığı ve ödemelerin yapıldığı temel banko.'
  },
  COUNTER_MARBLE: {
    id: 'COUNTER_MARBLE',
    name: 'Mermer Pastane Bankosu',
    category: 'counters',
    price: 15000,
    repairCostRatio: 0.30,
    width: 1,
    height: 1,
    isCounter: true,
    atmosphereBonus: 15,
    description: 'Cam pasta vitrinli lüks mermer banko.'
  },

  // --- EQUIPMENT ---
  ESPRESSO_MACHINE_TIER_1: {
    id: 'ESPRESSO_MACHINE_TIER_1',
    name: 'Klasik Espresso Makinesi (Tier 1)',
    category: 'equipment',
    price: 9000,
    repairCostRatio: 0.50,
    tier: 1,
    speedBonus: 1.0,
    qualityBonus: 5,
    width: 1,
    height: 1,
    description: 'Temel espresso demleme makinesi.'
  },
  ESPRESSO_MACHINE_TIER_2: {
    id: 'ESPRESSO_MACHINE_TIER_2',
    name: 'Çift Grup Çelik Espresso Makinesi (Tier 2)',
    category: 'equipment',
    price: 22500,
    repairCostRatio: 0.50,
    tier: 2,
    speedBonus: 1.4,
    qualityBonus: 15,
    width: 1,
    height: 1,
    viralBonusChance: 0.05,
    repBonus: 0.08,
    description: '📸 +%5 Instagram viral paylaşım katkısı (🤩) ve +0.08 Yıldız bonusu kazandırır! (Maks %30 tavan)'
  },
  ESPRESSO_MACHINE_TIER_3: {
    id: 'ESPRESSO_MACHINE_TIER_3',
    name: 'Pro Mat Siyah & Bakır Kahve Makinesi (Tier 3)',
    category: 'equipment',
    price: 54000,
    repairCostRatio: 0.50,
    tier: 3,
    speedBonus: 2.0,
    qualityBonus: 30,
    width: 1,
    height: 1,
    viralBonusChance: 0.10,
    repBonus: 0.15,
    description: '📸 +%10 Instagram viral paylaşım katkısı (🤩) ve +0.15 Yıldız bonusu kazandırır! (Maks %30 tavan)'
  },
  REFRIGERATOR_SMALL: {
    id: 'REFRIGERATOR_SMALL',
    name: 'Buzdolabı',
    category: 'equipment',
    price: 20000,
    repairCostRatio: 0.35,
    width: 1,
    height: 1,
    storageBonus: 50,
    description: 'Taze süt, soğuk içecekler ve gıda malzemeleri için dayanıklı buzdolabı.'
  },
  REFRIGERATOR_STAINLESS: {
    id: 'REFRIGERATOR_STAINLESS',
    name: 'Çift Kapılı İçecek Dolabı',
    category: 'equipment',
    price: 14000,
    repairCostRatio: 0.35,
    width: 1,
    height: 1,
    storageBonus: 150,
    description: 'Yüksek hacimli malzeme depolama dolabı.'
  },

  // --- DECORATIONS ---
  PLANT_MONSTERA: {
    id: 'PLANT_MONSTERA',
    name: 'Monstera Yapraklı Saksı',
    category: 'decorations',
    price: 2100,
    repairCostRatio: 0.20,
    width: 1,
    height: 1,
    atmosphereBonus: 8,
    description: 'Kafe ortamına doğallık ve ferahlık katar.'
  },
  PLANT_FICUS: {
    id: 'PLANT_FICUS',
    name: 'Büyük Ağaç Saksısı',
    category: 'decorations',
    price: 4200,
    repairCostRatio: 0.20,
    width: 1,
    height: 1,
    atmosphereBonus: 18,
    description: 'Büyük ve gösterişli iç mekan bitkisi.'
  },
  LAMP_VINTAGE: {
    id: 'LAMP_VINTAGE',
    name: 'Edison Sarkıt Lamba',
    category: 'decorations',
    price: 4500,
    repairCostRatio: 0.20,
    width: 1,
    height: 1,
    atmosphereBonus: 12,
    description: 'Sıcak ve loş ambiyans aydınlatması.'
  },
  BOOKSHELF: {
    id: 'BOOKSHELF',
    name: 'Ahşap Kitaplık',
    category: 'decorations',
    price: 6300,
    repairCostRatio: 0.20,
    width: 1,
    height: 1,
    atmosphereBonus: 15,
    freelancerDemandBonus: 0.2,
    description: 'Öğrenci ve freelancer müşterilerin kalış süresini artırır.'
  },
  WIFI_STATION: {
    id: 'WIFI_STATION',
    name: 'Yüksek Hızlı Wi-Fi İstasyonu',
    category: 'decorations',
    price: 8000,
    repairCostRatio: 0.50,
    width: 1,
    height: 1,
    freelancerDemandBonus: 0.3,
    description: 'Freelancer ve öğrenci müşteri akışını %30 artırır.'
  },
  SPEAKER: {
    id: 'SPEAKER',
    name: 'Vintage Marshall Hoparlör',
    category: 'decorations',
    price: 5400,
    repairCostRatio: 0.35,
    width: 1,
    height: 1,
    atmosphereBonus: 14,
    description: 'Keyifli caz müzik yayınıyla müşteri memnuniyetini yükseltir.'
  }
};

export function getRepairCost(item) {
  if (!item) return 100;
  const def = ITEM_CATALOG[item.id];
  if (!def) return 100;
  const ratio = def.repairCostRatio !== undefined ? def.repairCostRatio : 0.30;
  return Math.round(def.price * ratio);
}

export class GridManager {
  constructor(cols = 15, rows = 15) {
    this.cols = cols;
    this.rows = rows;
    this.floorType = 'wood_basic';
    this.wallType = 'brick';
    this.items = []; // array of { id, x, y, rotation, uid }
    this.pathfinder = new Pathfinder(cols, rows);
    this.entrancePos = { x: 0, y: 7 }; // Door on left wall

    this.initDefaultStartingLayout();
  }

  setGridSize(cols = 15, rows = 15) {
    this.cols = 15;
    this.rows = 15;
    this.entrancePos = { x: 0, y: 7 };
    this.pathfinder.setGridSize(15, 15);
    this.rebuildPathfinderGrid();
  }

  /**
   * Automatically rotates all chairs to face their adjacent table (orthogonal first, then diagonal)
   */
  autoOrientChairs() {
    this.items.forEach(chairItem => {
      const def = ITEM_CATALOG[chairItem.id];
      if (def && def.category === 'chairs') {
        // 1. Check orthogonal neighbors (front, back, left, right)
        const orthogonalNeighbors = [
          { x: chairItem.x + 1, y: chairItem.y, rot: 0 }, // Table at SE (+x) -> face SE (rot 0)
          { x: chairItem.x, y: chairItem.y + 1, rot: 1 }, // Table at SW (+y) -> face SW (rot 1)
          { x: chairItem.x - 1, y: chairItem.y, rot: 2 }, // Table at NW (-x) -> face NW (rot 2)
          { x: chairItem.x, y: chairItem.y - 1, rot: 3 }  // Table at NE (-y) -> face NE (rot 3)
        ];

        let oriented = false;
        for (const n of orthogonalNeighbors) {
          const adjItem = this.getItemAt(n.x, n.y);
          if (adjItem && ITEM_CATALOG[adjItem.id] && ITEM_CATALOG[adjItem.id].category === 'tables') {
            chairItem.rotation = n.rot;
            oriented = true;
            break;
          }
        }

        // 2. If no orthogonal table found, check diagonal neighbors
        if (!oriented) {
          const diagonalNeighbors = [
            { x: chairItem.x + 1, y: chairItem.y + 1, rot: 4 }, // Table at South (+x, +y) -> face South (rot 4)
            { x: chairItem.x - 1, y: chairItem.y + 1, rot: 5 }, // Table at West (-x, +y) -> face West (rot 5)
            { x: chairItem.x - 1, y: chairItem.y - 1, rot: 6 }, // Table at North (-x, -y) -> face North (rot 6)
            { x: chairItem.x + 1, y: chairItem.y - 1, rot: 7 }  // Table at East (+x, -y) -> face East (rot 7)
          ];

          for (const dn of diagonalNeighbors) {
            const adjItem = this.getItemAt(dn.x, dn.y);
            if (adjItem && ITEM_CATALOG[adjItem.id] && ITEM_CATALOG[adjItem.id].category === 'tables') {
              chairItem.rotation = dn.rot;
              break;
            }
          }
        }
      }
    });
  }

  initDefaultStartingLayout() {
    // Basic initial layout: Counter, Espresso machine, 2 Tables, 4 Chairs, 1 Plant
    this.items = [
      { uid: 'counter_1', id: 'COUNTER_BASIC', x: 5, y: 3, rotation: 0 },
      { uid: 'espresso_1', id: 'ESPRESSO_MACHINE_TIER_1', x: 5, y: 2, rotation: 0 },
      { uid: 'table_1', id: 'TABLE_BASIC', x: 3, y: 8, rotation: 0 },
      { uid: 'chair_1', id: 'CHAIR_BASIC', x: 3, y: 7, rotation: 0 },
      { uid: 'chair_2', id: 'CHAIR_BASIC', x: 3, y: 9, rotation: 0 },
      { uid: 'table_2', id: 'TABLE_BASIC', x: 9, y: 8, rotation: 0 },
      { uid: 'chair_3', id: 'CHAIR_BASIC', x: 9, y: 7, rotation: 0 },
      { uid: 'chair_4', id: 'CHAIR_BASIC', x: 9, y: 9, rotation: 0 },
      { uid: 'plant_1', id: 'PLANT_MONSTERA', x: 1, y: 1, rotation: 0 }
    ];

    this.autoOrientChairs();
    this.rebuildPathfinderGrid();
  }

  /**
   * Automatically rotates all refrigerators to face towards the inside of the cafe room.
   */
  autoOrientRefrigerators() {
    this.items.forEach(item => {
      if (item.id === 'REFRIGERATOR_STAINLESS' || item.id === 'REFRIGERATOR_SMALL') {
        // Automatically face doors into the cafe interior (SE if x >= y, SW if x < y)
        if (item.x >= item.y) {
          item.rotation = 1; // Doors face South-East (into room)
        } else {
          item.rotation = 0; // Doors face South-West (into room)
        }
      }
    });
  }

  rebuildPathfinderGrid() {
    this.pathfinder.setGridSize(this.cols, this.rows);
    // Ensure entrance doorway tile (0, 7) is ALWAYS walkable
    this.pathfinder.setObstacle(0, 7, false);
    this.items.forEach(item => {
      // ALL items (chairs, tables, counters, plants, equipment) are obstacles!
      this.pathfinder.setObstacle(item.x, item.y, true);
    });
    this.autoOrientChairs();
    this.autoOrientRefrigerators();
  }

  /**
   * Calculates total active (non-broken) cold storage capacity provided by placed refrigerators.
   */
  getRefrigeratedCapacity() {
    let capacity = 0;
    this.items.forEach(item => {
      if (!item.isBroken) {
        if (item.id === 'REFRIGERATOR_SMALL') {
          capacity += 50; // Buzdolabı: +50 birim soğuk koruma alanı
        } else if (item.id === 'REFRIGERATOR_STAINLESS') {
          capacity += 150; // Çift Kapılı İçecek Dolabı: +150 birim soğuk koruma alanı
        }
      }
    });
    return capacity;
  }

  /**
   * Checks if an active (non-broken) Double-Door Stainless Refrigerator is placed in the cafe.
   */
  hasDoubleDoorFridge() {
    return this.items.some(it => it.id === 'REFRIGERATOR_STAINLESS' && !it.isBroken);
  }

  canPlaceItem(gx, gy, itemDef) {
    if (gx < 0 || gx >= this.cols || gy < 0 || gy >= this.rows) return false;
    // Disallow building furniture on the entrance doorway tile (0, 7)
    if (gx === 0 && gy === 7) return false;
    // Check if tile already occupied
    const occupied = this.items.some(it => it.x === gx && it.y === gy);
    return !occupied;
  }

  canMoveItem(item, newGx, newGy) {
    if (!item) return false;
    if (newGx < 0 || newGx >= this.cols || newGy < 0 || newGy >= this.rows) return false;
    if (newGx === 0 && newGy === 7) return false;

    // Tile is valid if free or is the item's current tile
    const occupied = this.items.some(it => it.uid !== item.uid && it.x === newGx && it.y === newGy);
    return !occupied;
  }

  movePlacedItem(item, newGx, newGy) {
    if (!this.canMoveItem(item, newGx, newGy)) return false;
    item.x = newGx;
    item.y = newGy;
    this.autoOrientChairs();
    this.rebuildPathfinderGrid();
    return true;
  }

  placeItem(gx, gy, itemDef, rotation = 0) {
    if (!this.canPlaceItem(gx, gy, itemDef)) return null;

    const newItem = {
      uid: `${itemDef.id}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      id: itemDef.id,
      x: gx,
      y: gy,
      rotation,
      placedItem: null
    };

    this.items.push(newItem);
    this.autoOrientChairs();
    this.rebuildPathfinderGrid();
    return newItem;
  }

  removeItem(uid) {
    const idx = this.items.findIndex(it => it.uid === uid);
    if (idx !== -1) {
      const removed = this.items.splice(idx, 1)[0];
      this.rebuildPathfinderGrid();
      return removed;
    }
    return null;
  }

  getItemAt(gx, gy) {
    if (gx < 0 || gx >= this.cols || gy < 0 || gy >= this.rows) return null;
    return this.items.find(it => it.x === gx && it.y === gy) || null;
  }

  /**
   * Returns available seating tables & chairs
   */
  getAvailableTables() {
    const tables = this.items.filter(it => ITEM_CATALOG[it.id] && ITEM_CATALOG[it.id].category === 'tables');
    return tables;
  }

  getAdjacentTableForChair(cx, cy) {
    // 1. Check orthogonal neighbors
    const neighbors = [
      { x: cx + 1, y: cy, dir: 'SE' },
      { x: cx, y: cy + 1, dir: 'SW' },
      { x: cx - 1, y: cy, dir: 'NW' },
      { x: cx, y: cy - 1, dir: 'NE' }
    ];
    for (const n of neighbors) {
      const item = this.getItemAt(n.x, n.y);
      if (item && ITEM_CATALOG[item.id] && ITEM_CATALOG[item.id].category === 'tables') {
        return { table: item, dir: n.dir };
      }
    }
    // 2. Check diagonal neighbors if no orthogonal table found
    const diagNeighbors = [
      { x: cx + 1, y: cy + 1, dir: 'SE' },
      { x: cx - 1, y: cy + 1, dir: 'SW' },
      { x: cx - 1, y: cy - 1, dir: 'NW' },
      { x: cx + 1, y: cy - 1, dir: 'NE' }
    ];
    for (const dn of diagNeighbors) {
      const item = this.getItemAt(dn.x, dn.y);
      if (item && ITEM_CATALOG[item.id] && ITEM_CATALOG[item.id].category === 'tables') {
        return { table: item, dir: dn.dir };
      }
    }
    return null;
  }

  /**
   * Finds an unassigned chair or walkable seat tile near a table
   */
  /**
   * Finds an unassigned chair or walkable seat tile near a table.
   * Priority:
   * 1. Completely empty tables (tables with 0 seated customers)
   * 2. Partially occupied tables (if all tables have at least 1 customer)
   */
  getFreeSeatForCustomer(activeCustomers) {
    const assignedSeats = new Set();
    const occupiedTableKeys = new Set();

    activeCustomers.forEach(c => {
      if (c.assignedSeat && c.state !== 'REMOVED' && c.state !== 'LEAVING') {
        assignedSeats.add(`${c.assignedSeat.x},${c.assignedSeat.y}`);
        if (c.assignedTable) {
          occupiedTableKeys.add(`${c.assignedTable.x},${c.assignedTable.y}`);
        }
      }
    });

    const chairs = this.items.filter(it => !it.isBroken && ITEM_CATALOG[it.id] && ITEM_CATALOG[it.id].category === 'chairs');

    const freeSeatsAtEmptyTables = [];
    const freeSeatsAtOccupiedTables = [];

    for (const chair of chairs) {
      if (!assignedSeats.has(`${chair.x},${chair.y}`)) {
        const approachTile = this.getNearestWalkableTile(chair.x, chair.y);
        const info = this.getAdjacentTableForChair(chair.x, chair.y);
        if (info && info.table && info.table.isBroken) {
          continue; // Ignore broken tables
        }
        const seatObj = {
          x: chair.x,
          y: chair.y,
          approachX: approachTile.x,
          approachY: approachTile.y,
          table: info ? info.table : chair,
          chairItem: chair,
          facingDir: info ? info.dir : 'SE'
        };

        const isOccupiedTable = info ? occupiedTableKeys.has(`${info.table.x},${info.table.y}`) : false;
        if (isOccupiedTable) {
          freeSeatsAtOccupiedTables.push(seatObj);
        } else {
          freeSeatsAtEmptyTables.push(seatObj);
        }
      }
    }

    // 1. Prioritize seats at completely empty tables
    if (freeSeatsAtEmptyTables.length > 0) {
      return freeSeatsAtEmptyTables[0];
    }

    // 2. If all available tables have at least 1 customer, use partially occupied tables
    if (freeSeatsAtOccupiedTables.length > 0) {
      return freeSeatsAtOccupiedTables[0];
    }

    // If no placed chair is available, return null (customer requires an actual chair to sit)
    return null;
  }

  getTotalSeatCount() {
    return this.items.filter(it => !it.isBroken && ITEM_CATALOG[it.id] && ITEM_CATALOG[it.id].category === 'chairs').length;
  }

  getNearestWalkableTile(gx, gy) {
    gx = Math.floor(gx);
    gy = Math.floor(gy);
    if (this.pathfinder.isWalkable(gx, gy)) return { x: gx, y: gy };

    const neighbors = [
      { x: gx, y: gy + 1 },
      { x: gx, y: gy - 1 },
      { x: gx + 1, y: gy },
      { x: gx - 1, y: gy },
      { x: gx + 1, y: gy + 1 },
      { x: gx - 1, y: gy - 1 },
      { x: gx + 1, y: gy - 1 },
      { x: gx - 1, y: gy + 1 }
    ];

    for (const n of neighbors) {
      if (this.pathfinder.isWalkable(n.x, n.y)) {
        return n;
      }
    }
    return { x: gx, y: gy };
  }

  getCounterPosition() {
    const counter = this.items.find(it => !it.isBroken && ITEM_CATALOG[it.id] && ITEM_CATALOG[it.id].isCounter);
    if (counter) {
      return this.getNearestWalkableTile(counter.x, counter.y + 1);
    }
    return { x: 4, y: 4 };
  }

  getEspressoMachinePosition() {
    const machine = this.items.find(it => !it.isBroken && it.id.startsWith('ESPRESSO_MACHINE'));
    if (machine) {
      return this.getNearestWalkableTile(machine.x, machine.y + 1);
    }
    return null;
  }

  hasWorkingEspressoMachine() {
    return this.items.some(it => !it.isBroken && it.id.startsWith('ESPRESSO_MACHINE'));
  }

  /**
   * Daily breakdown processing for placed cafe equipment & furniture.
   * Probabilities are kept low (1%-3%) with a daily breakdown cap to prevent annoying multi-item failures.
   */
  processDailyItemBreakdown(uiManager) {
    let brokenCount = 0;
    const maxDailyBreakdowns = 1; // Cap to at most 1 item breaking per day

    // Shuffle non-broken items randomly so breakdown selection is fair
    const candidateItems = [...this.items].filter(it => !it.isBroken).sort(() => Math.random() - 0.5);

    for (const item of candidateItems) {
      if (brokenCount >= maxDailyBreakdowns) break;

      const itemDef = ITEM_CATALOG[item.id];
      if (!itemDef) continue;

      const isHighQuality = (itemDef.tier === 3) ||
        (item.id === 'TABLE_PREMIUM') ||
        (item.id === 'CHAIR_SOFA') ||
        (item.id === 'COUNTER_MARBLE') ||
        (item.id === 'REFRIGERATOR_STAINLESS');

      // Significantly reduced breakdown chance: 3% for standard items, 1% for high quality
      const breakdownChance = isHighQuality ? 0.01 : 0.03;

      if (Math.random() < breakdownChance) {
        item.isBroken = true;
        brokenCount++;

        if (uiManager) {
          uiManager.addNotification(
            `🔧 BOZULDU! ${itemDef.name} arızalandı! Eşyaya tıklayarak tamirci çağırabilir ya da hurda satabilirsin.`,
            '🔧'
          );
        }
      }
    }

    return brokenCount;
  }

  /**
   * Calculate total cafe atmosphere rating score
   */
  getAtmosphereScore() {
    let score = 20; // base rating
    this.items.forEach(it => {
      if (it.isBroken) return;
      const def = ITEM_CATALOG[it.id];
      if (def) {
        if (def.comfortBonus) score += def.comfortBonus;
        if (def.atmosphereBonus) score += def.atmosphereBonus;
      }
    });
    return Math.min(100, score);
  }
}

/**
 * Checks if a furniture item (chair, sofa, table, counter, machine) is currently in use
 */
export function isItemInUse(item, gameState) {
  if (!item || !gameState) return false;

  const customers = gameState.customers || [];
  const employees = gameState.employees || [];

  // 1. Check Chair or Sofa occupied by a customer
  const chairOccupied = customers.some(c =>
    c.assignedSeat && c.assignedSeat.x === item.x && c.assignedSeat.y === item.y &&
    c.state !== 'REMOVED' && c.state !== 'LEAVING'
  );
  if (chairOccupied) return true;

  // 2. Check Table occupied by customer or has drink/pastry placed on it
  const tableOccupied = customers.some(c =>
    c.assignedTable && c.assignedTable.x === item.x && c.assignedTable.y === item.y &&
    c.state !== 'REMOVED' && c.state !== 'LEAVING'
  );
  if (tableOccupied) return true;
  if (item.placedItem) return true;

  // 3. Check Counter or Espresso Machine currently used by employee
  const def = ITEM_CATALOG[item.id];
  if (def && (def.isCounter || def.id.startsWith('ESPRESSO_MACHINE'))) {
    const machineOrCounterUsed = employees.some(e =>
      (e.state === 'BREWING' || e.state === 'TAKING_ORDER') && e.currentRecipe
    );
    if (machineOrCounterUsed) return true;
  }

  return false;
}

/**
 * Returns the highest equipment tier placed in the cafe
 */
export function getHighestEquipmentTier(gridManager) {
  if (!gridManager || !gridManager.items) return 1;
  let maxTier = 1;
  gridManager.items.forEach(item => {
    if (item.id === 'ESPRESSO_MACHINE_TIER_3') maxTier = Math.max(maxTier, 3);
    else if (item.id === 'ESPRESSO_MACHINE_TIER_2') maxTier = Math.max(maxTier, 2);
  });
  return maxTier;
}
