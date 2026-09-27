import { useState } from "react";
import { MainMenu } from "./screens/MainMenu";
import { PlayScreen } from "./screens/PlayScreen";
import { PauseMenu } from "./screens/PauseMenu";
import { useGameClock } from "./hooks/useGameClock";
import useKeyboard from "./hooks/useKeyboard";

type Phase = "start" | "playing" | "paused";

export default function App() {
  const [phase, setPhase] = useState<Phase>("start");

  function togglePause() {
    if (phase === "playing") setPhase("paused");
    else if (phase === "paused") setPhase("playing");
  }

  useGameClock();
  useKeyboard({ onPause: () => togglePause() });

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg">
      {phase === "start" && <MainMenu onPlay={() => setPhase("playing")} />}
      {phase === "playing" && <PlayScreen onPause={() => setPhase("paused")} />}
      {phase === "paused" && <PauseMenu onResume={() => setPhase("playing")} />}
    </div>
  );
}
