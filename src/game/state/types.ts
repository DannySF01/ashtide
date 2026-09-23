import type { PlacedBuilding } from "../systems/buildings";
import type { PlotDefinition } from "../systems/terrain";

export interface ResourceAmounts {
  sticks: number;
  stones: number;
  food: number;
  water: number;
}

export interface Needs {
  // All 0 to 100
  hunger: number;
  thirst: number;
  energy: number;
}

export interface SkillLevels {
  gathering: number;
  crafting: number;
  hunting: number;
  fighting: number;
}

export interface Character {
  id: string;
  name: string;
  hp: number;
  hpMax: number;
  needs: Needs;
  skills: SkillLevels;
  xp: Record<keyof SkillLevels, number>;
  status: "idle" | "working" | "resting" | "injured";
}

export interface GameState {
  seed: string;
  day: number;
  hourOfDay: number; // 0 to 24
  resources: ResourceAmounts;
  characters: Character[];
  plots: PlotDefinition[];
  buildings: PlacedBuilding[];
}
