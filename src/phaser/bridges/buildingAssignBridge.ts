import { useGameStore } from "../../game/state/store";
import type { PlacedBuilding } from "../../game/systems/buildings";

export function getFirstIdleCharacterId(): string | null {
  const character = useGameStore
    .getState()
    .state.characters.find((c) => c.status === "idle");
  return character?.id ?? null;
}

export function toggleWorkerOnBuilding(building: PlacedBuilding): void {
  const store = useGameStore.getState();

  if (building.assignedCharacterId) {
    store.unassignFromBuildingAction(building.id);
    return;
  }

  const characterId = getFirstIdleCharacterId();
  if (!characterId) return;
  store.assignToBuildingAction(building.id, characterId);
}
