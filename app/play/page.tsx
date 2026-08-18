import Link from "next/link";
import { PROFESSIONS, type Profession } from "@/lib/types";

export default function PlayPage() {
  const professions = Object.entries(PROFESSIONS) as [
    Profession,
    (typeof PROFESSIONS)[Profession]
  ][];

  return (
    <main className="abyss-glow min-h-screen px-5 py-20">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-12">
        {/* ── Header ── */}
        <div className="flex flex-col items-center gap-5 text-center animate-fade-in-up">
          <Link href="/" className="btn-ghost">
            ← Back
          </Link>
          <h1 className="t-heading-lg">Choose Your Mode</h1>
          <p className="t-body max-w-md">
            Pick a profession to be tested on your field, or take on general
            knowledge.
          </p>
        </div>

        {/* ── Mode grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in-up">
          {professions.map(([slug, info]) => (
            <Link
              key={slug}
              href={`/play/game?mode=${slug}`}
              className="surface-interactive p-9 flex flex-col gap-4 group"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-3xl leading-none">{info.emoji}</span>
                <span className="btn-arrow opacity-0 group-hover:opacity-100 transition-opacity">
                  ↗
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="t-label">{info.label}</h2>
                <p className="t-body-sm">{info.description}</p>
              </div>

              {slug === "random" && (
                <span className="t-caption bio-bg text-abyss px-2.5 py-1 rounded-[6px] self-start mt-1">
                  Classic
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* ── Footer note ── */}
        <p className="t-caption text-center">
          15 Questions · 3 Lifelines · Up to $1,000,000
        </p>
      </div>
    </main>
  );
}
