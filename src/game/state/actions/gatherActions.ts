import type { GameState } from "../types";
import type { TaskDefinition } from "../../systems/tasks";
import type { Enemy } from "../../systems/combat";
import type { SeededRandom } from "../../rng/seededRandom";
import type { CurrentAction } from "../currentAction";

export interface StartActionResult {
  currentAction: CurrentAction;
  state: GameState;
}

export function startGatherTask(
  state: GameState,
  characterId: string,
  task: TaskDefinition,
  pickEnemy: ((rng: SeededRandom) => Enemy) | undefined,
): StartActionResult | null {
  const character = state.characters.find((c) => c.id === characterId);
  if (!character || character.status !== "idle") return null;

  return {
    currentAction: {
      type: "gather",
      characterId,
      task,
      pickEnemy,
      durationTicks: task.durationTicks,
      startedAtMs: Date.now(),
    },
    state: {
      ...state,
      characters: state.characters.map((c) =>
        c.id === characterId ? { ...c, status: "working" } : c,
      ),
    },
  };
}
