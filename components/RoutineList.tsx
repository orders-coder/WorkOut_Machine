"use client";

import Link from "next/link";
import { suggestedRoutines } from "@/data/routines";
import { useLibrary } from "./LibraryProvider";

export function RoutineList({
  heading,
  intro,
  emptyMine,
}: {
  heading: string;
  intro: string;
  emptyMine: string;
}) {
  const { isGone, askToDelete } = useLibrary();
  const live = suggestedRoutines.filter((routine) => !isGone("routine", routine.slug));

  return (
    <div className="px-3 pb-6 pt-1">
      <p className="text-[0.65rem] tracking-[0.18em] uppercase text-ink/45">
        Work Out Machine
      </p>
      <h1 className="mt-1 font-display text-[2.35rem] leading-none tracking-tight text-ink">{heading}</h1>
      <p className="mt-1.5 max-w-[24rem] text-sm leading-snug text-ink/70">{intro}</p>

      <section className="mt-5">
        <h2 className="font-display text-xl text-ink">Your routines</h2>
        <p className="mt-2 rounded-2xl bg-card px-4 py-3 text-sm leading-snug text-ink/60 ring-1 ring-ink/8">
          {emptyMine}
        </p>
      </section>

      <section className="mt-5">
        <h2 className="font-display text-xl text-ink">Suggested</h2>
        {live.length === 0 ? (
          <p className="mt-2 text-sm text-ink/55">All suggestions are in the dumpster.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {live.map((routine) => (
              <li key={routine.slug} className="relative">
                <Link
                  href={`/routines/${routine.slug}`}
                  className="block rounded-3xl bg-card px-4 py-4 pr-20 shadow-sm ring-1 ring-ink/8"
                >
                  <p className="text-[0.65rem] tracking-[0.14em] uppercase text-ink/45">
                    {routine.goal === "muscle" ? "Strength" : "Soft body"} ·{" "}
                    {routine.exerciseIds.length} exercises
                  </p>
                  <h3 className="mt-1 font-display text-2xl text-ink">{routine.title}</h3>
                  <p className="mt-1 text-sm leading-snug text-ink/70">{routine.sentence}</p>
                </Link>
                <button
                  type="button"
                  onClick={() => askToDelete("routine", routine.slug, routine.title)}
                  className="absolute right-2 top-2 min-h-8 rounded-full bg-paper px-2.5 text-xs text-ink/60 ring-1 ring-ink/10"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
