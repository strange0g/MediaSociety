// API Communications Client Layer

const API = {
  token: localStorage.getItem('cyberpunk_token') || null,

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('cyberpunk_token', token);
    } else {
      localStorage.removeItem('cyberpunk_token');
    }
  },

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = 'Bearer ' + this.token;
    }
    return headers;
  },

  async register(username, password) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      this.setToken(data.token);
    }
    return { ok: res.ok, status: res.status, data };
  },

  async login(username, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      this.setToken(data.token);
    }
    return { ok: res.ok, status: res.status, data };
  },

  async getCurrentUser() {
    if (!this.token) return { authenticated: false };
    try {
      const res = await fetch('/api/auth/me', { headers: this.getHeaders() });
      if (!res.ok) {
        this.setToken(null);
        return { authenticated: false };
      }
      return await res.json();
    } catch (e) {
      return { authenticated: false };
    }
  },

  async getLeaderboard(mapId = '') {
    try {
      const url = mapId ? `/api/leaderboard?map_id=${encodeURIComponent(mapId)}` : '/api/leaderboard';
      const res = await fetch(url);
      return await res.json();
    } catch (e) {
      console.error('Failed to fetch leaderboard:', e);
      return [];
    }
  },

  async submitScore(mapId, waveReached, score, completionTime) {
    if (!this.token) return { ok: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ map_id: mapId, wave_reached: waveReached, score, completion_time: completionTime })
      });
      return await res.json();
    } catch (e) {
      return { error: 'Failed to submit score' };
    }
  },

  async getSave() {
    if (!this.token) return null;
    try {
      const res = await fetch('/api/save', { headers: this.getHeaders() });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async saveGame(mapId, saveData) {
    if (!this.token) return { ok: false, error: 'Login required to save game' };
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ map_id: mapId, save_data: saveData })
      });
      return await res.json();
    } catch (e) {
      return { error: 'Failed to save game' };
    }
  },

  async deleteSave() {
    if (!this.token) return;
    try {
      await fetch('/api/save', { method: 'DELETE', headers: this.getHeaders() });
    } catch (e) {
      console.error('Failed to delete save:', e);
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
