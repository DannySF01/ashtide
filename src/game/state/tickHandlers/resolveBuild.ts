import type { GameState } from "../types";
import type { CurrentAction } from "../currentAction";
import { markPlotBuilt } from "../../systems/terrain";
import type { LastOutcome } from "../lastOutcome";

export function resolveBuild(
  state: GameState,
  action: Extract<CurrentAction, { type: "build" }>,
): { state: GameState; lastOutcome: LastOutcome | null } {
  const plot = state.plots.find((p) => p.id === action.plotId);
  if (!plot) {
    return { state, lastOutcome: null };
  }

  const builtPlot = markPlotBuilt(plot);
  const newBuilding = {
    id: `${action.building.id}-${action.plotId}`,
    buildingId: action.building.id,
    plotId: action.plotId,
  };

  return {
    state: {
      ...state,
      plots: state.plots.map((p) => (p.id === action.plotId ? builtPlot : p)),
      buildings: [...state.buildings, newBuilding],
      characters: state.characters.map((c) =>
        c.id === action.characterId ? { ...c, status: "idle" } : c,
      ),
    },
    lastOutcome: { message: `${action.building.name} built.`, type: "safe" },
  };
}
