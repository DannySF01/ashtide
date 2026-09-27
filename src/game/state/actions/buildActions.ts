import type { GameState } from "../types";
import type { BuildingDefinition } from "../../systems/buildings";
import { canAfford, spendResources } from "../../systems/buildings";
import { canBuildOn } from "../../systems/terrain";
import type { StartActionResult } from "./gatherActions";

const BUILD_DURATION_TICKS = 15;

export function startBuild(
  state: GameState,
  plotIds: string[],
  building: BuildingDefinition,
): StartActionResult | null {
  const plots = plotIds.map((id) => state.plots.find((p) => p.id === id));
  if (plots.some((p) => !p || !canBuildOn(p))) return null;
  if (!canAfford(building.cost, state.resources)) return null;

  return {
    currentAction: {
      type: "build",
      plotIds,
      building,
      durationTicks: BUILD_DURATION_TICKS,
      startedAtMs: Date.now(),
    },
    state: {
      ...state,
      resources: spendResources(state.resources, building.cost),
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
