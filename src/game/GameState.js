/**
 * GameState.js
 * Central State Machine for Cafe Tycoon game.
 * Manages simulation clock, speed controls, level progression, XP, reputation stars,
 * active location, customer list, employee list, and localStorage auto-save.
 */

import { Economy } from './Economy.js';
import { GridManager } from './GridManager.js';
import { LOCATIONS } from './LocationManager.js';
import { EMPLOYEE_TRAITS, Employee } from './EmployeeAI.js';

export class GameState {
  constructor() {
    this.location = LOCATIONS.university;
    this.economy = new Economy(20000);
    this.gridManager = new GridManager(15, 15);

    // Simulation Clock
    this.day = 1;
    this.hour = 8;
    this.minute = 0;
    this.gameSpeed = 1; // 0=Paused, 1=Normal, 2=Fast, 3=Ultra

    // Progression Stats
    this.level = 1;
    this.xp = 0;
    this.xpToNextLevel = 100;
    this.reputation = 4.2; // Star rating out of 5.0
    this.totalCustomersServed = 0;
    this.dailyServedCustomers = 0;
    this.dailyMissedCustomers = 0;
    this.userName = 'Mehmet';
    this.cafeName = 'Ekin Cafe';

    // Entities
    this.customers = [];
    this.employees = [];

    // Specialization choice (unlocked at lvl 5)
    this.specialization = null; // 'artisan_coffee', 'bakery_sweet', 'express_drive'
  }

  resetGame(startingMoney = 20000, newCafeName = 'Ekin Cafe', locationId = 'university', newUserName = 'Mehmet') {
    try {
      localStorage.removeItem('cafe_tycoon_save');
    } catch (e) {
      console.warn('Failed to clear localStorage save:', e);
    }

    this.location = LOCATIONS[locationId] || LOCATIONS.university;
    this.economy = new Economy(startingMoney);
    this.gridManager = new GridManager(15, 15);

    // Simulation Clock
    this.day = 1;
    this.hour = 8;
    this.minute = 0;
    this.gameSpeed = 1;

    // Progression Stats & Statistics Reset
    this.level = 1;
    this.xp = 0;
    this.xpToNextLevel = 100;
    this.reputation = 4.2;
    this.totalCustomersServed = 0;
    this.dailyServedCustomers = 0;
    this.dailyMissedCustomers = 0;
    this.userName = newUserName || 'Mehmet';
    this.cafeName = newCafeName || 'Ekin Cafe';

    // Reset Entities
    this.customers = [];
    this.employees = [];

    // Reset Quests
    if (this.questManager) {
      this.questManager.currentQuestIndex = 0;
      this.questManager.isCompleting = false;
    }

    // Reset Recipe Manager
    if (this.recipeManager) {
      Object.keys(RECIPES).forEach(id => {
        if (this.recipeManager.recipes[id] && RECIPES[id]) {
          const r = this.recipeManager.recipes[id];
          r.sellPrice = RECIPES[id].sellPrice;
          r.costPrice = RECIPES[id].costPrice;
          r.unlocked = (id === 'espresso' || id === 'americano' || id === 'latte');
        }
      });
    }

    // Reset Employee AI
    if (this.employeeSystem) {
      this.employeeSystem.initDefaultStaff();
    }
  }

  get formattedTime() {
    const h = String(this.hour).padStart(2, '0');
    const m = String(Math.floor(this.minute)).padStart(2, '0');
    return `Gün ${this.day} - ${h}:${m}`;
  }

  addXP(amount) {
    this.xp += amount;
    if (this.xp >= this.xpToNextLevel) {
      this.levelUp();
    }
  }

  levelUp() {
    this.xp -= this.xpToNextLevel;
    this.level++;
    this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
    // Grid size stays fixed at 15x15
    return this.level;
  }

  updateReputation(ratingChange) {
    this.reputation = Math.min(5.0, Math.max(1.0, this.reputation + ratingChange));
  }

  saveToLocalStorage() {
    try {
      const data = {
        day: this.day,
        hour: this.hour,
        minute: this.minute,
        level: this.level,
        xp: this.xp,
        reputation: this.reputation,
        totalCustomersServed: this.totalCustomersServed || 0,
        dailyServedCustomers: this.dailyServedCustomers || 0,
        dailyMissedCustomers: this.dailyMissedCustomers || 0,
        questIndex: this.questManager ? this.questManager.currentQuestIndex : 0,
        money: this.economy.money,
        inventory: this.economy.inventory,
        locationId: this.location.id,
        items: this.gridManager.items,
        recipes: this.recipeManager ? Object.values(this.recipeManager.recipes).map(r => ({
          id: r.id,
          unlocked: r.unlocked,
          sellPrice: r.sellPrice
        })) : null,
        employees: this.employees.map(e => ({
          id: e.id,
          name: e.name,
          traitKey: Object.keys(EMPLOYEE_TRAITS).find(k => EMPLOYEE_TRAITS[k].name === e.trait.name) || 'FAST_WORKER',
          salary: e.salary,
          x: e.x,
          y: e.y
        })),
        userName: this.userName,
        cafeName: this.cafeName
      };
      localStorage.setItem('cafe_tycoon_save', JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save game state to localStorage:', e);
    }
  }

  loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem('cafe_tycoon_save');
      if (!raw) return false;
      const data = JSON.parse(raw);
      this.day = data.day || 1;
      this.hour = data.hour || 8;
      this.minute = data.minute || 0;
      this.level = data.level || 1;
      this.xp = data.xp || 0;
      this.reputation = data.reputation || 4.2;
      this.totalCustomersServed = data.totalCustomersServed || 0;
      this.dailyServedCustomers = data.dailyServedCustomers || 0;
      this.dailyMissedCustomers = data.dailyMissedCustomers || 0;
      this.userName = data.userName || 'Mehmet';
      this.cafeName = data.cafeName || 'Ekin Cafe';
      if (this.questManager && data.questIndex !== undefined) {
        this.questManager.currentQuestIndex = data.questIndex;
      }
      this.economy.money = data.money !== undefined ? data.money : 20000;
      if (data.inventory) {
        this.economy.inventory = data.inventory;
        this.economy.ensureInventoryFormat();
      }
      if (data.locationId && LOCATIONS[data.locationId]) this.location = LOCATIONS[data.locationId];
      if (data.items && Array.isArray(data.items)) {
        this.gridManager.cols = 15;
        this.gridManager.rows = 15;
        this.gridManager.items = data.items.filter(it => it.id !== 'DOOR_ENTRANCE');
        this.gridManager.rebuildPathfinderGrid();
      }
      if (data.recipes && Array.isArray(data.recipes) && this.recipeManager) {
        data.recipes.forEach(savedRec => {
          if (this.recipeManager.recipes[savedRec.id]) {
            this.recipeManager.recipes[savedRec.id].unlocked = savedRec.unlocked;
            // Always update sellPrice to new RECIPES defaults if using legacy saved prices
            const defaultPrice = RECIPES[savedRec.id] ? RECIPES[savedRec.id].sellPrice : savedRec.sellPrice;
            const oldDefaults = [60, 75, 110, 130, 160, 140, 225, 275, 180, 120];
            if (!savedRec.sellPrice || oldDefaults.includes(savedRec.sellPrice) || (savedRec.id === 'waffle' && savedRec.sellPrice === 275)) {
              this.recipeManager.recipes[savedRec.id].sellPrice = defaultPrice;
            } else {
              this.recipeManager.recipes[savedRec.id].sellPrice = savedRec.sellPrice;
            }
          }
        });
      }
      if (data.employees && Array.isArray(data.employees)) {
        this.employees = data.employees.map(e => {
          const emp = new Employee(e.id, e.name, e.traitKey || 'FAST_WORKER', e.salary || 80);
          emp.x = e.x || 4;
          emp.y = e.y || 3;
          emp.state = 'IDLE';
          return emp;
        });
      }
      this.cafeName = (data.cafeName && data.cafeName !== 'Espresso Haven Cafe') ? data.cafeName : 'Ekin Cafe';
      return true;
    } catch (e) {
      console.warn('Failed to load save state:', e);
      return false;
    }
  }
}
