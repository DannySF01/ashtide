import type { Character } from "../state/types";
import { SeededRandom } from "../rng/seededRandom";

export interface RiskModifiers {
  isNight: boolean;
  threatLevel: number; // 0 to 100 danger
}

export interface RiskCheckResult {
  encounterOccurred: boolean;
  finalChance: number;
}

/**
 * Computes the final chance of an encounter for a task, applying modifiers
 * on top of the task's base risk.
 */
export function computeFinalRiskChance(
  baseRiskChance: number,
  character: Character,
  modifiers: RiskModifiers,
): number {
  let chance = baseRiskChance;

  if (modifiers.isNight) {
    chance *= 1.6;
  }

  // Every 10 points of threat level adds 10% relative risk.
  chance *= 1 + modifiers.threatLevel / 100;

  // Higher gathering skill slightly reduces risk (more careful, more aware).
  const skillReduction = Math.min(0.3, character.skills.gathering * 0.02);
  chance *= 1 - skillReduction;

  return Math.max(0, Math.min(1, chance));
}

export function rollForEncounter(
  baseRiskChance: number,
  character: Character,
  modifiers: RiskModifiers,
  rng: SeededRandom,
): RiskCheckResult {
  const finalChance = computeFinalRiskChance(
    baseRiskChance,
    character,
    modifiers,
  );
  const encounterOccurred = rng.chance(finalChance);

  return { encounterOccurred, finalChance };
}
