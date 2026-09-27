import { useGameStore } from "../../game/state/store";
import type { BuildingDefinition } from "../../game/systems/buildings";

export function subscribePlacingBuildingToStore(
  listener: (building: BuildingDefinition | null) => void,
): () => void {
  let last = useGameStore.getState().placingBuilding;
  listener(last);

  return useGameStore.subscribe((s) => {
    if (s.placingBuilding !== last) {
      last = s.placingBuilding;
      listener(last);
    }
  });
}

export function confirmPlacement(
  plotIds: string[],
  building: BuildingDefinition,
): void {
  useGameStore.getState().startBuild(plotIds, building);
  useGameStore.getState().cancelPlacingBuilding();
}
