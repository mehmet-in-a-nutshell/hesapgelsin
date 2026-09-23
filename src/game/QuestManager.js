/**
 * QuestManager.js
 * Onboarding tutorial pipeline & 10 progressively harder quests.
 * Supports dynamic state evaluation and completion animation callbacks.
 */

export const QUESTS = [
  {
    id: 'q1_first_customer',
    title: '1. İlk Müşterini Ağırla ☕',
    desc: 'Gelen müşteriye kahve servis et.',
    targetType: 'serve_customers',
    targetAmount: 1,
    rewardXP: 50,
    rewardMoney: 1000
  },
  {
    id: 'q2_unlock_recipe',
    title: '2. Yeni Reçete Aç 📋',
    desc: 'Menüden 1 yeni ürün reçetesi aç.',
    targetType: 'unlock_recipe',
    targetAmount: 1,
    rewardXP: 100,
    rewardMoney: 1500
  },
  {
    id: 'q3_place_decor',
    title: '3. Kafeni Dekore Et 🪴',
    desc: 'Mağazadan 2 mobilya yerleştir.',
    targetType: 'place_decor',
    targetAmount: 2,
    rewardXP: 120,
    rewardMoney: 2000
  },
  {
    id: 'q4_serve_10',
    title: '4. Servis Hızını Artır 🚀',
    desc: '10 müşteriye başarıyla servis sun.',
    targetType: 'serve_customers',
    targetAmount: 10,
    rewardXP: 200,
    rewardMoney: 3000
  },
  {
    id: 'q5_hire_staff',
    title: '5. Ekibini Büyüt 👨‍🍳',
    desc: '2. Barista çalışanını işe al.',
    targetType: 'hire_staff',
    targetAmount: 2,
    rewardXP: 250,
    rewardMoney: 4000
  },
  {
    id: 'q6_unlock_3_recipes',
    title: '6. Menü Koleksiyonu 🥐',
    desc: 'Menünde toplam 3 reçete aç.',
    targetType: 'unlock_recipe',
    targetAmount: 3,
    rewardXP: 350,
    rewardMoney: 6000
  },
  {
    id: 'q7_reputation_4_5',
    title: '7. İtibar Derecesi ⭐',
    desc: '4.5+ Yıldız itibarına ulaş.',
    targetType: 'reputation',
    targetAmount: 4.5,
    rewardXP: 450,
    rewardMoney: 7500
  },
  {
    id: 'q8_reach_level_3',
    title: '8. Kafe Seviyesi 3 🏆',
    desc: 'Seviye 3 kafe statüsüne yüksel.',
    targetType: 'level',
    targetAmount: 3,
    rewardXP: 600,
    rewardMoney: 10000
  },
  {
    id: 'q9_serve_50',
    title: '9. Müşteri Hacmi 👥',
    desc: '50 müşteriye hizmet sun.',
    targetType: 'serve_customers',
    targetAmount: 50,
    rewardXP: 1000,
    rewardMoney: 20000
  },
  {
    id: 'q10_max_reputation',
    title: '10. Yıldız Hedefi ⭐',
    desc: '5.0 Maksimum Yıldız itibarına ulaş!',
    targetType: 'reputation',
    targetAmount: 5.0,
    rewardXP: 2000,
    rewardMoney: 40000
  },
  {
    id: 'q11_serve_75',
    title: '11. Usta Servis ☕',
    desc: '75 müşteriye başarıyla servis sun.',
    targetType: 'serve_customers',
    targetAmount: 75,
    rewardXP: 2500,
    rewardMoney: 50000
  },
  {
    id: 'q12_unlock_4_recipes',
    title: '12. Lezzet Rehberi 🥐',
    desc: 'Menünde 4 farklı ürün reçetesi aç.',
    targetType: 'unlock_recipe',
    targetAmount: 4,
    rewardXP: 2800,
    rewardMoney: 55000
  },
  {
    id: 'q13_place_6_decor',
    title: '13. İç Mimar 🪴',
    desc: 'Kafeye toplam 6 adet mobilya yerleştir.',
    targetType: 'place_decor',
    targetAmount: 6,
    rewardXP: 3000,
    rewardMoney: 60000
  },
  {
    id: 'q14_reach_level_4',
    title: '14. Parlayan Yıldız 🌟',
    desc: 'Seviye 4 kafe statüsüne ulaş.',
    targetType: 'level',
    targetAmount: 4,
    rewardXP: 3500,
    rewardMoney: 67500
  },
  {
    id: 'q15_hire_3_staff',
    title: '15. Garson Takımı 👨‍🍳',
    desc: 'Kafende 3 barista çalıştırmaya başla.',
    targetType: 'hire_staff',
    targetAmount: 3,
    rewardXP: 4000,
    rewardMoney: 75000
  },
  {
    id: 'q16_serve_120',
    title: '16. Kafe İzdihamı 👥',
    desc: 'Toplam 120 müşteriye hizmet ver.',
    targetType: 'serve_customers',
    targetAmount: 120,
    rewardXP: 4500,
    rewardMoney: 82500
  },
  {
    id: 'q17_unlock_5_recipes',
    title: '17. Zengin Menü 🍰',
    desc: 'Toplam 5 ürün reçetesinin lisansını aç.',
    targetType: 'unlock_recipe',
    targetAmount: 5,
    rewardXP: 5000,
    rewardMoney: 90000
  },
  {
    id: 'q18_reach_level_5',
    title: '18. Gurme Mekan 🏆',
    desc: 'Seviye 5 kafe seviyesine yüksel.',
    targetType: 'level',
    targetAmount: 5,
    rewardXP: 5500,
    rewardMoney: 100000
  },
  {
    id: 'q19_place_10_decor',
    title: '19. Lüks Ambiyans ✨',
    desc: 'Kafeye 10 adet mobilya ve dekorasyon eşyası kur.',
    targetType: 'place_decor',
    targetAmount: 10,
    rewardXP: 6000,
    rewardMoney: 110000
  },
  {
    id: 'q20_serve_200',
    title: '20. Kahve Efsanesi ☕',
    desc: '200 müşteriye servis yap.',
    targetType: 'serve_customers',
    targetAmount: 200,
    rewardXP: 6500,
    rewardMoney: 125000
  },
  {
    id: 'q21_unlock_6_recipes',
    title: '21. Çeşitli Reçeteler 📜',
    desc: '6 adet ürün reçetesinin lisansını tamamla.',
    targetType: 'unlock_recipe',
    targetAmount: 6,
    rewardXP: 7000,
    rewardMoney: 135000
  },
  {
    id: 'q22_reach_level_6',
    title: '22. Ustalar Kulübü 🎖️',
    desc: 'Seviye 6 kafe seviyesine ulaş.',
    targetType: 'level',
    targetAmount: 6,
    rewardXP: 7500,
    rewardMoney: 150000
  },
  {
    id: 'q23_hire_4_staff',
    title: '23. Dev Kadro 👨‍🍳',
    desc: 'Kadrona 4. baristayı dahil et.',
    targetType: 'hire_staff',
    targetAmount: 4,
    rewardXP: 8000,
    rewardMoney: 160000
  },
  {
    id: 'q24_serve_300',
    title: '24. Müşteri Mıknatısı 🧲',
    desc: 'Toplam 300 müşteriyi memnun et.',
    targetType: 'serve_customers',
    targetAmount: 300,
    rewardXP: 8500,
    rewardMoney: 175000
  },
  {
    id: 'q25_place_15_furniture',
    title: '25. Saray Dekorasyonu 🏛️',
    desc: 'Kafeyi 15 kaliteli eşya ile döşe.',
    targetType: 'place_decor',
    targetAmount: 15,
    rewardXP: 9000,
    rewardMoney: 190000
  },
  {
    id: 'q26_reach_level_7',
    title: '26. Marka Kafe 🌟',
    desc: 'Seviye 7 seviyesine yüksel.',
    targetType: 'level',
    targetAmount: 7,
    rewardXP: 9500,
    rewardMoney: 200000
  },
  {
    id: 'q27_serve_400',
    title: '27. Şehrin Gözdesi 🏙️',
    desc: 'Toplam 400 müşteriye kusursuz hizmet sağla.',
    targetType: 'serve_customers',
    targetAmount: 400,
    rewardXP: 10000,
    rewardMoney: 225000
  },
  {
    id: 'q28_unlock_all_recipes',
    title: '28. Tam Menü Koleksiyonu 📜',
    desc: 'Menündeki 7 ürünün tamamını aç.',
    targetType: 'unlock_recipe',
    targetAmount: 7,
    rewardXP: 11000,
    rewardMoney: 250000
  },
  {
    id: 'q29_reach_level_8',
    title: '29. Mega İşletme 🚀',
    desc: 'Seviye 8 seviyesine ulaş.',
    targetType: 'level',
    targetAmount: 8,
    rewardXP: 12000,
    rewardMoney: 275000
  },
  {
    id: 'q30_hire_5_staff',
    title: '30. Altın Ekip 🥇',
    desc: 'Ekibini 5 uzman çalışanla donat.',
    targetType: 'hire_staff',
    targetAmount: 5,
    rewardXP: 13000,
    rewardMoney: 300000
  },
  {
    id: 'q31_serve_550',
    title: '31. Lezzet Fırtınası ⚡',
    desc: '550 müşteriye hizmet ver.',
    targetType: 'serve_customers',
    targetAmount: 550,
    rewardXP: 14000,
    rewardMoney: 325000
  },
  {
    id: 'q32_place_20_furniture',
    title: '32. Mobilya Cenneti 🪑',
    desc: 'Eşya sayını 20\'ye yükselt.',
    targetType: 'place_decor',
    targetAmount: 20,
    rewardXP: 15000,
    rewardMoney: 350000
  },
  {
    id: 'q33_reach_level_9',
    title: '33. Efsanevi Kafe 👑',
    desc: 'Seviye 9 statüsüne ulaş.',
    targetType: 'level',
    targetAmount: 9,
    rewardXP: 16000,
    rewardMoney: 375000
  },
  {
    id: 'q34_serve_700',
    title: '34. Rekor Müşteri Sayısı 📈',
    desc: '700 müşteriye hizmet sun.',
    targetType: 'serve_customers',
    targetAmount: 700,
    rewardXP: 17000,
    rewardMoney: 400000
  },
  {
    id: 'q35_reach_level_10',
    title: '35. Maksimum Seviye 🥇',
    desc: 'Seviye 10 kafe seviyesine ulaş!',
    targetType: 'level',
    targetAmount: 10,
    rewardXP: 18000,
    rewardMoney: 425000
  },
  {
    id: 'q36_serve_900',
    title: '36. 900 Müşteri Kulübü 🎯',
    desc: 'Tam 900 müşteriye kahve ve tatlı sun.',
    targetType: 'serve_customers',
    targetAmount: 900,
    rewardXP: 20000,
    rewardMoney: 450000
  },
  {
    id: 'q37_hire_6_staff',
    title: '37. Barista İmparatorluğu ☕',
    desc: '6 adet baristayı eş zamanlı çalıştır.',
    targetType: 'hire_staff',
    targetAmount: 6,
    rewardXP: 22000,
    rewardMoney: 500000
  },
  {
    id: 'q38_place_25_furniture',
    title: '38. Devasa İç Mekan 🏰',
    desc: 'Kafende 25 adet eşyayı düzenle.',
    targetType: 'place_decor',
    targetAmount: 25,
    rewardXP: 25000,
    rewardMoney: 550000
  },
  {
    id: 'q39_serve_1200',
    title: '39. Dünya Markası 🌍',
    desc: 'Toplam 1,200 müşteriyi ağırla.',
    targetType: 'serve_customers',
    targetAmount: 1200,
    rewardXP: 30000,
    rewardMoney: 625000
  },
  {
    id: 'q40_serve_1500',
    title: '40. Zirvedeki Kafe 🔝',
    desc: '1,500 sipariş teslimatını tamamla!',
    targetType: 'serve_customers',
    targetAmount: 1500,
    rewardXP: 35000,
    rewardMoney: 750000
  },
  {
    id: 'q41_serve_1800',
    title: '41. Metropol Kahvecisi 🌆',
    desc: '1,800 müşteriyi memnuniyetle ağırla.',
    targetType: 'serve_customers',
    targetAmount: 1800,
    rewardXP: 40000,
    rewardMoney: 875000
  },
  {
    id: 'q42_place_30_furniture',
    title: '42. Tasarım İkonu 🎨',
    desc: 'Kafene 30 adet mobilya ve dekorasyon ekle.',
    targetType: 'place_decor',
    targetAmount: 30,
    rewardXP: 45000,
    rewardMoney: 1000000
  },
  {
    id: 'q43_serve_2000',
    title: '43. 2000 Müşteri Barajı 🏆',
    desc: '2,000 müşteriye servis ulaştır.',
    targetType: 'serve_customers',
    targetAmount: 2000,
    rewardXP: 50000,
    rewardMoney: 1125000
  },
  {
    id: 'q44_hire_7_staff',
    title: '44. Dev Hizmet Aritmetiği 👥',
    desc: '7 adet kalifiye baristayı istihdam et.',
    targetType: 'hire_staff',
    targetAmount: 7,
    rewardXP: 55000,
    rewardMoney: 1250000
  },
  {
    id: 'q45_serve_2500',
    title: '45. Dev Müşteri Ağı 🌐',
    desc: '2,500 müşteriye başarıyla kahve ve tatlı servis et.',
    targetType: 'serve_customers',
    targetAmount: 2500,
    rewardXP: 60000,
    rewardMoney: 1500000
  },
  {
    id: 'q46_place_35_furniture',
    title: '46. Lüks Saray 🏛️',
    desc: 'Kafende 35 parça dekoratif eşya bulundur.',
    targetType: 'place_decor',
    targetAmount: 35,
    rewardXP: 70000,
    rewardMoney: 1750000
  },
  {
    id: 'q47_serve_3000',
    title: '47. Şehrin Bir Numarası 🥇',
    desc: '3,000 müşteriyi başarıyla ağırla.',
    targetType: 'serve_customers',
    targetAmount: 3000,
    rewardXP: 80000,
    rewardMoney: 2000000
  },
  {
    id: 'q48_hire_8_staff',
    title: '48. Şampiyonlar Ligi 🏆',
    desc: 'Toplam 8 baristayı aynı anda çalıştır.',
    targetType: 'hire_staff',
    targetAmount: 8,
    rewardXP: 90000,
    rewardMoney: 2250000
  },
  {
    id: 'q49_serve_4000',
    title: '49. Kahve Efsanesi 🌌',
    desc: '4,000 müşteriye servis başarısı göster.',
    targetType: 'serve_customers',
    targetAmount: 4000,
    rewardXP: 100000,
    rewardMoney: 2500000
  },
  {
    id: 'q50_ultimate_empire',
    title: '50. Global Kafe İmparatorluğu 👑',
    desc: '5,000 müşteriyi memnun ederek efsaneler arasına gir!',
    targetType: 'serve_customers',
    targetAmount: 5000,
    rewardXP: 250000,
    rewardMoney: 5000000
  }
];

export class QuestManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.currentQuestIndex = 0;
    this.isCompleting = false;
    this.onQuestComplete = null;
  }

  get currentQuest() {
    return QUESTS[this.currentQuestIndex] || null;
  }

  get totalQuests() {
    return QUESTS.length;
  }

  get isAllCompleted() {
    return this.currentQuestIndex >= QUESTS.length;
  }

  getCurrentProgress() {
    const q = this.currentQuest;
    if (!q) return 0;

    switch (q.targetType) {
      case 'serve_customers':
        return this.gameState.totalCustomersServed || 0;
      case 'unlock_recipe': {
        if (!this.gameState.recipeManager) return 0;
        return Object.values(this.gameState.recipeManager.recipes).filter(r => r.unlocked).length;
      }
      case 'place_decor':
        return this.gameState.gridManager ? this.gameState.gridManager.items.length : 0;
      case 'hire_staff':
        return this.gameState.employees ? this.gameState.employees.length : 0;
      case 'reputation':
        return this.gameState.reputation || 0;
      case 'level':
        return this.gameState.level || 1;
      case 'open_cafe':
        return this.gameState.location ? 1 : 0;
      default:
        return 0;
    }
  }

  getFormattedProgress() {
    const q = this.currentQuest;
    if (!q) return '';

    const currentProg = this.getCurrentProgress();
    if (q.targetType === 'reputation') {
      const val = Math.min(q.targetAmount, currentProg).toFixed(1);
      return `${val} / ${q.targetAmount.toFixed(1)} ⭐`;
    } else {
      const val = Math.min(q.targetAmount, Math.floor(currentProg));
      return `${val} / ${q.targetAmount}`;
    }
  }

  checkProgress(eventType, value = 1) {
    if (this.isAllCompleted || this.isCompleting) return false;
    const q = this.currentQuest;
    if (!q) return false;

    const currentProg = this.getCurrentProgress();
    if (currentProg >= q.targetAmount) {
      this.completeQuest();
      return true;
    }
    return false;
  }

  update(dt) {
    if (this.isAllCompleted || this.isCompleting) return;

    const q = this.currentQuest;
    if (!q) return;

    const currentProg = this.getCurrentProgress();
    if (currentProg >= q.targetAmount) {
      this.completeQuest();
    }
  }

  completeQuest() {
    if (this.isCompleting) return;
    const q = this.currentQuest;
    if (!q) return;

    this.isCompleting = true;
    const completedQuest = q;

    // Grant XP and Money rewards
    this.gameState.addXP(completedQuest.rewardXP);
    this.gameState.economy.addMoney(completedQuest.rewardMoney, `Görev Ödülü: ${completedQuest.title}`);

    // Advance quest index
    this.currentQuestIndex++;
    this.gameState.saveToLocalStorage();

    const nextQuest = this.currentQuest;

    if (this.onQuestComplete) {
      this.onQuestComplete(completedQuest, nextQuest, () => {
        this.isCompleting = false;
      });
    } else {
      this.isCompleting = false;
    }
  }
}

