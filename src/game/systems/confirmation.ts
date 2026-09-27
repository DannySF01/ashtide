import type { GameState } from "../state/types";

export interface PendingConfirmation {
  kind: "clear_plot";
  plotId: string;
  characterId: string;
}

export const CONFIRMATION_MESSAGES: Record<
  PendingConfirmation["kind"],
  string
> = {
  clear_plot: "Clear this terrain? This will take time and energy.",
};

/**
 * Builds a pending confirmation for clearing a plot, picking the first idle
 * character to carry it out. Returns null if no character is available —
 * the caller should silently ignore the request in that case, same as any
 * other action that requires an idle character.
 */
export function createClearPlotConfirmation(
  state: GameState,
  plotId: string,
): PendingConfirmation | null {
  const character = state.characters.find((c) => c.status === "idle");
  if (!character) return null;

  return { kind: "clear_plot", plotId, characterId: character.id };
}

export function getConfirmationMessage(
  confirmation: PendingConfirmation,
): string {
  return CONFIRMATION_MESSAGES[confirmation.kind];
}
