"use client";

const LETTERS = ["A", "B", "C", "D"];

interface AudienceChartProps {
  results: number[]; // [pctA, pctB, pctC, pctD]
}

export function AudienceChart({ results }: AudienceChartProps) {
  return (
    <div className="wwtbam-card p-4 mt-4">
      <p className="text-center text-xs font-display text-gold mb-3 uppercase tracking-widest">
        Ask the Audience
      </p>
      <div className="flex items-end justify-center gap-4 h-24">
        {results.map((pct, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-xs text-white font-bold">{pct}%</span>
            <div
              className="w-10 bg-blue-500 rounded-t transition-all duration-700 ease-out"
              style={{ height: `${(pct / 100) * 80}px` }}
            />
            <span className="text-xs font-display text-gold-300">
              {LETTERS[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
