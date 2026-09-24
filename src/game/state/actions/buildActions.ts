import type { GameState } from "../types";
import type { BuildingDefinition } from "../../systems/buildings";
import { canAfford, spendResources } from "../../systems/buildings";
import { canBuildOn } from "../../systems/terrain";
import type { StartActionResult } from "./gatherActions";

const BUILD_DURATION_TICKS = 15;

export function startBuild(
  state: GameState,
  characterId: string,
  plotId: string,
  building: BuildingDefinition,
): StartActionResult | null {
  const character = state.characters.find((c) => c.id === characterId);
  const plot = state.plots.find((p) => p.id === plotId);
  if (!character || character.status !== "idle") return null;
  if (!plot || !canBuildOn(plot)) return null;
  if (!canAfford(building.cost, state.resources)) return null;

  return {
    currentAction: {
      type: "build",
      characterId,
      plotId,
      building,
      durationTicks: BUILD_DURATION_TICKS,
      startedAtMs: Date.now(),
    },
    state: {
      ...state,
      resources: spendResources(state.resources, building.cost),
      characters: state.characters.map((c) =>
        c.id === characterId ? { ...c, status: "working" } : c,
      ),
    },
  };
}

export function assignToBuilding(
  state: GameState,
  buildingInstanceId: string,
  characterId: string,
): GameState | null {
  const character = state.characters.find((c) => c.id === characterId);
  if (!character || character.status !== "idle") return null;

  return {
    ...state,
    buildings: state.buildings.map((b) =>
      b.id === buildingInstanceId
        ? { ...b, assignedCharacterId: characterId }
        : b,
    ),
    characters: state.characters.map((c) =>
      c.id === characterId ? { ...c, status: "working" } : c,
    ),
  };
}

export function unassignFromBuilding(
  state: GameState,
  buildingInstanceId: string,
): GameState | null {
  const building = state.buildings.find((b) => b.id === buildingInstanceId);
  if (!building?.assignedCharacterId) return null;

  const characterId = building.assignedCharacterId;

  return {
    ...state,
    buildings: state.buildings.map((b) =>
      b.id === buildingInstanceId
        ? { ...b, assignedCharacterId: undefined }
        : b,
    ),
    characters: state.characters.map((c) =>
      c.id === characterId ? { ...c, status: "idle" } : c,
    ),
  };
}
