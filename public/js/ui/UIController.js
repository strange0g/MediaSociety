// UI Events Controller and Interface Synchronizer

class UIController {
  constructor(gameEngine) {
    this.engine = gameEngine;
    this.selectedBuildType = null;
    this.currentUser = null;

    // Attach state change callback from engine to HUD/Inspector
    this.engine.onStateChange = (engine) => this.updateHUD(engine);
  }

  init() {
    this.bindGlobalEvents();
    this.bindCanvasEvents();
    this.bindHUDControls();
    this.bindAuthModal();
    this.bindLeaderboardModal();
    this.checkUserAuth();
    this.renderMapDashboard();
    this.checkSavedGame();
  }

  async checkUserAuth() {
    const userResult = await API.getCurrentUser();
    if (userResult.authenticated) {
      this.currentUser = userResult.user;
      this.updateUserUI();
    } else {
      this.currentUser = null;
      this.updateUserUI();
    }
  }

  updateUserUI() {
    const userSec = document.getElementById('user-section');
    if (!userSec) return;

    if (this.currentUser) {
      userSec.innerHTML = `
        <span class="user-tag">[USER: ${this.currentUser.username.toUpperCase()}]</span>
        <button id="btn-logout" class="cyber-btn sm danger">LOGOUT</button>
      `;
      document.getElementById('btn-logout').addEventListener('click', () => {
        API.setToken(null);
        this.currentUser = null;
        this.updateUserUI();
        this.checkSavedGame();
      });
    } else {
      userSec.innerHTML = `<button id="btn-auth" class="cyber-btn sm yellow">LOGIN / REGISTER</button>`;
      document.getElementById('btn-auth').addEventListener('click', () => {
        document.getElementById('modal-auth').classList.remove('hidden');
      });
    }
  }

  async checkSavedGame() {
    const banner = document.getElementById('resume-banner');
    if (!banner) return;

    if (!this.currentUser) {
      banner.classList.add('hidden');
      return;
    }

    const saveRes = await API.getSave();
    if (saveRes && saveRes.save_data) {
      banner.classList.remove('hidden');
      const data = saveRes.save_data;
      const mapName = MAPS[saveRes.map_id] ? MAPS[saveRes.map_id].name : saveRes.map_id;
      document.getElementById('save-summary-text').innerText =
        `Sector: ${mapName} | Wave: ${data.wave} | Core HP: ${data.hp} HP | Credits: ₡${data.credits}`;

      document.getElementById('btn-resume-game').onclick = () => {
        const mapConfig = MAPS[saveRes.map_id];
        this.engine.deserializeState(data, mapConfig);
        this.switchView('game');
        this.startLoop();
      };

      document.getElementById('btn-discard-save').onclick = async () => {
        await API.deleteSave();
        banner.classList.add('hidden');
      };
    } else {
      banner.classList.add('hidden');
    }
  }

  renderMapDashboard() {
    const container = document.getElementById('map-cards-container');
    if (!container) return;

    container.innerHTML = '';
    Object.keys(MAPS).forEach(mapId => {
      const m = MAPS[mapId];
      const card = document.createElement('div');
      card.className = 'map-card';
      card.innerHTML = `
        <div class="map-card-header">
          <span class="map-name">${m.name}</span>
          <span class="map-diff">${m.difficulty}</span>
        </div>
        <p class="map-card-desc">${m.description}</p>
        <button class="cyber-btn primary block">DEPLOY TO SECTOR</button>
      `;

      card.addEventListener('click', () => {
        this.engine.loadMap(m);
        this.switchView('game');
        this.startLoop();
      });

      container.appendChild(card);
    });
  }

  switchView(viewName) {
    document.querySelectorAll('.cyber-view').forEach(v => v.classList.remove('active'));
    if (viewName === 'game') {
      document.getElementById('view-game').classList.add('active');
    } else {
      document.getElementById('view-dashboard').classList.add('active');
      this.checkSavedGame();
    }
  }

  bindCanvasEvents() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      const gridX = Math.floor(clickX / CONFIG.GRID.TILE_SIZE);
      const gridY = Math.floor(clickY / CONFIG.GRID.TILE_SIZE);

      if (gridX < 0 || gridX >= CONFIG.GRID.COLS || gridY < 0 || gridY >= CONFIG.GRID.ROWS) return;

      // Check if clicked an existing tower
      const existingTower = this.engine.towers.find(t => t.gridX === gridX && t.gridY === gridY);

      if (existingTower) {
        this.engine.selectedTower = existingTower;
        this.engine.selectedTile = { x: gridX, y: gridY };
      } else if (this.selectedBuildType) {
        // Attempt to build selected tower
        const success = this.engine.buildTower(gridX, gridY, this.selectedBuildType);
        if (success) {
          this.engine.selectedTile = { x: gridX, y: gridY };
        }
      } else {
        this.engine.selectedTower = null;
        this.engine.selectedTile = { x: gridX, y: gridY };
      }

      this.updateInspector();
    });

    // Tower Selection Buttons in Sidebar
    document.querySelectorAll('.tower-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-tower-type');
        if (this.selectedBuildType === type) {
          this.selectedBuildType = null; // deselect
          btn.classList.remove('selected');
        } else {
          document.querySelectorAll('.tower-select-btn').forEach(b => b.classList.remove('selected'));
          this.selectedBuildType = type;
          btn.classList.add('selected');
        }
      });
    });
  }

  bindHUDControls() {
    // Start Wave
    const btnStartWave = document.getElementById('btn-start-wave');
    if (btnStartWave) {
      btnStartWave.addEventListener('click', () => {
        this.engine.startWave();
      });
    }

    // Game Speed
    const btnSpeed = document.getElementById('btn-game-speed');
    if (btnSpeed) {
      btnSpeed.addEventListener('click', () => {
        if (this.engine.gameSpeed === 1) {
          this.engine.gameSpeed = 2;
          btnSpeed.innerText = '2x SPEED';
        } else {
          this.engine.gameSpeed = 1;
          btnSpeed.innerText = '1x SPEED';
        }
      });
    }

    // Pause
    const btnPause = document.getElementById('btn-game-pause');
    if (btnPause) {
      btnPause.addEventListener('click', () => {
        this.engine.isPaused = !this.engine.isPaused;
        btnPause.innerText = this.engine.isPaused ? 'RESUME' : 'PAUSE';
      });
    }

    // Save Game
    const btnSave = document.getElementById('btn-save-game');
    if (btnSave) {
      btnSave.addEventListener('click', async () => {
        if (!this.currentUser) {
          alert('Please login to save your game state!');
          document.getElementById('modal-auth').classList.remove('hidden');
          return;
        }

        const saveData = this.engine.serializeState();
        const res = await API.saveGame(this.engine.mapData.id, saveData);
        if (res.message) {
          alert('Game state successfully saved to profile!');
        } else {
          alert(res.error || 'Failed to save game');
        }
      });
    }

    // Exit Game
    const btnExit = document.getElementById('btn-exit-game');
    if (btnExit) {
      btnExit.addEventListener('click', () => {
        this.switchView('dashboard');
      });
    }

    // Audio SFX Toggle
    const btnSound = document.getElementById('btn-sound');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        const isMuted = this.engine.audio ? this.engine.audio.toggleMute() : false;
        btnSound.innerText = isMuted ? 'SFX: OFF' : 'SFX: ON';
      });
    }
  }

  updateHUD(engine) {
    document.getElementById('hud-hp').innerText = engine.hp;
    document.getElementById('hud-credits').innerText = engine.credits;
    document.getElementById('hud-wave').innerText = engine.wave;
    document.getElementById('hud-score').innerText = engine.score;

    const startBtn = document.getElementById('btn-start-wave');
    if (startBtn) {
      startBtn.disabled = engine.isWaveInProgress;
      startBtn.innerText = engine.isWaveInProgress ? `WAVE ${engine.wave} IN PROGRESS...` : `START WAVE ${engine.wave}`;
    }

    // Check Overlay State (Game Over / Won / Wave Cleared)
    const overlay = document.getElementById('game-overlay');
    const title = document.getElementById('overlay-title');
    const msg = document.getElementById('overlay-message');
    const actionBtn = document.getElementById('btn-overlay-action');

    if (engine.isGameOver) {
      overlay.classList.remove('hidden');
      title.innerText = 'SYSTEM OVERRIDE';
      title.style.color = '#ff0055';
      msg.innerText = `The Core was destroyed on Wave ${engine.wave}. Total Score: ${engine.score}`;
      actionBtn.innerText = 'RETURN TO DASHBOARD';
      actionBtn.onclick = () => {
        overlay.classList.add('hidden');
        if (this.currentUser) API.deleteSave();
        this.switchView('dashboard');
      };
    } else if (engine.isGameWon) {
      overlay.classList.remove('hidden');
      title.innerText = 'SECTOR SECURED';
      title.style.color = '#00ff66';
      msg.innerText = `All 10 waves cleared! Core Integrity: ${engine.hp} HP | Total Score: ${engine.score}`;
      actionBtn.innerText = 'SUBMIT SCORE & RETURN';
      actionBtn.onclick = async () => {
        overlay.classList.add('hidden');
        if (this.currentUser) {
          await API.submitScore(engine.mapData.id, engine.wave, engine.score, engine.elapsedTime);
          await API.deleteSave();
        }
        this.switchView('dashboard');
      };
    } else {
      overlay.classList.add('hidden');
    }

    this.updateInspector();
  }

  updateInspector() {
    const container = document.getElementById('inspector-content');
    if (!container) return;

    const tower = this.engine.selectedTower;
    if (!tower) {
      container.innerHTML = `<p class="inspector-placeholder">Click a placed tower on grid to inspect & upgrade parameters, or click an empty tile to build.</p>`;
      return;
    }

    const canUpgrade = tower.canUpgrade();
    const cost = tower.getUpgradeCost();
    const sellVal = tower.getSellValue();

    container.innerHTML = `
      <div class="inspector-details">
        <div class="inspector-header">
          <span class="inspector-name">${tower.stats.name}</span>
          <span class="inspector-tier">TIER ${tower.tier}</span>
        </div>
        <div class="stat-row"><span class="stat-row-label">Range:</span><span class="stat-row-val">${tower.stats.range}px</span></div>
        <div class="stat-row"><span class="stat-row-label">Damage:</span><span class="stat-row-val">${tower.stats.damage || 0}</span></div>
        <div class="stat-row"><span class="stat-row-label">Fire Rate:</span><span class="stat-row-val">${tower.stats.fireRate}/s</span></div>
        <p style="font-size:0.75rem; color:#788a9c; margin-top:4px;">${tower.stats.desc}</p>

        <div class="upgrade-box">
          ${canUpgrade ? `
            <p class="upgrade-desc">Next Tier: ${CONFIG.TOWERS[tower.type].tiers[tower.tier + 1].name}</p>
            <button id="btn-upgrade-tower" class="cyber-btn primary block sm" ${this.engine.credits < cost ? 'disabled' : ''}>
              UPGRADE (₡${cost})
            </button>
          ` : `<p style="font-size:0.8rem; color:#00ff66;">[MAX TIER REACHED]</p>`}

          <div class="action-row">
            <button id="btn-sell-tower" class="cyber-btn danger sm block">SELL (₡${sellVal})</button>
          </div>
        </div>
      </div>
    `;

    const upBtn = document.getElementById('btn-upgrade-tower');
    if (upBtn) {
      upBtn.addEventListener('click', () => {
        this.engine.upgradeTower(tower);
      });
    }

    const sellBtn = document.getElementById('btn-sell-tower');
    if (sellBtn) {
      sellBtn.addEventListener('click', () => {
        this.engine.sellTower(tower);
      });
    }
  }

  bindGlobalEvents() {
    // Auth Modal toggle
    const btnCloseAuth = document.getElementById('btn-close-auth');
    if (btnCloseAuth) {
      btnCloseAuth.addEventListener('click', () => {
        document.getElementById('modal-auth').classList.add('hidden');
      });
    }

    // Leaderboard button
    const btnLb = document.getElementById('btn-leaderboard');
    if (btnLb) {
      btnLb.addEventListener('click', async () => {
        document.getElementById('modal-leaderboard').classList.remove('hidden');
        await this.loadLeaderboardTable();
      });
    }

    const btnCloseLb = document.getElementById('btn-close-leaderboard');
    if (btnCloseLb) {
      btnCloseLb.addEventListener('click', () => {
        document.getElementById('modal-leaderboard').classList.add('hidden');
      });
    }
  }

  bindAuthModal() {
    let mode = 'login';
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const form = document.getElementById('auth-form');
    const errDiv = document.getElementById('auth-error');

    if (tabLogin && tabRegister) {
      tabLogin.addEventListener('click', () => {
        mode = 'login';
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        document.getElementById('btn-auth-submit').innerText = 'ACCESS SYSTEM';
      });

      tabRegister.addEventListener('click', () => {
        mode = 'register';
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        document.getElementById('btn-auth-submit').innerText = 'REGISTER USER';
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errDiv.classList.add('hidden');

        const u = document.getElementById('auth-username').value.trim();
        const p = document.getElementById('auth-password').value.trim();

        let res = null;
        if (mode === 'login') {
          res = await API.login(u, p);
        } else {
          res = await API.register(u, p);
        }

        if (res.ok) {
          document.getElementById('modal-auth').classList.add('hidden');
          this.currentUser = res.data.user;
          this.updateUserUI();
          this.checkSavedGame();
        } else {
          errDiv.innerText = res.data.error || 'Authentication failed';
          errDiv.classList.remove('hidden');
        }
      });
    }
  }

  bindLeaderboardModal() {
    const filterSelect = document.getElementById('leaderboard-map-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', () => {
        this.loadLeaderboardTable(filterSelect.value);
      });
    }
  }

  async loadLeaderboardTable(mapFilter = '') {
    const tbody = document.getElementById('leaderboard-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Querying database...</td></tr>';
    const data = await API.getLeaderboard(mapFilter);

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#788a9c;">No scores recorded yet.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    data.forEach((entry, idx) => {
      const mapName = MAPS[entry.map_id] ? MAPS[entry.map_id].name : entry.map_id;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${idx + 1}</td>
        <td style="color:#00f0ff; font-weight:bold;">${entry.username}</td>
        <td>${mapName}</td>
        <td>${entry.wave_reached}</td>
        <td style="color:#00ff66; font-weight:bold;">${entry.score}</td>
        <td>${Math.round(entry.completion_time)}s</td>
      `;
      tbody.appendChild(tr);
    });
  }

  startLoop() {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      this.engine.update(dt);
      this.engine.draw();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIController;
}
