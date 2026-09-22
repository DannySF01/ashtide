import type { GameState, Character, ResourceAmounts } from "../state/types";
import { SeededRandom } from "../rng/seededRandom";

export interface TaskDefinition {
  id: string;
  name: string;
  durationTicks: number;
  energyCost: number;
  resourceReward: Partial<ResourceAmounts>;
  resourceRewardRange?: Partial<
    Record<keyof ResourceAmounts, [number, number]>
  >;
  xpReward: { skill: keyof Character["skills"]; amount: number };
}

export interface TaskResult {
  character: Character;
  resources: ResourceAmounts;
  gained: Partial<ResourceAmounts>;
}

export function canStartTask(
  character: Character,
  task: TaskDefinition,
): boolean {
  if (character.status !== "idle") return false;
  if (character.needs.energy < task.energyCost) return false;
  return true;
}

export function resolveTask(
  state: GameState,
  characterId: string,
  task: TaskDefinition,
  rng: SeededRandom,
): TaskResult {
  const character = state.characters.find((c) => c.id === characterId);
  if (!character) {
    throw new Error(`Character not found: ${characterId}`);
  }

  const gained: Partial<ResourceAmounts> = {};

  for (const [key, amount] of Object.entries(task.resourceReward) as [
    keyof ResourceAmounts,
    number,
  ][]) {
    gained[key] = amount;
  }

  if (task.resourceRewardRange) {
    for (const [key, [min, max]] of Object.entries(
      task.resourceRewardRange,
    ) as [keyof ResourceAmounts, [number, number]][]) {
      gained[key] = (gained[key] ?? 0) + rng.nextInt(min, max);
    }
  }

  const updatedResources: ResourceAmounts = { ...state.resources };
  for (const [key, amount] of Object.entries(gained) as [
    keyof ResourceAmounts,
    number,
  ][]) {
    updatedResources[key] += amount;
  }

  const updatedCharacter: Character = {
    ...character,
    needs: {
      ...character.needs,
      energy: Math.max(0, character.needs.energy - task.energyCost),
    },
    xp: {
      ...character.xp,
      [task.xpReward.skill]:
        character.xp[task.xpReward.skill] + task.xpReward.amount,
    },
  };

  return {
    character: updatedCharacter,
    resources: updatedResources,
    gained,
  };
}
