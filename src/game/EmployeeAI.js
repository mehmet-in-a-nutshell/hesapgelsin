/**
 * EmployeeAI.js
 * Roster management & autonomous AI system for baristas and waiters.
 * Handles taking counter orders, checking stock ingredients, brewing coffee at espresso machine,
 * carrying tray to customer table, and stamina management.
 */

import { audioEngine } from '../audio/AudioEngine.js';

export const EMPLOYEE_TRAITS = {
  FAST_WORKER: { name: 'Hızlı Çalışan', speedBonus: 1.3, desc: 'Demleme ve taşıma hızı %30 daha yüksek.' },
  PERFECTIONIST: { name: 'Mükemmeliyetçi', qualityBonus: 1.25, desc: 'Kahve kalitesi artar, müşteri bahşişi yükselir.' },
  CHARMER: { name: 'Güler Yüzlü', serviceBonus: 1.2, desc: 'Müşteri sabrı ve memnuniyetini artırır.' },
  HARD_WORKER: { name: 'Dayanıklı Personel', staminaBonus: 1.5, desc: 'Yorulma hızı %50 azalır.' }
};

export class Employee {
  constructor(id, name, traitKey = 'FAST_WORKER', salary = 800) {
    this.id = id;
    this.name = name;
    this.trait = EMPLOYEE_TRAITS[traitKey] || EMPLOYEE_TRAITS.FAST_WORKER;
    this.salary = salary; // daily wage

    this.x = 4;
    this.y = 3;
    this.dir = 'SE';
    this.path = [];
    this.animState = 'idle';

    this.stamina = 100;
    this.state = 'IDLE'; // IDLE, TAKING_ORDER, BREWING, CARRYING, RESTING
    this.currentCustomer = null;
    this.currentRecipe = null;
    this.brewTimer = 0;
  }

  updateDirection(dx, dy) {
    if (dx > 0) this.dir = 'SE';
    else if (dx < 0) this.dir = 'NW';
    else if (dy > 0) this.dir = 'SW';
    else if (dy < 0) this.dir = 'NE';
  }
}

export class EmployeeSystem {
  constructor(gameState) {
    this.gameState = gameState;
    if (!this.gameState.employees || this.gameState.employees.length === 0) {
      this.initDefaultStaff();
    }
  }

  getRandomWaitingTile() {
    const gridManager = this.gameState.gridManager;
    const employees = this.gameState.employees || [];
    const customers = this.gameState.customers || [];

    // Collect all walkable tiles inside 15x15 grid (excluding door entrance 0,7)
    const walkable = [];
    for (let y = 0; y < gridManager.rows; y++) {
      for (let x = 0; x < gridManager.cols; x++) {
        if (x === 0 && y === 7) continue; // Don't block doorway entrance
        if (gridManager.pathfinder.isWalkable(x, y)) {
          walkable.push({ x, y });
        }
      }
    }

    if (walkable.length === 0) {
      return gridManager.getCounterPosition();
    }

    // Set of tiles occupied by customers
    const custTiles = new Set();
    customers.forEach(c => {
      custTiles.add(`${Math.floor(c.x)},${Math.floor(c.y)}`);
    });

    // Set of tiles occupied by employees
    const empTiles = new Set();
    employees.forEach(e => {
      empTiles.add(`${Math.floor(e.x)},${Math.floor(e.y)}`);
      if (e.targetWaitTile) {
        empTiles.add(`${e.targetWaitTile.x},${e.targetWaitTile.y}`);
      }
    });

    // Pool A: Walkable tiles with NO customer and NO employee (completely empty grid)
    const completelyEmptyTiles = walkable.filter(t => {
      const key = `${t.x},${t.y}`;
      return !custTiles.has(key) && !empTiles.has(key);
    });

    if (completelyEmptyTiles.length > 0) {
      const randomIdx = Math.floor(Math.random() * completelyEmptyTiles.length);
      return completelyEmptyTiles[randomIdx];
    }

    // Pool B: Walkable tiles with NO customer, but another employee IS present
    const empSharedTiles = walkable.filter(t => {
      const key = `${t.x},${t.y}`;
      return !custTiles.has(key) && empTiles.has(key);
    });

    if (empSharedTiles.length > 0) {
      const randomIdx = Math.floor(Math.random() * empSharedTiles.length);
      return empSharedTiles[randomIdx];
    }

    // Fallback: any walkable tile
    const randomIdx = Math.floor(Math.random() * walkable.length);
    return walkable[randomIdx];
  }

  initDefaultStaff() {
    // 1 Starting Barista spawns at entrance door and walks to random waiting tile!
    const door = this.gameState.gridManager.entrancePos; // { x: 0, y: 7 }
    const starterBarista = new Employee('emp_1', 'Ahmet Usta', 'FAST_WORKER', 80);
    starterBarista.x = door.x;
    starterBarista.y = door.y;
    starterBarista.state = 'ENTERING';

    const targetTile = this.getRandomWaitingTile();
    starterBarista.targetWaitTile = targetTile;
    starterBarista.path = this.gameState.gridManager.pathfinder.findPath(door.x, door.y, targetTile.x, targetTile.y);

    this.gameState.employees = [starterBarista];
  }

  hireEmployee(name, traitKey, salary) {
    if (!this.gameState.economy.canAfford(salary)) return false;

    const emp = new Employee(`emp_${Date.now()}`, name, traitKey, salary);
    const door = this.gameState.gridManager.entrancePos; // { x: 0, y: 7 }
    emp.x = door.x;
    emp.y = door.y;
    emp.state = 'ENTERING';

    const targetTile = this.getRandomWaitingTile();
    emp.targetWaitTile = targetTile;
    emp.path = this.gameState.gridManager.pathfinder.findPath(door.x, door.y, targetTile.x, targetTile.y);

    this.gameState.employees.push(emp);
    return emp;
  }

  fireEmployee(empId) {
    const idx = this.gameState.employees.findIndex(e => e.id === empId);
    if (idx === -1) return { success: false, reason: 'not_found' };

    const emp = this.gameState.employees[idx];
    const severanceFee = Math.floor((emp.salary || 800) * 3); // 3x daily wage compensation

    if (!this.gameState.economy.canAfford(severanceFee)) {
      return { success: false, reason: 'insufficient_funds', severanceFee };
    }

    // Spend severance money
    this.gameState.economy.spendMoney(severanceFee, `İşten Çıkarma Tazminatı: ${emp.name}`);

    // Set employee state to LEAVING with angry bubble
    if (emp.currentCustomer) {
      emp.currentCustomer.assignedBarista = null;
      emp.currentCustomer = null;
    }
    emp.activeBubble = 'angry';
    emp.state = 'LEAVING';
    emp.stuckTimer = 0;
    emp.currentCustomer = null;
    emp.currentRecipe = null;

    const door = this.gameState.gridManager.entrancePos; // { x: 0, y: 7 }
    const exitPath = this.gameState.gridManager.pathfinder.findPath(
      Math.floor(emp.x),
      Math.floor(emp.y),
      door.x,
      door.y
    );
    if (exitPath && exitPath.length > 0) {
      emp.path = exitPath;
    } else {
      // Immediate removal if exit path blocked
      emp.state = 'REMOVED';
      this.gameState.employees.splice(idx, 1);
    }

    this.gameState.saveToLocalStorage();
    return { success: true, emp, severanceFee };
  }

  update(dt) {
    // Sanitize assignedBarista pointers on customers so no customer remains stuck with a missing/idle barista
    const activeEmployees = new Set(this.gameState.employees);
    if (this.gameState.customers) {
      for (const c of this.gameState.customers) {
        if (c.assignedBarista) {
          if (!activeEmployees.has(c.assignedBarista) || 
              c.assignedBarista.currentCustomer !== c || 
              c.assignedBarista.state === 'LEAVING' || 
              c.assignedBarista.state === 'REMOVED') {
            c.assignedBarista = null;
          }
        }
      }
    }

    for (let i = this.gameState.employees.length - 1; i >= 0; i--) {
      const emp = this.gameState.employees[i];
      this.updateEmployeeAI(emp, dt);

      if (emp.state === 'REMOVED') {
        this.gameState.employees.splice(i, 1);
      }
    }
  }

  updateEmployeeAI(emp, dt) {
    const gridManager = this.gameState.gridManager;
    const economy = this.gameState.economy;
    const speedMult = (emp.trait.speedBonus || 1.0) * this.gameState.gameSpeed;
    const moveSpeed = 4.5 * dt * speedMult;

    // If employee has a cross emoji timer (❌), count down to clear bubble
    if (emp.crossTimer > 0) {
      emp.crossTimer -= dt * (this.gameState.gameSpeed || 1.0);
      if (emp.crossTimer <= 0 && emp.activeBubble === 'cross') {
        emp.activeBubble = null;
      }
    }

    // If employee is brewing, advance brew timer even while moving to waiting tile
    if (emp.state === 'BREWING') {
      emp.brewTimer += dt * speedMult;
      if (emp.brewTimer >= 1.5 && emp.activeBubble === 'check') {
        emp.activeBubble = null;
      }
    }

    // Movement execution
    if (emp.path && emp.path.length > 0) {
      const nextNode = emp.path[0];
      const dx = nextNode.x - emp.x;
      const dy = nextNode.y - emp.y;
      const dist = Math.hypot(dx, dy);

      if (dist < moveSpeed) {
        emp.x = nextNode.x;
        emp.y = nextNode.y;
        emp.path.shift();
      } else {
        emp.x += (dx / dist) * moveSpeed;
        emp.y += (dy / dist) * moveSpeed;
        emp.updateDirection(dx, dy);
        emp.animState = emp.state === 'CARRYING' ? 'carry' : `walk_${Math.floor(Date.now() / 150) % 4}`;
      }
      
      // Allow IDLE employees (e.g. walking back to a wait tile) to check for waiting customers every frame!
      if (emp.state !== 'IDLE') {
        return;
      }
    }

    // State behavior when stationary
    switch (emp.state) {
      case 'ENTERING': {
        // Barista walked in from door to work area
        emp.state = 'IDLE';
        emp.animState = 'idle';
        break;
      }

      case 'IDLE': {
        emp.animState = 'idle';

        // Filter all customers needing an order sorted by longest wait time first
        const waitingCustomers = (this.gameState.customers || []).filter(c =>
          !c.orderServed &&
          !c.assignedBarista &&
          !c.priceTooHigh &&
          c.state === 'SEATED' &&
          (c.seatedTimer || 0) >= 5.0 &&
          c.activeBubble &&
          c.activeBubble !== 'sad' &&
          c.activeBubble !== 'angry'
        );

        // Sort by longest wait time (orderWaitTimer or seatedTimer descending)
        waitingCustomers.sort((a, b) => (b.orderWaitTimer || b.seatedTimer || 0) - (a.orderWaitTimer || a.seatedTimer || 0));

        for (const waitingCust of waitingCustomers) {
          const rawTarget = waitingCust.assignedTable || waitingCust.assignedSeat || { x: waitingCust.x, y: waitingCust.y };
          const targetPos = gridManager.getNearestWalkableTile(rawTarget.x, rawTarget.y);
          const p = gridManager.pathfinder.findPath(Math.floor(emp.x), Math.floor(emp.y), targetPos.x, targetPos.y);

          if (p && p.length > 0) {
            waitingCust.assignedBarista = emp;
            emp.currentCustomer = waitingCust;
            emp.currentRecipe = waitingCust.preferredRecipe;
            emp.state = 'TAKING_ORDER';
            emp.path = p;
            break; // Found reachable customer!
          }
        }
        break;
      }

      case 'TAKING_ORDER': {
        emp.animState = 'idle';
        const cust = emp.currentCustomer;
        const rec = emp.currentRecipe;

        if (!cust || !this.gameState.customers.includes(cust) || cust.state === 'REMOVED' || cust.state === 'LEAVING') {
          // Customer left before waiter arrived
          emp.state = 'IDLE';
          emp.currentCustomer = null;
          emp.currentRecipe = null;
          emp.activeBubble = null;
          break;
        }

        if (rec) {
          const isCoffee = rec.category === 'coffee';
          const hasWorkingMachine = gridManager.hasWorkingEspressoMachine();

          if (isCoffee && !hasWorkingMachine) {
            // Espresso Machine is broken/missing! Waiter shows ❌, customer leaves!
            emp.activeBubble = 'cross';
            emp.crossTimer = 1.5;

            if (this.gameState.renderer) {
              this.gameState.renderer.addParticle(emp.x, emp.y, 'Makine Bozuk! ⚙️', '#f44336');
            }

            if (cust) {
              cust.activeBubble = 'angry';
              if (this.gameState.renderer) {
                this.gameState.renderer.addParticle(cust.x, cust.y, 'Makine Bozuk! 😡', '#f44336');
              }
              this.gameState.updateReputation(-0.1);
              this.gameState.dailyMissedCustomers = (this.gameState.dailyMissedCustomers || 0) + 1;
              cust.clearTableItem();
              cust.state = 'LEAVING';
              cust.stuckTimer = 0;
              const entrance = gridManager.entrancePos;
              cust.path = gridManager.pathfinder.findPath(Math.floor(cust.x), Math.floor(cust.y), entrance.x, entrance.y);
            }

            if (this.uiManager) {
              this.uiManager.addNotification(`Espresso Makinesi Bozuk! ${rec.name} Servis Edilemiyor ⚙️`, '⚙️');
            }

            emp.state = 'IDLE';
            emp.currentCustomer = null;
            emp.currentRecipe = null;
          } else if (economy.hasIngredients(rec.ingredients)) {
            // Deduct ingredients & show checkmark bubble!
            const useResult = economy.useIngredients(rec.ingredients);
            cust.orderedRecipe = rec;
            cust.usedQuality = useResult ? useResult.quality : 'NORMAL';

            emp.activeBubble = 'check'; // Checkmark bubble ✅
            if (this.gameState.renderer) {
              this.gameState.renderer.addParticle(emp.x, emp.y, 'Sipariş Alındı! ✅', '#4caf50');
            }

            emp.state = 'BREWING';
            emp.brewTimer = 0;

            // Waiter walks to a random walkable grid tile to wait while coffee brews!
            const randomWaitTile = this.getRandomWaitingTile();
            emp.targetWaitTile = randomWaitTile;
            const p = gridManager.pathfinder.findPath(Math.floor(emp.x), Math.floor(emp.y), randomWaitTile.x, randomWaitTile.y);
            if (p && p.length > 0) {
              emp.path = p;
            }
          } else {
            // Out of stock! Waiter shows ❌, customer gets angry 😡 & leaves cafe!
            emp.activeBubble = 'cross'; // ❌ Cross emoji above waiter
            emp.crossTimer = 1.5;

            if (this.gameState.renderer) {
              this.gameState.renderer.addParticle(emp.x, emp.y, 'Stok Yok! ❌', '#f44336');
            }

            if (cust) {
              cust.activeBubble = 'angry';
              if (this.gameState.renderer) {
                this.gameState.renderer.addParticle(cust.x, cust.y, 'Stok Yok! 😡', '#f44336');
              }
              this.gameState.updateReputation(-0.1);
              this.gameState.dailyMissedCustomers = (this.gameState.dailyMissedCustomers || 0) + 1;
              cust.clearTableItem();
              cust.state = 'LEAVING';
              cust.stuckTimer = 0;
              const entrance = gridManager.entrancePos;
              cust.path = gridManager.pathfinder.findPath(Math.floor(cust.x), Math.floor(cust.y), entrance.x, entrance.y);
            }

            if (this.uiManager) {
              this.uiManager.addNotification(`${rec ? rec.name : 'Ürün'} Stoğu Yok! Müşteri Terk Etti ❌`, '❌');
            }

            emp.state = 'IDLE';
            emp.currentCustomer = null;
            emp.currentRecipe = null;
          }
        }
        break;
      }

      case 'BREWING': {
        emp.animState = 'idle';
        emp.brewTimer += dt * speedMult;

        // Clear checkmark bubble after 1.5s of preparation
        if (emp.brewTimer >= 1.5 && emp.activeBubble === 'check') {
          emp.activeBubble = null;
        }

        const requiredPrep = emp.currentRecipe ? emp.currentRecipe.prepTime : 3.0;

        if (emp.brewTimer >= requiredPrep) {
          emp.brewTimer = 0;
          emp.activeBubble = null;

          const cust = emp.currentCustomer;
          if (cust && this.gameState.customers.includes(cust) && cust.state !== 'REMOVED' && cust.state !== 'LEAVING') {
            emp.state = 'CARRYING';
            const rawTarget = cust.assignedTable || cust.assignedSeat || { x: cust.x, y: cust.y };
            const targetPos = gridManager.getNearestWalkableTile(rawTarget.x, rawTarget.y);
            const p = gridManager.pathfinder.findPath(Math.floor(emp.x), Math.floor(emp.y), targetPos.x, targetPos.y);
            if (p && p.length > 0) {
              emp.path = p;
            } else {
              // Path to customer seat blocked! Get angry & quit
              if (emp.currentCustomer) emp.currentCustomer.assignedBarista = null;
              emp.currentCustomer = null;
              emp.activeBubble = 'angry';
              if (this.gameState.renderer) this.gameState.renderer.addParticle(emp.x, emp.y, 'Yol Tıkalı! 😡', '#f44336');
              if (this.uiManager) this.uiManager.addNotification(`Yol Tıkalı! ${emp.name} Kafeyi Terk Etti 😡`, '😡');
              emp.state = 'LEAVING';
              emp.stuckTimer = 0;
              const door = gridManager.entrancePos;
              emp.path = gridManager.pathfinder.findPath(Math.floor(emp.x), Math.floor(emp.y), door.x, door.y);
            }
          } else {
            // Customer left while brewing
            emp.state = 'IDLE';
            emp.currentCustomer = null;
            emp.currentRecipe = null;
          }
        }
        break;
      }

      case 'CARRYING': {
        emp.animState = 'carry';
        const cust = emp.currentCustomer;

        if (cust && this.gameState.customers.includes(cust) && (cust.state === 'SEATED' || cust.state === 'WALKING_TO_SEAT')) {
          cust.orderServed = true;
          audioEngine.playOrderServed();

          // Place coffee / pastry on top of customer's table surface!
          if (cust.assignedTable) {
            if (!cust.assignedTable.placedItems) {
              cust.assignedTable.placedItems = [];
            }
            const isBakery = emp.currentRecipe && emp.currentRecipe.category === 'bakery';
            const newItem = {
              customerId: cust.id,
              type: isBakery ? 'pastry' : 'cup',
              recipeId: emp.currentRecipe ? emp.currentRecipe.id : 'espresso',
              name: emp.currentRecipe ? emp.currentRecipe.name : 'Coffee',
              seatDir: cust.assignedSeat ? cust.assignedSeat.facingDir : 'SE'
            };

            const existingIdx = cust.assignedTable.placedItems.findIndex(pi => pi.customerId === cust.id);
            if (existingIdx !== -1) {
              cust.assignedTable.placedItems[existingIdx] = newItem;
            } else {
              cust.assignedTable.placedItems.push(newItem);
            }

            cust.assignedTable.placedItem = newItem;
          }

          if (this.gameState.renderer) {
            this.gameState.renderer.addParticle(cust.x, cust.y, `☕ ${emp.currentRecipe ? emp.currentRecipe.name : 'Servis'}`, '#4caf50');
          }
        }

        // Return to waiting tile after serving
        const waitPos = emp.targetWaitTile || this.getRandomWaitingTile();
        const returnPath = gridManager.pathfinder.findPath(Math.floor(emp.x), Math.floor(emp.y), waitPos.x, waitPos.y);
        if (returnPath && returnPath.length > 0) {
          emp.path = returnPath;
        }

        emp.state = 'IDLE';
        emp.currentCustomer = null;
        emp.currentRecipe = null;
        break;
      }

      case 'LEAVING': {
        // Track game minutes spent trying to exit
        const gameMinutesElapsed = dt * 3.0 * this.gameState.gameSpeed;
        emp.stuckTimer = (emp.stuckTimer || 0) + gameMinutesElapsed;

        // If trapped/blocked for 10 game minutes, remove employee entity cleanly for performance
        if (emp.stuckTimer >= 10.0 || Math.floor(emp.x) === 0 && Math.floor(emp.y) === 7) {
          emp.state = 'REMOVED';
        }
        break;
      }
    }
  }
}
