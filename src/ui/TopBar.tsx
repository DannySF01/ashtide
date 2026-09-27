import { useGameStore } from "../game/state/store";
import { isNight } from "../game/systems/time";
import type { ResourceAmounts } from "../game/state/types";

function formatHour(hourOfDay: number): string {
  const h = Math.floor(hourOfDay);
  const m = Math.floor((hourOfDay - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const RESOURCE_ICONS: Record<keyof ResourceAmounts, string> = {
  sticks: "🪵",
  stones: "🪨",
  food: "🍎",
  water: "💧",
};

export function TopBar() {
  const day = useGameStore((s) => s.state.day);
  const hourOfDay = useGameStore((s) => s.state.hourOfDay);
  const resources = useGameStore((s) => s.state.resources);
  const characters = useGameStore((s) => s.state.characters);
  const night = isNight(hourOfDay);

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-stretch bg-panel/90 backdrop-blur-sm border border-panel-border rounded-md overflow-hidden z-20">
      <div className="flex items-center gap-1.5 px-3 py-1.5">
        <span>{night ? "🌙" : "☀️"}</span>
        <div className="flex flex-col leading-tight">
          <span className="text-text font-medium text-xs">Day {day}</span>
          <span className="text-text-dim text-[11px]">
            {formatHour(hourOfDay)}
          </span>
        </div>
      </div>

      {(Object.keys(RESOURCE_ICONS) as (keyof ResourceAmounts)[]).map((key) => (
        <div key={key} className="flex items-center gap-1.5 px-3 py-1.5 ">
          <span>{RESOURCE_ICONS[key]}</span>
          <span className="text-text text-sm font-medium">
            {Math.floor(resources[key])}
          </span>
        </div>
      ))}

      <div className="flex items-center gap-1.5 px-3 py-1.5 ">
        <span>👤</span>
        <span className="text-text text-sm font-medium">
          {characters.length}/6
        </span>
      </div>
    </div>
  );
}
