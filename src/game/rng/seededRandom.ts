import seedrandom from "seedrandom";

export class SeededRandom {
  private rng: seedrandom.PRNG;

  constructor(seed: string) {
    this.rng = seedrandom(seed);
  }

  /** Float number between 0 and 1 (both inclusive) */
  next(): number {
    return this.rng();
  }

  /** Integer number between min and max (both inclusive) */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**  Returns true with probability given */
  chance(probability: number): boolean {
    return this.next() < probability;
  }

  /** Returns random item from array */
  pick<T>(items: T[]): T {
    return items[this.nextInt(0, items.length - 1)];
  }
}
