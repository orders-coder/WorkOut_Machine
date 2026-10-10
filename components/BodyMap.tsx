"use client";

import {
  defaultViewFor,
  shapesForView,
  BACK_SILHOUETTE,
  FRONT_SILHOUETTE,
  type BodyView,
} from "@/data/body-paths";
import { musclesInCatalog } from "@/lib/muscle-index";
import { getMuscle, type MuscleId } from "@/lib/muscles";

const BODY = "#d5e3f0";
const LINE = "#7ea4c4";
const HOT = "#e15d55";

function fillFor(selected: boolean, live: boolean): string {
  if (!live) {
    return "#e7eef5";
  }
  if (selected) {
    return HOT;
  }
  return BODY;
}

const FRONT_LINES = [
  "M100 104 L100 214",
  "M82 112 Q100 126 118 112",
  "M94 136 L106 136",
  "M94 154 L106 154",
  "M94 172 L106 172",
  "M94 190 L106 190",
  "M78 250 L92 360",
  "M122 250 L108 360",
  "M48 150 Q40 176 22 214",
  "M152 150 Q160 176 178 214",
];

const BACK_LINES = [
  "M100 100 L100 210",
  "M78 108 L100 136 L122 108",
  "M86 150 L114 150",
  "M84 172 L116 172",
  "M100 198 L100 236",
  "M78 250 L92 360",
  "M122 250 L108 360",
  "M48 150 Q40 176 22 214",
  "M152 150 Q160 176 178 214",
];

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
  const focus = hovered ?? selected;
  const label = focus ? getMuscle(focus) : null;

  return (
    <div>
    <svg
      viewBox="0 0 200 480"
      className={className}
      role="img"
      aria-label={`${view === "front" ? "Anterior" : "Posterior"} muscular figure. Select a muscle to see exercises.`}
    >
      <path
        d={view === "front" ? FRONT_SILHOUETTE : BACK_SILHOUETTE}
        fill={BODY}
        stroke={LINE}
        strokeWidth="1.4"
      />
      <ellipse
        cx="100"
        cy="46"
        rx="16"
        ry="20"
        fill={BODY}
        stroke={LINE}
        strokeWidth="1.4"
      />
      {shapes.map((shape) => {
        const isLive = live.has(shape.id);
        const isOn = selected === shape.id || hovered === shape.id;
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
          >
            {shape.paths.map((d) => (
              <path
                key={d}
                d={d}
                fill={fillFor(isOn, isLive)}
                stroke={isOn ? "#b42318" : LINE}
                strokeOpacity={isOn ? 0.9 : 0.55}
                strokeWidth={isOn ? 1.4 : 0.8}
              />
            ))}
          </g>
        );
      })}
      {(view === "front" ? FRONT_LINES : BACK_LINES).map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke={LINE}
          strokeWidth="1.1"
          strokeLinecap="round"
          pointerEvents="none"
        />
      ))}
    </svg>
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
