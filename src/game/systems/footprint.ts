import type { PlotDefinition } from "./terrain";
import type { Footprint } from "./buildings";

export function findFootprintBlocks(
  plots: PlotDefinition[],
  footprint: Footprint,
): PlotDefinition[][] {
  const byPos = new Map<string, PlotDefinition>();
  for (const p of plots) {
    byPos.set(`${p.gridPosition.col},${p.gridPosition.row}`, p);
  }

  const blocks: PlotDefinition[][] = [];

  for (const anchor of plots) {
    if (anchor.state !== "cleared") continue;

    const block: PlotDefinition[] = [];
    let valid = true;

    for (let dr = 0; dr < footprint.rows && valid; dr++) {
      for (let dc = 0; dc < footprint.cols && valid; dc++) {
        const key = `${anchor.gridPosition.col + dc},${anchor.gridPosition.row + dr}`;
        const p = byPos.get(key);
        if (!p || p.state !== "cleared") {
          valid = false;
          break;
        }
        block.push(p);
      }
    }

    if (valid) blocks.push(block);
  }

  return blocks;
}
