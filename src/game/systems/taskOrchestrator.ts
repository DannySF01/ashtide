import type { Character, GameState } from "../state/types";
import type { TaskDefinition } from "./tasks";
import type { Enemy } from "./combat";
import { canStartTask, resolveTask } from "./tasks";
import { rollForEncounter, type RiskModifiers } from "./risk";
import { resolveCombat } from "./combat";
import { SeededRandom } from "../rng/seededRandom";

export type TaskOutcome =
  | { type: "blocked" }
  | {
      type: "safe";
      character: Character;
      resources: GameState["resources"];
      gained: Partial<GameState["resources"]>;
    }
  | {
      type: "encounter";
      character: Character;
      resources: GameState["resources"];
      gained: Partial<GameState["resources"]>;
      enemy: Enemy;
      enemyDefeated: boolean;
      characterDefeated: boolean;
    };

export interface TaskOrchestratorOptions {
  state: GameState;
  characterId: string;
  task: TaskDefinition;
  rng: SeededRandom;
  riskModifiers: RiskModifiers;
  /** Only needed when the task has a riskBaseChance; picks the enemy to fight. */
  pickEnemy?: (rng: SeededRandom) => Enemy;
}

/**
 * Runs a full task attempt end to end:
 * 1. Checks the character can start the task.
 * 2. Resolves the task's resource/xp outcome.
 * 3. If the task carries risk, rolls for an encounter and, if one occurs,
 *    resolves combat, overriding the character's resulting state.
 */
export function runTask(options: TaskOrchestratorOptions): TaskOutcome {
  const { state, characterId, task, rng, riskModifiers, pickEnemy } = options;

  const character = state.characters.find((c) => c.id === characterId);
  if (!character || !canStartTask(character, task)) {
    return { type: "blocked" };
  }

  const taskResult = resolveTask(state, characterId, task, rng);

  if (!task.riskBaseChance) {
    return {
      type: "safe",
      character: taskResult.character,
      resources: taskResult.resources,
      gained: taskResult.gained,
    };
  }

  const { encounterOccurred } = rollForEncounter(
    task.riskBaseChance,
    taskResult.character,
    riskModifiers,
    rng,
  );

  if (!encounterOccurred) {
    return {
      type: "safe",
      character: taskResult.character,
      resources: taskResult.resources,
      gained: taskResult.gained,
    };
  }

  if (!pickEnemy) {
    throw new Error(`Task "${task.id}" has risk but no pickEnemy was provided`);
  }

  const enemy = pickEnemy(rng);
  const combatResult = resolveCombat(taskResult.character, enemy, rng);

  return {
    type: "encounter",
    character: combatResult.character,
    resources: taskResult.resources,
    gained: taskResult.gained,
    enemy,
    enemyDefeated: combatResult.enemyDefeated,
    characterDefeated: combatResult.characterDefeated,
  };
}
