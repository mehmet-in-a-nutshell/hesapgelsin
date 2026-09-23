/**
 * CharacterAssets.js
 * Renders high-resolution animated character sprites for customers and employees.
 * Supports walking cycles, sitting, coffee drinking, laptop typing, phone checking, and thought bubbles.
 */

const charCache = new Map();

function createCacheCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export const CUSTOMER_PRESETS = {
  student: {
    name: 'Student',
    skin: '#ffdbac',
    hair: '#4a2e1b',
    shirt: '#42a5f5', // Blue hoodie
    pants: '#37474f',
    accessory: 'backpack'
  },
  office_worker: {
    name: 'Office Worker',
    skin: '#f1c27d',
    hair: '#212121',
    shirt: '#ffffff', // White suit shirt
    tie: '#e53935',
    pants: '#263238',
    accessory: 'briefcase'
  },
  freelancer: {
    name: 'Freelancer',
    skin: '#e0ac69',
    hair: '#d84315',
    shirt: '#26a69a', // Teal sweater
    pants: '#4e342e',
    accessory: 'glasses'
  },
  tourist: {
    name: 'Tourist',
    skin: '#f5c68c',
    hair: '#fbc02d',
    shirt: '#ff7043', // Hawaiian orange shirt
    pants: '#8d6e63',
    accessory: 'camera'
  },
  influencer: {
    name: 'Influencer',
    skin: '#ffdbac',
    hair: '#ec407a', // Vibrant pink hair
    shirt: '#ab47bc', // Stylish purple top
    pants: '#ffffff',
    accessory: 'sunglasses'
  },
  barista: {
    name: 'Barista',
    skin: '#f1c27d',
    hair: '#3e2723',
    shirt: '#212121', // Black shirt
    apron: '#2e7d32', // Green cafe apron
    pants: '#212121'
  },
  repairman: {
    name: 'Usta Tamirci',
    skin: '#f1c27d',
    hair: '#3e2723',
    shirt: '#ff9800',   // Bright high-vis warning orange shirt
    pants: '#1565c0',   // Navy denim work pants
    jumpsuit: '#1565c0', // Navy blue overalls / work tulum
    accessory: 'hard_hat_and_tools'
  }
};

/**
 * Render Character Sprite Frame
 * @param {string} type - 'student', 'office_worker', 'freelancer', etc.
 * @param {string} state - 'idle', 'walk_0', 'walk_1', 'walk_2', 'walk_3', 'sit', 'drink', 'work', 'carry'
 * @param {string} dir - 'SE', 'SW', 'NE', 'NW'
 */
export function renderCharacterSprite(type, state = 'idle', dir = 'SE') {
  const key = `char_${type}_${state}_${dir}`;
  if (charCache.has(key)) return charCache.get(key);

  const preset = CUSTOMER_PRESETS[type] || CUSTOMER_PRESETS.student;
  const W = 64;
  const H = 74;
  const canvas = createCacheCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const cx = W / 2;
  const cy = H - 12;

  // Soft shadow underneath feet
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, 0.45);
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fill();
  ctx.restore();

  // Animation leg offset calculation
  let legOffsetLeft = 0;
  let legOffsetRight = 0;
  let bodyBob = 0;

  if (state.startsWith('walk')) {
    const step = parseInt(state.split('_')[1] || '0', 10);
    legOffsetLeft = Math.sin((step / 4) * Math.PI * 2) * 5;
    legOffsetRight = -legOffsetLeft;
    bodyBob = Math.abs(Math.sin((step / 2) * Math.PI)) * 2;
  } else if (state === 'sit' || state === 'hand_up') {
    bodyBob = 8; // lower torso for chair sitting
  }

  const headY = cy - 38 + bodyBob;
  const torsoY = cy - 24 + bodyBob;

  // 1. LEGS / PANTS
  ctx.fillStyle = preset.pants;
  if (state === 'sit' || state === 'hand_up') {
    // Sitting legs bent forward
    ctx.fillRect(cx - 5, cy - 14, 4, 8);
    ctx.fillRect(cx + 1, cy - 14, 4, 8);
    ctx.fillRect(cx - 6, cy - 8, 12, 4);
  } else {
    // Standing / Walking legs
    ctx.fillRect(cx - 5, torsoY + 6, 4, 16 + legOffsetLeft);
    ctx.fillRect(cx + 1, torsoY + 6, 4, 16 + legOffsetRight);

    // Shoes
    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(cx - 6, cy - 2 + legOffsetLeft, 5, 3);
    ctx.fillRect(cx + 1, cy - 2 + legOffsetRight, 5, 3);
  }

  // 2. TORSO / SHIRT
  ctx.fillStyle = preset.shirt;
  ctx.fillRect(cx - 7, torsoY - 8, 14, 15);

  // Barista Apron if applicable
  if (preset.apron) {
    ctx.fillStyle = preset.apron;
    ctx.fillRect(cx - 6, torsoY - 4, 12, 16);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 3, torsoY - 2, 6, 2); // Badge
  }

  // Tie if office worker
  if (preset.tie) {
    ctx.fillStyle = preset.tie;
    ctx.fillRect(cx - 1, torsoY - 6, 2, 10);
  }

  // 3. ARMS & ITEMS
  ctx.fillStyle = preset.skin;
  if (state === 'carry') {
    // Holding tray with coffee
    ctx.fillRect(cx - 8, torsoY - 2, 16, 4); // Arms out
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(cx - 10, torsoY - 5, 20, 3); // Tray
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 4, torsoY - 7, 2.5, 0, Math.PI * 2); // Cup 1
    ctx.arc(cx + 4, torsoY - 7, 2.5, 0, Math.PI * 2); // Cup 2
    ctx.fill();
  } else if (state === 'hand_up') {
    // Left arm down, right arm raised high in the air waving for order!
    ctx.fillRect(cx - 9, torsoY - 6, 3, 10);
    ctx.fillRect(cx + 6, headY - 8, 4, 14); // Raised arm
    ctx.fillStyle = preset.skin;
    ctx.beginPath();
    ctx.arc(cx + 8, headY - 10, 3.5, 0, Math.PI * 2); // Raised waving hand palm
    ctx.fill();
  } else if (state === 'drink') {
    // Holding cup near face
    ctx.fillRect(cx + 2, headY + 4, 4, 6);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx + 6, headY + 4, 3, 0, Math.PI * 2); // Coffee cup
    ctx.fill();
  } else if (state === 'work') {
    // Typing on laptop
    ctx.fillRect(cx - 8, torsoY + 2, 16, 3);
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(cx - 8, torsoY, 16, 2); // Laptop base
    ctx.fillStyle = '#cfd8dc';
    ctx.fillRect(cx - 7, torsoY - 6, 14, 6); // Laptop screen
  } else if (state === 'repair') {
    // Swinging 3D Wrench (İngiliz Anahtarı)
    ctx.fillRect(cx - 9, torsoY - 2, 6, 4); // Left arm steady
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(cx + 2, torsoY - 4, 10, 4); // Right arm with wrench
    ctx.fillStyle = '#78909c';
    ctx.fillRect(cx + 10, torsoY - 7, 5, 10); // Wrench jaw head
    ctx.fillStyle = '#ffca28';
    ctx.fillRect(cx + 12, torsoY - 5, 2, 6); // Spark accent
  } else {
    // Normal arms
    ctx.fillRect(cx - 9, torsoY - 6, 3, 12);
    ctx.fillRect(cx + 6, torsoY - 6, 3, 12);
  }

  // 4. HEAD, SKIN & DETAILED FACIAL FEATURES
  ctx.fillStyle = preset.skin;
  ctx.beginPath();
  ctx.arc(cx, headY, 9, 0, Math.PI * 2);
  ctx.fill();

  const isFacingRight = dir.includes('E');
  const faceX = isFacingRight ? cx + 2 : cx - 2;
  const earX = isFacingRight ? cx - 7 : cx + 7;

  // Ear
  ctx.fillStyle = preset.skin;
  ctx.beginPath();
  ctx.arc(earX, headY, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Rosy Blush Cheeks
  ctx.fillStyle = 'rgba(235, 120, 120, 0.45)';
  ctx.beginPath();
  if (isFacingRight) {
    ctx.arc(faceX - 1, headY + 2.5, 2.2, 0, Math.PI * 2);
    ctx.arc(faceX + 4, headY + 2.5, 2.2, 0, Math.PI * 2);
  } else {
    ctx.arc(faceX - 4, headY + 2.5, 2.2, 0, Math.PI * 2);
    ctx.arc(faceX + 1, headY + 2.5, 2.2, 0, Math.PI * 2);
  }
  ctx.fill();

  // Eyebrows
  ctx.strokeStyle = preset.hair;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  if (isFacingRight) {
    ctx.moveTo(faceX - 2, headY - 4.5);
    ctx.lineTo(faceX + 1, headY - 4.5);
    ctx.moveTo(faceX + 3, headY - 4.5);
    ctx.lineTo(faceX + 6, headY - 4.5);
  } else {
    ctx.moveTo(faceX - 6, headY - 4.5);
    ctx.lineTo(faceX - 3, headY - 4.5);
    ctx.moveTo(faceX - 1, headY - 4.5);
    ctx.lineTo(faceX + 2, headY - 4.5);
  }
  ctx.stroke();

  // Eyes (Expressive dark pupils with white sparkle highlights)
  ctx.fillStyle = '#1c1815';
  const eye1X = isFacingRight ? faceX - 1 : faceX - 5;
  const eye2X = isFacingRight ? faceX + 4 : faceX + 0;

  ctx.beginPath();
  ctx.arc(eye1X, headY - 1, 1.8, 0, Math.PI * 2);
  ctx.arc(eye2X, headY - 1, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // White Reflection Sparkles inside pupils
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(eye1X + 0.6, headY - 1.6, 0.7, 0, Math.PI * 2);
  ctx.arc(eye2X + 0.6, headY - 1.6, 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Cute Nose Contour Dot
  ctx.fillStyle = 'rgba(160, 90, 50, 0.45)';
  const noseX = isFacingRight ? faceX + 1.5 : faceX - 2.5;
  ctx.beginPath();
  ctx.arc(noseX, headY + 1.2, 1.0, 0, Math.PI * 2);
  ctx.fill();

  // Mouth (Expressive Smile / Sip / Open Mouth)
  ctx.strokeStyle = '#8d4e2a';
  ctx.lineWidth = 1.3;
  const mouthCenterX = isFacingRight ? faceX + 1.5 : faceX - 2.5;

  if (state === 'drink') {
    // Sipping open mouth
    ctx.fillStyle = '#b71c1c';
    ctx.beginPath();
    ctx.arc(mouthCenterX, headY + 3.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Friendly smile curve
    ctx.beginPath();
    ctx.arc(mouthCenterX, headY + 2.8, 2.5, 0.15, Math.PI - 0.15);
    ctx.stroke();
  }

  // 5. HAIR
  ctx.fillStyle = preset.hair;
  ctx.beginPath();
  ctx.arc(cx, headY - 2, 9.2, Math.PI * 0.95, Math.PI * 2.05);
  ctx.fill();

  // Hair style flare
  if (type === 'influencer') {
    ctx.fillRect(cx - 9, headY - 4, 4, 12); // Long hair side strands
    ctx.fillRect(cx + 5, headY - 4, 4, 12);
  } else if (type === 'student') {
    ctx.fillRect(cx - 8, headY - 5, 5, 4); // Front hair bangs
  }

  // Accessories
  if (preset.accessory === 'glasses') {
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(eye1X - 2, headY - 3.5, 5, 4.5);
    ctx.strokeRect(eye2X - 2, headY - 3.5, 5, 4.5);
    ctx.beginPath();
    ctx.moveTo(eye1X + 3, headY - 1.5);
    ctx.lineTo(eye2X - 2, headY - 1.5);
    ctx.stroke();
  } else if (preset.accessory === 'sunglasses') {
    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(eye1X - 2, headY - 3.5, 12, 5);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(eye1X - 1, headY - 2.5, 3, 1);
    ctx.fillRect(eye2X - 1, headY - 2.5, 3, 1);
  } else if (preset.accessory === 'backpack') {
    ctx.fillStyle = '#ef5350';
    ctx.fillRect(cx - 10, torsoY - 4, 3, 12);
  } else if (preset.accessory === 'camera') {
    ctx.fillStyle = '#212121';
    ctx.fillRect(cx - 4, torsoY + 2, 8, 5);
    ctx.fillStyle = '#cfd8dc';
    ctx.beginPath();
    ctx.arc(cx, torsoY + 4.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
  } else if (preset.accessory === 'hard_hat_and_tools') {
    // 3D Yellow Safety Construction Hard Hat (Şantiye Bareti)
    ctx.fillStyle = '#ffca28';
    ctx.beginPath();
    ctx.arc(cx, headY - 4, 10.5, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - 12, headY - 4, 24, 3); // Hat brim
    ctx.fillStyle = '#fff59d'; // Crown highlight
    ctx.fillRect(cx - 2, headY - 13, 4, 8);

    // Leather Tool Belt with Hammer
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(cx - 8, torsoY + 4, 16, 3);
    ctx.fillStyle = '#ffb300';
    ctx.fillRect(cx - 2, torsoY + 3, 4, 5); // Buckle
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(cx + 6, torsoY + 5, 3, 8); // Hammer handle
    ctx.fillStyle = '#37474f';
    ctx.fillRect(cx + 5, torsoY + 11, 5, 3.5); // Hammer head
  }

  charCache.set(key, canvas);
  return canvas;
}

/**
 * Render Emotion / Thought / Action Bubble
 */
export function renderBubbleIcon(type) {
  const key = `bubble_${type}`;
  if (charCache.has(key)) return charCache.get(key);

  const canvas = createCacheCanvas(36, 36);
  const ctx = canvas.getContext('2d');
  const cx = 18;
  const cy = 16;

  // Outer shadow & background
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;

  // Speech bubble circle
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Reset shadow for tail and emoji text
  ctx.shadowColor = 'transparent';

  // Bubble tail pointer
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy + 12);
  ctx.lineTo(cx, cy + 18);
  ctx.lineTo(cx + 4, cy + 12);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Determine emoji based on bubble type
  let emoji = '☕';
  switch (type) {
    case 'coffee':
      emoji = '☕';
      break;
    case 'heart':
      emoji = '❤️';
      break;
    case 'wait':
      emoji = '⏳';
      break;
    case 'money':
      emoji = '💰';
      break;
    case 'star':
      emoji = '⭐';
      break;
    case 'check':
      emoji = '✅';
      break;
    case 'cross':
      emoji = '❌';
      break;
    case 'ecstatic':
      emoji = '🤩';
      break;
    case 'instagram':
      emoji = '📸';
      break;
    case 'angry':
      emoji = '😡';
      break;
    case 'sad':
    case 'disappointed':
      emoji = '😢';
      break;
    case 'croissant':
      emoji = '🥐';
      break;
    case 'cheesecake':
      emoji = '🍰';
      break;
    case 'waffle':
      emoji = '🧇';
      break;
    case 'cold_brew':
      emoji = '🧋';
      break;
    case 'toast':
      emoji = '🥪';
      break;
    case 'donut':
      emoji = '🍩';
      break;
    default:
      emoji = '☕';
      break;
  }

  // Draw emoji cleanly inside the speech bubble
  ctx.font = '16px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, cx, cy + 1);

  charCache.set(key, canvas);
  return canvas;
}
