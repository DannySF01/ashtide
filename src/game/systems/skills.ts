import type { Character, SkillLevels } from "../state/types";

const SKILL_KEYS: (keyof SkillLevels)[] = [
  "gathering",
  "crafting",
  "hunting",
  "fighting",
];

/** XP required to level up. Grows linearly so early levels come quickly */
export function xpRequiredForLevel(level: number): number {
  return 10 * level;
}

export interface LevelUpResult {
  character: Character;
  leveledUp: Partial<Record<keyof SkillLevels, number>>;
}

/**
 * Checks every skill's accumulated xp against its threshold and applies
 * as many level-ups as the xp allows (in case a big xp reward skips levels).
 * Leftover xp carries over past the threshold rather than being discarded.
 */
export function applyLevelUps(character: Character): LevelUpResult {
  const skills: SkillLevels = { ...character.skills };
  const xp: Character["xp"] = { ...character.xp };
  const leveledUp: Partial<Record<keyof SkillLevels, number>> = {};

  for (const skill of SKILL_KEYS) {
    let currentLevel = skills[skill];
    let currentXp = xp[skill];

    let threshold = xpRequiredForLevel(currentLevel);
    while (currentXp >= threshold) {
      currentXp -= threshold;
      currentLevel += 1;
      threshold = xpRequiredForLevel(currentLevel);
    }

    if (currentLevel !== skills[skill]) {
      skills[skill] = currentLevel;
      xp[skill] = currentXp;
      leveledUp[skill] = currentLevel;
    }
  }

  return {
    character: { ...character, skills, xp },
    leveledUp,
  };
}
