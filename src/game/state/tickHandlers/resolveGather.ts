import type { GameState } from "../types";
import type { CurrentAction } from "../currentAction";
import type { SeededRandom } from "../../rng/seededRandom";
import { runTask } from "../../systems/taskOrchestrator";
import { applyLevelUps } from "../../systems/skills";
import { isNight } from "../../systems/time";
import type { LastOutcome } from "../lastOutcome";

export function resolveGather(
  state: GameState,
  action: Extract<CurrentAction, { type: "gather" }>,
  rng: SeededRandom,
): { state: GameState; lastOutcome: LastOutcome | null } {
  const outcome = runTask({
    state,
    characterId: action.characterId,
    task: action.task,
    rng,
    riskModifiers: { isNight: isNight(state.hourOfDay), threatLevel: 20 },
    pickEnemy: action.pickEnemy,
    skipStartCheck: true,
  });

  if (outcome.type === "blocked") {
    return {
      state: {
        ...state,
        characters: state.characters.map((c) =>
          c.id === action.characterId ? { ...c, status: "idle" } : c,
        ),
      },
      lastOutcome: null,
    };
  }

  const { character: leveledCharacter } = applyLevelUps(outcome.character);
  const finalCharacter = { ...leveledCharacter, status: "idle" as const };

  const message =
    outcome.type === "encounter"
      ? outcome.characterDefeated
        ? `Attacked by ${outcome.enemy.name} — knocked out!`
        : outcome.enemyDefeated
          ? `Fought off a ${outcome.enemy.name}.`
          : `Escaped a ${outcome.enemy.name}, still around.`
      : `${action.task.name}: done.`;

  return {
    state: {
      ...state,
      resources: outcome.resources,
      characters: state.characters.map((c) =>
        c.id === action.characterId ? finalCharacter : c,
      ),
    },
    lastOutcome: {
      message,
      type: outcome.type === "encounter" ? "encounter" : "safe",
    },
  };
}
