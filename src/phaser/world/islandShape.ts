const WATER_COL_START = 6;
const WATER_ROW_START = -1;

/** True if the given grid cell is part of the sea, false if it's land. */
export function isWater(col: number, row: number): boolean {
  const noise =
    Math.sin(col * 0.6 + row * 0.3) * 1.5 + Math.cos(row * 0.5) * 1.2;
  return col + noise > WATER_COL_START && row + noise > WATER_ROW_START;
}

export function touchesWater(col: number, row: number): boolean {
  return (
    isWater(col + 1, row) ||
    isWater(col - 1, row) ||
    isWater(col, row + 1) ||
    isWater(col, row - 1)
  );
}
