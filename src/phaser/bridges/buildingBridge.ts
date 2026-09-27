import { useGameStore } from "../../game/state/store";
import type { PlacedBuilding } from "../../game/systems/buildings";

export function subscribeBuildingsToStore(
  listener: (buildings: PlacedBuilding[]) => void,
): () => void {
  let last = useGameStore.getState().state.buildings;
  listener(last);

  return useGameStore.subscribe((s) => {
    if (s.state.buildings !== last) {
      last = s.state.buildings;
      listener(last);
    }
  });
}
