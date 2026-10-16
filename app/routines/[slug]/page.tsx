import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DumpsterFade } from "@/components/DumpsterFade";
import { PracticeCard } from "@/components/PracticeCard";
import { Disclaimer } from "@/components/Disclaimer";
import { FrontSplitsRoutine } from "@/components/FrontSplitsRoutine";
import { RoutineActions } from "@/components/RoutineActions";
import { LEG_STEP_IDS, type GuideStep } from "@/data/front-splits";
import { exerciseRecords } from "@/data/exercise-db";
import { exercisesInRoutine, getRoutine, isRoutineSlug, suggestedRoutines } from "@/data/routines";
import { getPracticeById } from "@/data/practices";
import { resolvePracticeImage } from "@/lib/resolve-image";

type Props = { params: Promise<{ slug: string }> };

function stepImage(id: string): string {
  const folder = path.join(process.cwd(), "public", "exercises", id);
  if (fs.existsSync(path.join(folder, "demo.gif"))) {
    return `/exercises/${id}/demo.gif`;
  }
  if (fs.existsSync(path.join(folder, "still.png"))) {
    return `/exercises/${id}/still.png`;
  }
  return resolvePracticeImage(id, "/practices/custom.svg");
}

function guideStep(id: string, side: GuideStep["side"]): GuideStep | undefined {
  const practice = getPracticeById(id);
  const record = exerciseRecords.find((item) => item.id === id);
  if (!practice || !record) {
    return undefined;
  }
  return {
    id,
    name: practice.name,
    image: stepImage(id),
    side,
    guide: (record.guide as GuideStep["guide"]) || "hold",
    seconds: record.duration_seconds ?? 30,
    minReps: record.min_reps ?? 0,
    cues: practice.cues,
    setup: practice.setup ?? record.setup ?? "",
    mistake: practice.mistakes[0] ?? "",
    why: record.why ?? "",
    moves: [],
  };
}

function frontSplitSteps(): GuideStep[] {
  const legs = LEG_STEP_IDS.flatMap((id) => {
    const step = guideStep(id, "right");
    return step ? [step] : [];
  });
  const left = legs.map((step) => ({ ...step, side: "left" as const }));
  const note: GuideStep = {
    id: "start-slow",
    name: "Start slow",
    image: "",
    side: "both",
    guide: "note",
    seconds: 0,
    minReps: 0,
    cues: ["Breathe a little harder.", "Get warm, not tired."],
    setup: "A warm muscle stretches further and more safely. Move easily for a few minutes before the first lunge, then begin.",
    mistake: "",
    why: "",
    moves: [],
  };
  const switchCard: GuideStep = {
    id: "switch-legs",
    name: "Switch legs",
    image: "/practices/custom.svg",
    side: "both",
    guide: "switch",
    seconds: 0,
    minReps: 0,
    cues: ["Shake it out.", "Set up the same sequence on your left leg."],
    setup: "",
    mistake: "",
    why: "",
    moves: [],
  };
  return [note, ...legs, switchCard, ...left];
}

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
  const exercises = exercisesInRoutine(routine).map((practice) => ({
    ...practice,
    image: resolvePracticeImage(practice.id, practice.image),
  }));

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
        {routine.slug === "front-splits-12" ? "Recovery · about 12 min a round" : `${exercises.length} ${exercises.length === 1 ? "exercise" : "exercises"} · suggested`}
      </p>
      {routine.tags ? <p className="mt-1 text-xs text-ink/45">{routine.tags.join(" · ")}</p> : null}
      <RoutineActions routine={routine} />

      {routine.slug === "front-splits-12" ? <FrontSplitsRoutine steps={frontSplitSteps()} /> : (
      <div className="mt-4 grid grid-cols-2 gap-2">
        {exercises.map((practice) => (
          <PracticeCard key={practice.id} practice={practice} layout="grid" />
        ))}
      </div>
      )}

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
