import { useGameStore } from "../../game/state/store";
import { loadBuildings } from "../../game/loader";
import { canAfford } from "../../game/systems/buildings";
import { canBuildOn } from "../../game/systems/terrain";

const buildings = Object.values(loadBuildings());

export function BuildMenu() {
  const plots = useGameStore((s) => s.state.plots);
  const resources = useGameStore((s) => s.state.resources);
  const characters = useGameStore((s) => s.state.characters);
  const currentAction = useGameStore((s) => s.currentAction);
  const startBuild = useGameStore((s) => s.startBuild);

  const character = characters[0];
  const buildablePlot = plots.find((p) => canBuildOn(p));

  if (!character) return null;

  if (!buildablePlot) {
    return (
      <div className="bg-panel border border-panel-border rounded-lg p-4 text-sm text-text-dim">
        Clear some terrain first to unlock building.
      </div>
    );
  }

  return (
    <div className="bg-panel border border-panel-border rounded-lg p-4">
      <div className="text-sm text-text-dim mb-3">Build</div>
      <div className="flex flex-col gap-2">
        {buildings.map((building) => {
          const affordable =
            canAfford(building.cost, resources) && currentAction === null;
          const costText = Object.entries(building.cost)
            .map(([key, amount]) => `${amount} ${key}`)
            .join(", ");

          return (
            <div
              key={building.id}
              className="flex items-center justify-between gap-3"
            >
              <div>
                <div className="text-sm text-text">{building.name}</div>
                <div className="text-xs text-text-dim">{costText}</div>
              </div>
              <button
                disabled={!affordable}
                onClick={() =>
                  startBuild(character.id, buildablePlot.id, building)
                }
                className="px-3 py-1.5 text-sm rounded-md bg-accent text-bg font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Build
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
