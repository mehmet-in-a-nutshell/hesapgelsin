/**
 * FurnitureAssets.js
 * Programmatically renders high-resolution 2.5D isometric vector illustrations for cafe furniture,
 * equipment tiers, floors, walls, and decorations onto offscreen canvases.
 */

export const TILE_W = 64;
export const TILE_H = 32;

// Utility: convert grid to screen iso offset
export function gridToIso(gx, gy) {
  return {
    x: (gx - gy) * (TILE_W / 2),
    y: (gx + gy) * (TILE_H / 2)
  };
}

const canvasCache = new Map();

function createCacheCanvas(width, height) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  return c;
}

/**
 * Draw base isometric tile diamond
 */
export function drawIsoDiamond(ctx, cx, cy, w = TILE_W, h = TILE_H, fillColor, strokeColor = null) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - h / 2);
  ctx.lineTo(cx + w / 2, cy);
  ctx.lineTo(cx, cy + h / 2);
  ctx.lineTo(cx - w / 2, cy);
  ctx.closePath();
  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

// ----------------------------------------------------
// FLOOR TILES
// ----------------------------------------------------
export function renderFloorTile(type) {
  const key = `floor_${type}`;
  if (canvasCache.has(key)) return canvasCache.get(key);

  const canvas = createCacheCanvas(TILE_W + 4, TILE_H + 4);
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  if (type === 'wood_basic') {
    // Basic Warm Oak Floor
    drawIsoDiamond(ctx, cx, cy, TILE_W, TILE_H, '#cfa16d', '#ab804e');
    // Plank lines
    ctx.strokeStyle = 'rgba(120,70,30,0.25)';
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * 8 - 12, cy - TILE_H / 2 + Math.abs(i) * 3);
      ctx.lineTo(cx + i * 8 + 12, cy + TILE_H / 2 - Math.abs(i) * 3);
      ctx.stroke();
    }
  } else if (type === 'wood_premium') {
    // Dark Mahogany Herringbone
    drawIsoDiamond(ctx, cx, cy, TILE_W, TILE_H, '#5c3317', '#3d200d');
    ctx.strokeStyle = 'rgba(255,200,150,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - TILE_W / 2, cy);
    ctx.lineTo(cx, cy - TILE_H / 2);
    ctx.lineTo(cx + TILE_W / 2, cy);
    ctx.stroke();
  } else if (type === 'tile_marble') {
    // Polished Marble
    const grad = ctx.createLinearGradient(cx - TILE_W / 2, cy - TILE_H / 2, cx + TILE_W / 2, cy + TILE_H / 2);
    grad.addColorStop(0, '#f0ede6');
    grad.addColorStop(0.5, '#e3ded6');
    grad.addColorStop(1, '#d1cbc0');
    drawIsoDiamond(ctx, cx, cy, TILE_W, TILE_H, grad, '#b8b0a5');

    // Soft marble veins
    ctx.strokeStyle = 'rgba(150,140,130,0.25)';
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 5);
    ctx.bezierCurveTo(cx - 5, cy - 2, cx + 5, cy + 8, cx + 18, cy + 2);
    ctx.stroke();
  } else if (type === 'patio_stone') {
    // Outdoor Cobblestone
    drawIsoDiamond(ctx, cx, cy, TILE_W, TILE_H, '#7a7672', '#575451');
    ctx.fillStyle = '#635f5c';
    ctx.beginPath();
    ctx.ellipse(cx - 8, cy - 2, 6, 3, Math.PI / 4, 0, Math.PI * 2);
    ctx.ellipse(cx + 8, cy + 3, 7, 3, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  }

  canvasCache.set(key, canvas);
  return canvas;
}

// ----------------------------------------------------
// EXTERIOR SIDEWALK & STREET TILES
// ----------------------------------------------------
// ----------------------------------------------------
// EXTERIOR SIDEWALK & STREET TILES
// ----------------------------------------------------
export function renderExteriorTile(type) {
  const key = `ext_tile_${type}`;
  if (canvasCache.has(key)) return canvasCache.get(key);

  const canvas = createCacheCanvas(TILE_W + 4, TILE_H + 4);
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  if (type === 'university') {
    // Soft Pastel Concrete Sidewalk Slabs with Sage Grass Edge
    const grad = ctx.createLinearGradient(cx - TILE_W / 2, cy - TILE_H / 2, cx + TILE_W / 2, cy + TILE_H / 2);
    grad.addColorStop(0, '#bebaaf');
    grad.addColorStop(0.5, '#b0ab9f');
    grad.addColorStop(1, '#9f998d');
    drawIsoDiamond(ctx, cx, cy, TILE_W, TILE_H, grad, '#878074');

    // Subtle Soft Joint Lines
    ctx.strokeStyle = 'rgba(90, 82, 75, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - TILE_W / 2, cy);
    ctx.lineTo(cx, cy - TILE_H / 2);
    ctx.lineTo(cx + TILE_W / 2, cy);
    ctx.stroke();

    // Muted Sage Green Lawn Trim Edge
    ctx.fillStyle = '#657e67';
    ctx.beginPath();
    ctx.moveTo(cx - TILE_W / 2, cy);
    ctx.lineTo(cx - TILE_W / 4, cy + TILE_H / 4);
    ctx.lineTo(cx, cy + TILE_H / 2);
    ctx.lineTo(cx - TILE_W / 2, cy + TILE_H / 2);
    ctx.closePath();
    ctx.fill();

    // Soft muted grass blades
    ctx.fillStyle = '#839e85';
    for (let i = 0; i < 5; i++) {
      const gx = cx - TILE_W / 2 + 5 + i * 4;
      const gy = cy + 5 + (i % 3) * 2;
      ctx.fillRect(gx, gy, 1.2, 2.5);
    }

  } else if (type === 'plaza' || type === 'business') {
    // Soft Pastel Charcoal & Slate Slabs
    const grad = ctx.createLinearGradient(cx - TILE_W / 2, cy - TILE_H / 2, cx + TILE_W / 2, cy + TILE_H / 2);
    grad.addColorStop(0, '#424a50');
    grad.addColorStop(0.5, '#384045');
    grad.addColorStop(1, '#2c3337');
    drawIsoDiamond(ctx, cx, cy, TILE_W, TILE_H, grad, '#1e2428');

    // Soft Marble Glare (subtle white)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - TILE_W / 3, cy - TILE_H / 3);
    ctx.lineTo(cx + TILE_W / 3, cy + TILE_H / 3);
    ctx.stroke();

    // Soft Slate Trim Line
    ctx.strokeStyle = 'rgba(130, 160, 175, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - TILE_W / 2 + 2, cy);
    ctx.lineTo(cx, cy + TILE_H / 2 - 1);
    ctx.stroke();

  } else if (type === 'historic' || type === 'tourist') {
    // Soft Pastel Warm Earth Cobblestone
    const sandGrad = ctx.createLinearGradient(cx, cy - TILE_H / 2, cx, cy + TILE_H / 2);
    sandGrad.addColorStop(0, '#5e534f');
    sandGrad.addColorStop(1, '#4d433f');
    drawIsoDiamond(ctx, cx, cy, TILE_W, TILE_H, sandGrad, '#38302c');

    const stones = [
      { x: cx - 16, y: cy - 4, rx: 7, ry: 3.5, color: '#8c7d75', hi: '#a89a91' },
      { x: cx - 4, y: cy - 9, rx: 8, ry: 4, color: '#7d6e66', hi: '#998980' },
      { x: cx + 10, y: cy - 6, rx: 7, ry: 3.5, color: '#73645c', hi: '#8f7f77' },
      { x: cx - 18, y: cy + 3, rx: 6, ry: 3, color: '#73645c', hi: '#8f7f77' },
      { x: cx - 4, y: cy + 4, rx: 9, ry: 4.5, color: '#8c7d75', hi: '#b2a49b' },
      { x: cx + 12, y: cy + 2, rx: 7, ry: 3.5, color: '#7d6e66', hi: '#998980' }
    ];

    stones.forEach(s => {
      // Soft shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(s.x + 1, s.y + 1, s.rx, s.ry, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // Stone Body
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, s.rx, s.ry, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#423833';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Soft Specular Top Light
      ctx.fillStyle = s.hi;
      ctx.beginPath();
      ctx.ellipse(s.x - s.rx * 0.25, s.y - s.ry * 0.25, s.rx * 0.5, s.ry * 0.4, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
    });

  } else if (type === 'neighborhood' || type === 'residential') {
    // Soft Pastel Warm Terracotta Brick Sidewalk
    drawIsoDiamond(ctx, cx, cy, TILE_W, TILE_H, '#8a6a61', '#634b43');

    // Soft Mortar lines
    ctx.strokeStyle = 'rgba(200, 180, 170, 0.2)';
    ctx.lineWidth = 0.8;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * 7 - 10, cy - TILE_H / 2 + Math.abs(i) * 2.5);
      ctx.lineTo(cx + i * 7 + 10, cy + TILE_H / 2 - Math.abs(i) * 2.5);
      ctx.stroke();
    }

    // Soft Muted Autumn Leaf Accents
    ctx.fillStyle = '#a16c52';
    ctx.fillRect(cx - 10, cy + 2, 2, 2);
    ctx.fillStyle = '#ad7b61';
    ctx.fillRect(cx + 12, cy - 4, 2, 2);

  } else if (type === 'entertainment') {
    // Realistic 3D Dark Slate & Granite Sidewalk Paving Slabs
    const entGrad = ctx.createLinearGradient(cx - TILE_W / 2, cy - TILE_H / 2, cx + TILE_W / 2, cy + TILE_H / 2);
    entGrad.addColorStop(0, '#3f4150');
    entGrad.addColorStop(0.5, '#323441');
    entGrad.addColorStop(1, '#252631');
    drawIsoDiamond(ctx, cx, cy, TILE_W, TILE_H, entGrad, '#181922');

    // 2x2 Isometric Paving Slab Division Joints (Clean recessed dark grout)
    ctx.strokeStyle = 'rgba(15, 16, 22, 0.75)';
    ctx.lineWidth = 1.2;

    // NW to SE joint line
    ctx.beginPath();
    ctx.moveTo(cx - TILE_W / 2, cy);
    ctx.lineTo(cx + TILE_W / 2, cy);
    ctx.stroke();

    // NE to SW joint line
    ctx.beginPath();
    ctx.moveTo(cx, cy - TILE_H / 2);
    ctx.lineTo(cx, cy + TILE_H / 2);
    ctx.stroke();

    // Secondary sub-slab joint lines for 4x4 slab texture
    ctx.strokeStyle = 'rgba(18, 19, 26, 0.45)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx - TILE_W / 4, cy - TILE_H / 4);
    ctx.lineTo(cx + TILE_W / 4, cy + TILE_H / 4);
    ctx.moveTo(cx - TILE_W / 4, cy + TILE_H / 4);
    ctx.lineTo(cx + TILE_W / 4, cy - TILE_H / 4);
    ctx.stroke();

    // 3D Bevel Highlights (Specular light reflecting off top edges of slate slabs)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    // Tile outer top bevel
    ctx.moveTo(cx - TILE_W / 2 + 1, cy);
    ctx.lineTo(cx, cy - TILE_H / 2 + 1);
    ctx.lineTo(cx + TILE_W / 2 - 1, cy);
    // Inner slab bevel lines
    ctx.moveTo(cx - TILE_W / 2 + 1, cy + 1);
    ctx.lineTo(cx, cy + 1);
    ctx.moveTo(cx, cy - TILE_H / 2 + 1);
    ctx.lineTo(cx, cy + 1);
    ctx.stroke();

    // Subtle stone micro-speckles for 3D realism
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(cx - 7, cy - 5, 1.5, 1.5);
    ctx.fillRect(cx + 9, cy - 3, 1.5, 1.5);
    ctx.fillRect(cx - 4, cy + 6, 1.5, 1.5);
    ctx.fillRect(cx + 6, cy + 4, 1.5, 1.5);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(cx + 3, cy - 7, 1.5, 1.5);
    ctx.fillRect(cx - 10, cy + 1, 1.5, 1.5);

  } else if (type === 'asphalt') {
    // Realistic Light-Medium City Asphalt Road Surface (Isometric 3D)
    const asphGrad = ctx.createLinearGradient(cx - TILE_W / 2, cy - TILE_H / 2, cx + TILE_W / 2, cy + TILE_H / 2);
    asphGrad.addColorStop(0, '#606470');
    asphGrad.addColorStop(0.5, '#505460');
    asphGrad.addColorStop(1, '#424550');
    drawIsoDiamond(ctx, cx, cy, TILE_W, TILE_H, asphGrad, '#343742');

    // Fine Asphalt Mineral Aggregates & Micro-Texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(cx - 9, cy - 5, 1.5, 1.5);
    ctx.fillRect(cx + 8, cy - 2, 1.5, 1.5);
    ctx.fillRect(cx - 3, cy + 6, 1.5, 1.5);
    ctx.fillRect(cx + 5, cy + 3, 1.5, 1.5);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(cx + 4, cy - 6, 1.5, 1.5);
    ctx.fillRect(cx - 7, cy + 2, 1.5, 1.5);
    ctx.fillRect(cx + 1, cy - 1, 1.5, 1.5);

  } else {
    // Commercial Pavement
    drawIsoDiamond(ctx, cx, cy, TILE_W, TILE_H, '#948e87', '#736d66');
  }

  canvasCache.set(key, canvas);
  return canvas;
}

// ----------------------------------------------------
// DISTRICT ENVIRONMENT PROPS (Trees, Bikes, Lamps, Planters, Cat Shelter)
// ----------------------------------------------------
export function renderDistrictProp(propId) {
  const key = `prop_${propId}`;
  if (canvasCache.has(key)) return canvasCache.get(key);

  const W = 160;
  const H = 190;
  const canvas = createCacheCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const cx = W / 2;
  const cy = H - 35;

  if (propId === 'TREE_OAK') {
    // Layered Soft Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx + 5, cy + 4, 34, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(cx + 8, cy + 6, 42, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3D Twisted Oak Trunk with Bark Ridges
    const trunkGrad = ctx.createLinearGradient(cx - 10, 0, cx + 10, 0);
    trunkGrad.addColorStop(0, '#2b1810');
    trunkGrad.addColorStop(0.4, '#4e342e');
    trunkGrad.addColorStop(0.8, '#3e2723');
    trunkGrad.addColorStop(1, '#1c0f0a');

    // Root flaring at base
    ctx.fillStyle = trunkGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy + 2);
    ctx.quadraticCurveTo(cx - 6, cy - 20, cx - 5, cy - 55);
    ctx.lineTo(cx + 6, cy - 55);
    ctx.quadraticCurveTo(cx + 8, cy - 20, cx + 14, cy + 2);
    ctx.closePath();
    ctx.fill();

    // Bark Texture Lines
    ctx.strokeStyle = 'rgba(20, 10, 5, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy - 50);
    ctx.lineTo(cx - 4, cy - 10);
    ctx.moveTo(cx + 2, cy - 45);
    ctx.lineTo(cx + 4, cy - 12);
    ctx.stroke();

    // Branch Forks
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#3e2723';
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy - 55);
    ctx.lineTo(cx - 18, cy - 75);
    ctx.moveTo(cx + 3, cy - 55);
    ctx.lineTo(cx + 20, cy - 78);
    ctx.stroke();

    // Volumetric 3D Leaf Canopy (4 Depth Layers)
    // Layer 1: Dark Base Shadow
    ctx.fillStyle = '#0f380f';
    ctx.beginPath();
    ctx.arc(cx - 20, cy - 80, 26, 0, Math.PI * 2);
    ctx.arc(cx + 20, cy - 84, 28, 0, Math.PI * 2);
    ctx.arc(cx, cy - 102, 32, 0, Math.PI * 2);
    ctx.fill();

    // Layer 2: Deep Forest Green
    ctx.fillStyle = '#1b5e20';
    ctx.beginPath();
    ctx.arc(cx - 16, cy - 85, 23, 0, Math.PI * 2);
    ctx.arc(cx + 16, cy - 88, 25, 0, Math.PI * 2);
    ctx.arc(cx, cy - 106, 28, 0, Math.PI * 2);
    ctx.fill();

    // Layer 3: Mid Emerald Green
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.arc(cx - 12, cy - 92, 19, 0, Math.PI * 2);
    ctx.arc(cx + 12, cy - 96, 21, 0, Math.PI * 2);
    ctx.arc(cx - 2, cy - 112, 23, 0, Math.PI * 2);
    ctx.fill();

    // Layer 4: Sunlit Lime Highlights
    ctx.fillStyle = '#66bb6a';
    ctx.beginPath();
    ctx.arc(cx - 10, cy - 100, 13, 0, Math.PI * 2);
    ctx.arc(cx + 10, cy - 104, 14, 0, Math.PI * 2);
    ctx.arc(cx - 3, cy - 118, 16, 0, Math.PI * 2);
    ctx.fill();

    // Leaf cluster micro dots
    ctx.fillStyle = '#a5d6a7';
    ctx.beginPath();
    ctx.arc(cx - 6, cy - 110, 5, 0, Math.PI * 2);
    ctx.arc(cx + 6, cy - 114, 6, 0, Math.PI * 2);
    ctx.fill();

    // Fallen Leaf Dots on sidewalk base
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(cx - 20, cy + 3, 2, 2);
    ctx.fillRect(cx + 18, cy + 1, 2, 2);
    ctx.fillRect(cx + 8, cy + 5, 2, 2);

  } else if (propId === 'BIKE_RACK') {
    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 34, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tubular Steel Bike Rack Loops (3D Metallic Chrome)
    const renderArch = (ox) => {
      ctx.strokeStyle = '#455a64';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(ox - 8, cy + 2);
      ctx.lineTo(ox - 8, cy - 22);
      ctx.arcTo(ox - 8, cy - 30, ox, cy - 30, 8);
      ctx.arcTo(ox + 8, cy - 30, ox + 8, cy - 22, 8);
      ctx.lineTo(ox + 8, cy + 2);
      ctx.stroke();

      ctx.strokeStyle = '#cfd8dc';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Flange mounts at ground base
      ctx.fillStyle = '#37474f';
      ctx.fillRect(ox - 10, cy, 4, 3);
      ctx.fillRect(ox + 6, cy, 4, 3);
    };

    renderArch(cx - 16);
    renderArch(cx + 16);

    // Parked Bicycle 1 (Red Vintage Cruiser Bike)
    const b1x = cx - 8;
    const b1y = cy - 6;

    // Spoked Wheels with Rubber Tires
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(b1x - 20, b1y - 6, 11, 0, Math.PI * 2); // Rear wheel
    ctx.arc(b1x + 12, b1y - 6, 11, 0, Math.PI * 2); // Front wheel
    ctx.stroke();

    ctx.strokeStyle = '#b0bec5';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(b1x - 20, b1y - 6, 9.5, 0, Math.PI * 2);
    ctx.arc(b1x + 12, b1y - 6, 9.5, 0, Math.PI * 2);
    ctx.stroke();

    // Red Metallic Diamond Frame
    ctx.strokeStyle = '#d32f2f';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(b1x - 20, b1y - 6);
    ctx.lineTo(b1x - 10, b1y - 18); // Seat tube top
    ctx.lineTo(b1x - 4, b1y - 6);  // Bottom bracket
    ctx.lineTo(b1x - 20, b1y - 6); // Rear stay
    ctx.moveTo(b1x - 10, b1y - 18);
    ctx.lineTo(b1x + 8, b1y - 18);  // Top tube
    ctx.lineTo(b1x - 4, b1y - 6);  // Down tube
    ctx.lineTo(b1x + 12, b1y - 6);  // Front fork
    ctx.stroke();

    // Handlebars & Leather Seat
    ctx.strokeStyle = '#eceff1';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(b1x + 8, b1y - 18);
    ctx.lineTo(b1x + 6, b1y - 25); // Handlebar stem
    ctx.lineTo(b1x + 2, b1y - 26); // Grip curve
    ctx.stroke();

    ctx.fillStyle = '#5d4037'; // Saddle
    ctx.fillRect(b1x - 14, b1y - 20, 7, 3);

  } else if (propId === 'BULLETIN_BOARD') {
    // Ground Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(cx - 20, cy + 2, 40, 4);

    // 3D Heavy Wooden Posts
    const postGrad = ctx.createLinearGradient(cx - 18, 0, cx - 14, 0);
    postGrad.addColorStop(0, '#3e2723');
    postGrad.addColorStop(0.5, '#5d4037');
    postGrad.addColorStop(1, '#2d1e18');

    ctx.fillStyle = postGrad;
    ctx.fillRect(cx - 18, cy - 48, 5, 48);
    ctx.fillRect(cx + 13, cy - 48, 5, 48);

    // Post Bevel Caps
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(cx - 19, cy - 50, 7, 3);
    ctx.fillRect(cx + 12, cy - 50, 7, 3);

    // Corkboard Frame & Backing
    ctx.fillStyle = '#2d1e18';
    ctx.fillRect(cx - 22, cy - 48, 44, 28); // Shadow outer

    ctx.fillStyle = '#4e342e'; // Wood border frame
    ctx.fillRect(cx - 21, cy - 47, 42, 26);

    // Cork texture panel
    const corkGrad = ctx.createLinearGradient(cx - 18, cy - 44, cx + 18, cy - 24);
    corkGrad.addColorStop(0, '#a1887f');
    corkGrad.addColorStop(1, '#8d6e63');
    ctx.fillStyle = corkGrad;
    ctx.fillRect(cx - 18, cy - 44, 36, 20);

    // Multiple Colorful Event Flyers with Headline Lines & Pins
    const flyers = [
      { x: cx - 15, y: cy - 42, w: 9, h: 12, color: '#ffd54f', pin: '#e53935' },
      { x: cx - 4, y: cy - 43, w: 10, h: 14, color: '#ff7043', pin: '#1e88e5' },
      { x: cx + 8, y: cy - 41, w: 8, h: 11, color: '#42a5f5', pin: '#43a047' },
      { x: cx - 12, y: cy - 31, w: 11, h: 6, color: '#ab47bc', pin: '#fdd835' },
      { x: cx + 2, y: cy - 32, w: 10, h: 7, color: '#66bb6a', pin: '#fb8c00' }
    ];

    flyers.forEach(f => {
      // Flyer shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(f.x + 1, f.y + 1, f.w, f.h);

      // Flyer paper
      ctx.fillStyle = f.color;
      ctx.fillRect(f.x, f.y, f.w, f.h);

      // Mini text lines
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(f.x + 1.5, f.y + 3, f.w - 3, 1);
      ctx.fillRect(f.x + 1.5, f.y + 5, f.w - 4, 1);

      // Thumbtack Pin
      ctx.fillStyle = f.pin;
      ctx.beginPath();
      ctx.arc(f.x + f.w / 2, f.y + 1.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Glass Reflection Glare
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy - 44);
    ctx.lineTo(cx - 4, cy - 44);
    ctx.lineTo(cx - 18, cy - 30);
    ctx.closePath();
    ctx.fill();

  } else if (propId === 'PLANTER_BOXWOOD') {
    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 3, 24, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Modern Heavy Architectural Stone Planter Box (3D Isometric)
    const frontGrad = ctx.createLinearGradient(cx - 16, 0, cx + 16, 0);
    frontGrad.addColorStop(0, '#455a64');
    frontGrad.addColorStop(1, '#37474f');

    ctx.fillStyle = frontGrad;
    ctx.fillRect(cx - 16, cy - 20, 32, 20);

    // Bevel Top Rim Overhang
    ctx.fillStyle = '#607d8b';
    ctx.fillRect(cx - 18, cy - 23, 36, 4);
    ctx.fillStyle = '#78909c';
    ctx.fillRect(cx - 18, cy - 23, 36, 1.5);

    // Soil Bed
    ctx.fillStyle = '#211510';
    ctx.fillRect(cx - 15, cy - 22, 30, 2);

    // Manicured Dense Boxwood Shrub Sphere (3D Volume)
    // Dark Shadow Base
    ctx.fillStyle = '#0f380f';
    ctx.beginPath();
    ctx.arc(cx, cy - 32, 19, 0, Math.PI * 2);
    ctx.fill();

    // Mid Foliage
    ctx.fillStyle = '#1b5e20';
    ctx.beginPath();
    ctx.arc(cx - 2, cy - 34, 17, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 36, 14, 0, Math.PI * 2);
    ctx.fill();

    // Sunlit Highlights
    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 38, 9, 0, Math.PI * 2);
    ctx.fill();

    // Flower buds speckles
    ctx.fillStyle = '#fff9c4';
    ctx.fillRect(cx - 8, cy - 36, 1.5, 1.5);
    ctx.fillRect(cx + 4, cy - 32, 1.5, 1.5);
    ctx.fillRect(cx + 2, cy - 42, 1.5, 1.5);

  } else if (propId === 'BOLLARD_LED') {
    // Radial Cyan LED Ground Glow Reflection
    const glow = ctx.createRadialGradient(cx, cy + 2, 2, cx, cy + 2, 28);
    glow.addColorStop(0, 'rgba(0, 229, 255, 0.55)');
    glow.addColorStop(0.5, 'rgba(0, 229, 255, 0.2)');
    glow.addColorStop(1, 'rgba(0, 229, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ground shadow base
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 1, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stainless Steel Cylinder Body (Metallic 3D Gradient)
    const bollardGrad = ctx.createLinearGradient(cx - 6, 0, cx + 6, 0);
    bollardGrad.addColorStop(0, '#78909c');
    bollardGrad.addColorStop(0.3, '#eceff1');
    bollardGrad.addColorStop(0.7, '#b0bec5');
    bollardGrad.addColorStop(1, '#455a64');

    ctx.fillStyle = bollardGrad;
    ctx.fillRect(cx - 6, cy - 26, 12, 26);

    // Bevelled Metallic Cap
    ctx.fillStyle = '#eceff1';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 26, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Recessed Neon Cyan LED Light Ring
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 6;
    ctx.fillRect(cx - 6, cy - 22, 12, 3.5);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 3, cy - 21, 6, 1.5);

  } else if (propId === 'LAMP_ANTIQUE') {
    // Large Soft Amber Radial Light Beam Cast on Sidewalk
    const lightPool = ctx.createRadialGradient(cx, cy + 2, 4, cx, cy + 2, 45);
    lightPool.addColorStop(0, 'rgba(255, 179, 0, 0.5)');
    lightPool.addColorStop(0.5, 'rgba(255, 143, 0, 0.25)');
    lightPool.addColorStop(1, 'rgba(255, 112, 67, 0)');
    ctx.fillStyle = lightPool;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 45, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 1, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cast-Iron Victorian Base
    ctx.fillStyle = '#181818';
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy);
    ctx.lineTo(cx - 4, cy - 10);
    ctx.lineTo(cx + 4, cy - 10);
    ctx.lineTo(cx + 8, cy);
    ctx.closePath();
    ctx.fill();

    // Fluted Decorative Metal Pole
    const poleGrad = ctx.createLinearGradient(cx - 3, 0, cx + 3, 0);
    poleGrad.addColorStop(0, '#111111');
    poleGrad.addColorStop(0.5, '#424242');
    poleGrad.addColorStop(1, '#181818');

    ctx.fillStyle = poleGrad;
    ctx.fillRect(cx - 3, cy - 65, 6, 55);

    // Decorative Scrollwork Arm Brackets
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy - 58);
    ctx.quadraticCurveTo(cx - 9, cy - 56, cx - 7, cy - 52);
    ctx.moveTo(cx + 3, cy - 58);
    ctx.quadraticCurveTo(cx + 9, cy - 56, cx + 7, cy - 52);
    ctx.stroke();

    // Antique Glass Lantern Housing
    const halo = ctx.createRadialGradient(cx, cy - 70, 2, cx, cy - 70, 24);
    halo.addColorStop(0, 'rgba(255, 235, 59, 0.85)');
    halo.addColorStop(0.6, 'rgba(255, 179, 0, 0.4)');
    halo.addColorStop(1, 'rgba(255, 112, 67, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy - 70, 24, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Glass Panels
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy - 64);
    ctx.lineTo(cx + 7, cy - 64);
    ctx.lineTo(cx + 9, cy - 78);
    ctx.lineTo(cx - 9, cy - 78);
    ctx.closePath();
    ctx.fill();

    // Filament Light Core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy - 71, 3, 0, Math.PI * 2);
    ctx.fill();

    // Octagonal Cast Iron Lantern Roof Cap & Finial
    ctx.fillStyle = '#181818';
    ctx.fillRect(cx - 10, cy - 80, 20, 3);
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 80);
    ctx.lineTo(cx, cy - 87);
    ctx.lineTo(cx + 8, cy - 80);
    ctx.closePath();
    ctx.fill();

  } else if (propId === 'POT_BOUGAINVILLEA') {
    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Artisanal Terracotta Clay Pot (3D Curved Body)
    const potGrad = ctx.createLinearGradient(cx - 12, 0, cx + 12, 0);
    potGrad.addColorStop(0, '#bf360c');
    potGrad.addColorStop(0.5, '#e64a19');
    potGrad.addColorStop(1, '#8d2d11');

    ctx.fillStyle = potGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx - 13, cy - 22);
    ctx.lineTo(cx + 13, cy - 22);
    ctx.lineTo(cx + 10, cy);
    ctx.closePath();
    ctx.fill();

    // Terracotta Rim Lip
    ctx.fillStyle = '#ff5722';
    ctx.fillRect(cx - 14, cy - 24, 28, 3.5);

    // Wooden Lattice Trellis Frame
    ctx.strokeStyle = '#6d4c41';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 24);
    ctx.lineTo(cx - 8, cy - 62);
    ctx.moveTo(cx + 8, cy - 24);
    ctx.lineTo(cx + 8, cy - 62);
    ctx.stroke();

    ctx.lineWidth = 1.2;
    for (let y = cy - 56; y < cy - 26; y += 8) {
      ctx.beginPath();
      ctx.moveTo(cx - 10, y);
      ctx.lineTo(cx + 10, y + 4);
      ctx.stroke();
    }

    // Dark Green Leaf Vine Foliage
    ctx.fillStyle = '#1b5e20';
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 32, 12, 0, Math.PI * 2);
    ctx.arc(cx + 6, cy - 40, 14, 0, Math.PI * 2);
    ctx.arc(cx - 3, cy - 50, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 34, 10, 0, Math.PI * 2);
    ctx.arc(cx + 4, cy - 42, 11, 0, Math.PI * 2);
    ctx.arc(cx, cy - 52, 10, 0, Math.PI * 2);
    ctx.fill();

    // Vibrant 3D Pink/Magenta Bougainvillea Flowers
    const flowers = [
      { x: cx - 8, y: cy - 34, r: 4.5 },
      { x: cx + 5, y: cy - 44, r: 5.5 },
      { x: cx + 8, y: cy - 32, r: 4 },
      { x: cx - 4, y: cy - 54, r: 5 },
      { x: cx + 2, y: cy - 58, r: 4 }
    ];

    flowers.forEach(f => {
      ctx.fillStyle = '#d81b60';
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff4081';
      ctx.beginPath();
      ctx.arc(f.x - 1, f.y - 1, f.r * 0.6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Fallen pink petals on tile
    ctx.fillStyle = '#e91e63';
    ctx.fillRect(cx - 14, cy + 1, 2, 2);
    ctx.fillRect(cx + 12, cy + 2, 2, 2);

  } else if (propId === 'TREE_MAPLE') {
    // Ground Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy + 4, 32, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Slender Dark Brown Japanese Maple Trunk & Branches
    ctx.fillStyle = '#2d1e18';
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy + 2);
    ctx.lineTo(cx - 4, cy - 50);
    ctx.lineTo(cx + 4, cy - 50);
    ctx.lineTo(cx + 6, cy + 2);
    ctx.closePath();
    ctx.fill();

    // Branching Limbs
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 2, cy - 50);
    ctx.lineTo(cx - 16, cy - 68);
    ctx.moveTo(cx + 2, cy - 50);
    ctx.lineTo(cx + 18, cy - 70);
    ctx.stroke();

    // Layered Fiery Crimson & Orange Canopy (3D Depth)
    // Dark Crimson Base
    ctx.fillStyle = '#880e4f';
    ctx.beginPath();
    ctx.arc(cx - 16, cy - 72, 22, 0, Math.PI * 2);
    ctx.arc(cx + 16, cy - 76, 24, 0, Math.PI * 2);
    ctx.arc(cx, cy - 92, 26, 0, Math.PI * 2);
    ctx.fill();

    // Deep Orange Red
    ctx.fillStyle = '#d84315';
    ctx.beginPath();
    ctx.arc(cx - 12, cy - 76, 19, 0, Math.PI * 2);
    ctx.arc(cx + 12, cy - 80, 21, 0, Math.PI * 2);
    ctx.arc(cx, cy - 96, 23, 0, Math.PI * 2);
    ctx.fill();

    // Vivid Bright Orange
    ctx.fillStyle = '#f57c00';
    ctx.beginPath();
    ctx.arc(cx - 8, cy - 84, 15, 0, Math.PI * 2);
    ctx.arc(cx + 8, cy - 88, 16, 0, Math.PI * 2);
    ctx.arc(cx, cy - 102, 18, 0, Math.PI * 2);
    ctx.fill();

    // Sunlit Golden Leaves
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 92, 10, 0, Math.PI * 2);
    ctx.arc(cx + 4, cy - 96, 11, 0, Math.PI * 2);
    ctx.fill();

    // Falling Autumn Leaf Particles
    ctx.fillStyle = '#ff9800';
    ctx.fillRect(cx - 22, cy - 35, 2.5, 2.5);
    ctx.fillRect(cx + 24, cy - 45, 2.5, 2.5);
    ctx.fillRect(cx - 15, cy + 2, 2.5, 2.5);
    ctx.fillRect(cx + 14, cy + 4, 2.5, 2.5);

  } else if (propId === 'CAT_SHELTER') {
    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(cx - 22, cy, 44, 5);

    // Planked Timber Walls (3D Isometric Box)
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(cx - 18, cy - 20, 36, 20);

    // Plank line details
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy - 13);
    ctx.lineTo(cx + 18, cy - 13);
    ctx.moveTo(cx - 18, cy - 6);
    ctx.lineTo(cx + 18, cy - 6);
    ctx.stroke();

    // Pitched Gabled Asphalt Shingle Roof
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.moveTo(cx - 22, cy - 20);
    ctx.lineTo(cx, cy - 34);
    ctx.lineTo(cx + 22, cy - 20);
    ctx.closePath();
    ctx.fill();

    // Roof Trim Ridge
    ctx.fillStyle = '#37474f';
    ctx.fillRect(cx - 23, cy - 21, 46, 3);

    // Arched Entrance Hole with Deep Interior Shadow
    ctx.fillStyle = '#1c1310';
    ctx.beginPath();
    ctx.arc(cx - 6, cy - 8, 6, Math.PI, 0);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx - 12, cy);
    ctx.closePath();
    ctx.fill();

    // Food & Water Dish on Front Deck
    ctx.fillStyle = '#b0bec5';
    ctx.beginPath();
    ctx.ellipse(cx + 12, cy + 1, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5d4037'; // Kibble
    ctx.fillRect(cx + 9, cy, 2, 1.5);
    ctx.fillStyle = '#29b6f6'; // Water
    ctx.fillRect(cx + 13, cy, 2, 1.5);

    // Sleeping 3D Orange Tabby Cat on Roof Porch
    const catX = cx + 4;
    const catY = cy - 24;

    // Cat Body (Curled up)
    ctx.fillStyle = '#ff9800';
    ctx.beginPath();
    ctx.ellipse(catX, catY, 7, 5, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // Cat Head
    ctx.beginPath();
    ctx.arc(catX - 5, catY - 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Pointed Ears
    ctx.fillStyle = '#e65100';
    ctx.beginPath();
    ctx.moveTo(catX - 8, catY - 5);
    ctx.lineTo(catX - 6, catY - 9);
    ctx.lineTo(catX - 4, catY - 5);
    ctx.fill();

    // Tail curled around body
    ctx.strokeStyle = '#e65100';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(catX + 3, catY + 1, 4, 0, Math.PI);
    ctx.stroke();

  } else if (propId === 'DIGITAL_BILLBOARD_STOCK') {
    // Finans Merkezi - High-Tech 3D Stock Ticker Billboard Pillar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 26, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Steel & Titanium Pillar Base
    const baseGrad = ctx.createLinearGradient(cx - 18, 0, cx + 18, 0);
    baseGrad.addColorStop(0, '#263238');
    baseGrad.addColorStop(0.5, '#455a64');
    baseGrad.addColorStop(1, '#1c272b');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(cx - 18, cy - 10, 36, 10);

    // Modern High-Rise Display Column (3D Glass Body)
    ctx.fillStyle = '#0a1017';
    ctx.fillRect(cx - 20, cy - 90, 40, 80);
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 20, cy - 90, 40, 80);

    // Glowing Backlight
    ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
    ctx.fillRect(cx - 18, cy - 88, 36, 76);

    // Stock Market Chart (Green Bullish Candlesticks)
    ctx.strokeStyle = '#00e676';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy - 30);
    ctx.lineTo(cx - 8, cy - 42);
    ctx.lineTo(cx - 2, cy - 36);
    ctx.lineTo(cx + 6, cy - 58);
    ctx.lineTo(cx + 14, cy - 72);
    ctx.stroke();

    // Chart Candles
    ctx.fillStyle = '#00e676';
    ctx.fillRect(cx - 10, cy - 44, 4, 10);
    ctx.fillRect(cx + 4, cy - 64, 4, 14);
    ctx.fillStyle = '#ff5252';
    ctx.fillRect(cx - 3, cy - 40, 4, 8);

    // Live LED Stock Ticker Text Line
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BIST ▲2.4%', cx, cy - 78);
    ctx.fillStyle = '#00e676';
    ctx.fillText('CUP +18%', cx, cy - 18);

  } else if (propId === 'SKYSCRAPER_PILLAR') {
    // Finans Merkezi - Modern Architectural Skyscraper Pillar Canopy
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 3, 30, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ultra-tall Brushed Aluminum Skyscraper Column
    const colGrad = ctx.createLinearGradient(cx - 22, 0, cx + 22, 0);
    colGrad.addColorStop(0, '#37474f');
    colGrad.addColorStop(0.3, '#eceff1');
    colGrad.addColorStop(0.7, '#90a4ae');
    colGrad.addColorStop(1, '#263238');
    ctx.fillStyle = colGrad;
    ctx.fillRect(cx - 22, cy - 140, 44, 140);

    // Tinted Blue Curtain Wall Glass Panels
    ctx.fillStyle = 'rgba(2, 136, 209, 0.4)';
    ctx.fillRect(cx - 18, cy - 135, 36, 130);

    // Vertical Steel Mullion Lines
    ctx.strokeStyle = '#b0bec5';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 140); ctx.lineTo(cx - 6, cy);
    ctx.moveTo(cx + 6, cy - 140); ctx.lineTo(cx + 6, cy);
    ctx.stroke();

  } else if (propId === 'LUXURY_CAR_PARKED') {
    // Ultra-Realistic 3D Executive Metallic Sports Coupe / Luxury Supercar
    // 1. Multi-Layer Contact Shadow on Asphalt/Pavement
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx + 2, cy + 4, 46, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy + 6, 54, 19, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Xenon Headlight Road Surface Beam Reflection Glow
    const headlightGlow = ctx.createRadialGradient(cx - 42, cy - 2, 2, cx - 55, cy - 2, 28);
    headlightGlow.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    headlightGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
    headlightGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = headlightGlow;
    ctx.beginPath();
    ctx.ellipse(cx - 50, cy - 2, 25, 12, -Math.PI / 12, 0, Math.PI * 2);
    ctx.fill();

    // 3. Lower Chassis Underbody & Side Skirts (Dark Shadow Base)
    ctx.fillStyle = '#0b1320';
    ctx.beginPath();
    ctx.moveTo(cx - 40, cy + 1);
    ctx.lineTo(cx + 40, cy + 1);
    ctx.lineTo(cx + 42, cy - 6);
    ctx.lineTo(cx - 42, cy - 6);
    ctx.closePath();
    ctx.fill();

    // 4. Glossy Metallic Body Shell (Midnight Sapphire / Charcoal Metallic)
    const bodyGrad = ctx.createLinearGradient(cx - 42, cy - 32, cx + 42, cy + 4);
    bodyGrad.addColorStop(0, '#3182ce');  // Sunlit hood/roof specular gloss
    bodyGrad.addColorStop(0.2, '#1a365d'); // Mid metallic sapphire
    bodyGrad.addColorStop(0.7, '#0f172a'); // Deep shadow obsidian base
    bodyGrad.addColorStop(1, '#020617');   // Dark lower trim

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    // Front Nose / Grille Bumper
    ctx.moveTo(cx - 42, cy - 6);
    ctx.quadraticCurveTo(cx - 45, cy - 14, cx - 32, cy - 20); // Curved aerodynamic hood
    ctx.lineTo(cx - 16, cy - 32); // A-pillar slope to windshield
    ctx.quadraticCurveTo(cx, cy - 34, cx + 18, cy - 32); // Curved sleek roofline
    ctx.lineTo(cx + 36, cy - 18); // Fastback rear C-pillar slope
    ctx.quadraticCurveTo(cx + 44, cy - 12, cx + 43, cy - 5); // Rear bumper curve
    ctx.lineTo(cx + 38, cy + 2);  // Rear lower skirt
    ctx.lineTo(cx - 38, cy + 2);  // Front lower skirt
    ctx.closePath();
    ctx.fill();

    // 5. Metallic Surface Reflection Streaks (Glossy Car Paint Sheen)
    const hoodHighlight = ctx.createLinearGradient(cx - 38, cy - 20, cx - 18, cy - 20);
    hoodHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    hoodHighlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    hoodHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = hoodHighlight;
    ctx.beginPath();
    ctx.moveTo(cx - 40, cy - 12);
    ctx.lineTo(cx - 28, cy - 19);
    ctx.lineTo(cx - 18, cy - 20);
    ctx.lineTo(cx - 32, cy - 13);
    ctx.closePath();
    ctx.fill();

    // 6. Glass Windows & Panoramic Sunroof Glare
    const glassGrad = ctx.createLinearGradient(cx - 14, cy - 32, cx + 14, cy - 18);
    glassGrad.addColorStop(0, 'rgba(186, 230, 253, 0.85)');
    glassGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.6)');
    glassGrad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');

    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy - 30);
    ctx.lineTo(cx + 16, cy - 30);
    ctx.lineTo(cx + 28, cy - 20);
    ctx.lineTo(cx - 24, cy - 20);
    ctx.closePath();
    ctx.fill();

    // Windshield Frame / Chrome Trim
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Specular Reflection Diagonal Light Streak on Glass
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 30);
    ctx.lineTo(cx - 4, cy - 30);
    ctx.lineTo(cx - 14, cy - 20);
    ctx.lineTo(cx - 18, cy - 20);
    ctx.closePath();
    ctx.fill();

    // 7. Side View Mirrors
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 18, cy - 21, 4, 3);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(cx - 18, cy - 21, 2, 2);

    // 8. Door Cutlines & Side Air Intakes (3D Sculpted Body Detail)
    ctx.strokeStyle = 'rgba(2, 6, 23, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - 20);
    ctx.lineTo(cx - 4, cy - 4);
    ctx.moveTo(cx + 12, cy - 14);
    ctx.quadraticCurveTo(cx + 18, cy - 8, cx + 24, cy - 4);
    ctx.stroke();

    // 9. High-Performance 3D Alloy Wheels & Rubber Tires
    const drawSportWheel = (wx, wy) => {
      ctx.fillStyle = '#0a0a0c';
      ctx.beginPath();
      ctx.ellipse(wx, wy, 9.5, 8.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(wx - 3, wy - 4, 3, 4);

      const rimGrad = ctx.createRadialGradient(wx - 1, wy - 1, 0, wx, wy, 6);
      rimGrad.addColorStop(0, '#f8fafc');
      rimGrad.addColorStop(0.5, '#94a3b8');
      rimGrad.addColorStop(1, '#334155');
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.ellipse(wx, wy, 5.5, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 0.9;
      for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / 5) {
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + Math.cos(a) * 5, wy + Math.sin(a) * 4.5);
        ctx.stroke();
      }

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(wx, wy, 1.2, 0, Math.PI * 2);
      ctx.fill();
    };

    drawSportWheel(cx - 24, cy + 1);
    drawSportWheel(cx + 22, cy + 1);

    // 10. Front LED Matrix Projector Headlights
    ctx.fillStyle = '#f0f9ff';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(cx - 41, cy - 11, 2.5, 4, Math.PI / 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 11. Rear LED Lightbar & Chrome Exhaust
    ctx.fillStyle = '#f43f5e';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 4;
    ctx.fillRect(cx + 41, cy - 10, 2.5, 5);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#cbd5e0';
    ctx.fillRect(cx + 37, cy - 1, 3, 2);

  } else if (propId === 'PARK_BENCH_WOOD') {
    // Sakin Konut Bölgesi - Classic 3D Wrought Iron & Wooden Park Bench
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 3, 26, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cast Iron Legs & Armrests
    ctx.strokeStyle = '#1b1b1b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy + 3); ctx.lineTo(cx - 20, cy - 16);
    ctx.moveTo(cx + 20, cy + 3); ctx.lineTo(cx + 20, cy - 16);
    ctx.stroke();

    // Wooden Slats (Warm Teak Finish)
    ctx.fillStyle = '#8d4f2b';
    ctx.fillRect(cx - 22, cy - 16, 44, 3.5);
    ctx.fillRect(cx - 22, cy - 11, 44, 3.5);
    ctx.fillRect(cx - 22, cy - 6, 44, 3.5);
    ctx.fillRect(cx - 22, cy - 1, 44, 3.5);

    // Slat Highlights
    ctx.fillStyle = '#b56c3c';
    ctx.fillRect(cx - 22, cy - 16, 44, 1);
    ctx.fillRect(cx - 22, cy - 11, 44, 1);

  } else if (propId === 'FLOWER_BED') {
    // Sakin Konut Bölgesi - Raised Stone Border Flower Bed
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 3, 28, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stone Border Ring
    drawIsoDiamond(ctx, cx, cy, 52, 24, '#78909c', '#455a64');

    // Rich Soil Center
    drawIsoDiamond(ctx, cx, cy - 2, 44, 20, '#3e2723', '#271711');

    // Colorful Blooming Flowers (Tulips / Daisies)
    const blooms = [
      { x: cx - 12, y: cy - 4, c: '#e91e63' },
      { x: cx - 4, y: cy - 7, c: '#ffeb3b' },
      { x: cx + 6, y: cy - 5, c: '#ab47bc' },
      { x: cx + 12, y: cy - 2, c: '#ff5722' },
      { x: cx, y: cy - 1, c: '#e91e63' }
    ];
    blooms.forEach(b => {
      ctx.fillStyle = '#388e3c'; // Leaves
      ctx.fillRect(b.x - 2, b.y - 2, 4, 4);
      ctx.fillStyle = b.c; // Petals
      ctx.beginPath();
      ctx.arc(b.x, b.y - 4, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

  } else if (propId === 'NEON_ART_SCULPTURE') {
    // Eğlence & Sanat Caddesi - Avant-Garde Glowing 3D Neon Art Sculpture
    const glow = ctx.createRadialGradient(cx, cy + 2, 2, cx, cy + 2, 35);
    glow.addColorStop(0, 'rgba(224, 64, 251, 0.55)');
    glow.addColorStop(0.6, 'rgba(0, 229, 255, 0.2)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 35, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black Marble Pedestal Base
    ctx.fillStyle = '#121212';
    ctx.fillRect(cx - 14, cy - 12, 28, 12);
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(cx - 15, cy - 14, 30, 3);

    // Twisted Infinity 3D Neon Tube (Magenta & Cyan)
    ctx.strokeStyle = '#e040fb';
    ctx.shadowColor = '#e040fb';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx - 8, cy - 42, 16, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(cx + 8, cy - 50, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

  } else if (propId === 'THEATER_POSTER_STAND') {
    // Eğlence & Sanat Caddesi - Illuminated Marquee Art Poster Display
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(cx - 18, cy, 36, 4);

    // Brass/Bronze Steel Frame
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(cx - 18, cy - 65, 36, 65);
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - 15, cy - 62, 30, 58);

    // Glowing Poster Glass Image
    const postGrad = ctx.createLinearGradient(cx - 13, cy - 60, cx + 13, cy - 6);
    postGrad.addColorStop(0, '#aa00ff');
    postGrad.addColorStop(0.5, '#304ffe');
    postGrad.addColorStop(1, '#ff6d00');
    ctx.fillStyle = postGrad;
    ctx.fillRect(cx - 13, cy - 60, 26, 54);

    // Marquee Yellow Light Bulbs Rim
    ctx.fillStyle = '#ffea00';
    for (let y = cy - 62; y <= cy - 6; y += 8) {
      ctx.fillRect(cx - 17, y, 2, 2);
      ctx.fillRect(cx + 15, y, 2, 2);
    }

  } else if (propId === 'VINTAGE_STREET_LAMP') {
    // Eğlence & Sanat Caddesi - Victorian Double Lantern Lamp with Flower Baskets
    const lightPool = ctx.createRadialGradient(cx, cy + 2, 4, cx, cy + 2, 45);
    lightPool.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
    lightPool.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lightPool;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 45, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wrought Iron Pole
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - 3, cy - 75, 6, 75);

    // Dual Arch Branches
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy - 65); ctx.lineTo(cx + 16, cy - 65);
    ctx.stroke();

    // Dual Glowing Lanterns
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(cx - 16, cy - 65, 6, 0, Math.PI * 2);
    ctx.arc(cx + 16, cy - 65, 6, 0, Math.PI * 2);
    ctx.fill();

    // Hanging Flower Baskets overflowing with Pink Blossoms
    ctx.fillStyle = '#e91e63';
    ctx.beginPath();
    ctx.arc(cx - 16, cy - 54, 7, 0, Math.PI * 2);
    ctx.arc(cx + 16, cy - 54, 7, 0, Math.PI * 2);
    ctx.fill();

  } else if (propId === 'MUSIC_BUSKER_STAGE') {
    // Eğlence & Sanat Caddesi - Street Musician Setup (Guitar Case & Saxophone)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 24, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Open Velvet-Lined Guitar Case with Tips (Coins)
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(cx - 16, cy - 6, 20, 10);
    ctx.fillStyle = '#880e4f'; // Deep Red Velvet
    ctx.fillRect(cx - 14, cy - 4, 16, 7);

    // Shiny Gold & Silver Tip Coins
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(cx - 10, cy - 2, 2, 2);
    ctx.fillRect(cx - 6, cy - 1, 2, 2);
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(cx - 12, cy - 3, 2, 2);

    // Acoustic Guitar on Stand
    ctx.fillStyle = '#a1887f'; // Stand
    ctx.fillRect(cx + 8, cy - 28, 2, 28);
    ctx.fillStyle = '#e65100'; // Sunburst Body
    ctx.beginPath();
    ctx.ellipse(cx + 9, cy - 12, 7, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a100c'; // Soundhole
    ctx.beginPath();
    ctx.arc(cx + 9, cy - 14, 2.5, 0, Math.PI * 2);
    ctx.fill();

  } else if (propId === 'FOUNTAIN_STONE') {
    // Tarihi Meydan - 3D Carved Stone Fountain with Sparkling Water
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 38, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Large Lower Stone Basin
    drawIsoDiamond(ctx, cx, cy, 70, 32, '#90a4ae', '#546e7a');
    drawIsoDiamond(ctx, cx, cy - 4, 62, 26, '#0288d1', '#01579b'); // Water level

    // Central Pillar & Upper Tier Basin
    ctx.fillStyle = '#78909c';
    ctx.fillRect(cx - 6, cy - 35, 12, 30);
    drawIsoDiamond(ctx, cx, cy - 35, 36, 16, '#90a4ae', '#455a64');
    drawIsoDiamond(ctx, cx, cy - 37, 30, 12, '#4ff3ff', '#0288d1');

    // Water Spout Spray Rings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy - 42, 6, Math.PI, 0);
    ctx.stroke();
  }

  canvasCache.set(key, canvas);
  return canvas;
}

// ----------------------------------------------------
// WALL TILES (Iso Wall Segment)
// ----------------------------------------------------
export function renderWallTile(type, dir = 'NW') {
  const key = `wall_${type}_${dir}`;
  if (canvasCache.has(key)) return canvasCache.get(key);

  const W = TILE_W + 4;
  const H = TILE_H + 90;
  const canvas = createCacheCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const cx = W / 2;
  const bottomY = H - TILE_H / 2 - 4;
  const wallHeight = 65;

  if (dir === 'NW') {
    // Wall facing South-East (Left side wall)
    const p1 = { x: cx - TILE_W / 2, y: bottomY };
    const p2 = { x: cx, y: bottomY + TILE_H / 2 };
    const p1Top = { x: p1.x, y: p1.y - wallHeight };
    const p2Top = { x: p2.x, y: p2.y - wallHeight };

    // Wall face
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p2Top.x, p2Top.y);
    ctx.lineTo(p1Top.x, p1Top.y);
    ctx.closePath();

    if (type === 'brick') {
      const g = ctx.createLinearGradient(p1.x, 0, p2.x, 0);
      g.addColorStop(0, '#a34836');
      g.addColorStop(1, '#853728');
      ctx.fillStyle = g;
      ctx.fill();
      // Mortar lines
      ctx.strokeStyle = 'rgba(230,210,190,0.4)';
      ctx.lineWidth = 1;
      for (let y = p1Top.y; y < p1.y; y += 8) {
        ctx.beginPath();
        ctx.moveTo(p1.x, y);
        ctx.lineTo(p2.x, y + TILE_H / 2);
        ctx.stroke();
      }
    } else {
      // Modern slate / wood
      ctx.fillStyle = '#3a444c';
      ctx.fill();
      ctx.strokeStyle = '#525e68';
      ctx.stroke();
    }
  } else {
    // Wall facing South-West (Right side wall)
    const p1 = { x: cx, y: bottomY + TILE_H / 2 };
    const p2 = { x: cx + TILE_W / 2, y: bottomY };
    const p1Top = { x: p1.x, y: p1.y - wallHeight };
    const p2Top = { x: p2.x, y: p2.y - wallHeight };

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p2Top.x, p2Top.y);
    ctx.lineTo(p1Top.x, p1Top.y);
    ctx.closePath();

    if (type === 'brick') {
      const g = ctx.createLinearGradient(p1.x, 0, p2.x, 0);
      g.addColorStop(0, '#7a3123');
      g.addColorStop(1, '#5e2418');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = 'rgba(230,210,190,0.3)';
      ctx.lineWidth = 1;
      for (let y = p1Top.y; y < p1.y; y += 8) {
        ctx.beginPath();
        ctx.moveTo(p1.x, y);
        ctx.lineTo(p2.x, y - TILE_H / 2);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#2c353c';
      ctx.fill();
      ctx.strokeStyle = '#434e56';
      ctx.stroke();
    }
  }

  canvasCache.set(key, canvas);
  return canvas;
}

// ----------------------------------------------------
// WALL DOOR TILE (Integrated Door in Left Wall)
// ----------------------------------------------------
export function renderWallDoorTile(type) {
  const key = `wall_door_${type}`;
  if (canvasCache.has(key)) return canvasCache.get(key);

  const W = TILE_W + 4;
  const H = TILE_H + 90;
  const canvas = createCacheCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const cx = W / 2;
  const bottomY = H - TILE_H / 2 - 4;
  const wallHeight = 65;

  // Left Wall segment facing South-East (NE direction)
  const p1 = { x: cx, y: bottomY + TILE_H / 2 };
  const p2 = { x: cx + TILE_W / 2, y: bottomY };
  const p1Top = { x: p1.x, y: p1.y - wallHeight };
  const p2Top = { x: p2.x, y: p2.y - wallHeight };

  // Helper for isometric wall interpolation
  const getWallPoint = (t, yOffset = 0) => ({
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y) - yOffset
  });

  // 1. Base Wall Face fill
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p2Top.x, p2Top.y);
  ctx.lineTo(p1Top.x, p1Top.y);
  ctx.closePath();

  if (type === 'brick') {
    const g = ctx.createLinearGradient(p1.x, 0, p2.x, 0);
    g.addColorStop(0, '#7a3123');
    g.addColorStop(1, '#5e2418');
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = '#2c353c';
  }
  ctx.fill();

  // 2. Door Frame Opening (Dark interior doorway depth spanning almost floor to ceiling)
  const dLeftStart = 0.08;
  const dRightEnd = 0.92;
  const frameTopH = wallHeight - 5; // Spans floor to top lintel

  const ptL_Bot = getWallPoint(dLeftStart, 0);
  const ptL_Top = getWallPoint(dLeftStart, frameTopH);
  const ptR_Top = getWallPoint(dRightEnd, frameTopH);
  const ptR_Bot = getWallPoint(dRightEnd, 0);

  ctx.fillStyle = '#121619';
  ctx.beginPath();
  ctx.moveTo(ptL_Bot.x, ptL_Bot.y);
  ctx.lineTo(ptR_Bot.x, ptR_Bot.y);
  ctx.lineTo(ptR_Top.x, ptR_Top.y);
  ctx.lineTo(ptL_Top.x, ptL_Top.y);
  ctx.closePath();
  ctx.fill();

  // Outer Walnut/Mahogany Door Frame Border
  ctx.strokeStyle = '#3e2723';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 3. FULL-HEIGHT DOUBLE GLASS DOORS
  const dCenterLeft = 0.48;
  const dCenterRight = 0.52;

  // --- LEFT DOOR LEAF ---
  const dL_pt1_bot = getWallPoint(dLeftStart + 0.02, 1);
  const dL_pt1_top = getWallPoint(dLeftStart + 0.02, frameTopH - 1);
  const dL_pt2_top = getWallPoint(dCenterLeft, frameTopH - 1);
  const dL_pt2_bot = getWallPoint(dCenterLeft, 1);

  ctx.fillStyle = '#2c1d11';
  ctx.beginPath();
  ctx.moveTo(dL_pt1_bot.x, dL_pt1_bot.y);
  ctx.lineTo(dL_pt2_bot.x, dL_pt2_bot.y);
  ctx.lineTo(dL_pt2_top.x, dL_pt2_top.y);
  ctx.lineTo(dL_pt1_top.x, dL_pt1_top.y);
  ctx.closePath();
  ctx.fill();

  // Left Glass Panel
  const dL_g1_bot = getWallPoint(dLeftStart + 0.05, 10);
  const dL_g1_top = getWallPoint(dLeftStart + 0.05, frameTopH - 4);
  const dL_g2_top = getWallPoint(dCenterLeft - 0.03, frameTopH - 4);
  const dL_g2_bot = getWallPoint(dCenterLeft - 0.03, 10);

  ctx.fillStyle = 'rgba(129, 212, 250, 0.45)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(dL_g1_bot.x, dL_g1_bot.y);
  ctx.lineTo(dL_g2_bot.x, dL_g2_bot.y);
  ctx.lineTo(dL_g2_top.x, dL_g2_top.y);
  ctx.lineTo(dL_g1_top.x, dL_g1_top.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Left Kick Plate at Bottom
  const dL_k1_bot = getWallPoint(dLeftStart + 0.02, 1);
  const dL_k1_top = getWallPoint(dLeftStart + 0.02, 9);
  const dL_k2_top = getWallPoint(dCenterLeft, 9);
  const dL_k2_bot = getWallPoint(dCenterLeft, 1);

  ctx.fillStyle = '#8d6e63';
  ctx.beginPath();
  ctx.moveTo(dL_k1_bot.x, dL_k1_bot.y);
  ctx.lineTo(dL_k2_bot.x, dL_k2_bot.y);
  ctx.lineTo(dL_k2_top.x, dL_k2_top.y);
  ctx.lineTo(dL_k1_top.x, dL_k1_top.y);
  ctx.closePath();
  ctx.fill();

  // --- RIGHT DOOR LEAF ---
  const dR_pt1_bot = getWallPoint(dCenterRight, 1);
  const dR_pt1_top = getWallPoint(dCenterRight, frameTopH - 1);
  const dR_pt2_top = getWallPoint(dRightEnd - 0.02, frameTopH - 1);
  const dR_pt2_bot = getWallPoint(dRightEnd - 0.02, 1);

  ctx.fillStyle = '#2c1d11';
  ctx.beginPath();
  ctx.moveTo(dR_pt1_bot.x, dR_pt1_bot.y);
  ctx.lineTo(dR_pt2_bot.x, dR_pt2_bot.y);
  ctx.lineTo(dR_pt2_top.x, dR_pt2_top.y);
  ctx.lineTo(dR_pt1_top.x, dR_pt1_top.y);
  ctx.closePath();
  ctx.fill();

  // Right Glass Panel
  const dR_g1_bot = getWallPoint(dCenterRight + 0.03, 10);
  const dR_g1_top = getWallPoint(dCenterRight + 0.03, frameTopH - 4);
  const dR_g2_top = getWallPoint(dRightEnd - 0.05, frameTopH - 4);
  const dR_g2_bot = getWallPoint(dRightEnd - 0.05, 10);

  ctx.fillStyle = 'rgba(129, 212, 250, 0.45)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(dR_g1_bot.x, dR_g1_bot.y);
  ctx.lineTo(dR_g2_bot.x, dR_g2_bot.y);
  ctx.lineTo(dR_g2_top.x, dR_g2_top.y);
  ctx.lineTo(dR_g1_top.x, dR_g1_top.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right Kick Plate at Bottom
  const dR_k1_bot = getWallPoint(dCenterRight, 1);
  const dR_k1_top = getWallPoint(dCenterRight, 9);
  const dR_k2_top = getWallPoint(dRightEnd - 0.02, 9);
  const dR_k2_bot = getWallPoint(dRightEnd - 0.02, 1);

  ctx.fillStyle = '#8d6e63';
  ctx.beginPath();
  ctx.moveTo(dR_k1_bot.x, dR_k1_bot.y);
  ctx.lineTo(dR_k2_bot.x, dR_k2_bot.y);
  ctx.lineTo(dR_k2_top.x, dR_k2_top.y);
  ctx.lineTo(dR_k2_bot.x, dR_k2_bot.y);
  ctx.closePath();
  ctx.fill();

  // 4. Sleek Vertical Golden Door Handles
  const hL_mid = getWallPoint(dCenterLeft - 0.04, frameTopH * 0.45);
  const hR_mid = getWallPoint(dCenterRight + 0.04, frameTopH * 0.45);

  ctx.strokeStyle = '#ffb300';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(hL_mid.x, hL_mid.y - 8);
  ctx.lineTo(hL_mid.x, hL_mid.y + 8);
  ctx.moveTo(hR_mid.x, hR_mid.y - 8);
  ctx.lineTo(hR_mid.x, hR_mid.y + 8);
  ctx.stroke();

  // 5. Overhead Cafe Entrance Canopy / Awning (Text-Free)
  const awnL_back = getWallPoint(0.04, frameTopH + 2);
  const awnR_back = getWallPoint(0.96, frameTopH + 2);

  ctx.fillStyle = '#d84315';
  ctx.beginPath();
  ctx.moveTo(awnL_back.x - 3, awnL_back.y - 2);
  ctx.lineTo(awnR_back.x + 3, awnR_back.y - 2);
  ctx.lineTo(awnR_back.x + 5, awnR_back.y + 8);
  ctx.lineTo(awnL_back.x - 5, awnL_back.y + 8);
  ctx.closePath();
  ctx.fill();

  // Awning Scalloped Gold Trim
  ctx.fillStyle = '#ffb300';
  ctx.fillRect(awnL_back.x - 5, awnL_back.y + 7, (awnR_back.x - awnL_back.x) + 10, 2);

  // 6. Entrance Warm Lantern Lights (Left & Right Post)
  const lanternL = getWallPoint(0.05, frameTopH * 0.7);
  const lanternR = getWallPoint(0.95, frameTopH * 0.7);

  [lanternL, lanternR].forEach(l => {
    ctx.fillStyle = '#ffa726';
    ctx.beginPath();
    ctx.arc(l.x, l.y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff3e0';
    ctx.beginPath();
    ctx.arc(l.x, l.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  canvasCache.set(key, canvas);
  return canvas;
}

// ----------------------------------------------------
// WALL WINDOW TILE (Integrated Realistic Window in Wall)
// ----------------------------------------------------
export function renderWallWindowTile(type, dir = 'NE') {
  const key = `wall_window_${type}_${dir}`;
  if (canvasCache.has(key)) return canvasCache.get(key);

  const W = TILE_W + 4;
  const H = TILE_H + 90;
  const canvas = createCacheCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const cx = W / 2;
  const bottomY = H - TILE_H / 2 - 4;
  const wallHeight = 65;

  let p1, p2;
  if (dir === 'NW') {
    p1 = { x: cx - TILE_W / 2, y: bottomY };
    p2 = { x: cx, y: bottomY + TILE_H / 2 };
  } else {
    p1 = { x: cx, y: bottomY + TILE_H / 2 };
    p2 = { x: cx + TILE_W / 2, y: bottomY };
  }

  const p1Top = { x: p1.x, y: p1.y - wallHeight };
  const p2Top = { x: p2.x, y: p2.y - wallHeight };

  // 1. Draw Base Solid Wall Face
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p2Top.x, p2Top.y);
  ctx.lineTo(p1Top.x, p1Top.y);
  ctx.closePath();

  if (type === 'brick') {
    const g = ctx.createLinearGradient(p1.x, 0, p2.x, 0);
    if (dir === 'NW') {
      g.addColorStop(0, '#a34836');
      g.addColorStop(1, '#853728');
    } else {
      g.addColorStop(0, '#7a3123');
      g.addColorStop(1, '#5e2418');
    }
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(230,210,190,0.3)';
    ctx.lineWidth = 1;
    for (let y = p1Top.y; y < p1.y; y += 8) {
      ctx.beginPath();
      ctx.moveTo(p1.x, y);
      ctx.lineTo(p2.x, dir === 'NW' ? y + TILE_H / 2 : y - TILE_H / 2);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = dir === 'NW' ? '#3a444c' : '#2c353c';
    ctx.fill();
    ctx.strokeStyle = dir === 'NW' ? '#525e68' : '#434e56';
    ctx.stroke();
  }

  // 2. Window Frame Coordinates (Isometric Math)
  const t1 = 0.15;
  const t2 = 0.85;
  const yFracTop = 0.20;
  const yFracBottom = 0.70;

  const getPt = (t, yFrac) => {
    const bx = p1.x + t * (p2.x - p1.x);
    const byTop = p1Top.y + t * (p2Top.y - p1Top.y);
    return { x: bx, y: byTop + yFrac * wallHeight };
  };

  const wTL = getPt(t1, yFracTop);
  const wTR = getPt(t2, yFracTop);
  const wBL = getPt(t1, yFracBottom);
  const wBR = getPt(t2, yFracBottom);

  // 3. Recessed Wall Niche Shadow
  ctx.fillStyle = '#14100e';
  ctx.beginPath();
  ctx.moveTo(wTL.x - 1, wTL.y - 1);
  ctx.lineTo(wTR.x + 1, wTR.y - 1);
  ctx.lineTo(wBR.x + 1, wBR.y + 1);
  ctx.lineTo(wBL.x - 1, wBL.y + 1);
  ctx.closePath();
  ctx.fill();

  // 4. Outer Wooden Frame
  ctx.fillStyle = '#3e2723';
  ctx.beginPath();
  ctx.moveTo(wTL.x, wTL.y);
  ctx.lineTo(wTR.x, wTR.y);
  ctx.lineTo(wBR.x, wBR.y);
  ctx.lineTo(wBL.x, wBL.y);
  ctx.closePath();
  ctx.fill();

  // 5. Glass Pane
  const t1G = 0.20;
  const t2G = 0.80;
  const yFTG = 0.24;
  const yFBG = 0.66;

  const gTL = getPt(t1G, yFTG);
  const gTR = getPt(t2G, yFTG);
  const gBL = getPt(t1G, yFBG);
  const gBR = getPt(t2G, yFBG);

  const glassGrad = ctx.createLinearGradient(gTL.x, gTL.y, gBR.x, gBR.y);
  glassGrad.addColorStop(0, 'rgba(255, 236, 179, 0.8)'); // Warm golden interior shine
  glassGrad.addColorStop(0.4, 'rgba(129, 212, 250, 0.7)'); // Sky glass sheen
  glassGrad.addColorStop(1, 'rgba(41, 121, 255, 0.5)');

  ctx.fillStyle = glassGrad;
  ctx.beginPath();
  ctx.moveTo(gTL.x, gTL.y);
  ctx.lineTo(gTR.x, gTR.y);
  ctx.lineTo(gBR.x, gBR.y);
  ctx.lineTo(gBL.x, gBL.y);
  ctx.closePath();
  ctx.fill();

  // Glass Sheen Diagonal Glare
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(gTL.x + 4, gTL.y + 2);
  ctx.lineTo(gBL.x + 10, gBL.y - 2);
  ctx.moveTo(gTL.x + 9, gTL.y + 2);
  ctx.lineTo(gBL.x + 15, gBL.y - 2);
  ctx.stroke();

  // 6. Window Mullions / Crossbars
  const mTop = getPt(0.50, yFTG);
  const mBottom = getPt(0.50, yFBG);
  ctx.strokeStyle = '#2d1e18';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(mTop.x, mTop.y);
  ctx.lineTo(mBottom.x, mBottom.y);
  ctx.stroke();

  const mLeft = getPt(t1G, 0.45);
  const mRight = getPt(t2G, 0.45);
  ctx.beginPath();
  ctx.moveTo(mLeft.x, mLeft.y);
  ctx.lineTo(mRight.x, mRight.y);
  ctx.stroke();

  // 7. Protruding 3D Wooden Window Sill
  const sillLeft = getPt(t1 - 0.04, yFracBottom);
  const sillRight = getPt(t2 + 0.04, yFracBottom);
  const sillDepthY = 3.5;

  ctx.fillStyle = '#8d6e63';
  ctx.beginPath();
  ctx.moveTo(sillLeft.x, sillLeft.y);
  ctx.lineTo(sillRight.x, sillRight.y);
  ctx.lineTo(sillRight.x, sillRight.y + sillDepthY);
  ctx.lineTo(sillLeft.x, sillLeft.y + sillDepthY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#4e342e';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // 8. Flower Box on Sill
  const potTL = getPt(0.28, yFracBottom - 0.02);
  const potTR = getPt(0.72, yFracBottom - 0.02);

  ctx.fillStyle = '#d84315';
  ctx.beginPath();
  ctx.moveTo(potTL.x, potTL.y);
  ctx.lineTo(potTR.x, potTR.y);
  ctx.lineTo(potTR.x, potTR.y + 4);
  ctx.lineTo(potTL.x, potTL.y + 4);
  ctx.closePath();
  ctx.fill();

  // Flowers & Greenery
  ctx.fillStyle = '#4caf50';
  ctx.beginPath();
  ctx.arc(potTL.x + 3, potTL.y - 1, 2.5, 0, Math.PI * 2);
  ctx.arc(potTL.x + 8, potTL.y - 2, 3.0, 0, Math.PI * 2);
  ctx.arc(potTR.x - 3, potTR.y - 1, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ff5252';
  ctx.beginPath();
  ctx.arc(potTL.x + 4, potTL.y - 2, 1.2, 0, Math.PI * 2);
  ctx.arc(potTR.x - 4, potTR.y - 2, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd54f';
  ctx.beginPath();
  ctx.arc(potTL.x + 8, potTL.y - 3, 1.2, 0, Math.PI * 2);
  ctx.fill();

  canvasCache.set(key, canvas);
  return canvas;
}


// ----------------------------------------------------
// FURNITURE & EQUIPMENT SPRITES
// ----------------------------------------------------
export function renderFurnitureSprite(id, rot = 0) {
  const key = `furn_${id}_${rot}`;
  if (canvasCache.has(key)) return canvasCache.get(key);

  const W = 120;
  const H = 140;
  const canvas = createCacheCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const cx = W / 2;
  const cy = H - 35; // base anchor point

  // Shadow under object
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, 0.5);
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.fill();
  ctx.restore();

  switch (id) {
    // --- TABLES ---
    case 'TABLE_BASIC': {
      // Bistro Round Wooden Table
      // Central pedestal leg
      ctx.fillStyle = '#2b231d';
      ctx.fillRect(cx - 3, cy - 25, 6, 25);

      // Base plate
      drawIsoDiamond(ctx, cx, cy, 24, 12, '#1e1814', '#100c0a');

      // Tabletop circle in isometric perspective
      ctx.save();
      ctx.translate(cx, cy - 28);
      ctx.scale(1, 0.55);

      // Edge shadow
      ctx.beginPath();
      ctx.arc(0, 4, 22, 0, Math.PI * 2);
      ctx.fillStyle = '#6e4526';
      ctx.fill();

      // Top surface
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      const woodGrad = ctx.createRadialGradient(-5, -5, 2, 0, 0, 22);
      woodGrad.addColorStop(0, '#e5aa70');
      woodGrad.addColorStop(0.7, '#c2854b');
      woodGrad.addColorStop(1, '#965e30');
      ctx.fillStyle = woodGrad;
      ctx.fill();
      ctx.strokeStyle = '#6e411b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Soft reflection shine
      ctx.beginPath();
      ctx.arc(-6, -6, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fill();

      ctx.restore();
      break;
    }

    case 'TABLE_WOOD': {
      // Square Polished Oak Table
      const topY = cy - 30;
      // 4 Legs
      ctx.fillStyle = '#4a2c14';
      ctx.fillRect(cx - 16, topY, 4, 30);
      ctx.fillRect(cx + 12, topY, 4, 30);
      ctx.fillRect(cx - 4, topY + 6, 4, 24);
      ctx.fillRect(cx, topY - 6, 4, 24);

      // Isometric Table Top Box
      // Side skirts
      ctx.fillStyle = '#613b1c';
      ctx.beginPath();
      ctx.moveTo(cx - 20, topY);
      ctx.lineTo(cx, topY + 10);
      ctx.lineTo(cx, topY + 16);
      ctx.lineTo(cx - 20, topY + 6);
      ctx.fill();

      ctx.fillStyle = '#4d2e15';
      ctx.beginPath();
      ctx.moveTo(cx, topY + 10);
      ctx.lineTo(cx + 20, topY);
      ctx.lineTo(cx + 20, topY + 6);
      ctx.lineTo(cx, topY + 16);
      ctx.fill();

      // Top face
      drawIsoDiamond(ctx, cx, topY, 40, 20, '#b87943', '#855125');
      // Surface grain line
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 10, topY - 2);
      ctx.lineTo(cx + 8, topY + 7);
      ctx.stroke();
      break;
    }

    case 'TABLE_PREMIUM': {
      // Marble & Brass Rectangular Table
      const topY = cy - 32;
      // Brass legs
      ctx.fillStyle = '#b59338';
      ctx.fillRect(cx - 24, topY, 5, 32);
      ctx.fillRect(cx + 19, topY, 5, 32);
      ctx.fillRect(cx - 4, topY + 8, 4, 24);

      // Marble Top
      ctx.fillStyle = '#9e802c';
      ctx.beginPath();
      ctx.moveTo(cx - 28, topY);
      ctx.lineTo(cx, topY + 14);
      ctx.lineTo(cx, topY + 19);
      ctx.lineTo(cx - 28, topY + 5);
      ctx.fill();

      ctx.fillStyle = '#7a6220';
      ctx.beginPath();
      ctx.moveTo(cx, topY + 14);
      ctx.lineTo(cx + 28, topY);
      ctx.lineTo(cx + 28, topY + 5);
      ctx.lineTo(cx, topY + 19);
      ctx.fill();

      drawIsoDiamond(ctx, cx, topY, 56, 28, '#f7f5f0', '#d1caa7');
      // Gold inlay trim
      drawIsoDiamond(ctx, cx, topY, 48, 24, null, '#c4a343');
      break;
    }

    // --- CHAIRS ---
    case 'CHAIR_BASIC': {
      // High-Detail 3D Isometric Wooden Bistro Chair (Ahşap Kafe Sandalyesi)
      const seatY = cy - 18;
      const legH = 18;

      // Wood Color Palette
      const wDark = '#3d2314';      // Shadowed leg/under-apron face
      const wMid = '#5d371f';       // Main wood tone
      const wLight = '#8a532e';     // Sunlit backrest frame highlight
      const wTop = '#c4854a';       // Top surface of wooden seat
      const wTopHi = '#d4915d';     // Specular grain highlight
      const wStroke = '#2a160b';    // Dark wood edge contour

      if (rot === 0) {
        // Facing SE (table at +x): Backrest on NW edge (top-left)
        // 1. Rear Legs & Backrest Stiles (NW & NE corners extending up)
        ctx.fillStyle = wMid;
        ctx.fillRect(cx - 9, seatY - 24, 3.5, 42); // NW Back Post
        ctx.fillRect(cx + 2, seatY - 21, 3.5, 39); // NE Back Post

        // 2. Backrest Top Crown Rail & Vertical Slats
        ctx.fillStyle = wLight;
        ctx.beginPath();
        ctx.moveTo(cx - 10, seatY - 24);
        ctx.lineTo(cx + 6, seatY - 20);
        ctx.lineTo(cx + 6, seatY - 15);
        ctx.lineTo(cx - 10, seatY - 19);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = wStroke;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // 2 Vertical Wooden Slats
        ctx.fillStyle = wMid;
        ctx.fillRect(cx - 5, seatY - 18, 2, 16);
        ctx.fillRect(cx - 1, seatY - 16, 2, 15);

        // 3. Front Legs (SW & SE)
        ctx.fillStyle = wDark;
        ctx.fillRect(cx - 2, cy - legH + 4, 3, 14); // SW Leg
        ctx.fillStyle = wMid;
        ctx.fillRect(cx + 8, cy - legH, 3, 18);     // SE Leg

        // Leg Cross Stretcher
        ctx.strokeStyle = wDark;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 7, cy - 8);
        ctx.lineTo(cx + 8, cy - 8);
        ctx.stroke();

        // 4. 3D Wooden Seat Plank & Apron
        ctx.fillStyle = wDark; // Apron thickness
        ctx.beginPath();
        ctx.moveTo(cx - 11, seatY);
        ctx.lineTo(cx, seatY + 6);
        ctx.lineTo(cx + 11, seatY);
        ctx.lineTo(cx + 11, seatY + 3);
        ctx.lineTo(cx, seatY + 9);
        ctx.lineTo(cx - 11, seatY + 3);
        ctx.closePath();
        ctx.fill();

        drawIsoDiamond(ctx, cx, seatY, 22, 11, wTop, wStroke);
        drawIsoDiamond(ctx, cx - 1, seatY - 1, 18, 9, wTopHi, null);

      } else if (rot === 1) {
        // Facing SW (table at +y): Backrest on NE edge (top-right)
        // 1. Rear Legs & Backrest Stiles (NE & SE corners extending up)
        ctx.fillStyle = wMid;
        ctx.fillRect(cx - 2, seatY - 21, 3.5, 39); // NW Back Post
        ctx.fillRect(cx + 8, seatY - 24, 3.5, 42); // NE Back Post

        // 2. Backrest Top Crown Rail & Vertical Slats
        ctx.fillStyle = wLight;
        ctx.beginPath();
        ctx.moveTo(cx - 3, seatY - 20);
        ctx.lineTo(cx + 10, seatY - 24);
        ctx.lineTo(cx + 10, seatY - 19);
        ctx.lineTo(cx - 3, seatY - 15);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = wStroke;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // 2 Vertical Slats
        ctx.fillStyle = wMid;
        ctx.fillRect(cx + 1, seatY - 16, 2, 15);
        ctx.fillRect(cx + 5, seatY - 18, 2, 16);

        // 3. Front Legs
        ctx.fillStyle = wDark;
        ctx.fillRect(cx - 9, cy - legH, 3, 18);     // NW Leg
        ctx.fillStyle = wMid;
        ctx.fillRect(cx - 2, cy - legH + 4, 3, 14); // SW Leg

        // 4. 3D Wooden Seat Plank
        ctx.fillStyle = wDark;
        ctx.beginPath();
        ctx.moveTo(cx - 11, seatY);
        ctx.lineTo(cx, seatY + 6);
        ctx.lineTo(cx + 11, seatY);
        ctx.lineTo(cx + 11, seatY + 3);
        ctx.lineTo(cx, seatY + 9);
        ctx.lineTo(cx - 11, seatY + 3);
        ctx.closePath();
        ctx.fill();

        drawIsoDiamond(ctx, cx, seatY, 22, 11, wTop, wStroke);
        drawIsoDiamond(ctx, cx + 1, seatY - 1, 18, 9, wTopHi, null);

      } else if (rot === 2) {
        // Facing NW (table at -x): Backrest on SE edge (bottom-right, in front!)
        // 1. Rear Legs (NW & NE)
        ctx.fillStyle = wDark;
        ctx.fillRect(cx - 9, cy - legH, 3, 18);
        ctx.fillRect(cx + 2, cy - legH - 3, 3, 18);

        // 2. 3D Wooden Seat Plank
        ctx.fillStyle = wDark;
        ctx.beginPath();
        ctx.moveTo(cx - 11, seatY);
        ctx.lineTo(cx, seatY + 6);
        ctx.lineTo(cx + 11, seatY);
        ctx.lineTo(cx + 11, seatY + 3);
        ctx.lineTo(cx, seatY + 9);
        ctx.lineTo(cx - 11, seatY + 3);
        ctx.closePath();
        ctx.fill();

        drawIsoDiamond(ctx, cx, seatY, 22, 11, wTop, wStroke);
        drawIsoDiamond(ctx, cx, seatY - 1, 18, 9, wTopHi, null);

        // 3. Front Legs & Backrest Posts (SW & SE extending UP in front of seat!)
        ctx.fillStyle = wMid;
        ctx.fillRect(cx - 2, seatY - 18, 3.5, 36); // SW Post
        ctx.fillRect(cx + 8, seatY - 22, 3.5, 40); // SE Post

        // Backrest Crown Rail in front
        ctx.fillStyle = wLight;
        ctx.beginPath();
        ctx.moveTo(cx - 3, seatY - 17);
        ctx.lineTo(cx + 10, seatY - 21);
        ctx.lineTo(cx + 10, seatY - 16);
        ctx.lineTo(cx - 3, seatY - 12);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = wStroke;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // 2 Vertical Slats
        ctx.fillStyle = wMid;
        ctx.fillRect(cx + 1, seatY - 13, 2, 14);
        ctx.fillRect(cx + 5, seatY - 15, 2, 15);

      } else if (rot === 3) {
        // Facing NE (table at -y): Backrest on SW edge (bottom-left, in front!)
        // 1. Rear Legs (NE & SE)
        ctx.fillStyle = wDark;
        ctx.fillRect(cx + 8, cy - legH, 3, 18);
        ctx.fillRect(cx + 2, cy - legH - 3, 3, 18);

        // 2. 3D Wooden Seat Plank
        ctx.fillStyle = wDark;
        ctx.beginPath();
        ctx.moveTo(cx - 11, seatY);
        ctx.lineTo(cx, seatY + 6);
        ctx.lineTo(cx + 11, seatY);
        ctx.lineTo(cx + 11, seatY + 3);
        ctx.lineTo(cx, seatY + 9);
        ctx.lineTo(cx - 11, seatY + 3);
        ctx.closePath();
        ctx.fill();

        drawIsoDiamond(ctx, cx, seatY, 22, 11, wTop, wStroke);
        drawIsoDiamond(ctx, cx, seatY - 1, 18, 9, wTopHi, null);

        // 3. Front Legs & Backrest Posts (NW & SW extending UP in front of seat!)
        ctx.fillStyle = wMid;
        ctx.fillRect(cx - 9, seatY - 22, 3.5, 40); // NW Post
        ctx.fillRect(cx - 2, seatY - 18, 3.5, 36); // SW Post

        // Backrest Crown Rail in front
        ctx.fillStyle = wLight;
        ctx.beginPath();
        ctx.moveTo(cx - 10, seatY - 21);
        ctx.lineTo(cx + 0, seatY - 17);
        ctx.lineTo(cx + 0, seatY - 12);
        ctx.lineTo(cx - 10, seatY - 16);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = wStroke;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // 2 Vertical Slats
        ctx.fillStyle = wMid;
        ctx.fillRect(cx - 6, seatY - 15, 2, 15);
        ctx.fillRect(cx - 2, seatY - 13, 2, 14);

      } else if (rot === 4) {
        // Facing South: Backrest at North corner (top of diamond)
        ctx.fillStyle = wMid;
        ctx.fillRect(cx - 5, seatY - 24, 3.5, 42); // North Left Post
        ctx.fillRect(cx + 2, seatY - 24, 3.5, 42); // North Right Post

        // Top Crown Rail
        ctx.fillStyle = wLight;
        ctx.fillRect(cx - 6, seatY - 24, 12, 5);
        ctx.strokeStyle = wStroke;
        ctx.lineWidth = 0.8;
        ctx.strokeRect(cx - 6, seatY - 24, 12, 5);

        // Vertical Slats
        ctx.fillStyle = wMid;
        ctx.fillRect(cx - 2, seatY - 19, 2, 15);
        ctx.fillRect(cx + 1, seatY - 19, 2, 15);

        // Front Legs
        ctx.fillStyle = wDark;
        ctx.fillRect(cx - 8, cy - legH, 3, 18);
        ctx.fillRect(cx + 5, cy - legH, 3, 18);

        drawIsoDiamond(ctx, cx, seatY, 20, 11, wTop, wStroke);
        drawIsoDiamond(ctx, cx, seatY - 1, 16, 8, wTopHi, null);

      } else if (rot === 5) {
        // Facing West: Backrest at East corner (right of diamond)
        ctx.fillStyle = wMid;
        ctx.fillRect(cx + 5, seatY - 24, 4, 42); // East Back Post

        ctx.fillStyle = wLight;
        ctx.fillRect(cx + 4, seatY - 24, 5, 16);
        ctx.strokeStyle = wStroke;
        ctx.strokeRect(cx + 4, seatY - 24, 5, 16);

        // Front Legs
        ctx.fillStyle = wDark;
        ctx.fillRect(cx - 8, cy - legH, 3, 18);
        ctx.fillRect(cx, cy - legH + 4, 3, 14);

        drawIsoDiamond(ctx, cx, seatY, 20, 11, wTop, wStroke);
        drawIsoDiamond(ctx, cx, seatY - 1, 16, 8, wTopHi, null);

      } else if (rot === 6) {
        // Facing North: Backrest at South corner (bottom of diamond - front!)
        // Rear Legs
        ctx.fillStyle = wDark;
        ctx.fillRect(cx - 5, cy - legH - 4, 3, 18);
        ctx.fillRect(cx + 2, cy - legH - 4, 3, 18);

        drawIsoDiamond(ctx, cx, seatY, 20, 11, wTop, wStroke);
        drawIsoDiamond(ctx, cx, seatY - 1, 16, 8, wTopHi, null);

        // Front Backrest Post at South corner
        ctx.fillStyle = wMid;
        ctx.fillRect(cx - 5, seatY - 18, 3.5, 36);
        ctx.fillRect(cx + 2, seatY - 18, 3.5, 36);

        ctx.fillStyle = wLight;
        ctx.fillRect(cx - 6, seatY - 18, 12, 5);
        ctx.strokeStyle = wStroke;
        ctx.lineWidth = 0.8;
        ctx.strokeRect(cx - 6, seatY - 18, 12, 5);

        ctx.fillStyle = wMid;
        ctx.fillRect(cx - 2, seatY - 13, 2, 12);
        ctx.fillRect(cx + 1, seatY - 13, 2, 12);

      } else if (rot === 7) {
        // Facing East: Backrest at West corner (left of diamond)
        ctx.fillStyle = wMid;
        ctx.fillRect(cx - 8, seatY - 24, 4, 42); // West Back Post

        ctx.fillStyle = wLight;
        ctx.fillRect(cx - 9, seatY - 24, 5, 16);
        ctx.strokeStyle = wStroke;
        ctx.strokeRect(cx - 9, seatY - 24, 5, 16);

        // Front Legs
        ctx.fillStyle = wDark;
        ctx.fillRect(cx + 5, cy - legH, 3, 18);
        ctx.fillRect(cx, cy - legH + 4, 3, 14);

        drawIsoDiamond(ctx, cx, seatY, 20, 11, wTop, wStroke);
        drawIsoDiamond(ctx, cx, seatY - 1, 16, 8, wTopHi, null);
      }
      break;
    }

    case 'CHAIR_COMFORT': {
      // Cushioned Armchair for all 8 rotations
      const seatY = cy - 20;

      // Base Legs
      ctx.fillStyle = '#4a2d18';
      ctx.fillRect(cx - 10, seatY, 4, 20);
      ctx.fillRect(cx + 6, seatY, 4, 20);

      if (rot === 0) {
        // Facing SE: Back pillow at top-left (NW)
        ctx.fillStyle = '#ad4531';
        ctx.beginPath();
        ctx.arc(cx - 6, seatY - 14, 9, 0, Math.PI * 2);
        ctx.fill();
        drawIsoDiamond(ctx, cx, seatY, 26, 13, '#c95b45', '#823424');
      } else if (rot === 1) {
        // Facing SW: Back pillow at top-right (NE)
        ctx.fillStyle = '#ad4531';
        ctx.beginPath();
        ctx.arc(cx + 6, seatY - 14, 9, 0, Math.PI * 2);
        ctx.fill();
        drawIsoDiamond(ctx, cx, seatY, 26, 13, '#c95b45', '#823424');
      } else if (rot === 2) {
        // Facing NW: Back pillow at bottom-right (SE)
        drawIsoDiamond(ctx, cx, seatY, 26, 13, '#c95b45', '#823424');
        ctx.fillStyle = '#ad4531';
        ctx.beginPath();
        ctx.arc(cx + 6, seatY - 4, 9, 0, Math.PI * 2);
        ctx.fill();
      } else if (rot === 3) {
        // Facing NE: Back pillow at bottom-left (SW)
        drawIsoDiamond(ctx, cx, seatY, 26, 13, '#c95b45', '#823424');
        ctx.fillStyle = '#ad4531';
        ctx.beginPath();
        ctx.arc(cx - 6, seatY - 4, 9, 0, Math.PI * 2);
        ctx.fill();
      } else if (rot === 4) {
        // Facing South: Back pillow at top-center (N)
        ctx.fillStyle = '#ad4531';
        ctx.beginPath();
        ctx.arc(cx, seatY - 16, 9, 0, Math.PI * 2);
        ctx.fill();
        drawIsoDiamond(ctx, cx, seatY, 24, 14, '#c95b45', '#823424');
      } else if (rot === 5) {
        // Facing West: Back pillow at right-center (E)
        ctx.fillStyle = '#ad4531';
        ctx.beginPath();
        ctx.arc(cx + 7, seatY - 10, 9, 0, Math.PI * 2);
        ctx.fill();
        drawIsoDiamond(ctx, cx, seatY, 24, 14, '#c95b45', '#823424');
      } else if (rot === 6) {
        // Facing North: Back pillow at bottom-center (S)
        drawIsoDiamond(ctx, cx, seatY, 24, 14, '#c95b45', '#823424');
        ctx.fillStyle = '#ad4531';
        ctx.beginPath();
        ctx.arc(cx, seatY - 3, 9, 0, Math.PI * 2);
        ctx.fill();
      } else if (rot === 7) {
        // Facing East: Back pillow at left-center (W)
        ctx.fillStyle = '#ad4531';
        ctx.beginPath();
        ctx.arc(cx - 7, seatY - 10, 9, 0, Math.PI * 2);
        ctx.fill();
        drawIsoDiamond(ctx, cx, seatY, 24, 14, '#c95b45', '#823424');
      }
      break;
    }

    case 'CHAIR_SOFA': {
      // Normal Grounded Leather Cafe Lounge Sofa
      // Anchor cy is exact floor tile level. Legs rest flush on cy.

      // 1. Solid Ground Shadow directly under sofa base footprint
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, 0.45);
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fill();
      ctx.restore();

      // 2. Wooden Legs resting firmly on ground (from cy - 8 to cy)
      ctx.fillStyle = '#261208';
      ctx.fillRect(cx - 16, cy - 8, 4, 8);
      ctx.fillRect(cx + 12, cy - 8, 4, 8);
      ctx.fillRect(cx - 6, cy - 4, 4, 4);
      ctx.fillRect(cx + 2, cy - 12, 4, 4);

      // Leather Color Palette
      const cShadow = '#38170a';
      const cBase = '#5e2912';
      const cCushion = '#87411f';
      const cHighlight = '#9e4f27';
      const cEdge = '#b86032';

      if (rot === 0 || rot === 1 || rot === 4 || rot === 7) {
        // Backrest on Top-Left / North-West (Facing SE / SW)
        
        // A. Backrest Block (rising from cy - 14 up to cy - 35)
        ctx.fillStyle = cBase;
        ctx.beginPath();
        ctx.moveTo(cx - 22, cy - 14);
        ctx.lineTo(cx + 4, cy - 26);
        ctx.lineTo(cx + 22, cy - 14);
        ctx.lineTo(cx + 22, cy + 4);
        ctx.lineTo(cx - 22, cy + 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = cShadow;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // B. Armrests
        ctx.fillStyle = cBase;
        ctx.fillRect(cx - 24, cy - 20, 6, 14);
        ctx.fillRect(cx + 18, cy - 20, 6, 14);
        ctx.strokeStyle = cShadow;
        ctx.strokeRect(cx - 24, cy - 20, 6, 14);
        ctx.strokeRect(cx + 18, cy - 20, 6, 14);

        // C. Seat Cushion (at cy - 10)
        drawIsoDiamond(ctx, cx, cy - 10, 38, 19, cCushion, cShadow);
        drawIsoDiamond(ctx, cx, cy - 13, 36, 17, cHighlight, cEdge);

        // Cushion Seam Line
        ctx.strokeStyle = cShadow;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 21);
        ctx.lineTo(cx, cy - 4);
        ctx.stroke();

      } else {
        // Backrest on Bottom-Right / South-East (Facing NW / NE)

        // A. Seat Cushion (at cy - 12)
        drawIsoDiamond(ctx, cx, cy - 12, 38, 19, cCushion, cShadow);
        drawIsoDiamond(ctx, cx, cy - 15, 36, 17, cHighlight, cEdge);

        // Cushion Seam Line
        ctx.strokeStyle = cShadow;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 23);
        ctx.lineTo(cx, cy - 6);
        ctx.stroke();

        // B. Armrests
        ctx.fillStyle = cBase;
        ctx.fillRect(cx - 24, cy - 16, 6, 14);
        ctx.fillRect(cx + 18, cy - 16, 6, 14);
        ctx.strokeStyle = cShadow;
        ctx.strokeRect(cx - 24, cy - 16, 6, 14);
        ctx.strokeRect(cx + 18, cy - 16, 6, 14);

        // C. Front Sofa Base Skirt (from cy - 8 to cy - 2)
        ctx.fillStyle = cBase;
        ctx.beginPath();
        ctx.moveTo(cx - 22, cy - 12);
        ctx.lineTo(cx, cy - 2);
        ctx.lineTo(cx + 22, cy - 12);
        ctx.lineTo(cx + 22, cy - 6);
        ctx.lineTo(cx, cy + 4);
        ctx.lineTo(cx - 22, cy - 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = cShadow;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      break;
    }

    // --- COUNTERS ---
    case 'COUNTER_BASIC': {
      // Professional Barista Service Counter & Modern Touchscreen POS Terminal
      const topY = cy - 30;

      // 1. Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.30)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, 32, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Main 3D Counter Base (Floor cy to topY)
      // Front Left Face (Slatted Dark Oak Paneling with Ambient LED Kickplate)
      const gOakL = ctx.createLinearGradient(cx - 30, 0, cx, 0);
      gOakL.addColorStop(0, '#3e2723');
      gOakL.addColorStop(0.5, '#4e342e');
      gOakL.addColorStop(1, '#5d4037');
      ctx.fillStyle = gOakL;
      ctx.beginPath();
      ctx.moveTo(cx - 30, topY);
      ctx.lineTo(cx, topY + 15);
      ctx.lineTo(cx, cy + 2);
      ctx.lineTo(cx - 30, cy - 13);
      ctx.closePath();
      ctx.fill();

      // Vertical 3D Wood Slats on Left Face
      ctx.fillStyle = '#2c1d17';
      for (let sx = cx - 26; sx <= cx - 4; sx += 6) {
        ctx.fillRect(sx, topY + 6, 2.5, cy - topY - 14);
      }

      // Front Right Face (Darker Oak Shadow Face)
      const gOakR = ctx.createLinearGradient(cx, 0, cx + 30, 0);
      gOakR.addColorStop(0, '#2d1d17');
      gOakR.addColorStop(1, '#1b100c');
      ctx.fillStyle = gOakR;
      ctx.beginPath();
      ctx.moveTo(cx, topY + 15);
      ctx.lineTo(cx + 30, topY);
      ctx.lineTo(cx + 30, cy - 13);
      ctx.lineTo(cx, cy + 2);
      ctx.closePath();
      ctx.fill();

      // Ambient LED Strip along Kickplate Base
      ctx.fillStyle = '#ffd54f';
      ctx.shadowColor = '#ffd54f';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy - 12);
      ctx.lineTo(cx, cy + 2);
      ctx.lineTo(cx + 30, cy - 12);
      ctx.lineTo(cx + 30, cy - 14);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx - 30, cy - 14);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Polish Warm Oak Countertop Slab with Brass Rim
      drawIsoDiamond(ctx, cx, topY, 60, 30, '#8d6e63', '#d4af37');

      // 3. Ultra-Detailed 3D Modern POS Cash Register System (at posBaseY = topY - 2)
      const posBaseY = topY - 2;

      // Heavy Steel Cash Drawer Base
      ctx.fillStyle = '#263238';
      ctx.fillRect(cx - 16, posBaseY - 4, 18, 4);
      ctx.fillStyle = '#cfd8dc';
      ctx.fillRect(cx - 10, posBaseY - 3, 6, 1.5);

      // Angled POS Touchscreen Monitor Base Stand
      ctx.fillStyle = '#37474f';
      ctx.fillRect(cx - 10, posBaseY - 12, 6, 8);

      // Angled Touchscreen Tablet Screen
      const scrW = 16;
      const scrH = 12;

      // Monitor Body (Black Bezels)
      ctx.fillStyle = '#121212';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(cx - 14, posBaseY - 24, scrW, scrH, 2);
      } else {
        ctx.rect(cx - 14, posBaseY - 24, scrW, scrH);
      }
      ctx.fill();

      // Display Screen Content (Live Order UI glowing)
      ctx.fillStyle = '#1c272c';
      ctx.fillRect(cx - 13, posBaseY - 23, scrW - 2, scrH - 2);

      // UI Text & Green Total
      ctx.fillStyle = '#00e676';
      ctx.font = 'bold 5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('₺160.00', cx - 5, posBaseY - 18);

      ctx.fillStyle = '#4fc3f7';
      ctx.fillRect(cx - 12, posBaseY - 16, 6, 1);
      ctx.fillRect(cx - 12, posBaseY - 14, 8, 1);

      // Rear Customer Facing Pole Display
      ctx.fillStyle = '#37474f';
      ctx.fillRect(cx + 8, posBaseY - 18, 2, 14);
      ctx.fillStyle = '#212121';
      ctx.fillRect(cx + 4, posBaseY - 22, 10, 5);
      ctx.fillStyle = '#00e676';
      ctx.font = 'bold 4px monospace';
      ctx.fillText('WELCOME', cx + 9, posBaseY - 18);

      // Contactless NFC Card Reader (POS Terminal)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(cx + 5, posBaseY - 6, 7, 5, 1);
      } else {
        ctx.rect(cx + 5, posBaseY - 6, 7, 5);
      }
      ctx.fill();
      ctx.fillStyle = '#00e676';
      ctx.beginPath(); ctx.arc(cx + 8.5, posBaseY - 4, 1.2, 0, Math.PI * 2); ctx.fill();

      // Thermal Receipt Printer with Paper Slip
      ctx.fillStyle = '#37474f';
      ctx.fillRect(cx - 22, posBaseY - 6, 6, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 21, posBaseY - 8, 4, 3);

      // Glass Tip Jar next to register
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.strokeStyle = '#cfd8dc'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(cx + 18, posBaseY - 3, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath(); ctx.arc(cx + 18, posBaseY - 2, 1.5, 0, Math.PI * 2); ctx.fill();
      break;
    }

    case 'COUNTER_MARBLE': {
      // Luxury Italian Carrara Marble Pastry Counter & Illuminated Glass Showcase
      const topY = cy - 32;

      // 1. Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 5, 34, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Main 3D Marble Counter Base (Floor cy to topY)
      // Front Left Face (Italian Carrara Marble Panel with Slate Base)
      const gMrbL = ctx.createLinearGradient(cx - 32, 0, cx, 0);
      gMrbL.addColorStop(0, '#e0e0e0');
      gMrbL.addColorStop(0.5, '#f5f5f5');
      gMrbL.addColorStop(1, '#eceff1');
      ctx.fillStyle = gMrbL;
      ctx.beginPath();
      ctx.moveTo(cx - 32, topY);
      ctx.lineTo(cx, topY + 16);
      ctx.lineTo(cx, cy + 2);
      ctx.lineTo(cx - 32, cy - 14);
      ctx.closePath();
      ctx.fill();

      // Realistic Gray Marble Veins on Left Face
      ctx.strokeStyle = 'rgba(120, 144, 156, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 28, topY + 4);
      ctx.lineTo(cx - 18, topY + 12);
      ctx.lineTo(cx - 8, topY + 8);
      ctx.stroke();

      // Front Right Face (Darker Marble Shadow Face)
      const gMrbR = ctx.createLinearGradient(cx, 0, cx + 32, 0);
      gMrbR.addColorStop(0, '#cfd8dc');
      gMrbR.addColorStop(1, '#b0bec5');
      ctx.fillStyle = gMrbR;
      ctx.beginPath();
      ctx.moveTo(cx, topY + 16);
      ctx.lineTo(cx + 32, topY);
      ctx.lineTo(cx + 32, cy - 14);
      ctx.lineTo(cx, cy + 2);
      ctx.closePath();
      ctx.fill();

      // Dark Slate Base Plinth (Kickplate Base)
      ctx.fillStyle = '#263238';
      ctx.beginPath();
      ctx.moveTo(cx - 32, cy - 14);
      ctx.lineTo(cx, cy + 2);
      ctx.lineTo(cx + 32, cy - 14);
      ctx.lineTo(cx + 32, cy - 10);
      ctx.lineTo(cx, cy + 6);
      ctx.lineTo(cx - 32, cy - 10);
      ctx.closePath();
      ctx.fill();

      // White Marble Countertop Slab with Bevel Rim
      drawIsoDiamond(ctx, cx, topY, 64, 32, '#ffffff', '#cfd8dc');

      // 3. 3D Curved Glass Bakery Showcase Unit resting ON TOP of Marble Counter (at scBaseY = topY - 2)
      const scBaseY = topY - 2;

      // Chrome Frame Stand Pillars
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(cx - 2, scBaseY - 22, 2, 22);
      ctx.fillRect(cx + 22, scBaseY - 22, 2, 22);

      // Showcase Interior Warm LED Glow Cavity
      const scGlow = ctx.createLinearGradient(cx - 2, 0, cx + 22, 0);
      scGlow.addColorStop(0, 'rgba(255, 248, 225, 0.9)');
      scGlow.addColorStop(0.5, 'rgba(255, 236, 179, 0.95)');
      scGlow.addColorStop(1, 'rgba(255, 224, 130, 0.9)');
      ctx.fillStyle = scGlow;
      ctx.beginPath();
      ctx.rect(cx - 2, scBaseY - 22, 24, 20);
      ctx.fill();

      // Shelf Tier Division Line
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(cx - 2, scBaseY - 12, 24, 1.5);

      // 4. Artisanal Pastries & Desserts inside Showcase
      // TOP TIER: San Sebastian Cheesecake Slice, Croissant, Chocolate Donut
      // Cheesecake Slice with Caramel Glaze
      ctx.fillStyle = '#fff9c4';
      ctx.beginPath(); ctx.ellipse(cx + 2, scBaseY - 16, 3, 2, Math.PI / 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6d4c41'; ctx.fillRect(cx + 1, scBaseY - 18, 3, 1);

      // Golden Butter Croissant
      ctx.fillStyle = '#e08630';
      ctx.beginPath(); ctx.ellipse(cx + 9, scBaseY - 16, 4, 2.5, -Math.PI / 8, 0, Math.PI * 2); ctx.fill();

      // Belgium Chocolate Glaze Donut
      ctx.fillStyle = '#3e2723';
      ctx.beginPath(); ctx.arc(cx + 17, scBaseY - 16, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff8e1'; ctx.beginPath(); ctx.arc(cx + 17, scBaseY - 16, 1, 0, Math.PI * 2); ctx.fill();

      // BOTTOM TIER: Strawberry Tartlet & Waffle Slice
      // Strawberry Tartlet with Red Berries
      ctx.fillStyle = '#d84315';
      ctx.beginPath(); ctx.arc(cx + 4, scBaseY - 6, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c62828'; ctx.beginPath(); ctx.arc(cx + 4, scBaseY - 7, 1.5, 0, Math.PI * 2); ctx.fill();

      // Waffle Slice with Chocolate Drizzle
      ctx.fillStyle = '#ffb300';
      ctx.fillRect(cx + 12, scBaseY - 8, 7, 4);
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(cx + 13, scBaseY - 7, 5, 1);

      // 5. Outer Glass Glare Reflections & Chrome Trim
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(cx - 2, scBaseY - 22, 24, 20);

      // Diagonal Slanted Glare Stripes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.moveTo(cx + 2, scBaseY - 22);
      ctx.lineTo(cx + 8, scBaseY - 22);
      ctx.lineTo(cx - 1, scBaseY - 2);
      ctx.lineTo(cx - 2, scBaseY - 2);
      ctx.closePath();
      ctx.fill();
      break;
    }

    // --- ESPRESSO MACHINES & PLATFORMS ---
    case 'ESPRESSO_MACHINE_TIER_1': {
      // Classic Italian Lever Espresso Machine on Solid Oak Barista Counter Stand
      const topY = cy - 26;

      // 1. Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, 26, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Barista Counter Cabinet Base (Floor cy to topY)
      // Front Left Face (Warm Oak)
      const gOakL = ctx.createLinearGradient(cx - 24, 0, cx, 0);
      gOakL.addColorStop(0, '#5c391e');
      gOakL.addColorStop(1, '#6d4c41');
      ctx.fillStyle = gOakL;
      ctx.beginPath();
      ctx.moveTo(cx - 24, topY);
      ctx.lineTo(cx, topY + 12);
      ctx.lineTo(cx, cy + 2);
      ctx.lineTo(cx - 24, cy - 10);
      ctx.closePath();
      ctx.fill();

      // Front Right Face (Darker Oak Shadow)
      const gOakR = ctx.createLinearGradient(cx, 0, cx + 24, 0);
      gOakR.addColorStop(0, '#422814');
      gOakR.addColorStop(1, '#2e1c0c');
      ctx.fillStyle = gOakR;
      ctx.beginPath();
      ctx.moveTo(cx, topY + 12);
      ctx.lineTo(cx + 24, topY);
      ctx.lineTo(cx + 24, cy - 10);
      ctx.lineTo(cx, cy + 2);
      ctx.closePath();
      ctx.fill();

      // Cabinet Door Line & Handles
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 12, topY + 6);
      ctx.lineTo(cx - 12, cy - 4);
      ctx.moveTo(cx + 12, topY + 6);
      ctx.lineTo(cx + 12, cy - 4);
      ctx.stroke();

      ctx.fillStyle = '#d4af37';
      ctx.fillRect(cx - 14, topY + 10, 2, 6);
      ctx.fillRect(cx + 12, topY + 10, 2, 6);

      // Polish Oak Countertop Slab
      drawIsoDiamond(ctx, cx, topY, 48, 24, '#8d6e63', '#4e342e');

      // 3. 3D Lever Espresso Machine Unit resting ON TOP of the Countertop (at mBaseY = topY - 2)
      const mBaseY = topY - 2;

      // Rubber Feet
      ctx.fillStyle = '#212121';
      ctx.fillRect(cx - 12, mBaseY, 3, 2);
      ctx.fillRect(cx + 9, mBaseY, 3, 2);

      // Stainless Steel Drip Tray
      ctx.fillStyle = '#9e9e9e';
      ctx.fillRect(cx - 12, mBaseY - 3, 24, 3);
      ctx.fillStyle = '#616161';
      for (let tx = cx - 10; tx <= cx + 8; tx += 4) {
        ctx.fillRect(tx, mBaseY - 2, 2, 1);
      }

      // Chrome Machine Boiler Body (3D Cylinder / Block)
      const mW = 18;
      const mH = 16;

      // Machine Front Face (Brilliant Chrome Gradient)
      const gChrome = ctx.createLinearGradient(cx - mW / 2, 0, cx + mW / 2, 0);
      gChrome.addColorStop(0, '#bdbdbd');
      gChrome.addColorStop(0.3, '#ffffff');
      gChrome.addColorStop(0.7, '#e0e0e0');
      gChrome.addColorStop(1, '#757575');
      ctx.fillStyle = gChrome;
      ctx.beginPath();
      ctx.moveTo(cx - mW / 2, mBaseY - mH);
      ctx.lineTo(cx + mW / 2, mBaseY - mH);
      ctx.lineTo(cx + mW / 2, mBaseY - 3);
      ctx.lineTo(cx - mW / 2, mBaseY - 3);
      ctx.closePath();
      ctx.fill();

      // Mirror Reflection Stripe
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fillRect(cx - 3, mBaseY - mH, 4, mH - 3);

      // Chrome Boiler Top Dome
      ctx.fillStyle = gChrome;
      ctx.beginPath();
      ctx.arc(cx, mBaseY - mH, mW / 2, Math.PI, 0);
      ctx.fill();

      // Eagle / Brass Finial Ornament on top dome
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(cx, mBaseY - mH - 10, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // 4. Vintage Pulling Lever with Black Knob
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 2, mBaseY - mH - 4);
      ctx.lineTo(cx - 10, mBaseY - mH - 18);
      ctx.stroke();

      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(cx - 10, mBaseY - mH - 18, 3, 0, Math.PI * 2);
      ctx.fill();

      // 5. E61 Brew Group & Portafilter Handle
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(cx - 4, mBaseY - 11, 8, 5);

      // Black Bakelite Portafilter Handle
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(cx + 4, mBaseY - 9, 9, 3, 1);
      } else {
        ctx.rect(cx + 4, mBaseY - 9, 9, 3);
      }
      ctx.fill();

      // 6. Dual Analog Pressure Gauges (Barometer)
      // Gauge 1
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx - 5, mBaseY - 13, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.fillStyle = '#b71c1c'; ctx.fillRect(cx - 5, mBaseY - 14, 1, 2);

      // Steam Wand
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - 7, mBaseY - 8);
      ctx.lineTo(cx - 11, mBaseY - 4);
      ctx.stroke();
      break;
    }

    case 'ESPRESSO_MACHINE_TIER_2': {
      // Dual-Group Commercial Stainless & Slate Espresso Machine on White Marble Barista Stand
      const topY = cy - 28;

      // 1. Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, 30, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Barista Counter Cabinet Base (Floor cy to topY)
      // Front Left Face (Slate Gray Cabinet with LED Accent Trim)
      const gSlateL = ctx.createLinearGradient(cx - 28, 0, cx, 0);
      gSlateL.addColorStop(0, '#37474f');
      gSlateL.addColorStop(1, '#455a64');
      ctx.fillStyle = gSlateL;
      ctx.beginPath();
      ctx.moveTo(cx - 28, topY);
      ctx.lineTo(cx, topY + 14);
      ctx.lineTo(cx, cy + 2);
      ctx.lineTo(cx - 28, cy - 12);
      ctx.closePath();
      ctx.fill();

      // Front Right Face (Darker Slate Shadow Face)
      const gSlateR = ctx.createLinearGradient(cx, 0, cx + 28, 0);
      gSlateR.addColorStop(0, '#263238');
      gSlateR.addColorStop(1, '#1c272c');
      ctx.fillStyle = gSlateR;
      ctx.beginPath();
      ctx.moveTo(cx, topY + 14);
      ctx.lineTo(cx + 28, topY);
      ctx.lineTo(cx + 28, cy - 12);
      ctx.lineTo(cx, cy + 2);
      ctx.closePath();
      ctx.fill();

      // Stainless Steel Handles / Trim Strip
      ctx.fillStyle = '#b0bec5';
      ctx.fillRect(cx - 22, cy - 6, 14, 2);
      ctx.fillRect(cx + 8, cy - 6, 14, 2);

      // White Carrara Marble Countertop Slab
      drawIsoDiamond(ctx, cx, topY, 56, 28, '#f5f5f5', '#b0bec5');

      // Subtle Marble Veins on Slab Surface
      ctx.strokeStyle = 'rgba(120, 144, 156, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(cx - 15, topY - 2);
      ctx.lineTo(cx - 5, topY + 4);
      ctx.lineTo(cx + 10, topY - 1);
      ctx.stroke();

      // 3. 3D Dual-Group Stainless Machine Unit resting ON TOP of Marble Counter (at mBaseY = topY - 2)
      const mBaseY = topY - 2;

      // Stainless Drip Tray with Grid
      ctx.fillStyle = '#78909c';
      ctx.fillRect(cx - 18, mBaseY - 3, 36, 3);
      ctx.fillStyle = '#37474f';
      for (let tx = cx - 16; tx <= cx + 14; tx += 4) {
        ctx.fillRect(tx, mBaseY - 2, 2, 1);
      }

      // Main 3D Stainless Machine Body (Isometric Block)
      const mW = 32;
      const mH = 20;

      // Top Face of Machine
      const gSTop = ctx.createLinearGradient(cx - mW / 2, 0, cx + mW / 2, 0);
      gSTop.addColorStop(0, '#cfd8dc');
      gSTop.addColorStop(0.5, '#eceff1');
      gSTop.addColorStop(1, '#b0bec5');
      ctx.fillStyle = gSTop;
      ctx.beginPath();
      ctx.moveTo(cx, mBaseY - mH - 7);
      ctx.lineTo(cx + mW / 2, mBaseY - mH);
      ctx.lineTo(cx, mBaseY - mH + 7);
      ctx.lineTo(cx - mW / 2, mBaseY - mH);
      ctx.closePath();
      ctx.fill();

      // Front Left Face of Machine
      ctx.fillStyle = '#b0bec5';
      ctx.beginPath();
      ctx.moveTo(cx - mW / 2, mBaseY - mH);
      ctx.lineTo(cx, mBaseY - mH + 7);
      ctx.lineTo(cx, mBaseY - 3);
      ctx.lineTo(cx - mW / 2, mBaseY - 8);
      ctx.closePath();
      ctx.fill();

      // Front Right Face of Machine (Front Operating Panel)
      const gSFront = ctx.createLinearGradient(cx, 0, cx + mW / 2, 0);
      gSFront.addColorStop(0, '#eceff1');
      gSFront.addColorStop(0.5, '#ffffff');
      gSFront.addColorStop(1, '#cfd8dc');
      ctx.fillStyle = gSFront;
      ctx.beginPath();
      ctx.moveTo(cx, mBaseY - mH + 7);
      ctx.lineTo(cx + mW / 2, mBaseY - mH);
      ctx.lineTo(cx + mW / 2, mBaseY - 8);
      ctx.lineTo(cx, mBaseY - 3);
      ctx.closePath();
      ctx.fill();

      // Digital Shot Timer / Extraction Screen
      ctx.fillStyle = '#1c272c';
      ctx.fillRect(cx - 5, mBaseY - mH + 3, 10, 5);
      ctx.fillStyle = '#00e676';
      ctx.font = 'bold 4px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('25s', cx, mBaseY - mH + 7);

      // 4. Two Ergonomic Brew Groups & Portafilters
      // Group 1 (Left)
      ctx.fillStyle = '#37474f';
      ctx.fillRect(cx - 12, mBaseY - 11, 7, 7);
      ctx.fillStyle = '#212121';
      ctx.fillRect(cx - 13, mBaseY - 7, 9, 3);

      // Group 2 (Right)
      ctx.fillStyle = '#37474f';
      ctx.fillRect(cx + 5, mBaseY - 11, 7, 7);
      ctx.fillStyle = '#212121';
      ctx.fillRect(cx + 4, mBaseY - 7, 9, 3);

      // Dual Steam Wands with Cool-Touch Rubber Grips
      ctx.strokeStyle = '#78909c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 14, mBaseY - 14); ctx.lineTo(cx - 17, mBaseY - 4);
      ctx.moveTo(cx + 14, mBaseY - 14); ctx.lineTo(cx + 17, mBaseY - 4);
      ctx.stroke();

      // 5. Cup Warming Rack on top with Ceramic Cups
      ctx.fillStyle = '#78909c';
      ctx.fillRect(cx - 14, mBaseY - mH - 9, 28, 2);

      // White & Navy Ceramic Cups on rack
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx - 10, mBaseY - mH - 11, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx - 2, mBaseY - mH - 11, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a237e';
      ctx.beginPath(); ctx.arc(cx + 6, mBaseY - mH - 11, 3, 0, Math.PI * 2); ctx.fill();
      break;
    }

    case 'ESPRESSO_MACHINE_TIER_3': {
      // Ultra Matte Black & Raw Copper 3-Group Commercial Machine on Luxury Black Granite Stand
      const topY = cy - 30;

      // 1. Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 5, 34, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Barista Counter Cabinet Base (Floor cy to topY)
      // Front Left Face (Matte Black with Illuminated Logo Badge)
      const gBlkL = ctx.createLinearGradient(cx - 32, 0, cx, 0);
      gBlkL.addColorStop(0, '#1c1c1c');
      gBlkL.addColorStop(1, '#2d2d2d');
      ctx.fillStyle = gBlkL;
      ctx.beginPath();
      ctx.moveTo(cx - 32, topY);
      ctx.lineTo(cx, topY + 16);
      ctx.lineTo(cx, cy + 2);
      ctx.lineTo(cx - 32, cy - 14);
      ctx.closePath();
      ctx.fill();

      // Front Right Face (Dark Matte Black Shadow Face)
      const gBlkR = ctx.createLinearGradient(cx, 0, cx + 32, 0);
      gBlkR.addColorStop(0, '#141414');
      gBlkR.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = gBlkR;
      ctx.beginPath();
      ctx.moveTo(cx, topY + 16);
      ctx.lineTo(cx + 32, topY);
      ctx.lineTo(cx + 32, cy - 14);
      ctx.lineTo(cx, cy + 2);
      ctx.closePath();
      ctx.fill();

      // Raw Copper Accent Frame Strip along Pedestal Front
      ctx.fillStyle = '#d87d4a';
      ctx.beginPath();
      ctx.moveTo(cx - 32, topY + 8);
      ctx.lineTo(cx, topY + 24);
      ctx.lineTo(cx + 32, topY + 8);
      ctx.lineTo(cx + 32, topY + 6);
      ctx.lineTo(cx, topY + 22);
      ctx.lineTo(cx - 32, topY + 6);
      ctx.closePath();
      ctx.fill();

      // Illuminated LED Brand Badge on Cabinet Front
      ctx.fillStyle = '#29b6f6';
      ctx.shadowColor = '#29b6f6';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.ellipse(cx - 16, cy - 4, 4, 2, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Nero Marquina Black Granite Top Slab with Copper Rim
      drawIsoDiamond(ctx, cx, topY, 64, 32, '#1a1a1a', '#d87d4a');

      // 3. 3D 3-Group Matte Black & Copper Machine Unit resting ON TOP of Granite Counter (at mBaseY = topY - 2)
      const mBaseY = topY - 2;

      // Heavy Duty Copper Drip Tray
      ctx.fillStyle = '#b85d2a';
      ctx.fillRect(cx - 24, mBaseY - 4, 48, 4);
      ctx.fillStyle = '#1c1c1c';
      for (let tx = cx - 22; tx <= cx + 20; tx += 4) {
        ctx.fillRect(tx, mBaseY - 3, 2, 2);
      }

      // Main 3D Machine Body (Matte Black Box with Copper Side Wings)
      const mW = 44;
      const mH = 24;

      // Top Face of Machine
      const gM3Top = ctx.createLinearGradient(cx - mW / 2, 0, cx + mW / 2, 0);
      gM3Top.addColorStop(0, '#2b2b2b');
      gM3Top.addColorStop(0.5, '#3d3d3d');
      gM3Top.addColorStop(1, '#1f1f1f');
      ctx.fillStyle = gM3Top;
      ctx.beginPath();
      ctx.moveTo(cx, mBaseY - mH - 8);
      ctx.lineTo(cx + mW / 2, mBaseY - mH);
      ctx.lineTo(cx, mBaseY - mH + 8);
      ctx.lineTo(cx - mW / 2, mBaseY - mH);
      ctx.closePath();
      ctx.fill();

      // Left Copper Side Panel
      ctx.fillStyle = '#d87d4a';
      ctx.beginPath();
      ctx.moveTo(cx - mW / 2 - 2, mBaseY - mH - 1);
      ctx.lineTo(cx - mW / 2 + 4, mBaseY - mH + 1);
      ctx.lineTo(cx - mW / 2 + 4, mBaseY - 4);
      ctx.lineTo(cx - mW / 2 - 2, mBaseY - 6);
      ctx.closePath();
      ctx.fill();

      // Right Copper Side Panel
      ctx.fillStyle = '#b85d2a';
      ctx.beginPath();
      ctx.moveTo(cx + mW / 2 - 4, mBaseY - mH + 1);
      ctx.lineTo(cx + mW / 2 + 2, mBaseY - mH - 1);
      ctx.lineTo(cx + mW / 2 + 2, mBaseY - 6);
      ctx.lineTo(cx + mW / 2 - 4, mBaseY - 4);
      ctx.closePath();
      ctx.fill();

      // Front Operating Face (Matte Black)
      ctx.fillStyle = '#1f1f1f';
      ctx.beginPath();
      ctx.moveTo(cx, mBaseY - mH + 8);
      ctx.lineTo(cx + mW / 2 - 4, mBaseY - mH + 1);
      ctx.lineTo(cx + mW / 2 - 4, mBaseY - 4);
      ctx.lineTo(cx, mBaseY - 3);
      ctx.closePath();
      ctx.fill();

      // 4. 3 High-Tech Touch Screens & Live Extraction Graphs above each group
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(cx - 16, mBaseY - mH + 4, 8, 4);
      ctx.fillRect(cx - 3, mBaseY - mH + 6, 8, 4);
      ctx.fillRect(cx + 10, mBaseY - mH + 4, 8, 4);

      // 5. 3 Saturated Group Heads with Brass / Copper Portafilters
      // Group 1
      ctx.fillStyle = '#d87d4a';
      ctx.fillRect(cx - 17, mBaseY - 14, 8, 9);
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(cx - 19, mBaseY - 9, 10, 3);

      // Group 2
      ctx.fillStyle = '#d87d4a';
      ctx.fillRect(cx - 4, mBaseY - 12, 8, 9);
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(cx - 5, mBaseY - 7, 10, 3);

      // Group 3
      ctx.fillStyle = '#d87d4a';
      ctx.fillRect(cx + 9, mBaseY - 14, 8, 9);
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(cx + 8, mBaseY - 9, 10, 3);

      // Double Insulated Copper Steam Wands with Walnut Valves
      ctx.strokeStyle = '#d87d4a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cx - 20, mBaseY - 16); ctx.lineTo(cx - 24, mBaseY - 4);
      ctx.moveTo(cx + 20, mBaseY - 16); ctx.lineTo(cx + 24, mBaseY - 4);
      ctx.stroke();

      // 6. Heated Cup Warming Rack filled with Specialty Coffee Demitasse Cups
      ctx.fillStyle = '#d87d4a';
      ctx.fillRect(cx - 18, mBaseY - mH - 10, 36, 2);

      // Colorful Specialty Cups (Terracotta, Turquoise, Pastel Yellow)
      ctx.fillStyle = '#e06d3b';
      ctx.beginPath(); ctx.arc(cx - 14, mBaseY - mH - 12, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#00acc1';
      ctx.beginPath(); ctx.arc(cx - 5, mBaseY - mH - 13, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fbc02d';
      ctx.beginPath(); ctx.arc(cx + 4, mBaseY - mH - 13, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8e24aa';
      ctx.beginPath(); ctx.arc(cx + 13, mBaseY - mH - 12, 3.5, 0, Math.PI * 2); ctx.fill();

      // Rising Animated Coffee Steam
      const steamTime = Date.now() / 250;
      const steamX = cx + Math.sin(steamTime) * 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, mBaseY - mH - 14);
      ctx.lineTo(steamX, mBaseY - mH - 22);
      ctx.stroke();
      break;
    }

    // --- REFRIGERATORS & EQUIPMENT ---
    case 'REFRIGERATOR_SMALL': {
      // High-Definition Realistic Metallic Upright 3D Refrigerator (Buzdolabı)
      const height = 62;
      const topY = cy - height;
      const isSE = (rot === 1 || rot === 'SE');
      const isNW = (rot === 2 || rot === 'NW');
      const isNE = (rot === 3 || rot === 'NE');

      // 1. Ground Soft Ambient Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, 26, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Base Feet / Leveling Pads
      ctx.fillStyle = '#263238';
      ctx.fillRect(cx - 20, cy + 1, 4, 3);
      ctx.fillRect(cx - 2, cy + 10, 4, 3);
      ctx.fillRect(cx + 16, cy + 1, 4, 3);

      // 3. Main 3D Metallic Cabinet Body (Left & Right Isometric Faces)
      // Left Face (cx-22 to cx, topY to cy)
      const gradL = ctx.createLinearGradient(cx - 22, 0, cx, 0);
      gradL.addColorStop(0, '#e0e6ed');
      gradL.addColorStop(0.5, '#cfd8dc');
      gradL.addColorStop(1, '#b0bec5');

      // Right Face (cx to cx+22, topY to cy)
      const gradR = ctx.createLinearGradient(cx, 0, cx + 22, 0);
      gradR.addColorStop(0, '#78909c');
      gradR.addColorStop(0.6, '#607d8b');
      gradR.addColorStop(1, '#455a64');

      if (isSE) {
        // Front doors on Left Face
        ctx.fillStyle = gradL;
        ctx.beginPath();
        ctx.moveTo(cx - 22, topY);
        ctx.lineTo(cx, topY + 11);
        ctx.lineTo(cx, cy + 2);
        ctx.lineTo(cx - 22, cy - 9);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = gradR;
        ctx.beginPath();
        ctx.moveTo(cx, topY + 11);
        ctx.lineTo(cx + 22, topY);
        ctx.lineTo(cx + 22, cy - 9);
        ctx.lineTo(cx, cy + 2);
        ctx.closePath();
        ctx.fill();
      } else if (isNW || isNE) {
        // Back / Side Panels
        ctx.fillStyle = gradR;
        ctx.beginPath();
        ctx.moveTo(cx - 22, topY);
        ctx.lineTo(cx, topY + 11);
        ctx.lineTo(cx, cy + 2);
        ctx.lineTo(cx - 22, cy - 9);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = gradL;
        ctx.beginPath();
        ctx.moveTo(cx, topY + 11);
        ctx.lineTo(cx + 22, topY);
        ctx.lineTo(cx + 22, cy - 9);
        ctx.lineTo(cx, cy + 2);
        ctx.closePath();
        ctx.fill();
      } else {
        // Default (SW): Front doors on Right Face
        const gradSW_L = ctx.createLinearGradient(cx - 22, 0, cx, 0);
        gradSW_L.addColorStop(0, '#78909c');
        gradSW_L.addColorStop(1, '#546e7a');

        const gradSW_R = ctx.createLinearGradient(cx, 0, cx + 22, 0);
        gradSW_R.addColorStop(0, '#eceff1');
        gradSW_R.addColorStop(0.5, '#cfd8dc');
        gradSW_R.addColorStop(1, '#b0bec5');

        ctx.fillStyle = gradSW_L;
        ctx.beginPath();
        ctx.moveTo(cx - 22, topY);
        ctx.lineTo(cx, topY + 11);
        ctx.lineTo(cx, cy + 2);
        ctx.lineTo(cx - 22, cy - 9);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = gradSW_R;
        ctx.beginPath();
        ctx.moveTo(cx, topY + 11);
        ctx.lineTo(cx + 22, topY);
        ctx.lineTo(cx + 22, cy - 9);
        ctx.lineTo(cx, cy + 2);
        ctx.closePath();
        ctx.fill();
      }

      // 4. Roof Top Diamond Slab
      drawIsoDiamond(ctx, cx, topY, 44, 22, '#eceff1', '#b0bec5');

      // Vertical Center Ridge High-Gloss Metallic Highlight
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, topY + 11);
      ctx.lineTo(cx, cy + 2);
      ctx.stroke();

      // 5. Door Details & Compartments
      if (isSE) {
        // FRONT DOORS ARE ON LEFT FACE (Facing SE)
        // A. Top Freezer Door (topY+2 to topY+22)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(cx - 20, topY + 3);
        ctx.lineTo(cx - 2, topY + 12);
        ctx.lineTo(cx - 2, topY + 22);
        ctx.lineTo(cx - 20, topY + 13);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#90a4ae';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // B. Horizontal Gap Line dividing Freezer & Main Fridge
        ctx.strokeStyle = '#37474f';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx - 21, topY + 14);
        ctx.lineTo(cx - 1, topY + 24);
        ctx.stroke();

        // C. Main Refrigerator Door (topY+26 to cy-12)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.moveTo(cx - 20, topY + 16);
        ctx.lineTo(cx - 2, topY + 25);
        ctx.lineTo(cx - 2, cy - 8);
        ctx.lineTo(cx - 20, cy - 17);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#90a4ae';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // D. Sleek Vertical Metallic Door Handles (Freezer & Main)
        // Freezer handle
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 4, topY + 14, 2, 7);
        ctx.fillStyle = '#37474f';
        ctx.fillRect(cx - 3.5, topY + 14.5, 1, 6);

        // Main fridge handle
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 4, topY + 28, 2, 16);
        ctx.fillStyle = '#37474f';
        ctx.fillRect(cx - 3.5, topY + 28.5, 1, 15);

        // E. Digital LED Thermostat Control Panel (3.0°C Display)
        ctx.fillStyle = '#102027';
        ctx.fillRect(cx - 18, topY + 5, 8, 4);
        ctx.fillStyle = '#00e676'; // Glowing Cyan/Green LED
        ctx.font = 'bold 3.5px monospace';
        ctx.fillText('3.0°C', cx - 14, topY + 8);

        // F. Bottom Compressor Ventilation Louvers
        ctx.fillStyle = '#37474f';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(cx - 19, cy - 14 + (i * 2.5), 16, 1);
        }

      } else if (!isNW && !isNE) {
        // DEFAULT (SW): FRONT DOORS ARE ON RIGHT FACE (Facing SW)
        // A. Top Freezer Door
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(cx + 2, topY + 12);
        ctx.lineTo(cx + 20, topY + 3);
        ctx.lineTo(cx + 20, topY + 13);
        ctx.lineTo(cx + 2, topY + 22);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#90a4ae';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // B. Horizontal Gap Line dividing Freezer & Main Fridge
        ctx.strokeStyle = '#37474f';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx + 1, topY + 24);
        ctx.lineTo(cx + 21, topY + 14);
        ctx.stroke();

        // C. Main Refrigerator Door
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.moveTo(cx + 2, topY + 25);
        ctx.lineTo(cx + 20, topY + 16);
        ctx.lineTo(cx + 20, cy - 17);
        ctx.lineTo(cx + 2, cy - 8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#90a4ae';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // D. Sleek Vertical Metallic Door Handles
        // Freezer handle
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 2, topY + 14, 2, 7);
        ctx.fillStyle = '#37474f';
        ctx.fillRect(cx + 2.5, topY + 14.5, 1, 6);

        // Main fridge handle
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 2, topY + 28, 2, 16);
        ctx.fillStyle = '#37474f';
        ctx.fillRect(cx + 2.5, topY + 28.5, 1, 15);

        // E. Digital LED Thermostat Control Panel
        ctx.fillStyle = '#102027';
        ctx.fillRect(cx + 10, topY + 5, 8, 4);
        ctx.fillStyle = '#00e676';
        ctx.font = 'bold 3.5px monospace';
        ctx.fillText('3.0°C', cx + 14, topY + 8);

        // F. Bottom Ventilation Louvers
        ctx.fillStyle = '#37474f';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(cx + 3, cy - 14 + (i * 2.5), 16, 1);
        }
      }

      break;
    }

    case 'REFRIGERATOR_STAINLESS': {
      // Commercial Double-Door Display Beverage Merchandiser Fridge
      const topY = cy - 56;
      const isSE = (rot === 1 || rot === 'SE');

      // 1. Heavy Cast-Iron & Steel Base Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 5, 30, 13, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Main Commercial Cabinet Frame (Floor cy to topY)
      if (isSE) {
        // Front-Left Face is the FRONT DISPLAY FACE (facing SE into room!)
        const gFrgL = ctx.createLinearGradient(cx - 28, 0, cx, 0);
        gFrgL.addColorStop(0, '#1c272c');
        gFrgL.addColorStop(1, '#10171a');
        ctx.fillStyle = gFrgL;
        ctx.beginPath();
        ctx.moveTo(cx - 28, topY);
        ctx.lineTo(cx, topY + 14);
        ctx.lineTo(cx, cy + 2);
        ctx.lineTo(cx - 28, cy - 12);
        ctx.closePath();
        ctx.fill();

        // Front-Right Face (Side Panel facing SW)
        const gFrgR = ctx.createLinearGradient(cx, 0, cx + 28, 0);
        gFrgR.addColorStop(0, '#263238');
        gFrgR.addColorStop(1, '#37474f');
        ctx.fillStyle = gFrgR;
        ctx.beginPath();
        ctx.moveTo(cx, topY + 14);
        ctx.lineTo(cx + 28, topY);
        ctx.lineTo(cx + 28, cy - 12);
        ctx.lineTo(cx, cy + 2);
        ctx.closePath();
        ctx.fill();

        // Top Roof Slab Surface
        drawIsoDiamond(ctx, cx, topY, 56, 28, '#455a64', '#1c272c');

        // Top Illuminated Header Canopy Signboard (*COLD BEVERAGES*) on Left Face
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#81d4fa';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(cx - 26, topY + 1);
        ctx.lineTo(cx - 2, topY + 12);
        ctx.lineTo(cx - 2, topY + 6);
        ctx.lineTo(cx - 26, topY - 5);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#0277bd';
        ctx.font = 'bold 5px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('COLD BEVERAGES', cx - 14, topY + 5);

        // Double Glass Display Doors on Left Face (Cool Cyan Glow)
        const glassGlow = ctx.createLinearGradient(cx - 26, 0, cx - 2, 0);
        glassGlow.addColorStop(0, 'rgba(3, 169, 244, 0.85)');
        glassGlow.addColorStop(0.5, 'rgba(129, 212, 250, 0.95)');
        glassGlow.addColorStop(1, 'rgba(3, 169, 244, 0.85)');

        // Left Glass Door
        ctx.fillStyle = glassGlow;
        ctx.beginPath();
        ctx.moveTo(cx - 25, topY + 8);
        ctx.lineTo(cx - 14, topY + 14);
        ctx.lineTo(cx - 14, cy - 5);
        ctx.lineTo(cx - 25, cy - 11);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#eceff1'; ctx.lineWidth = 1; ctx.stroke();

        // Right Glass Door
        ctx.fillStyle = glassGlow;
        ctx.beginPath();
        ctx.moveTo(cx - 12, topY + 15);
        ctx.lineTo(cx - 2, topY + 20);
        ctx.lineTo(cx - 2, cy);
        ctx.lineTo(cx - 12, cy - 5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#eceff1'; ctx.lineWidth = 1; ctx.stroke();

        // Stocked Beverage Shelves inside Glass Doors
        ctx.fillStyle = '#212121';
        ctx.fillRect(cx - 21, topY + 14, 2, 4);
        ctx.fillRect(cx - 18, topY + 16, 2, 4);
        ctx.fillRect(cx - 9, topY + 20, 2, 4);
        ctx.fillRect(cx - 6, topY + 22, 2, 4);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 22, topY + 22, 3, 5);
        ctx.fillRect(cx - 18, topY + 24, 3, 5);
        ctx.fillRect(cx - 10, topY + 28, 3, 5);
        ctx.fillRect(cx - 6, topY + 30, 3, 5);
        ctx.fillStyle = '#1565c0';
        ctx.fillRect(cx - 22, topY + 22, 3, 2);
        ctx.fillRect(cx - 10, topY + 28, 3, 2);

        ctx.fillStyle = '#4caf50';
        ctx.fillRect(cx - 21, topY + 32, 2, 5);
        ctx.fillRect(cx - 18, topY + 34, 2, 5);
        ctx.fillStyle = '#e53935';
        ctx.fillRect(cx - 9, topY + 38, 2, 5);
        ctx.fillRect(cx - 6, topY + 40, 2, 5);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 15, topY + 15, 1.8, 30);
        ctx.fillRect(cx - 12, topY + 17, 1.8, 30);

        ctx.fillStyle = '#00e676';
        ctx.fillRect(cx - 17, cy - 3, 6, 2.5);

      } else {
        // Default: Front-Right Face is the FRONT DISPLAY FACE (facing SW into room!)
        const gFrgL = ctx.createLinearGradient(cx - 28, 0, cx, 0);
        gFrgL.addColorStop(0, '#263238');
        gFrgL.addColorStop(1, '#37474f');
        ctx.fillStyle = gFrgL;
        ctx.beginPath();
        ctx.moveTo(cx - 28, topY);
        ctx.lineTo(cx, topY + 14);
        ctx.lineTo(cx, cy + 2);
        ctx.lineTo(cx - 28, cy - 12);
        ctx.closePath();
        ctx.fill();

        const gFrgR = ctx.createLinearGradient(cx, 0, cx + 28, 0);
        gFrgR.addColorStop(0, '#1c272c');
        gFrgR.addColorStop(1, '#10171a');
        ctx.fillStyle = gFrgR;
        ctx.beginPath();
        ctx.moveTo(cx, topY + 14);
        ctx.lineTo(cx + 28, topY);
        ctx.lineTo(cx + 28, cy - 12);
        ctx.lineTo(cx, cy + 2);
        ctx.closePath();
        ctx.fill();

        drawIsoDiamond(ctx, cx, topY, 56, 28, '#455a64', '#1c272c');

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#81d4fa';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(cx + 2, topY + 12);
        ctx.lineTo(cx + 26, topY + 1);
        ctx.lineTo(cx + 26, topY - 5);
        ctx.lineTo(cx + 2, topY + 6);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#0277bd';
        ctx.font = 'bold 5px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('COLD BEVERAGES', cx + 14, topY + 5);

        const glassGlow = ctx.createLinearGradient(cx + 2, 0, cx + 26, 0);
        glassGlow.addColorStop(0, 'rgba(3, 169, 244, 0.85)');
        glassGlow.addColorStop(0.5, 'rgba(129, 212, 250, 0.95)');
        glassGlow.addColorStop(1, 'rgba(3, 169, 244, 0.85)');

        ctx.fillStyle = glassGlow;
        ctx.beginPath();
        ctx.moveTo(cx + 2, topY + 20);
        ctx.lineTo(cx + 12, topY + 15);
        ctx.lineTo(cx + 12, cy - 5);
        ctx.lineTo(cx + 2, cy);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#eceff1'; ctx.lineWidth = 1; ctx.stroke();

        ctx.fillStyle = glassGlow;
        ctx.beginPath();
        ctx.moveTo(cx + 14, topY + 14);
        ctx.lineTo(cx + 25, topY + 8);
        ctx.lineTo(cx + 25, cy - 11);
        ctx.lineTo(cx + 14, cy - 5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#eceff1'; ctx.lineWidth = 1; ctx.stroke();

        ctx.fillStyle = '#212121';
        ctx.fillRect(cx + 4, topY + 22, 2, 4);
        ctx.fillRect(cx + 7, topY + 20, 2, 4);
        ctx.fillRect(cx + 16, topY + 16, 2, 4);
        ctx.fillRect(cx + 19, topY + 14, 2, 4);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 4, topY + 30, 3, 5);
        ctx.fillRect(cx + 8, topY + 28, 3, 5);
        ctx.fillRect(cx + 16, topY + 24, 3, 5);
        ctx.fillRect(cx + 20, topY + 22, 3, 5);
        ctx.fillStyle = '#1565c0';
        ctx.fillRect(cx + 4, topY + 30, 3, 2);
        ctx.fillRect(cx + 16, topY + 24, 3, 2);

        ctx.fillStyle = '#4caf50';
        ctx.fillRect(cx + 4, topY + 40, 2, 5);
        ctx.fillRect(cx + 7, topY + 38, 2, 5);
        ctx.fillStyle = '#e53935';
        ctx.fillRect(cx + 16, topY + 34, 2, 5);
        ctx.fillRect(cx + 19, topY + 32, 2, 5);

        ctx.fillStyle = '#ffd54f';
        ctx.fillRect(cx + 4, topY + 40, 2, 1);
        ctx.fillRect(cx + 16, topY + 34, 2, 1);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + 11, topY + 17, 1.8, 30);
        ctx.fillRect(cx + 14, topY + 15, 1.8, 30);

        ctx.fillStyle = '#00e676';
        ctx.fillRect(cx + 11, cy - 3, 6, 2.5);
      }
      break;
    }

    case 'GRINDER_BASIC': {
      // Grinder Stand Platform
      const topY = cy - 24;

      // Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 2, 16, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wooden Stand Base
      ctx.fillStyle = '#4e342e';
      ctx.beginPath();
      ctx.moveTo(cx - 14, topY);
      ctx.lineTo(cx, topY + 7);
      ctx.lineTo(cx, cy + 1);
      ctx.lineTo(cx - 14, cy - 6);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#3e2723';
      ctx.beginPath();
      ctx.moveTo(cx, topY + 7);
      ctx.lineTo(cx + 14, topY);
      ctx.lineTo(cx + 14, cy - 6);
      ctx.lineTo(cx, cy + 1);
      ctx.closePath();
      ctx.fill();

      // Top Slab
      drawIsoDiamond(ctx, cx, topY, 28, 14, '#6d4c41', '#3e2723');

      // Grinder Body on top of Stand
      const baseY = topY - 2;

      // Hopper Cone
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.moveTo(cx - 6, baseY - 22);
      ctx.lineTo(cx + 6, baseY - 22);
      ctx.lineTo(cx + 3, baseY - 12);
      ctx.lineTo(cx - 3, baseY - 12);
      ctx.closePath();
      ctx.fill();

      // Beans inside hopper
      ctx.fillStyle = '#3e2723';
      ctx.beginPath();
      ctx.arc(cx, baseY - 17, 3, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = '#212121';
      ctx.fillRect(cx - 5, baseY - 12, 10, 12);
      break;
    }

    // --- DECORATIONS ---
    case 'PLANT_MONSTERA': {
      // Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 5, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Terracotta Pot Base
      const potTopY = cy - 12;
      const potBotY = cy + 4;
      
      // Pot Gradient Body
      const potGrad = ctx.createLinearGradient(cx - 10, 0, cx + 10, 0);
      potGrad.addColorStop(0, '#e07a48');
      potGrad.addColorStop(0.5, '#c85e28');
      potGrad.addColorStop(1, '#933e14');

      ctx.fillStyle = potGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 11, potTopY);
      ctx.lineTo(cx + 11, potTopY);
      ctx.lineTo(cx + 7.5, potBotY);
      ctx.lineTo(cx - 7.5, potBotY);
      ctx.closePath();
      ctx.fill();

      // Pot Rim Lip
      ctx.fillStyle = '#d66835';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(cx - 12, potTopY - 4, 24, 5, 2);
      } else {
        ctx.rect(cx - 12, potTopY - 4, 24, 5);
      }
      ctx.fill();

      // Pot Soil Surface
      ctx.fillStyle = '#2e1c14';
      ctx.beginPath();
      ctx.ellipse(cx, potTopY - 3, 10, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stems (Curved natural stems reaching up)
      ctx.strokeStyle = '#2d5a27';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';

      const stems = [
        { sx: cx - 2, sy: potTopY - 3, ex: cx - 18, ey: cy - 28, cpx: cx - 12, cpy: cy - 15 },
        { sx: cx + 1, sy: potTopY - 3, ex: cx + 18, ey: cy - 26, cpx: cx + 14, cpy: cy - 14 },
        { sx: cx, sy: potTopY - 3, ex: cx - 8, ey: cy - 42, cpx: cx - 6, cpy: cy - 25 },
        { sx: cx, sy: potTopY - 3, ex: cx + 10, ey: cy - 44, cpx: cx + 7, cpy: cy - 28 },
        { sx: cx, sy: potTopY - 3, ex: cx, ey: cy - 50, cpx: cx - 2, cpy: cy - 30 }
      ];

      stems.forEach(s => {
        ctx.beginPath();
        ctx.moveTo(s.sx, s.sy);
        ctx.quadraticCurveTo(s.cpx, s.cpy, s.ex, s.ey);
        ctx.stroke();
      });

      // Helper function to draw realistic Monstera Leaf with slits/fenestrations
      const drawMonsteraLeaf = (lx, ly, rx, ry, angle, darkColor, mainColor, highlightColor) => {
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(angle);

        // Leaf Shadow / Dark Underlayer
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main Leaf Body
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.ellipse(0, -1, rx - 1, ry - 1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Highlights on Leaf Top
        ctx.fillStyle = highlightColor;
        ctx.beginPath();
        ctx.ellipse(-rx * 0.2, -ry * 0.2, rx * 0.5, ry * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Central Vein
        ctx.strokeStyle = '#a3e08b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, ry * 0.8);
        ctx.lineTo(0, -ry * 0.85);
        ctx.stroke();

        // Side Veins
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = 'rgba(163, 224, 139, 0.6)';
        for (let i = -2; i <= 2; i++) {
          if (i === 0) continue;
          const vy = i * (ry * 0.25);
          ctx.beginPath();
          ctx.moveTo(0, vy);
          ctx.lineTo(i > 0 ? rx * 0.6 : -rx * 0.6, vy - 3);
          ctx.stroke();
        }

        // Leaf Slits / Cuts (Fenestrations)
        ctx.fillStyle = darkColor;
        [-0.5, 0.5].forEach(side => {
          [0.2, 0.5, 0.7].forEach(pos => {
            ctx.beginPath();
            ctx.ellipse(side * rx * pos, -ry * 0.15 + (pos * 4), 1.2, 3.5, side * 0.4, 0, Math.PI * 2);
            ctx.fill();
          });
        });

        ctx.restore();
      };

      // Back / Lower Leaves
      drawMonsteraLeaf(cx - 18, cy - 28, 13, 10, -Math.PI / 4, '#1b4d1b', '#267326', '#3db83d');
      drawMonsteraLeaf(cx + 18, cy - 26, 14, 11, Math.PI / 4, '#143d14', '#216321', '#37a337');
      drawMonsteraLeaf(cx - 8, cy - 42, 16, 12, -Math.PI / 8, '#1d541d', '#2d822d', '#48c248');

      // Front / Top Lush Leaves
      drawMonsteraLeaf(cx + 10, cy - 44, 17, 13, Math.PI / 6, '#236623', '#349934', '#52d952');
      drawMonsteraLeaf(cx - 1, cy - 50, 18, 14, -0.05, '#287528', '#3cb03c', '#60ea60');

      break;
    }

    case 'PLANT_FICUS': {
      // Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.20)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 6, 15, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wooden Legs (Tripod Stand)
      ctx.strokeStyle = '#6d4c41';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';

      // Left leg
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy - 6);
      ctx.lineTo(cx - 10, cy + 5);
      ctx.stroke();

      // Right leg
      ctx.beginPath();
      ctx.moveTo(cx + 6, cy - 6);
      ctx.lineTo(cx + 10, cy + 5);
      ctx.stroke();

      // Center Back leg
      ctx.beginPath();
      ctx.moveTo(cx, cy - 6);
      ctx.lineTo(cx, cy + 3);
      ctx.stroke();

      // Modern White Ceramic Cylinder Pot
      const potTopY = cy - 26;

      // Pot Gradient
      const potGrad = ctx.createLinearGradient(cx - 9, 0, cx + 9, 0);
      potGrad.addColorStop(0, '#ffffff');
      potGrad.addColorStop(0.5, '#e0e0e0');
      potGrad.addColorStop(1, '#9e9e9e');

      ctx.fillStyle = potGrad;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(cx - 9, potTopY, 18, 20, 3);
      } else {
        ctx.rect(cx - 9, potTopY, 18, 20);
      }
      ctx.fill();

      // Gold Brass Middle Ring Accent
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(cx - 9, cy - 17, 18, 3);

      // Dark Soil
      ctx.fillStyle = '#3e2723';
      ctx.beginPath();
      ctx.ellipse(cx, potTopY, 8.5, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Organic Curved Wooden Trunk & Branches
      ctx.strokeStyle = '#4e342e';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(cx, potTopY);
      ctx.quadraticCurveTo(cx + 4, cy - 45, cx - 2, cy - 70);
      ctx.stroke();

      // Side branches
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + 2, cy - 42);
      ctx.lineTo(cx + 12, cy - 48);
      ctx.moveTo(cx, cy - 54);
      ctx.lineTo(cx - 11, cy - 60);
      ctx.stroke();

      // Helper for Ficus Lyrata Violin-shaped Leaf
      const drawFicusLeaf = (lx, ly, width, height, angle, darkColor, mainColor, veinColor) => {
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(angle);

        // Leaf outline (Violin/Fiddle shape)
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.moveTo(0, height * 0.5);
        ctx.bezierCurveTo(-width * 0.3, height * 0.3, -width * 0.2, 0, -width * 0.5, -height * 0.2);
        ctx.bezierCurveTo(-width * 0.5, -height * 0.45, 0, -height * 0.55, 0, -height * 0.5);
        ctx.bezierCurveTo(0, -height * 0.55, width * 0.5, -height * 0.45, width * 0.5, -height * 0.2);
        ctx.bezierCurveTo(width * 0.2, 0, width * 0.3, height * 0.3, 0, height * 0.5);
        ctx.fill();

        // Inner Leaf Body
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.moveTo(0, height * 0.45);
        ctx.bezierCurveTo(-width * 0.27, height * 0.27, -width * 0.18, 0, -width * 0.45, -height * 0.18);
        ctx.bezierCurveTo(-width * 0.45, -height * 0.4, 0, -height * 0.5, 0, -height * 0.45);
        ctx.bezierCurveTo(0, -height * 0.5, width * 0.45, -height * 0.4, width * 0.45, -height * 0.18);
        ctx.bezierCurveTo(width * 0.18, 0, width * 0.27, height * 0.27, 0, height * 0.45);
        ctx.fill();

        // Glossy Top Reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.ellipse(0, -height * 0.2, width * 0.25, height * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Prominent Central Vein
        ctx.strokeStyle = veinColor;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, height * 0.45);
        ctx.lineTo(0, -height * 0.45);
        ctx.stroke();

        ctx.restore();
      };

      // Layered Ficus Leaves along tree height
      drawFicusLeaf(cx + 12, cy - 35, 14, 18, Math.PI / 3, '#0b2e0d', '#174a1a', '#81c784');
      drawFicusLeaf(cx - 10, cy - 38, 15, 19, -Math.PI / 3, '#0e3810', '#1a521e', '#81c784');
      drawFicusLeaf(cx + 14, cy - 48, 16, 21, Math.PI / 4, '#124215', '#226926', '#a5d6a7');
      drawFicusLeaf(cx - 13, cy - 52, 17, 22, -Math.PI / 4, '#144717', '#25732a', '#a5d6a7');
      drawFicusLeaf(cx + 10, cy - 60, 16, 20, Math.PI / 6, '#18541c', '#2c8531', '#a5d6a7');

      // Top Young Glossy Leaves
      drawFicusLeaf(cx - 8, cy - 65, 15, 19, -Math.PI / 6, '#1e6623', '#339e39', '#c8e6c9');
      drawFicusLeaf(cx + 4, cy - 72, 14, 18, 0.1, '#247a2a', '#3cb543', '#c8e6c9');
      drawFicusLeaf(cx - 2, cy - 76, 12, 16, -0.05, '#2e9935', '#4bc452', '#e8f5e9');

      break;
    }

    case 'LAMP_VINTAGE': {
      // Industrial Mid-Century Arc Floor Lamp with Amber Edison Glass Shade & Warm Floor Light Pool
      // 1. Warm Glowing Ambient Light Pool cast ON THE FLOOR TILE GRID
      const lightGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 48);
      lightGrad.addColorStop(0, 'rgba(255, 213, 79, 0.40)');
      lightGrad.addColorStop(0.4, 'rgba(255, 180, 50, 0.20)');
      lightGrad.addColorStop(0.8, 'rgba(255, 160, 0, 0.06)');
      lightGrad.addColorStop(1, 'rgba(255, 160, 0, 0)');
      ctx.fillStyle = lightGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 48, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Heavy Cast-Iron & Brass Floor Base Plate (resting flat on floor cy)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(cx + 8, cy + 2, 14, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Base Disk
      const baseGrad = ctx.createLinearGradient(cx, 0, cx + 16, 0);
      baseGrad.addColorStop(0, '#d4af37');
      baseGrad.addColorStop(0.5, '#ffd54f');
      baseGrad.addColorStop(1, '#b58f38');
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.ellipse(cx + 8, cy, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3. Graceful Arching Tubular Brass Stem
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx + 8, cy);
      ctx.quadraticCurveTo(cx + 18, cy - 35, cx + 4, cy - 62);
      ctx.quadraticCurveTo(cx - 8, cy - 72, cx - 14, cy - 58);
      ctx.stroke();

      // Brass Fixture Hood Ring
      ctx.fillStyle = '#b58f38';
      ctx.fillRect(cx - 17, cy - 58, 6, 3);

      // 4. Amber Tinted Hand-Blown Glass Bell Shade
      const shadeY = cy - 54;
      const shadeGrad = ctx.createLinearGradient(cx - 20, 0, cx - 8, 0);
      shadeGrad.addColorStop(0, 'rgba(255, 224, 130, 0.95)');
      shadeGrad.addColorStop(0.5, 'rgba(255, 179, 0, 0.9)');
      shadeGrad.addColorStop(1, 'rgba(255, 111, 0, 0.85)');

      ctx.fillStyle = shadeGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 14, shadeY - 4);
      ctx.bezierCurveTo(cx - 22, shadeY, cx - 22, shadeY + 12, cx - 14, shadeY + 14);
      ctx.bezierCurveTo(cx - 6, shadeY + 12, cx - 6, shadeY, cx - 14, shadeY - 4);
      ctx.closePath();
      ctx.fill();

      // 5. Glowing Edison Filament Bulb inside Amber Glass
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#fff59d';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(cx - 14, shadeY + 5, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Orange Spiral Filament Loop
      ctx.strokeStyle = '#ff3d00';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(cx - 14, shadeY + 4, 1.8, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'BOOKSHELF': {
      // Luxury Mid-Century Modern Walnut & Brass 3D Library Bookshelf
      const topY = cy - 52;

      // 1. Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.30)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, 26, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Solid 3D Cabinet Stand Base (Floor level cy to topY)
      // Front Left Outer Frame (Walnut Wood)
      const gWnL = ctx.createLinearGradient(cx - 24, 0, cx, 0);
      gWnL.addColorStop(0, '#3e2723');
      gWnL.addColorStop(1, '#4e342e');
      ctx.fillStyle = gWnL;
      ctx.beginPath();
      ctx.moveTo(cx - 24, topY);
      ctx.lineTo(cx, topY + 12);
      ctx.lineTo(cx, cy + 2);
      ctx.lineTo(cx - 24, cy - 10);
      ctx.closePath();
      ctx.fill();

      // Front Right Outer Frame (Dark Walnut Shadow)
      const gWnR = ctx.createLinearGradient(cx, 0, cx + 24, 0);
      gWnR.addColorStop(0, '#2d1d17');
      gWnR.addColorStop(1, '#1b100c');
      ctx.fillStyle = gWnR;
      ctx.beginPath();
      ctx.moveTo(cx, topY + 12);
      ctx.lineTo(cx + 24, topY);
      ctx.lineTo(cx + 24, cy - 10);
      ctx.lineTo(cx, cy + 2);
      ctx.closePath();
      ctx.fill();

      // Top Slab Surface of Bookshelf
      drawIsoDiamond(ctx, cx, topY, 48, 24, '#5d4037', '#3e2723');

      // Interior Dark Recessed Cavity Face
      ctx.fillStyle = '#1a0f0a';
      ctx.beginPath();
      ctx.moveTo(cx - 21, topY + 3);
      ctx.lineTo(cx + 21, topY + 3);
      ctx.lineTo(cx + 21, cy - 2);
      ctx.lineTo(cx - 21, cy - 2);
      ctx.closePath();
      ctx.fill();

      // 3. 3 Isometric Shelves with Inner Shadows
      const shelfY1 = topY + 16;
      const shelfY2 = topY + 31;
      const shelfY3 = topY + 46;

      ctx.fillStyle = '#6d4c41';
      ctx.fillRect(cx - 21, shelfY1, 42, 3);
      ctx.fillRect(cx - 21, shelfY2, 42, 3);
      ctx.fillRect(cx - 21, shelfY3, 42, 3);

      ctx.fillStyle = '#3e2723';
      ctx.fillRect(cx - 21, shelfY1 + 3, 42, 1);
      ctx.fillRect(cx - 21, shelfY2 + 3, 42, 1);
      ctx.fillRect(cx - 21, shelfY3 + 3, 42, 1);

      // 4. Richly Detailed 3D Shelf Contents
      // TOP SHELF (shelfY1): Small Ceramic Succulent Pot & Golden Globe
      // Ceramic Pot
      ctx.fillStyle = '#eceff1';
      ctx.fillRect(cx - 16, shelfY1 - 8, 6, 8);
      ctx.fillStyle = '#4caf50';
      ctx.beginPath(); ctx.arc(cx - 13, shelfY1 - 9, 4, 0, Math.PI * 2); ctx.fill();

      // Golden Globe
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath(); ctx.arc(cx + 12, shelfY1 - 7, 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx + 12, shelfY1 - 7, 5.5, -Math.PI / 3, Math.PI / 3); ctx.stroke();

      // MIDDLE SHELF (shelfY2): Standing Hardcover Novels with Gold Spine Accents
      const bookColors = ['#b71c1c', '#1a237e', '#1b5e20', '#4a148c', '#e65100', '#004d40', '#3e2723'];
      bookColors.forEach((color, idx) => {
        const bx = cx - 18 + idx * 5;
        const bh = 10 + (idx % 3);
        ctx.fillStyle = color;
        ctx.fillRect(bx, shelfY2 - bh, 4, bh);

        // Gold Foil Spine Line
        ctx.fillStyle = '#ffd54f';
        ctx.fillRect(bx + 1, shelfY2 - bh + 2, 2, 1.2);
      });

      // Brass Bookend holding the books
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.moveTo(cx + 17, shelfY2);
      ctx.lineTo(cx + 17, shelfY2 - 8);
      ctx.lineTo(cx + 20, shelfY2);
      ctx.closePath();
      ctx.fill();

      // BOTTOM SHELF (shelfY3): Horizontal Coffee Table Art Book Stack & Rolled Scroll
      // Stacked Books
      ctx.fillStyle = '#303f9f'; ctx.fillRect(cx - 18, shelfY3 - 3, 14, 3);
      ctx.fillStyle = '#c2185b'; ctx.fillRect(cx - 17, shelfY3 - 6, 12, 3);
      ctx.fillStyle = '#fbc02d'; ctx.fillRect(cx - 16, shelfY3 - 9, 10, 3);

      // Mini Espresso Cup resting on top of book stack!
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx - 11, shelfY3 - 11, 2, 0, Math.PI * 2); ctx.fill();

      // Rolled Parchment Manuscript Scroll
      ctx.fillStyle = '#fff8e1';
      ctx.fillRect(cx + 4, shelfY3 - 4, 12, 4);
      ctx.fillStyle = '#d7ccc8';
      ctx.beginPath(); ctx.arc(cx + 16, shelfY3 - 2, 2, 0, Math.PI * 2); ctx.fill();
      break;
    }

    case 'WIFI_STATION': {
      // Modern High-Tech 5G Wi-Fi Station on Sleek Aluminum & Glass Pedestal Stand
      const topY = cy - 24;

      // 1. Ground Soft Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.26)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 3, 20, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Pedestal Stand Cabinet Base (Floor level cy to topY)
      // Front Left Face (Matte Gunmetal Aluminum)
      const gLeft = ctx.createLinearGradient(cx - 20, 0, cx, 0);
      gLeft.addColorStop(0, '#263238');
      gLeft.addColorStop(1, '#37474f');
      ctx.fillStyle = gLeft;
      ctx.beginPath();
      ctx.moveTo(cx - 20, topY);
      ctx.lineTo(cx, topY + 10);
      ctx.lineTo(cx, cy + 2);
      ctx.lineTo(cx - 20, cy - 8);
      ctx.closePath();
      ctx.fill();

      // Front Right Face (Darker Aluminum Shadow Face)
      const gRight = ctx.createLinearGradient(cx, 0, cx + 20, 0);
      gRight.addColorStop(0, '#1c272c');
      gRight.addColorStop(1, '#10171a');
      ctx.fillStyle = gRight;
      ctx.beginPath();
      ctx.moveTo(cx, topY + 10);
      ctx.lineTo(cx + 20, topY);
      ctx.lineTo(cx + 20, cy - 8);
      ctx.lineTo(cx, cy + 2);
      ctx.closePath();
      ctx.fill();

      // Electric Blue LED Strip along Pedestal Front Seam
      ctx.fillStyle = '#00e5ff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 4;
      ctx.fillRect(cx - 1, topY + 1, 2, 9);
      ctx.shadowBlur = 0;

      // Glass Top Slab with Metallic Edge Rim
      drawIsoDiamond(ctx, cx, topY, 40, 20, '#eceff1', '#78909c');

      // 3. 3D Tri-Band Router Unit resting ON TOP of the Pedestal (at rBaseY = topY - 2)
      const rBaseY = topY - 2;

      // Router Rubber Feet
      ctx.fillStyle = '#121212';
      ctx.fillRect(cx - 12, rBaseY, 3, 2);
      ctx.fillRect(cx + 9, rBaseY, 3, 2);

      // Router Main 3D Box Body (Isometric Block)
      const boxW = 22;
      const boxH = 9;

      // Top Face of Router
      const gRouterTop = ctx.createLinearGradient(cx - boxW / 2, 0, cx + boxW / 2, 0);
      gRouterTop.addColorStop(0, '#37474f');
      gRouterTop.addColorStop(0.5, '#455a64');
      gRouterTop.addColorStop(1, '#263238');
      ctx.fillStyle = gRouterTop;
      ctx.beginPath();
      ctx.moveTo(cx, rBaseY - boxH - 5);
      ctx.lineTo(cx + boxW / 2, rBaseY - boxH);
      ctx.lineTo(cx, rBaseY - boxH + 5);
      ctx.lineTo(cx - boxW / 2, rBaseY - boxH);
      ctx.closePath();
      ctx.fill();

      // Front Left Face of Router Body
      ctx.fillStyle = '#263238';
      ctx.beginPath();
      ctx.moveTo(cx - boxW / 2, rBaseY - boxH);
      ctx.lineTo(cx, rBaseY - boxH + 5);
      ctx.lineTo(cx, rBaseY + 1);
      ctx.lineTo(cx - boxW / 2, rBaseY - 4);
      ctx.closePath();
      ctx.fill();

      // Front Right Face of Router Body
      ctx.fillStyle = '#1c272c';
      ctx.beginPath();
      ctx.moveTo(cx, rBaseY - boxH + 5);
      ctx.lineTo(cx + boxW / 2, rBaseY - boxH);
      ctx.lineTo(cx + boxW / 2, rBaseY - 4);
      ctx.lineTo(cx, rBaseY + 1);
      ctx.closePath();
      ctx.fill();

      // 4. High-Gain Antennas (3 3D Antennas)
      const antColor = '#cfd8dc';
      ctx.strokeStyle = antColor;
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';

      // Left Antenna
      ctx.beginPath();
      ctx.moveTo(cx - 8, rBaseY - boxH - 2);
      ctx.lineTo(cx - 12, rBaseY - boxH - 18);
      ctx.stroke();

      // Middle Antenna
      ctx.beginPath();
      ctx.moveTo(cx, rBaseY - boxH - 3);
      ctx.lineTo(cx, rBaseY - boxH - 22);
      ctx.stroke();

      // Right Antenna
      ctx.beginPath();
      ctx.moveTo(cx + 8, rBaseY - boxH - 2);
      ctx.lineTo(cx + 12, rBaseY - boxH - 18);
      ctx.stroke();

      // Gold Antenna Base Rings
      ctx.fillStyle = '#ffd54f';
      ctx.fillRect(cx - 9.5, rBaseY - boxH - 4, 3, 2);
      ctx.fillRect(cx - 1.5, rBaseY - boxH - 5, 3, 2);
      ctx.fillRect(cx + 6.5, rBaseY - boxH - 4, 3, 2);

      // 5. Front Panel Status Indicator LEDs
      // Power (Green)
      ctx.fillStyle = '#00e676';
      ctx.beginPath(); ctx.arc(cx - 6, rBaseY - 1, 1.3, 0, Math.PI * 2); ctx.fill();
      // Internet (Cyan)
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath(); ctx.arc(cx - 2, rBaseY - 0.2, 1.3, 0, Math.PI * 2); ctx.fill();
      // 5G Wi-Fi (Electric Blue)
      ctx.fillStyle = '#29b6f6';
      ctx.beginPath(); ctx.arc(cx + 2, rBaseY - 0.2, 1.3, 0, Math.PI * 2); ctx.fill();
      // LAN Activity (Yellow)
      ctx.fillStyle = '#ffea00';
      ctx.beginPath(); ctx.arc(cx + 6, rBaseY - 1, 1.3, 0, Math.PI * 2); ctx.fill();

      // 6. Holographic Glowing Wi-Fi Signal Arcs above Antennas
      const signalY = rBaseY - boxH - 23;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.85)';
      ctx.lineWidth = 1.8;

      ctx.beginPath();
      ctx.arc(cx, signalY, 5, Math.PI * 1.25, Math.PI * 1.75);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(41, 182, 246, 0.65)';
      ctx.beginPath();
      ctx.arc(cx, signalY, 10, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(cx, signalY, 15, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 7. Mini "FREE WI-FI 5G" Acrylic Stand Card on top of Pedestal next to Router
      const cardX = cx + 9;
      const cardY = rBaseY - 2;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(cardX, cardY - 10, 10, 8, 1);
      } else {
        ctx.rect(cardX, cardY - 10, 10, 8);
      }
      ctx.fill();

      ctx.fillStyle = '#0277bd';
      ctx.font = 'bold 5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Wi-Fi', cardX + 5, cardY - 4);
      break;
    }

    case 'SPEAKER': {
      // Vintage Marshall Acton/Stanmore Speaker on Luxury Dark Walnut Pedestal Cabinet
      const topY = cy - 24;

      // 1. Ground Soft Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 3, 22, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Pedestal Stand Cabinet Base (Floor level cy to topY)
      // Front Left Face (Warm Dark Walnut Wood)
      const gWalnutL = ctx.createLinearGradient(cx - 22, 0, cx, 0);
      gWalnutL.addColorStop(0, '#4e342e');
      gWalnutL.addColorStop(1, '#5d4037');
      ctx.fillStyle = gWalnutL;
      ctx.beginPath();
      ctx.moveTo(cx - 22, topY);
      ctx.lineTo(cx, topY + 11);
      ctx.lineTo(cx, cy + 2);
      ctx.lineTo(cx - 22, cy - 9);
      ctx.closePath();
      ctx.fill();

      // Front Right Face (Darker Walnut Shadow)
      const gWalnutR = ctx.createLinearGradient(cx, 0, cx + 22, 0);
      gWalnutR.addColorStop(0, '#3e2723');
      gWalnutR.addColorStop(1, '#2c1d18');
      ctx.fillStyle = gWalnutR;
      ctx.beginPath();
      ctx.moveTo(cx, topY + 11);
      ctx.lineTo(cx + 22, topY);
      ctx.lineTo(cx + 22, cy - 9);
      ctx.lineTo(cx, cy + 2);
      ctx.closePath();
      ctx.fill();

      // Brass Strip Accent along Pedestal Trim
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.moveTo(cx - 22, topY + 4);
      ctx.lineTo(cx, topY + 15);
      ctx.lineTo(cx + 22, topY + 4);
      ctx.lineTo(cx + 22, topY + 2);
      ctx.lineTo(cx, topY + 13);
      ctx.lineTo(cx - 22, topY + 2);
      ctx.closePath();
      ctx.fill();

      // Polished Mahogany Top Slab Surface
      drawIsoDiamond(ctx, cx, topY, 44, 22, '#6d4c41', '#3e2723');

      // 3. Vintage Marshall Speaker Unit (resting ON TOP of the Pedestal at spkBaseY = topY - 2)
      const spkBaseY = topY - 2;

      // Brass Cone Feet under Speaker Body
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(cx - 14, spkBaseY, 4, 2);
      ctx.fillRect(cx + 10, spkBaseY, 4, 2);

      // Speaker 3D Dimensions
      const spkW = 28;
      const spkH = 17;

      // Speaker Main Body (Tolex Leather Outer Casing)
      // Top Face of Speaker
      const gSpkTop = ctx.createLinearGradient(cx - spkW / 2, 0, cx + spkW / 2, 0);
      gSpkTop.addColorStop(0, '#2e2e2e');
      gSpkTop.addColorStop(0.5, '#424242');
      gSpkTop.addColorStop(1, '#212121');
      ctx.fillStyle = gSpkTop;
      ctx.beginPath();
      ctx.moveTo(cx, spkBaseY - spkH - 7);
      ctx.lineTo(cx + spkW / 2, spkBaseY - spkH);
      ctx.lineTo(cx, spkBaseY - spkH + 7);
      ctx.lineTo(cx - spkW / 2, spkBaseY - spkH);
      ctx.closePath();
      ctx.fill();

      // Brushed Brass Metal Control Plate on Top Face
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.moveTo(cx - 4, spkBaseY - spkH - 3);
      ctx.lineTo(cx + 8, spkBaseY - spkH + 1);
      ctx.lineTo(cx + 4, spkBaseY - spkH + 3);
      ctx.lineTo(cx - 8, spkBaseY - spkH - 1);
      ctx.closePath();
      ctx.fill();

      // 3 Brass Rotary Knobs on Control Plate
      ctx.fillStyle = '#fff8e1';
      ctx.beginPath(); ctx.arc(cx - 4, spkBaseY - spkH - 1, 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, spkBaseY - spkH, 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 4, spkBaseY - spkH + 1, 1.2, 0, Math.PI * 2); ctx.fill();

      // Red Power LED Indicator Bulb
      ctx.fillStyle = '#ff1744';
      ctx.beginPath(); ctx.arc(cx + 7, spkBaseY - spkH + 1.8, 1.0, 0, Math.PI * 2); ctx.fill();

      // Front Left Face of Speaker Body (Tolex Side Panel)
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.moveTo(cx - spkW / 2, spkBaseY - spkH);
      ctx.lineTo(cx, spkBaseY - spkH + 7);
      ctx.lineTo(cx, spkBaseY + 1);
      ctx.lineTo(cx - spkW / 2, spkBaseY - 6);
      ctx.closePath();
      ctx.fill();

      // Front Right Face of Speaker (Main Vintage Woven Grill Face!)
      const gGrill = ctx.createLinearGradient(cx, 0, cx + spkW / 2, 0);
      gGrill.addColorStop(0, '#d7ccc8');
      gGrill.addColorStop(0.5, '#efebe9');
      gGrill.addColorStop(1, '#bcaaa4');
      ctx.fillStyle = gGrill;
      ctx.beginPath();
      ctx.moveTo(cx, spkBaseY - spkH + 7);
      ctx.lineTo(cx + spkW / 2, spkBaseY - spkH);
      ctx.lineTo(cx + spkW / 2, spkBaseY - 6);
      ctx.lineTo(cx, spkBaseY + 1);
      ctx.closePath();
      ctx.fill();

      // Woven Grill Mesh Texture Lines
      ctx.strokeStyle = 'rgba(93, 64, 55, 0.35)';
      ctx.lineWidth = 0.8;
      for (let gy = spkBaseY - spkH + 9; gy < spkBaseY - 1; gy += 3) {
        ctx.beginPath();
        ctx.moveTo(cx, gy);
        ctx.lineTo(cx + spkW / 2, gy - 7);
        ctx.stroke();
      }

      // Gold Piping Border around Front Grill
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx + 1, spkBaseY - spkH + 8);
      ctx.lineTo(cx + spkW / 2 - 1, spkBaseY - spkH + 1);
      ctx.lineTo(cx + spkW / 2 - 1, spkBaseY - 7);
      ctx.lineTo(cx + 1, spkBaseY);
      ctx.closePath();
      ctx.stroke();

      // Iconic Brass Script Logo ("Marshall") across center of Grill
      ctx.fillStyle = '#ffecb3';
      ctx.font = 'italic bold 8px serif';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(cx + spkW / 4, spkBaseY - spkH / 2 + 1);
      ctx.rotate(-Math.PI / 14);
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 2;
      ctx.fillText('Marshall', 0, 0);
      ctx.restore();

      // 4. Animated Warm Jazz Musical Notes floating from Speaker
      const noteTime = Date.now() / 350;
      const note1Y = spkBaseY - spkH - 12 - Math.sin(noteTime) * 3;
      const note2Y = spkBaseY - spkH - 20 - Math.cos(noteTime * 0.8) * 4;

      ctx.fillStyle = '#ffd54f';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎵', cx + 4 + Math.cos(noteTime) * 3, note1Y);
      ctx.fillText('🎶', cx - 6 + Math.sin(noteTime * 0.7) * 4, note2Y);
      break;
    }

    case 'DOOR_ENTRANCE': {
      // Cafe Entrance Door Frame
      const topY = cy - 50;
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(cx - 16, topY, 32, 50);
      ctx.fillStyle = 'rgba(179, 229, 252, 0.6)';
      ctx.fillRect(cx - 12, topY + 4, 24, 30);
      // Welcome Mat
      drawIsoDiamond(ctx, cx, cy, 36, 18, '#8d6e63', '#4e342e');
      break;
    }

    default: {
      // Generic fallback
      drawIsoDiamond(ctx, cx, cy - 10, 30, 15, '#9e9e9e', '#616161');
    }
  }

  canvasCache.set(key, canvas);
  return canvas;
}
