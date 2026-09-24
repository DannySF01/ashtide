const CAMP_X = 200;

const TASK_POSITIONS: Record<string, number> = {
  gather_sticks: 320,
  forage_berries: 380,
};

export function getTaskTargetX(taskId: string): number {
  return TASK_POSITIONS[taskId] ?? CAMP_X;
}

export function getPlotTargetX(
  plotIndex: number,
  plotStartX: number,
  plotWidth: number,
): number {
  return plotStartX + plotIndex * plotWidth;
}

export const CAMP_TARGET_X = CAMP_X;
