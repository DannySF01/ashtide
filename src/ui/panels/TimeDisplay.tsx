import { useGameStore } from "../../game/state/store";
import { isNight } from "../../game/systems/time";

function formatHour(hourOfDay: number): string {
  const h = Math.floor(hourOfDay);
  const m = Math.floor((hourOfDay - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function TimeDisplay() {
  const day = useGameStore((s) => s.state.day);
  const hourOfDay = useGameStore((s) => s.state.hourOfDay);
  const night = isNight(hourOfDay);

  return (
    <div className="flex items-center gap-2 text-sm text-text-dim">
      <span>Day {day}</span>
      <span>·</span>
      <span>{formatHour(hourOfDay)}</span>
      <span>{night ? "🌙" : "☀️"}</span>
    </div>
  );
}
