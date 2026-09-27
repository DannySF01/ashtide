import { useGameStore } from "../../game/state/store";
import type { PlotDefinition } from "../../game/systems/terrain";

export function subscribePlotsToStore(
  listener: (plots: PlotDefinition[]) => void,
): () => void {
  let lastPlots = useGameStore.getState().state.plots;
  listener(lastPlots);

  return useGameStore.subscribe((s) => {
    if (s.state.plots !== lastPlots) {
      lastPlots = s.state.plots;
      listener(lastPlots);
    }
  });
}

export function requestClearPlotFromScene(plotId: string): void {
  useGameStore.getState().requestClearConfirmation(plotId);
}
