/**
 * Whiteboard Utility Functions
 * Provides helper functions for canvas operations and data optimization
 */

/**
 * Compress drawing path points using Douglas-Peucker algorithm
 * Reduces the number of points while maintaining visual quality
 * @param {Array} points - Array of {x, y} coordinates
 * @param {number} tolerance - Simplification tolerance (default: 2)
 * @returns {Array} Simplified array of points
 */
export const simplifyPath = (points, tolerance = 2) => {
  if (points.length <= 2) return points;

  const douglasPeucker = (points, tolerance) => {
    if (points.length <= 2) return points;

    let maxDistance = 0;
    let index = 0;

    // Find the point with the maximum distance from the line
    for (let i = 1; i < points.length - 1; i++) {
      const distance = perpendicularDistance(
        points[i],
        points[0],
        points[points.length - 1]
      );
      if (distance > maxDistance) {
        maxDistance = distance;
        index = i;
      }
    }

    // If the maximum distance is greater than tolerance, recursively simplify
    if (maxDistance > tolerance) {
      const leftPoints = douglasPeucker(points.slice(0, index + 1), tolerance);
      const rightPoints = douglasPeucker(points.slice(index), tolerance);

      return [...leftPoints.slice(0, -1), ...rightPoints];
    } else {
      return [points[0], points[points.length - 1]];
    }
  };

  return douglasPeucker(points, tolerance);
};

/**
 * Calculate perpendicular distance from a point to a line
 * @param {Object} point - Point {x, y}
 * @param {Object} lineStart - Line start point {x, y}
 * @param {Object} lineEnd - Line end point {x, y}
 * @returns {number} Distance
 */
const perpendicularDistance = (point, lineStart, lineEnd) => {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;

  const numerator = Math.abs(
    dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x
  );
  const denominator = Math.sqrt(dx * dx + dy * dy);

  return numerator / denominator;
};

/**
 * Convert canvas to base64 image
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} format - Image format (default: 'image/png')
 * @param {number} quality - Image quality 0-1 (default: 0.92)
 * @returns {string} Base64 encoded image
 */
export const canvasToBase64 = (canvas, format = 'image/png', quality = 0.92) => {
  return canvas.toDataURL(format, quality);
};

/**
 * Download canvas as image file
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} filename - Download filename (default: 'whiteboard.png')
 * @param {string} format - Image format (default: 'image/png')
 */
export const downloadCanvas = (canvas, filename = 'whiteboard.png', format = 'image/png') => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL(format);
  link.click();
};

/**
 * Calculate bounding box for a set of points
 * @param {Array} points - Array of {x, y} coordinates
 * @returns {Object} Bounding box {minX, minY, maxX, maxY, width, height}
 */
export const getBoundingBox = (points) => {
  if (!points || points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);

  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
};

/**
 * Smooth path using Catmull-Rom spline
 * @param {Array} points - Array of {x, y} coordinates
 * @param {number} tension - Spline tension (default: 0.5)
 * @returns {Array} Smoothed path points
 */
export const smoothPath = (points, tension = 0.5) => {
  if (points.length < 3) return points;

  const smoothed = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    for (let t = 0; t < 1; t += 0.1) {
      const t2 = t * t;
      const t3 = t2 * t;

      const x = 0.5 * (
        2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
      );

      const y = 0.5 * (
        2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
      );

      smoothed.push({ x, y });
    }
  }

  return smoothed;
};

/**
 * Throttle function to limit execution rate
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func(...args);
    }
  };
};

/**
 * Debounce function to delay execution
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Calculate distance between two points
 * @param {Object} p1 - First point {x, y}
 * @param {Object} p2 - Second point {x, y}
 * @returns {number} Distance
 */
export const distance = (p1, p2) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Get color with alpha transparency
 * @param {string} color - Hex color code
 * @param {number} alpha - Alpha value 0-1
 * @returns {string} RGBA color string
 */
export const colorWithAlpha = (color, alpha) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Generate unique ID for drawing actions
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Compress drawing history for storage
 * @param {Array} history - Array of drawing actions
 * @returns {string} Compressed JSON string
 */
export const compressHistory = (history) => {
  // Remove unnecessary fields and simplify paths
  const compressed = history.map(action => ({
    t: action.tool,
    c: action.color,
    s: action.brushSize,
    p: simplifyPath(action.points, 3) // More aggressive simplification for storage
  }));
  
  return JSON.stringify(compressed);
};

/**
 * Decompress drawing history
 * @param {string} compressedData - Compressed JSON string
 * @returns {Array} Array of drawing actions
 */
export const decompressHistory = (compressedData) => {
  try {
    const compressed = JSON.parse(compressedData);
    return compressed.map(action => ({
      tool: action.t,
      color: action.c,
      brushSize: action.s,
      points: action.p
    }));
  } catch (error) {
    console.error('Failed to decompress history:', error);
    return [];
  }
};

export default {
  simplifyPath,
  canvasToBase64,
  downloadCanvas,
  getBoundingBox,
  smoothPath,
  throttle,
  debounce,
  distance,
  colorWithAlpha,
  generateId,
  compressHistory,
  decompressHistory
};
