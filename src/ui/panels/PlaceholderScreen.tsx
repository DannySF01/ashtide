export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 bg-bg flex items-center justify-center">
      <div className="text-text-dim text-sm">{title} — coming soon.</div>
    </div>
  );
}
