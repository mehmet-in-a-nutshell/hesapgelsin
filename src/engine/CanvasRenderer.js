/**
 * CanvasRenderer.js
 * High-performance 2.5D Isometric Canvas Renderer.
 * Features:
 * - Depth-sorted rendering ($Y$-sorting algorithm)
 * - Dynamic camera pan & zoom
 * - Mouse-to-grid raycasting
 * - Particle system (coffee steam, coin chimes, sparkles)
 * - Placement preview & grid indicators
 */

import { assetManager } from '../assets/AssetManager.js';
import { TILE_W, TILE_H, gridToIso, drawIsoDiamond } from '../assets/FurnitureAssets.js';
import { TrafficManager } from './TrafficManager.js';

function drawRoundRect(ctx, x, y, w, h, r) {
  if (w <= 0 || h <= 0) return;
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
  }
}

export class CanvasRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.trafficManager = new TrafficManager();
    this.lastTime = performance.now();

    // Camera State
    this.camera = {
      x: 0,
      y: 0,
      zoom: 1.0,
      targetZoom: 1.0,
      minZoom: 0.5,
      maxZoom: 2.2
    };

    // Interaction State
    this.hoverTile = null; // { x, y }
    this.selectedTile = null;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.buildModeItem = null; // Item being placed
    this.movingItem = null; // Item being moved: { item, origX, origY, origRotation }

    // Particle FX & Object Pool
    this.particles = [];
    this.particlePool = [];

    // Weather Particles System
    this.initWeatherParticles();

    this.initEvents();
  }

  initWeatherParticles() {
    this.weatherParticles = [];
    for (let i = 0; i < 90; i++) {
      this.weatherParticles.push(this.createRandomExteriorParticle());
    }
  }

  createRandomExteriorParticle() {
    const isNW = Math.random() < 0.5;
    let gx, gy;
    if (isNW) {
      // NW exterior strip: gy from -5 to -1, gx from -5 to 15
      gy = -1.2 - Math.random() * 4.0;
      gx = -5 + Math.random() * 20;
    } else {
      // NE exterior strip: gx from -5 to -1, gy from -5 to 15
      gx = -1.2 - Math.random() * 4.0;
      gy = -5 + Math.random() * 20;
    }

    return {
      gx,
      gy,
      gz: Math.random() * 200 + 30, // Height above ground in pixels
      speed: Math.random() * 140 + 180, // Fall speed for rain
      drift: (Math.random() - 0.5) * 12,
      size: Math.random() * 2.2 + 1.2,
      alpha: Math.random() * 0.45 + 0.45,
      length: Math.random() * 14 + 10,
      id: Math.random() * 100
    };
  }

  zoomIn() {
    this.camera.targetZoom = Math.min(this.camera.maxZoom, this.camera.targetZoom * 1.25);
  }

  zoomOut() {
    this.camera.targetZoom = Math.max(this.camera.minZoom, this.camera.targetZoom / 1.25);
  }

  resetZoom() {
    this.camera.targetZoom = 1.0;
    this.camera.x = 0;
    this.camera.y = 0;
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const parent = this.canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());

    // Mouse Panning & Hover
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0 || e.button === 2) {
        this.isDragging = true;
        this.dragStart = { x: e.clientX - this.camera.x, y: e.clientY - this.camera.y };
        this.mouseDownPos = { x: e.clientX, y: e.clientY };
        this.wasDragged = false;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging && this.mouseDownPos) {
        const dx = e.clientX - this.mouseDownPos.x;
        const dy = e.clientY - this.mouseDownPos.y;
        if (Math.hypot(dx, dy) > 5) {
          this.wasDragged = true;
        }
        this.camera.x = e.clientX - this.dragStart.x;
        this.camera.y = e.clientY - this.dragStart.y;
      }
      this.updateHoverTile(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Zooming
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      this.camera.targetZoom = Math.min(this.camera.maxZoom, Math.max(this.camera.minZoom, this.camera.targetZoom * zoomFactor));
    }, { passive: false });
  }

  /**
   * Convert Screen X/Y to Grid X/Y
   */
  screenToGrid(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (screenX - rect.left - rect.width / 2 - this.camera.x) / this.camera.zoom;
    const y = (screenY - rect.top - rect.height / 3 - this.camera.y) / this.camera.zoom;

    const gx = (x / (TILE_W / 2) + y / (TILE_H / 2)) / 2;
    const gy = (y / (TILE_H / 2) - x / (TILE_W / 2)) / 2;

    return {
      x: Math.floor(gx),
      y: Math.floor(gy)
    };
  }

  /**
   * Convert Grid X/Y to Screen Pixel Coordinates
   */
  gridToScreen(gx, gy) {
    const iso = gridToIso(gx, gy);
    const rect = this.canvas.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + this.camera.x + iso.x * this.camera.zoom;
    const y = rect.top + rect.height / 3 + this.camera.y + iso.y * this.camera.zoom;
    return { x, y };
  }

  updateHoverTile(screenX, screenY) {
    this.hoverTile = this.screenToGrid(screenX, screenY);
  }

  addParticle(x, y, text, color = '#ffd54f', icon = null, maxLife = 90) {
    let p;
    if (this.particlePool.length > 0) {
      p = this.particlePool.pop();
      p.x = x;
      p.y = y;
      p.vy = -0.4;
      p.alpha = 1.0;
      p.life = 0;
      p.maxLife = maxLife;
      p.text = text;
      p.color = color;
      p.icon = icon;
    } else {
      p = { x, y, vy: -0.4, alpha: 1.0, life: 0, maxLife, text, color, icon };
    }
    this.particles.push(p);
  }

  /**
   * Render Loop
   * @param {Object} gameState - GameState reference
   * @param {Object} gridManager - GridManager reference
   */
  render(gameState, gridManager) {
    const dpr = window.devicePixelRatio || 1;
    const ctx = this.ctx;
    const width = this.canvas.width / dpr;
    const height = this.canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Smooth Zoom interpolation
    this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * 0.15;

    ctx.clearRect(0, 0, width, height);

    // Warm Ambient Cafe Background Gradient
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, Math.max(width, height));
    bgGrad.addColorStop(0, '#2d241e');
    bgGrad.addColorStop(1, '#15110e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    // Camera Transform offset (Origin centered top)
    ctx.translate(width / 2 + this.camera.x, height / 3 + this.camera.y);
    ctx.scale(this.camera.zoom, this.camera.zoom);

    if (!assetManager.isReady) {
      ctx.restore();
      ctx.restore();
      return;
    }

    const { cols, rows, floorType, wallType, items } = gridManager;
    const locId = gameState.location ? gameState.location.id : 'university';
    const extMargin = 5; // 2 rows of sidewalk + 3 rows of asphalt road

    // Calculate frame delta time
    const now = performance.now();
    const dt = Math.min((now - (this.lastTime || now)) / 1000, 0.1);
    this.lastTime = now;

    // 0. DRAW EXTERIOR SIDEWALK & 3-ROW ASPHALT ROAD TILES
    ctx.save();
    ctx.globalAlpha = 0.95;
    for (let gy = -extMargin; gy < rows; gy++) {
      for (let gx = -extMargin; gx < cols; gx++) {
        // ONLY draw exterior tiles in the region strictly behind/beyond the walls (gx < 0 || gy < 0)
        if (gx >= 0 && gy >= 0) continue;
        // Skip far outer corner behind back walls
        if (gx < -extMargin + 1 && gy < -extMargin + 1) continue;

        const iso = gridToIso(gx, gy);
        const isRoad = (gy <= -3) || (gx <= -3);

        if (isRoad) {
          // Render Light-Medium City Asphalt Road Tile
          const roadImg = assetManager.getExteriorTile('asphalt');
          ctx.drawImage(roadImg, iso.x - TILE_W / 2 - 2, iso.y - TILE_H / 2 - 2);

          // White Dashed Center Lane Stripe Parallel to Road Edges (Ortadaki Şerit)
          // Top Road center lane (gy === -4): runs parallel along NW-SE diagonal
          if (gy === -4) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 4.8;
            ctx.setLineDash([20, 15]);
            ctx.beginPath();
            ctx.moveTo(iso.x - TILE_W / 4, iso.y - TILE_H / 4);
            ctx.lineTo(iso.x + TILE_W / 4, iso.y + TILE_H / 4);
            ctx.stroke();
            ctx.restore();
          }
          // Left Road center lane (gx === -4): runs parallel along NE-SW diagonal
          if (gx === -4) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 4.8;
            ctx.setLineDash([20, 15]);
            ctx.beginPath();
            ctx.moveTo(iso.x + TILE_W / 4, iso.y - TILE_H / 4);
            ctx.lineTo(iso.x - TILE_W / 4, iso.y + TILE_H / 4);
            ctx.stroke();
            ctx.restore();
          }
        } else {
          // Render Location Sidewalk Tile (Only for gx < 0 || gy < 0)
          if (gx < 0 || gy < 0) {
            const tileImg = assetManager.getExteriorTile(locId);
            ctx.drawImage(tileImg, iso.x - TILE_W / 2 - 2, iso.y - TILE_H / 2 - 2);

            // Concrete Curb Stone at Road Edge Boundary (gy === -2 or gx === -2)
            if (gy === -2) {
              ctx.save();
              ctx.strokeStyle = 'rgba(226, 232, 240, 0.75)';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(iso.x - TILE_W / 2, iso.y);
              ctx.lineTo(iso.x, iso.y + TILE_H / 2);
              ctx.stroke();
              ctx.restore();
            }
            if (gx === -2) {
              ctx.save();
              ctx.strokeStyle = 'rgba(226, 232, 240, 0.75)';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(iso.x, iso.y + TILE_H / 2);
              ctx.lineTo(iso.x + TILE_W / 2, iso.y);
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      }
    }

    // Render Exterior Weather Particles & Effects (Rain drops, Snowflakes, Sun dust)
    this.renderExteriorWeather(ctx, dt, gameState);

    ctx.restore();

    // Update dynamic road traffic
    this.trafficManager.update(dt, locId, cols, rows);

    // 1. DRAW FLOORS
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const iso = gridToIso(gx, gy);
        const floorImg = assetManager.getFloor(floorType);
        ctx.drawImage(floorImg, iso.x - TILE_W / 2 - 2, iso.y - TILE_H / 2 - 2);

        // Entrance mat on left wall doorway tile (0, 7)
        if (gx === 0 && gy === 7) {
          drawIsoDiamond(ctx, iso.x, iso.y, 44, 22, '#6d4c41', '#3e2723');
        } else {
          // Subtle grid lines
          drawIsoDiamond(ctx, iso.x, iso.y, TILE_W, TILE_H, null, 'rgba(255,255,255,0.05)');
        }
      }
    }

    // 2. DRAW BACK WALLS & WINDOWS
    for (let gx = 0; gx < cols; gx++) {
      const iso = gridToIso(gx, -1);
      const wallImg = (gx === 2 || gx === 6) ? assetManager.getWallWindow(wallType, 'NW') : assetManager.getWall(wallType, 'NW');
      ctx.drawImage(wallImg, iso.x - TILE_W / 2 - 2, iso.y - 70);
    }
    for (let gy = 0; gy < rows; gy++) {
      const iso = gridToIso(-1, gy);
      let wallImg;
      if (gy === 7) {
        // Entrance Door
        wallImg = assetManager.getWallDoor(wallType);
      } else if (gy === 5 || gy === 6 || gy === 8 || gy === 9) {
        // Realistic Windows on the left and right of the entrance door
        wallImg = assetManager.getWallWindow(wallType, 'NE');
      } else {
        wallImg = assetManager.getWall(wallType, 'NE');
      }
      ctx.drawImage(wallImg, iso.x - TILE_W / 2 - 2, iso.y - 70);
    }

    // 3. COLLECT ALL Y-SORTABLE ENTITIES (Furniture, District Props, Customers, Employees, Moving Traffic)
    const renderList = [];

    // Moving Road Traffic Entities
    const trafficRenderables = this.trafficManager.getRenderables(ctx, cols, rows);
    trafficRenderables.forEach(t => renderList.push(t));

    // District Props
    const districtProps = getDistrictPropsForLocation(locId);
    districtProps.forEach(p => {
      const iso = gridToIso(p.x, p.y);
      renderList.push({
        yDepth: (p.x + p.y) * 10 + 5,
        draw: () => {
          const img = assetManager.getDistrictProp(p.id);
          if (img) {
            ctx.drawImage(img, iso.x - img.width / 2, iso.y - img.height + 35);
          }
        }
      });
    });

    // Restroom 2x2 Structure & Occupancy Indicator
    renderList.push({
      yDepth: (14 + 1) * 10 + 1,
      draw: () => this.drawRestroom(ctx, gridManager)
    });

    // Bags reserved on chairs for customers visiting restroom
    if (gameState.customers) {
      gameState.customers.forEach(cust => {
        if (cust.hasBagOnChair && cust.assignedSeat) {
          renderList.push({
            yDepth: (cust.assignedSeat.x + cust.assignedSeat.y) * 10 + 4,
            draw: () => this.drawBagOnChair(ctx, cust)
          });
        }
      });
    }

    // Furniture & Equipment
    items.forEach(item => {
      const isBeingMoved = this.movingItem && this.movingItem.item && this.movingItem.item.uid === item.uid;
      const iso = gridToIso(item.x, item.y);
      renderList.push({
        yDepth: (item.x + item.y) * 10 + (item.zOrder || 0),
        draw: () => {
          const img = assetManager.getFurniture(item.id, item.rotation || 0);
          if (img) {
            ctx.save();
            if (isBeingMoved) {
              ctx.globalAlpha = 0.35; // Low opacity ghost at original location while being moved
            }
            if (item.isBroken) {
              // Semi-transparent red overlay painting over broken item silhouette
              const offCanvas = document.createElement('canvas');
              offCanvas.width = img.width;
              offCanvas.height = img.height;
              const offCtx = offCanvas.getContext('2d');
              offCtx.drawImage(img, 0, 0);
              offCtx.globalCompositeOperation = 'source-atop';
              offCtx.fillStyle = 'rgba(244, 67, 54, 0.65)';
              offCtx.fillRect(0, 0, img.width, img.height);

              ctx.drawImage(offCanvas, iso.x - img.width / 2, iso.y - img.height + 35);

              // Red tile highlight border
              drawIsoDiamond(ctx, iso.x, iso.y, TILE_W, TILE_H, 'rgba(244, 67, 54, 0.25)', '#f44336');

              // Floating 🔧 BOZUK or TAMİR EDİLİYOR badge above item
              ctx.save();
              if (item.isUnderRepair) {
                ctx.fillStyle = 'rgba(230, 81, 0, 0.9)';
                ctx.strokeStyle = '#ff9800';
                ctx.lineWidth = 1;
                drawRoundRect(ctx, iso.x - 42, iso.y - img.height + 15, 84, 18, 9);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 9px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🔧 TAMİR EDİLİYOR', iso.x, iso.y - img.height + 27);
              } else {
                ctx.fillStyle = 'rgba(183, 28, 28, 0.9)';
                ctx.strokeStyle = '#ff5252';
                ctx.lineWidth = 1;
                drawRoundRect(ctx, iso.x - 28, iso.y - img.height + 15, 56, 18, 9);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 9px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🔧 BOZUK', iso.x, iso.y - img.height + 27);
              }
              ctx.restore();
            } else {
              ctx.drawImage(img, iso.x - img.width / 2, iso.y - img.height + 35);
            }
            ctx.restore();
          }

          // Render ALL coffee cups & food pastries resting ON TOP of table surface!
          const itemsToDraw = (item.placedItems && item.placedItems.length > 0)
            ? item.placedItems
            : (item.placedItem ? [item.placedItem] : []);

          if (itemsToDraw.length > 0) {
            const tableTopY = iso.y - 28;

            itemsToDraw.forEach((pi, idx) => {
              // Position offset on top of table surface directly in front of customer's seat
              let offX = 0;
              let offY = 0;

              if (pi.seatDir === 'SE') {
                // Customer sits at NW of table -> place drink on NW side of table surface
                offX = -8; offY = -4;
              } else if (pi.seatDir === 'SW') {
                // Customer sits at NE of table -> place drink on NE side of table surface
                offX = 8; offY = -4;
              } else if (pi.seatDir === 'NW') {
                // Customer sits at SE of table -> place drink on SE side of table surface
                offX = 8; offY = 4;
              } else if (pi.seatDir === 'NE') {
                // Customer sits at SW of table -> place drink on SW side of table surface
                offX = -8; offY = 4;
              } else {
                const offsets = [
                  { x: -8, y: -4 },
                  { x: 8, y: 4 },
                  { x: 8, y: -4 },
                  { x: -8, y: 4 }
                ];
                const o = offsets[idx % offsets.length];
                offX = o.x;
                offY = o.y;
              }

              const drawX = iso.x + offX;
              const drawY = tableTopY + offY;

              if (pi.type === 'pastry') {
                // Ceramic plate
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.ellipse(drawX, drawY, 5.5, 2.8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#e0e0e0';
                ctx.lineWidth = 0.5;
                ctx.stroke();

                // Pastry / Food item
                ctx.fillStyle = '#d87040';
                ctx.beginPath();
                ctx.arc(drawX, drawY - 1, 2.8, 0, Math.PI * 2);
                ctx.fill();
              } else {
                // Ceramic saucer
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.ellipse(drawX, drawY, 5, 2.5, 0, 0, Math.PI * 2);
                ctx.fill();

                // Ceramic cup body
                ctx.fillStyle = '#eeeeee';
                ctx.beginPath();
                ctx.arc(drawX, drawY - 2.5, 3, 0, Math.PI * 2);
                ctx.fill();

                // Dark espresso / coffee liquid surface
                ctx.fillStyle = '#4e342e';
                ctx.beginPath();
                ctx.arc(drawX, drawY - 2.5, 2.0, 0, Math.PI * 2);
                ctx.fill();

                // Animated rising coffee steam line per cup
                const steamX = drawX + Math.sin(Date.now() / 250 + idx * 1.5) * 1.2;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(drawX, drawY - 5);
                ctx.lineTo(steamX, drawY - 10);
                ctx.stroke();
              }
            });
          }
        }
      });
    });

    // Customers & Employees (Grouped per tile for side-by-side offset)
    const tileOccupants = new Map();
    const allPeople = [];

    // Ambient Street Pedestrians
    if (this.customerSystem && this.customerSystem.pedestrians) {
      this.customerSystem.pedestrians.forEach(p => {
        const iso = gridToIso(p.x, p.y);
        renderList.push({
          yDepth: (p.x + p.y) * 10 + 5,
          draw: () => {
            const img = assetManager.getCharacter(p.type, p.animState || 'idle', p.dir || 'SE');
            if (img) {
              ctx.drawImage(img, iso.x - img.width / 2, iso.y - img.height + 12);
            }
          }
        });
      });
    }

    // Repairman Agents (Usta Tamirciler)
    if (this.repairmanSystem && this.repairmanSystem.repairmen) {
      this.repairmanSystem.repairmen.forEach(rm => {
        const iso = gridToIso(rm.x, rm.y);
        renderList.push({
          yDepth: (rm.x + rm.y) * 10 + 7,
          draw: () => {
            const img = assetManager.getCharacter('repairman', rm.animState || 'idle', rm.dir || 'SE');
            if (img) {
              ctx.drawImage(img, iso.x - img.width / 2, iso.y - img.height + 12);
            }

            // Draw Repairing Progress Pill when repairman is repairing
            if (rm.state === 'repairing') {
              const pct = Math.min(100, Math.floor((rm.repairTimer / rm.repairDuration) * 100));

              ctx.save();
              ctx.fillStyle = 'rgba(21, 101, 192, 0.95)';
              ctx.strokeStyle = '#64b5f6';
              ctx.lineWidth = 1;
              drawRoundRect(ctx, iso.x - 32, iso.y - img.height - 18, 64, 18, 9);
              ctx.fill();
              ctx.stroke();

              ctx.fillStyle = '#4caf50';
              drawRoundRect(ctx, iso.x - 29, iso.y - img.height - 15, Math.max(4, 58 * (pct / 100)), 12, 6);
              ctx.fill();

              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 9.5px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(`🔧 %${pct}`, iso.x, iso.y - img.height - 6);
              ctx.restore();
            }
          }
        });
      });
    }

    if (gameState.customers) {
      gameState.customers.forEach(cust => allPeople.push({ isEmployee: false, data: cust }));
    }
    if (gameState.employees) {
      gameState.employees.forEach(emp => allPeople.push({ isEmployee: true, data: emp }));
    }

    allPeople.forEach(person => {
      const p = person.data;
      const key = `${Math.floor(p.x)},${Math.floor(p.y)}`;
      if (!tileOccupants.has(key)) tileOccupants.set(key, []);
      tileOccupants.get(key).push(person);
    });

    tileOccupants.forEach(occupants => {
      occupants.forEach((person, idx) => {
        const p = person.data;
        const iso = gridToIso(p.x, p.y);

        // Side-by-side offset if 2 or more people share the same grid tile
        let offsetX = 0;
        let offsetY = 0;
        if (occupants.length >= 2) {
          offsetX = (idx % 2 === 0) ? -12 : 12;
          offsetY = (idx % 2 === 0) ? -4 : 4;
        }

        const drawX = iso.x + offsetX;
        const drawY = iso.y + offsetY;

        renderList.push({
          yDepth: (p.x + p.y) * 10 + (person.isEmployee ? 3 : 2) + idx * 0.1,
          draw: () => {
            const charType = person.isEmployee
              ? (p.type || (p.gender === 'female' ? 'barista_female' : 'barista_male'))
              : p.type;
            const img = assetManager.getCharacter(charType, p.animState, p.dir);
            ctx.drawImage(img, drawX - img.width / 2, drawY - img.height + 12);

            // Thought/Status emoji bubble above character
            if (p.activeBubble) {
              const bubbleImg = assetManager.getBubble(p.activeBubble);
              ctx.drawImage(bubbleImg, drawX - 18, drawY - img.height - 20);
            }
          }
        });
      });
    });

    // Sort by Y-Depth
    renderList.sort((a, b) => a.yDepth - b.yDepth);

    // Execute Depth-Sorted Draw Calls safely
    renderList.forEach(obj => {
      try {
        if (obj && typeof obj.draw === 'function') {
          obj.draw();
        }
      } catch (err) {
        console.warn('Render object error:', err);
      }
    });

    // 4. DRAW PLACEMENT PREVIEW / HOVER HIGHLIGHT
    if (this.hoverTile && this.hoverTile.x >= 0 && this.hoverTile.x < cols && this.hoverTile.y >= 0 && this.hoverTile.y < rows) {
      const iso = gridToIso(this.hoverTile.x, this.hoverTile.y);

      if (this.movingItem) {
        const canMove = gridManager.canMoveItem(this.movingItem.item, this.hoverTile.x, this.hoverTile.y);
        const highlightColor = canMove ? 'rgba(76, 175, 80, 0.45)' : 'rgba(244, 67, 54, 0.45)';
        const borderColor = canMove ? '#4caf50' : '#f44336';
        drawIsoDiamond(ctx, iso.x, iso.y, TILE_W, TILE_H, highlightColor, borderColor);

        // Preview item sprite on move destination
        const previewImg = assetManager.getFurniture(this.movingItem.item.id, this.movingItem.item.rotation || 0);
        ctx.save();
        ctx.globalAlpha = 0.75;
        ctx.drawImage(previewImg, iso.x - previewImg.width / 2, iso.y - previewImg.height + 35);
        ctx.restore();
      } else if (this.buildModeItem) {
        const canPlace = gridManager.canPlaceItem(this.hoverTile.x, this.hoverTile.y, this.buildModeItem);
        const highlightColor = canPlace ? 'rgba(76, 175, 80, 0.45)' : 'rgba(244, 67, 54, 0.45)';
        const borderColor = canPlace ? '#4caf50' : '#f44336';
        drawIsoDiamond(ctx, iso.x, iso.y, TILE_W, TILE_H, highlightColor, borderColor);

        // Preview item sprite
        const previewImg = assetManager.getFurniture(this.buildModeItem.id, this.buildModeItem.rotation || 0);
        ctx.save();
        ctx.globalAlpha = 0.75;
        ctx.drawImage(previewImg, iso.x - previewImg.width / 2, iso.y - previewImg.height + 35);
        ctx.restore();
      } else {
        // Standard hover diamond
        drawIsoDiamond(ctx, iso.x, iso.y, TILE_W, TILE_H, 'rgba(255, 255, 255, 0.15)', '#ffd54f');
      }
    }

    // DRAW SELECTED ITEM HIGHLIGHT
    if (this.selectedItem && this.selectedItem.x >= 0 && this.selectedItem.x < cols && this.selectedItem.y >= 0 && this.selectedItem.y < rows) {
      const selectedIso = gridToIso(this.selectedItem.x, this.selectedItem.y);
      drawIsoDiamond(ctx, selectedIso.x, selectedIso.y, TILE_W, TILE_H, 'rgba(255, 213, 79, 0.35)', '#ffd54f');
    }

    // 5. DRAW PARTICLES
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;

      const fadeStart = p.maxLife * 0.75;
      if (p.life > fadeStart) {
        p.alpha = 1.0 - (p.life - fadeStart) / (p.maxLife - fadeStart);
      } else {
        p.alpha = 1.0;
      }

      const iso = gridToIso(p.x, p.y);
      const floatY = (p.life / p.maxLife) * 36;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);

      // Text background pill for high contrast visibility
      ctx.font = 'bold 11.5px sans-serif';
      const textWidth = ctx.measureText(p.text).width;

      ctx.fillStyle = 'rgba(18, 14, 11, 0.88)';
      drawRoundRect(ctx, iso.x - textWidth / 2 - 6, iso.y - 45 - floatY - 11, textWidth + 12, 16, 8);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 213, 79, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Text fill with dark outline
      ctx.fillStyle = p.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.textAlign = 'center';
      ctx.strokeText(p.text, iso.x, iso.y - 45 - floatY);
      ctx.fillText(p.text, iso.x, iso.y - 45 - floatY);
      ctx.restore();

      if (p.life >= p.maxLife) {
        const expired = this.particles.splice(i, 1)[0];
        if (this.particlePool.length < 50) {
          this.particlePool.push(expired);
        }
      }
    }

    ctx.restore();
    ctx.restore();
  }

  renderExteriorWeather(ctx, dt, gameState) {
    const wm = this.weatherManager || (gameState && gameState.weatherManager);
    if (!wm) return;
    const weather = wm.currentWeather;
    if (!weather) return;

    if (!this.weatherParticles || this.weatherParticles.length === 0) {
      this.initWeatherParticles();
    }

    const time = Date.now() / 1000;

    ctx.save();

    if (weather.id === 'RAINY') {
      // Render Exterior Rain Drops Line
      ctx.lineWidth = 1.2;
      this.weatherParticles.forEach(p => {
        p.gz -= p.speed * dt;
        p.gx += 0.2 * dt;
        p.gy += 0.2 * dt;

        // Strict Exterior Boundary Check: If particle reaches ground or hits interior cafe space (gx >= 0 && gy >= 0), reset to top exterior
        if (p.gz <= 0 || (p.gx >= -0.2 && p.gy >= -0.2)) {
          const newP = this.createRandomExteriorParticle();
          p.gx = newP.gx;
          p.gy = newP.gy;
          p.gz = 200 + Math.random() * 40;
        }

        const iso = gridToIso(p.gx, p.gy);
        const screenX = iso.x;
        const screenY = iso.y - p.gz;

        ctx.strokeStyle = `rgba(160, 210, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(screenX - 3, screenY + p.length);
        ctx.stroke();
      });
    } else if (weather.id === 'SNOWY') {
      // Render Exterior Floating Snow Flakes
      this.weatherParticles.forEach(p => {
        p.gz -= (p.speed * 0.25) * dt;
        p.gx += Math.sin(time * 2 + p.id) * 0.4 * dt;

        if (p.gz <= 0 || (p.gx >= -0.2 && p.gy >= -0.2)) {
          const newP = this.createRandomExteriorParticle();
          p.gx = newP.gx;
          p.gy = newP.gy;
          p.gz = 190 + Math.random() * 40;
        }

        const iso = gridToIso(p.gx, p.gy);
        const screenX = iso.x + Math.sin(time * 1.5 + p.id) * 8;
        const screenY = iso.y - p.gz;

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (weather.id === 'SUNNY') {
      // Render Exterior Golden Dust Sparkles
      this.weatherParticles.forEach(p => {
        p.gz -= 8 * dt;
        p.gx += Math.cos(time + p.id) * 0.2 * dt;

        if (p.gz <= 0 || (p.gx >= -0.2 && p.gy >= -0.2)) {
          const newP = this.createRandomExteriorParticle();
          p.gx = newP.gx;
          p.gy = newP.gy;
          p.gz = 150 + Math.random() * 30;
        }

        const iso = gridToIso(p.gx, p.gy);
        const screenX = iso.x;
        const screenY = iso.y - p.gz;

        ctx.fillStyle = `rgba(255, 224, 130, ${p.alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, p.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore();
  }

  drawRestroom(ctx, gridManager) {
    const restroom = (gridManager && gridManager.restroom) ? gridManager.restroom : { x: 13, y: 0, isOccupied: false };
    const isOccupied = restroom.isOccupied;

    // 1. Restroom 2x2 Slate-Grey Ceramic Floor Tiles (13,0; 14,0; 13,1; 14,1)
    const tiles = [
      { x: 13, y: 0 },
      { x: 14, y: 0 },
      { x: 13, y: 1 },
      { x: 14, y: 1 }
    ];

    tiles.forEach(t => {
      const iso = gridToIso(t.x, t.y);
      // Slate Grey Ceramic Floor Tile with Grout Line
      drawIsoDiamond(ctx, iso.x, iso.y, TILE_W, TILE_H, '#546e7a', '#37474f');

      // Subtle diagonal sheen reflection
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(iso.x - 14, iso.y - 3);
      ctx.lineTo(iso.x + 14, iso.y + 3);
      ctx.stroke();
      ctx.restore();
    });

    // 2. 3D Wall Enclosure Panel on Right Edge (NE boundary along gx=14)
    const isoTR = gridToIso(14, 0);
    const isoDR = gridToIso(14, 1);
    const wallH = 44;

    ctx.save();
    // Solid 3D Right Side Wall Panel (Closing the right side of the cafe room)
    const wallGrad = ctx.createLinearGradient(isoTR.x, isoTR.y - wallH, isoDR.x + TILE_W / 2, isoDR.y + TILE_H / 2);
    wallGrad.addColorStop(0, '#455a64');
    wallGrad.addColorStop(1, '#263238');

    ctx.fillStyle = wallGrad;
    ctx.strokeStyle = '#1c2826';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(isoTR.x + TILE_W / 2, isoTR.y);
    ctx.lineTo(isoTR.x + TILE_W / 2, isoTR.y - wallH);
    ctx.lineTo(isoDR.x + TILE_W / 2, isoDR.y + TILE_H / 2 - wallH);
    ctx.lineTo(isoDR.x + TILE_W / 2, isoDR.y + TILE_H / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 3. 3D Isometric Angled Porcelain Toilet Bowl (Klozet) at (14, 0)
    const isoKlozet = gridToIso(14, 0);
    const kX = isoKlozet.x;
    const kY = isoKlozet.y;

    ctx.save();
    // Drop Shadow under Toilet Base
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(kX - 2, kY - 6, 13, 7, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // Porcelain Pedestal Base (Sculpted 3D Base)
    ctx.fillStyle = '#cfd8dc';
    ctx.strokeStyle = '#90a4ae';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(kX - 3, kY - 12, 10, 6, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3D Angled Bowl Body Fill & Gradient
    const bowlGrad = ctx.createLinearGradient(kX - 10, kY - 26, kX + 8, kY - 8);
    bowlGrad.addColorStop(0, '#ffffff');
    bowlGrad.addColorStop(0.7, '#eceff1');
    bowlGrad.addColorStop(1, '#b0bec5');

    ctx.fillStyle = bowlGrad;
    ctx.strokeStyle = '#78909c';
    ctx.lineWidth = 1.2;

    // Angled 3D Bowl Rim (Oval tilted along SW-NE isometric axis)
    ctx.beginPath();
    ctx.ellipse(kX - 2, kY - 17, 9, 5.5, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Deep Inner Water Depth & Glow (#00acc1 turquoise water)
    ctx.fillStyle = '#00acc1';
    ctx.beginPath();
    ctx.ellipse(kX - 2, kY - 17, 5.8, 3.0, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // White Porcelain Tank (Rezervuar) Angled at Back
    const tankGrad = ctx.createLinearGradient(kX + 1, kY - 38, kX + 14, kY - 20);
    tankGrad.addColorStop(0, '#ffffff');
    tankGrad.addColorStop(1, '#cfd8dc');

    ctx.fillStyle = tankGrad;
    ctx.strokeStyle = '#78909c';
    ctx.lineWidth = 1.2;

    // Tank 3D Isometric Box (Back-right facing)
    ctx.beginPath();
    ctx.moveTo(kX + 1, kY - 36);
    ctx.lineTo(kX + 12, kY - 31);
    ctx.lineTo(kX + 12, kY - 17);
    ctx.lineTo(kX + 1, kY - 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tank Top Lid
    ctx.fillStyle = '#eceff1';
    ctx.beginPath();
    ctx.moveTo(kX, kY - 38);
    ctx.lineTo(kX + 13, kY - 33);
    ctx.lineTo(kX + 9, kY - 30);
    ctx.lineTo(kX - 4, kY - 35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dual Flush Metallic Button on Lid
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.ellipse(kX + 5, kY - 33, 2.2, 1.2, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // 3D Toilet Paper Roll Holder on Adjacent Wall
    ctx.fillStyle = '#eceff1';
    ctx.strokeStyle = '#90a4ae';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(kX + 15, kY - 24, 3.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Paper hanging down
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(kX + 13, kY - 24, 4, 5);

    ctx.restore();

    // 4. 3D Isometric Angled Restroom Door & Occupancy LED Indicator at (13, 1)
    // Positioned on the front-left tile (13, 1) so customer physically walks through the doorway tile!
    const isoDoor = gridToIso(13, 1);
    const dX = isoDoor.x;
    const dY = isoDoor.y;

    ctx.save();
    // Light Coffee Brown Wood Door Frame (Açık Ton Kahve Kapı Kasası)
    ctx.fillStyle = '#6d4c41';
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = 1.5;

    // Doorway opening frame background (height 38px)
    drawRoundRect(ctx, dX - 14, dY - 42, 28, 38, 3);
    ctx.fill();
    ctx.stroke();

    // Light Coffee Wood Door Panel Gradient (#d7ccc8 -> #bcaaa4 -> #8d6e63)
    const woodGrad = ctx.createLinearGradient(dX - 12, dY - 40, dX + 12, dY - 8);
    woodGrad.addColorStop(0, '#d7ccc8');
    woodGrad.addColorStop(0.5, '#bcaaa4');
    woodGrad.addColorStop(1, '#8d6e63');

    ctx.fillStyle = woodGrad;
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 1.5;

    if (!isOccupied) {
      // DOOR IS OPEN / AJAR (Kapı açık - Müşteri içinden rahatça yürüyüp girer)
      ctx.beginPath();
      ctx.moveTo(dX - 12, dY - 38); // top-left hinge
      ctx.lineTo(dX + 1, dY - 43);  // top-right (swung inward)
      ctx.lineTo(dX + 1, dY - 8);   // bottom-right
      ctx.lineTo(dX - 12, dY - 3);  // bottom-left hinge
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // DOOR IS CLOSED (Kapı kapalı)
      ctx.beginPath();
      ctx.moveTo(dX - 12, dY - 38); // top-left
      ctx.lineTo(dX + 8, dY - 44);  // top-right
      ctx.lineTo(dX + 8, dY - 9);   // bottom-right
      ctx.lineTo(dX - 12, dY - 3);  // bottom-left
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Door Wood Grain Inset Panel Detail Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dX - 9, dY - 33);
    ctx.lineTo(dX + 3, dY - 37);
    ctx.lineTo(dX + 3, dY - 13);
    ctx.lineTo(dX - 9, dY - 9);
    ctx.closePath();
    ctx.stroke();

    // Gold Brass Lever Handle
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.ellipse(dX + 1, dY - 24, 3, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lever Handle Bar
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(dX - 3, dY - 25, 4, 1.8);

    // 5. OCCUPANCY INDICATOR LIGHT (🔴 DOLU / 🟢 BOŞ)
    const lightColor = isOccupied ? '#ff1744' : '#00e676';
    const lightBg = isOccupied ? 'rgba(40, 10, 10, 0.95)' : 'rgba(10, 35, 20, 0.95)';
    const lightText = isOccupied ? '🔴 DOLU' : '🟢 BOŞ';

    // Glowing Neon Glassmorphic Light Box Frame (Mounted neatly at dY - 56)
    ctx.save();
    ctx.fillStyle = lightBg;
    ctx.strokeStyle = lightColor;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = lightColor;

    drawRoundRect(ctx, dX - 22, dY - 57, 44, 14, 7);
    ctx.fill();
    ctx.stroke();

    // Inner glowing text
    ctx.fillStyle = lightColor;
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 3;
    ctx.shadowColor = lightColor;
    ctx.fillText(lightText, dX, dY - 47);
    ctx.restore();

    ctx.restore();
  }

  drawBagOnChair(ctx, cust) {
    if (!cust || !cust.hasBagOnChair || !cust.assignedSeat) return;

    const seat = cust.assignedSeat;
    const iso = gridToIso(seat.x, seat.y);

    ctx.save();
    // Render 3D Leather Backpack 🎒 on Chair
    const bX = iso.x;
    const bY = iso.y - 12;

    // Leather Bag Body
    ctx.fillStyle = '#6d4c41';
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 1.2;
    drawRoundRect(ctx, bX - 8, bY - 12, 16, 14, 4);
    ctx.fill();
    ctx.stroke();

    // Front Pocket
    ctx.fillStyle = '#8d6e63';
    drawRoundRect(ctx, bX - 5, bY - 6, 10, 7, 2);
    ctx.fill();
    ctx.stroke();

    // Gold Buckle Accent
    ctx.fillStyle = '#ffb300';
    ctx.fillRect(bX - 2, bY - 10, 4, 3);

    // Floating Reserved Badge: 🎒 Rezerve
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 1;
    drawRoundRect(ctx, bX - 25, bY - 30, 50, 15, 7);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎒 Rezerve', bX, bY - 19);

    ctx.restore();
  }
}

function getDistrictPropsForLocation(locId) {
  if (locId === 'university') {
    return [
      { id: 'TREE_OAK', x: -2, y: 13 },
      { id: 'TREE_OAK', x: 10, y: -2 },
      { id: 'BIKE_RACK', x: -2, y: 3 },
      { id: 'BULLETIN_BOARD', x: -2, y: 10 }
    ];
  } else if (locId === 'business') {
    return [
      { id: 'DIGITAL_BILLBOARD_STOCK', x: -2, y: 2 },
      { id: 'SKYSCRAPER_PILLAR', x: -2, y: 12 },
      { id: 'PLANTER_BOXWOOD', x: -2, y: 6 },
      { id: 'BOLLARD_LED', x: -2, y: 9 }
    ];
  } else if (locId === 'residential') {
    return [
      { id: 'TREE_MAPLE', x: -2, y: 2 },
      { id: 'TREE_MAPLE', x: 9, y: -2 },
      { id: 'CAT_SHELTER', x: -2, y: 11 },
      { id: 'PARK_BENCH_WOOD', x: -2, y: 6 },
      { id: 'FLOWER_BED', x: -2, y: 8 }
    ];
  } else if (locId === 'entertainment') {
    return [
      { id: 'NEON_ART_SCULPTURE', x: -2, y: 3 },
      { id: 'THEATER_POSTER_STAND', x: -2, y: 10 },
      { id: 'MUSIC_BUSKER_STAGE', x: 4, y: -2 },
      { id: 'VINTAGE_STREET_LAMP', x: -2, y: 7 },
      { id: 'POT_BOUGAINVILLEA', x: -2, y: 13 }
    ];
  } else if (locId === 'tourist' || locId === 'historic') {
    return [
      { id: 'LAMP_ANTIQUE', x: -2, y: 2 },
      { id: 'LAMP_ANTIQUE', x: -2, y: 12 },
      { id: 'POT_BOUGAINVILLEA', x: -2, y: 5 },
      { id: 'FOUNTAIN_STONE', x: 9, y: -2 },
      { id: 'POT_BOUGAINVILLEA', x: -2, y: 9 }
    ];
  }
  return [
    { id: 'TREE_OAK', x: -2, y: 3 },
    { id: 'LAMP_ANTIQUE', x: -2, y: 11 }
  ];
}
