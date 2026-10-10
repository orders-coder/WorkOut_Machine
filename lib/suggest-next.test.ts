import assert from "node:assert/strict";
import test from "node:test";
import { readyToFinish, suggestNext, type SuggestCandidate, type SuggestInput } from "./suggest-next.ts";

const bench: SuggestCandidate = {
  id: "bench",
  name: "Bench press",
  muscles: ["chest", "triceps"],
  pattern: "push",
  force: "push",
  exerciseType: "strength",
  compound: true,
};
const curl: SuggestCandidate = {
  id: "curl",
  name: "Biceps curl",
  muscles: ["biceps"],
  pattern: "pull",
  force: "pull",
  exerciseType: "strength",
  compound: false,
};
const bridge: SuggestCandidate = {
  id: "bridge",
  name: "Glute bridge",
  muscles: ["glutes"],
  pattern: "hinge",
  force: "push",
  exerciseType: "strength",
  compound: true,
};
const stretch: SuggestCandidate = {
  id: "fold",
  name: "Standing forward fold",
  muscles: ["hamstrings"],
  pattern: "hinge",
  force: "static",
  exerciseType: "stretch",
  compound: false,
};

function base(over: Partial<SuggestInput> = {}): SuggestInput {
  return {
    candidates: [bench, curl, bridge, stretch],
    alreadyChosen: [],
    setCounts: {},
    mains: ["chest", "biceps"],
    addon: "glutes",
    patternsDone: [],
    pushSets: 0,
    pullSets: 0,
    minutesLeft: 30,
    exercisesDone: 0,
    setsPerMain: 4,
    setsPerAddon: 2,
    ...over,
  };
}

test("the muscle with the least work comes first", () => {
  const next = suggestNext(base({ setCounts: { chest: 4, biceps: 0, glutes: 0 } }));
  assert.equal(next[0]?.id, "curl");
});

test("an unseen pattern outranks a repeat when muscle gaps match", () => {
  const row: SuggestCandidate = {
    id: "row",
    name: "Row",
    muscles: ["lats"],
    pattern: "pull",
    force: "pull",
    exerciseType: "strength",
    compound: true,
  };
  const press: SuggestCandidate = {
    id: "press",
    name: "Press",
    muscles: ["shoulders"],
    pattern: "push",
    force: "push",
    exerciseType: "strength",
    compound: true,
  };
  const next = suggestNext(
    base({
      candidates: [press, row],
      mains: ["lats", "shoulders"],
      addon: undefined,
      patternsDone: ["push"],
      setCounts: {},
    }),
  );
  assert.equal(next[0]?.id, "row");
});

test("a stretch leads when the clock is almost done", () => {
  const next = suggestNext(base({ minutesLeft: 4, exercisesDone: 5, setCounts: { chest: 4, biceps: 4, glutes: 2 } }));
  assert.equal(next[0]?.id, "fold");
  assert.equal(readyToFinish(base({ minutesLeft: 4 })), true);
});

test("compounds rank above isolation at the start", () => {
  const next = suggestNext(base({ setCounts: {} }));
  assert.equal(next[0]?.compound, true);
});
