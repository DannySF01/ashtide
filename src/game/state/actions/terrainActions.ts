import type { GameState } from "../types";
import type { StartActionResult } from "./gatherActions";

export function startClearPlot(
  state: GameState,
  characterId: string,
  plotId: string,
): StartActionResult | null {
  const character = state.characters.find((c) => c.id === characterId);
  const plot = state.plots.find((p) => p.id === plotId);
  if (
    !character ||
    character.status !== "idle" ||
    !plot ||
    plot.state !== "wild"
  )
    return null;

  return {
    currentAction: {
      type: "clear_plot",
      characterId,
      plotId,
      durationTicks: plot.clearing.durationTicks,
      startedAtMs: Date.now(),
    },
    state: {
      ...state,
      characters: state.characters.map((c) =>
        c.id === characterId ? { ...c, status: "working" } : c,
      ),
    },
  };
}
