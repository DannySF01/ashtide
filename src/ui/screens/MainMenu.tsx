export function MainMenu({ onPlay }: { onPlay: () => void }) {
  return (
    <div className="absolute inset-0 bg-bg flex flex-col items-center justify-center gap-6">
      <div className="text-center">
        <div className="text-4xl font-bold text-text mb-2">🏝️ Ashtide</div>
        <div className="text-sm text-text-dim">Survive. Explore. Build.</div>
      </div>
      <button
        onClick={onPlay}
        className="px-8 py-3 bg-accent text-bg font-semibold rounded-md text-lg"
      >
        Play
      </button>
    </div>
  );
}
