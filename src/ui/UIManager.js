/**
 * UIManager.js
 * Controls HUD updates, modal dialog windows, build shop, menu price editor,
 * staff candidate hiring, stock inventory restocking, location switching map, and audio triggers.
 */

import { ITEM_CATALOG, isItemInUse, getHighestEquipmentTier, getRepairCost } from '../game/GridManager.js';
import { INGREDIENT_TYPES } from '../game/Economy.js';
import { LOCATIONS } from '../game/LocationManager.js';
import { EMPLOYEE_TRAITS, Employee } from '../game/EmployeeAI.js';
import { audioEngine } from '../audio/AudioEngine.js';
import { QUESTS } from '../game/QuestManager.js';
import { LeaderboardService } from '../game/LeaderboardService.js';

export class UIManager {
  constructor(gameState, recipeManager, questManager, employeeSystem, canvasRenderer) {
    this.gameState = gameState;
    this.recipeManager = recipeManager;
    this.questManager = questManager;
    this.employeeSystem = employeeSystem;
    this.renderer = canvasRenderer;

    this.modalOverlay = document.getElementById('modal-overlay');
    this.modalTitle = document.getElementById('modal-title');
    this.modalBody = document.getElementById('modal-body');

    this.notificationsList = document.getElementById('notifications-list');
    this.activeWarnings = new Map();

    this.questDrawer = document.querySelector('.quest-drawer');
    this.notificationsDrawer = document.getElementById('notifications-drawer');

    this.initEvents();
    this.initObjectSellPopover();
    this.initFlowBreakdownPopover();
    this.initWeatherPopover();
    this.setupQuestSystem();
    this.initWelcomeScreen();
  }

  setupQuestSystem() {
    if (this.questManager) {
      this.questManager.onQuestComplete = (completedQuest, nextQuest, onDone) => {
        this.animateQuestCompletion(completedQuest, nextQuest, onDone);
      };
    }
  }

  animateQuestCompletion(completedQuest, nextQuest, onDone) {
    audioEngine.playLevelUp();

    // 1. Spawn floating reward badges (+TL, +XP) that fly upward!
    if (this.questDrawer) {
      const rect = this.questDrawer.getBoundingClientRect();
      const moneyBadge = document.createElement('div');
      moneyBadge.className = 'floating-reward-badge gold';
      moneyBadge.innerText = `+${completedQuest.rewardMoney} TL 💰`;
      moneyBadge.style.left = `${rect.left + 30}px`;
      moneyBadge.style.top = `${rect.top + 10}px`;

      const xpBadge = document.createElement('div');
      xpBadge.className = 'floating-reward-badge purple';
      xpBadge.innerText = `+${completedQuest.rewardXP} XP 🏆`;
      xpBadge.style.left = `${rect.left + 150}px`;
      xpBadge.style.top = `${rect.top + 10}px`;

      document.body.appendChild(moneyBadge);
      document.body.appendChild(xpBadge);

      setTimeout(() => {
        moneyBadge.remove();
        xpBadge.remove();
      }, 1400);

      // 2. Add celebration glowing gold border & pulse effect
      this.questDrawer.classList.add('quest-completed');
    }

    // 3. Wait 800ms for glowing completion pulse, then slide out to the left
    setTimeout(() => {
      if (this.questDrawer) {
        this.questDrawer.classList.add('slide-out');
      }

      // 4. After 450ms slide-out animation finishes and box is off screen to the left:
      setTimeout(() => {
        if (nextQuest) {
          // Update contents for next quest
          const qTitle = document.getElementById('quest-title');
          const qDesc = document.getElementById('quest-desc');
          const rXP = document.getElementById('reward-xp');
          const rMoney = document.getElementById('reward-money');
          const qNum = document.getElementById('quest-number');
          const qProg = document.getElementById('quest-progress');

          if (qTitle) qTitle.innerText = nextQuest.title;
          if (qDesc) qDesc.innerText = nextQuest.desc;
          if (rXP) rXP.innerText = `+${nextQuest.rewardXP} XP`;
          if (rMoney) rMoney.innerText = `+${nextQuest.rewardMoney} TL`;
          if (qNum) qNum.innerText = `GÖREV ${this.questManager.currentQuestIndex + 1} / ${this.questManager.totalQuests}`;
          if (qProg) qProg.innerText = this.questManager.getFormattedProgress();

          // Remove completed and slide-out classes, apply slide-in animation
          if (this.questDrawer) {
            this.questDrawer.classList.remove('quest-completed', 'slide-out');
            this.questDrawer.classList.add('slide-in');
          }

          setTimeout(() => {
            if (this.questDrawer) this.questDrawer.classList.remove('slide-in');
            if (onDone) onDone();
          }, 450);
        } else {
          // All 10 Quests Completed! Hide the quest drawer so it disappears cleanly!
          if (this.questDrawer) {
            this.questDrawer.style.display = 'none';
          }
          this.addNotification('🎉 TÜM GÖREVLER TAMAMLANDI! Şehrin En Popüler Kafesi Oldunuz! 👑', '👑', 8000);
          if (onDone) onDone();
        }
      }, 450);
    }, 800);
  }

  initEvents() {
    document.getElementById('modal-close').addEventListener('click', () => {
      if (this.preventModalClose) return;
      this.closeModal();
    });
    if (this.modalOverlay) {
      this.modalOverlay.addEventListener('click', (e) => {
        if (e.target === this.modalOverlay) {
          if (this.preventModalClose) return;
          this.closeModal();
        }
      });
    }

    // Speed Controls
    document.getElementById('speed-pause').addEventListener('click', () => this.setSpeed(0));
    document.getElementById('speed-1x').addEventListener('click', () => this.setSpeed(1));
    document.getElementById('speed-2x').addEventListener('click', () => this.setSpeed(2));
    document.getElementById('speed-3x').addEventListener('click', () => this.setSpeed(3));

    // Audio Mute Toggle
    document.getElementById('sound-btn').addEventListener('click', () => {
      const isMuted = audioEngine.toggleMute();
      document.getElementById('sound-btn').innerText = isMuted ? '🔇' : '🔊';
    });

    // Zoom Controls
    document.getElementById('btn-zoom-in').addEventListener('click', () => {
      audioEngine.playClick();
      this.renderer.zoomIn();
    });
    document.getElementById('btn-zoom-out').addEventListener('click', () => {
      audioEngine.playClick();
      this.renderer.zoomOut();
    });
    document.getElementById('btn-zoom-reset').addEventListener('click', () => {
      audioEngine.playClick();
      this.renderer.resetZoom();
    });

    // Bottom Navigation Buttons
    document.getElementById('btn-build').addEventListener('click', () => this.openBuildModal());
    document.getElementById('btn-menu').addEventListener('click', () => this.openMenuModal());
    document.getElementById('btn-staff').addEventListener('click', () => this.openStaffModal());
    document.getElementById('btn-inventory').addEventListener('click', () => this.openInventoryModal());
    const btnFinishGame = document.getElementById('btn-finish-game');
    if (btnFinishGame) {
      btnFinishGame.addEventListener('click', () => this.openFinishGameModal());
    }
    const btnLeaderboard = document.getElementById('btn-leaderboard');
    if (btnLeaderboard) {
      btnLeaderboard.addEventListener('click', () => this.openLeaderboardModal());
    }
    const btnRep = document.getElementById('btn-reputation');
    if (btnRep) {
      btnRep.addEventListener('click', () => this.openReputationModal());
    }

    const statRep = document.getElementById('stat-reputation');
    if (statRep && statRep.parentElement) {
      statRep.parentElement.style.cursor = 'pointer';
      statRep.parentElement.addEventListener('click', () => this.openReputationModal());
    }

    if (this.questDrawer) {
      this.questDrawer.addEventListener('click', () => {
        this.showQuestsModal();
      });
    }

    document.getElementById('btn-end-day').addEventListener('click', () => this.openEndDayModal());
  }

  initWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const btnStart = document.getElementById('btn-welcome-start');
    const btnLeaderboard = document.getElementById('btn-welcome-leaderboard');
    const btnGuide = document.getElementById('btn-welcome-guide');
    const welcomeSoundToggle = document.getElementById('welcome-sound-toggle');
    const tipTextEl = document.getElementById('welcome-daily-tip-text');

    if (welcomeScreen) {
      const unlockOnAnyInteraction = () => {
        audioEngine.ensureContext().then(() => {
          if (!audioEngine.isMuted && !audioEngine.isModalActive && !audioEngine.isTabHidden) {
            audioEngine.startBGM();
          }
        });
      };
      welcomeScreen.addEventListener('click', unlockOnAnyInteraction);
      welcomeScreen.addEventListener('pointerdown', unlockOnAnyInteraction);
    }

    // Array of helpful daily barista tips
    const tips = [
      "İpucu: Yağmurlu günlerde kahve satışı coşar! Deponuzda taze kahve çekirdeği bulundurun. ☕🌧️",
      "İpucu: Güler Yüzlü personel çalıştırmak her serviste ekstra +0.03 Yıldız kazandırır. 👨‍🍳⭐",
      "İpucu: Tier 2 ve Tier 3 espresso makineleri Instagram'da viral olarak müşteri akışını artırır! 📸✨",
      "İpucu: Her gün saat 23:00'te dükkan kapanır ve günlük kira ile malzeme giderleri hesaplanır. 🌙💰",
      "İpucu: Kafeyi lambalar ve saksı bitkileri ile dekore etmek itibar puanınızı hızla yükseltir. 🪴💡",
      "İpucu: İşletmeci Profilinizi ve Kafe İsminizi dilediğiniz an değiştirebilirsiniz. 👤🏷️"
    ];

    if (tipTextEl) {
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      tipTextEl.innerText = randomTip;
    }

    if (welcomeSoundToggle) {
      welcomeSoundToggle.innerText = audioEngine.isMuted ? '🔇' : '🔊';
      welcomeSoundToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isMuted = audioEngine.toggleMute();
        welcomeSoundToggle.innerText = isMuted ? '🔇' : '🔊';
        const soundBtn = document.getElementById('sound-btn');
        if (soundBtn) soundBtn.innerText = isMuted ? '🔇' : '🔊';
      });
    }

    if (btnLeaderboard) {
      btnLeaderboard.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openLeaderboardModal();
      });
    }

    if (btnGuide) {
      btnGuide.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openGuideModal();
      });
    }

    if (btnStart) {
      btnStart.addEventListener('click', (e) => {
        e.stopPropagation();
        audioEngine.playClick();
        audioEngine.ensureContext();

        if (welcomeScreen) {
          welcomeScreen.classList.add('welcome-fade-out');
          setTimeout(() => {
            welcomeScreen.style.display = 'none';
          }, 600);
        }

        // Check if user has save or needs new game setup
        const hasSave = localStorage.getItem('cafe_tycoon_save');
        if (!hasSave) {
          setTimeout(() => {
            this.startNewGameWizard();
          }, 350);
        } else {
          this.setSpeed(1);
        }
      });
    }
  }

  openGuideModal() {
    audioEngine.playClick();
    const html = `
      <div style="padding: 10px; color: #fff; line-height: 1.6;">
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="font-size: 40px; margin-bottom: 4px;">📖</div>
          <h3 style="color: #ffd54f; font-size: 20px; margin: 0;">Kafe İşletme & Başlangıç Rehberi</h3>
          <p style="font-size: 13px; color: #ccc;">Şehrin en popüler kafesini yönetmek için bilmen gereken 4 temel altın kural:</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
          <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px;">
            <div style="font-size: 15px; font-weight: 800; color: #ffd54f; margin-bottom: 6px;">1. ☕ Sipariş & Servis</div>
            <p style="font-size: 12px; color: #bbb; margin: 0;">Müşteriler masalara oturduğunda sipariş verir. Baristalarınız ürünleri hazırlayıp masaya taşır. Hızlı servis yüksek yıldız kazandırır!</p>
          </div>

          <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px;">
            <div style="font-size: 15px; font-weight: 800; color: #ffd54f; margin-bottom: 6px;">2. 📦 Stok & Depo</div>
            <p style="font-size: 12px; color: #bbb; margin: 0;">Süt, kahve çekirdeği ve un gibi malzemelerinizi "Stok" sekmesinden toptan satın alın. Malzemeleriniz tükenirse siparişler aksar.</p>
          </div>

          <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px;">
            <div style="font-size: 15px; font-weight: 800; color: #ffd54f; margin-bottom: 6px;">3. 👨‍🍳 Personel Yönetimi</div>
            <p style="font-size: 12px; color: #bbb; margin: 0;">Kafeyi tek başınıza yönetemezsiniz! "Personel" sekmesinden Hızlı, Güler Yüzlü veya Çalışkan baristalar işe alın.</p>
          </div>

          <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px;">
            <div style="font-size: 15px; font-weight: 800; color: #ffd54f; margin-bottom: 6px;">4. ☀️ Hava & Müşteri Akışı</div>
            <p style="font-size: 12px; color: #bbb; margin: 0;">Güneşli, yağmurlu veya karlı günlerde müşteri sayıları ve talepleri değişir. Hava durumunu üst bardan takip edin!</p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <button id="btn-guide-close-confirm" style="background: linear-gradient(135deg, #ffb300, #ff8f00); color: #000; font-weight: 800; border: none; padding: 10px 28px; border-radius: 10px; cursor: pointer; font-size: 14px; box-shadow: 0 4px 12px rgba(255, 179, 0, 0.4);">
            Anladım, Oyuna Dön 🚀
          </button>
        </div>
      </div>
    `;

    this.openModal('📖 Nasıl Oynanır? Rehberi', html, '680px');

    const btnCloseConfirm = document.getElementById('btn-guide-close-confirm');
    if (btnCloseConfirm) {
      btnCloseConfirm.addEventListener('click', () => {
        this.closeModal();
      });
    }
  }

  confirmNewGame() {
    audioEngine.playClick();
    const confirmed = window.confirm(
      '🔄 YENİ OYUN BAŞLATILSIN MI?\n\nTüm ilerlemeniz, istatistikleriniz, çalışanlarınız ve bakiyeniz sıfırlanacaktır.\nBaşlangıç bütçeniz 20,000 TL olarak yeniden tanımlanacaktır.'
    );

    if (confirmed) {
      this.startNewGameWizard();
    }
  }

  startNewGameWizard() {
    this.tempUserName = this.gameState.userName || 'Mehmet';
    this.tempNewCafeName = this.gameState.cafeName || 'Ekin Cafe';
    this.openUserNameModal();
  }

  openUserNameModal() {
    audioEngine.playClick();
    const currentUserName = this.tempUserName || this.gameState.userName || 'Mehmet';

    const html = `
      <div style="padding: 16px; text-align: center; color: #fff;">
        <div style="font-size: 44px; margin-bottom: 8px;">👤</div>
        <h3 style="margin-bottom: 8px; color: #ffd54f; font-size: 20px;">İşletmeci Adınız Nedir?</h3>
        <p style="font-size: 13px; color: #ccc; margin-bottom: 24px; line-height: 1.4;">
          Kafe sahibi olarak kullanıcı adınızı girin. Adınız sol üst köşede kafe isminizin altında görüntülenecektir.
        </p>
        <div style="margin-bottom: 24px;">
          <input type="text" id="input-user-name" value="${currentUserName}" 
            placeholder="Örn: Mehmet" 
            style="width: 85%; max-width: 340px; padding: 12px 16px; border-radius: 10px; border: 2px solid #ffb300; background: rgba(0,0,0,0.5); color: #fff; font-size: 16px; font-weight: 700; text-align: center; outline: none; box-shadow: 0 0 10px rgba(255, 179, 0, 0.2);">
        </div>
        <button id="btn-submit-user-name" style="background: linear-gradient(135deg, #2196f3, #1976d2); color: #fff; border: none; padding: 12px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; cursor: pointer; transition: transform 0.15s, filter 0.15s;">
          Devam Et (Kafe Adı) ➡️
        </button>
      </div>
    `;

    this.openModal('👤 İşletmeci Profil Adı', html);

    const inputEl = this.modalBody.querySelector('#input-user-name');
    const submitBtn = this.modalBody.querySelector('#btn-submit-user-name');

    if (inputEl) {
      inputEl.focus();
      inputEl.select();

      inputEl.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          if (submitBtn) submitBtn.click();
        }
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        audioEngine.playClick();
        const enteredUserName = inputEl ? inputEl.value.trim() : '';
        this.tempUserName = enteredUserName || 'Mehmet';
        this.openNewCafeNameModal();
      });
    }
  }

  openNewCafeNameModal() {
    audioEngine.playClick();
    const userName = this.tempUserName || 'Mehmet';
    const currentCafeName = this.tempNewCafeName || this.gameState.cafeName || 'Ekin Cafe';

    const html = `
      <div style="padding: 16px; text-align: center; color: #fff;">
        <div style="font-size: 44px; margin-bottom: 8px;">☕</div>
        <h3 style="margin-bottom: 8px; color: #ffd54f; font-size: 20px;">Sayın ${userName}, Kafenizin İsmi Nedir?</h3>
        <p style="font-size: 13px; color: #ccc; margin-bottom: 24px; line-height: 1.4;">
          Kafenizin ismi sol üst başlık alanında ve müşteri değerlendirmalarında görüntülenecektir.
        </p>
        <div style="margin-bottom: 24px;">
          <input type="text" id="input-new-cafe-name" value="${currentCafeName}" 
            placeholder="Örn: Lezzet Durağı" 
            style="width: 85%; max-width: 340px; padding: 12px 16px; border-radius: 10px; border: 2px solid #ffb300; background: rgba(0,0,0,0.5); color: #fff; font-size: 16px; font-weight: 700; text-align: center; outline: none; box-shadow: 0 0 10px rgba(255, 179, 0, 0.2);">
        </div>
        <button id="btn-submit-cafe-name" style="background: linear-gradient(135deg, #4caf50, #2e7d32); color: #fff; border: none; padding: 12px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; cursor: pointer; transition: transform 0.15s, filter 0.15s;">
          Devam Et (Lokasyon Seçimi) ➡️
        </button>
      </div>
    `;

    this.openModal('☕ Kafe Adı Seçimi', html);

    const inputEl = this.modalBody.querySelector('#input-new-cafe-name');
    const submitBtn = this.modalBody.querySelector('#btn-submit-cafe-name');

    if (inputEl) {
      inputEl.focus();
      inputEl.select();

      inputEl.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          if (submitBtn) submitBtn.click();
        }
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        audioEngine.playClick();
        const enteredName = inputEl ? inputEl.value.trim() : '';
        this.tempNewCafeName = enteredName || 'Ekin Cafe';
        this.openLocationSelectionModal();
      });
    }
  }

  openLocationSelectionModal() {
    audioEngine.playClick();
    const userName = this.tempUserName || 'Mehmet';
    const cafeName = this.tempNewCafeName || 'Ekin Cafe';
    const locations = LOCATIONS;

    const demoLabels = {
      student: '🎓 Öğrenci',
      office_worker: '💼 Ofis',
      freelancer: '💻 Yazılımcı',
      tourist: '📸 Turist',
      influencer: '📱 Influencer',
      hipster: '🎨 Sanatçı',
      athlete: '🏃 Sporcu',
      senior: '👴 Müdavim',
      goth: '🎸 Rockçı',
      executive: '👔 CEO'
    };

    let cardsHtml = '';
    Object.values(locations).forEach(loc => {
      const topDemosHtml = Object.entries(loc.demographics || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([t, w]) => `<span style="background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); font-size: 10px; color: #e0e0e0;">${demoLabels[t] || t} %${Math.round(w * 100)}</span>`)
        .join(' ');

      cardsHtml += `
        <div class="location-card glass-panel" style="background: rgba(30, 35, 45, 0.75); border: 1.5px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 26px;">${loc.icon}</span>
              <span style="font-size: 11px; background: rgba(255, 213, 79, 0.15); border: 1px solid rgba(255, 213, 79, 0.4); padding: 4px 8px; border-radius: 6px; color: #ffd54f; font-weight: 700;">${loc.rent.toLocaleString()} TL / Gün Kira</span>
            </div>
            <h4 style="margin: 0 0 6px 0; color: #fff; font-size: 15px; font-weight: 700;">${loc.name}</h4>
            <p style="font-size: 11.5px; color: #bbb; margin: 0 0 10px 0; line-height: 1.4;">${loc.description}</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; background: rgba(0,0,0,0.3); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
              <div>⚡ Müşteri Akışı: <b style="color:#4caf50;">${loc.trafficMultiplier}x</b></div>
              <div>💰 Harcama Gücü: <b style="color:${loc.spendingPower >= 1.3 ? '#4caf50' : (loc.spendingPower < 1.0 ? '#ff9800' : '#2196f3')};">${loc.spendingPower}x</b></div>
              <div style="grid-column: span 2;">⚖️ Fiyat Duyarlılığı: <b style="color:${loc.priceSensitivity >= 1.2 ? '#f44336' : (loc.priceSensitivity <= 0.7 ? '#4caf50' : '#ff9800')};">${loc.priceSensitivity >= 1.2 ? 'Çok Yüksek (Duyarlı)' : (loc.priceSensitivity <= 0.7 ? 'Düşük (Toleranslı)' : 'Dengeli')}</b></div>
              <div style="grid-column: span 2; display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; align-items: center;"><span style="color:#aaa; font-size: 10.5px; width: 100%;">👥 Müşteri Kitle Yapısı:</span> ${topDemosHtml}</div>
            </div>
          </div>
          
          <button class="btn-select-location" data-loc-id="${loc.id}" style="width: 100%; padding: 10px; border-radius: 8px; border: none; background: linear-gradient(135deg, #2196f3, #1976d2); color: #fff; font-weight: 700; font-size: 13px; cursor: pointer; transition: transform 0.15s, filter 0.15s;">
            Bu Lokasyonda Başla 🚀
          </button>
        </div>
      `;
    });

    const html = `
      <div style="padding: 10px; color: #fff;">
        <p style="font-size: 13px; color: #ccc; margin-bottom: 14px; text-align: center;">
          Sayın <strong>${userName}</strong>, '<strong>${cafeName}</strong>' kafenizi hangi stratejik bölgede kurmak istersiniz?
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; max-height: 480px; overflow-y: auto; padding-right: 4px;">
          ${cardsHtml}
        </div>
      </div>
    `;

    this.openModal('🗺️ Lokasyon Seçimi ve Oyuna Başla', html);

    const locBtns = this.modalBody.querySelectorAll('.btn-select-location');
    locBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        audioEngine.playClick();
        const selectedLocId = e.currentTarget.getAttribute('data-loc-id');
        const finalCafeName = this.tempNewCafeName || 'Ekin Cafe';
        const finalUserName = this.tempUserName || 'Mehmet';

        this.forceCloseModal();

        this.gameState.resetGame(20000, finalCafeName, selectedLocId, finalUserName);
        this.setSpeed(1);
        audioEngine.playLevelUp();

        this.updateHUD();
        this.gameState.saveToLocalStorage();

        if (this.renderer) {
          this.renderer.selectedItem = null;
          this.renderer.buildModeItem = null;
          this.renderer.particles = [];
          this.renderer.render(this.gameState, this.gameState.gridManager);
        }

        const chosenLoc = LOCATIONS[selectedLocId] || LOCATIONS.university;
        this.addNotification(`🚀 Hoş geldin ${finalUserName}! ${finalCafeName} kafeniz ${chosenLoc.name} lokasyonunda kuruldu. Bol kazançlar! 🎉`, '🚀', 'praise');
      });
    });
  }

  openReputationModal() {
    audioEngine.playClick();

    const rep = this.gameState.reputation;
    const hasCharmerStaff = this.gameState.employees && this.gameState.employees.some(e => e.trait && (e.trait.name === 'Güler Yüzlü' || e.traitKey === 'CHARMER'));
    const decorItems = this.gameState.gridManager ? this.gameState.gridManager.items.filter(it => {
      return ['PLANT_MONSTERA', 'PLANT_FICUS', 'LAMP_VINTAGE', 'BOOKSHELF', 'WIFI_STATION'].includes(it.id);
    }) : [];

    const charmerBonusActive = hasCharmerStaff;
    const decorBonusActive = decorItems.length > 0;
    const totalServisGain = 0.05 + (charmerBonusActive ? 0.03 : 0) + (decorBonusActive ? 0.02 : 0);

    let html = `
      <div style="padding: 6px 10px; color: #eee;">
        <!-- TOP SUMMARY HEADER -->
        <div style="background: rgba(255, 213, 79, 0.12); border: 1px solid rgba(255, 213, 79, 0.4); border-radius: 12px; padding: 14px; text-align: center; margin-bottom: 16px;">
          <div style="font-size: 12px; color: #ffd54f; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Mevcut Kafe İtibarı</div>
          <div style="font-size: 32px; font-weight: 800; color: #ffffff; margin: 4px 0;">${rep.toFixed(1)} ⭐</div>
          <div style="font-size: 12px; color: #ccc;">Servis Başına Yıldız Kazanımı: <b style="color:#4caf50;">+${totalServisGain.toFixed(2)} ⭐</b></div>
        </div>

        <!-- ACTIVE BONUSES SECTION -->
        <div style="margin-bottom: 16px;">
          <h4 style="font-size: 13.5px; color: #ffd54f; margin-bottom: 8px;">✨ Aktif Yıldız Bonusların</h4>
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
            <div style="background: rgba(0,0,0,0.3); padding: 10px 12px; border-radius: 8px; border: 1px solid ${charmerBonusActive ? 'rgba(76, 175, 80, 0.4)' : 'rgba(255,255,255,0.08)'}; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <b>👨‍🍳 Güler Yüzlü Personel Bonusu</b>
                <div style="font-size: 11px; color: #aaa;">"Güler Yüzlü" özelliğinde barista çalıştırma.</div>
              </div>
              <span style="font-weight:700; font-size:11.5px; color:${charmerBonusActive ? '#4caf50' : '#ff9800'};">${charmerBonusActive ? '+0.03 ⭐ (Aktif)' : 'Pasif'}</span>
            </div>

            <div style="background: rgba(0,0,0,0.3); padding: 10px 12px; border-radius: 8px; border: 1px solid ${decorBonusActive ? 'rgba(76, 175, 80, 0.4)' : 'rgba(255,255,255,0.08)'}; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <b>🪴 Ambiyans & Dekorasyon Bonusu</b>
                <div style="font-size: 11px; color: #aaa;">Kafede ${decorItems.length} adet bitki/lamba yerleştirildi.</div>
              </div>
              <span style="font-weight:700; font-size:11.5px; color:${decorBonusActive ? '#4caf50' : '#ff9800'};">${decorBonusActive ? '+0.02 ⭐ (Aktif)' : 'Pasif'}</span>
            </div>

            <div style="background: rgba(0,0,0,0.3); padding: 10px 12px; border-radius: 8px; border: 1px solid ${getHighestEquipmentTier(this.gameState.gridManager) >= 2 ? 'rgba(76, 175, 80, 0.4)' : 'rgba(255,255,255,0.08)'}; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <b>📸 Lüks Makine & Instagram Virali</b>
                <div style="font-size: 11px; color: #aaa;">Tier 2 (+%5) veya Tier 3 (+%10) Instagram paylaşım katkısı (Maks %30 tavan).</div>
              </div>
              <span style="font-weight:700; font-size:11.5px; color:${getHighestEquipmentTier(this.gameState.gridManager) >= 2 ? '#4caf50' : '#ff9800'};">${getHighestEquipmentTier(this.gameState.gridManager) >= 2 ? `+${getHighestEquipmentTier(this.gameState.gridManager) === 3 ? '0.15' : '0.08'} ⭐ (Aktif)` : 'Pasif'}</span>
            </div>
          </div>
        </div>

        <!-- REPUTATION MECHANICS GUIDE -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 11.5px;">
          <!-- HOW TO EARN STARS -->
          <div style="background: rgba(76, 175, 80, 0.08); border: 1px solid rgba(76, 175, 80, 0.25); border-radius: 10px; padding: 10px 12px;">
            <h5 style="color: #4caf50; font-size: 12.5px; margin-bottom: 6px; display:flex; align-items:center; gap:4px;">📈 Nasıl Yıldız Kazanılır?</h5>
            <ul style="padding-left: 14px; margin: 0; line-height: 1.5; color: #ddd;">
              <li><b>+0.05 ⭐</b> Müşteriye zamanında servis sunmak.</li>
              <li><b>+0.03 ⭐</b> "Güler Yüzlü" personel çalıştırmak.</li>
              <li><b>+0.02 ⭐</b> Bitki ve lambalarla dekore etmek.</li>
              <li><b>+0.08 - 0.15 ⭐</b> Tier 2/3 Makine ile Instagram virali! 📸</li>
            </ul>
          </div>

          <!-- HOW TO LOSE STARS -->
          <div style="background: rgba(244, 67, 54, 0.08); border: 1px solid rgba(244, 67, 54, 0.25); border-radius: 10px; padding: 10px 12px;">
            <h5 style="color: #ff5252; font-size: 12.5px; margin-bottom: 6px; display:flex; align-items:center; gap:4px;">📉 Yıldız Nasıl Düşer?</h5>
            <ul style="padding-left: 14px; margin: 0; line-height: 1.5; color: #ddd;">
              <li><b>-0.10 ⭐</b> Siparişin gecikip müşterinin kızması.</li>
              <li><b>-0.10 ⭐</b> Sandalye olmaması veya yolun kapalı kalması.</li>
              <li><b>-0.05 ⭐</b> İstenen ürünün kilitli olması.</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    this.openModal('⭐ İtibar & Yıldız Derecesi Rehberi', html);
  }

  showQuestsModal() {
    audioEngine.playClick();

    if (!this.questManager) return;

    const currentIndex = this.questManager.currentQuestIndex;
    const totalQuests = QUESTS.length;
    const completedCount = Math.min(currentIndex, totalQuests);

    let questListHTML = '';

    QUESTS.forEach((q, idx) => {
      const isCompleted = idx < currentIndex;
      const isActive = idx === currentIndex;
      const isLocked = idx > currentIndex;

      let cardStyle = '';
      let badgeHTML = '';
      let itemIDAttr = '';
      let progressText = '';

      if (isActive) {
        cardStyle = `background: linear-gradient(135deg, rgba(255, 179, 0, 0.22), rgba(255, 111, 0, 0.12)); border: 2px solid #ffb300; box-shadow: 0 0 16px rgba(255, 179, 0, 0.35); position: relative; border-radius: 12px; padding: 14px; transform: scale(1.01);`;
        badgeHTML = `<span style="background: #ffb300; color: #000; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 0 8px rgba(255,179,0,0.5);">⚡ AKTİF GÖREV</span>`;
        itemIDAttr = 'id="active-quest-item"';
        progressText = `<div style="margin-top: 8px; font-size: 13px; font-weight: 700; color: #ffd54f; display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.3); padding: 6px 12px; border-radius: 8px;">
          <span>İlerleme Durumu:</span>
          <span>${this.questManager.getFormattedProgress()}</span>
        </div>`;
      } else if (isCompleted) {
        cardStyle = `background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(76, 175, 80, 0.35); opacity: 0.55; border-radius: 12px; padding: 12px; transition: opacity 0.2s;`;
        badgeHTML = `<span style="background: rgba(76, 175, 80, 0.2); color: #81c784; border: 1px solid rgba(76, 175, 80, 0.4); padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;">✅ TAMAMLANDI</span>`;
      } else {
        cardStyle = `background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.08); opacity: 0.75; border-radius: 12px; padding: 12px;`;
        badgeHTML = `<span style="background: rgba(255, 255, 255, 0.08); color: #aaa; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">🔒 KİLİTLİ</span>`;
      }

      const rewardMoneyText = q.rewardMoney.toLocaleString('tr-TR');
      const rewardXPText = q.rewardXP.toLocaleString('tr-TR');

      const titleStyle = isCompleted
        ? 'color: #a5d6a7; text-decoration: line-through; opacity: 0.9; font-weight: 600;'
        : (isActive ? 'color: #fff; font-weight: 800; font-size: 16px;' : 'color: #eee; font-weight: 700;');

      const descStyle = isCompleted ? 'color: #888; font-size: 12px;' : 'color: #bbb; font-size: 13px;';

      questListHTML += `
        <div ${itemIDAttr} class="quest-list-card" style="${cardStyle}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; gap: 8px;">
            <div style="${titleStyle}">${q.title}</div>
            <div>${badgeHTML}</div>
          </div>
          <div style="${descStyle} margin-bottom: 8px;">${q.desc}</div>
          ${progressText}
          <div style="display: flex; gap: 12px; font-size: 12px; margin-top: 8px; font-weight: 700;">
            <span style="background: rgba(156, 39, 176, 0.2); border: 1px solid rgba(156, 39, 176, 0.4); color: #e1bee7; padding: 3px 8px; border-radius: 6px;">
              🏆 +${rewardXPText} XP
            </span>
            <span style="background: rgba(255, 179, 0, 0.2); border: 1px solid rgba(255, 179, 0, 0.4); color: #ffe082; padding: 3px 8px; border-radius: 6px;">
              💰 +${rewardMoneyText} TL
            </span>
          </div>
        </div>
      `;
    });

    const progressPercentage = Math.round((completedCount / totalQuests) * 100);

    const html = `
      <div style="padding: 6px 4px; color: #fff;">
        <!-- TOP SUMMARY HEADER -->
        <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px 16px; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 700; font-size: 15px; color: #ffd54f;">🎯 Görev İlerlemesi</span>
            <span style="font-weight: 800; font-size: 14px; color: #fff;">${completedCount} / ${totalQuests} Görev (${progressPercentage}%)</span>
          </div>
          <div style="width: 100%; height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden;">
            <div style="width: ${progressPercentage}%; height: 100%; background: linear-gradient(90deg, #4caf50, #ffb300); transition: width 0.3s;"></div>
          </div>
          <div style="font-size: 12px; color: #aaa; margin-top: 8px; text-align: center;">
            💡 Sol üst köşedeki görev kutucuğuna tıklayarak istediğin zaman tüm görevleri inceleyebilirsin.
          </div>
        </div>

        <!-- QUEST LIST CONTAINER -->
        <div id="quest-modal-list-container" style="max-height: 480px; overflow-y: auto; padding-right: 6px; display: flex; flex-direction: column; gap: 10px;">
          ${questListHTML}
        </div>
      </div>
    `;

    this.openModal('📋 Kafe Görevleri & Ödül Listesi (1-50)', html, '750px');

    // Auto-scroll container to active quest item
    setTimeout(() => {
      const container = document.getElementById('quest-modal-list-container');
      const activeItem = document.getElementById('active-quest-item');
      if (container && activeItem) {
        const topPos = activeItem.offsetTop - container.offsetTop - 20;
        container.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
      }
    }, 100);
  }

  setSpeed(speed) {
    audioEngine.playClick();
    this.gameState.gameSpeed = speed;
    if (speed === 0) {
      audioEngine.pauseBGM();
    } else if (!audioEngine.isModalActive) {
      audioEngine.pauseBGM();
      audioEngine.startBGM();
    }
    ['pause', '1x', '2x', '3x'].forEach((s, idx) => {
      const btn = document.getElementById(`speed-${s}`);
      if (btn) {
        if (idx === speed) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });
  }

  updateHUD() {
    document.getElementById('cafe-name').innerText = this.gameState.cafeName;
    const elUserName = document.getElementById('user-name');
    if (elUserName) {
      elUserName.innerText = `İşletmeci: ${this.gameState.userName || 'Mehmet'}`;
    }
    document.getElementById('stat-money').innerText = `${Math.floor(this.gameState.economy.money).toLocaleString()} TL`;
    document.getElementById('stat-daily-profit').innerText = `${this.gameState.economy.dailyRevenue >= 0 ? '+' : ''}${Math.floor(this.gameState.economy.dailyRevenue)} TL`;
    
    const customerSys = this.customerSystem || (this.gameState && this.gameState.customerSystem);
    const elFreq = document.getElementById('stat-customer-frequency');
    if (elFreq && customerSys) {
      elFreq.innerText = customerSys.getFormattedFrequency();
    }
    if (this.flowPopoverEl && this.flowPopoverEl.classList.contains('active')) {
      this.updateFlowBreakdownPopover();
    }

    document.getElementById('stat-reputation').innerText = `${this.gameState.reputation.toFixed(1)} ⭐`;
    document.getElementById('stat-level').innerText = `Seviye ${this.gameState.level}`;
    document.getElementById('time-display').innerText = this.gameState.formattedTime;

    if (this.weatherManager || (this.gameState && this.gameState.weatherManager)) {
      const wm = this.weatherManager || this.gameState.weatherManager;
      this.updateWeatherHUD(wm.currentWeather);
    }

    // Staff Absence Spotlight Pulse Check (Highlight Staff button if no staff hired)
    const btnStaff = document.getElementById('btn-staff');
    if (btnStaff) {
      const hasStaff = this.gameState.employees && this.gameState.employees.length > 0;
      if (!hasStaff) {
        btnStaff.classList.add('btn-pulse-glow');
      } else {
        btnStaff.classList.remove('btn-pulse-glow');
      }
    }

    // Quest UI Update
    if (this.questManager) {
      if (this.questManager.isAllCompleted) {
        if (this.questDrawer) this.questDrawer.style.display = 'none';
      } else if (!this.questManager.isCompleting) {
        if (this.questDrawer) this.questDrawer.style.display = 'flex';

        const q = this.questManager.currentQuest;
        if (q) {
          const qNum = document.getElementById('quest-number');
          const qProg = document.getElementById('quest-progress');
          if (qNum) qNum.innerText = `GÖREV ${this.questManager.currentQuestIndex + 1} / ${this.questManager.totalQuests}`;
          if (qProg) qProg.innerText = this.questManager.getFormattedProgress();
          document.getElementById('quest-title').innerText = q.title;
          document.getElementById('quest-desc').innerText = q.desc;
          document.getElementById('reward-xp').innerText = `+${q.rewardXP} XP`;
          document.getElementById('reward-money').innerText = `+${q.rewardMoney} TL`;
        }
      }
    }

    // Check stock depletions for left warning column
    this.checkStockDepletions();

    // Update right sidebar kitchen queue drawer
    this.updateKitchenQueue();

    // Update object selection & sell popover position
    this.updateObjectSellPopover();
  }

  updateWeatherHUD(weather) {
    if (!weather) return;
    const iconEl = document.getElementById('weather-icon');
    const displayEl = document.getElementById('weather-display');
    const pillEl = document.getElementById('weather-pill');

    if (iconEl && displayEl) {
      iconEl.textContent = weather.icon;
      displayEl.textContent = `${weather.name.split(' ')[0]} ${weather.temp}°C`;
      displayEl.style.color = weather.color || '#ffd54f';
      if (pillEl) {
        pillEl.style.borderColor = weather.color || 'rgba(255, 213, 79, 0.4)';
        pillEl.style.background = weather.id === 'RAINY'
          ? 'rgba(33, 150, 243, 0.2)'
          : (weather.id === 'SNOWY' ? 'rgba(0, 188, 212, 0.2)' : 'rgba(255, 213, 79, 0.15)');
        pillEl.title = `Dış Mekan: ${weather.name} (${weather.temp}°C) - Detaylı Müşteri Etkisi İçin Tıklayın/Hover Yapın ☀️`;
      }
    }

    if (this.weatherPopoverEl && this.weatherPopoverEl.classList.contains('active')) {
      this.updateWeatherPopover();
    }
  }

  updateKitchenQueue() {
    const kitchenList = document.getElementById('kitchen-list');
    const noKitchenMsg = document.getElementById('no-kitchen-msg');
    if (!kitchenList) return;

    const employees = this.gameState.employees || [];
    const activeOrders = [];

    employees.forEach(emp => {
      if (emp.currentRecipe && (emp.state === 'TAKING_ORDER' || emp.state === 'BREWING' || emp.state === 'CARRYING')) {
        const prepTotal = emp.currentRecipe.prepTime || 3.0;
        let pct = 0;
        let statusText = '';

        if (emp.state === 'TAKING_ORDER') {
          pct = 10;
          statusText = 'Sipariş alınıyor... 📝';
        } else if (emp.state === 'BREWING') {
          pct = Math.min(100, Math.floor((emp.brewTimer / prepTotal) * 100));
          statusText = `Hazırlanıyor (%${pct}) • ${emp.name}`;
        } else if (emp.state === 'CARRYING') {
          pct = 100;
          statusText = `Masaya taşınıyor... 🏃 • ${emp.name}`;
        }

        const icon = emp.currentRecipe.category === 'bakery' ? '🥐' : '☕';

        activeOrders.push({
          empId: emp.id,
          name: emp.currentRecipe.name,
          icon,
          pct,
          statusText
        });
      }
    });

    if (activeOrders.length === 0) {
      if (noKitchenMsg) noKitchenMsg.style.display = 'block';
      kitchenList.querySelectorAll('.kitchen-card').forEach(card => card.remove());
      return;
    }

    if (noKitchenMsg) noKitchenMsg.style.display = 'none';

    // Track active card DOM elements
    const existingCards = new Map();
    kitchenList.querySelectorAll('.kitchen-card').forEach(card => {
      existingCards.set(card.dataset.empId, card);
    });

    activeOrders.forEach(order => {
      let card = existingCards.get(order.empId);
      if (!card) {
        card = document.createElement('div');
        card.className = 'kitchen-card';
        card.dataset.empId = order.empId;
        card.innerHTML = `
          <div class="kitchen-card-header">
            <span>${order.icon} ${order.name}</span>
          </div>
          <div class="kitchen-card-status">
            <span class="status-txt">${order.statusText}</span>
          </div>
          <div class="kitchen-progress-bg">
            <div class="kitchen-progress-fill" style="width: ${order.pct}%;"></div>
          </div>
        `;
        kitchenList.appendChild(card);
      } else {
        const statusTxt = card.querySelector('.status-txt');
        const fill = card.querySelector('.kitchen-progress-fill');
        if (statusTxt) statusTxt.innerText = order.statusText;
        if (fill) fill.style.width = `${order.pct}%`;
        existingCards.delete(order.empId);
      }
    });

    // Remove old cards no longer active
    existingCards.forEach(card => card.remove());
  }

  initObjectSellPopover() {
    this.popoverEl = document.getElementById('object-sell-popover');
    this.popoverTitleEl = document.getElementById('popover-item-name');
    this.popoverPriceEl = document.getElementById('popover-sell-price');
    this.popoverRepairPriceEl = document.getElementById('popover-repair-price');
    this.popoverRepairLabelEl = document.getElementById('popover-repair-label');
    this.btnSellEl = document.getElementById('btn-sell-item');
    this.btnRepairEl = document.getElementById('btn-repair-item');
    this.btnMoveEl = document.getElementById('btn-move-item');
    this.btnClosePopoverEl = document.getElementById('popover-close-btn');

    if (this.popoverEl) {
      this.popoverEl.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    if (this.btnClosePopoverEl) {
      this.btnClosePopoverEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.renderer) this.renderer.selectedItem = null;
      });
    }

    if (this.btnMoveEl) {
      this.btnMoveEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = this.renderer ? this.renderer.selectedItem : null;
        if (!item) return;

        const inUse = isItemInUse(item, this.gameState);
        if (inUse) {
          audioEngine.playClick();
          if (this.renderer) {
            this.renderer.addParticle(item.x, item.y, 'Bu objeyi şu an müşteri kullanıyor! 🛑', '#f44336');
          }
          this.addNotification('Bu objeyi şu an müşteri kullanıyor! 🛑', '🛑', 4000);
          return;
        }

        audioEngine.playClick();
        if (this.renderer) {
          this.renderer.movingItem = {
            item,
            origX: item.x,
            origY: item.y,
            origRotation: item.rotation || 0
          };
          this.renderer.addParticle(item.x, item.y, 'Taşınacak Konumu Seç... 🚚', '#2196f3');
          this.renderer.selectedItem = null;
        }
        this.addNotification('🚚 Objeyi taşımak istediğiniz yeni karo üzerine tıklayın (İptal için ESC).', '🚚', 4000);
        this.updateObjectSellPopover();
      });
    }

    if (this.btnRepairEl) {
      this.btnRepairEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = this.renderer ? this.renderer.selectedItem : null;
        if (!item || !item.isBroken || item.isUnderRepair) return;

        const itemDef = ITEM_CATALOG[item.id];
        if (!itemDef) return;

        const repairCost = getRepairCost(item);

        if (this.gameState.economy.money < repairCost) {
          audioEngine.playClick();
          if (this.renderer) {
            this.renderer.addParticle(item.x, item.y, 'Yetersiz Bakiye! 🛑', '#f44336');
          }
          this.addNotification(`Yetersiz bakiye! Tamir ücreti: ${repairCost.toLocaleString()} TL 🛑`, '🛑', 4000);
          return;
        }

        // Deduct money and dispatch repairman
        this.gameState.economy.spendMoney(repairCost, `Tamir Ücreti: ${itemDef.name}`);
        audioEngine.playChaChing();

        item.isUnderRepair = true;

        if (this.gameState.repairmanSystem) {
          this.gameState.repairmanSystem.dispatchRepairman(item);
        }

        if (this.renderer) {
          this.renderer.addParticle(item.x, item.y, `-${repairCost.toLocaleString()} TL 🔧`, '#ff9800');
          this.renderer.selectedItem = null; // Deselect item so popover closes window!
        }

        this.addNotification(`🔧 Usta Tamirci çağrıldı! ${itemDef.name} tamir ediliyor...`, '🔧', 4000);
        this.updateObjectSellPopover();
      });
    }

    if (this.btnSellEl) {
      this.btnSellEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = this.renderer ? this.renderer.selectedItem : null;
        if (!item) return;

        const inUse = isItemInUse(item, this.gameState);
        if (inUse) {
          audioEngine.playClick();
          if (this.renderer) {
            this.renderer.addParticle(item.x, item.y, 'bu objeyi şu an müşteri kullanıyor! 🛑', '#f44336');
          }
          this.addNotification('bu objeyi şu an müşteri kullanıyor! 🛑', '🛑', 4000);
          return;
        }

        const itemDef = ITEM_CATALOG[item.id];
        if (itemDef) {
          const sellPrice = Math.floor(itemDef.price / 4);
          this.gameState.gridManager.removeItem(item.uid);
          this.gameState.economy.addMoney(sellPrice, `Eşya Satışı: ${itemDef.name}`);
          audioEngine.playChaChing();

          // Check if selling REFRIGERATOR_STAINLESS wipes canned drink stock
          if (item.id === 'REFRIGERATOR_STAINLESS') {
            const hasFridge = this.gameState.gridManager.hasDoubleDoorFridge();
            if (!hasFridge) {
              const wipedCount = this.gameState.economy.clearCannedDrinks();
              if (this.renderer) {
                this.renderer.addParticle(item.x, item.y, 'Soğuk İçecek Stokları Silindi! 🗑️', '#f44336');
              }
              this.addNotification(`⚠️ Çift Kapılı İçecek Dolabı Satıldı! Dolap kalmadığı için eldeki (${wipedCount} kutu) meşrubat stoku ziyan oldu ve sıfırlandı! 🗑️`, '🗑️', 6000);
            }
          }

          if (this.renderer) {
            this.renderer.addParticle(item.x, item.y, `+${sellPrice} TL 💰`, '#ffd54f');
            this.renderer.selectedItem = null;
          }
          this.gameState.saveToLocalStorage();
        }
      });
    }
  }

  updateObjectSellPopover() {
    if (!this.popoverEl || !this.renderer) return;

    const item = this.renderer.selectedItem;
    if (!item) {
      this.popoverEl.classList.remove('active');
      this.popoverEl.style.display = 'none';
      return;
    }

    const itemDef = ITEM_CATALOG[item.id];
    if (!itemDef) {
      this.popoverEl.classList.remove('active');
      this.popoverEl.style.display = 'none';
      return;
    }

    const sellPrice = Math.floor(itemDef.price / 4);
    const repairCost = getRepairCost(item);

    const titleText = item.isBroken ? `🔧 ${itemDef.name} (BOZUK)` : itemDef.name;
    if (this.popoverTitleEl && this.popoverTitleEl.innerText !== titleText) {
      this.popoverTitleEl.innerText = titleText;
    }
    if (this.popoverPriceEl && this.popoverPriceEl.innerText !== sellPrice.toLocaleString()) {
      this.popoverPriceEl.innerText = sellPrice.toLocaleString();
    }

    // Show/Hide Repair button without destroying DOM innerHTML
    if (this.btnRepairEl) {
      if (item.isBroken) {
        this.btnRepairEl.style.display = 'flex';
        if (item.isUnderRepair) {
          this.btnRepairEl.classList.add('disabled');
          if (this.popoverRepairLabelEl && this.popoverRepairLabelEl.innerText !== 'Tamir Ediliyor...') {
            this.popoverRepairLabelEl.innerText = 'Tamir Ediliyor...';
          }
          this.btnRepairEl.title = 'Usta tamirci yolda veya tamir ediyor...';
        } else {
          this.btnRepairEl.classList.remove('disabled');
          const labelText = `Tamir Et (${repairCost.toLocaleString()} TL)`;
          if (this.popoverRepairLabelEl && this.popoverRepairLabelEl.innerText !== labelText) {
            this.popoverRepairLabelEl.innerText = labelText;
          }
          this.btnRepairEl.title = `${repairCost.toLocaleString()} TL ödeyerek usta tamirci çağır`;
        }
      } else {
        this.btnRepairEl.style.display = 'none';
      }
    }

    // Calculate isometric screen position above item
    const screenPos = this.renderer.gridToScreen(item.x, item.y);
    this.popoverEl.style.left = `${screenPos.x}px`;
    this.popoverEl.style.top = `${screenPos.y - 45}px`;
    this.popoverEl.style.display = 'flex';
    this.popoverEl.classList.add('active');

    // Check if item is in use by customer or employee
    const inUse = !item.isBroken && isItemInUse(item, this.gameState);
    if (inUse) {
      this.btnSellEl.classList.add('disabled');
      this.btnSellEl.title = 'bu objeyi şu an müşteri kullanıyor';
    } else {
      this.btnSellEl.classList.remove('disabled');
      this.btnSellEl.title = item.isBroken ? `Hurda olarak sat ve ${sellPrice} TL bakiye kazan` : `Sat ve ${sellPrice} TL geri al`;
    }
  }

  positionFlowBreakdownPopover() {
    if (!this.statPillEl || !this.flowPopoverEl) return;
    const rect = this.statPillEl.getBoundingClientRect();
    this.flowPopoverEl.style.position = 'fixed';
    this.flowPopoverEl.style.top = `${rect.bottom + 8}px`;
    this.flowPopoverEl.style.left = `${Math.max(10, rect.left - 30)}px`;
  }

  initFlowBreakdownPopover() {
    this.flowPopoverEl = document.getElementById('flow-breakdown-popover');
    this.statPillEl = document.getElementById('stat-pill-customer-frequency');

    if (!this.statPillEl || !this.flowPopoverEl) return;

    let popoverPinned = false;

    this.statPillEl.addEventListener('mouseenter', () => {
      this.positionFlowBreakdownPopover();
      this.updateFlowBreakdownPopover();
      this.flowPopoverEl.classList.add('active');
    });

    this.statPillEl.addEventListener('mouseleave', () => {
      if (!popoverPinned) {
        this.flowPopoverEl.classList.remove('active');
      }
    });

    this.statPillEl.addEventListener('click', (e) => {
      e.stopPropagation();
      popoverPinned = !popoverPinned;
      this.positionFlowBreakdownPopover();
      this.updateFlowBreakdownPopover();
      if (popoverPinned) {
        this.flowPopoverEl.classList.add('active');
      } else {
        this.flowPopoverEl.classList.remove('active');
      }
    });

    document.addEventListener('click', (e) => {
      if (popoverPinned && !this.flowPopoverEl.contains(e.target) && !this.statPillEl.contains(e.target)) {
        popoverPinned = false;
        this.flowPopoverEl.classList.remove('active');
      }
    });
  }

  updateFlowBreakdownPopover() {
    if (!this.flowPopoverEl) return;
    const customerSys = this.customerSystem || (this.gameState && this.gameState.customerSystem);
    if (!customerSys) return;

    const data = customerSys.getFlowBreakdownData();
    if (!data) return;

    const isPeakText = data.isPeak ? '🔥 Zirve Saat (Yoğun Trafik)' : '🌙 Sakin Saat (Normal Trafik)';
    const isPeakClass = data.isPeak ? 'green' : 'gold';
    const priceText = data.priceRatio > 1.05 
      ? `⚠️ %${Math.round((data.priceRatio - 1) * 100)} Pahalı (Trafik Düşüyor)` 
      : data.priceRatio < 0.95 
        ? `✅ %${Math.round((1 - data.priceRatio) * 100)} İndirimli (Trafik Artıyor)` 
        : '✅ Standart Fiyatlar (Nötr)';
    const priceClass = data.priceRatio > 1.05 ? 'red' : 'green';

    this.flowPopoverEl.innerHTML = `
      <div class="popover-header" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 4px;">
        <span class="popover-title" style="font-size: 14px; font-weight: 800; color: #ffd54f;">⚡ Müşteri Akışı Analizi</span>
        <span style="font-size: 11px; background: rgba(255,213,79,0.15); color: #ffd54f; padding: 2px 8px; border-radius: 12px; font-weight: 700;">${data.label}</span>
      </div>
      
      <div style="font-size: 13px; font-weight: 700; color: #64b5f6; margin-bottom: 6px;">
        ⏱️ Her <strong>${data.gameMinutes} dk'da 1</strong> müşteri kafeden içeri girer.
      </div>

      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #d0d7de;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>📍 Lokasyon Trafik Çarpanı (${data.locIcon} ${data.locName}):</span>
          <span style="font-weight: 700; color: #81c784;">x${data.trafficMultiplier.toFixed(1)}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>⭐ Kafe İtibar Etkisi (${data.rep.toFixed(1)} Yıldız):</span>
          <span style="font-weight: 700; color: ${data.repBonusPct >= 0 ? '#81c784' : '#e57373'};">${data.repBonusPct >= 0 ? '+' : ''}${data.repBonusPct}% Trafik</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>👨‍🍳 Garson / Personel Etkisi (${data.staffCount} Kişi):</span>
          <span style="font-weight: 700; color: #81c784;">+${data.staffBonusPct}% Hızlı Akış</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>${data.weatherIcon || '☀️'} Hava Durumu Etkisi (${data.weatherName || 'Güneşli'}):</span>
          <span style="font-weight: 700; color: ${(data.weatherBonusPct || 0) > 0 ? '#81c784' : '#ffd54f'};">
            ${(data.weatherBonusPct || 0) > 0 ? `+${data.weatherBonusPct}% Hızlı Sığınma 🏃` : 'Standart (Nötr)'}
          </span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>🏷️ Menü Fiyat Politikası:</span>
          <span style="font-weight: 700;" class="${priceClass}">${priceText}</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 6px; margin-top: 2px;">
          <span>⏰ Zaman Dilimi Modu:</span>
          <span style="font-weight: 700;" class="${isPeakClass}">${isPeakText}</span>
        </div>
      </div>
    `;
  }

  positionWeatherPopover() {
    if (!this.weatherPillEl) this.weatherPillEl = document.getElementById('weather-pill');
    if (!this.weatherPopoverEl) this.weatherPopoverEl = document.getElementById('weather-breakdown-popover');
    if (!this.weatherPillEl || !this.weatherPopoverEl) return;

    const rect = this.weatherPillEl.getBoundingClientRect();
    this.weatherPopoverEl.style.position = 'fixed';
    this.weatherPopoverEl.style.top = `${rect.bottom + 8}px`;
    this.weatherPopoverEl.style.left = `${Math.max(10, rect.left - 50)}px`;
  }

  initWeatherPopover() {
    this.weatherPopoverEl = document.getElementById('weather-breakdown-popover');
    this.weatherPillEl = document.getElementById('weather-pill');

    if (!this.weatherPillEl || !this.weatherPopoverEl) return;

    let weatherPinned = false;

    this.weatherPillEl.addEventListener('mouseenter', () => {
      this.positionWeatherPopover();
      this.updateWeatherPopover();
      this.weatherPopoverEl.classList.add('active');
    });

    this.weatherPillEl.addEventListener('mouseleave', () => {
      if (!weatherPinned) {
        this.weatherPopoverEl.classList.remove('active');
      }
    });

    this.weatherPillEl.addEventListener('click', (e) => {
      e.stopPropagation();
      weatherPinned = !weatherPinned;
      this.positionWeatherPopover();
      this.updateWeatherPopover();
      if (weatherPinned) {
        this.weatherPopoverEl.classList.add('active');
      } else {
        this.weatherPopoverEl.classList.remove('active');
      }
    });

    document.addEventListener('click', (e) => {
      if (weatherPinned && !this.weatherPopoverEl.contains(e.target) && !this.weatherPillEl.contains(e.target)) {
        weatherPinned = false;
        this.weatherPopoverEl.classList.remove('active');
      }
    });
  }

  updateWeatherPopover() {
    if (!this.weatherPopoverEl) return;
    const wm = this.weatherManager || (this.gameState && this.gameState.weatherManager);
    if (!wm || !wm.currentWeather) return;

    const curr = wm.currentWeather;

    let speedBadge = '🚶 Standart Müşteri Akış Hızı';
    let speedColor = '#ffd54f';
    if (curr.id === 'RAINY') {
      speedBadge = '🏃 %20 Daha Hızlı (Yağmurdan Sığınan Müşteriler)';
      speedColor = '#4caf50';
    } else if (curr.id === 'SNOWY') {
      speedBadge = '🏃 %30 Daha Hızlı (Karlı Havada Yoğun İltifat & Akış)';
      speedColor = '#4caf50';
    }

    const html = `
      <div style="font-family: var(--font-heading); font-size: 15px; font-weight: 800; color: ${curr.color}; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 6px;">
        <span>${curr.icon} ${curr.name} (${curr.temp}°C)</span>
        <span style="font-size: 11px; background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 6px; color: #fff;">Dış Mekan</span>
      </div>

      <p style="font-size: 11.5px; color: #ccc; margin-bottom: 10px; line-height: 1.4;">
        ${curr.desc}
      </p>

      <div style="background: rgba(0,0,0,0.35); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 10px;">
        <div style="font-size: 11px; color: #aaa; margin-bottom: 4px;">⚡ Müşteri Geliş Hızı & Sirkülasyon:</div>
        <div style="font-size: 12px; font-weight: 800; color: ${speedColor};">
          ${speedBadge}
        </div>
      </div>

      <div style="font-size: 11px; color: #aaa; margin-bottom: 6px;">📊 İçecek & Yiyecek Talebi Çarpanları:</div>
      <div style="display: flex; flex-direction: column; gap: 5px; font-size: 11.5px;">
        <div style="display: flex; justify-content: space-between; background: rgba(255,255,255,0.05); padding: 5px 10px; border-radius: 6px;">
          <span>☕ Sıcak Kahveler (Espresso, Latte...)</span>
          <b style="color: ${curr.hotDrinkMultiplier > 1.0 ? '#4caf50' : '#bbb'};">x${curr.hotDrinkMultiplier.toFixed(2)}</b>
        </div>
        <div style="display: flex; justify-content: space-between; background: rgba(255,255,255,0.05); padding: 5px 10px; border-radius: 6px;">
          <span>🧋 Soğuk İçecekler & Cold Brew</span>
          <b style="color: ${curr.coldDrinkMultiplier > 1.0 ? '#4caf50' : '#ff5252'};">x${curr.coldDrinkMultiplier.toFixed(2)}</b>
        </div>
        <div style="display: flex; justify-content: space-between; background: rgba(255,255,255,0.05); padding: 5px 10px; border-radius: 6px;">
          <span>🥐 Hamur İşi & Tatlılar (Kruvasan, Tost...)</span>
          <b style="color: ${curr.bakeryMultiplier > 1.0 ? '#4caf50' : '#bbb'};">x${curr.bakeryMultiplier.toFixed(2)}</b>
        </div>
      </div>
    `;

    this.weatherPopoverEl.innerHTML = html;
  }

  checkStockDepletions() {
    const inv = this.gameState.economy.inventory;
    const warningsMap = {
      coffee_beans: 'espresso çekirdeği bitti!',
      milk: 'taze süt bitti!',
      pastry_dough: 'pastane hamuru bitti!'
    };

    for (const [key, msgText] of Object.entries(warningsMap)) {
      const qty = this.gameState.economy.getTotalStock(key);
      if (qty <= 0) {
        if (!this.activeWarnings.has(key)) {
          this.addStockWarning(key, msgText);
        }
      } else {
        if (this.activeWarnings.has(key)) {
          this.removeStockWarning(key);
        }
      }
    }

    // Check cold storage capacity warning (perishable stock vs refrigerator capacity)
    const coldCap = this.gameState.gridManager.getRefrigeratedCapacity();
    const perishableStock = this.gameState.economy.getPerishableStockCount();
    if (perishableStock > coldCap) {
      if (!this.activeWarnings.has('cold_storage')) {
        this.addStockWarning('cold_storage', 'soğuk depo yetersiz! buzdolabı satın alın!');
      }
    } else {
      if (this.activeWarnings.has('cold_storage')) {
        this.removeStockWarning('cold_storage');
      }
    }

    const noWarnMsg = document.getElementById('no-warnings-msg');
    if (noWarnMsg) {
      noWarnMsg.style.display = this.activeWarnings.size === 0 ? 'block' : 'none';
    }
  }

  addStockWarning(key, text) {
    if (!this.notificationsList) return;

    const card = document.createElement('div');
    card.className = 'notification-card';
    card.id = `warn-card-${key}`;
    card.innerHTML = `
      <div class="warn-content">
        <span class="warn-icon">🚨</span>
        <span class="warn-text">${text}</span>
      </div>
      <button class="btn-quick-buy">Stok Al</button>
    `;

    const buyBtn = card.querySelector('.btn-quick-buy');
    if (buyBtn) {
      buyBtn.addEventListener('click', () => {
        this.openInventoryModal();
      });
    }

    // Insert at the VERY TOP of the warnings column (pushing existing items down)
    this.notificationsList.prepend(card);
    this.activeWarnings.set(key, card);
  }

  removeStockWarning(key) {
    const card = this.activeWarnings.get(key);
    if (card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        card.remove();
      }, 250);
      this.activeWarnings.delete(key);
    }
  }

  addNotification(text, icon = '😡', type = 'warning') {
    if (!this.notificationsList) return;

    // Prevent spamming identical notifications within 1.5s
    if (this.lastNotificationTime && Date.now() - this.lastNotificationTime < 1500 && this.lastNotificationText === text) {
      return;
    }
    this.lastNotificationTime = Date.now();
    this.lastNotificationText = text;

    // Praise/positive notification check
    const isPraise = type === 'praise' || type === 'success' || icon === '📸' || icon === '🎉' || text.includes('COŞKULU') || text.includes('Paylaştı');

    const card = document.createElement('div');
    card.className = isPraise ? 'notification-card praise' : 'notification-card';
    card.innerHTML = `
      <div class="warn-content">
        <span class="warn-icon">${icon}</span>
        <span class="warn-text">${text}</span>
      </div>
      <button class="btn-dismiss">&times;</button>
    `;

    const dismissBtn = card.querySelector('.btn-dismiss');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          card.remove();
          const noWarnMsg = document.getElementById('no-warnings-msg');
          if (this.notificationsList && this.notificationsList.querySelectorAll('.notification-card').length === 0 && noWarnMsg) {
            noWarnMsg.style.display = 'block';
          }
        }, 250);
      });
    }

    // Insert at the VERY TOP of the warnings column
    this.notificationsList.prepend(card);

    const noWarnMsg = document.getElementById('no-warnings-msg');
    if (noWarnMsg) noWarnMsg.style.display = 'none';

    // Keep ONLY the last 10 notifications (trim excess cards from bottom)
    const cards = Array.from(this.notificationsList.querySelectorAll('.notification-card'));
    while (cards.length > 10) {
      const oldestCard = cards.pop();
      oldestCard.remove();
    }
  }

  openModal(title, contentHTML, customMaxWidth = null, preventClose = false) {
    audioEngine.playClick();
    audioEngine.setModalActive(true);
    this.modalTitle.innerText = title;
    this.modalBody.innerHTML = contentHTML;
    this.preventModalClose = preventClose;

    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) {
      closeBtn.style.display = preventClose ? 'none' : 'flex';
    }

    const modalContent = this.modalOverlay ? this.modalOverlay.querySelector('.modal-content') : null;
    if (modalContent) {
      if (customMaxWidth) {
        modalContent.style.maxWidth = customMaxWidth;
        modalContent.style.width = '100%';
      } else {
        modalContent.style.maxWidth = '';
        modalContent.style.width = '';
      }
    }
    this.modalOverlay.style.display = 'flex';
    this.modalOverlay.classList.add('open');
  }

  closeModal() {
    if (this.preventModalClose) return;
    audioEngine.playClick();
    audioEngine.setModalActive(false);
    this.modalOverlay.classList.remove('open');
    this.modalOverlay.style.display = 'none';
    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) {
      closeBtn.style.display = 'flex';
    }
    const modalContent = this.modalOverlay ? this.modalOverlay.querySelector('.modal-content') : null;
    if (modalContent) {
      modalContent.style.maxWidth = '';
      modalContent.style.width = '';
    }
  }

  forceCloseModal() {
    this.preventModalClose = false;
    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) {
      closeBtn.style.display = 'flex';
    }
    this.closeModal();
  }

  // --- 1. BUILD SHOP MODAL ---
  openBuildModal() {
    let html = `
      <div class="card-grid">
    `;

    for (const [key, item] of Object.entries(ITEM_CATALOG)) {
      const canAfford = this.gameState.economy.canAfford(item.price);
      html += `
        <div class="item-card">
          <div>
            <div class="card-title">${item.name}</div>
            <div class="card-desc">${item.description}</div>
          </div>
          <div class="card-footer">
            <span class="price-badge">${item.price} TL</span>
            <button class="action-btn ${canAfford ? '' : 'disabled'}" data-item-id="${key}">
              Satın Al & Yerleştir
            </button>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    this.openModal('🔨 Kafe Eşyaları & İnşa Mağazası', html);

    // Bind purchase listeners
    this.modalBody.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.action-btn');
        if (!targetBtn) return;
        const itemId = targetBtn.dataset.itemId;
        const itemDef = ITEM_CATALOG[itemId];
        if (itemDef && this.gameState.economy.canAfford(itemDef.price)) {
          this.renderer.buildModeItem = itemDef;
          this.gameState.economy.spendMoney(itemDef.price, `Eşya Satın Alımı: ${itemDef.name}`);
          audioEngine.playChaChing();
          this.questManager.checkProgress('place_decor');
          this.closeModal();
        }
      });
    });
  }

  // --- 2. MENU MANAGER MODAL ---
  openMenuModal() {
    let html = `<div class="card-grid">`;
    const recipes = this.recipeManager.recipes;

    for (const [key, rec] of Object.entries(recipes)) {
      const isUnlocked = rec.unlocked;
      const cost = rec.unlockCost || (rec.unlockLevel * 250);
      const levelReqMet = this.gameState.level >= rec.unlockLevel;
      const canAfford = this.gameState.economy.canAfford(cost);
      const hasReqEquip = !rec.requiresEquipment || (rec.requiresEquipment === 'REFRIGERATOR_STAINLESS' && this.gameState.gridManager.hasDoubleDoorFridge());
      const canUnlock = !isUnlocked && levelReqMet && canAfford && hasReqEquip;

      let btnText = '';
      if (!hasReqEquip) {
        btnText = `🔒 Çift Kapılı İçecek Dolabı Gereklidir!`;
      } else if (!levelReqMet) {
        btnText = `Seviye ${rec.unlockLevel} Gereklidir (${cost} TL Lisans)`;
      } else if (!canAfford) {
        btnText = `Yetersiz Bakiye (${cost} TL Lisans)`;
      } else {
        btnText = `Reçeteyi Lisansla & Aç (${cost} TL)`;
      }

      html += `
        <div class="item-card">
          <div>
            <div class="card-title">${rec.name} ${isUnlocked ? '✅' : '🔒'}</div>
            <div class="card-desc">${rec.description}</div>
            <div style="font-size:12px; color:#aaa; margin-top:4px;">
              Maliyet: <b>${rec.costPrice} TL</b> | Demleme/Hazırlık: ${rec.prepTime}s
            </div>
            ${rec.requiresEquipment === 'REFRIGERATOR_STAINLESS' ? `
              <div style="font-size:10.5px; font-weight:700; color: ${hasReqEquip ? '#00e676' : '#ff5252'}; margin-top:4px;">
                ${hasReqEquip ? '❄️ Çift Kapılı İçecek Dolabı Mevcut' : '🔒 Çift Kapılı İçecek Dolabı Gereklidir'}
              </div>
            ` : ''}
          </div>
          <div class="card-footer" style="margin-top:10px;">
            ${isUnlocked ? `
              <div>
                <label style="font-size:12px;">Satış Fiyatı:</label>
                <input type="number" class="price-input" data-recipe-id="${key}" value="${rec.sellPrice}" style="width:65px; padding:4px; border-radius:6px; border:1px solid #555; background:#222; color:#fff;" /> TL
              </div>
            ` : `
              <button class="action-btn ${canUnlock ? '' : 'disabled'}" data-unlock-id="${key}">
                ${btnText}
              </button>
            `}
          </div>
        </div>
      `;
    }
    html += `</div>`;
    this.openModal('📋 Ürün Reçeteleri & Menü Yönetimi', html);

    // Bind price change listeners
    this.modalBody.querySelectorAll('.price-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const inputEl = e.target.closest('.price-input');
        if (!inputEl) return;
        const id = inputEl.dataset.recipeId;
        const val = parseFloat(inputEl.value);
        this.recipeManager.setPrice(id, val);
        this.gameState.saveToLocalStorage();
      });
    });

    // Bind unlock listeners
    this.modalBody.querySelectorAll('[data-unlock-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('[data-unlock-id]');
        if (!targetBtn) return;
        const id = targetBtn.dataset.unlockId;
        if (this.recipeManager.unlockRecipe(id, this.gameState.level, this.gameState.economy, this.gameState.gridManager)) {
          audioEngine.playChaChing();
          this.questManager.checkProgress('unlock_recipe');
          this.gameState.saveToLocalStorage();
          this.openMenuModal(); // refresh UI
        } else {
          const rec = this.recipeManager.recipes[id];
          if (rec && rec.requiresEquipment === 'REFRIGERATOR_STAINLESS' && !this.gameState.gridManager.hasDoubleDoorFridge()) {
            audioEngine.playClick();
            this.addNotification('🔒 Bu kutu içeceği menüye eklemek için kafede Çift Kapılı İçecek Dolabı bulunmalıdır!', '🔒', 5000);
          }
        }
      });
    });
  }

  // --- 3. STAFF MANAGEMENT MODAL ---
  openStaffModal() {
    audioEngine.playClick();

    const employees = this.gameState.employees || [];
    const candidates = [
      { name: 'Selin Yılmaz', trait: 'PERFECTIONIST', salary: 1100, gender: 'female' },
      { name: 'Caner Demir', trait: 'FAST_WORKER', salary: 1000, gender: 'male' },
      { name: 'Elif Kaya', trait: 'CHARMER', salary: 950, gender: 'female' },
      { name: 'Burak Şahin', trait: 'HARD_WORKER', salary: 900, gender: 'male' },
      { name: 'Deniz Arslan', trait: 'FAST_WORKER', salary: 1050, gender: 'female' },
      { name: 'Zeynep Çelik', trait: 'CHARMER', salary: 1000, gender: 'female' },
      { name: 'Kaan Tunç', trait: 'PERFECTIONIST', salary: 1150, gender: 'male' },
      { name: 'Merve Şen', trait: 'HARD_WORKER', salary: 950, gender: 'female' }
    ];

    let html = `
      <div style="padding: 4px 6px;">
        <!-- TAB HEADER BUTTONS -->
        <div style="display: flex; gap: 10px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
          <button id="tab-btn-current" class="modal-tab-btn active" style="flex: 1; padding: 10px; border-radius: 8px; font-weight: 700; cursor: pointer; border: 1px solid #ffd54f; background: rgba(255, 213, 79, 0.15); color: #ffd54f;">
            👨‍🍳 Çalışan Kadrosu (${employees.length})
          </button>
          <button id="tab-btn-hire" class="modal-tab-btn" style="flex: 1; padding: 10px; border-radius: 8px; font-weight: 700; cursor: pointer; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.3); color: #ccc;">
            ➕ Yeni Personel İşe Al
          </button>
        </div>

        <!-- TAB CONTENT 1: MEVCUT PERSONEL LİSTESİ -->
        <div id="tab-content-current">
    `;

    if (employees.length === 0) {
      html += `
        <div style="text-align:center; padding: 30px 10px; color:#aaa; font-size:14px;">
          <div style="font-size:36px; margin-bottom:8px;">🧑‍🍳</div>
          Şu an çalışan personeliniz bulunmamaktadır.<br/>
          <i style="color:#888;">"Yeni Personel İşe Al" sekmesinden yeni barista istihdam edebilirsiniz.</i>
        </div>
      `;
    } else {
      html += `<div style="display: flex; flex-direction: column; gap: 12px;">`;
      employees.forEach(emp => {
        const traitDef = emp.trait || EMPLOYEE_TRAITS[emp.traitKey] || EMPLOYEE_TRAITS.FAST_WORKER;
        const severanceFee = Math.floor((emp.salary || 800) * 3);
        const canAffordSeverance = this.gameState.economy.canAfford(severanceFee);
        const isFemale = emp.gender === 'female' || emp.type === 'barista_female';
        const empIcon = isFemale ? '👩‍🍳' : '👨‍🍳';

        html += `
          <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 14px; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 44px; height: 44px; background: rgba(255,213,79,0.15); border: 1px solid rgba(255,213,79,0.4); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px;">
                ${empIcon}
              </div>
              <div>
                <div style="font-size: 15px; font-weight: 700; color: #ffffff;">${emp.name} <span style="font-size:11px; opacity:0.75; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px;">${isFemale ? 'Kadın Barista' : 'Erkek Barista'}</span></div>
                <div style="font-size: 12px; color: #ffd54f; margin-top: 2px;">
                  <b>${traitDef.name}</b> • <span style="color: #aaa;">${traitDef.desc}</span>
                </div>
                <div style="font-size: 11.5px; color: #bbb; margin-top: 4px;">
                  Maaş: <b style="color:#ffffff;">${emp.salary || 800} TL / gün</b> | Tazminat Maliyeti: <b style="color:#ff5252;">${severanceFee} TL</b>
                </div>
              </div>
            </div>

            <button class="btn-fire-employee" data-emp-id="${emp.id}" style="padding: 8px 14px; background: ${canAffordSeverance ? '#d32f2f' : '#555'}; color: #ffffff; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: ${canAffordSeverance ? 'pointer' : 'not-allowed'}; display: flex; align-items: center; gap: 6px; white-space: nowrap; transition: all 0.2s ease;">
              <span>😡 İşten Çıkar</span>
              <span style="font-size: 10px; opacity: 0.85;">(-${severanceFee} TL)</span>
            </button>
          </div>
        `;
      });
      html += `</div>`;
    }

    html += `
        </div>

        <!-- TAB CONTENT 2: YENİ PERSONEL ALIMI -->
        <div id="tab-content-hire" style="display: none;">
          <div class="card-grid">
    `;

    candidates.forEach(cand => {
      const traitDef = EMPLOYEE_TRAITS[cand.trait];
      const canAffordHire = this.gameState.economy.canAfford(cand.salary);
      const candIcon = cand.gender === 'female' ? '👩‍🍳' : '👨‍🍳';

      html += `
        <div class="item-card">
          <div>
            <div class="card-title">${candIcon} ${cand.name}</div>
            <div class="card-desc">Cinsiyet: <b>${cand.gender === 'female' ? 'Kadın Barista' : 'Erkek Barista'}</b><br/>Özellik: <b>${traitDef.name}</b><br/>${traitDef.desc}</div>
          </div>
          <div class="card-footer">
            <span class="price-badge">${cand.salary} TL/gün</span>
            <button class="action-btn ${canAffordHire ? '' : 'disabled'}" data-hire-name="${cand.name}" data-hire-trait="${cand.trait}" data-hire-salary="${cand.salary}" data-hire-gender="${cand.gender}">
              İşe Al
            </button>
          </div>
        </div>
      `;
    });

    html += `
          </div>
        </div>
      </div>
    `;

    this.openModal('👨‍🍳 Personel Yönetimi & İşe Alım', html);

    // Tab Switching Logic
    const tabCurrentBtn = this.modalBody.querySelector('#tab-btn-current');
    const tabHireBtn = this.modalBody.querySelector('#tab-btn-hire');
    const tabCurrentContent = this.modalBody.querySelector('#tab-content-current');
    const tabHireContent = this.modalBody.querySelector('#tab-content-hire');

    if (tabCurrentBtn && tabHireBtn) {
      tabCurrentBtn.addEventListener('click', () => {
        audioEngine.playClick();
        tabCurrentBtn.style.border = '1px solid #ffd54f';
        tabCurrentBtn.style.background = 'rgba(255, 213, 79, 0.15)';
        tabCurrentBtn.style.color = '#ffd54f';

        tabHireBtn.style.border = '1px solid rgba(255,255,255,0.15)';
        tabHireBtn.style.background = 'rgba(0,0,0,0.3)';
        tabHireBtn.style.color = '#ccc';

        tabCurrentContent.style.display = 'block';
        tabHireContent.style.display = 'none';
      });

      tabHireBtn.addEventListener('click', () => {
        audioEngine.playClick();
        tabHireBtn.style.border = '1px solid #ffd54f';
        tabHireBtn.style.background = 'rgba(255, 213, 79, 0.15)';
        tabHireBtn.style.color = '#ffd54f';

        tabCurrentBtn.style.border = '1px solid rgba(255,255,255,0.15)';
        tabCurrentBtn.style.background = 'rgba(0,0,0,0.3)';
        tabCurrentBtn.style.color = '#ccc';

        tabHireContent.style.display = 'block';
        tabCurrentContent.style.display = 'none';
      });
    }

    // Fire Employee Event Handlers
    this.modalBody.querySelectorAll('.btn-fire-employee').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.btn-fire-employee');
        if (!targetBtn) return;

        const empId = targetBtn.dataset.empId;
        const res = this.employeeSystem.fireEmployee(empId);

        if (!res.success) {
          if (res.reason === 'insufficient_funds') {
            audioEngine.playClick();
            this.addNotification(`Tazminatı Ödemek İçin Yetersiz Bakiye! (${res.severanceFee} TL Gerekli) ⚠️`, '⚠️');
          }
          return;
        }

        // Fired successfully!
        audioEngine.playClick();

        if (this.renderer) {
          this.renderer.addParticle(res.emp.x, res.emp.y, `${res.emp.name} Kovuldu! -${res.severanceFee} TL 😡`, '#f44336');
        }
        this.addNotification(`${res.emp.name} İşten Çıkarıldı! (-${res.severanceFee} TL Tazminat 😡)`, '😡');

        // Re-open staff modal to update list dynamically!
        this.openStaffModal();
      });
    });

    // Hire Employee Event Handlers
    this.modalBody.querySelectorAll('[data-hire-name]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('[data-hire-name]');
        if (!targetBtn) return;
        const name = targetBtn.dataset.hireName;
        const trait = targetBtn.dataset.hireTrait;
        const salary = parseInt(targetBtn.dataset.hireSalary, 10);
        const gender = targetBtn.dataset.hireGender || 'male';

        if (this.gameState.economy.canAfford(salary)) {
          this.gameState.economy.spendMoney(salary, `Personel İşe Alımı: ${name}`);
          const newEmp = this.employeeSystem.hireEmployee(name, trait, salary, gender);
          const empIcon = gender === 'female' ? '👩‍🍳' : '👨‍🍳';
          if (newEmp && this.renderer) {
            this.renderer.addParticle(0, 7, `${empIcon} ${name} İşe Başladı!`, '#4caf50');
          }
          audioEngine.playLevelUp();
          if (this.questManager) this.questManager.checkProgress('hire_staff');
          this.openStaffModal(); // Refresh modal to show newly hired staff in roster tab!
        }
      });
    });
  }

  // --- 4. INVENTORY RESTOCK MODAL ---
  openInventoryModal() {
    this.gameState.economy.ensureInventoryFormat();
    const qual = this.gameState.economy.ingredientQuality || 'NORMAL';
    const coldCap = this.gameState.gridManager.getRefrigeratedCapacity();
    const perishableStock = this.gameState.economy.getPerishableStockCount();
    const isOverCap = perishableStock > coldCap;
    const excess = Math.max(0, perishableStock - coldCap);

    let html = `
      <div style="padding: 4px 6px;">
        <!-- COLD STORAGE & REFRIGERATOR STATUS BOX -->
        <div style="background: ${isOverCap ? 'rgba(244, 67, 54, 0.15)' : 'rgba(0, 150, 136, 0.15)'}; border: 1px solid ${isOverCap ? '#ff5252' : '#00bfa5'}; border-radius: 12px; padding: 12px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 13px; font-weight: 700; color: ${isOverCap ? '#ff5252' : '#80cbc4'}; display: flex; align-items: center; gap: 6px;">
              <span>❄️ Buzdolabı & Soğuk Depo Kapasitesi</span>
            </span>
            <span style="font-size: 12px; font-weight: 700; color: ${isOverCap ? '#ff5252' : '#00e676'};">${perishableStock} / ${coldCap} birim koruma altında</span>
          </div>
          <div style="font-size: 11px; color: ${isOverCap ? '#ffcdd2' : '#b2dfdb'}; line-height: 1.4;">
            ${isOverCap 
              ? `⚠️ <b>UYARI:</b> ${excess.toFixed(1)} birim hassas malzeme açıkta! Buzdolabı kapasiteniz yetersiz olduğu için her saat sıcakta bozulabilir. İçerideki bozulmayı önlemek için hemen <b>İnşa Mağazasından Buzdolabı</b> satın alıp yerleştirin!`
              : `✅ Tüm taze süt ve hamur stoklarınız kafedeki buzdolaplarınız tarafından güvenle soğutuluyor.`}
          </div>
        </div>

        <!-- QUALITY SELECTOR HEADER -->
        <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 12px; margin-bottom: 12px;">
          <div style="font-size: 13px; font-weight: 700; color: #ffd54f; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
            <span>🏷️ Satın Alınacak Malzeme Kalitesi</span>
            <span style="font-size: 10.5px; font-weight: 400; color: #aaa;">⚡ Sipariş edince o kalite stok kaleminize eklenir</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="quality-btn ${qual === 'CHEAP' ? 'active' : ''}" data-quality="CHEAP" style="flex: 1; padding: 8px; border-radius: 8px; font-size: 11.5px; font-weight: 700; cursor: pointer; border: 1px solid ${qual === 'CHEAP' ? '#ff5252' : 'rgba(255,255,255,0.15)'}; background: ${qual === 'CHEAP' ? 'rgba(244, 67, 54, 0.25)' : 'rgba(0,0,0,0.3)'}; color: ${qual === 'CHEAP' ? '#ff5252' : '#ccc'};">
              🗑️ Kalitesiz / Ucuz (-%40 Fiyat)<br/>
              <span style="font-size: 10px; font-weight: 400; opacity: 0.85;">⚠️ +%10 Karalama Riski! (🤢)</span>
            </button>
            <button class="quality-btn ${qual === 'NORMAL' ? 'active' : ''}" data-quality="NORMAL" style="flex: 1; padding: 8px; border-radius: 8px; font-size: 11.5px; font-weight: 700; cursor: pointer; border: 1px solid ${qual === 'NORMAL' ? '#ffd54f' : 'rgba(255,255,255,0.15)'}; background: ${qual === 'NORMAL' ? 'rgba(255, 213, 79, 0.25)' : 'rgba(0,0,0,0.3)'}; color: ${qual === 'NORMAL' ? '#ffd54f' : '#ccc'};">
              ☕ Standart Kalite<br/>
              <span style="font-size: 10px; font-weight: 400; opacity: 0.85;">Standart kalite ve fiyat.</span>
            </button>
            <button class="quality-btn ${qual === 'PREMIUM' ? 'active' : ''}" data-quality="PREMIUM" style="flex: 1; padding: 8px; border-radius: 8px; font-size: 11.5px; font-weight: 700; cursor: pointer; border: 1px solid ${qual === 'PREMIUM' ? '#4caf50' : 'rgba(255,255,255,0.15)'}; background: ${qual === 'PREMIUM' ? 'rgba(76, 175, 80, 0.25)' : 'rgba(0,0,0,0.3)'}; color: ${qual === 'PREMIUM' ? '#4caf50' : '#ccc'};">
              ✨ Lüks Organik (+%50 Fiyat)<br/>
              <span style="font-size: 10px; font-weight: 400; opacity: 0.85;">✨ +%10 Viral & Yıldız Bonusu! (🤩)</span>
            </button>
          </div>
        </div>

        <!-- CONSUMPTION PRIORITY RULE NOTICE -->
        <div style="background: rgba(33, 150, 243, 0.12); border: 1px solid rgba(33, 150, 243, 0.3); border-radius: 8px; padding: 6px 10px; margin-bottom: 14px; font-size: 11px; color: #90caf9; display: flex; align-items: center; gap: 6px;">
          <span>💡 <b>Otomatik Tüketim Kuralı:</b> Sipariş hazırlanırken elinizdeki <b>önce en kaliteli malzemeler</b> (Lüks → Standart → Kalitesiz) tükenir.</span>
        </div>

        <div class="card-grid">
    `;

    const inv = this.gameState.economy.inventory;
    let priceMult = 1.0;
    let qualLabel = 'Standart';
    let qualBadgeColor = '#ffd54f';
    if (qual === 'CHEAP') {
      priceMult = 0.6;
      qualLabel = 'Kalitesiz';
      qualBadgeColor = '#ff5252';
    } else if (qual === 'PREMIUM') {
      priceMult = 1.5;
      qualLabel = 'Lüks Organik';
      qualBadgeColor = '#4caf50';
    }

    const formatStock = (n) => {
      const val = Number(n) || 0;
      return Number.isInteger(val) ? val.toString() : val.toFixed(2).replace(/\.?0+$/, '');
    };

    for (const [key, item] of Object.entries(INGREDIENT_TYPES)) {
      const isStandardOnly = item.hasQualityTiers === false;
      // Skip standard-only factory items (canned drinks) when browsing non-standard quality tabs (CHEAP / PREMIUM)
      if (isStandardOnly && qual !== 'NORMAL') {
        continue;
      }

      const itemStock = inv[key] || { CHEAP: 0, NORMAL: 0, PREMIUM: 0 };
      const cheapQty = formatStock(itemStock.CHEAP);
      const normalQty = formatStock(itemStock.NORMAL);
      const premQty = formatStock(itemStock.PREMIUM);
      const totalQty = formatStock(this.gameState.economy.getTotalStock(key));

      const itemPriceMult = isStandardOnly ? 1.0 : priceMult;
      const itemQualLabel = isStandardOnly ? 'Standart' : qualLabel;
      const itemBadgeColor = isStandardOnly ? '#ffd54f' : qualBadgeColor;

      const hasReqFridge = !item.requiresEquipment || (item.requiresEquipment === 'REFRIGERATOR_STAINLESS' && this.gameState.gridManager.hasDoubleDoorFridge());
      let finalPrice = item.packPrice;
      if (item.prices && item.prices[qual] !== undefined) {
        finalPrice = item.prices[qual];
      } else {
        finalPrice = Math.floor(item.packPrice * itemPriceMult);
      }
      const canAfford = this.gameState.economy.canAfford(finalPrice) && hasReqFridge;

      const stockBoxHTML = isStandardOnly ? `
        <!-- Single Standard Stock Box for Packaged Canned Beverages -->
        <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px; margin-bottom: 12px; font-size: 11.5px; display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #ffd54f; font-weight: 700;">🥤 Mevcut Stok (Standart):</span>
          <b style="color: #64b5f6; font-weight: 700; font-size: 13px;">${totalQty} ${item.unit}</b>
        </div>
      ` : `
        <!-- Quality Breakdown Table for Raw Ingredients -->
        <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 8px 10px; margin-bottom: 12px; font-size: 11px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="color: #ff5252; font-weight: 600;">🗑️ Kalitesiz Miktar:</span>
            <b style="color: ${itemStock.CHEAP > 0 ? '#ff5252' : '#777'};">${cheapQty} ${item.unit}</b>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="color: #ffd54f; font-weight: 600;">☕ Standart Miktar:</span>
            <b style="color: ${itemStock.NORMAL > 0 ? '#ffd54f' : '#777'};">${normalQty} ${item.unit}</b>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="color: #4caf50; font-weight: 600;">✨ Lüks Organik Miktar:</span>
            <b style="color: ${itemStock.PREMIUM > 0 ? '#4caf50' : '#777'};">${premQty} ${item.unit}</b>
          </div>
          <div style="border-top: 1px dashed rgba(255,255,255,0.15); margin-top: 5px; padding-top: 5px; display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #fff; font-weight: 700;">📊 Toplam Stok:</span>
            <b style="color: #64b5f6; font-weight: 700; font-size: 12px;">${totalQty} ${item.unit}</b>
          </div>
        </div>
      `;

      html += `
        <div class="item-card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
              <span>📦 ${item.name}</span>
            </div>
            <div class="card-desc" style="margin-bottom: 10px;">${item.description}</div>
            ${stockBoxHTML}
          </div>

          <div class="card-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
            <div>
              <span style="font-size: 9.5px; color: ${itemBadgeColor}; font-weight: 700; display: block;">+${item.packSize} ${item.unit} (${itemQualLabel})</span>
              <span class="price-badge" style="font-size: 12px;">${finalPrice} TL</span>
            </div>
            <button class="action-btn ${canAfford ? '' : 'disabled'}" data-buy-stock="${key}">
              ${!hasReqFridge ? '🔒 Dolap Yok' : 'Sipariş Et'}
            </button>
          </div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;
    this.openModal('📦 Toptan Malzeme & Stok Tedariği', html);

    // Bind quality selection listeners
    this.modalBody.querySelectorAll('.quality-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.quality-btn');
        if (!targetBtn) return;
        audioEngine.playClick();
        const selectedQual = targetBtn.dataset.quality;
        this.gameState.economy.ingredientQuality = selectedQual;
        this.openInventoryModal(); // refresh UI
      });
    });

    this.modalBody.querySelectorAll('[data-buy-stock]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('[data-buy-stock]');
        if (!targetBtn) return;
        const key = targetBtn.dataset.buyStock;
        const itemDef = INGREDIENT_TYPES[key];

        if (itemDef && itemDef.requiresEquipment === 'REFRIGERATOR_STAINLESS' && !this.gameState.gridManager.hasDoubleDoorFridge()) {
          audioEngine.playClick();
          this.addNotification('🔒 Kutu içecek siparişi vermek için kafede Çift Kapılı İçecek Dolabı bulunmalıdır!', '🔒', 5000);
          return;
        }

        if (this.gameState.economy.buyIngredientPack(key)) {
          audioEngine.playChaChing();
          this.openInventoryModal(); // refresh UI
        }
      });
    });
  }

  // --- 5. LOCATIONS MAP & FINISH GAME MODAL ---
  openLocationsModal() {
    this.openFinishGameModal();
  }

  openFinishGameModal() {
    audioEngine.playClick();
    this.setSpeed(0); // Immediately pause background simulation so the player feels the run is completed!

    const userName = (this.gameState && this.gameState.userName) ? this.gameState.userName : 'Mehmet';
    const cafeName = (this.gameState && this.gameState.cafeName) ? this.gameState.cafeName : 'Ekin Cafe';
    const days = (this.gameState && this.gameState.day) ? this.gameState.day : 1;
    const servedCustomers = (this.gameState && this.gameState.totalCustomersServed) ? this.gameState.totalCustomersServed : 0;
    let missedCustomers = (this.gameState && this.gameState.totalCustomersMissed) ? this.gameState.totalCustomersMissed : 0;
    if (missedCustomers === 0 && servedCustomers > 5 && days > 1) {
      missedCustomers = Math.max(1, Math.round(servedCustomers * 0.16));
    }
    const totalAttempted = servedCustomers + missedCustomers;
    const successRate = totalAttempted > 0 ? Math.min(100, Math.max(0, Math.round((servedCustomers / totalAttempted) * 100))) : 100;
    const money = (this.gameState && this.gameState.economy && this.gameState.economy.money !== undefined) ? Math.floor(this.gameState.economy.money) : 20000;
    const reputation = (this.gameState && this.gameState.reputation !== undefined) ? this.gameState.reputation.toFixed(1) : '4.2';
    const locIcon = (this.gameState && this.gameState.location && this.gameState.location.icon) ? this.gameState.location.icon : '🏢';
    const locNameClean = (this.gameState && this.gameState.location && this.gameState.location.name) ? this.gameState.location.name.replace(/\s*\([^)]*\)/g, '').trim() : 'Üniversite Kampüsü';

    const html = `
      <div style="padding: 12px; text-align: center; color: #fff;">
        <div style="font-size: 44px; margin-bottom: 6px;">🏁</div>
        <h3 style="margin-bottom: 6px; color: #ffd54f; font-size: 20px;">Oyunu Tamamla ve Kafeyi Devret</h3>
        <p style="font-size: 13px; color: #ccc; margin-bottom: 18px; line-height: 1.4;">
          Mevcut kafe maceranızı sonlandırmak üzeresiniz. Başarınızı <strong>Liderlik Tablosuna</strong> kaydedebilir veya kaydetmeden sıfırlayıp yeni bir oyuna başlayabilirsiniz.
        </p>

        <!-- SUMMARY CARD -->
        <div class="glass-panel" style="background: rgba(0,0,0,0.45); border: 1.5px solid rgba(255,213,79,0.35); border-radius: 14px; padding: 16px; margin-bottom: 20px; text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 10px;">
            <div>
              <div style="font-size: 16px; font-weight: 800; color: #ffd54f;">☕ ${cafeName}</div>
              <div style="font-size: 12px; color: #fff; font-weight: 700;">İşletmeci: ${userName}</div>
            </div>
            <div style="font-size: 13px; background: rgba(255,213,79,0.15); border: 1px solid rgba(255,213,79,0.4); padding: 4px 10px; border-radius: 8px; color: #ffd54f; font-weight: 700;">
              ${locIcon} ${locNameClean}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12.5px; color: #d0d7de;">
            <div>📅 Çalışılan Gün: <strong style="color: #fff;">${days} Gün</strong></div>
            <div>☕ Hizmet Edilen: <strong style="color: #4caf50;">${servedCustomers.toLocaleString()} Müşteri (%${successRate})</strong></div>
            <div>💰 Kasadaki Servet: <strong style="color: #ffd54f;">${money.toLocaleString()} TL</strong></div>
            <div>⭐ Kafe İtibarı: <strong style="color: #ffb300;">${reputation} Yıldız</strong></div>
          </div>
        </div>

        <p style="font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 20px;">
          Nasıl devam etmek istersiniz?
        </p>

        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button id="btn-cancel-finish" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: #ccc; padding: 12px 16px; border-radius: 10px; font-weight: 700; cursor: pointer;">
            İptal (Oyuna Devam Et) ❌
          </button>
          <button id="btn-exit-without-saving" style="background: rgba(255, 82, 82, 0.2); border: 1px solid #ff5252; color: #ff8a80; padding: 12px 18px; border-radius: 10px; font-weight: 700; cursor: pointer;">
            Kaydetmeden Çık 🚪
          </button>
          <button id="btn-save-and-finish" style="background: linear-gradient(135deg, #4caf50, #2e7d32); border: none; color: #fff; padding: 12px 22px; border-radius: 10px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);">
            Oyunu Kaydet & Devret 🏆
          </button>
        </div>
      </div>
    `;

    this.openModal('🏁 Oyunu Tamamla ve Kafeyi Devret', html);

    const cancelBtn = this.modalBody.querySelector('#btn-cancel-finish');
    const exitBtn = this.modalBody.querySelector('#btn-exit-without-saving');
    const saveBtn = this.modalBody.querySelector('#btn-save-and-finish');

    if (cancelBtn) {
      cancelBtn.addEventListener('click', (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        audioEngine.playClick();
        this.closeModal();
        this.setSpeed(1); // Resume normal game speed if player cancels finishing
      });
    }

    if (exitBtn) {
      exitBtn.addEventListener('click', (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        audioEngine.playClick();
        this.closeModal();
        this.startNewGameWizard();
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (saveBtn.disabled) return;
        saveBtn.disabled = true;
        saveBtn.style.pointerEvents = 'none';

        audioEngine.playClick();

        try {
          this.saveScoreToLeaderboard({
            userName,
            cafeName,
            locationName: locNameClean,
            days,
            customersServed: servedCustomers,
            missedCustomers,
            successRate,
            money,
            reputation,
            date: new Date().toLocaleDateString('tr-TR')
          });
        } catch (err) {
          console.error('Error saving to leaderboard:', err);
        }

        try {
          audioEngine.playLevelUp();
          this.addNotification(`🏆 Tebrikler ${userName}! Kafeniz ${money.toLocaleString()} TL servet ile Liderlik Tablosuna kaydedildi! 🎉`, '🏆', 'praise');
        } catch (err) {}

        this.openLeaderboardModal({
          showLocationNextButton: true,
          justSavedMoney: money
        });
      });
    }
  }

  // --- LEADERBOARD LOGIC & MODAL ---
  getLeaderboardEntries() {
    return LeaderboardService.getLocalEntries();
  }

  async saveScoreToLeaderboard(entry) {
    try {
      await LeaderboardService.saveEntry(entry);
    } catch (e) {
      console.error('Failed to save score to leaderboard:', e);
    }
  }

  async openLeaderboardModal(options = {}) {
    audioEngine.playClick();

    const statusBadge = `<span style="background: rgba(76, 175, 80, 0.2); color: #81c784; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; border: 1px solid rgba(76, 175, 80, 0.4);">🌐 Global Liderlik Tablosu</span>`;

    const entries = await LeaderboardService.getEntries();
    entries.sort((a, b) => (Number(b.money) || 0) - (Number(a.money) || 0));

    let userRankIndex = -1;
    if (options.justSavedMoney !== undefined) {
      userRankIndex = entries.findIndex(entry => 
        Number(entry.money) === Number(options.justSavedMoney) && 
        entry.userName === (this.gameState ? this.gameState.userName : 'Mehmet')
      );
    }

    let rankBadgeText = '';
    if (userRankIndex !== -1) {
      const rankNum = userRankIndex + 1;
      if (rankNum === 1) rankBadgeText = '🥇 1. Sıra (Lider!)';
      else if (rankNum === 2) rankBadgeText = '🥈 2. Sıra';
      else if (rankNum === 3) rankBadgeText = '🥉 3. Sıra';
      else rankBadgeText = `🎖️ ${rankNum}. Sıra`;
    }

    let topBannerHtml = '';
    if (options.justSavedMoney !== undefined) {
      topBannerHtml = `
        <div style="background: linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(46, 125, 50, 0.4)); border: 1.5px solid #4caf50; border-radius: 12px; padding: 12px; margin-bottom: 14px; text-align: center; color: #fff;">
          <div style="font-size: 16px; font-weight: 800; color: #ffd54f;">🎉 Kafeniz Liderlik Tablosuna Kaydedildi!</div>
          <div style="font-size: 13px; margin-top: 4px; color: #e8f5e9;">
            Kafeniz <strong>${options.justSavedMoney.toLocaleString()} TL Servet</strong> alarak tablonun <strong>${rankBadgeText || 'üst sıralarına'}</strong> yerleşti!
          </div>
        </div>
      `;
    }

    let rowsHtml = '';
    if (entries.length === 0) {
      rowsHtml = `
        <tr>
          <td colspan="6" style="padding: 36px 16px; text-align: center; color: #aaa;">
            <div style="font-size: 36px; margin-bottom: 8px;">📜</div>
            <div style="font-size: 14.5px; font-weight: 700; color: #ffd54f; margin-bottom: 4px;">Henüz Kayıtlı Liderlik Skoru Bulunmuyor</div>
            <div style="font-size: 12px; color: #bbb;">Kafenizi devredip oyunu tamamlayarak liderlik tablosundaki ilk yeri siz alın! 🏆</div>
          </td>
        </tr>
      `;
    } else {
      entries.forEach((entry, idx) => {
        let rankBadge = `${idx + 1}.`;
        if (idx === 0) rankBadge = '🥇 1.';
        else if (idx === 1) rankBadge = '🥈 2.';
        else if (idx === 2) rankBadge = '🥉 3.';

        const isCurrentPlayer = (options.justSavedMoney !== undefined && Number(entry.money) === Number(options.justSavedMoney) && entry.userName === (this.gameState ? this.gameState.userName : 'Mehmet'));

        const rateStr = entry.successRate !== undefined ? `%${entry.successRate}` : '%100';

        let locNameClean = (entry.locationName || 'Üniversite Kampüsü').replace(/\s*\([^)]*\)/g, '').trim();

        const iconMap = {
          'Üniversite Kampüsü': '🎓',
          'Finans Merkezi': '🏢',
          'Sakin Konut Bölgesi': '🏡',
          'Eğlence & Sanat Caddesi': '🎭',
          'Tarihi Meydan': '🗽',
          'İş Merkezi Plazalar': '🏢',
          'Turistik Sahil Kordonu': '🏖️',
          'Nezih Konut Bölgesi': '🏡'
        };

        const locIcon = entry.locationIcon || iconMap[locNameClean] || '📍';

        rowsHtml += `
          <tr ${isCurrentPlayer ? 'id="just-saved-row"' : ''} style="${isCurrentPlayer ? 'background: rgba(255,213,79,0.3); border: 2px solid #ffd54f; box-shadow: inset 0 0 10px rgba(255,213,79,0.5);' : ''} border-bottom: 1px solid rgba(255,255,255,0.08);">
            <td style="padding: 12px 10px; font-weight: 900; font-size: 14px; text-align: center; color: ${idx === 0 ? '#ffd54f' : (idx === 1 ? '#e0e0e0' : (idx === 2 ? '#ffb74d' : '#888'))};">
              ${rankBadge}
            </td>
            <td style="padding: 12px 10px;">
              <div style="font-weight: 800; color: #ffd54f; font-size: 15px;">☕ ${entry.cafeName}</div>
            </td>
            <td style="padding: 12px 10px;">
              <div style="font-weight: 700; color: #fff; font-size: 13.5px;">👤 ${entry.userName} ${isCurrentPlayer ? '🌟 (SİZ)' : ''}</div>
            </td>
            <td style="padding: 12px 10px; font-size: 13px; color: #e0e0e0;">
              ${locIcon} ${locNameClean}
            </td>
            <td style="padding: 12px 10px; font-size: 12px; text-align: center; color: #bbb;">
              <strong>${(entry.customersServed || 0).toLocaleString()} Müşteri</strong> <span style="color: #81c784; font-weight: 600;">(${rateStr})</span>
            </td>
            <td style="padding: 12px 10px; font-size: 15px; font-weight: 900; color: #81c784; text-align: right;">
              ${(entry.money || 0).toLocaleString()} TL
            </td>
          </tr>
        `;
      });
    }

    let footerActionHtml = '';
    if (options.showLocationNextButton) {
      footerActionHtml = `
        <div style="margin-top: 18px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; align-items: center;">
          <button id="btn-view-location-details" style="background: rgba(255, 213, 79, 0.15); border: 1.5px solid #ffd54f; color: #ffd54f; padding: 12px 20px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; transition: transform 0.15s, background 0.15s;">
            🗺️ Lokasyon Özelliklerini İncele
          </button>
          <button id="btn-goto-location-select" style="background: linear-gradient(135deg, #2196f3, #1976d2); color: #fff; border: none; padding: 12px 28px; border-radius: 10px; font-weight: 800; font-size: 15px; cursor: pointer; box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);">
            Yeni Kafeni Kur (Lokasyon Seçimi) 🚀 ➡️
          </button>
        </div>
      `;
    }

    const html = `
      <div style="padding: 6px; color: #fff;">
        ${topBannerHtml}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 13px; color: #ccc;">🏆 En başarılı kafe işletmecileri ve servet sıralaması:</span>
          ${statusBadge}
        </div>

        <div style="max-height: 400px; overflow-y: auto; border-radius: 12px; background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.12);">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0; text-align: left;">
            <thead style="position: sticky; top: 0; z-index: 20; background: #1c212b; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
              <tr style="font-size: 11.5px; color: #ffd54f;">
                <th style="padding: 12px 10px; text-align: center; width: 50px; background: #1c212b; border-bottom: 2px solid rgba(255,213,79,0.3);">Sıra</th>
                <th style="padding: 12px 10px; background: #1c212b; border-bottom: 2px solid rgba(255,213,79,0.3);">Kafe Adı</th>
                <th style="padding: 12px 10px; background: #1c212b; border-bottom: 2px solid rgba(255,213,79,0.3);">İşletmeci</th>
                <th style="padding: 12px 10px; background: #1c212b; border-bottom: 2px solid rgba(255,213,79,0.3);">Lokasyon</th>
                <th style="padding: 12px 10px; text-align: center; background: #1c212b; border-bottom: 2px solid rgba(255,213,79,0.3);">Müşteri İstatistiği</th>
                <th style="padding: 12px 10px; text-align: right; background: #1c212b; border-bottom: 2px solid rgba(255,213,79,0.3);">Kasada Biriken Servet</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
        ${footerActionHtml}
      </div>
    `;

    const isEndgame = !!options.showLocationNextButton;
    this.openModal('🏆 Liderlik Tablosu (Leaderboard)', html, '840px', isEndgame);

    if (options.justSavedMoney !== undefined) {
      setTimeout(() => {
        const savedRow = this.modalBody.querySelector('#just-saved-row');
        if (savedRow) {
          savedRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }

    if (options.showLocationNextButton) {
      const detailsBtn = this.modalBody.querySelector('#btn-view-location-details');
      if (detailsBtn) {
        detailsBtn.addEventListener('click', (e) => {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          audioEngine.playClick();
          this.openLocationDetailsModal();
        });
      }

      const nextBtn = this.modalBody.querySelector('#btn-goto-location-select');
      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          audioEngine.playClick();
          this.forceCloseModal();
          this.startNewGameWizard();
        });
      }
    }
  }

  openLocationDetailsModal() {
    audioEngine.playClick();
    const locations = LOCATIONS;

    const demoLabels = {
      student: '🎓 Öğrenci',
      office_worker: '💼 Ofis',
      freelancer: '💻 Yazılımcı',
      tourist: '📸 Turist',
      influencer: '📱 Influencer',
      hipster: '🎨 Sanatçı',
      athlete: '🏃 Sporcu',
      senior: '👴 Müdavim',
      goth: '🎸 Rockçı',
      executive: '👔 CEO'
    };

    let cardsHtml = '';
    Object.values(locations).forEach(loc => {
      const cleanLocName = loc.name.replace(/\s*\([^)]*\)/g, '').trim();
      const topDemosHtml = Object.entries(loc.demographics || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([t, w]) => `<span style="background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); font-size: 10px; color: #e0e0e0;">${demoLabels[t] || t} %${Math.round(w * 100)}</span>`)
        .join(' ');

      cardsHtml += `
        <div class="glass-panel" style="background: rgba(30, 35, 45, 0.85); border: 1.5px solid rgba(255,213,79,0.25); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; gap: 10px;">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 28px;">${loc.icon}</span>
              <span style="font-size: 11.5px; background: rgba(255, 213, 79, 0.15); border: 1px solid rgba(255, 213, 79, 0.4); padding: 4px 10px; border-radius: 6px; color: #ffd54f; font-weight: 800;">
                💰 ${loc.rent.toLocaleString()} TL / Gün Kira
              </span>
            </div>
            <h4 style="margin: 0 0 6px 0; color: #ffd54f; font-size: 16px; font-weight: 800;">${loc.icon} ${cleanLocName}</h4>
            <p style="font-size: 12px; color: #ccc; margin: 0 0 10px 0; line-height: 1.4;">${loc.description}</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11.5px; background: rgba(0,0,0,0.35); padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
              <div>⚡ Müşteri Akışı: <b style="color:#4caf50;">${loc.trafficMultiplier}x</b></div>
              <div>💰 Harcama Gücü: <b style="color:${loc.spendingPower >= 1.3 ? '#4caf50' : (loc.spendingPower < 1.0 ? '#ff9800' : '#2196f3')};">${loc.spendingPower}x</b></div>
              <div style="grid-column: span 2;">⚖️ Fiyat Duyarlılığı: <b style="color:${loc.priceSensitivity >= 1.2 ? '#f44336' : (loc.priceSensitivity <= 0.7 ? '#4caf50' : '#ff9800')};">${loc.priceSensitivity >= 1.2 ? 'Çok Yüksek (Duyarlı)' : (loc.priceSensitivity <= 0.7 ? 'Düşük (Toleranslı)' : 'Dengeli')}</b></div>
              <div style="grid-column: span 2; display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; align-items: center;"><span style="color:#aaa; font-size: 10.5px; width: 100%;">👥 Müşteri Kitle Yapısı:</span> ${topDemosHtml}</div>
            </div>
          </div>
        </div>
      `;
    });

    const html = `
      <div style="padding: 8px; color: #fff;">
        <p style="font-size: 13.5px; color: #ccc; margin-bottom: 16px; text-align: center;">
          🗺️ Yeni kafeni kurabileceğin 5 stratejik lokasyonun ekonomik özellikleri:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px; max-height: 420px; overflow-y: auto; padding-right: 4px; margin-bottom: 18px;">
          ${cardsHtml}
        </div>

        <div style="text-align: center;">
          <button id="btn-goto-location-select-from-details" style="background: linear-gradient(135deg, #2196f3, #1976d2); color: #fff; border: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 16px; cursor: pointer; box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);">
            Yeni Kafeni Kur 🚀 ➡️
          </button>
        </div>
      </div>
    `;

    this.openModal('🗺️ Stratejik Lokasyon Özellikleri Rehberi', html, '840px', true);

    const nextBtn = this.modalBody.querySelector('#btn-goto-location-select-from-details');
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        audioEngine.playClick();
        this.forceCloseModal();
        this.startNewGameWizard();
      });
    }
  }

  // --- 6. END OF DAY MODAL ---
  openEndDayModal() {
    const eco = this.gameState.economy;
    const rent = this.gameState.location.rent;
    const netProfit = eco.dailyRevenue - eco.dailyExpenses - rent;
    const servedCount = this.gameState.dailyServedCustomers || 0;
    const missedCount = this.gameState.dailyMissedCustomers || 0;

    let html = `
      <div style="text-align:center; padding:10px;">
        <h3 style="font-size:22px; color:#ffd54f; margin-bottom:14px;">🌙 GÜN ${this.gameState.day} FİNANSAL ÖZET RAPORU</h3>
        <div style="font-size:15px; line-height:1.9; background:rgba(0,0,0,0.3); padding:16px; border-radius:12px; margin-bottom:20px;">
          <div>Hizmet Verilen Müşteri: <b style="color:#4caf50;">${servedCount} Kişi 😊</b></div>
          <div>Kaçırılan Müşteri: <b style="color:#ff5252;">${missedCount} Kişi 😢</b></div>
          <div>Toplam İçecek/Tatlı Satışı: <b>${eco.todaySalesCount} Adet</b></div>
          <div>Günlük Brüt Gelir: <b style="color:#4caf50;">+${eco.dailyRevenue} TL</b></div>
          <div>Malzeme & İşletme Gideri: <b style="color:#f44336;">-${eco.dailyExpenses} TL</b></div>
          <div>Bölge Kirası: <b style="color:#f44336;">-${rent} TL</b></div>
          <hr style="border-color:rgba(255,255,255,0.1); margin:10px 0;"/>
          <div style="font-size:18px;">Net Günlük Kar: <b style="color:${netProfit >= 0 ? '#4caf50' : '#f44336'};">${netProfit >= 0 ? '+' : ''}${netProfit} TL</b></div>
        </div>
        <button id="btn-next-day" class="action-btn" style="font-size:16px; padding:12px 28px;">
          Yeni Güne Başla ☀️
        </button>
      </div>
    `;

    this.openModal('📊 Gün Sonu Finansal Raporu', html);

    const btnNext = document.getElementById('btn-next-day');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        // Deduct rent and reset ledger & daily customer counters
        eco.spendMoney(rent, 'Günlük Bölge Kirası');
        eco.resetDailyLedger();
        this.gameState.dailyServedCustomers = 0;
        this.gameState.dailyMissedCustomers = 0;
        this.gameState.day++;
        this.gameState.hour = 8;
        this.gameState.minute = 0;
        this.gameState.customers = []; // Fresh customer pool for the new day

        // Evaluate daily breakdown probabilities for all placed cafe items
        this.gameState.gridManager.processDailyItemBreakdown(this);

        this.setSpeed(1); // Set gameSpeed to 1x and UNPAUSE game clock!
        this.gameState.saveToLocalStorage();
        audioEngine.playLevelUp();
        this.closeModal();
      });
    }
  }
}
