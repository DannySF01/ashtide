import type { Character, Needs } from "../state/types";

export interface NeedsDecayRates {
  hunger: number;
  thirst: number;
  energy: number;
}

export const DEFAULT_DECAY_PER_TICK: NeedsDecayRates = {
  hunger: 0.15,
  thirst: 0.2,
  energy: 0.05,
};

function clampNeed(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function decayNeeds(
  needs: Needs,
  ticks: number,
  rates: NeedsDecayRates = DEFAULT_DECAY_PER_TICK,
): Needs {
  return {
    hunger: clampNeed(needs.hunger - rates.hunger * ticks),
    thirst: clampNeed(needs.thirst - rates.thirst * ticks),
    energy: clampNeed(needs.energy - rates.energy * ticks),
  };
}

export function applyNeedsDecay(
  character: Character,
  ticks: number,
): Character {
  return {
    ...character,
    needs: decayNeeds(character.needs, ticks),
  };
}

export function hasCriticalNeed(needs: Needs): boolean {
  return needs.hunger === 0 || needs.thirst === 0;
}
