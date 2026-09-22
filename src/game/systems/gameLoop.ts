import type { Character, GameState } from "../state/types";
import { advanceTime, isNight, TICKS_PER_DAY } from "./time";
import { applyNeedsDecay } from "./needs";
import { applyRecovery, spendFood } from "./recovery";
import {
  computeThreatLevel,
  rollForAttack,
  pickAttackTarget,
  computeFoodStolen,
} from "./threat";
import { resolveCombat } from "./combat";
import type { Enemy } from "./combat";
import { SeededRandom } from "../rng/seededRandom";

export interface GameLoopOptions {
  defenseLevel: number;
  attackCheckIntervalTicks: number; // ticks between wildlife attacks
  pickWildlifeEnemy: (rng: SeededRandom) => Enemy;
}

export interface GameLoopResult {
  state: GameState;
  attackHappened: boolean;
  attackDetails?: {
    targetId: string;
    enemyName: string;
    enemyDefeated: boolean;
    characterDefeated: boolean;
    foodStolen: number;
  };
}

interface RecoveryPassResult {
  characters: Character[];
  totalFoodConsumed: number;
}

/**
 * Decays needs for everyone, then recovers HP for anyone below max, spending
 * food from a shared pool. Characters are processed in order.
 */
function applyNeedsAndRecovery(
  characters: Character[],
  ticks: number,
  availableFood: number,
): RecoveryPassResult {
  return characters.reduce<RecoveryPassResult>(
    (acc, character) => {
      const decayed = applyNeedsDecay(character, ticks);

      if (decayed.hp >= decayed.hpMax) {
        return {
          characters: [...acc.characters, decayed],
          totalFoodConsumed: acc.totalFoodConsumed,
        };
      }

      const remainingFood = availableFood - acc.totalFoodConsumed;
      const isWorking = decayed.status === "working";
      const { character: recovered, foodConsumed } = applyRecovery(
        decayed,
        ticks,
        remainingFood,
        isWorking,
      );

      return {
        characters: [...acc.characters, recovered],
        totalFoodConsumed: acc.totalFoodConsumed + foodConsumed,
      };
    },
    { characters: [], totalFoodConsumed: 0 },
  );
}

/**
 * Advances the whole game world by a number of ticks:
 * 1. Advances the clock.
 * 2. Decays every character's needs and recovers HP.
 * 3. Once per attackCheckIntervalTicks worth of elapsed time, rolls for a
 *    wildlife attack on the base.
 *
 */
export function advanceGameLoop(
  state: GameState,
  ticks: number,
  rng: SeededRandom,
  options: GameLoopOptions,
): GameLoopResult {
  const timeResult = advanceTime(
    { day: state.day, hourOfDay: state.hourOfDay },
    ticks,
  );

  const { characters: recoveredCharacters, totalFoodConsumed } =
    applyNeedsAndRecovery(state.characters, ticks, state.resources.food);

  let characters = recoveredCharacters;
  let resources = spendFood(state.resources, totalFoodConsumed);

  let attackHappened = false;
  let attackDetails: GameLoopResult["attackDetails"];

  const shouldCheckAttack = ticks >= options.attackCheckIntervalTicks;
  if (shouldCheckAttack) {
    const threatFactors = {
      day: timeResult.time.day,
      foodStored: resources.food,
      populationCount: characters.length,
      defenseLevel: options.defenseLevel,
    };

    const { attackOccurred } = rollForAttack(threatFactors, rng);

    if (attackOccurred) {
      attackHappened = true;
      const target = pickAttackTarget(characters, rng);
      const enemy = options.pickWildlifeEnemy(rng);
      const combatResult = resolveCombat(target, enemy, rng);
      const foodStolen = computeFoodStolen(resources, enemy, rng);

      resources = spendFood(resources, foodStolen);
      characters = characters.map((c) =>
        c.id === target.id ? combatResult.character : c,
      );

      attackDetails = {
        targetId: target.id,
        enemyName: enemy.name,
        enemyDefeated: combatResult.enemyDefeated,
        characterDefeated: combatResult.characterDefeated,
        foodStolen,
      };
    }
  }

  return {
    state: {
      ...state,
      day: timeResult.time.day,
      hourOfDay: timeResult.time.hourOfDay,
      resources,
      characters,
    },
    attackHappened,
    attackDetails,
  };
}

export { isNight, TICKS_PER_DAY, computeThreatLevel };
