import Phaser from "phaser";
import { isoDepth } from "../isometric";
import { touchesWater } from "../world/islandShape";

const GRASS_TINTS = [0xffffff, 0xf0f7e6, 0xe2edd4, 0xd3e3c3, 0xe8efe1];

export interface DrawGroundTileOptions {
  scene: Phaser.Scene;
  col: number;
  row: number;
  x: number;
  y: number;
  tileWidth: number;
  scaleCompensation: number;
  debugCoords?: boolean;
}

export interface DrawnGroundTile {
  sprite: Phaser.GameObjects.Image;
  scale: number;
  textureKey: "sand" | "grass";
}

export function drawGroundTile(
  options: DrawGroundTileOptions,
): DrawnGroundTile {
  const { scene, col, row, x, y, tileWidth, scaleCompensation, debugCoords } =
    options;

  const textureKey: "sand" | "grass" = touchesWater(col, row)
    ? "sand"
    : "grass";
  const tile = scene.add.image(x, y, textureKey);
  tile.setData("isoTile", true);
  tile.setOrigin(0.5, 0.5);
  tile.setDepth(isoDepth(col, row));

  const scale = (tileWidth / tile.width) * scaleCompensation;
  tile.setScale(scale);

  const seed = Math.sin(col * 12.9898 + row * 78.233) * 43758.5453;
  const rand = seed - Math.floor(seed);
  const randSecondary = Math.cos(col * 39.346 + row * 11.135);

  if (rand > 0.45) tile.setFlipX(true);
  if (rand > 0.75) tile.setFlipY(true);

  if (textureKey === "grass") {
    const tint =
      GRASS_TINTS[
        Math.floor(Math.abs(randSecondary) * GRASS_TINTS.length) %
          GRASS_TINTS.length
      ];
    tile.setTint(tint);

    if (debugCoords) {
      const text = scene.add
        .text(x, y, `${col},${row}`, { fontSize: "12px", color: "#000000" })
        .setOrigin(0.5, 0.5);
      text.setData("isoTile", true);
      text.setDepth(isoDepth(col, row) + 1);
    }
  }

  return { sprite: tile, scale, textureKey };
}
