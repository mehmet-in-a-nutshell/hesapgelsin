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
      student: 0.40,
      athlete: 0.15,
      hipster: 0.15,
      freelancer: 0.12,
      goth: 0.08,
      office_worker: 0.06,
      influencer: 0.04
    },
    peakHours: [9, 12, 14, 16],
    description: 'Öğrenciler, genç sporcular ve alternatif sanatçılar yoğunlukta. Bütçe duyarlı ancak sirkülasyonu çok yüksek canlı lokasyon.'
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
      office_worker: 0.45,
      executive: 0.25,
      freelancer: 0.15,
      senior: 0.08,
      student: 0.04,
      hipster: 0.03
    },
    peakHours: [8, 12, 13, 17],
    description: 'Yüksek harcama gücüne sahip ofis çalışanları ve şirket CEO\'ları. Hızlı servis, isli kahveler ve gurme tatlılar talep ediliyor.'
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
      senior: 0.30,
      freelancer: 0.20,
      student: 0.18,
      athlete: 0.15,
      office_worker: 0.10,
      tourist: 0.04,
      influencer: 0.03
    },
    peakHours: [10, 15, 18, 20],
    description: 'Kıdemli müdavimler, mahalle sakinleri ve evden çalışanlar. Sabırlı müşteri yapısı, hamur işleri ve taze kahvaltılıklara ilgi yüksek.'
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
      hipster: 0.25,
      goth: 0.22,
      influencer: 0.18,
      tourist: 0.15,
      student: 0.12,
      athlete: 0.08
    },
    peakHours: [14, 17, 19, 21],
    description: 'Sanatçılar, rock tutkunları ve popüler içerik üreticileri. Akşam trafiği yoğun, fotojenik ürünler ve soğuk demlenmiş kahveler popüler.'
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
      tourist: 0.50,
      senior: 0.15,
      executive: 0.12,
      influencer: 0.10,
      hipster: 0.08,
      office_worker: 0.05
    },
    peakHours: [11, 13, 16, 18],
    description: 'Yabancı turistler ve varlıklı gezi grupları. Yüksek fiyat toleransı ve birinci sınıf premium kahve-tatlı menülerine yüksek talep.'
  }
};
