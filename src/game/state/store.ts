import { create } from "zustand";
import type { GameState } from "./types";
import { createInitialState } from "./initialState";
import { SeededRandom } from "../rng/seededRandom";
import { runTask } from "../systems/taskOrchestrator";
import { applyLevelUps } from "../systems/skills";
import { isNight } from "../systems/time";
import type { TaskDefinition } from "../systems/tasks";
import type { Enemy } from "../systems/combat";
import { loadEnemies } from "../loader";
import { advanceGameLoop } from "../systems/gameLoop";
import { clearPlot } from "../systems/terrain";

/** How much real time one game tick takes. Tune this for pacing. */
export const MS_PER_TICK = 1000;

export interface ActiveTask {
  characterId: string;
  task: TaskDefinition;
  pickEnemy?: (rng: SeededRandom) => Enemy;
  startedAtMs: number;
}

export interface LastOutcome {
  message: string;
  type: "safe" | "encounter";
}

interface GameStore {
  state: GameState;
  rng: SeededRandom;
  activeTask: ActiveTask | null;
  lastOutcome: LastOutcome | null;
  nowMs: number;
  lastLoopMs: number;
  reset: (seed: string) => void;
  startTask: (
    characterId: string,
    task: TaskDefinition,
    pickEnemy?: (rng: SeededRandom) => Enemy,
  ) => void;
  tick: (nowMs: number) => void;
  clearPlotAction: (plotId: string) => void;
}

function describeOutcome(
  outcome: ReturnType<typeof runTask>,
  taskName: string,
): LastOutcome | null {
  if (outcome.type === "safe") {
    return { message: `${taskName}: done.`, type: "safe" };
  }
  if (outcome.type === "encounter") {
    const result = outcome.characterDefeated
      ? `Attacked by ${outcome.enemy.name} — knocked out!`
      : outcome.enemyDefeated
        ? `Fought off a ${outcome.enemy.name}.`
        : `Escaped a ${outcome.enemy.name}, still around.`;
    return { message: result, type: "encounter" };
  }
  return null;
}

const enemiesList = Object.values(loadEnemies());
function pickWildlifeEnemy(rng: SeededRandom) {
  return enemiesList[rng.nextInt(0, enemiesList.length - 1)];
}

const GAME_LOOP_OPTIONS = {
  defenseLevel: 0,
  attackCheckIntervalTicks: 6 * 24, // once per in-game day
  pickWildlifeEnemy,
};

export const useGameStore = create<GameStore>((set, get) => ({
  state: createInitialState("ashtide-default"),
  rng: new SeededRandom("ashtide-default"),
  activeTask: null,
  lastOutcome: null,
  nowMs: Date.now(),
  lastLoopMs: Date.now(),

  reset: (seed: string) =>
    set({
      state: createInitialState(seed),
      rng: new SeededRandom(seed),
      activeTask: null,
      lastOutcome: null,
      nowMs: Date.now(),
      lastLoopMs: Date.now(),
    }),

  startTask: (characterId, task, pickEnemy) => {
    const { state, activeTask } = get();
    if (activeTask) return; // one task at a time for the MVP

    const character = state.characters.find((c) => c.id === characterId);
    if (!character || character.status !== "idle") return;

    set({
      activeTask: { characterId, task, pickEnemy, startedAtMs: Date.now() },
      state: {
        ...state,
        characters: state.characters.map((c) =>
          c.id === characterId ? { ...c, status: "working" } : c,
        ),
      },
    });
  },

  tick: (nowMs: number) => {
    const { activeTask, state, rng, lastLoopMs } = get();

    // 1. Advance the passive game loop (needs decay, recovery, threat).
    const elapsedTicks = Math.floor((nowMs - lastLoopMs) / MS_PER_TICK);
    let loopState = state;
    let loopOutcome: LastOutcome | null = null;
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

    // 2. Handle the active task, if any, using the loop-updated state.
    if (!activeTask) {
      set({
        nowMs,
        lastLoopMs: newLastLoopMs,
        state: loopState,
        ...(loopOutcome ? { lastOutcome: loopOutcome } : {}),
      });
      return;
    }

    const taskElapsedTicks = (nowMs - activeTask.startedAtMs) / MS_PER_TICK;
    if (taskElapsedTicks < activeTask.task.durationTicks) {
      set({
        nowMs,
        lastLoopMs: newLastLoopMs,
        state: loopState,
        ...(loopOutcome ? { lastOutcome: loopOutcome } : {}),
      });
      return;
    }

    const outcome = runTask({
      state: loopState,
      characterId: activeTask.characterId,
      task: activeTask.task,
      rng,
      riskModifiers: { isNight: isNight(loopState.hourOfDay), threatLevel: 20 },
      pickEnemy: activeTask.pickEnemy,
      skipStartCheck: true,
    });

    if (outcome.type === "blocked") {
      set({
        activeTask: null,
        nowMs,
        lastLoopMs: newLastLoopMs,
        state: {
          ...loopState,
          characters: loopState.characters.map((c) =>
            c.id === activeTask.characterId ? { ...c, status: "idle" } : c,
          ),
        },
      });
      return;
    }

    const { character: leveledCharacter } = applyLevelUps(outcome.character);
    const finalCharacter = { ...leveledCharacter, status: "idle" as const };

    set({
      activeTask: null,
      nowMs,
      lastLoopMs: newLastLoopMs,
      lastOutcome: describeOutcome(outcome, activeTask.task.name),
      state: {
        ...loopState,
        resources: outcome.resources,
        characters: loopState.characters.map((c) =>
          c.id === activeTask.characterId ? finalCharacter : c,
        ),
      },
    });
  },

  clearPlotAction: (plotId: string) => {
    const { state, rng } = get();
    const plot = state.plots.find((p) => p.id === plotId);
    if (!plot || plot.state !== "wild") return;

    try {
      const result = clearPlot(plot, state.resources, rng, undefined);
      set({
        state: {
          ...state,
          resources: result.resources,
          plots: state.plots.map((p) => (p.id === plotId ? result.plot : p)),
        },
      });
    } catch {
      // tool requirement not met, silently ignore for now
    }
  },
}));
