"use client";

import { useMemo, useState } from "react";
import { BodyFigure, type MuscleRole } from "./BodyMap";
import { getTargeting } from "@/lib/muscle-index";
import { getMuscle, MUSCLES, type MuscleId } from "@/lib/muscles";

const LEGEND: { role: MuscleRole; label: string; swatch: string }[] = [
  { role: "primary", label: "Primary", swatch: "#e15d55" },
  { role: "secondary", label: "Secondary", swatch: "#3d7ec9" },
  { role: "tertiary", label: "Tertiary", swatch: "#6f9a3c" },
];

export function MuscleTargets({ practiceId }: { practiceId: string }) {
  const targeting = getTargeting(practiceId);
  const roles = useMemo(() => {
    const next: Partial<Record<MuscleId, MuscleRole>> = {};
    for (const id of targeting.tertiary) next[id] = "tertiary";
    for (const id of targeting.secondary) next[id] = "secondary";
    for (const id of targeting.primary) next[id] = "primary";
    return next;
  }, [targeting]);
  const live = useMemo(() => new Set(MUSCLES.map((muscle) => muscle.id)), []);
  const [hovered, setHovered] = useState<MuscleId | null>(null);
  const hoveredMuscle = hovered ? getMuscle(hovered) : null;
  const hoveredRole = hovered ? roles[hovered] : null;

  return (
    <section className="mt-5">
      <h2 className="font-display text-xl">Muscles</h2>
      <div className="mt-2 rounded-2xl bg-card px-3 py-3 ring-1 ring-ink/8">
        <div className="grid grid-cols-2 gap-2">
          {(["front", "back"] as const).map((view) => (
            <div key={view}>
              <BodyFigure
                view={view}
                selected={null}
                hovered={hovered}
                counts={{}}
                live={live}
                roles={roles}
                onSelect={() => undefined}
                onHover={setHovered}
                showCaption={false}
                className="mx-auto h-auto w-full"
              />
              <p className="text-center text-[0.65rem] tracking-[0.14em] uppercase text-ink/45">{view}</p>
            </div>
          ))}
        </div>
        <p className="min-h-5 px-2 pt-1 text-center text-sm text-ink/80">
          {hoveredMuscle
            ? `${hoveredMuscle.label}${hoveredRole ? ` · ${hoveredRole}` : ""}`
            : "Front and back. Color shows how much that muscle works."}
        </p>
        <ul className="mt-2 flex justify-center gap-3 text-xs text-ink/70">
          {LEGEND.map((item) => (
            <li key={item.role} className="flex items-center gap-1.5">
              <span className="inline-block size-2.5 rounded-full" style={{ background: item.swatch }} />
              {item.label}
            </li>
          ))}
        </ul>
        {targeting.notes ? <p className="mt-2 leading-relaxed text-ink/70">{targeting.notes}</p> : null}
      </div>
    </section>
  );
}
