import Phaser from "phaser";
import { gridToScreen } from "../isometric";
import { subscribePlotsToStore } from "../bridges/terrainBridge";
import { subscribeBuildingsToStore } from "../bridges/buildingBridge";
import { subscribePlacingBuildingToStore } from "../bridges/placementBridge";
import {
  subscribeCharactersToStore,
  subscribeCurrentActionToStore,
} from "../bridges/characterBridge";
import { findFootprintBlocks } from "../../game/systems/footprint";
import type { PlotDefinition } from "../../game/systems/terrain";
import type {
  BuildingDefinition,
  PlacedBuilding,
} from "../../game/systems/buildings";
import type { Character } from "../../game/state/types";
import type { CurrentAction } from "../../game/state/currentAction";

import { drawCharacters } from "../characters/characters";
import { isWater } from "../world/islandShape";
import { drawWildPlot } from "../terrain/wildPlots";
import { drawGroundTile } from "../terrain/groundTiles";
import { drawPlacementHighlight } from "../buildings/buildingPlacement";
import { drawBuiltBuilding } from "../buildings/builtBuildings";
import {
  animateWater,
  createWaterSprite,
  createWaterTexture,
} from "../world/water";
import { enableCameraDrag } from "../world/cameraDrag";

const TILE = { width: 160, height: 80 };
const TILE_SCALE_COMPENSATION = 1.3;
const DEBUG_COORDS = false;

export class IsoGroundScene extends Phaser.Scene {
  private plots: PlotDefinition[] = [];
  private buildings: PlacedBuilding[] = [];
  private placingBuilding: BuildingDefinition | null = null;
  private characters: Character[] = [];
  private currentAction: CurrentAction | null = null;

  private waterSprite?: Phaser.GameObjects.TileSprite;
  private originX = 0;
  private originY = 0;

  private unsubscribePlots?: () => void;
  private unsubscribeBuildings?: () => void;
  private unsubscribePlacing?: () => void;
  private unsubscribeCharacters?: () => void;
  private unsubscribeCurrentAction?: () => void;

  constructor() {
    super("IsoGroundScene");
  }

  preload() {
    this.load.image("sand", "/assets/sprites/sand.png");
    this.load.image("bush", "/assets/sprites/bush.png");
    this.load.image("grass", "/assets/sprites/grass.png");
    this.load.image("shelter", "/assets/sprites/shelter.png");
    this.load.image("lumbermill", "/assets/sprites/lumbermill.png");
  }

  create() {
    this.cameras.main.setBackgroundColor("#1d6980");

    createWaterTexture(this);
    this.waterSprite = createWaterSprite(this);

    enableCameraDrag(this);

    this.unsubscribePlots = subscribePlotsToStore((plots) => {
      this.plots = plots;
      this.drawGrid();
    });
    this.unsubscribeBuildings = subscribeBuildingsToStore((buildings) => {
      this.buildings = buildings;
      this.drawGrid();
    });
    this.unsubscribePlacing = subscribePlacingBuildingToStore((building) => {
      this.placingBuilding = building;
      this.drawGrid();
    });
    this.unsubscribeCharacters = subscribeCharactersToStore((characters) => {
      this.characters = characters;
      this.drawGrid();
    });
    this.unsubscribeCurrentAction = subscribeCurrentActionToStore((action) => {
      this.currentAction = action;
      this.drawGrid();
    });

    this.scale.on("resize", (gameSize: { width: number; height: number }) => {
      this.waterSprite?.setSize(gameSize.width * 3, gameSize.height * 3);
      this.drawGrid();
    });
  }

  update() {
    if (this.waterSprite) animateWater(this.waterSprite);
  }

  private drawGrid() {
    this.children.list
      .filter(
        (child) => child.getData("isoTile") || child.getData("plotHitzone"),
      )
      .forEach((child) => child.destroy());

    const originX = this.scale.width / 2;
    const originY = this.scale.height / 2 - 50;
    this.originX = originX;
    this.originY = originY;

    const cols = Math.ceil(this.scale.width / (TILE.width / 2)) + 16;
    const rows = Math.ceil(this.scale.height / (TILE.height / 2)) + 16;
    const halfCols = Math.floor(cols / 2);
    const halfRows = Math.floor(rows / 2);

    const cam = this.cameras.main;
    const buffer = TILE.width * 3;

    const plotSpriteMap = new Map<string, Phaser.GameObjects.Image>();

    const placementBlocks = this.placingBuilding
      ? findFootprintBlocks(this.plots, this.placingBuilding.footprint)
      : [];
    const plotIdToBlock = new Map<string, PlotDefinition[]>();
    for (const block of placementBlocks) {
      for (const p of block) plotIdToBlock.set(p.id, block);
    }

    for (let row = -halfRows; row <= halfRows; row++) {
      for (let col = -halfCols; col <= halfCols; col++) {
        const { x, y } = gridToScreen(col, row, TILE, originX, originY);

        if (
          x < cam.worldView.x - buffer ||
          x > cam.worldView.x + cam.worldView.width + buffer ||
          y < cam.worldView.y - buffer ||
          y > cam.worldView.y + cam.worldView.height + buffer
        ) {
          continue;
        }

        if (isWater(col, row)) continue;

        const { sprite: groundTile, scale } = drawGroundTile({
          scene: this,
          col,
          row,
          x,
          y,
          tileWidth: TILE.width,
          scaleCompensation: TILE_SCALE_COMPENSATION,
          debugCoords: DEBUG_COORDS,
        });

        const plot = this.plots.find(
          (p) => p.gridPosition.col === col && p.gridPosition.row === row,
        );

        if (plot && plot.state === "wild") {
          drawWildPlot(
            this,
            plot,
            x,
            y,
            col,
            row,
            TILE.width,
            TILE.height,
            scale,
          );
        }

        if (plot && plot.state === "cleared" && this.placingBuilding) {
          drawPlacementHighlight(
            this,
            groundTile,
            plot,
            plotIdToBlock.get(plot.id),
            this.placingBuilding,
            plotSpriteMap,
          );
        }

        if (plot && plot.state === "built") {
          const placedBuilding = this.buildings.find((b) =>
            b.plotIds.includes(plot.id),
          );
          if (placedBuilding && placedBuilding.plotIds[0] === plot.id) {
            drawBuiltBuilding(
              this,
              placedBuilding,
              this.plots,
              col,
              row,
              x,
              y,
              originX,
              originY,
              scale,
            );
          }
        }
      }
    }

    drawCharacters(
      this,
      this.characters,
      this.currentAction,
      this.plots,
      this.buildings,
      originX,
      originY,
    );
  }

  shutdown() {
    this.unsubscribePlots?.();
    this.unsubscribeBuildings?.();
    this.unsubscribePlacing?.();
    this.unsubscribeCharacters?.();
    this.unsubscribeCurrentAction?.();
  }
}
