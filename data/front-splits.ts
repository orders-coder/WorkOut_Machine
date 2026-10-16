export const LEG_STEP_IDS = [
  "lunge-90-hip-flexor",
  "lunge-90-ankle-grab",
  "half-split-hip-flexor",
  "half-split-pnf",
  "half-split-ankle-grab",
  "half-split-knee-taps",
  "hamstring-stretch-flexed",
  "hamstring-stretch-pointed",
  "pyramid-pose",
  "pyramid-good-morning",
  "front-split-hold",
] as const;

export type GuideKind = "note" | "hold" | "reps" | "pnf" | "breath" | "switch";

export interface GuideMove {
  id: string;
  name: string;
  image: string;
  seconds: number;
}

export interface GuideStep {
  id: string;
  name: string;
  image: string;
  side: "both" | "right" | "left";
  guide: GuideKind;
  seconds: number;
  minReps: number;
  cues: string[];
  setup: string;
  mistake: string;
  why: string;
  moves: GuideMove[];
}
