import type { MuscleId } from "@/lib/muscles";

export type BodyView = "front" | "back";

export interface MuscleShape {
  id: MuscleId;
  paths: string[];
}

/** Arms slightly out, hands open. Front view only. */
export const FRONT_SILHOUETTE =
  "M100 72 C90 72 84 82 86 92 L82 106 C66 110 50 128 40 152 C30 176 24 198 22 214 C16 226 20 242 34 240 C44 238 50 222 56 206 C64 186 74 160 86 140 L90 158 C88 188 86 210 84 222 L74 236 C66 282 64 332 70 374 C74 406 68 434 76 458 C80 470 86 476 96 474 L100 458 C102 430 100 402 98 374 C96 332 98 282 100 250 C102 282 104 332 102 374 C100 402 98 430 100 458 L104 474 C114 476 120 470 124 458 C132 434 126 406 130 374 C136 332 134 282 126 236 L116 222 C114 210 112 188 110 158 L114 140 C126 160 136 186 144 206 C150 222 156 238 166 240 C180 242 184 226 178 214 C176 198 170 176 160 152 C150 128 134 110 118 106 L114 92 C116 82 110 72 100 72 Z";

/** Same pose as the front, seen from behind. */
export const BACK_SILHOUETTE = FRONT_SILHOUETTE;

/** Standing figure, viewBox 0 0 200 480. Paths are textbook-style muscle lobes. */
export const BODY_SILHOUETTE =
  "M100 10 C120 10 132 26 130 44 C129 56 120 64 112 68 L120 76 C152 82 166 102 162 138 L174 228 C176 246 168 256 158 256 L148 228 L146 252 C148 318 152 380 146 428 L138 462 L124 462 L128 428 C126 380 122 318 120 256 L100 252 L80 256 C78 318 74 380 72 428 L76 462 L62 462 L54 428 C48 380 52 318 54 252 L52 228 L42 256 C32 256 24 246 26 228 L38 138 C34 102 48 82 80 76 L88 68 C80 64 71 56 70 44 C68 26 80 10 100 10 Z";

/** Hit areas in the 1280×720 image space. Each box is the overlay’s painted bounds.
 *  Later shapes sit on top so a smaller muscle wins the click.
 */
export const FRONT_SHAPES: MuscleShape[] = [
  {
    id: "obliques",
    paths: [
      "M579 199 H700 V342 H579 Z",
    ],
  },
  {
    id: "quads",
    paths: [
      "M574 320 H704 V461 H574 Z",
    ],
  },
  {
    id: "forearms",
    paths: [
      "M509 238 H770 V325 H509 Z",
    ],
  },
  {
    id: "biceps",
    paths: [
      "M539 185 H740 V253 H539 Z",
    ],
  },
  {
    id: "shoulders",
    paths: [
      "M547 139 H732 V195 H547 Z",
    ],
  },
  {
    id: "abs",
    paths: [
      "M608 196 H670 V346 H608 Z",
    ],
  },
  {
    id: "hip-flexors",
    paths: [
      "M607 334 H671 V428 H607 Z",
    ],
  },
  {
    id: "chest",
    paths: [
      "M576 145 H703 V210 H576 Z",
    ],
  },
  {
    id: "neck",
    paths: [
      "M618 99 H661 V151 H618 Z",
    ],
  },
  {
    id: "diaphragm",
    paths: [
      "M600 188 H678 V214 H600 Z",
    ],
  }
];

export const BACK_SHAPES: MuscleShape[] = [
  {
    id: "traps",
    paths: [
      "M577 76 H702 V168 H577 Z",
    ],
  },
  {
    id: "lats",
    paths: [
      "M579 195 H700 V286 H579 Z",
    ],
  },
  {
    id: "glutes",
    paths: [
      "M577 301 H701 V389 H577 Z",
    ],
  },
  {
    id: "hamstrings",
    paths: [
      "M572 371 H706 V487 H572 Z",
    ],
  },
  {
    id: "calves",
    paths: [
      "M563 477 H715 V581 H563 Z",
    ],
  },
  {
    id: "forearms",
    paths: [
      "M509 243 H771 V325 H509 Z",
    ],
  },
  {
    id: "shoulders",
    paths: [
      "M544 141 H735 V196 H544 Z",
    ],
  },
  {
    id: "triceps",
    paths: [
      "M546 183 H732 V255 H546 Z",
    ],
  },
  {
    id: "lower-back",
    paths: [
      "M611 250 H668 V317 H611 Z",
    ],
  },
  {
    id: "upper-back",
    paths: [
      "M605 168 H673 V259 H605 Z",
    ],
  },
  {
    id: "neck",
    paths: [
      "M602 76 H677 V164 H602 Z",
    ],
  },
  {
    id: "hip-rotators",
    paths: [
      "M587 354 H691 V379 H587 Z",
    ],
  }
];

export function shapesForView(view: BodyView): MuscleShape[] {
  return view === "front" ? FRONT_SHAPES : BACK_SHAPES;
}

export function defaultViewFor(id: MuscleId): BodyView {
  const onBack = BACK_SHAPES.some((shape) => shape.id === id);
  const onFront = FRONT_SHAPES.some((shape) => shape.id === id);
  if (onBack && !onFront) {
    return "back";
  }
  return "front";
}
