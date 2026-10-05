/**
 * Seeded deterministic PRNG and data generation utilities.
 * Default seed = 42 for complete reproducibility.
 */

import fs from 'fs';
import path from 'path';

export function createRNG(seed = 42) {
  let s = seed >>> 0;
  return function next(): number {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class GeneratorContext {
  public rng: () => number;

  constructor(seed = 42) {
    this.rng = createRNG(seed);
  }

  randomFloat(min = 0, max = 1): number {
    return min + this.rng() * (max - min);
  }

  randomInt(min: number, max: number): number {
    return Math.floor(this.randomFloat(min, max + 1));
  }

  choice<T>(array: T[]): T {
    if (array.length === 0) throw new Error('Cannot choose from empty array');
    const index = Math.floor(this.rng() * array.length);
    return array[index];
  }

  weightedChoice<T>(items: T[], weights: number[]): T {
    if (items.length !== weights.length) {
      throw new Error('Items and weights must have identical length');
    }
    const totalWeight = weights.reduce((acc, w) => acc + w, 0);
    let r = this.rng() * totalWeight;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  sample<T>(array: T[], count: number): T[] {
    const copy = [...array];
    const result: T[] = [];
    for (let i = 0; i < count && copy.length > 0; i++) {
      const idx = Math.floor(this.rng() * copy.length);
      result.push(copy.splice(idx, 1)[0]);
    }
    return result;
  }

  shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  round(value: number, decimals = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}

export const DATA_DIR = path.resolve(process.cwd(), 'data');

export function writeJsonFile(filename: string, data: unknown): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✓ Wrote ${filename} (${Array.isArray(data) ? data.length + ' rows' : 'object'})`);
}
