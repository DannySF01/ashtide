import type { GameState } from "./types";
import type { LastOutcome } from "./lastOutcome";
import type { SeededRandom } from "../rng/seededRandom";
import { advanceGameLoop } from "../systems/gameLoop";
import { computeProduction, applyProduction } from "../systems/production";
import { loadEnemies, loadBuildings } from "../loader";
import { resolveGather } from "./tickHandlers/resolveGather";
import { resolveClearPlot } from "./tickHandlers/resolveClearPlot";
import { resolveBuild } from "./tickHandlers/resolveBuild";
import type { CurrentAction } from "./currentAction";

export const MS_PER_TICK = 1000;

const enemiesList = Object.values(loadEnemies());
function pickWildlifeEnemy(rng: SeededRandom) {
  return enemiesList[rng.nextInt(0, enemiesList.length - 1)];
}

const buildingDefs = loadBuildings();

const GAME_LOOP_OPTIONS = {
  defenseLevel: 0,
  attackCheckIntervalTicks: 6 * 24,
  pickWildlifeEnemy,
};

export interface GameClockTickResult {
  state: GameState;
  currentAction: CurrentAction | null;
  lastLoopMs: number;
  lastOutcome?: LastOutcome;
}

export function runGameClockTick(
  state: GameState,
  currentAction: CurrentAction | null,
  rng: SeededRandom,
  nowMs: number,
  lastLoopMs: number,
): GameClockTickResult {
  const elapsedTicks = Math.floor((nowMs - lastLoopMs) / MS_PER_TICK);
  let loopState = state;
  let loopOutcome: LastOutcome | undefined;
  let newLastLoopMs = lastLoopMs;

  if (elapsedTicks > 0) {
    const loopResult = advanceGameLoop(
      state,
      elapsedTicks,
      rng,
      GAME_LOOP_OPTIONS,
    );
    loopState = loopResult.state;
    newLastLoopMs = lastLoopMs + elapsedTicks * MS_PER_TICK;

    const producedGains = computeProduction(
      loopState.buildings,
      buildingDefs,
      elapsedTicks,
    );
    loopState = {
      ...loopState,
      resources: applyProduction(loopState.resources, producedGains),
    };

    if (loopResult.attackHappened && loopResult.attackDetails) {
      const d = loopResult.attackDetails;
      loopOutcome = {
        message: d.characterDefeated
          ? `A ${d.enemyName} attacked in the night — someone was knocked out!`
          : `A ${d.enemyName} raided the camp. ${d.foodStolen > 0 ? `Lost ${Math.floor(d.foodStolen)} food.` : ""}`,
        type: "encounter",
      };
    }
  }

  if (!currentAction) {
    return {
      state: loopState,
      currentAction: null,
      lastLoopMs: newLastLoopMs,
      lastOutcome: loopOutcome,
    };
  }

  const actionElapsedTicks = (nowMs - currentAction.startedAtMs) / MS_PER_TICK;
  if (actionElapsedTicks < currentAction.durationTicks) {
    return {
      state: loopState,
      currentAction,
      lastLoopMs: newLastLoopMs,
      lastOutcome: loopOutcome,
    };
  }

  if (currentAction.type === "gather") {
    const { state: resolvedState, lastOutcome } = resolveGather(
      loopState,
      currentAction,
      rng,
    );
    return {
      state: resolvedState,
      currentAction: null,
      lastLoopMs: newLastLoopMs,
      lastOutcome: lastOutcome ?? undefined,
    };
  }

  if (currentAction.type === "clear_plot") {
    const { state: resolvedState, lastOutcome } = resolveClearPlot(
      loopState,
      currentAction,
      rng,
    );
    return {
      state: resolvedState,
      currentAction: null,
      lastLoopMs: newLastLoopMs,
      lastOutcome: lastOutcome ?? undefined,
    };
  }

  const { state: resolvedState, lastOutcome } = resolveBuild(
    loopState,
    currentAction,
  );
  return {
    state: resolvedState,
    currentAction: null,
    lastLoopMs: newLastLoopMs,
    lastOutcome: lastOutcome ?? undefined,
  };
}
