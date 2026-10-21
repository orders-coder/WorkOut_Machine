import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DetailActions } from "@/components/DetailActions";
import { ExerciseMenu } from "@/components/ExerciseMenu";
import { DumpsterFade } from "@/components/DumpsterFade";
import { Disclaimer } from "@/components/Disclaimer";
import { ExerciseGuide } from "@/components/ExerciseGuide";
import { MuscleTargets } from "@/components/MuscleTargets";
import { CustomExercisePage } from "@/components/CustomExercisePage";
import { PastSets } from "@/components/LiveWorkout";
import { PracticeMedia } from "@/components/PracticeMedia";
import { WayMarks } from "@/components/WayMarks";
import { resolveExerciseId } from "@/lib/legacy-ids";
import { getPracticeById, getRelatedPractices, practices } from "@/data/practices";
import {
  CONTRACTION_LABEL,
  EQUIPMENT_LABEL,
  FORCE_LABEL,
  INTENT_LABEL,
  LATERALITY_LABEL,
  LEVEL_LABEL,
  MOVEMENT_LABEL,
  SPORT_LABEL,
} from "@/lib/labels";
import { attachPracticeMedia } from "@/lib/resolve-image";
import { ExerciseVisual } from "@/components/ExerciseVisual";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return practices.map((practice) => ({ id: practice.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const alias = resolveExerciseId(id);
  const practice = getPracticeById(alias);
  return { title: practice?.name ?? "Practice" };
}

export default async function PracticePage({ params }: Props) {
  const { id } = await params;
  const alias = resolveExerciseId(id);
  if (alias !== id) {
    redirect(`/practice/${alias}`);
  }
  const practice = getPracticeById(id);
  if (!practice) {
    if (id.startsWith("custom-")) {
      return <CustomExercisePage id={id} />;
    }
    notFound();
  }
  const shown = attachPracticeMedia(practice);
  const related = getRelatedPractices(practice).map(attachPracticeMedia);
  const sports = (practice.sports ?? []).filter((sport) => sport !== "general");

  return (
    <DumpsterFade kind="exercise" id={practice.id}>
    <article>
      <ExerciseMenu
        currentId={practice.id}
        exercises={practices.map((item) => ({
          id: item.id,
          name: item.name,
          way: item.way,
        }))}
      />
      <PracticeMedia practice={shown} />
      <div className="px-3 pb-6 pt-3">
        <div>
          <WayMarks practice={practice} />
        </div>
        <h1 className="mt-1.5 font-display text-4xl leading-none tracking-tight text-ink">{practice.name}</h1>
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(practice.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex min-h-11 items-center justify-center rounded-full bg-[#0071e3] text-sm text-white"
        >
          Video
        </a>
        {practice.aka?.length ? (
          <p className="mt-1 text-xs text-ink/50">{practice.aka.join(" · ")}</p>
        ) : null}

        <dl className="mt-3 grid grid-cols-2 gap-1.5 text-sm">
          <div className="rounded-xl bg-card px-3 py-2 ring-1 ring-ink/8">
            <dt className="text-[0.6rem] tracking-[0.14em] uppercase text-ink/45">Level</dt>
            <dd className="mt-0.5">{LEVEL_LABEL[practice.level]}</dd>
          </div>
          {practice.durationHint ? (
            <div className="rounded-xl bg-card px-3 py-2 ring-1 ring-ink/8">
              <dt className="text-[0.6rem] tracking-[0.14em] uppercase text-ink/45">Time</dt>
              <dd className="mt-0.5">{practice.durationHint}</dd>
            </div>
          ) : null}
          <div className="col-span-2 rounded-xl bg-card px-3 py-2 ring-1 ring-ink/8">
            <dt className="text-[0.6rem] tracking-[0.14em] uppercase text-ink/45">Equipment</dt>
            <dd className="mt-0.5">
              {practice.equipment.map((item) => EQUIPMENT_LABEL[item]).join(" · ")}
            </dd>
          </div>
          {sports.length > 0 ? (
            <div className="col-span-2 rounded-xl bg-card px-3 py-2 ring-1 ring-ink/8">
              <dt className="text-[0.6rem] tracking-[0.14em] uppercase text-ink/45">Sports</dt>
              <dd className="mt-0.5">{sports.map((sport) => SPORT_LABEL[sport]).join(" · ")}</dd>
            </div>
          ) : null}
        </dl>

        <ExerciseGuide practice={practice} />

        <MuscleTargets practiceId={practice.id} />

        {practice.training ? (
          <section className="mt-5">
            <h2 className="font-display text-xl">Training</h2>
            <dl className="mt-2 grid grid-cols-2 gap-1.5 text-sm">
              <div className="rounded-xl bg-card px-3 py-2 ring-1 ring-ink/8">
                <dt className="text-[0.6rem] tracking-[0.14em] uppercase text-ink/45">Pattern</dt>
                <dd className="mt-0.5">{MOVEMENT_LABEL[practice.training.movementPattern]}</dd>
              </div>
              <div className="rounded-xl bg-card px-3 py-2 ring-1 ring-ink/8">
                <dt className="text-[0.6rem] tracking-[0.14em] uppercase text-ink/45">Force</dt>
                <dd className="mt-0.5">{FORCE_LABEL[practice.training.forceType]}</dd>
              </div>
              <div className="rounded-xl bg-card px-3 py-2 ring-1 ring-ink/8">
                <dt className="text-[0.6rem] tracking-[0.14em] uppercase text-ink/45">Sides</dt>
                <dd className="mt-0.5">{LATERALITY_LABEL[practice.training.laterality]}</dd>
              </div>
              <div className="rounded-xl bg-card px-3 py-2 ring-1 ring-ink/8">
                <dt className="text-[0.6rem] tracking-[0.14em] uppercase text-ink/45">Intent</dt>
                <dd className="mt-0.5">{INTENT_LABEL[practice.training.intent]}</dd>
              </div>
              <div className="rounded-xl bg-card px-3 py-2 ring-1 ring-ink/8">
                <dt className="text-[0.6rem] tracking-[0.14em] uppercase text-ink/45">Reps</dt>
                <dd className="mt-0.5">{practice.training.defaultRepRange}</dd>
              </div>
              <div className="rounded-xl bg-card px-3 py-2 ring-1 ring-ink/8">
                <dt className="text-[0.6rem] tracking-[0.14em] uppercase text-ink/45">Rest</dt>
                <dd className="mt-0.5">{practice.training.defaultRestSeconds}s</dd>
              </div>
              <div className="col-span-2 rounded-xl bg-card px-3 py-2 ring-1 ring-ink/8">
                <dt className="text-[0.6rem] tracking-[0.14em] uppercase text-ink/45">Tempo</dt>
                <dd className="mt-0.5">
                  {practice.training.tempoSuggestion}
                  {" · "}
                  {CONTRACTION_LABEL[practice.training.dominantContraction]}
                </dd>
              </div>
              <div className="col-span-2 rounded-xl bg-card px-3 py-2 ring-1 ring-ink/8">
                <dt className="text-[0.6rem] tracking-[0.14em] uppercase text-ink/45">Posture</dt>
                <dd className="mt-0.5">{practice.training.postureAlignmentTags.join(" · ")}</dd>
              </div>
            </dl>
            {practice.training.contraindications.length > 0 ? (
              <p className="mt-2 text-sm text-strength-clay">
                Skip if: {practice.training.contraindications.join("; ")}
              </p>
            ) : null}
            <ol className="mt-3 space-y-1">
              {practice.training.progressionPath.map((stepName) => {
                const step =
                  getPracticeById(stepName) ??
                  practices.find(
                    (item) => item.name.toLowerCase() === stepName.toLowerCase(),
                  );
                return (
                  <li key={stepName} className="text-sm">
                    {step ? (
                      <Link href={`/practice/${step.id}`} className="underline decoration-ink/20">
                        {step.name}
                      </Link>
                    ) : (
                      <span className="text-ink/45">{stepName}</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        ) : null}

        {practice.tags.length > 0 ? (
          <p className="mt-4 text-xs text-ink/45">{practice.tags.join(" · ")}</p>
        ) : null}

        <DetailActions practice={practice} />
        <PastSets practiceId={practice.id} />

        {related.length > 0 ? (
          <section className="mt-6">
            <h2 className="font-display text-xl">Related</h2>
            <ul className="mt-2 space-y-1.5">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/practice/${item.id}`}
                    className="flex gap-3 rounded-2xl bg-card p-2 ring-1 ring-ink/8"
                  >
                    <div className="relative aspect-video h-16 overflow-hidden rounded-xl bg-wash">
                      <ExerciseVisual
                        media={
                          item.visual ?? {
                            type: "still",
                            src: item.image,
                            fallback: "/practices/custom.svg",
                          }
                        }
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <WayMarks practice={item} size="sm" />
                      <p className="mt-1 font-display text-lg">{item.name}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <Disclaimer className="mt-8" />
      </div>
    </article>
    </DumpsterFade>
  );
}
