"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadCustomExercises, type CustomExercise } from "@/lib/custom-exercises";
import { EQUIPMENT_LABEL, LEVEL_LABEL } from "@/lib/labels";
import { MUSCLES } from "@/lib/muscles";

export function CustomExercisePage({ id }: { id: string }) {
  const [exercise, setExercise] = useState<CustomExercise | null | undefined>(undefined);

  useEffect(() => {
    setExercise(loadCustomExercises().find((item) => item.id === id) ?? null);
  }, [id]);

  if (exercise === undefined) {
    return null;
  }
  if (!exercise) {
    return (
      <div className="px-3 pt-6">
        <p className="text-sm text-ink/70">That exercise is not on this phone.</p>
        <Link href="/exercises" className="mt-4 inline-flex min-h-11 items-center text-sm text-[#0071e3]">
          Back to exercises
        </Link>
      </div>
    );
  }

  return (
    <article className="px-3 pb-6 pt-3">
      <Link href="/exercises" className="text-sm text-[#0071e3]">
        Exercises
      </Link>
      <h1 className="mt-3 font-display text-4xl leading-none tracking-tight text-ink">{exercise.name}</h1>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-ink/45">Level</dt>
          <dd>{LEVEL_LABEL[exercise.level]}</dd>
        </div>
        <div>
          <dt className="text-ink/45">Muscles</dt>
          <dd>{exercise.muscles.map((id) => MUSCLES.find((muscle) => muscle.id === id)?.label ?? id).join(", ")}</dd>
        </div>
        <div>
          <dt className="text-ink/45">Equipment</dt>
          <dd>{EQUIPMENT_LABEL[exercise.equipment]}</dd>
        </div>
        <div>
          <dt className="text-ink/45">{exercise.dose === "seconds" ? "Count" : "Reps"}</dt>
          <dd>{exercise.dose === "seconds" ? "Hold" : exercise.repRange || "Reps"}</dd>
        </div>
      </dl>
      <a
        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex min-h-11 items-center justify-center rounded-full bg-[#0071e3] text-sm text-white"
      >
        Video
      </a>
    </article>
  );
}
