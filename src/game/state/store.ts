import { create } from "zustand";
import type { GameState } from "./types";
import { createInitialState } from "./initialState";
import { SeededRandom } from "../rng/seededRandom";
import { runTask } from "../systems/taskOrchestrator";
import { applyLevelUps } from "../systems/skills";
import { isNight } from "../systems/time";
import type { TaskDefinition } from "../systems/tasks";
import type { Enemy } from "../systems/combat";

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
  reset: (seed: string) => void;
  startTask: (
    characterId: string,
    task: TaskDefinition,
    pickEnemy?: (rng: SeededRandom) => Enemy,
  ) => void;
  tick: (nowMs: number) => void;
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

export const useGameStore = create<GameStore>((set, get) => ({
  state: createInitialState("ashtide-default"),
  rng: new SeededRandom("ashtide-default"),
  activeTask: null,
  lastOutcome: null,
  nowMs: Date.now(),

  reset: (seed: string) =>
    set({
      state: createInitialState(seed),
      rng: new SeededRandom(seed),
      activeTask: null,
      lastOutcome: null,
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

  /** Call regularly (e.g. from a setInterval) with the current timestamp. */
  tick: (nowMs: number) => {
    const { activeTask, state, rng } = get();

    if (!activeTask) {
      set({ nowMs });
      return;
    }

    const elapsedTicks = (nowMs - activeTask.startedAtMs) / MS_PER_TICK;
    if (elapsedTicks < activeTask.task.durationTicks) {
      set({ nowMs });
      return;
    }
    const outcome = runTask({
      state,
      characterId: activeTask.characterId,
      task: activeTask.task,
      rng,
      riskModifiers: { isNight: isNight(state.hourOfDay), threatLevel: 20 },
      pickEnemy: activeTask.pickEnemy,
    });

    if (outcome.type === "blocked") {
      set({
        activeTask: null,
        nowMs,
        state: {
          ...state,
          characters: state.characters.map((c) =>
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
      lastOutcome: describeOutcome(outcome, activeTask.task.name),
      state: {
        ...state,
        resources: outcome.resources,
        characters: state.characters.map((c) =>
          c.id === activeTask.characterId ? finalCharacter : c,
        ),
      },
    });
  },
}));
