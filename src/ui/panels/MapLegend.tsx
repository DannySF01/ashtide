interface LegendItem {
  icon: string;
  label: string;
}

const LEGEND_ITEMS: LegendItem[] = [
  { icon: "🏠", label: "Base" },
  { icon: "🌿", label: "Resource" },
  { icon: "❓", label: "Unknown location" },
  { icon: "🪶", label: "Tribe camp" },
  { icon: "💀", label: "Danger" },
  { icon: "🧭", label: "Exploration in progress" },
];

export function MapLegend() {
  return (
    <div className="bg-panel/90 backdrop-blur-sm border border-panel-border rounded-lg p-2 flex flex-col gap-3 w-48 shrink-0">
      {LEGEND_ITEMS.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 text-sm text-text-dim"
        >
          <span className="w-6 text-center">{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
