import { create } from "zustand";
import type { GameState } from "./types";
import { createInitialState } from "./initialState";

interface GameStore {
  state: GameState;
  reset: (seed: string) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  state: createInitialState("ashtide-default"),
  reset: (seed: string) => set({ state: createInitialState(seed) }),
}));
