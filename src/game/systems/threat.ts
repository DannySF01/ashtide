import type { Character, ResourceAmounts } from "../state/types";
import type { CombatResult, Enemy } from "./combat";
import { SeededRandom } from "../rng/seededRandom";

export interface ThreatFactors {
  day: number;
  foodStored: number;
  populationCount: number;
  defenseLevel: number;
}

/**
 * Computes the current attractiveness/danger of the base as a 0-100 value.
 * Higher means an attack is more likely.
 */
export function computeThreatLevel(factors: ThreatFactors): number {
  let threat = 5; // baseline, never fully safe

  threat += Math.min(20, factors.day * 1.5); // escalates slowly with time
  threat += Math.min(20, factors.populationCount * 3); // more people increases threat

  threat -= Math.min(30, factors.defenseLevel * 5); // defenses reduce threat

  return Math.max(0, Math.min(100, threat));
}

export interface AttackCheckResult {
  attackOccurred: boolean;
  threatLevel: number;
}

/** Rolls whether a wildlife attack happens */
export function rollForAttack(
  factors: ThreatFactors,
  rng: SeededRandom,
): AttackCheckResult {
  const threatLevel = computeThreatLevel(factors);
  // Threat level 0-100 maps to a 0%-50% chance per check, so it's never certain.
  const chance = threatLevel / 200;
  return { attackOccurred: rng.chance(chance), threatLevel };
}

export interface AttackOutcome {
  targetCharacter: Character;
  combatResult: CombatResult;
  foodStolen: number;
}

/**
 * Picks a character at random to defend the base.
 */
export function pickAttackTarget(
  characters: Character[],
  rng: SeededRandom,
): Character {
  const alive = characters.filter((c) => c.hp > 0);
  if (alive.length === 0) {
    throw new Error("No characters available to defend the base");
  }
  return rng.pick(alive);
}

/** Food lost to a successful raid, capped by what's actually stored. */
export function computeFoodStolen(
  resources: ResourceAmounts,
  enemy: Enemy,
  rng: SeededRandom,
): number {
  const desired = rng.nextInt(1, 5) + Math.floor(enemy.hp / 2);
  return Math.min(desired, resources.food);
}
