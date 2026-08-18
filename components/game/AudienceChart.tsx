"use client";

const LETTERS = ["A", "B", "C", "D"];

interface AudienceChartProps {
  results: number[];
}

export function AudienceChart({ results }: AudienceChartProps) {
  const max = Math.max(...results, 1);

  return (
    <div className="surface p-7 animate-fade-in-up">
      <p className="t-caption mb-5">Ask the Audience</p>

      <div className="flex items-end justify-between gap-4 h-28">
        {results.map((pct, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <span className="t-stat text-sm">{pct}%</span>
            <div
              className="w-full max-w-14 bio-bg rounded-t-[6px] transition-all duration-700 ease-out"
              style={{ height: `${Math.max((pct / max) * 76, 3)}px` }}
            />
            <span className="t-caption">{LETTERS[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
