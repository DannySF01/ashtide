import { useGameStore } from "../../game/state/store";
import { loadBuildings } from "../../game/loader";

const buildingDefs = loadBuildings();

export function BuildingsPanel() {
  const buildings = useGameStore((s) => s.state.buildings);
  const characters = useGameStore((s) => s.state.characters);
  const assignToBuildingAction = useGameStore((s) => s.assignToBuildingAction);
  const unassignFromBuildingAction = useGameStore(
    (s) => s.unassignFromBuildingAction,
  );

  if (buildings.length === 0) return null;

  return (
    <div className="bg-panel border border-panel-border rounded-lg p-4">
      <div className="text-sm text-text-dim mb-3">Buildings</div>
      <div className="flex flex-col gap-2">
        {buildings.map((building) => {
          const def = buildingDefs[building.buildingId];
          const assignedCharacter = characters.find(
            (c) => c.id === building.assignedCharacterId,
          );
          const availableCharacter = characters.find(
            (c) => c.status === "idle",
          );

          return (
            <div
              key={building.id}
              className="flex items-center justify-between gap-3"
            >
              <div>
                <div className="text-sm text-text">
                  {def?.name ?? building.buildingId}
                </div>
                <div className="text-xs text-text-dim">
                  {assignedCharacter
                    ? `Worked by ${assignedCharacter.name}`
                    : "Unassigned"}
                </div>
              </div>
              {assignedCharacter ? (
                <button
                  onClick={() => unassignFromBuildingAction(building.id)}
                  className="px-3 py-1.5 text-sm rounded-md bg-panel-border text-text font-medium"
                >
                  Unassign
                </button>
              ) : (
                <button
                  disabled={!availableCharacter}
                  onClick={() =>
                    availableCharacter &&
                    assignToBuildingAction(building.id, availableCharacter.id)
                  }
                  className="px-3 py-1.5 text-sm rounded-md bg-accent text-bg font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Assign
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
