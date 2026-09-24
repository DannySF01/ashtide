import Phaser from "phaser";
import { subscribeSceneToStore } from "./bridge";
import type { SceneSnapshot } from "./bridge";
import { getTaskTargetX, CAMP_TARGET_X } from "./taskPositions";
import type { Character, GameState } from "../game/state/types";
import type { PlotDefinition } from "../game/systems/terrain";
import { computeNightAlpha } from "./dayNightCycle";

const STATUS_COLORS: Record<Character["status"], number> = {
  idle: 0xf2c29b,
  working: 0xe8722b,
  resting: 0x8fa3a8,
  injured: 0xb3324a,
};

const PLOT_COLORS: Record<PlotDefinition["state"], number> = {
  wild: 0x2f4a2a,
  cleared: 0xc9a24a,
  built: 0x8a5f3a,
};

const PLOT_WIDTH = 140;
const PLOT_START_X = 550;
const CHARACTER_Y = 440;
const WALK_SPEED_PX_PER_SEC = 60;

export class BaseScene extends Phaser.Scene {
  private unsubscribe?: () => void;
  private characterSprite?: Phaser.GameObjects.Ellipse;
  private characterLabel?: Phaser.GameObjects.Text;
  private plotSprites: Phaser.GameObjects.Rectangle[] = [];
  private nightOverlay?: Phaser.GameObjects.Rectangle;
  private currentTargetX = CAMP_TARGET_X;
  private lastActionKey: string | null = null;

  constructor() {
    super("BaseScene");
  }

  create() {
    this.add.rectangle(480, 100, 960, 200, 0xbee6f0);
    this.add.rectangle(480, 260, 960, 120, 0x4fb3ce);
    this.add.rectangle(480, 460, 960, 160, 0xd8b676);

    this.characterSprite = this.add.ellipse(
      CAMP_TARGET_X,
      CHARACTER_Y,
      28,
      40,
      STATUS_COLORS.idle,
    );
    this.characterLabel = this.add.text(
      CAMP_TARGET_X - 20,
      CHARACTER_Y - 35,
      "",
      {
        color: "#e8dcc8",
        fontFamily: "sans-serif",
        fontSize: "12px",
      },
    );

    this.nightOverlay = this.add.rectangle(480, 270, 960, 540, 0x0a1420);
    this.nightOverlay.setAlpha(0);

    this.unsubscribe = subscribeSceneToStore((snapshot) =>
      this.onSnapshot(snapshot),
    );
  }

  private onSnapshot({ state, currentAction }: SceneSnapshot) {
    this.updateCharacterVisual(state);
    this.updatePlots(state);
    this.updateDayNight(state);
    this.updateMovement(state, currentAction);
  }

  private updateCharacterVisual(state: GameState) {
    const character = state.characters[0];
    if (!character || !this.characterSprite || !this.characterLabel) return;

    this.characterSprite.setFillStyle(STATUS_COLORS[character.status]);
    this.characterLabel.setText(`${character.name} (${character.status})`);
  }

  private updatePlots(state: GameState) {
    this.plotSprites.forEach((s) => s.destroy());
    this.plotSprites = [];

    state.plots.forEach((plot, index) => {
      const x = PLOT_START_X + index * PLOT_WIDTH;
      const rect = this.add.rectangle(
        x,
        460,
        PLOT_WIDTH - 8,
        100,
        PLOT_COLORS[plot.state],
      );
      this.plotSprites.push(rect);
    });
  }

  private updateDayNight(state: GameState) {
    if (!this.nightOverlay) return;
    const targetAlpha = computeNightAlpha(state.hourOfDay);

    this.tweens.add({
      targets: this.nightOverlay,
      alpha: targetAlpha,
      duration: 400,
      ease: "Linear",
    });
  }

  private updateMovement(
    state: GameState,
    currentAction: import("../game/state/currentAction").CurrentAction | null,
  ) {
    if (!this.characterSprite) return;

    const character = state.characters[0];
    if (!character) return;

    // Key includes the character's status too, so "idle after a task" is
    // distinct from "idle already at camp" — otherwise both collapse to the
    // same key and we'd skip the walk back.
    const actionKey = currentAction
      ? `${currentAction.type}:${"task" in currentAction ? currentAction.task.id : currentAction.plotId}`
      : `idle:${character.status}`;

    if (actionKey === this.lastActionKey) return;
    this.lastActionKey = actionKey;

    let targetX = CAMP_TARGET_X;

    if (currentAction?.type === "gather") {
      targetX = getTaskTargetX(currentAction.task.id);
    } else if (
      currentAction?.type === "clear_plot" ||
      currentAction?.type === "build"
    ) {
      const plotIndex = state.plots.findIndex(
        (p) => p.id === currentAction.plotId,
      );
      targetX =
        plotIndex >= 0 ? PLOT_START_X + plotIndex * PLOT_WIDTH : CAMP_TARGET_X;
    }
    // else: no current action -> walk back to camp (targetX stays CAMP_TARGET_X)

    this.walkTo(targetX);
  }

  private walkTo(targetX: number) {
    if (!this.characterSprite) return;
    if (Math.abs(targetX - this.characterSprite.x) < 1) return; // already there

    this.currentTargetX = targetX;
    const distance = Math.abs(targetX - this.characterSprite.x);
    const duration = (distance / WALK_SPEED_PX_PER_SEC) * 1000;

    this.tweens.add({
      targets: this.characterSprite,
      x: targetX,
      duration: Math.max(200, duration),
      ease: "Linear",
      onUpdate: () => {
        this.characterLabel?.setPosition(
          this.characterSprite!.x - 20,
          this.characterSprite!.y - 35,
        );
      },
    });
  }

  shutdown() {
    this.unsubscribe?.();
  }
}
