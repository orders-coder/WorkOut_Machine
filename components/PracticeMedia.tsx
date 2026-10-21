"use client";

import { useState } from "react";
import type { Practice, ResolvedPracticeMedia } from "@/lib/types";
import { DRAWING_CHOICE } from "@/lib/types";
import { getPracticeMedia, resolveChosenImage } from "@/lib/media";
import { ExerciseVisual } from "./ExerciseVisual";
import { useLibrary } from "./LibraryProvider";

const WAY_WASH = {
  inner: "bg-inner-wash",
  "soft-body": "bg-soft-wash",
  strength: "bg-strength-wash",
} as const;

export function PracticeMedia({ practice }: { practice: Practice }) {
  const { state, setPhotoChoice } = useLibrary();
  const media = getPracticeMedia(practice.id);
  const choice = state.photoChoice[practice.id] ?? DRAWING_CHOICE;
  const hero = resolveChosenImage(practice, state.photoChoice);
  const photos = media.photos;
  const drawing = choice === DRAWING_CHOICE;
  const [annotated, setAnnotated] = useState(false);
  const visual: ResolvedPracticeMedia =
    drawing && practice.visual
      ? practice.visual
      : {
          type: "still",
          src: hero,
          fallback: practice.visual?.fallback || "/practices/custom.svg",
        };
  const showAnnotated = drawing && Boolean(practice.visual?.annotated);

  return (
    <div>
      <div className={`px-3 py-3 ${WAY_WASH[practice.way]}`}>
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-paper/50">
          <ExerciseVisual
            media={visual}
            alt={practice.imageAlt}
            annotated={showAnnotated && annotated}
            className="h-full w-full object-contain"
          />
        </div>
        {showAnnotated ? (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              aria-pressed={annotated}
              onClick={() => setAnnotated((on) => !on)}
              className={`min-h-8 rounded-full px-3 text-[0.7rem] tracking-wide ${
                annotated ? "bg-ink text-paper" : "bg-card text-ink ring-1 ring-ink/10"
              }`}
            >
              Annotated
            </button>
          </div>
        ) : null}
      </div>

      {photos.length > 0 ? (
        <div className="px-3 pt-2">
          <p className="text-[0.65rem] tracking-[0.14em] uppercase text-ink/45">
            Choose a picture
          </p>
          <ul className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
            <li className="shrink-0">
              <button
                type="button"
                onClick={() => setPhotoChoice(practice.id, DRAWING_CHOICE)}
                aria-pressed={choice === DRAWING_CHOICE}
                className={`block overflow-hidden rounded-2xl ring-2 ${
                  choice === DRAWING_CHOICE ? "ring-ink" : "ring-transparent"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={practice.image}
                  alt="Line drawing"
                  className="h-16 w-14 object-cover"
                />
              </button>
              <p className="mt-1 text-center text-[0.65rem] uppercase tracking-wide text-ink/45">
                Drawing
              </p>
            </li>
            {photos.map((photo, index) => {
              const active = choice === photo.id;
              return (
                <li key={photo.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setPhotoChoice(practice.id, photo.id)}
                    aria-pressed={active}
                    className={`block overflow-hidden rounded-2xl ring-2 ${
                      active ? "ring-ink" : "ring-transparent"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src}
                      alt={`Option ${index + 1}`}
                      className="h-16 w-14 object-cover"
                    />
                  </button>
                  <p className="mt-1 max-w-20 text-center text-[0.65rem] uppercase tracking-wide text-ink/45">
                    Photo {index + 1}
                  </p>
                </li>
              );
            })}
          </ul>
          {choice !== DRAWING_CHOICE ? (
            <p className="mt-2 text-xs leading-relaxed text-ink/45">
              {photos.find((photo) => photo.id === choice)?.attribution} ·{" "}
              {photos.find((photo) => photo.id === choice)?.license}
            </p>
          ) : null}
        </div>
      ) : null}

      {media.links.length > 0 ? (
        <div className="px-3 pt-3">
          <p className="text-[0.65rem] tracking-[0.14em] uppercase text-ink/45">From the web</p>
          <ul className="mt-1 space-y-1">
            {media.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink underline decoration-ink/25 underline-offset-4"
                >
                  {link.title}
                </a>
                <span className="ml-2 text-xs uppercase tracking-wide text-ink/40">{link.kind}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
