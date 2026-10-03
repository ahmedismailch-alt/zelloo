import type { Bar } from "../../lib/order-stats";

type StatsBarsProps = {
  title: string;
  description?: string;
  bars: Bar[];
  formatValue: (value: number) => string;
  labelEvery?: number;
  formatPeak?: (bar: Bar) => string;
};

export function StatsBars({ title, description, bars, formatValue, labelEvery = 1, formatPeak }: StatsBarsProps) {
  const max = Math.max(0, ...bars.map((bar) => bar.value));
  const peak = bars.find((bar) => bar.value === max && max > 0);

  return (
    <section className="bg-white border rounded-2xl p-5 mt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black">{title}</h2>
          {description && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>}
        </div>
        {peak && (
          <p className="text-right shrink-0">
            <span className="block text-xs text-gray-500">Spitze</span>
            <span className="block font-bold text-orange-600">{formatPeak ? formatPeak(peak) : peak.label}</span>
          </p>
        )}
      </div>

      <div
        className="flex items-end gap-1 h-40 mt-5"
        role="img"
        aria-label={`${title}: ${bars.map((bar) => `${bar.label} ${formatValue(bar.value)}`).join(", ")}`}
      >
        {bars.map((bar) => {
          const height = max > 0 ? Math.max(bar.value > 0 ? 4 : 0, (bar.value / max) * 100) : 0;
          const isPeak = peak?.key === bar.key;
          return (
            <div key={bar.key} className="flex-1 h-full flex flex-col justify-end" title={`${bar.label}: ${formatValue(bar.value)}`}>
              <div
                className={`w-full rounded-t-md ${isPeak ? "bg-orange-500" : "bg-black"}`}
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 mt-2 border-t pt-2" aria-hidden="true">
        {bars.map((bar, index) => (
          <span key={bar.key} className="flex-1 text-center text-[10px] leading-tight text-gray-500 overflow-hidden">
            {index % labelEvery === 0 ? bar.label : ""}
          </span>
        ))}
      </div>
    </section>
  );
}
