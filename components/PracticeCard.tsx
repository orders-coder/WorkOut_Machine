"use client";

import Link from "next/link";
import { loggingSummary } from "@/lib/logging";
import type { Practice } from "@/lib/types";
import { SPORT_LABEL } from "@/lib/labels";
import { resolveChosenImage } from "@/lib/media";
import { WayMarks } from "./WayMarks";
import { useLibrary } from "./LibraryProvider";

function VideoSearch({ name, className = "" }: { name: string; className?: string }) {
  return (
    <a
      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(name)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-7 items-center text-[0.7rem] font-medium text-[#0071e3] ${className}`}
    >
      Video
    </a>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      aria-hidden="true"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20s-7-4.4-9.2-8.2C1.2 8.8 3.1 5.5 6.4 5.5c1.8 0 3.3.9 4.1 2.3.8-1.4 2.3-2.3 4.1-2.3 3.3 0 5.2 3.3 3.6 6.3C19 15.6 12 20 12 20z"
      />
    </svg>
  );
}

export function PracticeCard({
  practice,
  layout,
}: {
  practice: Practice;
  layout: "grid" | "list";
}) {
  const { isFavorite, isInDumpster, isGone, toggleFavorite, state } = useLibrary();
  const favored = isFavorite(practice.id);
  const dumped = isInDumpster("exercise", practice.id);
  if (isGone("exercise", practice.id) && !dumped) {
    return null;
  }
  const sports = (practice.sports ?? []).filter((sport) => sport !== "general");
  const picture = resolveChosenImage(practice, state.photoChoice);
  const fade = dumped ? "opacity-40" : "";

  if (layout === "list") {
    return (
      <article className={`relative flex gap-3 rounded-2xl bg-card p-2 pr-2 shadow-sm ring-1 ring-ink/8 ${fade}`}>
        <Link href={`/practice/${practice.id}`} className="flex min-w-0 flex-1 gap-3">
          <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-wash">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={picture}
              alt={practice.imageAlt}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-col justify-center py-1">
            <WayMarks practice={practice} size="sm" />
            <h2 className="mt-0.5 font-display text-base leading-tight text-ink">
              {practice.name}
            </h2>
            {practice.logging ? (
              <p className="mt-0.5 text-[0.7rem] text-ink/55">{loggingSummary(practice.logging)}</p>
            ) : null}
            {sports.length > 0 ? (
              <p className="mt-0.5 text-[0.7rem] tracking-wide text-ink/50">
                {sports.map((sport) => SPORT_LABEL[sport]).join(" · ")}
              </p>
            ) : null}
          </div>
        </Link>
        <VideoSearch name={practice.name} className="self-center" />
        <button
          type="button"
          onClick={() => toggleFavorite(practice.id)}
          className="flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full text-strength-clay"
          aria-pressed={favored}
          aria-label={favored ? `Unfavorite ${practice.name}` : `Favorite ${practice.name}`}
        >
          <HeartIcon filled={favored} />
        </button>
      </article>
    );
  }

  return (
    <article className={`group relative overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-ink/5 ${fade}`}>
      <Link href={`/practice/${practice.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-wash">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={picture}
            alt={practice.imageAlt}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-0.5 px-1.5 pb-2 pt-1.5">
          <WayMarks practice={practice} size="sm" />
          <h2 className="font-display text-xs leading-snug text-ink">
            {practice.name}
          </h2>
          {practice.logging ? (
            <p className="text-[0.65rem] text-ink/55">{loggingSummary(practice.logging)}</p>
          ) : null}
          {sports.length > 0 ? (
            <p className="text-xs tracking-wide text-ink/50">
              {sports.map((sport) => SPORT_LABEL[sport]).join(" · ")}
            </p>
          ) : null}
        </div>
      </Link>
      <VideoSearch name={practice.name} className="px-1.5 pb-2" />
      <button
        type="button"
        onClick={() => toggleFavorite(practice.id)}
        className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-paper/80 text-strength-clay backdrop-blur-sm"
        aria-pressed={favored}
        aria-label={favored ? `Unfavorite ${practice.name}` : `Favorite ${practice.name}`}
      >
        <HeartIcon filled={favored} />
      </button>
    </article>
  );
}
