import Link from "next/link";
import { PROFESSIONS, type Profession } from "@/lib/types";

export default function PlayPage() {
  const professions = Object.entries(PROFESSIONS) as [
    Profession,
    (typeof PROFESSIONS)[Profession]
  ][];

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm font-display mb-4 block">
            ← Back
          </Link>
          <h1 className="font-display font-black text-3xl md:text-4xl gold-shimmer mb-2">
            Choose Your Game Mode
          </h1>
          <p className="text-gray-400 text-sm">
            Pick a profession or test your general knowledge
          </p>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {professions.map(([slug, info]) => (
            <Link
              key={slug}
              href={`/play/game?mode=${slug}`}
              className="wwtbam-card p-5 text-center hover:scale-105 transition-all duration-200 group"
            >
              <span className="text-4xl block mb-3">{info.emoji}</span>
              <h2 className="font-display font-bold text-yellow-400 text-sm group-hover:text-yellow-300 transition-colors">
                {info.label}
              </h2>
              <p className="text-gray-500 text-xs mt-1 leading-snug">{info.description}</p>
              {slug === "random" && (
                <span className="inline-block mt-2 text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-700 px-2 py-0.5 rounded-full font-display">
                  Classic
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Info */}
        <p className="text-center text-gray-600 text-xs mt-8 font-display">
          15 questions · 3 lifelines · prize ladder up to $1,000,000
        </p>
      </div>
    </main>
  );
}
