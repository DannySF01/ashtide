import { useState } from "react";
import { Sidebar } from "../Sidebar";
import type { AppTab } from "../Sidebar";
import { TopBar } from "../TopBar";
import { CharacterPanel } from "../panels/CharacterPanel";
import { ActionsList } from "../panels/ActionsList";
import { BuildMenu } from "../panels/BuildMenu";
import { MapPanel } from "../panels/MapPanel";
import { EventLog } from "../panels/EventLog";
import { PlaceholderScreen } from "../panels/PlaceholderScreen";

export function PauseMenu({ onResume }: { onResume: () => void }) {
  const [activeTab, setActiveTab] = useState<AppTab>("map");

  return (
    <div className="absolute inset-0 bg-bg">
      <Sidebar activeTab={activeTab} onSelect={setActiveTab} />
      <TopBar />

      <button
        onClick={onResume}
        className="absolute top-4 right-4 px-4 py-2 rounded-md bg-accent text-bg font-medium text-sm z-20"
      >
        Resume
      </button>

      {activeTab === "map" && <MapScreen />}
      {activeTab === "characters" && <CharactersScreen />}
      {activeTab === "build" && <BuildScreen />}
      {activeTab === "inventory" && <PlaceholderScreen title="Inventory" />}
      {activeTab === "tribes" && <PlaceholderScreen title="Tribes" />}
      {activeTab === "reports" && <PlaceholderScreen title="Reports" />}
      {activeTab === "settings" && <PlaceholderScreen title="Settings" />}
    </div>
  );
}

function MapScreen() {
  return (
    <>
      <MapPanel />
    </>
  );
}

function CharactersScreen() {
  return (
    <div className="absolute top-16 left-52 right-4 bottom-4 flex flex-col gap-3">
      <CharacterPanel />
      <div className="max-w-sm">
        <ActionsList />
      </div>
    </div>
  );
}

function BuildScreen() {
  return (
    <div className="absolute top-16 left-52 right-4 bottom-4">
      <BuildMenu />
    </div>
  );
}
