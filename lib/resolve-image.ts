import fs from "fs";
import path from "path";
import manifestJson from "@/data/exercise-media.json";
import { resolveExerciseId } from "@/lib/legacy-ids";
import type { ExerciseMediaEntry, ExerciseMediaManifest, Practice, ResolvedPracticeMedia } from "@/lib/types";

const manifest = manifestJson as ExerciseMediaManifest;
const CUSTOM = "/practices/custom.svg";

function publicFileExists(urlPath: string): boolean {
  if (!urlPath.startsWith("/") || urlPath.includes("..")) {
    return false;
  }
  return fs.existsSync(path.join(process.cwd(), "public", urlPath.slice(1)));
}

function manifestEntry(id: string): ExerciseMediaEntry | undefined {
  const exercises = manifest.exercises;
  const resolved = resolveExerciseId(id);
  return exercises[resolved] ?? exercises[id];
}

/** Files that existed before the manifest: exercise stills, then practice art. */
function legacyCandidates(id: string, fallback: string): string[] {
  const resolved = resolveExerciseId(id);
  const urls: string[] = [];
  const exerciseDir = path.join(process.cwd(), "public", "exercises", resolved);
  if (fs.existsSync(path.join(exerciseDir, "still.png"))) {
    urls.push(`/exercises/${resolved}/still.png`);
  }
  if (fs.existsSync(path.join(exerciseDir, "demo.gif"))) {
    urls.push(`/exercises/${resolved}/demo.gif`);
  }
  const dir = path.join(process.cwd(), "public", "practices");
  const candidates = [`${resolved}.gif`, `${resolved}.jpg`, `${resolved}.jpeg`, `${resolved}.webp`, `${resolved}.png`];
  for (const file of candidates) {
    if (fs.existsSync(path.join(dir, file))) {
      urls.push(`/practices/${file}`);
    }
  }
  if (fs.existsSync(path.join(dir, `${resolved}.svg`))) {
    urls.push(`/practices/${resolved}.svg`);
  }
  const fallbackFile = fallback.startsWith("/") ? path.join(process.cwd(), "public", fallback.slice(1)) : "";
  if (fallbackFile && fallback && fs.existsSync(fallbackFile) && !urls.includes(fallback)) {
    urls.push(fallback);
  }
  if (!urls.includes(CUSTOM)) {
    urls.push(CUSTOM);
  }
  return urls;
}

function legacyPracticeImage(id: string, fallback: string, skip?: string): string {
  return legacyCandidates(id, fallback).find((url) => url !== skip) ?? CUSTOM;
}

export function resolvePracticeMedia(id: string, fallback: string): ResolvedPracticeMedia {
  const entry = manifestEntry(id);
  const useManifest = Boolean(entry && publicFileExists(entry.src));
  const legacy = legacyPracticeImage(id, fallback, useManifest ? entry?.src : undefined);
  if (entry && useManifest) {
    const annotated = entry.annotated && publicFileExists(entry.annotated) ? entry.annotated : undefined;
    const poster = entry.type === "animated" && entry.poster && publicFileExists(entry.poster) ? entry.poster : undefined;
    return {
      type: entry.type === "animated" ? "animated" : "still",
      src: entry.src,
      poster,
      annotated,
      fallback: legacy,
    };
  }
  return {
    type: "still",
    src: legacy,
    fallback: CUSTOM,
  };
}

export function resolvePracticeImage(id: string, fallback: string): string {
  return resolvePracticeMedia(id, fallback).src;
}

export function attachPracticeMedia(practice: Practice): Practice {
  const visual = resolvePracticeMedia(practice.id, practice.image);
  return { ...practice, image: visual.src, visual };
}
