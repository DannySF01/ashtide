import { useGameStore } from "../../game/state/store";
import type { PlotDefinition } from "../../game/systems/terrain";

const STATE_LABELS: Record<PlotDefinition["state"], string> = {
  wild: "Overgrown",
  cleared: "Ready to build",
  built: "Built",
};

function PlotCard({
  plot,
  characterId,
  isBusy,
}: {
  plot: PlotDefinition;
  characterId: string;
  isBusy: boolean;
}) {
  const startClearPlot = useGameStore((s) => s.startClearPlot);

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
          disabled={isBusy}
          onClick={() => startClearPlot(characterId, plot.id)}
          className="px-3 py-1.5 text-sm rounded-md bg-accent text-bg font-medium disabled:opacity-40 disabled:cursor-not-allowed"
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
  const characters = useGameStore((s) => s.state.characters);
  const currentAction = useGameStore((s) => s.currentAction);
  const character = characters[0];

  if (!character) return null;

  return (
    <div className="bg-panel border border-panel-border rounded-lg p-4">
      <div className="text-sm text-text-dim mb-3">Terrain</div>
      <div className="flex flex-col gap-2">
        {plots.map((plot) => (
          <PlotCard
            key={plot.id}
            plot={plot}
            characterId={character.id}
            isBusy={currentAction !== null}
          />
        ))}
      </div>
    </div>
  );
}
