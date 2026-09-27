import { useGameStore } from "../../game/state/store";
import { getConfirmationMessage } from "../../game/systems/confirmation";

export function ConfirmDialog() {
  const pendingConfirmation = useGameStore((s) => s.pendingConfirmation);
  const confirmPendingAction = useGameStore((s) => s.confirmPendingAction);
  const cancelPendingAction = useGameStore((s) => s.cancelPendingAction);

  if (!pendingConfirmation) return null;

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-100">
      <div className="bg-panel border border-panel-border rounded-lg p-5 w-80 flex flex-col gap-4">
        <div className="text-sm text-text">
          {getConfirmationMessage(pendingConfirmation)}
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={cancelPendingAction}
            className="px-4 py-1.5 text-sm rounded-md bg-panel-border text-text font-medium"
          >
            Cancel
          </button>
          <button
            onClick={confirmPendingAction}
            className="px-4 py-1.5 text-sm rounded-md bg-accent text-bg font-medium"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
