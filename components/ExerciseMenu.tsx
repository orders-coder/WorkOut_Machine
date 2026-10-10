"use client";

import { useRouter } from "next/navigation";
import type { Way } from "@/lib/types";

const GROUPS: { way: Way; label: string }[] = [
  { way: "soft-body", label: "Soft body" },
  { way: "strength", label: "Strength" },
];

export function ExerciseMenu({
  exercises,
  currentId,
}: {
  exercises: { id: string; name: string; way: Way }[];
  currentId: string;
}) {
  const router = useRouter();

  return (
    <label className="block px-3 pt-3">
      <span className="text-[0.65rem] tracking-[0.16em] uppercase text-ink/45">Exercises</span>
      <select
        value={currentId}
        aria-label="Go to another exercise"
        onChange={(event) => router.push(`/practice/${event.target.value}`)}
        className="mt-1 w-full appearance-none rounded-xl bg-card px-3 py-2.5 text-sm text-ink ring-1 ring-ink/10"
      >
        {GROUPS.map((group) => {
          const items = exercises
            .filter((exercise) => exercise.way === group.way)
            .sort((a, b) => a.name.localeCompare(b.name));
          if (items.length === 0) {
            return null;
          }
          return (
            <optgroup key={group.way} label={group.label}>
              {items.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
    </label>
  );
}
