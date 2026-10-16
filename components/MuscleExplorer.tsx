"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getMuscle, type MuscleDef, type MuscleId } from "@/lib/muscles";
import { roleOnMuscle } from "@/lib/muscle-index";
import type { Practice } from "@/lib/types";
import { BodyFigure } from "./BodyMap";
import { PracticeCard } from "./PracticeCard";

const ROLE_LABEL = {
  primary: "Primary",
  secondary: "Secondary",
  tertiary: "Also involved",
} as const;

const GROUPS: { label: string; ids: MuscleId[] }[] = [
  { label: "Head and trunk", ids: ["neck", "traps", "chest", "upper-back", "lats", "abs", "obliques", "diaphragm", "lower-back"] },
  { label: "Arms", ids: ["shoulders", "biceps", "triceps", "forearms"] },
  { label: "Hips and legs", ids: ["glutes", "hip-flexors", "hip-rotators", "quads", "hamstrings", "calves"] },
];

export function MuscleExplorer({
  muscles,
  exercises,
  initial,
}: {
  muscles: MuscleDef[];
  exercises: Partial<Record<MuscleId, Practice[]>>;
  initial?: MuscleId;
}) {
  const live = useMemo(() => new Set(muscles.map((muscle) => muscle.id)), [muscles]);
  const counts = useMemo(() => {
    const next: Partial<Record<MuscleId, number>> = {};
    for (const muscle of muscles) {
      next[muscle.id] = exercises[muscle.id]?.length ?? 0;
    }
    return next;
  }, [muscles, exercises]);

  const [selected, setSelected] = useState<MuscleId | null>(initial ?? null);
  const [hovered, setHovered] = useState<MuscleId | null>(null);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("m");
    if (param && live.has(param as MuscleId)) {
      const id = param as MuscleId;
      setSelected(id);
    }
  }, [live]);

  function choose(id: MuscleId) {
    setSelected(id);
    const url = new URL(window.location.href);
    url.searchParams.set("m", id);
    window.history.replaceState(null, "", url);
  }

  const muscle = selected ? getMuscle(selected) : null;
  const list = selected ? (exercises[selected] ?? []) : [];
  const order = { primary: 0, secondary: 1, tertiary: 2 } as const;
  const sorted = [...list].sort((a, b) => {
    if (!selected) {
      return 0;
    }
    const left = roleOnMuscle(a.id, selected);
    const right = roleOnMuscle(b.id, selected);
    return (left ? order[left] : 3) - (right ? order[right] : 3);
  });

  return (
    <div>
      <div className="rounded-2xl bg-card px-3 py-3 ring-1 ring-ink/8">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["front", "Front"],
              ["back", "Back"],
            ] as const
          ).map(([id, label]) => (
            <div key={id}>
              <BodyFigure
                view={id}
                selected={selected}
                hovered={hovered}
                counts={counts}
                live={live}
                onSelect={(muscleId) => choose(muscleId)}
                onHover={setHovered}
                showCaption={false}
                className="mx-auto h-auto w-full"
              />
              <p className="text-center text-[0.65rem] tracking-[0.14em] uppercase text-ink/45">{label}</p>
            </div>
          ))}
        </div>
        <p className="px-2 pt-1 text-center text-[0.7rem] leading-snug text-ink/45">
          Tap a muscle. Red marks the one you are looking at.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {GROUPS.map((group) => {
          const items = group.ids.filter((id) => live.has(id));
          if (items.length === 0) {
            return null;
          }
          return (
            <div key={group.label}>
              <p className="mb-1 text-[0.6rem] tracking-[0.14em] uppercase text-ink/45">{group.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {items.map((id) => {
                  const item = getMuscle(id);
                  const on = selected === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => choose(id)}
                      aria-pressed={on}
                      className={`min-h-8 rounded-full px-2.5 text-xs ${
                        on ? "bg-ink text-paper" : "bg-card text-ink/70 ring-1 ring-ink/10"
                      }`}
                    >
                      {item?.label}{" "}
                      <span className={on ? "text-paper/60" : "text-ink/40"}>{counts[id] ?? 0}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <section className="mt-6" aria-live="polite">
        {muscle ? (
          <>
            <p className="text-[0.65rem] tracking-[0.16em] uppercase text-ink/45">Selected</p>
            <h2 className="mt-1 font-display text-2xl text-ink">{muscle.label}</h2>
            <p className="text-xs text-ink/50">{muscle.latin}</p>
            <p className="mt-1.5 max-w-[24rem] text-sm leading-snug text-ink/70">{muscle.sentence}</p>
            <p className="mt-1 text-xs text-ink/50">
              {sorted.length} {sorted.length === 1 ? "exercise" : "exercises"} in the catalog
            </p>
            <div className="mt-3 space-y-1.5">
              {sorted.map((practice, index) => {
                const role = roleOnMuscle(practice.id, muscle.id);
                const prev = index > 0 ? roleOnMuscle(sorted[index - 1].id, muscle.id) : null;
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
            <p className="mt-3">
              <Link
                href={`/muscles/${muscle.id}`}
                className="text-sm text-ink underline decoration-ink/25 underline-offset-4"
              >
                Open {muscle.label} on its own page
              </Link>
            </p>
          </>
        ) : (
          <p className="rounded-2xl bg-card px-4 py-3 text-sm leading-snug text-ink/60 ring-1 ring-ink/8">
            Select a part of the body to see the workouts that target it.
          </p>
        )}
      </section>
    </div>
  );
}
