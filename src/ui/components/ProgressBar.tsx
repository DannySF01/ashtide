interface ProgressBarProps {
  value: number;
  max: number;
  colorClass?: string;
  label?: string;
}

export function ProgressBar({
  value,
  max,
  colorClass = "bg-accent",
  label,
}: ProgressBarProps) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-text-dim mb-1">
          <span>{label}</span>
          <span>{Math.round(percent)}%</span>
        </div>
      )}
      <div className="h-1.5 bg-panel-border rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} rounded-full`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
