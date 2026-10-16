import type { DumpsterEntry } from "./dumpster";

export type Way = "inner" | "soft-body" | "strength";

/** How a practice is used inside a way. Branching UI comes later. */
export type PracticeKind =
  | "meditate"
  | "breath"
  | "eye"
  | "seated-yoga"
  | "moving-stretch"
  | "yin"
  | "active-yoga"
  | "lift"
  | "jump"
  | "carry";

export type Sport = "surfing" | "climbing" | "cycling" | "general";

export type Equipment =
  | "none"
  | "wall"
  | "mat"
  | "band"
  | "towel-or-roller"
  | "block"
  | "chair"
  | "pull-up-bar"
  | "bench"
  | "dumbbells"
  | "barbell"
  | "kettlebell"
  | "cable-or-machine"
  | "medicine-ball"
  | "bike"
  | "floor";

export type MovementPattern = "push" | "pull" | "hinge" | "squat" | "carry" | "rotation";

export type ForceType = "push" | "pull" | "static";

export type Laterality = "unilateral" | "bilateral";

export type DominantContraction = "concentric" | "eccentric" | "isometric";

export type TrainingIntent = "corrective" | "performance";

export type PostureAlignmentTag =
  | "core stability"
  | "spinal alignment"
  | "scapular control"
  | "hip mobility"
  | "thoracic extension";

export type Load =
  | "bodyweight"
  | "dumbbell"
  | "barbell"
  | "kettlebell"
  | "machine"
  | "cable"
  | "band"
  | "medicine_ball";

export type ExerciseType =
  | "strength"
  | "mobility"
  | "stretch"
  | "hang"
  | "breathing"
  | "meditation";

export type Position = "standing" | "seated" | "lying" | "kneeling" | "hanging";

export type DoseUnit = "reps" | "seconds" | "breaths" | "minutes";

export type ExerciseEnvironment =
  | "pull-up bar"
  | "bench"
  | "wall"
  | "floor"
  | "box/step"
  | "dip bars"
  | "rings";

/** Strength programming layer. Inner and soft-body practices omit it. */
export interface Training {
  primaryMuscles: string[];
  secondaryMuscles: string[];
  movementPattern: MovementPattern;
  forceType: ForceType;
  laterality: Laterality;
  defaultRepRange: string;
  defaultRestSeconds: number;
  postureAlignmentTags: PostureAlignmentTag[];
  intent: TrainingIntent;
  /** Names, easiest to hardest. A step may not be in the catalog yet. */
  progressionPath: string[];
  dominantContraction: DominantContraction;
  tempoSuggestion: string;
  contraindications: string[];
  environment: ExerciseEnvironment[];
  media: string;
}

/** Fields added where the catalog was empty. Existing JSON values are not copied here. */
export interface ExerciseProfile {
  equipment?: Load[];
  environment?: ExerciseEnvironment[];
  movementPattern?: MovementPattern;
  laterality?: Laterality;
  forceType?: ForceType;
  exerciseType: ExerciseType;
  position: Position;
  dose: DoseUnit;
}

export type Level = "beginner" | "intermediate" | "advanced";

export interface Practice {
  id: string;
  name: string;
  aka?: string[];
  way: Way;
  /** Optional second room. Most practices live in one way; some live in two. */
  also?: Way;
  kinds?: PracticeKind[];
  sports?: Sport[];
  equipment: Equipment[];
  level: Level;
  target: string[];
  why: string;
  cues: string[];
  mistakes: string[];
  image: string;
  imageAlt: string;
  tags: string[];
  durationHint?: string;
  setup?: string;
  training?: Training;
  profile?: ExerciseProfile;
}

export interface MediaPhoto {
  id: string;
  src: string;
  attribution: string;
  license: string;
  pageUrl: string;
}

export interface MediaLink {
  title: string;
  url: string;
  kind: "video" | "search" | "article" | "database";
}

export interface PracticeMedia {
  practiceId: string;
  photos: MediaPhoto[];
  links: MediaLink[];
}

export interface Routine {
  slug: string;
  title: string;
  sentence: string;
  goal: "muscle" | "stretch" | "custom";
  way?: Way;
  exerciseIds: string[];
  suggested: boolean;
  tags?: string[];
  credits?: { label: string; href: string }[];
}

export type LibraryView = "grid" | "list";

export const DRAWING_CHOICE = "drawing";

export function isWay(value: unknown): value is Way {
  return value === "inner" || value === "soft-body" || value === "strength";
}

export function isLevel(value: unknown): value is Level {
  return value === "beginner" || value === "intermediate" || value === "advanced";
}

function isStringRecord(value: unknown): value is Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  return Object.values(value).every((item) => typeof item === "string");
}

export function isPhotoChoiceRecord(value: unknown): value is Record<string, string> {
  return isStringRecord(value);
}

export interface UserLog {
  id: string;
  title: string;
  at: number;
}

export interface PurgedId {
  kind: DumpsterEntry["kind"];
  id: string;
}

export interface UserLibraryState {
  favorites: string[];
  customTags: Record<string, string[]>;
  notes: Record<string, string>;
  view: LibraryView;
  photoChoice: Record<string, string>;
  dumpster: DumpsterEntry[];
  purged: PurgedId[];
  logs: UserLog[];
}
