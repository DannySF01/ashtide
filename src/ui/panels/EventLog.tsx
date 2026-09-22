import { useGameStore } from "../../game/state/store";

export function EventLog() {
  const lastOutcome = useGameStore((s) => s.lastOutcome);

  if (!lastOutcome) return null;

  const colorClass =
    lastOutcome.type === "encounter" ? "text-danger" : "text-text-dim";

  return (
    <div className="bg-panel border border-panel-border rounded-lg p-3 text-sm">
      <span className={colorClass}>{lastOutcome.message}</span>
    </div>
  );
}
