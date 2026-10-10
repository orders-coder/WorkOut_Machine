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

export const FRONT_SHAPES: MuscleShape[] = [
  {
    id: "quads",
    paths: [
      "M76 236 C68 286 70 340 80 372 L98 364 C96 310 94 260 94 238 Z",
      "M124 236 C132 286 130 340 120 372 L102 364 C104 310 106 260 106 238 Z",
    ],
  },
  {
    id: "calves",
    paths: [
      "M72 390 C66 418 70 446 82 462 L96 454 C94 424 92 400 94 384 Z",
      "M128 390 C134 418 130 446 118 462 L104 454 C106 424 108 400 106 384 Z",
    ],
  },
  {
    id: "hip-flexors",
    paths: ["M86 208 C94 202 106 202 114 208 L120 232 C108 240 92 240 80 232 Z"],
  },
  {
    id: "obliques",
    paths: [
      "M84 128 C80 156 80 186 86 210 L96 204 L96 132 Z",
      "M116 128 C120 156 120 186 114 210 L104 204 L104 132 Z",
    ],
  },
  {
    id: "abs",
    paths: ["M96 128 L104 128 L106 204 L100 212 L94 204 Z"],
  },
  {
    id: "diaphragm",
    paths: ["M84 116 Q100 128 116 116 L114 128 Q100 138 86 128 Z"],
  },
  {
    id: "chest",
    paths: [
      "M88 100 C96 92 100 98 100 108 L100 126 C90 130 78 122 80 108 C82 100 84 98 88 100 Z",
      "M112 100 C104 92 100 98 100 108 L100 126 C110 130 122 122 120 108 C118 100 116 98 112 100 Z",
    ],
  },
  {
    id: "biceps",
    paths: [
      "M86 112 C70 124 56 146 48 168 C58 160 72 140 82 122 Z",
      "M114 112 C130 124 144 146 152 168 C142 160 128 140 118 122 Z",
    ],
  },
  {
    id: "forearms",
    paths: [
      "M46 170 C34 188 22 206 18 222 C30 214 42 196 50 176 Z",
      "M154 170 C166 188 178 206 182 222 C170 214 158 196 150 176 Z",
    ],
  },
  {
    id: "shoulders",
    paths: [
      "M90 96 C74 100 60 112 54 128 C66 118 80 108 94 102 Z",
      "M110 96 C126 100 140 112 146 128 C134 118 120 108 106 102 Z",
    ],
  },
  {
    id: "neck",
    paths: ["M90 78 C94 72 106 72 110 78 L112 98 C106 102 94 102 88 98 Z"],
  },
];

export const BACK_SHAPES: MuscleShape[] = [
  {
    id: "calves",
    paths: [
      "M72 390 C66 418 70 446 82 462 L96 454 C94 424 92 400 94 384 Z",
      "M128 390 C134 418 130 446 118 462 L104 454 C106 424 108 400 106 384 Z",
    ],
  },
  {
    id: "hamstrings",
    paths: [
      "M76 236 C68 286 70 340 80 372 L98 364 C96 310 94 260 94 238 Z",
      "M124 236 C132 286 130 340 120 372 L102 364 C104 310 106 260 106 238 Z",
    ],
  },
  {
    id: "hip-rotators",
    paths: [
      "M78 214 C74 226 80 238 92 236 L94 220 Z",
      "M122 214 C126 226 120 238 108 236 L106 220 Z",
    ],
  },
  {
    id: "glutes",
    paths: [
      "M78 196 C74 214 80 234 96 240 L100 220 L100 198 C92 190 82 190 78 196 Z",
      "M122 196 C126 214 120 234 104 240 L100 220 L100 198 C108 190 118 190 122 196 Z",
    ],
  },
  {
    id: "lower-back",
    paths: ["M90 150 L110 150 L112 196 L100 204 L88 196 Z"],
  },
  {
    id: "lats",
    paths: [
      "M84 118 C74 140 76 170 86 196 L98 180 L98 124 Z",
      "M116 118 C126 140 124 170 114 196 L102 180 L102 124 Z",
    ],
  },
  {
    id: "upper-back",
    paths: ["M88 108 L112 108 L116 146 L84 146 Z"],
  },
  {
    id: "forearms",
    paths: [
      "M46 170 C34 188 22 206 18 222 C30 214 42 196 50 176 Z",
      "M154 170 C166 188 178 206 182 222 C170 214 158 196 150 176 Z",
    ],
  },
  {
    id: "obliques",
    paths: [
      "M82 140 C78 164 80 188 88 206 L96 196 L96 144 Z",
      "M118 140 C122 164 120 188 112 206 L104 196 L104 144 Z",
    ],
  },
  {
    id: "triceps",
    paths: [
      "M86 112 C70 124 56 146 48 168 C58 160 72 140 82 122 Z",
      "M114 112 C130 124 144 146 152 168 C142 160 128 140 118 122 Z",
    ],
  },
  {
    id: "traps",
    paths: ["M78 96 C90 88 110 88 122 96 L128 120 L100 132 L72 120 Z"],
  },
  {
    id: "shoulders",
    paths: [
      "M90 96 C74 100 60 112 54 128 C66 118 80 108 94 102 Z",
      "M110 96 C126 100 140 112 146 128 C134 118 120 108 106 102 Z",
    ],
  },
  {
    id: "neck",
    paths: ["M92 78 C96 70 104 70 108 78 L110 100 C104 106 96 106 90 100 Z"],
  },
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
