import { useGameStore } from "../../game/state/store";
import type { ResourceAmounts } from "../../game/state/types";

const RESOURCE_LABELS: Record<keyof ResourceAmounts, string> = {
  sticks: "Sticks",
  stones: "Stones",
  food: "Food",
  water: "Water",
};

export function ResourcesBar() {
  const resources = useGameStore((s) => s.state.resources);

  return (
    <div className="flex gap-3 bg-panel border border-panel-border rounded-lg px-4 py-2.5 mb-4">
      {(Object.keys(RESOURCE_LABELS) as (keyof ResourceAmounts)[]).map(
        (key) => (
          <div
            key={key}
            className="flex items-center gap-1.5 text-sm text-text-dim"
          >
            {RESOURCE_LABELS[key]}:{" "}
            <strong className="text-text font-semibold">
              {Math.floor(resources[key])}
            </strong>
          </div>
        ),
      )}
    </div>
  );
}
