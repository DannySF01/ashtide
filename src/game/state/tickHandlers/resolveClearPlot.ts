import type { GameState } from "../types";
import type { CurrentAction } from "../currentAction";
import type { SeededRandom } from "../../rng/seededRandom";
import { clearPlot } from "../../systems/terrain";
import type { LastOutcome } from "../lastOutcome";

export function resolveClearPlot(
  state: GameState,
  action: Extract<CurrentAction, { type: "clear_plot" }>,
  rng: SeededRandom,
): { state: GameState; lastOutcome: LastOutcome | null } {
  const plot = state.plots.find((p) => p.id === action.plotId);
  if (!plot) {
    return { state, lastOutcome: null };
  }

  const result = clearPlot(plot, state.resources, rng, undefined);

  return {
    state: {
      ...state,
      resources: result.resources,
      plots: state.plots.map((p) => (p.id === action.plotId ? result.plot : p)),
      characters: state.characters.map((c) =>
        c.id === action.characterId ? { ...c, status: "idle" } : c,
      ),
    },
    lastOutcome: { message: "Plot cleared.", type: "safe" },
  };
}
