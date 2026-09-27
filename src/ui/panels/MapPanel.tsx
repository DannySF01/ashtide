import { useGameStore } from "../../game/state/store";
import { MapLegend } from "./MapLegend";
import type { MapLocation } from "../../game/systems/map";

const TYPE_ICONS: Record<MapLocation["type"], string> = {
  resource: "🌿",
  ruins: "🏛️",
  tribe_camp: "🪶",
  danger: "💀",
  unknown: "❓",
};

const BASE_POSITION = { x: 50, y: 50 };

function MarkerDot({
  icon,
  label,
  x,
  y,
  variant = "default",
}: {
  icon: string;
  label: string;
  x: number;
  y: number;
  variant?: "default" | "base" | "exploring";
}) {
  const ringClass =
    variant === "base"
      ? "border-ok"
      : variant === "exploring"
        ? "border-accent animate-pulse"
        : "border-accent";

  return (
    <div
      className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div
        className={`w-9 h-9 rounded-full bg-panel/90 border-2 ${ringClass} flex items-center justify-center text-base shadow-lg`}
      >
        {icon}
      </div>
      <div className="mt-1 text-[10px] text-text bg-bg/80 px-1.5 py-0.5 rounded whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}

export function MapPanel() {
  const mapLocations = useGameStore((s) => s.state.mapLocations);

  return (
    <div className="absolute inset-0 bg-[#0a1420] flex items-center justify-center">
      {/* This inner div is sized to the image's actual rendered box, so
          percentage-based marker positions line up with the artwork
          instead of the full (wider) screen. */}
      <div className="relative max-w-full max-h-full">
        <img
          src="/assets/backgrounds/island_map.png"
          alt="Island map"
          className="block max-w-full max-h-full w-auto h-auto object-contain"
        />

        <MarkerDot
          icon="🏠"
          label="Base"
          x={BASE_POSITION.x}
          y={BASE_POSITION.y}
          variant="base"
        />

        {mapLocations
          .filter((l) => l.state !== "undiscovered")
          .map((location) => (
            <MarkerDot
              key={location.id}
              icon={TYPE_ICONS[location.type]}
              label={location.name}
              x={location.x}
              y={location.y}
            />
          ))}
      </div>

      <div className="absolute top-16 right-4 z-10">
        <MapLegend />
      </div>
    </div>
  );
}
