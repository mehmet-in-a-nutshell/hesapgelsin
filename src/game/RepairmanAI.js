/**
 * RepairmanAI.js
 * Manages repairman agents (Usta Tamirci).
 * Spawns a repairman when player requests an item repair, navigates to the broken item,
 * executes a 1-game-hour repair animation with sparks & wrench sound effects, fixes the item,
 * and exits the cafe.
 */

import { ITEM_CATALOG } from './GridManager.js';
import { audioEngine } from '../audio/AudioEngine.js';

export class RepairmanSystem {
  constructor(gameState, renderer) {
    this.gameState = gameState;
    this.renderer = renderer;
    this.uiManager = null;
    this.repairmen = [];
  }

  /**
   * Dispatch a Repairman to fix a broken item
   */
  dispatchRepairman(item) {
    if (!item || !item.isBroken) return null;

    item.isUnderRepair = true;

    // Start at entrance doorway (0, 7)
    const entrance = this.gameState.gridManager.entrancePos || { x: 0, y: 7 };

    // Find path to item position
    const path = this.gameState.gridManager.pathfinder.findPath(entrance.x, entrance.y, item.x, item.y);

    const repairman = {
      id: `repairman_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      x: entrance.x,
      y: entrance.y,
      gridX: entrance.x,
      gridY: entrance.y,
      targetItemUid: item.uid,
      targetItem: item,
      targetTile: { x: item.x, y: item.y },
      state: 'walking_to_item', // 'walking_to_item', 'repairing', 'walking_to_exit'
      path: path.length > 0 ? path : [{ x: entrance.x, y: entrance.y }],
      pathIndex: 0,
      speed: 2.5, // tile walk speed per second
      moveProgress: 0,
      repairTimer: 0, // game minutes spent repairing
      repairDuration: 60, // 1 game hour = 60 game minutes!
      dir: 'SE',
      animFrame: 0,
      animTime: 0,
      sparkTimer: 0
    };

    this.repairmen.push(repairman);
    return repairman;
  }

  update(dt) {
    if (this.gameState.gameSpeed === 0) return; // Paused

    for (let i = this.repairmen.length - 1; i >= 0; i--) {
      const rm = this.repairmen[i];

      // Check if target item was deleted/removed while repairman was en route
      const itemExists = this.gameState.gridManager.items.some(it => it.uid === rm.targetItemUid);
      if (!itemExists && rm.state !== 'walking_to_exit') {
        rm.state = 'walking_to_exit';
        const entrance = this.gameState.gridManager.entrancePos || { x: 0, y: 7 };
        rm.path = this.gameState.gridManager.pathfinder.findPath(rm.gridX, rm.gridY, entrance.x, entrance.y);
        rm.pathIndex = 0;
      }

      if (rm.state === 'walking_to_item') {
        this.updateWalking(rm, dt, () => {
          // Reached item! Begin repairing!
          rm.state = 'repairing';
          rm.repairTimer = 0;
          rm.animState = 'repair';
        });
      } else if (rm.state === 'repairing') {
        // Increment repair timer by in-game minutes
        // 1 real sec at 1x = 3 game minutes
        const gameMinutesPassed = dt * 3.0 * this.gameState.gameSpeed;
        rm.repairTimer += gameMinutesPassed;

        rm.animTime += dt;
        if (rm.animTime >= 0.12) {
          rm.animTime = 0;
          rm.animFrame = (rm.animFrame + 1) % 4;
        }
        rm.animState = 'repair';

        // Emit spark & wrench particles periodically around item
        rm.sparkTimer += dt;
        if (rm.sparkTimer >= 0.8) {
          rm.sparkTimer = 0;
          if (this.renderer) {
            const particleIcons = ['🔧', '⚡', '⚙️'];
            const icon = particleIcons[Math.floor(Math.random() * particleIcons.length)];
            this.renderer.addParticle(rm.targetTile.x, rm.targetTile.y, icon, '#ffd54f');
          }
        }

        // Check if 1 in-game hour (60 game minutes) elapsed
        if (rm.repairTimer >= rm.repairDuration) {
          // REPAIR COMPLETED!
          const targetItem = this.gameState.gridManager.items.find(it => it.uid === rm.targetItemUid);
          if (targetItem) {
            targetItem.isBroken = false;
            targetItem.isUnderRepair = false;

            const itemDef = ITEM_CATALOG[targetItem.id];
            const name = itemDef ? itemDef.name : 'Eşya';

            if (this.renderer) {
              this.renderer.addParticle(targetItem.x, targetItem.y, 'Tamir Edildi! ✨', '#4caf50');
            }

            if (this.uiManager) {
              this.uiManager.addNotification(`✨ ${name} başarıyla tamir edildi!`, '✨', 4000);
            }

            audioEngine.playLevelUp();
          }

          // Walk back to entrance exit
          rm.state = 'walking_to_exit';
          const entrance = this.gameState.gridManager.entrancePos || { x: 0, y: 7 };
          rm.path = this.gameState.gridManager.pathfinder.findPath(rm.gridX, rm.gridY, entrance.x, entrance.y);
          rm.pathIndex = 0;
        }
      } else if (rm.state === 'walking_to_exit') {
        this.updateWalking(rm, dt, () => {
          // Reached entrance exit, remove repairman!
          this.repairmen.splice(i, 1);
        });
      }
    }
  }

  updateWalking(rm, dt, onComplete) {
    if (!rm.path || rm.path.length === 0 || rm.pathIndex >= rm.path.length - 1) {
      if (onComplete) onComplete();
      return;
    }

    const currentTile = rm.path[rm.pathIndex];
    const nextTile = rm.path[rm.pathIndex + 1];

    rm.moveProgress += dt * rm.speed * this.gameState.gameSpeed;

    const dx = nextTile.x - currentTile.x;
    const dy = nextTile.y - currentTile.y;

    // Set facing direction
    if (dx > 0 && dy >= 0) rm.dir = 'SE';
    else if (dx <= 0 && dy > 0) rm.dir = 'SW';
    else if (dx < 0 && dy <= 0) rm.dir = 'NW';
    else if (dx >= 0 && dy < 0) rm.dir = 'NE';

    rm.x = currentTile.x + dx * rm.moveProgress;
    rm.y = currentTile.y + dy * rm.moveProgress;

    rm.animTime += dt;
    if (rm.animTime >= 0.15) {
      rm.animTime = 0;
      rm.animFrame = (rm.animFrame + 1) % 4;
    }
    rm.animState = `walk_${rm.animFrame}`;

    if (rm.moveProgress >= 1.0) {
      rm.moveProgress = 0;
      rm.pathIndex++;
      rm.gridX = nextTile.x;
      rm.gridY = nextTile.y;
      rm.x = nextTile.x;
      rm.y = nextTile.y;

      if (rm.pathIndex >= rm.path.length - 1) {
        if (onComplete) onComplete();
      }
    }
  }
}
