export interface IsoTileSize {
  width: number; // full diamond width in pixels
  height: number; // full diamond height in pixels
}

/**
 * Converts grid coordinates (col, row) to screen (x, y) for an isometric
 * diamond grid, centered around originX/originY.
 */
export function gridToScreen(
  col: number,
  row: number,
  tile: IsoTileSize,
  originX: number,
  originY: number,
): { x: number; y: number } {
  const x = originX + (col - row) * (tile.width / 2);
  const y = originY + (col + row) * (tile.height / 2);
  return { x, y };
}

/** Depth for draw-order sorting: tiles further "back" (lower row+col) draw first. */
export function isoDepth(col: number, row: number): number {
  return col + row;
}
