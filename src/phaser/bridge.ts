import { useGameStore } from "../game/state/store";
import type { GameState } from "../game/state/types";
import type { CurrentAction } from "../game/state/currentAction";

export interface SceneSnapshot {
  state: GameState;
  currentAction: CurrentAction | null;
}

export type SceneUpdateListener = (snapshot: SceneSnapshot) => void;

export function subscribeSceneToStore(
  listener: SceneUpdateListener,
): () => void {
  const getSnapshot = (): SceneSnapshot => {
    const s = useGameStore.getState();
    return { state: s.state, currentAction: s.currentAction };
  };

  listener(getSnapshot());

  return useGameStore.subscribe(() => listener(getSnapshot()));
}
