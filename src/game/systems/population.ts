import type { PlacedBuilding, BuildingDefinition } from "./buildings";

/** Base capacity available with no shelters built */
export const BASE_POPULATION_CAPACITY = 5;

export function computeMaxPopulation(
  buildings: PlacedBuilding[],
  buildingDefs: Record<string, BuildingDefinition>,
): number {
  return buildings.reduce((total, b) => {
    const def = buildingDefs[b.buildingId];
    return total + (def?.populationBonus ?? 0);
  }, BASE_POPULATION_CAPACITY);
}
