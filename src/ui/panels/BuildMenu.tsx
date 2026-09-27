import { useGameStore } from "../../game/state/store";
import { loadBuildings } from "../../game/loader";
import { canAfford } from "../../game/systems/buildings";

const buildings = Object.values(loadBuildings());

const BUILDING_ICONS: Record<string, string> = {
  lumbermill: "🪚",
  shelter: "🛖",
};

export function BuildMenu() {
  const resources = useGameStore((s) => s.state.resources);
  const currentAction = useGameStore((s) => s.currentAction);
  const startPlacingBuilding = useGameStore((s) => s.startPlacingBuilding);

  return (
    <div className="bg-panel/90 backdrop-blur-sm border border-panel-border rounded-lg p-3 w-72 flex flex-col gap-1">
      {buildings.map((building) => {
        const affordable =
          currentAction === null && canAfford(building.cost, resources);
        const costText = Object.entries(building.cost)
          .map(([key, amount]) => `${amount} ${key}`)
          .join(", ");

        return (
          <button
            key={building.id}
            disabled={!affordable}
            onClick={() => startPlacingBuilding(building)}
            className="flex items-center gap-3 px-2 py-2.5 rounded-md text-left hover:bg-panel-border disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <div className="w-10 h-10 rounded-md bg-panel-border flex items-center justify-center text-lg shrink-0">
              {BUILDING_ICONS[building.id] ?? "🏠"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-text font-medium">
                {building.name}
              </div>
              <div className="text-xs text-text-dim truncate">
                {building.description}
              </div>
            </div>
            <div className="text-xs text-text-dim shrink-0">{costText}</div>
          </button>
        );
      })}
    </div>
  );
}
