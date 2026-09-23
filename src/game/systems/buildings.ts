import type { ResourceAmounts } from "../state/types";

export interface ProductionRate {
  resource: keyof ResourceAmounts;
  amountPerTick: number;
}

export interface BuildingDefinition {
  id: string;
  name: string;
  cost: Partial<ResourceAmounts>;
  production?: ProductionRate;
  defenseBonus?: number;
}

export interface PlacedBuilding {
  id: string;
  buildingId: string;
  plotId: string;
  assignedCharacterId?: string;
}

export function canAfford(
  cost: Partial<ResourceAmounts>,
  resources: ResourceAmounts,
): boolean {
  return (Object.entries(cost) as [keyof ResourceAmounts, number][]).every(
    ([key, amount]) => resources[key] >= amount,
  );
}

export function spendResources(
  resources: ResourceAmounts,
  cost: Partial<ResourceAmounts>,
): ResourceAmounts {
  const updated = { ...resources };
  for (const [key, amount] of Object.entries(cost) as [
    keyof ResourceAmounts,
    number,
  ][]) {
    updated[key] = Math.max(0, updated[key] - amount);
  }
  return updated;
}
