import exercisesJson from "./exercises.json";
import type { Practice } from "@/lib/types";
import type {
  DominantContraction,
  Equipment,
  ExerciseEnvironment,
  ForceType,
  Laterality,
  Level,
  MovementPattern,
  PostureAlignmentTag,
  Training,
  TrainingIntent,
} from "@/lib/types";

export interface ExerciseRecord {
  name: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  movement_pattern: MovementPattern;
  equipment: Array<
    "bodyweight" | "dumbbell" | "barbell" | "kettlebell" | "machine" | "cable" | "band" | "medicine_ball"
  >;
  environment: ExerciseEnvironment[];
  difficulty: Level;
  force_type: ForceType;
  laterality: Laterality;
  default_rep_range: string;
  default_rest_seconds: number;
  posture_alignment_tags: PostureAlignmentTag[];
  corrective_or_performance: TrainingIntent;
  progression_path: string[];
  dominant_contraction: DominantContraction;
  tempo_suggestion: string;
  contraindications: string[];
  notes: string[];
  media: string;
}

export const exerciseRecords = exercisesJson as ExerciseRecord[];

/** Database names that continue an exercise already in the catalog. */
const EXISTING_ID: Record<string, string> = {
  "Push-up": "push-up",
  "Glute Bridge": "glute-bridge",
  "Goblet Squat": "goblet-squat",
  "Bulgarian Split Squat": "bulgarian-split-squat",
  "Barbell Back Squat": "back-squat",
  "Farmer's Carry": "farmer-carry",
  "Suitcase Carry": "suitcase-carry",
  "Pallof Press": "pallof-press",
  "Bird Dog": "bird-dog",
  "Kettlebell Swing": "kettlebell-swing",
  "Pull-up": "pull-up-or-negative",
  "Single-Arm Dumbbell Row": "dumbbell-row",
  "Barbell Bent-Over Row": "barbell-row",
  "Barbell Deadlift": "conventional-deadlift",
};

const IMPLEMENT: Record<ExerciseRecord["equipment"][number], Equipment> = {
  bodyweight: "none",
  dumbbell: "dumbbells",
  barbell: "barbell",
  kettlebell: "kettlebell",
  machine: "cable-or-machine",
  cable: "cable-or-machine",
  band: "band",
  medicine_ball: "medicine-ball",
};

const FIXTURE: Record<ExerciseEnvironment, Equipment | null> = {
  "pull-up bar": "pull-up-bar",
  bench: "bench",
  wall: "wall",
  floor: "floor",
  "box/step": null,
  "dip bars": null,
  rings: null,
};

export function exerciseId(record: ExerciseRecord): string {
  return (
    EXISTING_ID[record.name] ??
    record.name
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

export const databaseExerciseIds = new Set(exerciseRecords.map(exerciseId));

function trainingOf(record: ExerciseRecord): Training {
  return {
    primaryMuscles: record.primary_muscles,
    secondaryMuscles: record.secondary_muscles,
    movementPattern: record.movement_pattern,
    forceType: record.force_type,
    laterality: record.laterality,
    defaultRepRange: record.default_rep_range,
    defaultRestSeconds: record.default_rest_seconds,
    postureAlignmentTags: record.posture_alignment_tags,
    intent: record.corrective_or_performance,
    progressionPath: record.progression_path,
    dominantContraction: record.dominant_contraction,
    tempoSuggestion: record.tempo_suggestion,
    contraindications: record.contraindications,
    environment: record.environment,
    media: record.media,
  };
}

function equipmentOf(record: ExerciseRecord): Equipment[] {
  const items = new Set<Equipment>();
  for (const item of record.equipment) {
    const mapped = IMPLEMENT[item];
    if (mapped !== "none") {
      items.add(mapped);
    }
  }
  for (const fixture of record.environment) {
    const mapped = FIXTURE[fixture];
    if (mapped) {
      items.add(mapped);
    }
  }
  if (items.size === 0) {
    items.add("none");
  }
  return [...items];
}

export function practiceFromRecord(record: ExerciseRecord, existing?: Practice): Practice {
  const id = exerciseId(record);
  const training = trainingOf(record);
  if (existing) {
    return {
      ...existing,
      name: record.name,
      level: record.difficulty,
      equipment: equipmentOf(record),
      target: [...record.primary_muscles, ...record.secondary_muscles],
      cues: record.notes,
      training,
    };
  }
  return {
    id,
    name: record.name,
    way: "strength",
    kinds: ["lift"],
    equipment: equipmentOf(record),
    level: record.difficulty,
    target: [...record.primary_muscles, ...record.secondary_muscles],
    why: record.notes[0] ?? record.name,
    cues: record.notes,
    mistakes: [],
    image: `/practices/${id}.svg`,
    imageAlt: record.name,
    tags: [record.movement_pattern, record.corrective_or_performance],
    training,
  };
}
