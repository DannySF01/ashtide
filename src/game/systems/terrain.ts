import type { ResourceAmounts } from "../state/types";
import { SeededRandom } from "../rng/seededRandom";

export type PlotState = "wild" | "clearing" | "cleared" | "built";

export interface PlotDefinition {
  id: string;
  state: PlotState;
  clearing: {
    durationTicks: number;
    energyCost: number;
    toolRequired?: string;
  };
  riskBaseChance: number;
  resourceRewardRange: Partial<Record<keyof ResourceAmounts, [number, number]>>;
}

export interface ClearPlotResult {
  plot: PlotDefinition;
  resources: ResourceAmounts;
  gained: Partial<ResourceAmounts>;
}

/** Advances a wild plot to "clearing" state's completion: becomes "cleared". */
export function clearPlot(
  plot: PlotDefinition,
  resources: ResourceAmounts,
  rng: SeededRandom,
  characterToolLevel: string | undefined,
): ClearPlotResult {
  if (plot.state !== "wild") {
    throw new Error(
      `Cannot clear plot "${plot.id}": not in wild state (currently ${plot.state})`,
    );
  }

  if (
    plot.clearing.toolRequired &&
    plot.clearing.toolRequired !== characterToolLevel
  ) {
    throw new Error(
      `Plot "${plot.id}" requires tool "${plot.clearing.toolRequired}"`,
    );
  }

  const gained: Partial<ResourceAmounts> = {};
  for (const [key, [min, max]] of Object.entries(plot.resourceRewardRange) as [
    keyof ResourceAmounts,
    [number, number],
  ][]) {
    gained[key] = rng.nextInt(min, max);
  }

  const updatedResources: ResourceAmounts = { ...resources };
  for (const [key, amount] of Object.entries(gained) as [
    keyof ResourceAmounts,
    number,
  ][]) {
    updatedResources[key] += amount;
  }

  return {
    plot: { ...plot, state: "cleared" },
    resources: updatedResources,
    gained,
  };
}

export function markPlotBuilt(plot: PlotDefinition): PlotDefinition {
  if (plot.state !== "cleared") {
    throw new Error(
      `Cannot build on plot "${plot.id}": not leveled (currently ${plot.state})`,
    );
  }
  return { ...plot, state: "built" };
}

export function canBuildOn(plot: PlotDefinition): boolean {
  return plot.state === "cleared";
}
