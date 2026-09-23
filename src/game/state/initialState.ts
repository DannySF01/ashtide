import { loadPlots } from "../loader";
import type { GameState, Character } from "./types";

function createInitialCharacter(): Character {
  return {
    id: "survivor-1",
    name: "Danny",
    hp: 20,
    hpMax: 20,
    needs: {
      hunger: 70,
      thirst: 70,
      energy: 100,
    },
    skills: {
      gathering: 1,
      crafting: 1,
      hunting: 1,
      fighting: 1,
    },
    xp: {
      gathering: 0,
      crafting: 0,
      hunting: 0,
      fighting: 0,
    },
    status: "idle",
  };
}

export function createInitialState(seed: string): GameState {
  return {
    seed,
    day: 1,
    hourOfDay: 7,
    resources: {
      sticks: 0,
      stones: 0,
      food: 0,
      water: 0,
    },
    characters: [createInitialCharacter()],
    plots: Object.values(loadPlots()),
  };
}
