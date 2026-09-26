/**
 * TrafficManager.js
 * Manages animated dynamic traffic (cars, bicycles, skateboarders, scooters, buses)
 * moving along the 3-row asphalt road outside the cafe.
 *
 * Features:
 * - Vehicles spawn ONLY at exact road endpoints (-5 to cols+3/rows+3).
 * - Slower, realistic travel speeds.
 * - Sparse, natural traffic intervals.
 * - 100% PARALLEL & RIGHT-SIDE UP vehicle alignment for both roads.
 * - 1.4x enlarged vehicle scale relative to pedestrians.
 */

import { TILE_W, TILE_H, gridToIso } from '../assets/FurnitureAssets.js';

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

export class TrafficManager {
  constructor() {
    this.entities = [];
    this.spawnTimer = 0;
    this.spawnInterval = 6.0; // Sparse traffic (spawn every 6 - 12s)

    // Initial vehicle positioned calmly on map load
    this.spawnVehicle('university', 14, 14);
    if (this.entities.length > 0) {
      this.entities[0].progress = 3;
    }
  }

  update(dt, locId, cols, rows) {
    // 1. Spawn new vehicles sparsely
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnInterval = 6.0 + Math.random() * 6.0;
      this.spawnVehicle(locId, cols, rows);
    }

    // 2. Update positions & despawn exactly at road boundaries
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const e = this.entities[i];
      e.progress += e.speed * e.dir * dt;
      e.animTimer += dt * 4;

      let gx, gy;
      if (e.road === 'TOP') {
        gx = e.progress;
        gy = -4; // Center lane of 3-row top road
      } else {
        gx = -4; // Center lane of 3-row left road
        gy = e.progress;
      }

      e.gx = gx;
      e.gy = gy;

      const roadEnd = (e.road === 'TOP' ? cols : rows) - 1;
      const roadStart = -5;

      // Despawn as soon as entity reaches or crosses road endpoints
      if (e.dir > 0 && e.progress > roadEnd) {
        this.entities.splice(i, 1);
      } else if (e.dir < 0 && e.progress < roadStart) {
        this.entities.splice(i, 1);
      }
    }
  }

  spawnVehicle(locId, cols, rows) {
    const road = Math.random() < 0.5 ? 'TOP' : 'LEFT';
    const dir = Math.random() < 0.5 ? 1 : -1;
    
    const roadEnd = (road === 'TOP' ? cols : rows) - 1;
    const roadStart = -5;

    // Spawn EXACTLY at start or end of the road grid
    const startProgress = dir > 0 ? roadStart : roadEnd;

    const type = this.pickVehicleType(locId);

    // Slower, calm, realistic speeds (tiles per second)
    let speed = 1.4 + Math.random() * 0.4; // Default cars (~1.4 - 1.8)
    if (type === 'SKATEBOARD' || type === 'BIKE') speed = 0.9 + Math.random() * 0.3; // (~0.9 - 1.2)
    if (type === 'SCOOTER') speed = 1.2 + Math.random() * 0.3; // (~1.2 - 1.5)
    if (type === 'SPORTS_CAR' || type === 'LUXURY_CAR') speed = 1.8 + Math.random() * 0.4; // (~1.8 - 2.2)

    const colors = {
      BIKE: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
      SKATEBOARD: ['#ec4899', '#06b6d4', '#f97316', '#84cc16'],
      SCOOTER: ['#14b8a6', '#6366f1', '#f43f5e', '#eab308'],
      TAXI: ['#eab308'],
      LUXURY_CAR: ['#1e293b', '#0f172a', '#1e3a8a', '#334155'],
      SPORTS_CAR: ['#dc2626', '#2563eb', '#0284c7', '#d97706'],
      COMPACT_CAR: ['#10b981', '#f43f5e', '#8b5cf6', '#06b6d4'],
      VINTAGE_BUS: ['#b91c1c', '#15803d', '#1d4ed8'],
      VINTAGE_CAR: ['#9a3412', '#065f46', '#1e1b4b']
    };

    const colorList = colors[type] || ['#3b82f6'];
    const color = colorList[Math.floor(Math.random() * colorList.length)];

    this.entities.push({
      id: Math.random().toString(36).substr(2, 9),
      type,
      road,
      dir,
      progress: startProgress,
      gx: road === 'TOP' ? startProgress : -4,
      gy: road === 'TOP' ? -4 : startProgress,
      speed,
      color,
      animTimer: Math.random() * 10
    });
  }

  pickVehicleType(locId) {
    const r = Math.random();
    if (locId === 'university') {
      if (r < 0.40) return 'BIKE';
      if (r < 0.70) return 'SKATEBOARD';
      if (r < 0.85) return 'SCOOTER';
      return 'COMPACT_CAR';
    } else if (locId === 'business') {
      if (r < 0.45) return 'TAXI';
      if (r < 0.75) return 'LUXURY_CAR';
      if (r < 0.90) return 'SPORTS_CAR';
      return 'SCOOTER';
    } else if (locId === 'residential' || locId === 'neighborhood') {
      if (r < 0.40) return 'BIKE';
      if (r < 0.70) return 'COMPACT_CAR';
      if (r < 0.88) return 'SCOOTER';
      return 'SKATEBOARD';
    } else if (locId === 'entertainment') {
      if (r < 0.35) return 'SPORTS_CAR';
      if (r < 0.65) return 'TAXI';
      if (r < 0.85) return 'SKATEBOARD';
      return 'SCOOTER';
    } else if (locId === 'tourist' || locId === 'historic') {
      if (r < 0.35) return 'VINTAGE_BUS';
      if (r < 0.65) return 'BIKE';
      if (r < 0.85) return 'VINTAGE_CAR';
      return 'SCOOTER';
    }

    if (r < 0.40) return 'BIKE';
    if (r < 0.75) return 'COMPACT_CAR';
    return 'TAXI';
  }

  getRenderables(ctx, cols = 14, rows = 14) {
    const renderables = [];

    this.entities.forEach(e => {
      const roadStart = -5;
      const roadEnd = (e.road === 'TOP' ? cols : rows) - 1;

      // Filter out any entity outside exact road boundaries
      if (e.progress < roadStart || e.progress > roadEnd) return;

      const iso = gridToIso(e.gx, e.gy);
      renderables.push({
        yDepth: (e.gx + e.gy) * 10 + 2,
        draw: () => this.renderVehicle(ctx, e, iso)
      });
    });

    return renderables;
  }

  renderVehicle(ctx, e, iso) {
    if (!ctx || !e || !iso) return;
    const isTopRoad = e.road === 'TOP';
    const scaleFactor = 1.4; // 1.4x scale up for realistic vehicle size

    ctx.save();
    try {
      // 1. Translate origin to tile position
      ctx.translate(iso.x, iso.y);

      // 2. Rotate & Scale so vehicle is 100% PARALLEL and RIGHT-SIDE UP
      if (isTopRoad) {
        // TOP road (NW to SE diagonal)
        ctx.rotate(0.463645); // ~26.565 degrees
        if (e.dir < 0) {
          ctx.scale(-scaleFactor, scaleFactor); // Flip horizontally facing up-left
        } else {
          ctx.scale(scaleFactor, scaleFactor);  // Facing down-right
        }
      } else {
        // LEFT road (NE to SW diagonal)
        ctx.rotate(-0.463645); // ~ -26.565 degrees (keeps wheels facing down on screen)
        if (e.dir > 0) {
          ctx.scale(-scaleFactor, scaleFactor); // Flip horizontally facing down-left
        } else {
          ctx.scale(scaleFactor, scaleFactor);  // Facing up-right
        }
      }

      // Draw vehicle at local origin (0, 0)
      if (e.type === 'BIKE') {
        this.renderBike(ctx, 0, 0, e);
      } else if (e.type === 'SKATEBOARD') {
        this.renderSkateboard(ctx, 0, 0, e);
      } else if (e.type === 'SCOOTER') {
        this.renderScooter(ctx, 0, 0, e);
      } else if (e.type === 'VINTAGE_BUS') {
        this.renderBus(ctx, 0, 0, e);
      } else {
        this.renderCar(ctx, 0, 0, e);
      }
    } catch (err) {
      console.warn('Vehicle render error:', err);
    }
    ctx.restore();
  }

  renderBike(ctx, cx, cy, e) {
    // 1. Oval Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 14, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Wheels (Rear: -11, Front: +11)
    const drawWheel = (wx, wy) => {
      // Outer Tire
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(wx, wy, 5.5, 0, Math.PI * 2);
      ctx.stroke();

      // Silver Rim / Hub
      ctx.fillStyle = '#cbd5e0';
      ctx.beginPath();
      ctx.arc(wx, wy, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Spokes cross
      ctx.strokeStyle = 'rgba(203, 213, 224, 0.6)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(wx - 4, wy); ctx.lineTo(wx + 4, wy);
      ctx.moveTo(wx, wy - 4); ctx.lineTo(wx, wy + 4);
      ctx.stroke();
    };

    drawWheel(cx - 11, cy - 2); // Rear Wheel
    drawWheel(cx + 11, cy - 2); // Front Wheel

    // 3. Bicycle Frame Tubes (Diamond Geometry facing +X forward)
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    // Rear stays: rear hub (-11, -2) to seat post (-5, -12) and bottom bracket (-1, -2)
    ctx.moveTo(cx - 11, cy - 2);
    ctx.lineTo(cx - 5, cy - 12);
    ctx.lineTo(cx - 1, cy - 2);
    ctx.lineTo(cx - 11, cy - 2);

    // Main triangle: seat post (-5, -12) to head tube (+6, -13) and bottom bracket (-1, -2)
    ctx.moveTo(cx - 5, cy - 12);
    ctx.lineTo(cx + 6, cy - 13);
    ctx.lineTo(cx - 1, cy - 2);

    // Front fork: head tube (+6, -13) down to front hub (+11, -2)
    ctx.lineTo(cx + 11, cy - 2);
    ctx.stroke();

    // 4. Saddle / Seat (facing forward)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(cx - 5.5, cy - 13.5, 3.5, 1.5, -Math.PI / 12, 0, Math.PI * 2);
    ctx.fill();

    // 5. Handlebars & Stem (extending forward towards +X)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy - 13);
    ctx.lineTo(cx + 8, cy - 17); // Fork stem up & forward
    ctx.lineTo(cx + 11, cy - 17); // Handlebar grip forward (+X)
    ctx.stroke();

    // 6. Lights & Reflectors
    // Front LED Headlight (glowing white beam forward +X)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx + 9, cy - 15, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.beginPath();
    ctx.moveTo(cx + 10, cy - 16);
    ctx.lineTo(cx + 20, cy - 19);
    ctx.lineTo(cx + 20, cy - 11);
    ctx.closePath();
    ctx.fill();

    // Rear Red Reflector Light (pointing -X)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(cx - 7.5, cy - 12, 1.8, 2);

    // 7. Dynamic Pedaling Legs
    const pedalAngle = e.animTimer * 5;
    const pedalR = 3;
    const pedalX1 = (cx - 1) + Math.cos(pedalAngle) * pedalR;
    const pedalY1 = (cy - 2) + Math.sin(pedalAngle) * pedalR;
    const pedalX2 = (cx - 1) - Math.cos(pedalAngle) * pedalR;
    const pedalY2 = (cy - 2) - Math.sin(pedalAngle) * pedalR;

    // Legs / Trousers
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.2;
    // Left leg
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - 14);
    ctx.lineTo(cx, cy - 7);
    ctx.lineTo(pedalX1, pedalY1);
    ctx.stroke();
    // Right leg
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - 14);
    ctx.lineTo(cx + 2, cy - 8);
    ctx.lineTo(pedalX2, pedalY2);
    ctx.stroke();

    // 8. Cyclist Torso (Tilted FORWARD -Math.PI / 8 towards handlebars!)
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.ellipse(cx + 1, cy - 21, 4.5, 7.5, -Math.PI / 8, 0, Math.PI * 2);
    ctx.fill();

    // Cyclist Backpack (strapped on rear -X)
    ctx.fillStyle = '#334155';
    drawRoundRect(ctx, cx - 6, cy - 25, 4.5, 7, 1.5);
    ctx.fill();

    // 9. Cyclist Arms (Reaching FORWARD to hold handlebars at +X)
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + 3, cy - 23); // Shoulder
    ctx.lineTo(cx + 7, cy - 18); // Elbow
    ctx.lineTo(cx + 10, cy - 17); // Hand on handlebar grip
    ctx.stroke();

    // 10. Cyclist Head & Helmet with Forward Visor (+X)
    // Head skin
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(cx + 4, cy - 28, 4, 0, Math.PI * 2);
    ctx.fill();

    // Sport Helmet (Color matched)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx + 4, cy - 29.5, 4.5, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();

    // Helmet Sun Visor (Pointing FORWARD +X)
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy - 31);
    ctx.lineTo(cx + 10, cy - 29);
    ctx.lineTo(cx + 7, cy - 27);
    ctx.closePath();
    ctx.fill();
  }

  renderSkateboard(ctx, cx, cy, e) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 10, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = e.color;
    drawRoundRect(ctx, cx - 10, cy - 2, 20, 3.5, 1.5);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 8, cy + 1, 2.5, 2);
    ctx.fillRect(cx + 5, cy + 1, 2.5, 2);

    const bobbing = Math.sin(e.animTimer * 1.5) * 1.2;

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy - 2);
    ctx.lineTo(cx - 3, cy - 10 + bobbing);
    ctx.moveTo(cx + 5, cy - 2);
    ctx.lineTo(cx + 3, cy - 10 + bobbing);
    ctx.stroke();

    ctx.fillStyle = e.color;
    drawRoundRect(ctx, cx - 5, cy - 20 + bobbing, 10, 11, 3);
    ctx.fill();

    ctx.strokeStyle = e.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - 18 + bobbing);
    ctx.lineTo(cx - 9, cy - 13 + bobbing);
    ctx.moveTo(cx + 4, cy - 18 + bobbing);
    ctx.lineTo(cx + 9, cy - 14 + bobbing);
    ctx.stroke();

    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(cx + 1, cy - 23 + bobbing, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(cx + 1, cy - 24.5 + bobbing, 4, Math.PI, Math.PI * 2);
    ctx.fill();

    // Forward cap visor (+X)
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.moveTo(cx + 1, cy - 25.5 + bobbing);
    ctx.lineTo(cx + 6, cy - 24 + bobbing);
    ctx.lineTo(cx + 3, cy - 23 + bobbing);
    ctx.closePath();
    ctx.fill();
  }

  renderScooter(ctx, cx, cy, e) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 11, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#334155';
    ctx.fillRect(cx - 10, cy - 1, 20, 2.5);

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(cx - 9, cy + 1, 2.5, 0, Math.PI * 2);
    ctx.arc(cx + 9, cy + 1, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#cbd5e0';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx + 7, cy - 1);
    ctx.lineTo(cx + 7, cy - 16);
    ctx.lineTo(cx + 10, cy - 16);
    ctx.stroke();

    // Scooter Headlight (+X)
    ctx.fillStyle = '#feef8a';
    ctx.fillRect(cx + 8, cy - 17, 2.5, 2);

    // Rider Torso
    ctx.fillStyle = e.color;
    drawRoundRect(ctx, cx - 3, cy - 18, 7, 12, 2);
    ctx.fill();

    // Rider Arms extending to handlebars (+X)
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx + 1, cy - 15);
    ctx.lineTo(cx + 7, cy - 16);
    ctx.stroke();

    // Rider Helmet & Visor (+X)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(cx + 1, cy - 22, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(cx + 1, cy - 24);
    ctx.lineTo(cx + 6, cy - 22);
    ctx.lineTo(cx + 4, cy - 20);
    ctx.closePath();
    ctx.fill();
  }

  renderCar(ctx, cx, cy, e) {
    const isTaxi = e.type === 'TAXI';
    const isSports = e.type === 'SPORTS_CAR';
    const isLuxury = e.type === 'LUXURY_CAR';

    // 1. Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 26, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Headlight Beam Glow (Facing forward towards +X)
    ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx + 28, cy + 1, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Metallic Body Shell
    const carGrad = ctx.createLinearGradient(cx - 22, cy - 14, cx + 22, cy + 2);
    if (isTaxi) {
      carGrad.addColorStop(0, '#fef08a');
      carGrad.addColorStop(0.5, '#eab308');
      carGrad.addColorStop(1, '#ca8a04');
    } else if (isSports) {
      carGrad.addColorStop(0, '#fca5a5');
      carGrad.addColorStop(0.5, e.color);
      carGrad.addColorStop(1, '#991b1b');
    } else if (isLuxury) {
      carGrad.addColorStop(0, '#475569');
      carGrad.addColorStop(0.5, e.color);
      carGrad.addColorStop(1, '#020617');
    } else {
      carGrad.addColorStop(0, '#ffffff');
      carGrad.addColorStop(0.5, e.color);
      carGrad.addColorStop(1, '#1e293b');
    }

    ctx.fillStyle = carGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 22, cy - 1);
    ctx.quadraticCurveTo(cx - 24, cy - 6, cx - 16, cy - 9);
    ctx.lineTo(cx - 8, cy - 14);
    ctx.lineTo(cx + 6, cy - 14);
    ctx.lineTo(cx + 16, cy - 8);
    ctx.quadraticCurveTo(cx + 24, cy - 4, cx + 22, cy);
    ctx.lineTo(cx + 20, cy + 3);
    ctx.lineTo(cx - 20, cy + 3);
    ctx.closePath();
    ctx.fill();

    // 4. Glass Windshield Glare
    ctx.fillStyle = 'rgba(186, 230, 253, 0.75)';
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 13);
    ctx.lineTo(cx + 5, cy - 13);
    ctx.lineTo(cx + 14, cy - 8);
    ctx.lineTo(cx - 12, cy - 8);
    ctx.closePath();
    ctx.fill();

    // 5. Wheels
    const drawWheel = (wx, wy) => {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(wx, wy, 5, 3.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.ellipse(wx, wy, 2.2, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    drawWheel(cx - 12, cy + 2);
    drawWheel(cx + 12, cy + 2);

    // 6. Taxi Roof Sign
    if (isTaxi) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 3, cy - 17, 7, 3);
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 3px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TAXI', cx, cy - 14.5);
    }
  }

  renderBus(ctx, cx, cy, e) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 3, 30, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    const busGrad = ctx.createLinearGradient(cx - 28, cy - 22, cx + 28, cy + 2);
    busGrad.addColorStop(0, '#fef08a');
    busGrad.addColorStop(0.4, e.color);
    busGrad.addColorStop(1, '#7f1d1d');

    ctx.fillStyle = busGrad;
    drawRoundRect(ctx, cx - 28, cy - 20, 56, 20, 3);
    ctx.fill();

    ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
    for (let wx = cx - 20; wx <= cx + 16; wx += 9) {
      ctx.fillRect(wx, cy - 17, 6, 7);
    }

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(cx - 16, cy + 1, 6, 4.5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 16, cy + 1, 6.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
