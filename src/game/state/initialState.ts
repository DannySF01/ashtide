import { loadMapLocations, loadPlots } from "../loader";
import type { GameState, Character } from "./types";

function createCharacter(id: string, name: string): Character {
  return {
    id,
    name,
    hp: 20,
    hpMax: 20,
    needs: {
      hunger: 100,
      thirst: 100,
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
      sticks: 200,
      stones: 200,
      food: 0,
      water: 0,
    },
    characters: [
      createCharacter("survivor-1", "Danny"),
      createCharacter("survivor-2", "Alex"),
      createCharacter("survivor-3", "Sam"),
      createCharacter("survivor-4", "Jordan"),
      createCharacter("survivor-5", "John"),
      createCharacter("survivor-6", "Bob"),
    ],
    plots: Object.values(loadPlots()),
    buildings: [],
    mapLocations: Object.values(loadMapLocations()),
  };
}
