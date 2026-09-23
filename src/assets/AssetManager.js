/**
 * AssetManager.js
 * Central asset registry and loader for all 2.5D visual components.
 */

import { renderFloorTile, renderWallTile, renderWallDoorTile, renderWallWindowTile, renderExteriorTile, renderDistrictProp, renderFurnitureSprite } from './FurnitureAssets.js';
import { renderCharacterSprite, renderBubbleIcon, CUSTOMER_PRESETS } from './CharacterAssets.js';

class AssetManager {
  constructor() {
    this.isReady = false;
  }

  /**
   * Pre-bakes essential sprites into offscreen memory for smooth 60 FPS canvas performance
   */
  async preloadAll() {
    console.log('[AssetManager] Pre-baking 2.5D vector assets...');

    // 1. Floors & Exterior Sidewalk Tiles
    ['wood_basic', 'wood_premium', 'tile_marble', 'patio_stone'].forEach(type => renderFloorTile(type));
    ['university', 'business', 'residential', 'entertainment', 'tourist', 'plaza', 'historic', 'neighborhood', 'asphalt'].forEach(type => renderExteriorTile(type));

    // 2. Walls & Windows
    ['brick', 'modern'].forEach(type => {
      renderWallTile(type, 'NW');
      renderWallTile(type, 'NE');
      renderWallDoorTile(type);
      renderWallWindowTile(type, 'NW');
      renderWallWindowTile(type, 'NE');
    });

    // 3. District Props
    const props = [
      'TREE_OAK', 'BIKE_RACK', 'BULLETIN_BOARD', 'PLANTER_BOXWOOD', 'BOLLARD_LED', 'LAMP_ANTIQUE', 'POT_BOUGAINVILLEA',
      'TREE_MAPLE', 'CAT_SHELTER', 'DIGITAL_BILLBOARD_STOCK', 'SKYSCRAPER_PILLAR', 'LUXURY_CAR_PARKED',
      'PARK_BENCH_WOOD', 'FLOWER_BED', 'NEON_ART_SCULPTURE', 'THEATER_POSTER_STAND', 'VINTAGE_STREET_LAMP',
      'MUSIC_BUSKER_STAGE', 'FOUNTAIN_STONE'
    ];
    props.forEach(p => renderDistrictProp(p));

    // 4. Furniture & Equipment
    const furnTypes = [
      'TABLE_BASIC', 'TABLE_WOOD', 'TABLE_PREMIUM',
      'CHAIR_BASIC', 'CHAIR_COMFORT', 'CHAIR_SOFA',
      'COUNTER_BASIC', 'COUNTER_MARBLE',
      'ESPRESSO_MACHINE_TIER_1', 'ESPRESSO_MACHINE_TIER_2', 'ESPRESSO_MACHINE_TIER_3',
      'REFRIGERATOR_SMALL', 'REFRIGERATOR_STAINLESS', 'GRINDER_BASIC',
      'PLANT_MONSTERA', 'PLANT_FICUS', 'LAMP_VINTAGE', 'BOOKSHELF', 'WIFI_STATION', 'SPEAKER', 'DOOR_ENTRANCE'
    ];

    furnTypes.forEach(id => {
      for (let rot = 0; rot < 8; rot++) {
        renderFurnitureSprite(id, rot);
      }
    });

    // 5. Characters & Bubbles
    const charTypes = Object.keys(CUSTOMER_PRESETS);
    const states = ['idle', 'walk_0', 'walk_1', 'walk_2', 'walk_3', 'sit', 'drink', 'work', 'carry', 'hand_up'];
    const dirs = ['SE', 'SW', 'NE', 'NW'];

    charTypes.forEach(type => {
      states.forEach(state => {
        dirs.forEach(dir => {
          renderCharacterSprite(type, state, dir);
        });
      });
    });

    ['coffee', 'heart', 'wait', 'money', 'star', 'check', 'angry', 'sad', 'disappointed', 'croissant', 'cheesecake', 'waffle', 'cold_brew', 'toast', 'donut'].forEach(b => renderBubbleIcon(b));

    this.isReady = true;
    console.log('[AssetManager] Pre-baking complete! All game sprites cached.');
  }

  getFloor(type) {
    return renderFloorTile(type);
  }

  getExteriorTile(type) {
    return renderExteriorTile(type);
  }

  getDistrictProp(propId) {
    return renderDistrictProp(propId);
  }

  getWall(type, dir) {
    return renderWallTile(type, dir);
  }

  getWallDoor(type) {
    return renderWallDoorTile(type);
  }

  getWallWindow(type, dir) {
    return renderWallWindowTile(type, dir);
  }

  getFurniture(id, rot = 0) {
    return renderFurnitureSprite(id, rot);
  }

  getCharacter(type, state, dir) {
    return renderCharacterSprite(type, state, dir);
  }

  getBubble(type) {
    return renderBubbleIcon(type);
  }
}

export const assetManager = new AssetManager();
