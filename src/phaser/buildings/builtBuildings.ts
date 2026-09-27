import Phaser from "phaser";
import type { PlotDefinition } from "../../game/systems/terrain";
import type { PlacedBuilding } from "../../game/systems/buildings";
import { gridToScreen, isoDepth } from "../isometric";
import { toggleWorkerOnBuilding } from "../bridges/buildingAssignBridge";

const TILE_TYPE = { width: 160, height: 80 };

export function drawBuiltBuilding(
  scene: Phaser.Scene,
  placedBuilding: PlacedBuilding,
  plots: PlotDefinition[],
  col: number,
  row: number,
  x: number,
  y: number,
  originX: number,
  originY: number,
  groundScale: number,
) {
  const anchorPlot = plots.find((p) => p.id === placedBuilding.plotIds[0]);
  const otherPlot = plots.find(
    (p) => p.id === placedBuilding.plotIds[placedBuilding.plotIds.length - 1],
  );
  if (!anchorPlot || !otherPlot) return;

  const centerCol =
    (anchorPlot.gridPosition.col + otherPlot.gridPosition.col) / 2;
  const centerRow =
    (anchorPlot.gridPosition.row + otherPlot.gridPosition.row) / 2;
  const center = gridToScreen(
    centerCol,
    centerRow,
    TILE_TYPE,
    originX,
    originY,
  );

  const image = scene.add.image(center.x, center.y, placedBuilding.buildingId);
  image.setData("isoTile", true);
  image.setOrigin(0.5, 0.7);
  image.setDepth(isoDepth(col, row) + 500);
  image.setScale(groundScale);

  // TEMPORARY: lumbermill sprite needs a much bigger scale than the
  // default until its source art is corrected/replaced.
  if (placedBuilding.buildingId === "lumbermill") {
    image.setScale(groundScale * 6);

    const workerDot = scene.add.circle(
      x,
      y - TILE_TYPE.height * 0.4,
      20,
      placedBuilding.assignedCharacterId ? 0x4caf50 : 0x888888,
    );
    workerDot.setData("isoTile", true);
    workerDot.setDepth(isoDepth(col, row) + 1000);

    const hitzone = scene.add
      .rectangle(
        x,
        y,
        TILE_TYPE.width * 0.6,
        TILE_TYPE.height * 0.8,
        0x000000,
        0,
      )
      .setInteractive({ useHandCursor: true });
    hitzone.setData("plotHitzone", true);
    hitzone.setDepth(isoDepth(col, row) + 3);
    hitzone.on("pointerdown", () => toggleWorkerOnBuilding(placedBuilding));
  }
}
