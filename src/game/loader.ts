import type { ResourceAmounts, SkillLevels } from "./state/types";
import type { TaskDefinition } from "./systems/tasks";
import rawTasks from "./data/tasks.json";
import type { Enemy } from "./systems/combat";
import rawEnemies from "./data/enemies.json";
import type { PlotDefinition, PlotState } from "./systems/terrain";
import rawPlots from "./data/plots.json";

/*
 *
 *    RESOURCE DEFINITIONS
 *
 */

const RESOURCE_KEYS: (keyof ResourceAmounts)[] = [
  "sticks",
  "stones",
  "food",
  "water",
];

function isResourceKey(key: string): key is keyof ResourceAmounts {
  return (RESOURCE_KEYS as string[]).includes(key);
}

/*
 *
 *    SKILL DEFINITIONS
 *
 */

const SKILL_KEYS: (keyof SkillLevels)[] = [
  "gathering",
  "crafting",
  "hunting",
  "fighting",
];

function isSkillKey(key: string): key is keyof SkillLevels {
  return (SKILL_KEYS as string[]).includes(key);
}

/*
 *
 *    TASK DEFINITIONS
 *
 */

function parseTask(raw: unknown): TaskDefinition {
  const t = raw as Record<string, unknown>;

  if (typeof t.id !== "string" || typeof t.name !== "string") {
    throw new Error(`Invalid task definition: missing id or name`);
  }

  const resourceReward: Partial<ResourceAmounts> = {};
  const rawReward = (t.resourceReward ?? {}) as Record<string, number>;
  for (const [key, value] of Object.entries(rawReward)) {
    if (!isResourceKey(key))
      throw new Error(`Unknown resource key "${key}" in task "${t.id}"`);
    resourceReward[key] = value;
  }

  const resourceRewardRange: Partial<
    Record<keyof ResourceAmounts, [number, number]>
  > = {};
  const rawRange = (t.resourceRewardRange ?? {}) as Record<
    string,
    [number, number]
  >;
  for (const [key, value] of Object.entries(rawRange)) {
    if (!isResourceKey(key))
      throw new Error(`Unknown resource key "${key}" in task "${t.id}"`);
    resourceRewardRange[key] = value;
  }

  const rawXp = t.xpReward as { skill: string; amount: number };
  if (!isSkillKey(rawXp.skill)) {
    throw new Error(`Unknown skill "${rawXp.skill}" in task "${t.id}"`);
  }

  return {
    id: t.id,
    name: t.name,
    durationTicks: Number(t.durationTicks),
    energyCost: Number(t.energyCost),
    resourceReward,
    resourceRewardRange,
    xpReward: { skill: rawXp.skill, amount: rawXp.amount },
    riskBaseChance:
      typeof t.riskBaseChance === "number" ? t.riskBaseChance : undefined,
  };
}

export function loadTasks(): Record<string, TaskDefinition> {
  const entries = Object.entries(rawTasks as Record<string, unknown>).map(
    ([key, value]) => [key, parseTask(value)] as const,
  );
  return Object.fromEntries(entries);
}

/*
 *
 *    ENEMY DEFINITIONS
 *
 */

function parseEnemy(raw: unknown): Enemy {
  const e = raw as Record<string, unknown>;
  if (typeof e.id !== "string" || typeof e.name !== "string") {
    throw new Error("Invalid enemy definition: missing id or name");
  }
  return {
    id: e.id,
    name: e.name,
    hp: Number(e.hp),
    damage: Number(e.damage),
    hitChance: Number(e.hitChance),
  };
}

export function loadEnemies(): Record<string, Enemy> {
  const entries = Object.entries(rawEnemies as Record<string, unknown>).map(
    ([key, value]) => [key, parseEnemy(value)] as const,
  );
  return Object.fromEntries(entries);
}

/*
 *
 *      PLOT DEFINITIONS
 *
 */

const PLOT_STATES: PlotState[] = ["wild", "clearing", "cleared", "built"];

function isPlotState(value: string): value is PlotState {
  return (PLOT_STATES as string[]).includes(value);
}

function parsePlot(raw: unknown): PlotDefinition {
  const p = raw as Record<string, unknown>;
  if (
    typeof p.id !== "string" ||
    typeof p.state !== "string" ||
    !isPlotState(p.state)
  ) {
    throw new Error(`Invalid plot definition: bad id or state`);
  }

  const resourceRewardRange: PlotDefinition["resourceRewardRange"] = {};
  const rawRange = (p.resourceRewardRange ?? {}) as Record<
    string,
    [number, number]
  >;
  for (const [key, value] of Object.entries(rawRange)) {
    if (!isResourceKey(key))
      throw new Error(`Unknown resource key "${key}" in plot "${p.id}"`);
    resourceRewardRange[key] = value;
  }

  return {
    id: p.id,
    state: p.state,
    clearing: p.clearing as PlotDefinition["clearing"],
    riskBaseChance: Number(p.riskBaseChance),
    resourceRewardRange,
  };
}

export function loadPlots(): Record<string, PlotDefinition> {
  const entries = Object.entries(rawPlots as Record<string, unknown>).map(
    ([key, value]) => [key, parsePlot(value)] as const,
  );
  return Object.fromEntries(entries);
}
