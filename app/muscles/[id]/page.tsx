import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MiniBody } from "@/components/BodyMap";
import { Disclaimer } from "@/components/Disclaimer";
import { PracticeCard } from "@/components/PracticeCard";
import { MUSCLES, getMuscle, isMuscleId } from "@/lib/muscles";
import { exercisesForMuscle, roleOnMuscle } from "@/lib/muscle-index";
import { resolvePracticeImage } from "@/lib/resolve-image";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return MUSCLES.map((muscle) => ({ id: muscle.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: getMuscle(id)?.label ?? "Muscle" };
}

const ROLE_LABEL = {
  primary: "Primary",
  secondary: "Secondary",
  tertiary: "Tertiary",
} as const;

export default async function MusclePage({ params }: Props) {
  const { id } = await params;
  if (!isMuscleId(id)) {
    notFound();
  }
  const muscle = getMuscle(id);
  if (!muscle) {
    notFound();
  }
  const order = { primary: 0, secondary: 1, tertiary: 2 } as const;
  const exercises = exercisesForMuscle(id)
    .map((practice) => ({
      ...practice,
      image: resolvePracticeImage(practice.id, practice.image),
    }))
    .sort((a, b) => {
      const left = roleOnMuscle(a.id, id);
      const right = roleOnMuscle(b.id, id);
      return (left ? order[left] : 3) - (right ? order[right] : 3);
    });

  return (
    <div className="px-3 pb-6 pt-1">
      <Link href={`/muscles?m=${id}`} className="text-[0.65rem] tracking-[0.16em] uppercase text-ink/45">
        Muscles
      </Link>
      <div className="mt-2 flex items-start gap-3">
        <div className="w-[5.5rem] shrink-0 rounded-2xl bg-card px-1 py-2 ring-1 ring-ink/8">
          <MiniBody id={id} />
        </div>
        <div className="min-w-0 pt-1">
          <h1 className="font-display text-3xl leading-tight text-ink">{muscle.label}</h1>
          <p className="mt-0.5 text-xs text-ink/50">{muscle.latin}</p>
          <p className="mt-1.5 text-sm leading-snug text-ink/70">{muscle.sentence}</p>
        </div>
      </div>
      <p className="mt-1 text-xs text-ink/50">
        {exercises.length} {exercises.length === 1 ? "exercise" : "exercises"}
      </p>

      <div className="mt-4 space-y-1.5">
        {exercises.map((practice, index) => {
          const role = roleOnMuscle(practice.id, id);
          const prev = index > 0 ? roleOnMuscle(exercises[index - 1].id, id) : null;
          return (
            <div key={practice.id}>
              {role && role !== prev ? (
                <p className="mb-1 mt-2 text-[0.6rem] tracking-[0.14em] uppercase text-ink/45">
                  {ROLE_LABEL[role]}
                </p>
              ) : null}
              <PracticeCard practice={practice} layout="list" />
            </div>
          );
        })}
      </div>

      <footer className="mt-8">
        <Disclaimer />
      </footer>
    </div>
  );
}
