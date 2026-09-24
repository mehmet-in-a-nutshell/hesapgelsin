import { audioEngine } from '../audio/AudioEngine.js';
import { getHighestEquipmentTier } from './GridManager.js';
import { RECIPES } from './RecipeManager.js';

export class Customer {
  constructor(id, type, startX, startY, preferredRecipe) {
    this.reset(id, type, startX, startY, preferredRecipe);
  }

  reset(id, type, startX, startY, preferredRecipe) {
    this.id = id;
    this.type = type; // 'student', 'office_worker', 'freelancer', etc.
    this.x = startX;
    this.y = startY;
    this.targetX = startX;
    this.targetY = startY;
    this.path = [];
    this.dir = 'SE';
    this.animState = 'idle';

    this.preferredRecipe = preferredRecipe;
    this.patience = 100; // max 100
    this.maxPatience = 100;
    this.satisfaction = 100;
    this.state = 'ENTERING'; // ENTERING, ORDERING, WAITING_SEAT, SEATED, CONSUMING, PAYING, LEAVING

    this.assignedTable = null;
    this.assignedSeat = null;
    this.orderedRecipe = null;
    this.orderServed = false;

    this.consumeTimer = 0;
    this.seatedTimer = 0;
    this.orderWaitTimer = 0;
    this.activeBubble = null;
    this.enterPauseTimer = 0.5;
    this.payPauseTimer = undefined;
    this.stuckTimer = 0;
  }

  clearTableItem() {
    if (this.assignedTable) {
      if (this.assignedTable.placedItems) {
        this.assignedTable.placedItems = this.assignedTable.placedItems.filter(pi => pi.customerId !== this.id);
      }
      if (this.assignedTable.placedItems && this.assignedTable.placedItems.length > 0) {
        this.assignedTable.placedItem = this.assignedTable.placedItems[this.assignedTable.placedItems.length - 1];
      } else {
        this.assignedTable.placedItem = null;
        this.assignedTable.placedItems = [];
      }
    }
  }

  updateDirection(dx, dy) {
    if (dx > 0) this.dir = 'SE';
    else if (dx < 0) this.dir = 'NW';
    else if (dy > 0) this.dir = 'SW';
    else if (dy < 0) this.dir = 'NE';
  }
}

/**
 * High-Performance Object Pool for Customer Entities
 * Reuses Customer instances to avoid GC (Garbage Collection) pauses.
 */
export class CustomerPool {
  constructor(initialCapacity = 20) {
    this.pool = [];
    for (let i = 0; i < initialCapacity; i++) {
      this.pool.push(new Customer(`pool_${i}`, 'student', 0, 0, null));
    }
  }

  acquire(id, type, startX, startY, preferredRecipe) {
    let cust;
    if (this.pool.length > 0) {
      cust = this.pool.pop();
      cust.reset(id, type, startX, startY, preferredRecipe);
    } else {
      cust = new Customer(id, type, startX, startY, preferredRecipe);
    }
    return cust;
  }

  release(cust) {
    if (!cust) return;
    cust.clearTableItem();
    cust.assignedTable = null;
    cust.assignedSeat = null;
    cust.path = [];
    if (this.pool.length < 60) {
      this.pool.push(cust);
    }
  }
}

export class AmbientPedestrian {
  constructor(id, type, startX, startY, targetX, targetY) {
    this.id = id;
    this.type = type;
    this.x = startX;
    this.y = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.speed = 1.3;
    this.dir = startX < targetX ? 'SE' : 'NW';
    this.animState = 'walk_0';
    this.active = true;
  }

  update(dt, gameSpeed) {
    if (!this.active) return;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 0.4) {
      this.active = false;
      return;
    }

    const step = this.speed * dt * gameSpeed;
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.dir = dx > 0 ? 'SE' : 'NW';
    } else {
      this.dir = dy > 0 ? 'SW' : 'NE';
    }

    this.animState = `walk_${Math.floor(Date.now() / 150) % 4}`;
  }
}

export class CustomerSystem {
  constructor(gameState, recipeManager, canvasRenderer) {
    this.gameState = gameState;
    this.recipeManager = recipeManager;
    this.renderer = canvasRenderer;
    if (canvasRenderer) {
      canvasRenderer.customerSystem = this;
    }
    this.nextId = 1;
    this.spawnTimer = 0;
    this.customerPool = new CustomerPool(20);
    this.pedestrians = [];
    this.pedestrianTimer = 0;
  }

  spawnCustomer() {
    const loc = this.gameState.location;
    const rand = Math.random();
    let cumulative = 0;
    let chosenType = 'student';

    for (const [type, weight] of Object.entries(loc.demographics)) {
      cumulative += weight;
      if (rand <= cumulative) {
        chosenType = type;
        break;
      }
    }

    // Pick desired product from ALL recipes in catalog (both unlocked and locked)
    const allRecipes = Object.values(this.recipeManager.recipes);
    if (allRecipes.length === 0) return;

    // 70% chance to request a product favored by demographic type
    const favoredRecipes = allRecipes.filter(r => r.favoredBy && r.favoredBy.includes(chosenType));
    const candidatePool = (favoredRecipes.length > 0 && Math.random() < 0.7) ? favoredRecipes : allRecipes;
    const recipe = candidatePool[Math.floor(Math.random() * candidatePool.length)];

    // Spawn 3 grids away outside on the sidewalk (-2, 10 or -2, 4)
    const spawnY = Math.random() < 0.5 ? 10 : 4;
    const cust = this.customerPool.acquire(`cust_${this.nextId++}`, chosenType, -2, spawnY, recipe);
    cust.state = 'WALKING_TO_ENTRANCE';
    cust.path = [
      { x: -2, y: spawnY > 7 ? 8 : 6 },
      { x: -2, y: 7 },
      { x: 0, y: 7 }
    ];
    cust.enterPauseTimer = 0.3;
    cust.activeBubble = null;

    this.gameState.customers.push(cust);
  }

  cleanOrphanTableItems() {
    if (!this.gameState || !this.gameState.gridManager) return;
    const activeSeatedIds = new Set(
      this.gameState.customers
        .filter(c => c.state === 'SEATED' || c.state === 'CONSUMING' || c.state === 'PAYING')
        .map(c => c.id)
    );

    this.gameState.gridManager.items.forEach(item => {
      if (item.placedItems && item.placedItems.length > 0) {
        item.placedItems = item.placedItems.filter(pi => activeSeatedIds.has(pi.customerId));
        if (item.placedItems.length > 0) {
          item.placedItem = item.placedItems[item.placedItems.length - 1];
        } else {
          item.placedItem = null;
          item.placedItems = [];
        }
      } else if (item.placedItem) {
        if (!item.placedItem.customerId || !activeSeatedIds.has(item.placedItem.customerId)) {
          item.placedItem = null;
          item.placedItems = [];
        }
      }
    });
  }

  calculateAveragePriceRatio() {
    if (!this.recipeManager || !this.recipeManager.recipes) return 1.0;
    const recipes = Object.values(this.recipeManager.recipes).filter(r => r.unlocked);
    if (recipes.length === 0) return 1.0;

    let totalRatio = 0;
    recipes.forEach(r => {
      const defaultPrice = RECIPES[r.id] ? RECIPES[r.id].sellPrice : r.sellPrice;
      const currentPrice = r.sellPrice !== undefined ? r.sellPrice : defaultPrice;
      const ratio = defaultPrice > 0 ? currentPrice / defaultPrice : 1.0;
      totalRatio += ratio;
    });

    return totalRatio / recipes.length;
  }

  evaluatePriceSensitivity(cust) {
    if (!cust || !cust.preferredRecipe) return false;
    const recipe = cust.preferredRecipe;

    const defaultPrice = RECIPES[recipe.id] ? RECIPES[recipe.id].sellPrice : recipe.sellPrice;
    const currentPrice = recipe.sellPrice !== undefined ? recipe.sellPrice : defaultPrice;

    if (currentPrice <= defaultPrice) return false; // At or below normal price

    const priceRatio = currentPrice / defaultPrice;
    const excess = priceRatio - 1.0;

    const loc = this.gameState.location || {};
    const locSens = loc.priceSensitivity !== undefined ? loc.priceSensitivity : 1.0;

    const demoSensMap = {
      student: 1.35,
      freelancer: 1.1,
      office_worker: 0.9,
      tourist: 0.55,
      influencer: 0.65
    };
    const demoSens = demoSensMap[cust.type] || 1.0;
    const effectiveSensitivity = locSens * demoSens;

    const rejectChance = Math.min(0.95, Math.pow(excess, 1.05) * effectiveSensitivity * 0.75);
    return Math.random() < rejectChance;
  }

  calculateSpawnRate() {
    const loc = this.gameState.location || { peakHours: [8, 12, 13, 17, 18, 19], trafficMultiplier: 1.0 };
    const isPeak = loc.peakHours ? loc.peakHours.includes(this.gameState.hour) : true;
    const baseInterval = isPeak ? 4.0 : 7.0; // base spawn interval in seconds
    const trafficMult = loc.trafficMultiplier || 1.0;

    // 1. Reputation (Stars) Effect: 1.0 to 5.0 Stars
    const rep = Math.max(1.0, Math.min(5.0, this.gameState.reputation || 3.0));
    // 1.0 star = 1.25x slower; 3.0 stars = 1.0x normal; 5.0 stars = 0.45x (55% faster customer arrival!)
    const repFactor = 1.25 - ((rep - 1.0) / 4.0) * 0.80;

    // 2. Staff Count Effect: Boost for having more staff
    const staffCount = this.gameState.employees ? this.gameState.employees.length : 1;
    const staffFactor = 1.0 - Math.min(0.15, (staffCount - 1) * 0.03);

    // 3. Dynamic Price Sensitivity & Location Effect
    const priceRatio = this.calculateAveragePriceRatio();
    const sensitivity = loc.priceSensitivity !== undefined ? loc.priceSensitivity : 1.0;
    const priceFactor = Math.pow(priceRatio, sensitivity);

    // Dynamic spawn rate interval in real seconds per customer (divided by trafficMultiplier so higher traffic = faster arrival!)
    const spawnRate = Math.max(1.0, (baseInterval / trafficMult) * repFactor * staffFactor * priceFactor);
    return spawnRate;
  }

  getFlowBreakdownData() {
    const spawnRate = this.calculateSpawnRate();
    const rawGameMinutes = spawnRate * 3.0;
    const roundedMinutes = Math.max(1, Math.round(rawGameMinutes));
    
    let label = 'Orta';
    if (roundedMinutes < 2) label = 'Aşırı Yoğun';
    else if (roundedMinutes <= 5) label = 'Yoğun';
    else if (roundedMinutes <= 10) label = 'Orta';
    else if (roundedMinutes <= 15) label = 'Düşük';
    else label = 'Çok Düşük';

    const loc = this.gameState.location || { name: 'Üniversite Kampüsü', icon: '🎓', trafficMultiplier: 1.5 };
    const rep = Math.max(1.0, Math.min(5.0, this.gameState.reputation || 3.0));
    const repFactor = 1.25 - ((rep - 1.0) / 4.0) * 0.80;
    const repBonusPct = Math.round((1.0 - repFactor) * 100);

    const staffCount = this.gameState.employees ? this.gameState.employees.length : 1;
    const staffFactor = 1.0 - Math.min(0.15, (staffCount - 1) * 0.03);
    const staffBonusPct = Math.round((1.0 - staffFactor) * 100);

    const priceRatio = this.calculateAveragePriceRatio();
    const isPeak = loc.peakHours ? loc.peakHours.includes(this.gameState.hour) : true;

    return {
      spawnRate,
      rawGameMinutes,
      gameMinutes: roundedMinutes,
      label,
      locName: loc.name,
      locIcon: loc.icon || '🏢',
      trafficMultiplier: loc.trafficMultiplier || 1.0,
      rep,
      repBonusPct,
      staffCount,
      staffBonusPct,
      priceRatio,
      isPeak
    };
  }

  getFormattedFrequency() {
    const data = this.getFlowBreakdownData();
    return `${data.gameMinutes} dk'da 1 (${data.label})`;
  }

  update(dt) {
    // 0. Auto-clean any orphan table items whose customer is no longer seated
    this.cleanOrphanTableItems();

    // 1. Spawning Logic influenced by reputation stars & dynamic seating capacity
    const spawnRate = this.calculateSpawnRate();
    const totalSeats = this.gameState.gridManager ? this.gameState.gridManager.getTotalSeatCount() : 6;
    const maxActiveCustomers = Math.max(12, totalSeats + 6);

    this.spawnTimer += dt * this.gameState.gameSpeed;
    if (this.spawnTimer >= spawnRate && this.gameState.customers.length < maxActiveCustomers) {
      this.spawnTimer = 0;
      this.spawnCustomer();
    }

    // 2. Ambient Street Pedestrians Logic (walking along exterior sidewalks behind walls)
    this.pedestrianTimer += dt * this.gameState.gameSpeed;
    if (this.pedestrianTimer >= 4.5 && this.pedestrians.length < 4) {
      this.pedestrianTimer = 0;
      const types = ['student', 'office_worker', 'tourist', 'freelancer', 'influencer'];
      const pType = types[Math.floor(Math.random() * types.length)];

      const side = Math.random() < 0.5 ? 'NE' : 'NW';
      const isReverse = Math.random() < 0.5;

      let startX, startY, targetX, targetY;
      if (side === 'NE') {
        // Sidewalk path running outside behind NE wall (x = -2)
        startX = -2;
        startY = isReverse ? 15 : -3;
        targetX = -2;
        targetY = isReverse ? -3 : 15;
      } else {
        // Sidewalk path running outside behind NW wall (y = -2)
        startX = isReverse ? 15 : -3;
        startY = -2;
        targetX = isReverse ? -3 : 15;
        targetY = -2;
      }

      this.pedestrians.push(new AmbientPedestrian(`ped_${Date.now()}_${Math.random()}`, pType, startX, startY, targetX, targetY));
    }

    for (let i = this.pedestrians.length - 1; i >= 0; i--) {
      const p = this.pedestrians[i];
      p.update(dt, this.gameState.gameSpeed);
      if (!p.active) {
        this.pedestrians.splice(i, 1);
      }
    }

    // 3. Customer State Machine Loop
    for (let i = this.gameState.customers.length - 1; i >= 0; i--) {
      const cust = this.gameState.customers[i];
      this.updateCustomerState(cust, dt);

      if (cust.state === 'REMOVED') {
        const removed = this.gameState.customers.splice(i, 1)[0];
        this.customerPool.release(removed);
      }
    }
  }

  updateCustomerState(cust, dt) {
    const gridManager = this.gameState.gridManager;
    const speed = 2.5 * dt * this.gameState.gameSpeed;

    // Movement step
    if (cust.path && cust.path.length > 0) {
      const nextNode = cust.path[0];
      const dx = nextNode.x - cust.x;
      const dy = nextNode.y - cust.y;
      const dist = Math.hypot(dx, dy);

      if (dist < speed) {
        cust.x = nextNode.x;
        cust.y = nextNode.y;
        cust.path.shift();
      } else {
        cust.x += (dx / dist) * speed;
        cust.y += (dy / dist) * speed;
        cust.updateDirection(dx, dy);
        cust.animState = `walk_${Math.floor(Date.now() / 150) % 4}`;
      }
      return;
    }

    const recBubble = (cust.preferredRecipe && ['croissant', 'cheesecake', 'waffle', 'cold_brew', 'toast', 'donut', 'coca_cola', 'fanta', 'ice_tea'].includes(cust.preferredRecipe.id))
      ? cust.preferredRecipe.id
      : 'coffee';

    // State actions when stationary
    switch (cust.state) {
      case 'WALKING_TO_ENTRANCE': {
        audioEngine.playDoorChime();
        cust.state = 'ENTERING';
        cust.enterPauseTimer = 0.3;
        break;
      }

      case 'ENTERING': {
        cust.animState = 'idle';
        cust.enterPauseTimer = (cust.enterPauseTimer || 0.5) - dt * this.gameState.gameSpeed;
        cust.activeBubble = null;

        if (cust.enterPauseTimer <= 0) {
          // Find an available seat in the cafe
          const seat = gridManager.getFreeSeatForCustomer(this.gameState.customers);
          if (seat) {
            const targetX = seat.approachX !== undefined ? seat.approachX : seat.x;
            const targetY = seat.approachY !== undefined ? seat.approachY : seat.y;
            const p = gridManager.pathfinder.findPath(Math.floor(cust.x), Math.floor(cust.y), targetX, targetY);
            if (p && p.length > 0) {
              cust.assignedSeat = seat;
              cust.assignedTable = seat.table;
              cust.state = 'WALKING_TO_SEAT';
              cust.activeBubble = null;
              cust.path = p;
            } else {
              // Path to seat is blocked by furniture! Get angry & leave
              cust.activeBubble = 'angry';
              if (this.renderer) this.renderer.addParticle(cust.x, cust.y, 'Yol Tıkalı! 😡', '#f44336');
              if (this.uiManager) this.uiManager.addNotification('Yol Tıkalı! Müşteri Kafeyi Terk Etti 😡', '😡');
              this.gameState.updateReputation(-0.1);
              this.gameState.recordMissedCustomer();
              cust.clearTableItem();
              cust.state = 'LEAVING';
              cust.stuckTimer = 0;
              const entrance = gridManager.entrancePos;
              cust.path = gridManager.pathfinder.findPath(Math.floor(cust.x), Math.floor(cust.y), entrance.x, entrance.y);
            }
          } else {
            // No free seat, wait near entrance for an open table
            cust.state = 'WAITING_SEAT';
            cust.searchSeatTimer = 0;
            cust.activeBubble = null;
          }
        }
        break;
      }

      case 'WAITING_SEAT': {
        cust.animState = 'idle';
        cust.patience -= dt * 2.0 * this.gameState.gameSpeed;
        cust.activeBubble = null;

        // Check for free seat once per second
        cust.searchSeatTimer = (cust.searchSeatTimer || 0) + dt * this.gameState.gameSpeed;
        if (cust.searchSeatTimer >= 1.0) {
          cust.searchSeatTimer = 0;
          const seat = gridManager.getFreeSeatForCustomer(this.gameState.customers);
          if (seat) {
            const targetX = seat.approachX !== undefined ? seat.approachX : seat.x;
            const targetY = seat.approachY !== undefined ? seat.approachY : seat.y;
            const p = gridManager.pathfinder.findPath(Math.floor(cust.x), Math.floor(cust.y), targetX, targetY);
            if (p && p.length > 0) {
              cust.assignedSeat = seat;
              cust.assignedTable = seat.table;
              cust.state = 'WALKING_TO_SEAT';
              cust.activeBubble = null;
              cust.path = p;
            }
          }
        }

        if (cust.patience <= 0) {
          cust.activeBubble = 'angry';
          if (this.uiManager) this.uiManager.addNotification('Sandalye Bulamadı! Müşteri Terk Etti 😡', '😡');
          this.gameState.updateReputation(-0.1);
          this.gameState.recordMissedCustomer();
          cust.clearTableItem();
          cust.state = 'LEAVING';
          cust.stuckTimer = 0;
          const entrance = gridManager.entrancePos;
          cust.path = gridManager.pathfinder.findPath(Math.floor(cust.x), Math.floor(cust.y), entrance.x, entrance.y);
        }
        break;
      }

      case 'WALKING_TO_SEAT': {
        // Customer reached chair approach tile! Step onto chair & sit down facing table
        if (cust.assignedSeat) {
          cust.x = cust.assignedSeat.x;
          cust.y = cust.assignedSeat.y;
        }
        cust.state = 'SEATED';
        cust.seatedTimer = 0;
        cust.orderWaitTimer = 0;
        cust.activeBubble = null;
        cust.animState = 'sit';
        if (cust.assignedSeat && cust.assignedSeat.facingDir) {
          cust.dir = cust.assignedSeat.facingDir;
        }
        break;
      }

      case 'SEATED': {
        // Track time seated in game minutes (3.0 game minutes per real second at 1x speed)
        const gameMinutesElapsed = dt * 3.0 * this.gameState.gameSpeed;
        cust.seatedTimer = (cust.seatedTimer || 0) + gameMinutesElapsed;

        if (cust.assignedSeat && cust.assignedSeat.facingDir) {
          cust.dir = cust.assignedSeat.facingDir;
        }

        if (cust.seatedTimer < 5.0) {
          // Sit quietly for 5 game minutes with NO emoji bubble
          cust.animState = 'sit';
          cust.activeBubble = null;
        } else {
          // 5 game minutes passed! Reveal preferred recipe emoji or check unlock status
          const recipeDef = cust.preferredRecipe ? this.recipeManager.recipes[cust.preferredRecipe.id] : null;
          const isUnlocked = recipeDef ? recipeDef.unlocked : true;

          if (!isUnlocked) {
            // Customer realizes item is locked in menu, gets sad & leaves
            if (cust.activeBubble !== 'sad') {
              cust.activeBubble = 'sad';
              if (this.renderer) {
                this.renderer.addParticle(cust.x, cust.y, `Menüde Yok! (${recipeDef ? recipeDef.name : 'Ürün'}) 😢`, '#f44336');
              }
              if (this.uiManager) {
                this.uiManager.addNotification(`İstenen Ürün Menüde Yok! (${recipeDef ? recipeDef.name : 'Ürün'}) 😢`, '😢');
              }
              this.gameState.updateReputation(-0.05);
              this.gameState.recordMissedCustomer();
              cust.clearTableItem();
              cust.state = 'LEAVING';
              cust.stuckTimer = 0;
              const entrance = gridManager.entrancePos;
              cust.path = gridManager.pathfinder.findPath(Math.floor(cust.x), Math.floor(cust.y), entrance.x, entrance.y);
            }
          } else {
            // First time deciding order after 5 game minutes: check price sensitivity
            if (cust.priceChecked === undefined) {
              cust.priceChecked = true;
              if (this.evaluatePriceSensitivity(cust)) {
                cust.priceTooHigh = true;
                cust.priceRejectTimer = 0;
              }
            }

            if (cust.priceTooHigh) {
              // Customer displays desired product emoji FIRST, then after 4 game minutes (~1.3s), shows sad bubble & leaves!
              cust.priceRejectTimer = (cust.priceRejectTimer || 0) + gameMinutesElapsed;

              if (cust.priceRejectTimer < 4.0) {
                cust.animState = 'sit';
                cust.activeBubble = recBubble; // Show desired product emoji bubble FIRST!
              } else {
                cust.activeBubble = 'sad'; // Sad face bubble (😔/😢)
                const prodName = cust.preferredRecipe ? cust.preferredRecipe.name : 'Ürün';
                if (this.renderer) {
                  this.renderer.addParticle(cust.x, cust.y, `${prodName} Fiyatı Çok Yüksek! 💸`, '#ff9800');
                }
                if (this.uiManager) {
                  const label = cust.type === 'student' ? 'Öğrenci' : (cust.type === 'office_worker' ? 'Ofis Çalışanı' : 'Müşteri');
                  this.uiManager.addNotification(`${prodName} Fiyatı Çok Yüksek! ${label} Sipariş Vermeden Çıktı 💸`, '💸');
                }
                // Leaves table cleanly with NO star/reputation penalty or instagram review!
                this.gameState.recordMissedCustomer();
                cust.clearTableItem();
                cust.state = 'LEAVING';
                cust.stuckTimer = 0;
                const entrance = gridManager.entrancePos;
                cust.path = gridManager.pathfinder.findPath(Math.floor(cust.x), Math.floor(cust.y), entrance.x, entrance.y);
              }
            } else if (cust.orderServed) {
              cust.state = 'CONSUMING';
              cust.consumeTimer = 0;
              cust.stayDurationGameMinutes = 15 + Math.random() * 75;
              cust.activeBubble = null;
            } else {
              cust.animState = 'hand_up';
              
              // Track order wait duration in game minutes (3.0 game minutes per real second at 1x speed)
              cust.orderWaitTimer = (cust.orderWaitTimer || 0) + gameMinutesElapsed;
              const maxWaitGameMinutes = 30.0; // 30 game minutes = 10 real seconds of order waiting

              if (cust.orderWaitTimer < 20.0) {
                cust.activeBubble = recBubble;
              } else {
                cust.activeBubble = 'wait'; // ⏳ Hourglass urgency bubble
              }

              if (cust.orderWaitTimer >= maxWaitGameMinutes) {
                cust.activeBubble = 'angry';
                if (this.renderer) {
                  this.renderer.addParticle(cust.x, cust.y, 'Sipariş 30 dk Gecikti! 😡', '#f44336');
                }
                if (this.uiManager) {
                  this.uiManager.addNotification('Sipariş 30 dk Gecikti! Müşteri Terk Etti 😡', '😡');
                }
                this.gameState.updateReputation(-0.1);
                this.gameState.recordMissedCustomer();
                cust.clearTableItem();
                cust.state = 'LEAVING';
                cust.stuckTimer = 0;
                const entrance = gridManager.entrancePos;
                cust.path = gridManager.pathfinder.findPath(Math.floor(cust.x), Math.floor(cust.y), entrance.x, entrance.y);
              }
            }
          }
        }
        break;
      }

      case 'CONSUMING': {
        // Advance timer in game minutes (3.0 game minutes per real second at 1x speed)
        const gameMinutesElapsed = dt * 3.0 * this.gameState.gameSpeed;
        cust.consumeTimer += gameMinutesElapsed;

        if (cust.type === 'freelancer') cust.animState = 'work';
        else cust.animState = 'drink';

        const maxStay = cust.stayDurationGameMinutes || 30;
        if (cust.consumeTimer >= maxStay) {
          // Finished drink & stay! Pay and leave tip
          cust.state = 'PAYING';
        }
        break;
      }

      case 'PAYING': {
        if (cust.payPauseTimer === undefined) {
          const rec = cust.orderedRecipe;
          if (rec) {
            const tip = cust.patience > 70 ? Math.floor(rec.sellPrice * 0.15) : 0;
            const totalPay = rec.sellPrice + tip;

            // Base reputation gain + bonuses
            let repGain = 0.05;

            // 1. Güler Yüzlü (Charmer) Staff Bonus: +0.03 ⭐ per served customer
            const hasCharmerStaff = this.gameState.employees && this.gameState.employees.some(e => e.trait && (e.trait.name === 'Güler Yüzlü' || e.traitKey === 'CHARMER'));
            if (hasCharmerStaff) {
              repGain += 0.03;
            }

            // 2. Decoration & Atmosphere Bonus: +0.02 ⭐ if decor items are placed in cafe
            const decorCount = this.gameState.gridManager ? this.gameState.gridManager.items.filter(it => {
              return ['PLANT_MONSTERA', 'PLANT_FICUS', 'LAMP_VINTAGE', 'BOOKSHELF', 'WIFI_STATION'].includes(it.id);
            }).length : 0;

            if (decorCount > 0) {
              repGain += 0.02;
            }

            // 3. High-Tier Equipment, Wi-Fi, Seating Quality & Ingredient Quality Dual-Sided Viral Instagram System!
            let isViralShare = false;
            let isHatePost = false;

            const gridItems = this.gameState.gridManager ? this.gameState.gridManager.items : [];
            const equipTier = getHighestEquipmentTier(this.gameState.gridManager);
            const hasWifi = gridItems.some(it => it.id === 'WIFI_STATION');
            const qual = cust.usedQuality || this.gameState.economy.ingredientQuality || 'NORMAL';
            const isBakery = rec.category === 'bakery';

            // Demographic Sensitivity Multiplier (Hassasiyet) for Seating & Quality
            let seatingSensitivity = 1.0;
            if (cust.type === 'student') seatingSensitivity = 0.15;        // Öğrenciler kayıtsız / bütçe odaklı
            else if (cust.type === 'office_worker') seatingSensitivity = 1.6; // Beyaz yaka konfor & şıklık duyarlı
            else if (cust.type === 'tourist') seatingSensitivity = 1.8;       // Turistler lüks & fotojenik mekan duyarlı
            else if (cust.type === 'influencer') seatingSensitivity = 2.0;    // Influencer viral Instagram duyarlı
            else if (cust.type === 'freelancer') seatingSensitivity = 1.4;    // Freelancer rahatlık duyarlı

            // Evaluate Seating Quality from assignedSeat
            let isLuxurySeating = false;
            let isBasicSeating = false;
            if (cust.assignedSeat) {
              const chairId = cust.assignedSeat.chairItem ? cust.assignedSeat.chairItem.id : null;
              const tableId = cust.assignedSeat.table ? cust.assignedSeat.table.id : null;

              if (chairId === 'CHAIR_SOFA' || chairId === 'CHAIR_COMFORT' || tableId === 'TABLE_PREMIUM') {
                isLuxurySeating = true;
              }
              if (chairId === 'CHAIR_BASIC' || tableId === 'TABLE_BASIC') {
                isBasicSeating = true;
              }
            }

            // Calculate cumulative positive viral chance vs negative hate post chance (Capped at 30% max)
            let positiveChance = 0;
            let negativeChance = 0;

            // 1. Malzeme Kalitesi Faktörü (+10% Premium / +10% Cheap Hate)
            if (qual === 'PREMIUM') {
              positiveChance += 0.10;
            } else if (qual === 'CHEAP') {
              negativeChance += 0.10;
            }

            // 2. Eşya & Koltuk Kalitesi Faktörü (Demografik duyarlılık ile ölçekli ~8% - 15%)
            if (isLuxurySeating) {
              positiveChance += 0.08 * seatingSensitivity;
            } else if (isBasicSeating) {
              negativeChance += 0.08 * seatingSensitivity;
            }

            // 3. Ekipman Kalitesi Faktörü (+5% - +10%)
            if (equipTier === 3) {
              positiveChance += 0.10;
            } else if (equipTier === 2) {
              positiveChance += 0.05;
            } else if (equipTier === 1 && qual === 'CHEAP') {
              negativeChance += 0.05;
            }

            // 4. Wi-Fi Ortam Faktörü (+5%)
            if (hasWifi) {
              positiveChance += 0.05;
            }

            // 5. Demografik Müşteri Tipi Faktörü (Influencer foto çekmeye ekstra yatkın)
            if (cust.type === 'influencer') {
              positiveChance += 0.08;
            }

            // Nihai olumlu ve olumsuz ihtimaller 30%'un üstüne çıkamaz (Cap at 0.30 max)
            positiveChance = Math.min(0.30, positiveChance);
            negativeChance = Math.min(0.30, negativeChance);

            const rand = Math.random();

            if (rand < negativeChance && (qual === 'CHEAP' || isBasicSeating)) {
              // HATE / SMEAR INSTAGRAM POST (🤢 / 😡)
              isHatePost = true;
              const penalty = 0.12;
              repGain -= penalty;

              let hateReason = 'Kalitesiz Malzeme';
              if (isBasicSeating && (cust.type === 'office_worker' || cust.type === 'tourist' || cust.type === 'influencer')) {
                hateReason = 'Sert & Dandik Sandalye';
              } else if (qual === 'CHEAP') {
                hateReason = 'Düşük Kalite Malzeme';
              }

              audioEngine.playClick();

              if (this.renderer) {
                const particleText = isBasicSeating ? 'Rahatsız Sandalye! 🤢' : 'Kalitesiz Malzeme! 🤢';
                this.renderer.addParticle(cust.x, cust.y, particleText, '#f44336', null, 50);
                setTimeout(() => {
                  if (this.renderer) {
                    this.renderer.addParticle(cust.x, cust.y, 'Instagram\'da Karaladı! 📸', '#d32f2f', null, 50);
                  }
                }, 400);
              }

              if (this.uiManager) {
                this.uiManager.addNotification(`📸 KARALAMA! ${cust.type === 'office_worker' ? 'Beyaz Yaka' : cust.type === 'tourist' ? 'Turist' : 'Müşteri'} ${hateReason} Sebebiyle Kafeni Instagram'da Karaladı! (-${penalty} ⭐)`, '🤮');
              }

            } else if (rand < positiveChance) {
              // PRAISE INSTAGRAM POST (🤩 / 📸)
              isViralShare = true;
              let repBonus = 0.08;
              let shareReason = 'Lüks Kahve & Ambiyans';

              if (isLuxurySeating && (cust.type === 'office_worker' || cust.type === 'tourist' || cust.type === 'influencer')) {
                repBonus = 0.12;
                shareReason = 'Lüks Masa & Deri Koltuk Konforu';
              } else if (equipTier === 3) {
                repBonus = 0.15;
                shareReason = 'Gurme Kahve Makinesi';
              } else if (qual === 'PREMIUM') {
                repBonus = 0.10;
                shareReason = isBakery ? 'Lüks Pastane Hamuru' : 'Lüks Organik Kahve';
              } else if (hasWifi) {
                repBonus = 0.06;
                shareReason = 'Yüksek Hızlı Wi-Fi';
              }

              repGain += repBonus;
              audioEngine.playLevelUp(); // Celebratory chime!

              if (this.renderer) {
                const particleText = isLuxurySeating ? 'Lüks Koltuk Konforu! 🤩' : (isBakery ? 'Taze Lezzet! 🤩' : 'Mükemmel Kahve! 🤩');
                this.renderer.addParticle(cust.x, cust.y, particleText, '#ffd54f', null, 50);
                setTimeout(() => {
                  if (this.renderer) {
                    this.renderer.addParticle(cust.x, cust.y, 'Instagram\'da Paylaştı! 📸', '#e91e63', null, 50);
                  }
                }, 400);
              }

              if (this.uiManager) {
                this.uiManager.addNotification(`📸 COŞKULU PAYLAŞIM! ${cust.type === 'office_worker' ? 'Beyaz Yaka' : cust.type === 'tourist' ? 'Turist' : 'Müşteri'} ${shareReason} İçin Kafeni Instagram'da Paylaştı! (+${repBonus} ⭐)`, '📸', 'praise');
              }
            }

            this.gameState.economy.addMoney(totalPay, `Satış: ${rec.name}`);
            this.gameState.addXP(15);
            this.gameState.updateReputation(repGain);
            this.gameState.totalCustomersServed = (this.gameState.totalCustomersServed || 0) + 1;
            this.gameState.dailyServedCustomers = (this.gameState.dailyServedCustomers || 0) + 1;

            // Play cash register chime sound if not viral share
            if (!isViralShare) {
              audioEngine.playChaChing();
            }

            if (this.renderer) {
              // Floating money badge with 36 frames maxLife (exactly 0.6 seconds duration!)
              this.renderer.addParticle(cust.x, cust.y, `+${totalPay} TL 💰`, '#ffd54f', null, 36);
            }

            cust.activeBubble = isViralShare ? 'ecstatic' : 'money';
            cust.payPauseTimer = isViralShare ? 1.0 : 0.6;
          }
        }

        cust.payPauseTimer -= dt * this.gameState.gameSpeed;

        if (cust.payPauseTimer <= 0) {
          // Clear customer's served item from table surface when getting up to leave
          cust.clearTableItem();

          cust.activeBubble = null; // Clear money bubble after 0.6 seconds
          cust.state = 'LEAVING';
          cust.stuckTimer = 0;
          const entrance = gridManager.entrancePos;
          cust.path = gridManager.pathfinder.findPath(Math.floor(cust.x), Math.floor(cust.y), entrance.x, entrance.y);
        }
        break;
      }

      case 'LEAVING': {
        const gameMinutesElapsed = dt * 3.0 * this.gameState.gameSpeed;
        cust.stuckTimer = (cust.stuckTimer || 0) + gameMinutesElapsed;

        // When customer reaches door frame (0, 7), walk outside onto the outdoor sidewalk
        if (Math.floor(cust.x) <= 0 && Math.floor(cust.y) === 7) {
          cust.state = 'WALKING_OUTSIDE_LEAVING';
          const exitY = Math.random() < 0.5 ? 10 : 4;
          cust.path = [{ x: -2, y: 7 }, { x: -2, y: exitY }];
          cust.stuckTimer = 0;
        } else if (cust.stuckTimer >= 15.0) {
          cust.state = 'REMOVED';
        }
        break;
      }

      case 'WALKING_OUTSIDE_LEAVING': {
        cust.state = 'REMOVED';
        break;
      }
    }
  }
}
