import { create } from "zustand";
import type { GameState } from "./types";
import { createInitialState } from "./initialState";
import { SeededRandom } from "../rng/seededRandom";
import type { CurrentAction } from "./currentAction";
import type { LastOutcome } from "./lastOutcome";
import { MS_PER_TICK, runGameClockTick } from "./gameClockTick";
import { startGatherTask as startGatherTaskAction } from "./actions/gatherActions";
import { startClearPlot as startClearPlotAction } from "./actions/terrainActions";
import {
  startBuild as startBuildAction,
  assignToBuilding,
  unassignFromBuilding,
} from "./actions/buildActions";
import type { TaskDefinition } from "../systems/tasks";
import type { Enemy } from "../systems/combat";
import type { BuildingDefinition } from "../systems/buildings";
import {
  createClearPlotConfirmation,
  type PendingConfirmation,
} from "../systems/confirmation";

export { MS_PER_TICK };

interface GameStore {
  state: GameState;
  rng: SeededRandom;
  currentAction: CurrentAction | null;
  lastOutcome: LastOutcome | null;
  nowMs: number;
  lastLoopMs: number;
  pendingConfirmation: PendingConfirmation | null;
  reset: (seed: string) => void;
  startGatherTask: (
    characterId: string,
    task: TaskDefinition,
    pickEnemy?: (rng: SeededRandom) => Enemy,
  ) => void;
  startClearPlot: (characterId: string, plotId: string) => void;
  startBuild: (plotIds: string[], building: BuildingDefinition) => void;
  assignToBuildingAction: (
    buildingInstanceId: string,
    characterId: string,
  ) => void;
  unassignFromBuildingAction: (buildingInstanceId: string) => void;
  requestClearConfirmation: (plotId: string) => void;
  confirmPendingAction: () => void;
  cancelPendingAction: () => void;
  tick: (nowMs: number) => void;
  placingBuilding: BuildingDefinition | null;
  startPlacingBuilding: (building: BuildingDefinition) => void;
  cancelPlacingBuilding: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: createInitialState("ashtide-default"),
  rng: new SeededRandom("ashtide-default"),
  currentAction: null,
  lastOutcome: null,
  nowMs: Date.now(),
  lastLoopMs: Date.now(),
  pendingConfirmation: null,
  placingBuilding: null,

  reset: (seed) =>
    set({
      state: createInitialState(seed),
      rng: new SeededRandom(seed),
      currentAction: null,
      lastOutcome: null,
      nowMs: Date.now(),
      lastLoopMs: Date.now(),
    }),

  startGatherTask: (characterId, task, pickEnemy) => {
    const { state, currentAction } = get();
    if (currentAction) return;
    const result = startGatherTaskAction(state, characterId, task, pickEnemy);
    if (result)
      set({ currentAction: result.currentAction, state: result.state });
  },

  startClearPlot: (characterId, plotId) => {
    const { state, currentAction } = get();
    if (currentAction) return;
    const result = startClearPlotAction(state, characterId, plotId);
    if (result)
      set({ currentAction: result.currentAction, state: result.state });
  },

  startBuild: (plotIds, building) => {
    const { state, currentAction } = get();
    if (currentAction) return;
    const result = startBuildAction(state, plotIds, building);
    if (result)
      set({ currentAction: result.currentAction, state: result.state });
  },

  assignToBuildingAction: (buildingInstanceId, characterId) => {
    const { state } = get();
    const newState = assignToBuilding(state, buildingInstanceId, characterId);
    if (newState) set({ state: newState });
  },

  unassignFromBuildingAction: (buildingInstanceId) => {
    const { state } = get();
    const newState = unassignFromBuilding(state, buildingInstanceId);
    if (newState) set({ state: newState });
  },

  tick: (nowMs) => {
    const { state, currentAction, rng, lastLoopMs } = get();
    const result = runGameClockTick(
      state,
      currentAction,
      rng,
      nowMs,
      lastLoopMs,
    );

    set({
      state: result.state,
      currentAction: result.currentAction,
      lastLoopMs: result.lastLoopMs,
      nowMs,
      ...(result.lastOutcome ? { lastOutcome: result.lastOutcome } : {}),
    });
  },

  requestClearConfirmation: (plotId: string) => {
    const { state } = get();
    const confirmation = createClearPlotConfirmation(state, plotId);
    if (confirmation) set({ pendingConfirmation: confirmation });
  },

  confirmPendingAction: () => {
    const { pendingConfirmation } = get();
    if (!pendingConfirmation) return;

    if (pendingConfirmation.kind === "clear_plot") {
      get().startClearPlot(
        pendingConfirmation.characterId,
        pendingConfirmation.plotId,
      );
    }

    set({ pendingConfirmation: null });
  },

  cancelPendingAction: () => {
    set({ pendingConfirmation: null });
  },

  startPlacingBuilding: (building: BuildingDefinition) => {
    set({ placingBuilding: building });
  },

  cancelPlacingBuilding: () => {
    set({ placingBuilding: null });
  },
}));
