/**
 * LeaderboardService.js
 * Global Online Leaderboard integration via Supabase REST API & LocalStorage Fallback.
 */

// Supabase Configuration
export const SUPABASE_URL = 'https://nnkovapfyfleeqcdgsed.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_zpuEh_wz2fAGHxvTyX_gmw_g9wsf9h7';

export class LeaderboardService {
  static isConfigured() {
    return SUPABASE_URL && 
           SUPABASE_URL.startsWith('https://') &&
           !SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT_ID') && 
           SUPABASE_ANON_KEY && 
           !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY');
  }

  /**
   * Fetch leaderboard entries (first tries Supabase REST API, then falls back to LocalStorage)
   */
  static async getEntries() {
    if (this.isConfigured()) {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/leaderboard?select=*&order=money.desc&limit=50`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            return data.map(item => ({
              userName: item.user_name,
              cafeName: item.cafe_name,
              locationName: item.location_name,
              days: item.days,
              customersServed: item.customers_served,
              missedCustomers: item.missed_customers,
              successRate: item.success_rate,
              money: Number(item.money),
              reputation: Number(item.reputation),
              date: item.created_at ? new Date(item.created_at).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR')
            }));
          }
        } else {
          console.warn('Supabase fetch returned non-ok status:', response.status);
        }
      } catch (err) {
        console.warn('Failed to fetch global leaderboard from Supabase, falling back to LocalStorage:', err);
      }
    }

    // Fallback: LocalStorage
    return this.getLocalEntries();
  }

  /**
   * Save a new score entry to Supabase REST API and LocalStorage
   */
  static async saveEntry(entry) {
    // 1. Save locally
    this.saveLocalEntry(entry);

    // 2. Save globally to Supabase if configured
    if (this.isConfigured()) {
      try {
        const payload = {
          user_name: entry.userName || 'Mehmet',
          cafe_name: entry.cafeName || 'Ekin Cafe',
          location_name: entry.locationName || 'Üniversite Kampüsü',
          days: Number(entry.days) || 1,
          customers_served: Number(entry.customersServed) || 0,
          missed_customers: Number(entry.missedCustomers) || 0,
          success_rate: Number(entry.successRate) || 100,
          money: Math.floor(Number(entry.money) || 0),
          reputation: Number(entry.reputation) || 4.2
        };

        const response = await fetch(`${SUPABASE_URL}/rest/v1/leaderboard`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          console.warn('Supabase save returned non-ok status:', response.status);
        } else {
          console.log('[LeaderboardService] Successfully saved score to global Supabase leaderboard!');
        }
      } catch (err) {
        console.warn('Failed to save score to Supabase global leaderboard:', err);
      }
    }
  }

  static getLocalEntries() {
    try {
      const raw = localStorage.getItem('cafe_tycoon_leaderboard');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.sort((a, b) => (Number(b.money) || 0) - (Number(a.money) || 0));
        }
      }
    } catch (e) {
      console.warn('Failed to load local leaderboard:', e);
    }
    return [];
  }

  static saveLocalEntry(entry) {
    try {
      let entries = this.getLocalEntries();
      entries.push(entry);
      entries.sort((a, b) => (Number(b.money) || 0) - (Number(a.money) || 0));
      const trimmed = entries.slice(0, 50);
      localStorage.setItem('cafe_tycoon_leaderboard', JSON.stringify(trimmed));
    } catch (e) {
      console.error('Failed to save score locally:', e);
    }
  }
}
