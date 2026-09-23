/**
 * LocationManager.js
 * Configures the 5 strategic cafe district locations:
 * 1. University District
 * 2. Business District
 * 3. Residential District
 * 4. Entertainment District
 * 5. Tourist District
 */

export const LOCATIONS = {
  university: {
    id: 'university',
    name: 'Üniversite Kampüsü',
    icon: '🎓',
    rent: 3750, // per day
    trafficMultiplier: 1.5,
    spendingPower: 0.8,
    priceSensitivity: 1.4, // high sensitivity to expensive prices
    demographics: {
      student: 0.55,
      office_worker: 0.20,
      freelancer: 0.15,
      tourist: 0.05,
      influencer: 0.05
    },
    peakHours: [9, 12, 14, 16],
    description: 'Öğrenci yoğunluğu yüksek, bütçe duyarlı ancak yüksek müşteri trafiğine sahip canlı lokasyon.'
  },
  business: {
    id: 'business',
    name: 'Finans Merkezi',
    icon: '🏢',
    rent: 11250,
    trafficMultiplier: 1.3,
    spendingPower: 1.6,
    priceSensitivity: 0.7,
    demographics: {
      student: 0.10,
      office_worker: 0.65,
      freelancer: 0.15,
      tourist: 0.05,
      influencer: 0.05
    },
    peakHours: [8, 12, 13, 17],
    description: 'Yüksek harcama gücüne sahip ofis çalışanları. Sabah espresso ve öğle latte talebi çok yüksek.'
  },
  residential: {
    id: 'residential',
    name: 'Sakin Konut Bölgesi',
    icon: '🏡',
    rent: 5500,
    trafficMultiplier: 1.0,
    spendingPower: 1.1,
    priceSensitivity: 1.0,
    demographics: {
      student: 0.15,
      office_worker: 0.30,
      freelancer: 0.35,
      tourist: 0.10,
      influencer: 0.10
    },
    peakHours: [10, 15, 18, 20],
    description: 'İstikrarlı müşteri akışı. Rahat oturma alanları ve tatlı çeşitleri tercih ediliyor.'
  },
  entertainment: {
    id: 'entertainment',
    name: 'Eğlence & Sanat Caddesi',
    icon: '🎭',
    rent: 9500,
    trafficMultiplier: 1.4,
    spendingPower: 1.3,
    priceSensitivity: 0.85,
    demographics: {
      student: 0.20,
      office_worker: 0.25,
      freelancer: 0.20,
      tourist: 0.20,
      influencer: 0.15
    },
    peakHours: [14, 17, 19, 21],
    description: 'Akşam trafiği yoğun, imza içecekler ve dekoratif ambiyansa yüksek ilgi var.'
  },
  tourist: {
    id: 'tourist',
    name: 'Tarihi Meydan',
    icon: '🗽',
    rent: 15000,
    trafficMultiplier: 1.8,
    spendingPower: 1.8,
    priceSensitivity: 0.5,
    demographics: {
      student: 0.05,
      office_worker: 0.15,
      freelancer: 0.10,
      tourist: 0.60,
      influencer: 0.10
    },
    peakHours: [11, 13, 16, 18],
    description: 'Turistler yüksek fiyatları tolere eder ve birinci sınıf premium ürünleri talep eder.'
  }
};
