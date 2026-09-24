import type { TaskDefinition } from "../systems/tasks";
import type { Enemy } from "../systems/combat";
import type { BuildingDefinition } from "../systems/buildings";
import type { SeededRandom } from "../rng/seededRandom";

export type CurrentAction =
  | {
      type: "gather";
      characterId: string;
      task: TaskDefinition;
      pickEnemy?: (rng: SeededRandom) => Enemy;
      durationTicks: number;
      startedAtMs: number;
    }
  | {
      type: "clear_plot";
      characterId: string;
      plotId: string;
      durationTicks: number;
      startedAtMs: number;
    }
  | {
      type: "build";
      characterId: string;
      plotId: string;
      building: BuildingDefinition;
      durationTicks: number;
      startedAtMs: number;
    };
