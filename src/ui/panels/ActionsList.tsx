import { useGameStore } from "../../game/state/store";
import { loadTasks, loadEnemies } from "../../game/loader";
import { canStartTask } from "../../game/systems/tasks";
import { MS_PER_TICK } from "../../game/state/store";
import { ProgressBar } from "../components/ProgressBar";
import type { SeededRandom } from "../../game/rng/seededRandom";

const tasks = Object.values(loadTasks());
const enemies = Object.values(loadEnemies());

function pickRandomEnemy(rng: SeededRandom) {
  return enemies[rng.nextInt(0, enemies.length - 1)];
}

export function ActionsList() {
  const characters = useGameStore((s) => s.state.characters);
  const currentAction = useGameStore((s) => s.currentAction);
  const nowMs = useGameStore((s) => s.nowMs);
  const startGatherTask = useGameStore((s) => s.startGatherTask);
  const character = characters[0];

  if (!character) return null;

  const isBusy = currentAction !== null;
  const isGathering = currentAction?.type === "gather";
  const elapsedMs = currentAction ? nowMs - currentAction.startedAtMs : 0;
  const totalMs = currentAction ? currentAction.durationTicks * MS_PER_TICK : 0;

  return (
    <div className="bg-panel border border-panel-border rounded-lg p-4">
      <div className="text-sm text-text-dim mb-3">Available actions</div>

      {isGathering && currentAction && (
        <div className="mb-4">
          <ProgressBar
            value={Math.min(elapsedMs, totalMs)}
            max={totalMs}
            colorClass="bg-accent"
            label={`${currentAction.task.name}…`}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {tasks.map((task) => {
          const enabled = !isBusy && canStartTask(character, task);
          return (
            <div
              key={task.id}
              className="flex items-center justify-between gap-3"
            >
              <div>
                <div className="text-sm text-text">{task.name}</div>
                <div className="text-xs text-text-dim">
                  {task.durationTicks * 10} min · -{task.energyCost} energy
                  {task.riskBaseChance ? " · risky" : ""}
                </div>
              </div>
              <button
                disabled={!enabled}
                onClick={() =>
                  startGatherTask(
                    character.id,
                    task,
                    task.riskBaseChance ? pickRandomEnemy : undefined,
                  )
                }
                className="px-3 py-1.5 text-sm rounded-md bg-accent text-bg font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Do
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
