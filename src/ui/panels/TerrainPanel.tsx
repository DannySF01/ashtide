import { useGameStore } from "../../game/state/store";
import type { PlotDefinition } from "../../game/systems/terrain";

const STATE_LABELS: Record<PlotDefinition["state"], string> = {
  wild: "Overgrown",
  cleared: "Ready to build",
  built: "Built",
};

function PlotCard({ plot }: { plot: PlotDefinition }) {
  const clearPlotAction = useGameStore((s) => s.startClearPlot);

  return (
    <div className="bg-panel border border-panel-border rounded-lg p-3 flex items-center justify-between gap-3">
      <div>
        <div className="text-sm text-text">{STATE_LABELS[plot.state]}</div>
        {plot.state === "wild" && (
          <div className="text-xs text-text-dim">
            {plot.clearing.durationTicks * 10} min · -{plot.clearing.energyCost}{" "}
            energy
            {plot.clearing.toolRequired
              ? ` · needs ${plot.clearing.toolRequired}`
              : ""}
          </div>
        )}
      </div>

      {plot.state === "wild" && !plot.clearing.toolRequired && (
        <button
          onClick={() => clearPlotAction("survivor-1", plot.id)}
          className="px-3 py-1.5 text-sm rounded-md bg-accent text-bg font-medium"
        >
          Clear
        </button>
      )}
      {plot.state === "cleared" && (
        <span className="text-xs text-ok">Ready</span>
      )}
    </div>
  );
}

export function TerrainPanel() {
  const plots = useGameStore((s) => s.state.plots);

  return (
    <div className="bg-panel border border-panel-border rounded-lg p-4">
      <div className="text-sm text-text-dim mb-3">Terrain</div>
      <div className="flex flex-col gap-2">
        {plots.map((plot) => (
          <PlotCard key={plot.id} plot={plot} />
        ))}
      </div>
    </div>
  );
}
