/**
 * Pathfinder.js
 * Implementation of A* Search Algorithm for character navigation on isometric grid layout.
 */

export class Pathfinder {
  constructor(gridWidth = 20, gridHeight = 20) {
    this.width = gridWidth;
    this.height = gridHeight;
    this.grid = Array.from({ length: gridHeight }, () => new Array(gridWidth).fill(0));
  }

  setGridSize(w, h) {
    this.width = w;
    this.height = h;
    this.grid = Array.from({ length: h }, () => new Array(w).fill(0));
  }

  setObstacle(x, y, isBlocked = true) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.grid[y][x] = isBlocked ? 1 : 0;
    }
  }

  isWalkable(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
    return this.grid[y][x] === 0;
  }

  /**
   * Find path from (startX, startY) to (endX, endY)
   * Returns array of {x, y} coordinates or empty array if unreachable.
   */
  findPath(startX, startY, endX, endY) {
    startX = Math.floor(startX);
    startY = Math.floor(startY);
    endX = Math.floor(endX);
    endY = Math.floor(endY);

    if (startX === endX && startY === endY) return [{ x: startX, y: startY }];

    if (!this.isWalkable(startX, startY)) {
      const neighbors = this.getNeighbors(startX, startY);
      const walkable = neighbors.filter(n => this.isWalkable(n.x, n.y));
      if (walkable.length > 0) {
        startX = walkable[0].x;
        startY = walkable[0].y;
      }
    }

    if (!this.isWalkable(endX, endY)) {
      // Find nearest walkable neighbor to target
      const neighbors = this.getNeighbors(endX, endY);
      const walkable = neighbors.filter(n => this.isWalkable(n.x, n.y));
      if (walkable.length === 0) return [];
      endX = walkable[0].x;
      endY = walkable[0].y;
    }

    const openSet = [];
    const closedSet = new Set();
    const startNode = { x: startX, y: startY, g: 0, h: this.heuristic(startX, startY, endX, endY), parent: null };
    openSet.push(startNode);

    while (openSet.length > 0) {
      // Find lowest f score node
      openSet.sort((a, b) => (a.g + a.h) - (b.g + b.h));
      const current = openSet.shift();

      if (current.x === endX && current.y === endY) {
        // Reconstruct path
        const path = [];
        let curr = current;
        while (curr) {
          path.unshift({ x: curr.x, y: curr.y });
          curr = curr.parent;
        }
        return path;
      }

      const key = `${current.x},${current.y}`;
      closedSet.add(key);

      const neighbors = this.getNeighbors(current.x, current.y);
      for (const neighbor of neighbors) {
        if (!this.isWalkable(neighbor.x, neighbor.y)) continue;
        const nKey = `${neighbor.x},${neighbor.y}`;
        if (closedSet.has(nKey)) continue;

        const gScore = current.g + 1;
        let existingNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);

        if (!existingNode) {
          const newNode = {
            x: neighbor.x,
            y: neighbor.y,
            g: gScore,
            h: this.heuristic(neighbor.x, neighbor.y, endX, endY),
            parent: current
          };
          openSet.push(newNode);
        } else if (gScore < existingNode.g) {
          existingNode.g = gScore;
          existingNode.parent = current;
        }
      }
    }

    return [];
  }

  getNeighbors(x, y) {
    return [
      { x: x + 1, y: y },
      { x: x - 1, y: y },
      { x: x, y: y + 1 },
      { x: x, y: y - 1 }
    ];
  }

  heuristic(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }
}
