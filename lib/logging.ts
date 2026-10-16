export type Profile =
  | "dumbbell_reps"
  | "dumbbell_each_side"
  | "bodyweight"
  | "band"
  | "hold"
  | "hold_each_side"
  | "mobility_reps"
  | "carry"
  | "plyometric"
  | "sprint_interval"
  | "pnf_stretch";

export type LoadBasis = "per_hand" | "total" | "per_side" | "added" | "assist" | "none";

export type SideMode = "both" | "each_side" | "alternating";

export interface Logging {
  profile: Profile;
  loadBasis: LoadBasis;
  sideMode: SideMode;
  sets: number;
  repRange?: [number, number];
  holdSec?: number;
  restSec: number;
  progression: {
    rule: "double" | "time" | "distance" | "variation";
    incrementLb?: number;
  };
  optional?: {
    rir?: boolean;
    bandLevel?: boolean;
    assist?: boolean;
    added?: boolean;
    distanceM?: number;
    contacts?: number;
    boxHeightCm?: number;
    pnf?: { cycles: number; contractSec: number; stretchSec: number; effortPct?: number };
  };
}

const LOWER = new Set([
  "db-rdl",
  "goblet-squat",
  "dumbbell-swing",
  "single-leg-romanian-deadlift",
  "bulgarian-split-squat",
  "split-squat",
  "reverse-lunge",
  "step-up",
  "walking-lunge",
  "glute-bridge",
  "hip-thrust",
  "calf-raise",
  "nordic-hamstring",
  "box-jump",
  "jump-squat",
  "farmer-carry",
  "suitcase-carry",
  "waiters-carry",
]);

function step(id: string): number {
  return LOWER.has(id) ? 10 : 5;
}

function dumbbell(id: string, load: LoadBasis, side: SideMode): Logging {
  return {
    profile: side === "each_side" ? "dumbbell_each_side" : "dumbbell_reps",
    loadBasis: load,
    sideMode: side,
    sets: 3,
    repRange: [8, 12],
    restSec: 75,
    progression: { rule: "double", incrementLb: step(id) },
    optional: { rir: true },
  };
}

function bodyweight(id: string, range: [number, number], restSec: number): Logging {
  return {
    profile: "bodyweight",
    loadBasis: "none",
    sideMode: "both",
    sets: 3,
    repRange: range,
    restSec,
    progression: { rule: "double", incrementLb: step(id) },
    optional: { rir: true, added: true, assist: true },
  };
}

function hold(sets: number, holdSec: number, restSec: number, extra?: Logging["optional"]): Logging {
  return {
    profile: "hold",
    loadBasis: "none",
    sideMode: "both",
    sets,
    holdSec,
    restSec,
    progression: { rule: "time" },
    optional: extra,
  };
}

function holdSide(sets = 2, holdSec = 30): Logging {
  return {
    profile: "hold_each_side",
    loadBasis: "none",
    sideMode: "each_side",
    sets,
    holdSec,
    restSec: 30,
    progression: { rule: "time" },
  };
}

function mobility(id: string, side: SideMode): Logging {
  return {
    profile: "mobility_reps",
    loadBasis: "none",
    sideMode: side,
    sets: 2,
    repRange: [6, 10],
    restSec: 30,
    progression: { rule: "variation" },
    optional: id === "bird-dog" ? { rir: false } : undefined,
  };
}

export const LOGGING: Record<string, Logging> = {
  "db-rdl": dumbbell("db-rdl", "per_hand", "both"),
  "overhead-press": dumbbell("overhead-press", "per_hand", "both"),
  "biceps-curl": dumbbell("biceps-curl", "per_hand", "both"),
  "overhead-tricep-extension": dumbbell("overhead-tricep-extension", "per_hand", "both"),
  "lateral-raise": dumbbell("lateral-raise", "per_hand", "both"),
  "goblet-squat": dumbbell("goblet-squat", "total", "both"),
  "dumbbell-swing": dumbbell("dumbbell-swing", "total", "both"),
  "half-kneeling-single-arm-dumbbell-press": dumbbell("half-kneeling-single-arm-dumbbell-press", "per_hand", "each_side"),
  "dumbbell-row": dumbbell("dumbbell-row", "per_hand", "each_side"),
  "single-leg-romanian-deadlift": dumbbell("single-leg-romanian-deadlift", "per_hand", "each_side"),
  "bulgarian-split-squat": dumbbell("bulgarian-split-squat", "per_hand", "each_side"),
  "split-squat": dumbbell("split-squat", "per_hand", "each_side"),
  "reverse-lunge": dumbbell("reverse-lunge", "per_hand", "each_side"),
  "step-up": dumbbell("step-up", "per_hand", "each_side"),
  "turkish-get-up": dumbbell("turkish-get-up", "per_hand", "each_side"),
  "dumbbell-woodchop": dumbbell("dumbbell-woodchop", "per_hand", "each_side"),
  "walking-lunge": {
    profile: "dumbbell_reps",
    loadBasis: "per_hand",
    sideMode: "alternating",
    sets: 3,
    repRange: [10, 20],
    restSec: 60,
    progression: { rule: "double", incrementLb: 10 },
    optional: { rir: true, added: true },
  },
  "push-up": bodyweight("push-up", [6, 15], 75),
  "scapular-push-up": bodyweight("scapular-push-up", [8, 12], 60),
  "pull-up-or-negative": bodyweight("pull-up-or-negative", [3, 8], 120),
  "chin-up": bodyweight("chin-up", [3, 8], 120),
  dip: bodyweight("dip", [5, 10], 120),
  "inverted-row": bodyweight("inverted-row", [8, 12], 75),
  "hanging-knee-raise": bodyweight("hanging-knee-raise", [8, 12], 75),
  "scapular-pull-up": bodyweight("scapular-pull-up", [5, 10], 75),
  "glute-bridge": bodyweight("glute-bridge", [10, 15], 60),
  "hip-thrust": bodyweight("hip-thrust", [8, 12], 120),
  "calf-raise": bodyweight("calf-raise", [10, 15], 60),
  "nordic-hamstring": bodyweight("nordic-hamstring", [3, 6], 120),
  "y-t-w-raise": bodyweight("y-t-w-raise", [8, 12], 60),
  "band-pull-apart": {
    profile: "band",
    loadBasis: "none",
    sideMode: "both",
    sets: 3,
    repRange: [12, 20],
    restSec: 45,
    progression: { rule: "variation" },
    optional: { bandLevel: true, rir: true },
  },
  "face-pull": {
    profile: "band",
    loadBasis: "none",
    sideMode: "both",
    sets: 3,
    repRange: [12, 20],
    restSec: 45,
    progression: { rule: "variation" },
    optional: { bandLevel: true, rir: true },
  },
  "pallof-press": {
    profile: "band",
    loadBasis: "none",
    sideMode: "each_side",
    sets: 3,
    repRange: [12, 20],
    restSec: 45,
    progression: { rule: "variation" },
    optional: { bandLevel: true, rir: true },
  },
  plank: hold(3, 30, 45, { added: true }),
  "dead-hang": hold(3, 30, 45, { added: true }),
  "spanish-squat": hold(3, 30, 45, { added: true, bandLevel: true }),
  "chin-tuck": hold(2, 20, 30),
  "doorway-pec-stretch": hold(2, 30, 30),
  "childs-pose": hold(2, 30, 30),
  "downward-dog": hold(2, 30, 30),
  "standing-forward-fold": hold(2, 30, 30),
  "seated-spinal-twist": hold(2, 30, 30),
  "thoracic-extension-roller": hold(2, 30, 30),
  "side-plank": holdSide(),
  "neck-side-stretch": holdSide(),
  "thread-the-needle": holdSide(),
  "kneeling-hip-flexor": holdSide(),
  "figure-four": holdSide(),
  "couch-stretch": holdSide(),
  "calf-stretch": holdSide(),
  "wrist-stretch": holdSide(),
  "lunge-90-hip-flexor": holdSide(),
  "lunge-90-ankle-grab": holdSide(),
  "half-split-hip-flexor": holdSide(),
  "half-split-ankle-grab": holdSide(),
  "hamstring-stretch-flexed": holdSide(),
  "hamstring-stretch-pointed": holdSide(),
  "pyramid-pose": holdSide(),
  "half-split-pnf": {
    profile: "pnf_stretch",
    loadBasis: "none",
    sideMode: "each_side",
    sets: 1,
    restSec: 30,
    progression: { rule: "time" },
    optional: { pnf: { cycles: 3, contractSec: 6, stretchSec: 25, effortPct: 60 } },
  },
  "front-split-hold": {
    profile: "pnf_stretch",
    loadBasis: "none",
    sideMode: "each_side",
    sets: 1,
    restSec: 30,
    progression: { rule: "time" },
    optional: { pnf: { cycles: 3, contractSec: 6, stretchSec: 25, effortPct: 60 } },
  },
  "cat-cow": mobility("cat-cow", "both"),
  "wall-angels": mobility("wall-angels", "both"),
  "scapular-retraction": mobility("scapular-retraction", "both"),
  "worlds-greatest-stretch": mobility("worlds-greatest-stretch", "each_side"),
  "bird-dog": mobility("bird-dog", "each_side"),
  "half-split-knee-taps": mobility("half-split-knee-taps", "each_side"),
  "leg-swings": mobility("leg-swings", "each_side"),
  "pyramid-good-morning": mobility("pyramid-good-morning", "both"),
  "bodyweight-good-morning": mobility("bodyweight-good-morning", "both"),
  "farmer-carry": {
    profile: "carry",
    loadBasis: "per_hand",
    sideMode: "both",
    sets: 3,
    holdSec: 40,
    restSec: 75,
    progression: { rule: "time", incrementLb: 10 },
    optional: { distanceM: 30, rir: true },
  },
  "suitcase-carry": {
    profile: "carry",
    loadBasis: "per_hand",
    sideMode: "each_side",
    sets: 3,
    holdSec: 40,
    restSec: 75,
    progression: { rule: "time", incrementLb: 10 },
    optional: { distanceM: 30, rir: true },
  },
  "waiters-carry": {
    profile: "carry",
    loadBasis: "per_hand",
    sideMode: "each_side",
    sets: 3,
    holdSec: 40,
    restSec: 75,
    progression: { rule: "time", incrementLb: 10 },
    optional: { distanceM: 30, rir: true },
  },
  "box-jump": {
    profile: "plyometric",
    loadBasis: "none",
    sideMode: "both",
    sets: 3,
    repRange: [3, 5],
    restSec: 150,
    progression: { rule: "variation" },
    optional: { contacts: 5, boxHeightCm: 50 },
  },
  "jump-squat": {
    profile: "plyometric",
    loadBasis: "none",
    sideMode: "both",
    sets: 3,
    repRange: [3, 5],
    restSec: 150,
    progression: { rule: "variation" },
    optional: { contacts: 5 },
  },
  "march-in-place": hold(1, 60, 30),
  "jumping-jacks": hold(1, 60, 30),
  "warm-up-general": hold(1, 60, 30),
};

export function loggingFor(id: string): Logging {
  const logging = LOGGING[id];
  if (!logging) {
    throw new Error(`Missing logging block for ${id}`);
  }
  return logging;
}

export function hasLogging(id: string): boolean {
  return id in LOGGING;
}

/** A kilogram or pound column, as opposed to optional added or assist load. */
export function loadsWeight(logging: Logging): boolean {
  return logging.loadBasis === "per_hand" || logging.loadBasis === "total" || logging.loadBasis === "per_side";
}

export function defaultRows(logging: Logging, unit: "lb" | "kg") {
  const sides: Array<"L" | "R" | undefined> = logging.sideMode === "each_side" ? ["L", "R"] : [undefined];
  const rows: Array<{
    unit: "lb" | "kg";
    reps?: number;
    seconds?: number;
    side?: "L" | "R";
    distanceM?: number;
    contacts?: number;
    boxHeightCm?: number;
  }> = [];
  for (let index = 0; index < logging.sets; index += 1) {
    for (const side of sides) {
      const row: (typeof rows)[number] = { unit };
      if (side) {
        row.side = side;
      }
      if (logging.profile === "plyometric") {
        row.contacts = logging.optional?.contacts ?? logging.repRange?.[0];
        if (logging.optional?.boxHeightCm) {
          row.boxHeightCm = logging.optional.boxHeightCm;
        }
      } else if (logging.profile === "pnf_stretch") {
        row.seconds = logging.optional?.pnf?.stretchSec ?? 25;
      } else if (logging.profile === "carry") {
        row.seconds = logging.holdSec;
        if (logging.optional?.distanceM) {
          row.distanceM = logging.optional.distanceM;
        }
      } else if (logging.holdSec != null && !logging.repRange) {
        row.seconds = logging.holdSec;
      } else if (logging.repRange) {
        row.reps = logging.repRange[0];
      }
      rows.push(row);
    }
  }
  return rows;
}

export function loggingForCustom(dose: "reps" | "seconds", weighted: boolean): Logging {
  if (dose === "seconds") {
    return hold(2, 30, 45);
  }
  if (weighted) {
    return dumbbell("custom", "total", "both");
  }
  return bodyweight("custom", [8, 12], 75);
}

export function loadBasisLabel(basis: LoadBasis): string {
  switch (basis) {
    case "per_hand":
      return "per hand";
    case "total":
      return "total";
    case "per_side":
      return "per side";
    case "added":
      return "added";
    case "assist":
      return "assist";
    case "none":
      return "";
  }
}
