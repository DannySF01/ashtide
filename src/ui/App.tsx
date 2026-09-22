import { ResourcesBar } from "./panels/ResourcesBar";
import { CharacterPanel } from "./panels/CharacterPanel";
import { ActionsList } from "./panels/ActionsList";
import { EventLog } from "./panels/EventLog";
import { useGameClock } from "./hooks/useGameClock";

export default function App() {
  useGameClock();

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Ashtide</h1>
      <ResourcesBar />
      <div className="grid gap-4 sm:grid-cols-2">
        <CharacterPanel />
        <ActionsList />
      </div>
      <EventLog />
    </div>
  );
}
