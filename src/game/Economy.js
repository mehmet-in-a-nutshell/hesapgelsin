/**
 * Economy.js
 * Financial simulation module managing money, ingredient stocks, wholesale restocks,
 * daily rent, employee salaries, revenue ledger, and daily profit reports.
 */

export const INGREDIENT_TYPES = {
  coffee_beans: {
    id: 'coffee_beans',
    name: 'Espresso Çekirdeği (5 kg)',
    unit: 'kg',
    packSize: 5,
    packPrice: 5000,
    prices: { CHEAP: 3000, NORMAL: 5000, PREMIUM: 7000 },
    perishable: false,
    description: 'Yüksek kaliteli Arabica kahve çekirdekleri (Kuru gıda).'
  },
  milk: {
    id: 'milk',
    name: 'Taze Süt (10 Litre)',
    unit: 'L',
    packSize: 10,
    packPrice: 650,
    prices: { CHEAP: 450, NORMAL: 650, PREMIUM: 850 },
    perishable: true,
    description: 'Latte ve Cappuccino yapımı için taze süt (Soğuk zincir gerektirir ❄️).'
  },
  pastry_dough: {
    id: 'pastry_dough',
    name: 'Pastane Hamuru (20 Adet)',
    unit: 'adet',
    packSize: 20,
    packPrice: 1000,
    prices: { CHEAP: 800, NORMAL: 1000, PREMIUM: 1250 },
    perishable: true,
    description: 'Kruvasan, cheesecake ve tatlı üretimi için taze hamur (Soğuk zincir gerektirir ❄️).'
  },
  coca_cola_stock: {
    id: 'coca_cola_stock',
    name: 'Coca-Cola Koli (24 Kutu)',
    unit: 'kutu',
    packSize: 24,
    packPrice: 1320, // 55 TL / kutu
    perishable: true,
    hasQualityTiers: false,
    requiresEquipment: 'REFRIGERATOR_STAINLESS',
    description: 'Buz gibi Coca-Cola meşrubat kolisi (Kutu başı 55 TL - Çift Kapılı İçecek Dolabı gerektirir ❄️).'
  },
  fanta_stock: {
    id: 'fanta_stock',
    name: 'Fanta Portakal Koli (24 Kutu)',
    unit: 'kutu',
    packSize: 24,
    packPrice: 1320, // 55 TL / kutu
    perishable: true,
    hasQualityTiers: false,
    requiresEquipment: 'REFRIGERATOR_STAINLESS',
    description: 'Serinletici Fanta Portakal meşrubat kolisi (Kutu başı 55 TL - Çift Kapılı İçecek Dolabı gerektirir ❄️).'
  },
  ice_tea_stock: {
    id: 'ice_tea_stock',
    name: 'Lipton Ice Tea Koli (24 Kutu)',
    unit: 'kutu',
    packSize: 24,
    packPrice: 1320, // 55 TL / kutu
    perishable: true,
    hasQualityTiers: false,
    requiresEquipment: 'REFRIGERATOR_STAINLESS',
    description: 'Meyve aromalı buzlu Lipton Ice Tea meşrubat kolisi (Kutu başı 55 TL - Çift Kapılı İçecek Dolabı gerektirir ❄️).'
  }
};

export class Economy {
  constructor(initialMoney = 20000) {
    this.money = initialMoney;
    this.dailyRevenue = 0;
    this.dailyExpenses = 0;
    this.totalEarned = 0;

    // Stock quantities separated by quality tier (CHEAP, NORMAL, PREMIUM)
    this.inventory = {
      coffee_beans: { CHEAP: 0, NORMAL: 15, PREMIUM: 0 },
      milk: { CHEAP: 0, NORMAL: 30, PREMIUM: 0 },
      pastry_dough: { CHEAP: 0, NORMAL: 40, PREMIUM: 0 },
      coca_cola_stock: { CHEAP: 0, NORMAL: 0, PREMIUM: 0 },
      fanta_stock: { CHEAP: 0, NORMAL: 0, PREMIUM: 0 },
      ice_tea_stock: { CHEAP: 0, NORMAL: 0, PREMIUM: 0 }
    };

    // Ingredient quality preference ('CHEAP', 'NORMAL', 'PREMIUM')
    this.ingredientQuality = 'NORMAL';

    // Today's ledger
    this.todaySalesCount = 0;
    this.todayLog = [];

    this.ensureInventoryFormat();
  }

  /**
   * Ensures inventory has multi-quality object structure for all ingredients.
   * Migrates legacy single-number inventory values if loading an old save.
   */
  ensureInventoryFormat() {
    if (!this.inventory || typeof this.inventory !== 'object') {
      this.inventory = {};
    }

    for (const key of Object.keys(INGREDIENT_TYPES)) {
      const val = this.inventory[key];
      if (typeof val === 'number') {
        // Upgrade legacy numeric inventory
        this.inventory[key] = { CHEAP: 0, NORMAL: Math.max(0, val), PREMIUM: 0 };
      } else if (!val || typeof val !== 'object') {
        this.inventory[key] = { CHEAP: 0, NORMAL: 0, PREMIUM: 0 };
      } else {
        this.inventory[key] = {
          CHEAP: Math.max(0, Number(val.CHEAP) || 0),
          NORMAL: Math.max(0, Number(val.NORMAL) || 0),
          PREMIUM: Math.max(0, Number(val.PREMIUM) || 0)
        };
      }
    }
  }

  /**
   * Get total available stock across all quality tiers for an ingredient
   */
  getTotalStock(typeKey) {
    this.ensureInventoryFormat();
    const itemStock = this.inventory[typeKey];
    if (!itemStock) return 0;
    const sum = (itemStock.PREMIUM || 0) + (itemStock.NORMAL || 0) + (itemStock.CHEAP || 0);
    return Math.round(sum * 100) / 100;
  }

  canAfford(amount) {
    return this.money >= amount;
  }

  addMoney(amount, reason = 'Satış') {
    this.money += amount;
    this.dailyRevenue += amount;
    this.totalEarned += amount;
    this.todaySalesCount++;
    this.todayLog.push({ type: 'income', amount, reason, timestamp: Date.now() });
    return true;
  }

  spendMoney(amount, reason = 'Harcama') {
    if (!this.canAfford(amount)) return false;
    this.money -= amount;
    this.dailyExpenses += amount;
    this.todayLog.push({ type: 'expense', amount, reason, timestamp: Date.now() });
    return true;
  }

  /**
   * Check if required recipe ingredients are available across all quality tiers
   */
  hasIngredients(ingredientReqs = {}) {
    this.ensureInventoryFormat();
    for (const [key, qty] of Object.entries(ingredientReqs)) {
      if (this.getTotalStock(key) < qty) {
        return false;
      }
    }
    return true;
  }

  /**
   * Deduct ingredients when brewing coffee / serving food starting from
   * HIGHEST quality first (PREMIUM -> NORMAL -> CHEAP).
   * Returns { success: boolean, quality: 'PREMIUM'|'NORMAL'|'CHEAP' }
   */
  useIngredients(ingredientReqs = {}) {
    if (!this.hasIngredients(ingredientReqs)) return { success: false, quality: 'NORMAL' };
    
    let overallQuality = 'PREMIUM';
    const qualityPriority = ['PREMIUM', 'NORMAL', 'CHEAP'];

    for (const [key, qty] of Object.entries(ingredientReqs)) {
      let needed = qty;
      const stock = this.inventory[key];

      for (const tier of qualityPriority) {
        if (needed <= 0) break;
        const avail = stock[tier] || 0;
        if (avail > 0) {
          const take = Math.min(avail, needed);
          stock[tier] = Math.max(0, Math.round((avail - take) * 100) / 100);
          needed = Math.round((needed - take) * 100) / 100;

          // Track the lowest quality tier consumed for this recipe
          if (tier === 'CHEAP') {
            overallQuality = 'CHEAP';
          } else if (tier === 'NORMAL' && overallQuality !== 'CHEAP') {
            overallQuality = 'NORMAL';
          }
        }
      }
    }

    return { success: true, quality: overallQuality };
  }

  /**
   * Buy bulk ingredient pack for the currently selected quality preference (CHEAP, NORMAL, PREMIUM)
   */
  buyIngredientPack(typeKey) {
    this.ensureInventoryFormat();
    const item = INGREDIENT_TYPES[typeKey];
    if (!item) return false;

    const isStandardOnly = item.hasQualityTiers === false;
    const qual = isStandardOnly ? 'NORMAL' : (this.ingredientQuality || 'NORMAL');
    
    let finalPrice = item.packPrice;
    if (item.prices && item.prices[qual] !== undefined) {
      finalPrice = item.prices[qual];
    } else if (!isStandardOnly) {
      let priceMult = 1.0;
      if (qual === 'CHEAP') priceMult = 0.6;
      else if (qual === 'PREMIUM') priceMult = 1.5;
      finalPrice = Math.floor(item.packPrice * priceMult);
    }

    const qualName = isStandardOnly ? 'Standart' : (qual === 'CHEAP' ? 'Kalitesiz/Ucuz' : (qual === 'PREMIUM' ? 'Lüks Organik' : 'Standart'));

    if (this.spendMoney(finalPrice, `Toptan Malzeme (${qualName}): ${item.name}`)) {
      const current = this.inventory[typeKey][qual] || 0;
      this.inventory[typeKey][qual] = Math.round((current + item.packSize) * 100) / 100;
      return true;
    }
    return false;
  }

  /**
   * Calculates total stock quantity of perishable items (milk, dough) requiring cold refrigeration.
   */
  getPerishableStockCount() {
    this.ensureInventoryFormat();
    let total = 0;
    for (const [key, item] of Object.entries(INGREDIENT_TYPES)) {
      if (item.perishable) {
        total += this.getTotalStock(key);
      }
    }
    return Math.round(total * 100) / 100;
  }

  /**
   * Evaluates unrefrigerated stock every game hour.
   * If perishable stock exceeds active refrigerator capacity, excess stock decays/spoils starting from lowest quality first.
   */
  checkSpoilage(gameState) {
    if (!gameState || !gameState.gridManager) return null;
    this.ensureInventoryFormat();

    const coldCap = gameState.gridManager.getRefrigeratedCapacity();
    const perishableCount = this.getPerishableStockCount();

    if (perishableCount > coldCap) {
      const excess = Math.round((perishableCount - coldCap) * 100) / 100;
      // Spoil 10% of excess stock per game hour (min 0.5 units per hour)
      let spoilAmount = Math.max(0.5, Math.round(excess * 0.10 * 10) / 10);
      spoilAmount = Math.min(excess, spoilAmount);

      let totalSpoiled = 0;
      const perishableKeys = Object.keys(INGREDIENT_TYPES).filter(k => INGREDIENT_TYPES[k].perishable);
      const qualityOrder = ['CHEAP', 'NORMAL', 'PREMIUM'];

      // Deduct spoiled amount starting from lowest quality (CHEAP first)
      for (const key of perishableKeys) {
        if (totalSpoiled >= spoilAmount) break;
        const stock = this.inventory[key];

        for (const tier of qualityOrder) {
          if (totalSpoiled >= spoilAmount) break;
          const avail = stock[tier] || 0;
          if (avail > 0) {
            const needed = Math.round((spoilAmount - totalSpoiled) * 10) / 10;
            const take = Math.min(avail, needed);
            stock[tier] = Math.max(0, Math.round((avail - take) * 100) / 100);
            totalSpoiled = Math.round((totalSpoiled + take) * 10) / 10;
          }
        }
      }

      if (totalSpoiled > 0) {
        this.todayLog.push({ type: 'expense', amount: 0, reason: `Malzeme Bozulması (Buzdolabı Yersiz): -${totalSpoiled} birim`, timestamp: Date.now() });

        if (gameState.renderer) {
          gameState.renderer.addParticle(3, 3, `-${totalSpoiled} birim Bozuldu! 🤢`, '#ff5252');
        }
        return { spoiled: totalSpoiled, coldCap, excess };
      }
    }
    return null;
  }

  /**
   * Wipes all canned drink inventory when Double-Door Stainless Refrigerator is sold/removed.
   */
  clearCannedDrinks() {
    this.ensureInventoryFormat();
    const prevCount = this.getTotalStock('coca_cola_stock') + this.getTotalStock('fanta_stock') + this.getTotalStock('ice_tea_stock');
    this.inventory.coca_cola_stock = { CHEAP: 0, NORMAL: 0, PREMIUM: 0 };
    this.inventory.fanta_stock = { CHEAP: 0, NORMAL: 0, PREMIUM: 0 };
    this.inventory.ice_tea_stock = { CHEAP: 0, NORMAL: 0, PREMIUM: 0 };
    return Math.round(prevCount * 100) / 100;
  }

  resetDailyLedger() {
    this.dailyRevenue = 0;
    this.dailyExpenses = 0;
    this.todaySalesCount = 0;
    this.todayLog = [];
  }
}
