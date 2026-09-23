import type { ResourceAmounts } from "../state/types";
import type { PlacedBuilding, BuildingDefinition } from "./buildings";

/**
 * Computes total resource gains from all buildings that have an assigned
 * character and a production rate, over the given number of ticks.
 */
export function computeProduction(
  buildings: PlacedBuilding[],
  buildingDefs: Record<string, BuildingDefinition>,
  ticks: number,
): Partial<ResourceAmounts> {
  const gained: Partial<ResourceAmounts> = {};

  for (const building of buildings) {
    if (!building.assignedCharacterId) continue;

    const def = buildingDefs[building.buildingId];
    if (!def?.production) continue;

    const amount = def.production.amountPerTick * ticks;
    gained[def.production.resource] =
      (gained[def.production.resource] ?? 0) + amount;
  }

  return gained;
}

export function applyProduction(
  resources: ResourceAmounts,
  gained: Partial<ResourceAmounts>,
): ResourceAmounts {
  const updated = { ...resources };
  for (const [key, amount] of Object.entries(gained) as [
    keyof ResourceAmounts,
    number,
  ][]) {
    updated[key] += amount;
  }
  return updated;
}
