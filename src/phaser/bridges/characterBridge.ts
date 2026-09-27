import type { CurrentAction } from "../../game/state/currentAction";
import { useGameStore } from "../../game/state/store";
import type { Character } from "../../game/state/types";

export function subscribeCharactersToStore(
  listener: (characters: Character[]) => void,
): () => void {
  let last = useGameStore.getState().state.characters;
  listener(last);

  return useGameStore.subscribe((s) => {
    if (s.state.characters !== last) {
      last = s.state.characters;
      listener(last);
    }
  });
}

export function subscribeCurrentActionToStore(
  listener: (action: CurrentAction | null) => void,
): () => void {
  let last = useGameStore.getState().currentAction;
  listener(last);

  return useGameStore.subscribe((s) => {
    if (s.currentAction !== last) {
      last = s.currentAction;
      listener(last);
    }
  });
}
