import { useEffect } from "react";
import { useGameStore } from "../../game/state/store";

const TICK_INTERVAL_MS = 200;

export function useGameClock() {
  const tick = useGameStore((s) => s.tick);

  useEffect(() => {
    const interval = setInterval(() => tick(Date.now()), TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [tick]);
}
