import Phaser from "phaser";
import type { PlotDefinition } from "../../game/systems/terrain";
import { isoDepth } from "../isometric";
import { requestClearPlotFromScene } from "../bridges/terrainBridge";

export function drawWildPlot(
  scene: Phaser.Scene,
  plot: PlotDefinition,
  x: number,
  y: number,
  col: number,
  row: number,
  tileWidth: number,
  tileHeight: number,
  groundScale: number,
) {
  const hitzone = scene.add
    .rectangle(x, y, tileWidth * 0.7, tileHeight * 0.7, 0x000000, 0)
    .setInteractive({ useHandCursor: true });
  hitzone.setData("plotHitzone", true);
  hitzone.setDepth(isoDepth(col, row) + 1000);

  const bush = scene.add.image(x, y, "bush");
  bush.setData("isoTile", true);
  bush.setOrigin(0.5, 0.5);
  bush.setDepth(isoDepth(col, row));
  bush.setScale(groundScale * 0.5);

  hitzone.on("pointerdown", () => requestClearPlotFromScene(plot.id));
}
