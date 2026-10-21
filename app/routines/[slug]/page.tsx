import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DumpsterFade } from "@/components/DumpsterFade";
import { PracticeCard } from "@/components/PracticeCard";
import { Disclaimer } from "@/components/Disclaimer";
import { RoutineActions } from "@/components/RoutineActions";
import { exercisesInRoutine, getRoutine, isRoutineSlug, suggestedRoutines } from "@/data/routines";
import { attachPracticeMedia } from "@/lib/resolve-image";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return suggestedRoutines.map((routine) => ({ slug: routine.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const routine = getRoutine(slug);
  return { title: routine?.title ?? "Routine" };
}

export default async function RoutinePage({ params }: Props) {
  const { slug } = await params;
  if (!isRoutineSlug(slug)) {
    notFound();
  }
  const routine = getRoutine(slug);
  if (!routine) {
    notFound();
  }
  const exercises = exercisesInRoutine(routine).map(attachPracticeMedia);

  return (
    <DumpsterFade kind="routine" id={routine.slug}>
    <div className="px-3 pb-6 pt-1">
      <Link
        href="/routines"
        className="text-[0.65rem] tracking-[0.16em] uppercase text-ink/45"
      >
        Routines
      </Link>
      <h1 className="mt-1 font-display text-3xl text-ink">{routine.title}</h1>
      <p className="mt-1.5 max-w-[24rem] text-sm leading-snug text-ink/70">{routine.sentence}</p>
      <p className="mt-1 text-xs text-ink/50">
        {exercises.length} {exercises.length === 1 ? "exercise" : "exercises"} · suggested
      </p>
      {routine.tags ? <p className="mt-1 text-xs text-ink/45">{routine.tags.join(" · ")}</p> : null}
      <RoutineActions routine={routine} />
      <Link
        href={`/routines?routine=${routine.slug}`}
        className="mt-3 flex min-h-12 items-center justify-center rounded-full bg-[#0071e3] text-sm text-white"
      >
        Set up this routine
      </Link>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {exercises.map((practice) => (
          <PracticeCard key={practice.id} practice={practice} layout="grid" />
        ))}
      </div>

      {routine.credits ? (
        <p className="mt-6 text-xs leading-relaxed text-ink/60">
          Based on{" "}
          {routine.credits.map((credit, index) => (
            <span key={credit.href}>
              {index > 0 ? " and " : ""}
              <a href={credit.href} target="_blank" rel="noopener noreferrer" className="text-[#0071e3]">
                {credit.label}
              </a>
            </span>
          ))}
          .
        </p>
      ) : null}

      <footer className="mt-8">
        <Disclaimer />
      </footer>
    </div>
    </DumpsterFade>
  );
}
