import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { ExerciseRecord } from "@/data/exercise-db";

const FILE = path.join(process.cwd(), "data", "exercises.json");

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<ExerciseRecord>;
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  const records = JSON.parse(fs.readFileSync(FILE, "utf8")) as ExerciseRecord[];
  const record: ExerciseRecord = {
    id: body.id,
    name: body.name.trim(),
    primary_muscles: body.primary_muscles?.length ? body.primary_muscles : [""],
    secondary_muscles: body.secondary_muscles ?? [],
    movement_pattern: body.movement_pattern ?? "squat",
    equipment: body.equipment?.length ? body.equipment : ["bodyweight"],
    environment: body.environment ?? ["floor"],
    difficulty: body.difficulty ?? "beginner",
    force_type: body.force_type ?? "static",
    laterality: body.laterality ?? "bilateral",
    default_rep_range: body.default_rep_range || "8-12",
    default_rest_seconds: body.default_rest_seconds ?? 0,
    posture_alignment_tags: body.posture_alignment_tags ?? [],
    corrective_or_performance: body.corrective_or_performance ?? "performance",
    progression_path: body.progression_path ?? [],
    dominant_contraction: body.dominant_contraction ?? "concentric",
    tempo_suggestion: body.tempo_suggestion ?? "",
    contraindications: body.contraindications ?? [],
    notes: body.notes ?? [],
    media: body.media ?? "",
    setup: body.setup ?? "",
    common_mistake: body.common_mistake ?? "",
    why: body.why ?? "",
    guide: body.guide ?? "",
    duration_seconds: body.duration_seconds ?? 0,
    min_reps: body.min_reps ?? 0,
  };
  records.push(record);
  fs.writeFileSync(FILE, JSON.stringify(records, null, 2) + "\n");
  return NextResponse.json({ ok: true, id: record.id });
}
