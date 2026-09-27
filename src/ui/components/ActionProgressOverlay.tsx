import { useGameStore, MS_PER_TICK } from "../../game/state/store";
import { ProgressBar } from "./ProgressBar";

const ACTION_LABELS: Record<string, string> = {
  gather: "Gathering",
  clear_plot: "Clearing terrain",
  build: "Building",
  explore: "Exploring",
};

export function ActionProgressOverlay() {
  const currentAction = useGameStore((s) => s.currentAction);
  const nowMs = useGameStore((s) => s.nowMs);

  if (!currentAction) return null;

  const elapsedMs = nowMs - currentAction.startedAtMs;
  const totalMs = currentAction.durationTicks * MS_PER_TICK;

  const label =
    currentAction.type === "gather"
      ? currentAction.task.name
      : ACTION_LABELS[currentAction.type];

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-72 z-20">
      <div className="bg-panel/90 backdrop-blur-sm border border-panel-border rounded-lg px-4 py-3">
        <ProgressBar
          value={Math.min(elapsedMs, totalMs)}
          max={totalMs}
          colorClass="bg-accent"
          label={`${label}…`}
        />
      </div>
    </div>
  );
}
