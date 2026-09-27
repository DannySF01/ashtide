import Phaser from "phaser";
import type { PlotDefinition } from "../../game/systems/terrain";
import {
  canAfford,
  type BuildingDefinition,
} from "../../game/systems/buildings";
import { useGameStore } from "../../game/state/store";
import { confirmPlacement } from "../bridges/placementBridge";

export function drawPlacementHighlight(
  scene: Phaser.Scene,
  groundTile: Phaser.GameObjects.Image,
  plot: PlotDefinition,
  block: PlotDefinition[] | undefined,
  placingBuilding: BuildingDefinition,
  plotSpriteMap: Map<string, Phaser.GameObjects.Image>,
) {
  if (!block) {
    groundTile.setTint(0xe53935);
    return;
  }

  const resources = useGameStore.getState().state.resources;
  const affordable = canAfford(placingBuilding.cost, resources);
  const color = affordable ? 0x4caf50 : 0xe53935;

  groundTile.setTint(color);
  groundTile.setInteractive({ useHandCursor: true });
  plotSpriteMap.set(plot.id, groundTile);

  groundTile.on("pointerover", () => {
    block.forEach((p) => plotSpriteMap.get(p.id)?.setTint(0x8bc34a));
  });

  groundTile.on("pointerout", () => {
    block.forEach((p) => plotSpriteMap.get(p.id)?.setTint(color));
  });

  if (affordable) {
    const plotIds = block.map((p) => p.id);
    groundTile.on("pointerdown", () =>
      confirmPlacement(plotIds, placingBuilding),
    );
  }
}
