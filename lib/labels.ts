import type {
  DominantContraction,
  Equipment,
  ForceType,
  Laterality,
  Level,
  MovementPattern,
  Sport,
  TrainingIntent,
  Way,
} from "./types";

export const WAY_LABEL: Record<Way, string> = {
  inner: "Inner",
  "soft-body": "Soft body",
  strength: "Strength",
};

export const WAY_SENTENCE: Record<Way, string> = {
  inner: "Meditation, quieter breath, eye work, sitting yoga.",
  "soft-body": "Stretches and yoga — sitting shapes, moving stretches, yin.",
  strength: "Active yoga, lifting, jumping, work that makes you sweat.",
};

export const WAY_LATER: Record<Way, string> = {
  inner: "Next we will ask: sit and meditate, or more active breath work.",
  "soft-body": "Next we will ask: sitting yoga, moving stretches, or yin.",
  strength: "Next we will ask: active yoga, lifting, or jumping.",
};

export const SPORT_LABEL: Record<Sport, string> = {
  surfing: "Surf",
  climbing: "Climb",
  cycling: "Bike",
  general: "General",
};

export const EQUIPMENT_LABEL: Record<Equipment, string> = {
  none: "No equipment",
  wall: "Wall",
  mat: "Mat",
  band: "Band",
  "towel-or-roller": "Towel or roller",
  block: "Block",
  chair: "Chair",
  "pull-up-bar": "Pull-up bar",
  bench: "Bench",
  dumbbells: "Dumbbells",
  barbell: "Barbell",
  kettlebell: "Kettlebell",
  "cable-or-machine": "Cable or machine",
  "medicine-ball": "Medicine ball",
  bike: "Bike",
  floor: "Floor",
};

export const MOVEMENT_LABEL: Record<MovementPattern, string> = {
  push: "Push",
  pull: "Pull",
  hinge: "Hinge",
  squat: "Squat",
  carry: "Carry",
  rotation: "Rotation",
};

export const FORCE_LABEL: Record<ForceType, string> = {
  push: "Push",
  pull: "Pull",
  static: "Static",
};

export const LATERALITY_LABEL: Record<Laterality, string> = {
  unilateral: "Each side",
  bilateral: "Bilateral",
};

export const CONTRACTION_LABEL: Record<DominantContraction, string> = {
  concentric: "Concentric",
  eccentric: "Eccentric",
  isometric: "Isometric",
};

export const INTENT_LABEL: Record<TrainingIntent, string> = {
  corrective: "Corrective",
  performance: "Performance",
};

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const DISCLAIMER =
  "General practice reference, not medical advice, physical therapy, or sport coaching. Strength and outdoor sports carry risk.";
