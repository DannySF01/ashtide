import { IsoGroundCanvas } from "../panels/IsoGroundCanvas";
import { TopBar } from "../TopBar";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ActionProgressOverlay } from "../components/ActionProgressOverlay";
import { useState } from "react";
import { BuildMenu } from "../panels/BuildMenu";
import { useGameStore } from "../../game/state/store";
import { EventLog } from "../panels/EventLog";

export function PlayScreen({ onPause }: { onPause: () => void }) {
  const [buildMenuOpen, setBuildMenuOpen] = useState(false);

  const placingBuilding = useGameStore((s) => s.placingBuilding);
  const cancelPlacingBuilding = useGameStore((s) => s.cancelPlacingBuilding);

  return (
    <div className="absolute inset-0">
      <IsoGroundCanvas />
      <TopBar />
      <button
        onClick={onPause}
        className="absolute cursor-pointer top-4 right-4 w-10 h-10 rounded-md bg-panel/90 backdrop-blur-sm border border-panel-border text-text flex items-center justify-center text-lg z-20"
        aria-label="Pause"
      >
        <span>| |</span>
      </button>
      <button
        onClick={() => setBuildMenuOpen((open) => !open)}
        className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-accent text-bg flex items-center justify-center text-xl shadow-lg z-20"
        aria-label="Build"
      >
        🔨
      </button>

      {buildMenuOpen && (
        <div className="absolute bottom-20 right-4 z-20">
          <BuildMenu />
        </div>
      )}

      {placingBuilding && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-panel/90 backdrop-blur-sm border border-panel-border rounded-lg px-4 py-2">
          <span className="text-sm text-text">
            Tap a green plot to place {placingBuilding.name}
          </span>
          <button
            onClick={cancelPlacingBuilding}
            className="px-3 py-1 text-xs rounded-md bg-panel-border text-text"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="absolute bottom-4 left-4 max-w-sm">
        <EventLog />
      </div>

      <ActionProgressOverlay />
      <ConfirmDialog />
    </div>
  );
}
