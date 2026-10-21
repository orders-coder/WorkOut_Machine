import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { LOGGING } from "./logging.ts";
import { mergeLoggedSet, migrateSessions } from "./set-log.ts";

const PROFILES = new Set([
  "dumbbell_reps",
  "dumbbell_each_side",
  "bodyweight",
  "band",
  "hold",
  "hold_each_side",
  "mobility_reps",
  "carry",
  "plyometric",
  "sprint_interval",
  "pnf_stretch",
]);

test("every catalog exercise has one logging block", () => {
  const csv = readFileSync(new URL("../audit/logging-profiles.csv", import.meta.url), "utf8")
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => line.split(",")[0]);
  assert.equal(csv.length, 117);
  assert.equal(Object.keys(LOGGING).length, 117);
  for (const id of csv) {
    const logging = LOGGING[id];
    assert.ok(logging, id);
    assert.ok(PROFILES.has(logging.profile), id);
    assert.ok(logging.sets >= 1, id);
    assert.ok(logging.restSec >= 30, id);
    if (logging.profile === "pnf_stretch") {
      assert.equal(logging.optional?.pnf?.contractSec, 6);
      assert.equal(logging.optional?.pnf?.cycles, 3);
    }
    if (logging.profile === "plyometric") {
      assert.ok(logging.restSec >= 120, id);
    }
  }
  assert.equal(LOGGING["goblet-squat"]?.loadBasis, "total");
  assert.equal(LOGGING["dumbbell-swing"]?.loadBasis, "total");
  assert.equal(LOGGING["dumbbell-row"]?.loadBasis, "per_hand");
  assert.equal(LOGGING["walking-lunge"]?.sideMode, "alternating");
});

test("migration keeps sets, adds a unit, and is safe to run twice", () => {
  const original = [
    {
      id: "s1",
      dayType: "40",
      mains: [],
      bodyweightOnly: false,
      startedAt: "2026-01-01T00:00:00.000Z",
      finishedAt: "2026-01-01T00:40:00.000Z",
      exercises: [
        {
          practiceId: "thread-the-needle",
          sets: [{ seconds: 30, breaths: 4, side: "right", at: "2026-01-01T00:10:00.000Z", reps: 0 }],
        },
      ],
      index: 0,
      phase: "done",
    },
  ];
  const once = migrateSessions(original, "kg");
  const twice = migrateSessions(once, "lb");
  assert.equal(once[0]?.exercises[0]?.sets.length, 1);
  const set = once[0]?.exercises[0]?.sets[0];
  assert.equal(set?.unit, "kg");
  assert.equal(set?.side, "R");
  assert.equal(set?.seconds, 30);
  assert.equal(set?.breaths, 4);
  assert.equal(set?.reps, undefined);
  assert.equal(set?.completedAt, "2026-01-01T00:10:00.000Z");
  assert.deepEqual(twice, once);
});

test("editing a logged plan row keeps side, seconds, and breaths", () => {
  const merged = mergeLoggedSet(
    { unit: "lb", reps: 10, weight: 25, completedAt: "2026-01-01T00:10:00.000Z" },
    {
      unit: "lb",
      reps: 8,
      weight: 20,
      seconds: 30,
      breaths: 3,
      side: "L",
      rir: 2,
      notes: "easy",
      pain: 1,
      completedAt: "2026-01-01T00:10:00.000Z",
    },
  );
  assert.equal(merged.reps, 10);
  assert.equal(merged.weight, 25);
  assert.equal(merged.side, "L");
  assert.equal(merged.seconds, 30);
  assert.equal(merged.breaths, 3);
  assert.equal(merged.rir, 2);
  assert.equal(merged.notes, "easy");
  assert.equal(merged.pain, 1);
});

test("a skipped row is not a log", () => {
  assert.throws(() => mergeLoggedSet({ unit: "lb", reps: 8 }));
});
