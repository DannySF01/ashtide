export type AppTab =
  | "map"
  | "characters"
  | "build"
  | "inventory"
  | "tribes"
  | "reports"
  | "settings";

interface SidebarProps {
  activeTab: AppTab;
  onSelect: (tab: AppTab) => void;
}

const NAV_ITEMS: { id: AppTab; label: string; icon: string }[] = [
  { id: "map", label: "Map", icon: "🗺️" },
  { id: "characters", label: "Characters", icon: "👥" },
  { id: "build", label: "Build", icon: "🔨" },
  { id: "inventory", label: "Inventory", icon: "🎒" },
  { id: "tribes", label: "Tribes", icon: "🪶" },
  { id: "reports", label: "Reports", icon: "📋" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export function Sidebar({ activeTab, onSelect }: SidebarProps) {
  return (
    <aside className="absolute top-0 left-0 h-full w-48 shrink-0 bg-panel/90 backdrop-blur-sm border-r border-panel-border p-3 flex flex-col gap-1 z-20">
      <div className="px-2 py-3 mb-2">
        <div className="text-lg font-bold text-text">🏝️ Ashtide</div>
        <div className="text-[10px] text-text-dim">
          Survive. Explore. Build.
        </div>
      </div>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors ${
            activeTab === item.id
              ? "bg-accent text-bg font-medium"
              : "text-text-dim hover:bg-panel-border hover:text-text"
          }`}
        >
          <span>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </aside>
  );
}
