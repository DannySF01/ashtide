import type { Character } from "../state/types";
import { SeededRandom } from "../rng/seededRandom";

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  damage: number;
  hitChance: number; // 0 to 1, chance the enemy lands a hit
}

export interface CombatRound {
  characterDamageDealt: number;
  enemyDamageDealt: number;
  enemyDefeated: boolean;
  characterDefeated: boolean;
}

export interface CombatResult {
  character: Character;
  enemyDefeated: boolean;
  characterDefeated: boolean;
  rounds: CombatRound[];
}

function characterDamageRoll(character: Character, rng: SeededRandom): number {
  const base = 1 + character.skills.fighting;
  const variance = rng.nextInt(-1, 2);
  return Math.max(1, base + variance);
}

/**
 * Resolves a full combat encounter, round by round, until one side is
 * defeated. Kept simple and automatic on purpose: no player input mid-fight.
 */
export function resolveCombat(
  character: Character,
  enemy: Enemy,
  rng: SeededRandom,
): CombatResult {
  let characterHp = character.hp;
  let enemyHp = enemy.hp;
  const rounds: CombatRound[] = [];

  const MAX_ROUNDS = 20; // safety net against infinite loops

  for (let i = 0; i < MAX_ROUNDS; i++) {
    const characterDamageDealt = characterDamageRoll(character, rng);
    enemyHp = Math.max(0, enemyHp - characterDamageDealt);

    let enemyDamageDealt = 0;
    if (enemyHp > 0 && rng.chance(enemy.hitChance)) {
      enemyDamageDealt = enemy.damage;
      characterHp = Math.max(0, characterHp - enemyDamageDealt);
    }

    const enemyDefeated = enemyHp <= 0;
    const characterDefeated = characterHp <= 0;

    rounds.push({
      characterDamageDealt,
      enemyDamageDealt,
      enemyDefeated,
      characterDefeated,
    });

    if (enemyDefeated || characterDefeated) break;
  }

  const lastRound = rounds[rounds.length - 1];

  return {
    character: {
      ...character,
      hp: characterHp,
      status: characterHp <= 0 ? "injured" : character.status,
    },
    enemyDefeated: lastRound.enemyDefeated,
    characterDefeated: lastRound.characterDefeated,
    rounds,
  };
}
