import Phaser from "phaser";
import type { Character } from "../../game/state/types";
import type { CurrentAction } from "../../game/state/currentAction";
import type { PlotDefinition } from "../../game/systems/terrain";
import type { PlacedBuilding } from "../../game/systems/buildings";
import { gridToScreen, isoDepth } from "../isometric";

const TILE_TYPE = { width: 160, height: 80 };

export const CAMP_GRID_POSITION = { col: -1, row: -1 };

const STATUS_COLORS: Record<Character["status"], number> = {
  idle: 0xf2c29b,
  working: 0xe8722b,
  resting: 0x8fa3a8,
  injured: 0xb3324a,
};

const CAMP_OFFSETS = [
  { dx: 0, dy: 0 },
  { dx: -24, dy: 10 },
  { dx: 24, dy: 10 },
  { dx: 0, dy: 22 },
  { dx: -24, dy: -12 },
  { dx: 24, dy: -12 },
];

function resolveCharacterGridPosition(
  character: Character,
  currentAction: CurrentAction | null,
  plots: PlotDefinition[],
  buildings: PlacedBuilding[],
): { col: number; row: number } {
  if (currentAction && character.status === "working") {
    if (
      currentAction.type === "clear_plot" &&
      currentAction.characterId === character.id
    ) {
      const plot = plots.find((p) => p.id === currentAction.plotId);
      if (plot) return plot.gridPosition;
    }

    const workedBuilding = buildings.find(
      (b) => b.assignedCharacterId === character.id,
    );
    if (workedBuilding) {
      const plot = plots.find((p) => workedBuilding.plotIds.includes(p.id));
      if (plot) return plot.gridPosition;
    }
  }

  return CAMP_GRID_POSITION;
}

export function drawCharacters(
  scene: Phaser.Scene,
  characters: Character[],
  currentAction: CurrentAction | null,
  plots: PlotDefinition[],
  buildings: PlacedBuilding[],
  originX: number,
  originY: number,
) {
  scene.children.list
    .filter((c) => c.getData("characterMarker"))
    .forEach((c) => c.destroy());

  let campIndex = 0;

  for (const character of characters) {
    const pos = resolveCharacterGridPosition(
      character,
      currentAction,
      plots,
      buildings,
    );
    const isAtCamp =
      pos.col === CAMP_GRID_POSITION.col && pos.row === CAMP_GRID_POSITION.row;

    const { x: baseX, y: baseY } = gridToScreen(
      pos.col,
      pos.row,
      TILE_TYPE,
      originX,
      originY,
    );
    let x = baseX;
    let y = baseY;

    if (isAtCamp) {
      const offset = CAMP_OFFSETS[campIndex % CAMP_OFFSETS.length];
      x += offset.dx;
      y += offset.dy;
      campIndex++;
    }

    const marker = scene.add.ellipse(
      x,
      y,
      22,
      30,
      STATUS_COLORS[character.status],
    );
    marker.setData("characterMarker", true);
    marker.setDepth(isoDepth(pos.col, pos.row) + 2000 + campIndex);
    marker.setStrokeStyle(2, 0x0d191d);

    const label = scene.add.text(x, y - 24, character.name, {
      color: "#e8dcc8",
      fontFamily: "sans-serif",
      fontSize: "11px",
    });
    label.setOrigin(0.5, 1);
    label.setData("characterMarker", true);
    label.setDepth(isoDepth(pos.col, pos.row) + 2001 + campIndex);
  }
}
