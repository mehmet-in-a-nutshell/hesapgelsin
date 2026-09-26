/**
 * main.js
 * Entry point for Cafe Tycoon application.
 * Initializes assets, canvas engine, simulation tick loop, AI systems, and UI manager.
 */

import { assetManager } from './assets/AssetManager.js';
import { CanvasRenderer } from './engine/CanvasRenderer.js';
import { GameState } from './game/GameState.js';
import { RecipeManager } from './game/RecipeManager.js';
import { CustomerSystem } from './game/CustomerAI.js';
import { EmployeeSystem } from './game/EmployeeAI.js';
import { RepairmanSystem } from './game/RepairmanAI.js';
import { QuestManager } from './game/QuestManager.js';
import { WeatherManager } from './game/WeatherManager.js';
import { UIManager } from './ui/UIManager.js';
import { audioEngine } from './audio/AudioEngine.js';

let canvas, renderer, gameState, recipeManager, customerSystem, employeeSystem, repairmanSystem, questManager, weatherManager, uiManager;
let lastTime = performance.now();

async function init() {
  console.log('☕ Initializing Cafe Tycoon Game Engine...');

  try {
    canvas = document.getElementById('game-canvas');
    if (!canvas) throw new Error('game-canvas element not found');

    renderer = new CanvasRenderer(canvas);
    renderer.resize();

    recipeManager = new RecipeManager();
    gameState = new GameState();
    gameState.recipeManager = recipeManager;
    const hasSave = gameState.loadFromLocalStorage();

    customerSystem = new CustomerSystem(gameState, recipeManager, renderer);
    gameState.customerSystem = customerSystem;
    employeeSystem = new EmployeeSystem(gameState);
    repairmanSystem = new RepairmanSystem(gameState, renderer);
    gameState.repairmanSystem = repairmanSystem;
    renderer.repairmanSystem = repairmanSystem;

    questManager = new QuestManager(gameState);
    weatherManager = new WeatherManager(gameState);
    gameState.weatherManager = weatherManager;
    renderer.weatherManager = weatherManager;

    uiManager = new UIManager(gameState, recipeManager, questManager, employeeSystem, renderer);
    uiManager.weatherManager = weatherManager;
    uiManager.customerSystem = customerSystem;
    customerSystem.uiManager = uiManager;
    employeeSystem.uiManager = uiManager;
    repairmanSystem.uiManager = uiManager;
    renderer.customerSystem = customerSystem;

    audioEngine.gameState = gameState;

    // Handle user interaction to unlock Web Audio API Context and start relaxing Lo-Fi Cafe BGM
    const unlockAudio = () => {
      audioEngine.ensureContext();
      const ws = document.getElementById('welcome-screen');
      const isWelcomeActive = ws && ws.style.display !== 'none' && !ws.classList.contains('welcome-fade-out');

      if (!audioEngine.isMuted && !audioEngine.isModalActive && !audioEngine.isTabHidden) {
        if (isWelcomeActive || (gameState && gameState.gameSpeed > 0)) {
          audioEngine.startBGM();
        }
      }
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    if (hasSave) {
      gameState.saveToLocalStorage();
    }
    uiManager.updateHUD();

    // Pre-bake assets synchronously
    assetManager.preloadAll();

    // Handle canvas tile click for build placement, object moving & object selection
    canvas.addEventListener('click', (e) => {
      const isPlacingOrMoving = !!(renderer.movingItem || renderer.buildModeItem);

      // Skip normal tile selection click only if camera was panned AND we are NOT in move/build mode
      if (renderer.wasDragged && !isPlacingOrMoving) {
        renderer.wasDragged = false;
        return;
      }
      renderer.wasDragged = false;

      const tile = renderer.screenToGrid(e.clientX, e.clientY);

      if (renderer.movingItem) {
        const itemToMove = renderer.movingItem.item;
        const origX = renderer.movingItem.origX;
        const origY = renderer.movingItem.origY;

        // Clear movingItem FIRST so mode terminates unconditionally on this click
        renderer.movingItem = null;

        if (tile && tile.x >= 0 && tile.x < gameState.gridManager.cols && tile.y >= 0 && tile.y < gameState.gridManager.rows) {
          if (gameState.gridManager.canMoveItem(itemToMove, tile.x, tile.y)) {
            gameState.gridManager.movePlacedItem(itemToMove, tile.x, tile.y);
            audioEngine.playPlaceItem();
            renderer.addParticle(tile.x, tile.y, 'Taşındı! 🚚', '#4caf50');
            gameState.saveToLocalStorage();
          } else {
            // Target tile occupied -> restore original position
            itemToMove.x = origX;
            itemToMove.y = origY;
            audioEngine.playClick();
            renderer.addParticle(origX, origY, 'Konum Dolu! 🛑', '#f44336');
            gameState.gridManager.autoOrientChairs();
            gameState.gridManager.rebuildPathfinderGrid();
          }
        } else {
          // Outside grid -> restore original position
          itemToMove.x = origX;
          itemToMove.y = origY;
          gameState.gridManager.autoOrientChairs();
          gameState.gridManager.rebuildPathfinderGrid();
        }
        return;
      }

      if (renderer.buildModeItem) {
        if (tile && tile.x >= 0 && tile.x < gameState.gridManager.cols && tile.y >= 0 && tile.y < gameState.gridManager.rows) {
          if (gameState.gridManager.canPlaceItem(tile.x, tile.y, renderer.buildModeItem)) {
            gameState.gridManager.placeItem(tile.x, tile.y, renderer.buildModeItem);
            renderer.addParticle(tile.x, tile.y, 'Yerleştirildi! ✨', '#4caf50');
            renderer.buildModeItem = null;
          }
        }
        return;
      }

      // Handle Object Selection & Sell UI
      if (tile && tile.x >= 0 && tile.x < gameState.gridManager.cols && tile.y >= 0 && tile.y < gameState.gridManager.rows) {
        const item = gameState.gridManager.getItemAt(tile.x, tile.y);
        if (item) {
          audioEngine.playClick();
          renderer.selectedItem = item;
        } else {
          renderer.selectedItem = null;
        }
      } else {
        renderer.selectedItem = null;
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (renderer.movingItem) {
          // Restore original position
          renderer.movingItem.item.x = renderer.movingItem.origX;
          renderer.movingItem.item.y = renderer.movingItem.origY;
          renderer.movingItem = null;
        }
        renderer.buildModeItem = null;
        renderer.selectedItem = null;
        if (uiManager) uiManager.closeModal();
      }
    });

    // Start main loop
    requestAnimationFrame(gameLoop);
    console.log('🚀 Game loop started successfully!');
  } catch (err) {
    console.error('❌ Failed to initialize game engine:', err);
  }
}

function gameLoop(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;

  if (gameState && gameState.gameSpeed > 0) {
    // 1 real second at 1x speed = 3.0 game minutes (1 game hour = 20 real seconds)
    gameState.minute += dt * 3.0 * gameState.gameSpeed;
    if (gameState.minute >= 60) {
      gameState.minute -= 60;
      gameState.hour++;

      // Check ingredient spoilage due to insufficient cold storage
      const spoilResult = gameState.economy.checkSpoilage(gameState);
      if (spoilResult && spoilResult.spoiled > 0 && uiManager) {
        uiManager.addNotification(`⚠️ Soğuk Depo Yetersiz! ${spoilResult.spoiled} birim malzeme sıcakta bozuldu 🤢 (Buzdolabı Satın Alın!)`, '🤢', 5000);
      }

      if (gameState.hour >= 23) {
        uiManager.openEndDayModal();
        gameState.gameSpeed = 0;
      }
    }

    customerSystem.update(dt);
    employeeSystem.update(dt);
    if (repairmanSystem) repairmanSystem.update(dt);
    if (questManager) questManager.update(dt);
    if (weatherManager) weatherManager.update(dt);
  }

  if (renderer && gameState) {
    renderer.render(gameState, gameState.gridManager);
  }

  if (uiManager) {
    uiManager.updateHUD();
  }

  requestAnimationFrame(gameLoop);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
} else {
  window.addEventListener('DOMContentLoaded', init);
}


