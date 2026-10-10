"use client";

import { useState } from "react";
import { defaultViewFor, shapesForView, type BodyView } from "@/data/body-paths";
import { musclesInCatalog } from "@/lib/muscle-index";
import { getMuscle, type MuscleId } from "@/lib/muscles";

export function BodyFigure({
  view,
  selected,
  hovered,
  counts,
  live,
  onSelect,
  onHover,
  interactive = true,
  showCaption = true,
  className = "mx-auto h-auto w-full max-w-[11rem]",
}: {
  view: BodyView;
  selected: MuscleId | null;
  hovered: MuscleId | null;
  counts: Partial<Record<MuscleId, number>>;
  live: Set<MuscleId>;
  onSelect: (id: MuscleId) => void;
  onHover: (id: MuscleId | null) => void;
  interactive?: boolean;
  showCaption?: boolean;
  className?: string;
}) {
  const shapes = shapesForView(view);
  const [focused, setFocused] = useState<MuscleId | null>(null);
  const focus = hovered ?? focused ?? selected;
  const label = focus ? getMuscle(focus) : null;

  return (
    <div className={className}>
    <div className="relative mx-auto aspect-[342/670] w-full max-w-[11rem] overflow-hidden">
      <img
        src={`/muscle-map/body-${view}.png`}
        alt=""
        className="absolute max-w-none"
        style={{ width: "374.27%", height: "107.46%", left: "-136.84%", top: "-1.79%" }}
      />
      {shapes.map((shape) => {
        const src = getMuscle(shape.id)?.overlay?.[view];
        if (!src) {
          return null;
        }
        const lit = selected === shape.id || hovered === shape.id || focused === shape.id;
        return (
          <img
            key={`${view}-glow-${shape.id}`}
            src={src}
            alt=""
            className="pointer-events-none absolute max-w-none transition-opacity duration-150"
            style={{
              width: "374.27%",
              height: "107.46%",
              left: "-136.84%",
              top: "-1.79%",
              opacity: lit ? 0.85 : 0,
              filter: lit ? "drop-shadow(0 0 6px rgba(225, 93, 85, 0.85))" : undefined,
            }}
          />
        );
      })}
      <svg
        viewBox="0 0 1280 720"
        className="absolute max-w-none"
        style={{ width: "374.27%", height: "107.46%", left: "-136.84%", top: "-1.79%" }}
        role="img"
        aria-label={`${view === "front" ? "Front" : "Back"} of the body. Select a muscle to see exercises.`}
      >
        {shapes.map((shape) => {
          const isLive = live.has(shape.id);
          return (
            <g
              key={`${view}-${shape.id}`}
              role={isLive && interactive ? "button" : "presentation"}
              tabIndex={isLive && interactive ? 0 : undefined}
              aria-label={isLive ? getMuscle(shape.id)?.label : undefined}
              aria-pressed={selected === shape.id}
              className={isLive && interactive ? "cursor-pointer outline-none" : undefined}
              onClick={() => {
                if (isLive && interactive) {
                  onSelect(shape.id);
                }
              }}
              onKeyDown={(event) => {
                if (!isLive || !interactive) {
                  return;
                }
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(shape.id);
                }
              }}
              onMouseEnter={() => onHover(shape.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => setFocused(shape.id)}
              onBlur={() => setFocused((current) => (current === shape.id ? null : current))}
            >
              {shape.paths.map((d) => (
                <path key={d} d={d} fill="transparent" />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
      {showCaption ? (
        <p className="mt-1 min-h-5 text-center text-xs text-ink/70">
          {label ? `${label.label} · ${counts[label.id] ?? 0} exercises` : "Tap a muscle"}
        </p>
      ) : null}
    </div>
  );
}

export function MiniBody({ id }: { id: MuscleId }) {
  const view = defaultViewFor(id);
  const live = new Set(musclesInCatalog().map((muscle) => muscle.id));
  const counts = Object.fromEntries(
    [...live].map((muscle) => [muscle, muscle === id ? 12 : 3]),
  ) as Partial<Record<MuscleId, number>>;
  return (
    <BodyFigure
      view={view}
      selected={id}
      hovered={null}
      counts={counts}
      live={live}
      onSelect={() => undefined}
      onHover={() => undefined}
      interactive={false}
      showCaption={false}
    />
  );
}
