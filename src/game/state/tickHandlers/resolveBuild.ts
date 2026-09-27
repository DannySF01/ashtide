import type { GameState } from "../types";
import type { CurrentAction } from "../currentAction";
import { markPlotBuilt } from "../../systems/terrain";
import type { LastOutcome } from "../lastOutcome";

export function resolveBuild(
  state: GameState,
  action: Extract<CurrentAction, { type: "build" }>,
): { state: GameState; lastOutcome: LastOutcome | null } {
  const plots = action.plotIds.map((id) =>
    state.plots.find((p) => p.id === id),
  );
  if (plots.some((p) => !p)) {
    return { state, lastOutcome: null };
  }

  const newBuilding = {
    id: `${action.building.id}-${action.plotIds[0]}`,
    buildingId: action.building.id,
    plotIds: action.plotIds,
  };

  return {
    state: {
      ...state,
      plots: state.plots.map((p) =>
        action.plotIds.includes(p.id) ? markPlotBuilt(p) : p,
      ),
      buildings: [...state.buildings, newBuilding],
    },
    lastOutcome: { message: `${action.building.name} built.`, type: "safe" },
  };
}
