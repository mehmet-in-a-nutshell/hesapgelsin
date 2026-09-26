/**
 * WeatherManager.js
 * Dynamic weather system: SUNNY ☀️, RAINY 🌧️, SNOWY ❄️.
 * Manages weather transitions, temperatures, demand multipliers for hot/cold products,
 * and updates weather HUD indicators.
 */

export const WEATHER_TYPES = {
  SUNNY: {
    id: 'SUNNY',
    name: 'Açık & Güneşli',
    icon: '☀️',
    temp: 26,
    color: '#ffd54f',
    hotDrinkMultiplier: 1.0,
    coldDrinkMultiplier: 1.35,
    bakeryMultiplier: 1.0,
    spawnRateMultiplier: 1.0,
    desc: 'Pırıl pırıl güneşli hava! Cold Brew ve soğuk meşrubat satışı yüksek 🧋.'
  },
  RAINY: {
    id: 'RAINY',
    name: 'Sağanak Yağmurlu',
    icon: '🌧️',
    temp: 13,
    color: '#64b5f6',
    hotDrinkMultiplier: 1.75,
    coldDrinkMultiplier: 0.55,
    bakeryMultiplier: 1.35,
    spawnRateMultiplier: 1.2, // Rain drives pedestrians into the cafe for shelter!
    desc: 'Dışarıda sağanak yağmur var! Müşteriler sıcak kahve ve taze tost için dükkana sığınıyor ☕.'
  },
  SNOWY: {
    id: 'SNOWY',
    name: 'Lapa Lapa Karlı',
    icon: '❄️',
    temp: -2,
    color: '#e0f7fa',
    hotDrinkMultiplier: 2.2,
    coldDrinkMultiplier: 0.35,
    bakeryMultiplier: 1.5,
    spawnRateMultiplier: 1.3, // Cold weather creates big demand for warm cafe atmosphere!
    desc: 'Lapa lapa kar yağıyor! Sıcak Espresso, Latte ve Taze Kruvasan talebi zirvede 🥐.'
  }
};

export class WeatherManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.currentWeather = WEATHER_TYPES.SUNNY;
    this.weatherTimer = 0;
    this.weatherDuration = 120; // Weather changes every ~2 real minutes (~6 in-game hours)
  }

  setWeather(weatherId) {
    if (WEATHER_TYPES[weatherId]) {
      const prev = this.currentWeather;
      this.currentWeather = WEATHER_TYPES[weatherId];
      if (prev.id !== this.currentWeather.id && this.gameState) {
        if (this.gameState.uiManager) {
          this.gameState.uiManager.updateWeatherHUD(this.currentWeather);
          const msg = this.currentWeather.id === 'RAINY'
            ? '🌧️ Dışarıda Sağanak Yağmur Başladı! (Sıcak İçecek & Tost Talebi Yükseldi ⚡)'
            : (this.currentWeather.id === 'SNOWY'
              ? '❄️ Dışarıda Kar Yağışı Başladı! (Sıcak Kahve & Kruvasan Satışı Zirvede ☕)'
              : '☀️ Güneş Açtı! (Buzlu İçecekler & Cold Brew Popüler 🧋)');
          this.gameState.uiManager.addNotification(msg, this.currentWeather.icon, 5000);
        }
      }
    }
  }

  changeRandomWeather() {
    const rand = Math.random();
    let nextId = 'SUNNY';
    if (rand < 0.45) nextId = 'SUNNY';
    else if (rand < 0.80) nextId = 'RAINY';
    else nextId = 'SNOWY';

    // Avoid repeating same weather twice in a row if possible
    if (nextId === this.currentWeather.id) {
      nextId = this.currentWeather.id === 'SUNNY' ? 'RAINY' : 'SUNNY';
    }

    this.setWeather(nextId);
  }

  update(dt) {
    const speed = this.gameState ? this.gameState.gameSpeed : 1.0;
    this.weatherTimer += dt * speed;

    if (this.weatherTimer >= this.weatherDuration) {
      this.weatherTimer = 0;
      this.changeRandomWeather();
    }
  }
}
