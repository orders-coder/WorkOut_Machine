export type MuscleId =
  | "neck"
  | "traps"
  | "shoulders"
  | "chest"
  | "lats"
  | "upper-back"
  | "biceps"
  | "triceps"
  | "forearms"
  | "abs"
  | "obliques"
  | "diaphragm"
  | "lower-back"
  | "glutes"
  | "hip-flexors"
  | "hip-rotators"
  | "quads"
  | "hamstrings"
  | "calves";

export interface MuscleDef {
  id: MuscleId;
  label: string;
  latin: string;
  region: "front" | "back" | "both";
  sentence: string;
}

export interface MuscleTargeting {
  primary: MuscleId[];
  secondary: MuscleId[];
  tertiary: MuscleId[];
  notes: string;
}

export const MUSCLES: MuscleDef[] = [
  {
    id: "neck",
    label: "Neck",
    latin: "cervical flexors and extensors",
    region: "both",
    sentence: "The head sits on a small stack. These muscles keep it over the body.",
  },
  {
    id: "traps",
    label: "Traps",
    latin: "trapezius",
    region: "back",
    sentence: "From the neck out to the shoulders. Shrug, settle, and hold the scapulae.",
  },
  {
    id: "shoulders",
    label: "Shoulders",
    latin: "deltoids",
    region: "both",
    sentence: "The cap of the arm. Front, side, and rear fibers share the work of every press and raise.",
  },
  {
    id: "chest",
    label: "Chest",
    latin: "pectoralis major and minor",
    region: "front",
    sentence: "The front of the ribcage. Presses and the opening after a desk day.",
  },
  {
    id: "lats",
    label: "Lats",
    latin: "latissimus dorsi",
    region: "back",
    sentence: "The wide back. Pull the arm to the body. Hang, row, and chin-up live here.",
  },
  {
    id: "upper-back",
    label: "Upper back",
    latin: "rhomboids and mid trapezius",
    region: "back",
    sentence: "Between the blades. Posture you can see from behind.",
  },
  {
    id: "biceps",
    label: "Biceps",
    latin: "biceps brachii",
    region: "front",
    sentence: "The front of the upper arm. Elbows bend; the pull gets help.",
  },
  {
    id: "triceps",
    label: "Triceps",
    latin: "triceps brachii",
    region: "back",
    sentence: "The back of the upper arm. Elbows straighten in every press and dip.",
  },
  {
    id: "forearms",
    label: "Forearms",
    latin: "wrist flexors and extensors",
    region: "both",
    sentence: "Grip, wrists, and the last link before the bar leaves the hand.",
  },
  {
    id: "abs",
    label: "Abs",
    latin: "rectus abdominis",
    region: "front",
    sentence: "The front wall. Brace, lift the knees, keep the ribs from flaring.",
  },
  {
    id: "obliques",
    label: "Obliques",
    latin: "internal and external obliques",
    region: "both",
    sentence: "The sides of the waist. Anti-rotation and side planks.",
  },
  {
    id: "diaphragm",
    label: "Diaphragm",
    latin: "diaphragm",
    region: "front",
    sentence: "The breath muscle under the ribs. Inner work starts here.",
  },
  {
    id: "lower-back",
    label: "Lower back",
    latin: "erector spinae",
    region: "back",
    sentence: "The long muscles along the lumbar spine. Hinges ask them to stay long, not round.",
  },
  {
    id: "glutes",
    label: "Glutes",
    latin: "gluteus maximus, medius, minimus",
    region: "back",
    sentence: "The back of the hip. Stand up, hinge, jump, and keep the pelvis honest.",
  },
  {
    id: "hip-flexors",
    label: "Hip flexors",
    latin: "iliopsoas and rectus femoris",
    region: "front",
    sentence: "The front of the hip. Sitting shortens them. Lunges and kneeling open them.",
  },
  {
    id: "hip-rotators",
    label: "Hip rotators",
    latin: "piriformis and deep rotators",
    region: "back",
    sentence: "Deep in the back of the hip. Figure-four and the outer hip.",
  },
  {
    id: "quads",
    label: "Quads",
    latin: "quadriceps",
    region: "front",
    sentence: "The front of the thigh. Squats, lunges, and standing up from a chair.",
  },
  {
    id: "hamstrings",
    label: "Hamstrings",
    latin: "biceps femoris, semitendinosus, semimembranosus",
    region: "back",
    sentence: "The back of the thigh. Hinge, fold, and the Nordic lower.",
  },
  {
    id: "calves",
    label: "Calves",
    latin: "gastrocnemius and soleus",
    region: "back",
    sentence: "The back of the lower leg. Rise, jump, and the stretch after a ride.",
  },
];

export function getMuscle(id: string): MuscleDef | undefined {
  return MUSCLES.find((muscle) => muscle.id === id);
}

export function isMuscleId(value: string): value is MuscleId {
  return MUSCLES.some((muscle) => muscle.id === value);
}
