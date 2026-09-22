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
  const activeTask = useGameStore((s) => s.activeTask);
  const nowMs = useGameStore((s) => s.nowMs);
  const startTask = useGameStore((s) => s.startTask);
  const character = characters[0]; // MVP: single character for now

  if (!character) return null;

  const isBusy = activeTask !== null;
  const elapsedMs = activeTask ? nowMs - activeTask.startedAtMs : 0;
  const totalMs = activeTask ? activeTask.task.durationTicks * MS_PER_TICK : 0;

  return (
    <div className="bg-panel border border-panel-border rounded-lg p-4">
      <div className="text-sm text-text-dim mb-3">Available actions</div>

      {activeTask && (
        <div className="mb-4">
          <ProgressBar
            value={Math.min(elapsedMs, totalMs)}
            max={totalMs}
            colorClass="bg-accent"
            label={`${activeTask.task.name}…`}
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
                  startTask(
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
