/**
 * RecipeManager.js
 * Catalog of unlockable coffee drinks & bakery food products with ingredient costs,
 * prep times, default prices, unlock levels, and popularity preferences.
 */

export const RECIPES = {
  espresso: {
    id: 'espresso',
    name: 'Espresso',
    category: 'coffee',
    unlocked: true,
    unlockLevel: 1,
    unlockCost: 0,
    prepTime: 1.5, // seconds
    costPrice: 25.0,
    sellPrice: 160.0,
    ingredients: { coffee_beans: 0.1 },
    popularity: 0.9,
    favoredBy: ['office_worker', 'freelancer'],
    description: 'Yoğun aromalı klasik İtalyan espressosu.'
  },
  americano: {
    id: 'americano',
    name: 'Caffe Americano',
    category: 'coffee',
    unlocked: true,
    unlockLevel: 1,
    unlockCost: 0,
    prepTime: 1.8,
    costPrice: 30.0,
    sellPrice: 200.0,
    ingredients: { coffee_beans: 0.1 },
    popularity: 0.85,
    favoredBy: ['student', 'office_worker'],
    description: 'Sıcak su ile yumuşatılmış taze espresso.'
  },
  latte: {
    id: 'latte',
    name: 'Caffe Latte',
    category: 'coffee',
    unlocked: true,
    unlockLevel: 1,
    unlockCost: 0,
    prepTime: 2.2,
    costPrice: 40.0,
    sellPrice: 240.0,
    ingredients: { coffee_beans: 0.1, milk: 0.2 },
    popularity: 0.95,
    favoredBy: ['student', 'freelancer', 'influencer'],
    description: 'Köpürtülmüş taze süt ile hazırlanan kadifemsi latte.'
  },
  cappuccino: {
    id: 'cappuccino',
    name: 'Cappuccino',
    category: 'coffee',
    unlocked: false,
    unlockLevel: 2,
    unlockCost: 1000,
    prepTime: 2.5,
    costPrice: 40.0,
    sellPrice: 230.0,
    ingredients: { coffee_beans: 0.1, milk: 0.25 },
    popularity: 0.90,
    favoredBy: ['tourist', 'office_worker'],
    description: 'Zengin süt köpüğü ve kakao tozu süslemeli.'
  },
  cold_brew: {
    id: 'cold_brew',
    name: 'Cold Brew İsli Soğuk Kahve',
    category: 'coffee',
    unlocked: false,
    unlockLevel: 3,
    unlockCost: 2500,
    prepTime: 1.5,
    costPrice: 45.0,
    sellPrice: 255.0,
    ingredients: { coffee_beans: 0.15 },
    popularity: 0.88,
    favoredBy: ['freelancer', 'student', 'influencer'],
    description: '18 saat soğuk demlenmiş ferahlatıcı soğuk kahve.'
  },
  croissant: {
    id: 'croissant',
    name: 'Taze Fransız Kruvasan',
    category: 'bakery',
    unlocked: false,
    unlockLevel: 2,
    unlockCost: 1500,
    prepTime: 1.2,
    costPrice: 45.0,
    sellPrice: 230.0,
    ingredients: { pastry_dough: 1 },
    popularity: 0.92,
    favoredBy: ['tourist', 'office_worker'],
    description: 'Çıtır katmanlı tereyağlı Fransız kruvasanı.'
  },
  cheesecake: {
    id: 'cheesecake',
    name: 'San Sebastian Cheesecake',
    category: 'bakery',
    unlocked: false,
    unlockLevel: 4,
    unlockCost: 5000,
    prepTime: 1.2,
    costPrice: 55.0,
    sellPrice: 275.0,
    ingredients: { pastry_dough: 1 },
    popularity: 0.96,
    favoredBy: ['influencer', 'tourist'],
    description: 'İçi kremsi akışkan meşhur cheesecake.'
  },
  waffle: {
    id: 'waffle',
    name: 'Belçika Çikolatalı Waffle',
    category: 'bakery',
    unlocked: false,
    unlockLevel: 5,
    unlockCost: 9000,
    prepTime: 2.5,
    costPrice: 50.0,
    sellPrice: 250.0,
    ingredients: { pastry_dough: 1, milk: 0.1 },
    popularity: 0.94,
    favoredBy: ['student', 'tourist'],
    description: 'Taze meyveler ve eritilmiş Belçika çikolatası ile.'
  },
  toast: {
    id: 'toast',
    name: 'Avokadolu & Füme İsli Tost',
    category: 'bakery',
    unlocked: false,
    unlockLevel: 3,
    unlockCost: 3000,
    prepTime: 1.8,
    costPrice: 50.0,
    sellPrice: 250.0,
    ingredients: { pastry_dough: 1 },
    popularity: 0.90,
    favoredBy: ['student', 'office_worker', 'freelancer'],
    description: 'Sıcak basılmış gurme sandviç tost.'
  },
  donut: {
    id: 'donut',
    name: 'Belçika Çikolatalı Glaze Donut',
    category: 'bakery',
    unlocked: false,
    unlockLevel: 3,
    unlockCost: 2250,
    prepTime: 1.2,
    costPrice: 50.0,
    sellPrice: 250.0,
    ingredients: { pastry_dough: 1 },
    popularity: 0.91,
    favoredBy: ['student', 'influencer'],
    description: 'Nispeten hafif çikolata kaplı taze donut.'
  },
  coca_cola: {
    id: 'coca_cola',
    name: 'Buzlu Kutu Coca-Cola',
    category: 'beverage',
    unlocked: false,
    unlockLevel: 2,
    unlockCost: 1200,
    requiresEquipment: 'REFRIGERATOR_STAINLESS',
    prepTime: 0.8,
    costPrice: 55.0,
    sellPrice: 120.0,
    ingredients: { coca_cola_stock: 1 },
    popularity: 0.95,
    favoredBy: ['student', 'office_worker', 'tourist'],
    description: 'Buz gibi serinletici Coca-Cola (Çift Kapılı İçecek Dolabı gerektirir ❄️).'
  },
  fanta: {
    id: 'fanta',
    name: 'Soğuk Kutu Fanta Portakal',
    category: 'beverage',
    unlocked: false,
    unlockLevel: 2,
    unlockCost: 1200,
    requiresEquipment: 'REFRIGERATOR_STAINLESS',
    prepTime: 0.8,
    costPrice: 55.0,
    sellPrice: 120.0,
    ingredients: { fanta_stock: 1 },
    popularity: 0.92,
    favoredBy: ['student', 'tourist', 'influencer'],
    description: 'Meyve aromalı ferahlatıcı soğuk Fanta Portakal (Çift Kapılı İçecek Dolabı gerektirir ❄️).'
  },
  ice_tea: {
    id: 'ice_tea',
    name: 'Buzlu Lipton Ice Tea',
    category: 'beverage',
    unlocked: false,
    unlockLevel: 2,
    unlockCost: 1200,
    requiresEquipment: 'REFRIGERATOR_STAINLESS',
    prepTime: 0.8,
    costPrice: 55.0,
    sellPrice: 120.0,
    ingredients: { ice_tea_stock: 1 },
    popularity: 0.93,
    favoredBy: ['student', 'freelancer', 'tourist'],
    description: 'Şeftali & limon aromalı serinletici Lipton Ice Tea (Çift Kapılı İçecek Dolabı gerektirir ❄️).'
  }
};

export class RecipeManager {
  constructor() {
    this.recipes = JSON.parse(JSON.stringify(RECIPES));
  }

  getUnlockedRecipes() {
    return Object.values(this.recipes).filter(r => r.unlocked);
  }

  unlockRecipe(recipeId, playerLevel, economy, gridManager) {
    const rec = this.recipes[recipeId];
    if (!rec) return false;
    const cost = rec.unlockCost || (rec.unlockLevel * 1250);

    if (rec.requiresEquipment === 'REFRIGERATOR_STAINLESS') {
      if (!gridManager || !gridManager.hasDoubleDoorFridge()) {
        return false;
      }
    }

    if (playerLevel >= rec.unlockLevel && economy && economy.canAfford(cost)) {
      economy.spendMoney(cost, `Reçete Lisansı: ${rec.name}`);
      rec.unlocked = true;
      return true;
    }
    return false;
  }

  setPrice(recipeId, newPrice) {
    if (this.recipes[recipeId]) {
      this.recipes[recipeId].sellPrice = Math.max(1, newPrice);
    }
  }
}
