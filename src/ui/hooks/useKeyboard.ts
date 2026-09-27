import { useEffect } from "react";

interface useKeyboardProps {
  onPause: () => void;
}

export default function useKeyboard({ onPause }: useKeyboardProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        return onPause();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });
}
