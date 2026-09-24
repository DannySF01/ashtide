import { ResourcesBar } from "./panels/ResourcesBar";
import { CharacterPanel } from "./panels/CharacterPanel";
import { ActionsList } from "./panels/ActionsList";
import { EventLog } from "./panels/EventLog";
import { useGameClock } from "./hooks/useGameClock";
import { TimeDisplay } from "./panels/TimeDisplay";
import { TerrainPanel } from "./panels/TerrainPanel";
import { BuildingsPanel } from "./panels/BuildingsPanel";
import { BaseCanvas } from "./panels/BaseCanvas";
import { BuildMenu } from "./panels/BuildMenu";

export default function App() {
  useGameClock();

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ashtide</h1>
        <TimeDisplay />
      </div>
      <BaseCanvas />
      <ResourcesBar />
      <div className="grid gap-4 sm:grid-cols-2">
        <CharacterPanel />
        <ActionsList />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TerrainPanel />
        <BuildMenu />
      </div>
      <BuildingsPanel />
      <EventLog />
    </div>
  );
}
