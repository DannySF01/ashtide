import type { Character, ResourceAmounts } from "../state/types";

export interface RecoveryRates {
  hpPerTickAtCamp: number;
  hpPerTickWorking: number;
  foodPerHpRecovered: number;
}

export const DEFAULT_RECOVERY: RecoveryRates = {
  hpPerTickAtCamp: 0.5,
  hpPerTickWorking: 0.2,
  foodPerHpRecovered: 0.5,
};

export interface RecoveryResult {
  character: Character;
  foodConsumed: number;
}

/**
 * Recovers HP over a number of ticks, consuming food from the camp's
 * resources. If there isn't enough food, recovery is capped by what's
 * available.
 */
export function applyRecovery(
  character: Character,
  ticks: number,
  availableFood: number,
  isWorking: boolean,
  rates: RecoveryRates = DEFAULT_RECOVERY,
): RecoveryResult {
  if (character.hp >= character.hpMax) {
    return { character, foodConsumed: 0 };
  }

  const hpPerTick = isWorking ? rates.hpPerTickWorking : rates.hpPerTickAtCamp;
  const desiredHpGain = Math.min(
    hpPerTick * ticks,
    character.hpMax - character.hp,
  );
  const desiredFoodCost = desiredHpGain * rates.foodPerHpRecovered;

  const foodConsumed = Math.min(desiredFoodCost, availableFood);
  const actualHpGain =
    rates.foodPerHpRecovered > 0
      ? foodConsumed / rates.foodPerHpRecovered
      : desiredHpGain;

  const newHp = Math.min(character.hpMax, character.hp + actualHpGain);

  return {
    character: {
      ...character,
      hp: newHp,
      status: newHp >= character.hpMax ? "idle" : character.status,
    },
    foodConsumed,
  };
}

export function spendFood(
  resources: ResourceAmounts,
  amount: number,
): ResourceAmounts {
  return { ...resources, food: Math.max(0, resources.food - amount) };
}
