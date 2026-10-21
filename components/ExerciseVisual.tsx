"use client";

import { useState } from "react";
import type { ResolvedPracticeMedia } from "@/lib/types";

const CUSTOM = "/practices/custom.svg";

export function ExerciseVisual({
  media,
  alt,
  className,
  loading,
  annotated = false,
}: {
  media: ResolvedPracticeMedia;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  annotated?: boolean;
}) {
  const preferred = annotated && media.annotated ? media.annotated : media.src;
  if (!preferred) {
    return null;
  }
  return (
    <ExerciseVisualFrame
      key={preferred}
      media={media}
      preferred={preferred}
      alt={alt}
      className={className}
      loading={loading}
    />
  );
}

function ExerciseVisualFrame({
  media,
  preferred,
  alt,
  className,
  loading,
}: {
  media: ResolvedPracticeMedia;
  preferred: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const [src, setSrc] = useState(preferred);
  const [hidden, setHidden] = useState(false);

  function onError() {
    if (media.fallback && src !== media.fallback) {
      setSrc(media.fallback);
      return;
    }
    if (src !== CUSTOM) {
      setSrc(CUSTOM);
      return;
    }
    setHidden(true);
  }

  if (hidden || !src) {
    return null;
  }

  const showPoster = media.type === "animated" && Boolean(media.poster) && src === preferred;
  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} loading={loading} onError={onError} />
  );

  if (!showPoster || !media.poster) {
    return image;
  }

  return (
    <picture className="block h-full w-full">
      <source media="(prefers-reduced-motion: reduce)" srcSet={media.poster} />
      {image}
    </picture>
  );
}
