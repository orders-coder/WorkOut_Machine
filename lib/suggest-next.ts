import type { MuscleId } from "./muscles";
import type { ExerciseType, ForceType, MovementPattern } from "./types";

export interface SuggestCandidate {
  id: string;
  name: string;
  /** Muscles this exercise actually trains, primary first. */
  muscles: MuscleId[];
  pattern?: MovementPattern;
  force?: ForceType;
  exerciseType?: ExerciseType;
  compound: boolean;
}

export interface SuggestInput {
  candidates: SuggestCandidate[];
  alreadyChosen: string[];
  /** Logged sets whose primary muscle is this id. */
  setCounts: Partial<Record<MuscleId, number>>;
  mains: MuscleId[];
  addon?: MuscleId;
  patternsDone: MovementPattern[];
  pushSets: number;
  pullSets: number;
  minutesLeft: number;
  exercisesDone: number;
  setsPerMain: number;
  setsPerAddon: number;
  limit?: number;
}

function deficit(input: SuggestInput, muscle: MuscleId): number {
  const goal = input.mains.includes(muscle)
    ? input.setsPerMain
    : input.addon === muscle
      ? input.setsPerAddon
      : 0;
  if (goal === 0) {
    return 0;
  }
  return Math.max(0, goal - (input.setCounts[muscle] ?? 0));
}

function targets(input: SuggestInput): MuscleId[] {
  return input.addon ? [...input.mains, input.addon] : [...input.mains];
}

export function readyToFinish(input: SuggestInput): boolean {
  const covered = targets(input).every((muscle) => deficit(input, muscle) === 0);
  return covered || input.minutesLeft <= 5;
}

export function scoreCandidate(input: SuggestInput, candidate: SuggestCandidate): number {
  if (input.alreadyChosen.includes(candidate.id)) {
    return -1;
  }
  let score = 0;
  const focus = targets(input);
  const hits = candidate.muscles.filter((muscle) => focus.includes(muscle));
  if (hits.length === 0 && candidate.exerciseType !== "stretch" && candidate.exerciseType !== "mobility") {
    score -= 20;
  }
  for (const muscle of hits) {
    const gap = deficit(input, muscle);
    const weight = input.mains.includes(muscle) ? 12 : 6;
    score += gap * weight;
  }
  if (candidate.pattern && !input.patternsDone.includes(candidate.pattern)) {
    score += 8;
  }
  if (candidate.force === "push" && input.pushSets > input.pullSets + 1) {
    score -= 6;
  }
  if (candidate.force === "pull" && input.pullSets > input.pushSets + 1) {
    score -= 6;
  }
  if (candidate.force === "push" && input.pullSets > input.pushSets) {
    score += 4;
  }
  if (candidate.force === "pull" && input.pushSets > input.pullSets) {
    score += 4;
  }
  const finishing = readyToFinish(input);
  if (finishing && (candidate.exerciseType === "stretch" || candidate.exerciseType === "mobility")) {
    score += 30;
  }
  if (input.minutesLeft <= 8 && candidate.compound && !finishing) {
    score -= 4;
  }
  if (input.exercisesDone < 3 && candidate.compound) {
    score += 7;
  }
  if (input.exercisesDone >= 3 && !candidate.compound) {
    score += 5;
  }
  return score;
}

export function suggestNext(input: SuggestInput): SuggestCandidate[] {
  const limit = input.limit ?? 3;
  return [...input.candidates]
    .map((candidate) => ({ candidate, score: scoreCandidate(input, candidate) }))
    .filter((row) => row.score >= 0)
    .sort((a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name))
    .slice(0, limit)
    .map((row) => row.candidate);
}
