"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MUSCLES, type MuscleId } from "@/lib/muscles";
import { DAY_TYPES, dayTypeById, longerDay, type DayType, type DayTypeId } from "@/lib/routine-types";
import { readyToFinish, suggestNext, type SuggestCandidate } from "@/lib/suggest-next";
import type { ExerciseType, ForceType, MovementPattern } from "@/lib/types";
import { customToWorkout, loadCustomExercises } from "@/lib/custom-exercises";
import { defaultRows, loadBasisLabel, loadsWeight, type Logging } from "@/lib/logging";
import type { WorkoutExercise } from "@/lib/workout-catalog";
import {
  activeSession,
  deleteSession,
  historyFor,
  lastSetFor,
  loadPrefs,
  loadSessions,
  mergeLoggedSet,
  previousSetsFor,
  savePrefs,
  upsertSession,
  volumeOf,
  type LogSide,
  type SessionExercise,
  type SetLog,
  type SetPlan,
  type WeightUnit,
  type WorkoutSession,
} from "@/lib/workout-session";
import { BodyFigure } from "./BodyMap";
import { RoundClock } from "./RoundClock";
import { RoutineList } from "./RoutineList";

function playDone() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(180);
  }
  const Context = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Context) {
    return;
  }
  const audio = new Context();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.frequency.value = 660;
  gain.gain.value = 0.05;
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + 0.18);
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function LiveWorkout({
  catalog,
  mode,
}: {
  catalog: WorkoutExercise[];
  mode: "build" | "live";
}) {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [ready, setReady] = useState(false);
  const [day, setDay] = useState<DayTypeId>("40");
  const [mains, setMains] = useState<MuscleId[]>([]);
  const [bodyweightOnly, setBodyweightOnly] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [slot, setSlot] = useState<{ kind: "insert" | "swap"; at: number } | null>(null);
  const [unit, setUnit] = useState<WeightUnit>("lb");
  const [now, setNow] = useState(() => Date.now());
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [seconds, setSeconds] = useState("");
  const [breaths, setBreaths] = useState(0);
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [openHistory, setOpenHistory] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ key: string; value: string } | null>(null);
  const [extra, setExtra] = useState<WorkoutExercise[]>([]);
  const router = useRouter();
  const exercises = useMemo(() => [...extra, ...catalog], [extra, catalog]);

  useEffect(() => {
    const existing = activeSession();
    setSession(existing ?? null);
    setHistory(loadSessions().filter((item) => item.finishedAt));
    setUnit(loadPrefs().unit);
    setExtra(loadCustomExercises().map(customToWorkout));
    setReady(true);
  }, []);

  useEffect(() => {
    if (mode !== "live" || !session) {
      return;
    }
    let changed = false;
    const exercises = session.exercises.map((item) => {
      if (item.plan && item.plan.length > 0) {
        return item;
      }
      changed = true;
      const known = byId.get(item.practiceId);
      return { ...item, plan: planFromLogs(item.sets, known?.logging, unit) };
    });
    if (!changed) {
      return;
    }
    persist({ ...session, exercises });
  }, [mode, session, unit]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    if (session && !session.finishedAt && "wakeLock" in navigator) {
      navigator.wakeLock.request("screen").then((sentinel) => {
        lock = sentinel;
      }).catch(() => undefined);
    }
    return () => {
      void lock?.release();
    };
  }, [session]);

  function persist(next: WorkoutSession) {
    upsertSession(next);
    setSession(next);
    setHistory(loadSessions().filter((item) => item.finishedAt));
  }

  const byId = useMemo(() => new Map(exercises.map((item) => [item.id, item])), [exercises]);
  const buildDay = dayTypeById(day);
  const dayInfo = dayTypeById(session?.dayType ?? day);

  useEffect(() => {
    const seconds = planSegments(picked, byId).reduce((sum, segment) => sum + segment.seconds, 0);
    const next = longerDay(day, seconds / 60);
    if (next !== day) {
      setDay(next);
      return;
    }
    if (next !== "60" || seconds <= 60 * 60 || picked.length < 2) {
      return;
    }
    let remaining = picked;
    while (remaining.length > 1) {
      const trial = remaining.slice(1);
      const trialSeconds = planSegments(trial, byId).reduce((sum, segment) => sum + segment.seconds, 0);
      remaining = trial;
      if (trialSeconds <= 60 * 60) {
        break;
      }
    }
    setPicked(remaining);
  }, [picked, byId, day]);

  const pool = exercises.filter((item) => {
    if (bodyweightOnly && !item.bodyweight) {
      return false;
    }
    const focus = mains;
    return item.muscles.some((muscle) => focus.includes(muscle));
  });

  function toggleMain(id: MuscleId) {
    setMains((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= 2) {
        return [current[1], id];
      }
      return [...current, id];
    });
    setPicked([]);
    setSlot(null);
  }

  function movePick(index: number, direction: -1 | 1) {
    setPicked((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) {
        return current;
      }
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
    setSlot(null);
  }

  function start() {
    if (picked.length === 0) {
      return;
    }
    const next: WorkoutSession = {
      id: crypto.randomUUID(),
      dayType: day,
      mains,
      bodyweightOnly,
      startedAt: new Date().toISOString(),
      exercises: picked.map((practiceId) => ({
        practiceId,
        sets: [],
        plan: defaultRows(loggingForExercise(byId.get(practiceId)), unit),
      })),
      index: 0,
      phase: "work",
      side: byId.get(picked[0])?.bothSides ? "R" : undefined,
    };
    persist(next);
    fillFromLast(picked[0]);
    router.push("/live");
  }

  function fillFromLast(practiceId: string) {
    const previous = lastSetFor(practiceId);
    setWeight(previous?.weight ? String(previous.weight) : "");
    setReps(previous?.reps ? String(previous.reps) : "");
    setSeconds(previous?.seconds ? String(previous.seconds) : "");
    setBreaths(0);
  }

  function currentExercise(): SessionExercise | undefined {
    if (!session) {
      return undefined;
    }
    return session.exercises[session.index];
  }

  function logSet() {
    if (!session) {
      return;
    }
    const exercise = currentExercise();
    const info = exercise ? byId.get(exercise.practiceId) : undefined;
    if (!exercise || !info) {
      return;
    }
    const entry: SetLog = {
      unit,
      completedAt: new Date().toISOString(),
      side: info.bothSides ? session.side ?? "R" : undefined,
    };
    const dose = loggingDose(info);
    const parsedWeight = numberOrUndefined(weight);
    if (info.weighted && parsedWeight !== undefined) {
      entry.weight = parsedWeight;
    }
    if (dose === "seconds") {
      const parsed = numberOrUndefined(seconds);
      if (parsed !== undefined) {
        entry.seconds = parsed;
      }
    } else if (dose === "breaths") {
      if (breaths > 0) {
        entry.breaths = breaths;
      }
    } else {
      const parsed = numberOrUndefined(reps);
      if (parsed !== undefined) {
        entry.reps = parsed;
      }
    }
    const exercises = session.exercises.map((item, index) =>
      index === session.index ? { ...item, sets: [...item.sets, entry] } : item,
    );
    if (info.bothSides && (session.side ?? "R") !== "L") {
      setSeconds("");
      setReps("");
      persist({ ...session, exercises, phase: "switch", side: "R" });
      return;
    }
    const restEndsAt = new Date(Date.now() + info.logging.restSec * 1000).toISOString();
    persist({
      ...session,
      exercises,
      phase: "rest",
      restEndsAt,
      side: info.bothSides ? "R" : undefined,
    });
  }

  useEffect(() => {
    if (!session || session.phase !== "rest" || !session.restEndsAt) {
      return;
    }
    if (now >= new Date(session.restEndsAt).getTime()) {
      playDone();
      persist({ ...session, phase: "work", restEndsAt: undefined });
    }
  }, [now, session]);

  function addRest(extra: number) {
    if (!session?.restEndsAt) {
      return;
    }
    const restEndsAt = new Date(new Date(session.restEndsAt).getTime() + extra * 1000).toISOString();
    persist({ ...session, restEndsAt });
  }

  function finishExercise() {
    if (!session) {
      return;
    }
    const exercise = currentExercise();
    const info = exercise ? byId.get(exercise.practiceId) : undefined;
    if (info?.bothSides && (session.side ?? "R") !== "L") {
      setSeconds("");
      setReps("");
      persist({ ...session, phase: "switch", side: "R" });
      return;
    }
    persist({ ...session, phase: "suggest", side: undefined });
  }

  function beginOtherSide() {
    if (!session) {
      return;
    }
    setSeconds("");
    setReps("");
    persist({ ...session, phase: "work", side: "L" });
  }

  function chooseNext(id: string) {
    if (!session) {
      return;
    }
    const exercises = [...session.exercises, { practiceId: id, sets: [], plan: defaultRows(loggingForExercise(byId.get(id)), unit) }];
    persist({
      ...session,
      exercises,
      index: exercises.length - 1,
      phase: "work",
      side: byId.get(id)?.bothSides ? "R" : undefined,
    });
    fillFromLast(id);
    setQuery("");
  }

  function stopTimer() {
    if (!session) {
      return;
    }
    if (session.timerHold != null) {
      persist({
        ...session,
        timerHold: undefined,
        startedAt: new Date(Date.now() - session.timerHold * 1000).toISOString(),
      });
      return;
    }
    const spent = Math.min(
      dayInfo.targetMinutes * 60,
      Math.max(0, Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000)),
    );
    persist({ ...session, timerHold: spent });
  }

  function writePlans(nextPlans: { index: number; plan: SetPlan[] }[]) {
    if (!session) {
      return;
    }
    const exercises = session.exercises.map((item, index) => {
      const replacement = nextPlans.find((entry) => entry.index === index);
      if (!replacement) {
        return item;
      }
      return {
        ...item,
        plan: replacement.plan,
        sets: replacement.plan.flatMap((row) => {
          if (!row.completedAt) {
            return [];
          }
          const existing = item.sets.find((set) => set.completedAt === row.completedAt);
          return [mergeLoggedSet(row, existing)];
        }),
      };
    });
    persist({ ...session, exercises, phase: "work" });
  }

  function toggleLogged(exerciseIndex: number, setIndex: number, restSec: number) {
    if (!session) {
      return;
    }
    const item = session.exercises[exerciseIndex];
    const row = item?.plan?.[setIndex];
    if (!item?.plan || !row) {
      return;
    }
    const completedAt = row.completedAt ? undefined : new Date().toISOString();
    const plan = item.plan.map((entry, index) => (index === setIndex ? { ...entry, completedAt } : entry));
    const exercises = session.exercises.map((entry, index) => {
      if (index !== exerciseIndex) {
        return entry;
      }
      return {
        ...entry,
        plan,
        sets: plan.flatMap((planned) => {
          if (!planned.completedAt) {
            return [];
          }
          const existing = entry.sets.find((set) => set.completedAt === planned.completedAt);
          return [mergeLoggedSet(planned, existing)];
        }),
      };
    });
    persist({
      ...session,
      exercises,
      phase: completedAt ? "rest" : "work",
      restEndsAt: completedAt ? new Date(Date.now() + restSec * 1000).toISOString() : undefined,
    });
  }

  function changePlan(exerciseIndex: number, setIndex: number, patch: Partial<SetPlan>) {
    const plan = [...(session?.exercises[exerciseIndex]?.plan ?? [])];
    const row = plan[setIndex];
    if (!row) {
      return;
    }
    plan[setIndex] = { ...row, ...patch };
    writePlans([{ index: exerciseIndex, plan }]);
  }

  function finishWorkout() {
    if (!session) {
      return;
    }
    persist({ ...session, phase: "done", finishedAt: new Date().toISOString(), restEndsAt: undefined });
  }

  const budget = dayInfo.targetMinutes * 60;
  const rawElapsed = session
    ? session.timerHold ?? Math.max(0, Math.floor((now - new Date(session.startedAt).getTime()) / 1000))
    : 0;
  const elapsed = Math.min(budget, rawElapsed);
  const restLeft = session?.restEndsAt
    ? Math.max(0, Math.ceil((new Date(session.restEndsAt).getTime() - now) / 1000))
    : 0;

  if (!ready) {
    return null;
  }

  if (mode === "live" && !session) {
    return (
      <div className="px-3 pb-6 pt-8">
        <h1 className="font-display text-[2.35rem] leading-none tracking-tight text-ink">Live</h1>
        <p className="mt-2 text-sm text-ink/70">Nothing is running. Build a routine first, then come here to log the sets.</p>
        <Link href="/routines" className="mt-4 flex min-h-14 items-center justify-center rounded-full bg-[#0071e3] text-white">
          Build a routine
        </Link>
      </div>
    );
  }

  if (mode === "build" || !session) {
    return (
      <div className="px-3 pb-6 pt-1">
        <p className="text-[0.65rem] tracking-[0.18em] uppercase text-ink/45">Work Out Machine</p>
        <h1 className="mt-1 font-display text-[2.35rem] leading-none tracking-tight text-ink">Routines</h1>
        <p className="mt-1.5 text-sm text-ink/70">Build the session here. Weights and reps get logged on Live.</p>
        <PlanBar segments={planSegments(picked, byId)} day={buildDay} />
        {session ? (
          <Link href="/live" className="mt-3 flex min-h-12 items-center justify-center rounded-full bg-ink text-sm text-white">
            Continue the workout on Live
          </Link>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {DAY_TYPES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setDay(item.id);
                setSlot(null);
              }}
              className={`min-h-11 rounded-full px-3 text-sm ${day === item.id ? "bg-[#0071e3] text-white" : "bg-card text-ink ring-1 ring-ink/10"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <MusclePick
          label="Main muscles, up to two"
          selected={mains}
          onSelect={toggleMain}
          note={mains.map((id) => MUSCLES.find((muscle) => muscle.id === id)?.label).filter(Boolean).join(" · ") || "Tap up to two"}
        />
        <label className="mt-4 flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={bodyweightOnly}
            onChange={(event) => {
              setBodyweightOnly(event.target.checked);
              setPicked([]);
              setSlot(null);
            }}
          />
          No equipment
        </label>

        {mains.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-[0.14em] text-ink/45">
              {slot?.kind === "insert"
                ? "Tap an exercise to drop it in"
                : slot?.kind === "swap"
                  ? "Tap an exercise to swap it in"
                  : "Add exercises"}
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
            {rankedStart(pool, mains).map((item) => {
              const on = picked.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setPicked((current) => {
                      if (slot?.kind === "swap") {
                        const next = [...current];
                        next[slot.at] = item.id;
                        return next;
                      }
                      if (slot?.kind === "insert") {
                        const next = [...current];
                        next.splice(slot.at, 0, item.id);
                        return next;
                      }
                      return [...current, item.id];
                    });
                    setSlot(null);
                  }}
                  className={`flex min-h-28 flex-col items-center justify-start gap-1 rounded-2xl px-2 py-2 text-center ${on ? "bg-ink text-white" : "bg-card ring-1 ring-ink/10"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt="" className="h-16 w-full rounded-xl object-contain bg-white" />
                  <span className="text-xs leading-tight">{item.name}</span>
                </button>
              );
            })}
            </div>
            {pool.length === 0 ? <p className="text-sm text-ink/60">Nothing matches those muscles and that filter.</p> : null}
          </div>
        ) : null}

        {picked.length > 0 ? (
          <section className="mt-6">
            <p className="text-xs uppercase tracking-[0.14em] text-ink/45">Today’s map</p>
            <ol className="mt-3">
              {picked.map((id, index) => {
                const item = byId.get(id);
                return (
                  <li key={`${id}-${index}`}>
                    <button
                      type="button"
                      onClick={() => setSlot({ kind: "insert", at: index })}
                      className={`mb-1 flex min-h-10 w-full items-center justify-center rounded-full text-xs ${
                        slot?.kind === "insert" && slot.at === index ? "bg-[#0071e3] text-white" : "text-[#0071e3]"
                      }`}
                    >
                      Insert here
                    </button>
                    <div className={`rounded-2xl px-3 py-2 ring-1 ${slot?.kind === "swap" && slot.at === index ? "bg-ink text-white ring-ink" : "bg-card ring-ink/10"}`}>
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-sm text-ink/40">{index + 1}</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item?.image} alt="" className="h-12 w-12 rounded-lg object-contain bg-white" />
                        <p className="flex-1 text-sm leading-tight">{item?.name}</p>
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-1">
                        <button type="button" className="min-h-10 rounded-full bg-wash text-xs" onClick={() => movePick(index, -1)} disabled={index === 0}>Up</button>
                        <button type="button" className="min-h-10 rounded-full bg-wash text-xs" onClick={() => movePick(index, 1)} disabled={index === picked.length - 1}>Down</button>
                        <button type="button" className="min-h-10 rounded-full bg-wash text-xs" onClick={() => setSlot({ kind: "swap", at: index })}>Swap</button>
                        <button type="button" className="min-h-10 rounded-full bg-wash text-xs" onClick={() => setPicked((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
            <button
              type="button"
              onClick={() => setSlot({ kind: "insert", at: picked.length })}
              className={`mt-1 flex min-h-10 w-full items-center justify-center rounded-full text-xs ${
                slot?.kind === "insert" && slot.at === picked.length ? "bg-[#0071e3] text-white" : "text-[#0071e3]"
              }`}
            >
              Add at the end
            </button>
          </section>
        ) : null}

        <button
          type="button"
          disabled={picked.length === 0}
          onClick={start}
          className="mt-4 min-h-14 w-full rounded-full bg-[#0071e3] text-base text-white disabled:opacity-40"
        >
          Start on Live
        </button>

        {history.length > 0 ? (
          <section className="mt-8">
            <h2 className="font-display text-xl">History</h2>
            <ul className="mt-2 space-y-2">
              {history.map((item) => {
                const open = openHistory === item.id;
                return (
                  <li key={item.id} className="rounded-2xl bg-card px-3 py-3 text-sm ring-1 ring-ink/10">
                    <button
                      type="button"
                      onClick={() => setOpenHistory(open ? null : item.id)}
                      className="w-full text-left"
                      aria-expanded={open}
                    >
                      <p className="font-medium">{item.title ?? dayTypeById(item.dayType).label}</p>
                      <p className="text-ink/60">
                        {new Date(item.startedAt).toLocaleDateString()}
                        {item.rounds ? ` · ${item.rounds} ${item.rounds === 1 ? "round" : "rounds"}` : ""}
                        {item.finishedAt
                          ? ` · ${Math.max(1, Math.round((new Date(item.finishedAt).getTime() - new Date(item.startedAt).getTime()) / 60000))} min`
                          : ""}
                        {" · "}
                        {item.exercises.length} exercises ·{" "}
                        {item.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)} sets
                      </p>
                    </button>
                    {open ? (
                      <div className="mt-3 border-t border-ink/10 pt-3">
                        <ol className="grid grid-cols-3 gap-2">
                          {item.exercises.map((exercise, index) => {
                            const info = byId.get(exercise.practiceId);
                            const name = info?.name ?? exercise.practiceId;
                            return (
                              <li key={`${exercise.practiceId}-${index}`} className="min-w-0 text-center">
                                <img
                                  src={info?.image ?? "/practices/custom.svg"}
                                  alt=""
                                  className="aspect-[16/9] w-full rounded-lg bg-white object-cover ring-1 ring-ink/10"
                                />
                                <p className="mt-1 text-xs font-medium leading-tight">{name}</p>
                                <p className="mt-0.5 text-[0.7rem] leading-snug text-ink/60">
                                  {exercise.sets.length === 0
                                    ? "No sets logged"
                                    : exercise.sets
                                        .map((set) => {
                                        const bits = [
                                          set.side === "L" ? "L" : set.side === "R" ? "R" : "",
                                          set.weight != null ? `${set.weight} ${set.unit}` : "",
                                            set.reps != null ? `${set.reps} reps` : "",
                                            set.seconds != null ? `${set.seconds}s` : "",
                                            set.breaths != null ? `${set.breaths} breaths` : "",
                                          ].filter(Boolean);
                                          return bits.join(" · ") || "done";
                                        })
                                        .join(", ")}
                                </p>
                              </li>
                            );
                          })}
                        </ol>
                        <button
                          type="button"
                          onClick={() => {
                            deleteSession(item.id);
                            setHistory(loadSessions().filter((entry) => entry.finishedAt));
                            setOpenHistory(null);
                          }}
                          className="mt-3 min-h-10 text-sm text-strength-clay"
                        >
                          Delete this session
                        </button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <details className="mt-8">
          <summary className="cursor-pointer text-sm text-[#0071e3]">Preset sessions</summary>
          <RoutineList heading="Presets" intro="The earlier example sessions." emptyMine="No custom routines yet." />
        </details>
      </div>
    );
  }

  if (session.phase === "done") {
    const sets = session.exercises.flatMap((exercise) => exercise.sets);
    const muscleSets: Partial<Record<MuscleId, number>> = {};
    for (const exercise of session.exercises) {
      const info = byId.get(exercise.practiceId);
      const muscle = info?.muscles[0];
      if (muscle) {
        muscleSets[muscle] = (muscleSets[muscle] ?? 0) + exercise.sets.length;
      }
    }
    const minutes = session.finishedAt
      ? Math.round((new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
      : 0;
    return (
      <div className="px-3 pb-6 pt-1">
        <h1 className="font-display text-4xl">Done</h1>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <Stat label="Time" value={`${minutes} min`} />
          <Stat label="Exercises" value={String(session.exercises.length)} />
          <Stat label="Sets" value={String(sets.length)} />
          <Stat label="Volume" value={`${Math.round(volumeOf(sets))} ${unit}`} />
        </dl>
        <ul className="mt-4 space-y-1 text-sm">
          {Object.entries(muscleSets).map(([id, count]) => (
            <li key={id}>
              {MUSCLES.find((muscle) => muscle.id === id)?.label}: {count} {count === 1 ? "set" : "sets"}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-6 min-h-14 w-full rounded-full bg-[#0071e3] text-white"
          onClick={() => {
            setSession(null);
            router.push("/routines");
          }}
        >
          Back to routines
        </button>
      </div>
    );
  }

  const exercise = currentExercise();
  const info = exercise ? byId.get(exercise.practiceId) : undefined;
  const candidates = toCandidates(exercises.filter((item) => (session.bodyweightOnly ? item.bodyweight : true)));
  const setCounts: Partial<Record<MuscleId, number>> = {};
  let pushSets = 0;
  let pullSets = 0;
  const patternsDone: MovementPattern[] = [];
  for (const item of session.exercises) {
    const known = byId.get(item.practiceId);
    const muscle = known?.muscles[0];
    if (muscle) {
      setCounts[muscle] = (setCounts[muscle] ?? 0) + item.sets.length;
    }
    if (known?.force === "push") {
      pushSets += item.sets.length;
    }
    if (known?.force === "pull") {
      pullSets += item.sets.length;
    }
    if (known?.pattern && !patternsDone.includes(known.pattern)) {
      patternsDone.push(known.pattern);
    }
  }
  const suggestionInput = {
    candidates,
    alreadyChosen: session.exercises.map((item) => item.practiceId),
    setCounts,
    mains: session.mains,
    addon: session.addon,
    patternsDone,
    pushSets,
    pullSets,
    minutesLeft: dayInfo.targetMinutes - elapsed / 60,
    exercisesDone: session.exercises.filter((item) => item.sets.length > 0).length,
    setsPerMain: 3,
    setsPerAddon: 2,
  };
  const suggestions = suggestNext(suggestionInput);

  const spentLabel = formatClock(elapsed);
  const capLabel = formatClock(budget);

  return (
    <div className="px-3 pb-36 pt-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.65rem] tracking-[0.18em] uppercase text-ink/45">Live</p>
          <h1 className="font-display text-3xl leading-none">{session.title ?? dayInfo.label}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const next = unit === "kg" ? "lb" : "kg";
              setUnit(next);
              savePrefs({ unit: next });
              if (!session) {
                return;
              }
              persist({
                ...session,
                exercises: session.exercises.map((item) => ({
                  ...item,
                  plan: item.plan?.map((row) => ({
                    ...row,
                    unit: next,
                    weight: row.weight == null ? undefined : convertWeight(row.weight, row.unit, next),
                    addedWeight: row.addedWeight == null ? undefined : convertWeight(row.addedWeight, row.unit, next),
                    assistWeight: row.assistWeight == null ? undefined : convertWeight(row.assistWeight, row.unit, next),
                  })),
                  sets: item.sets.map((set) => ({
                    ...set,
                    unit: next,
                    weight: set.weight == null ? undefined : convertWeight(set.weight, set.unit, next),
                    addedWeight: set.addedWeight == null ? undefined : convertWeight(set.addedWeight, set.unit, next),
                    assistWeight: set.assistWeight == null ? undefined : convertWeight(set.assistWeight, set.unit, next),
                  })),
                })),
              });
            }}
            className="min-h-11 rounded-full px-3 text-sm ring-1 ring-ink/10"
          >
            {unit}
          </button>
          <button type="button" onClick={finishWorkout} className="min-h-11 rounded-full bg-[#0071e3] px-4 text-sm text-white">
            Finish
          </button>
        </div>
      </div>

      <ol className="mt-4 space-y-3">
        {session.exercises.map((item, exerciseIndex) => {
          const known = byId.get(item.practiceId);
          const plan = item.plan ?? [];
          const logging = known?.logging;
          const columns = columnsFor(logging);
          const suggested = logging?.sets ?? 2;
          const earlier = previousSetsFor(item.practiceId);
          return (
            <li key={`${item.practiceId}-${exerciseIndex}`} className="rounded-2xl bg-card px-3 py-3 ring-1 ring-ink/10">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={known?.image ?? "/practices/custom.svg"} alt="" className="h-14 w-14 rounded-xl bg-white object-contain" />
                <div className="min-w-0">
                  <Link href={`/practice/${item.practiceId}`} className="font-medium text-[#0071e3]">
                    {known?.name ?? item.practiceId}
                  </Link>
                  <p className="text-sm text-ink/55">{suggestionLine(logging, suggested)}</p>
                  {pnfLine(logging) ? <p className="text-xs text-ink/55">{pnfLine(logging)}</p> : null}
                  {progressionHint(logging, plan) ? (
                    <p className="text-xs text-[#0071e3]">{progressionHint(logging, plan)}</p>
                  ) : null}
                </div>
              </div>
              <div
                className="mt-3 grid items-center gap-1.5 px-1 text-[0.65rem] uppercase tracking-[0.12em] text-ink/40"
                style={{ gridTemplateColumns: planGrid(columns.length) }}
              >
                <span>Set</span>
                <span>Previous</span>
                {columns.map((column) => (
                  <span key={column.key}>{columnHeader(column, unit)}</span>
                ))}
                <span className="text-right">Done</span>
              </div>
              <ol className="mt-1 space-y-1.5">
                {plan.map((row, setIndex) => {
                  const done = Boolean(row.completedAt);
                  const sideCount = plan.slice(0, setIndex + 1).filter((entry) => entry.side === row.side).length - 1;
                  const previous = row.side ? earlier.filter((set) => set.side === row.side)[sideCount] : earlier[setIndex];
                  return (
                    <li
                      key={`${exerciseIndex}-${setIndex}`}
                      className={`grid items-center gap-1.5 rounded-xl px-1 py-1.5 ${done ? "bg-[#e5f6ea]" : ""}`}
                      style={{ gridTemplateColumns: planGrid(columns.length) }}
                    >
                      <span className="text-sm text-ink/50">{setLabel(row, plan, setIndex)}</span>
                      <span className="truncate text-xs text-ink/45">{previousLabel(previous, columns)}</span>
                      {columns.map((column) => (
                        <PlanField
                          key={column.key}
                          column={column}
                          row={row}
                          editing={draft?.key === `${exerciseIndex}-${setIndex}-${column.key}`}
                          draft={draft?.value ?? ""}
                          onStart={() =>
                            setDraft({
                              key: `${exerciseIndex}-${setIndex}-${column.key}`,
                              value: fieldText(row, column.key),
                            })
                          }
                          onDraft={(value) => setDraft({ key: `${exerciseIndex}-${setIndex}-${column.key}`, value })}
                          onCommit={(value) => {
                            changePlan(exerciseIndex, setIndex, fieldPatch(column.key, value));
                            setDraft(null);
                          }}
                        />
                      ))}
                      <button
                        type="button"
                        aria-label={done ? "Uncheck set" : "Log set"}
                        aria-pressed={done}
                        onClick={() => toggleLogged(exerciseIndex, setIndex, logging?.restSec ?? 30)}
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-base ${done ? "bg-[#34c759] text-white" : "bg-white ring-1 ring-ink/15"}`}
                      >
                        ✓
                      </button>
                    </li>
                  );
                })}
              </ol>
              <button
                type="button"
                onClick={() => {
                  const last = plan[plan.length - 1];
                  const added: SetPlan = {
                    unit: last?.unit ?? unit,
                    weight: last?.weight,
                    reps: last?.reps,
                    seconds: last?.seconds,
                    side: last?.side,
                    bandLevel: last?.bandLevel,
                    addedWeight: last?.addedWeight,
                    assistWeight: last?.assistWeight,
                    distanceM: last?.distanceM,
                    boxHeightCm: last?.boxHeightCm,
                    contacts: last?.contacts,
                  };
                  writePlans([{ index: exerciseIndex, plan: [...plan, added] }]);
                }}
                className="mt-2 min-h-11 w-full rounded-xl text-sm text-[#0071e3]"
              >
                + Add set
              </button>
            </li>
          );
        })}
      </ol>

      <div
        className="fixed inset-x-0 z-30 border-t border-ink/10 bg-white/95 px-4 py-3 backdrop-blur"
        style={{ bottom: "calc(3rem + env(safe-area-inset-bottom))" }}
      >
        {session.restEndsAt && restLeft > 0 ? (
          <p className="text-center text-sm text-ink/70">Rest {formatClock(restLeft)}</p>
        ) : null}
        <p className="text-center text-[0.65rem] uppercase tracking-[0.14em] text-ink/45">Time on Live</p>
        <p className="text-center font-display text-5xl tabular-nums leading-none tracking-tight">{spentLabel}</p>
        <p className="mt-1 text-center text-xs text-ink/45">stops at {capLabel}</p>
        <div className="mt-2 flex justify-center">
          <button type="button" onClick={stopTimer} className="min-h-10 rounded-full px-5 text-sm ring-1 ring-ink/10">
            {session.timerHold != null ? "Resume" : "Stop"}
          </button>
        </div>
      </div>
    </div>
  );
}

function numberOrUndefined(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function loggingForExercise(info?: WorkoutExercise): Logging {
  if (!info) {
    throw new Error("Missing exercise");
  }
  return info.logging;
}

type PlanColumnKey = "weight" | "reps" | "seconds" | "band" | "load" | "added" | "distance" | "contacts" | "height";

interface PlanColumn {
  key: PlanColumnKey;
  label: string;
}

function columnsFor(logging: Logging | undefined): PlanColumn[] {
  if (!logging) {
    return [
      { key: "weight", label: "Wt" },
      { key: "reps", label: "Reps" },
    ];
  }
  switch (logging.profile) {
    case "dumbbell_reps":
    case "dumbbell_each_side":
      return [
        { key: "weight", label: "Wt" },
        { key: "reps", label: "Reps" },
      ];
    case "bodyweight":
      return [
        { key: "reps", label: "Reps" },
        { key: "load", label: "±" },
      ];
    case "band":
      return [
        { key: "band", label: "Band" },
        { key: "reps", label: "Reps" },
      ];
    case "hold":
    case "hold_each_side": {
      const columns: PlanColumn[] = [{ key: "seconds", label: "Sec" }];
      if (logging.optional?.added) {
        columns.push({ key: "added", label: "Added" });
      }
      if (logging.optional?.bandLevel) {
        columns.push({ key: "band", label: "Band" });
      }
      return columns;
    }
    case "mobility_reps":
      return [{ key: "reps", label: "Reps" }];
    case "carry":
      return [
        { key: "weight", label: "Wt" },
        { key: "distance", label: "m" },
        { key: "seconds", label: "Sec" },
      ];
    case "plyometric": {
      const columns: PlanColumn[] = [{ key: "contacts", label: "Hits" }];
      if (logging.optional?.boxHeightCm != null) {
        columns.push({ key: "height", label: "cm" });
      }
      return columns;
    }
    case "sprint_interval":
      return [
        { key: "distance", label: "m" },
        { key: "seconds", label: "Sec" },
        { key: "reps", label: "Reps" },
      ];
    case "pnf_stretch":
      return [{ key: "seconds", label: "Sec" }];
  }
}

function planGrid(count: number): string {
  return `1.7rem minmax(0,1.15fr) repeat(${count}, minmax(0,1fr)) 2.2rem`;
}

function columnHeader(column: PlanColumn, unit: WeightUnit): string {
  if (column.key === "weight" || column.key === "load" || column.key === "added") {
    return unit;
  }
  return column.label;
}

function suggestionLine(logging: Logging | undefined, suggested: number): string {
  if (!logging) {
    return `${suggested} sets`;
  }
  const sets = `${logging.sets} ${logging.sets === 1 ? "set" : "sets"}`;
  const side = logging.sideMode === "each_side" ? " each side" : logging.sideMode === "alternating" ? " alternating" : "";
  const dose = logging.repRange
    ? `${logging.repRange[0]}–${logging.repRange[1]} reps`
    : logging.holdSec
      ? `${logging.holdSec}s`
      : logging.optional?.pnf
        ? `${logging.optional.pnf.stretchSec}s stretch`
        : "";
  const basis = loadsWeight(logging) ? loadBasisLabel(logging.loadBasis) : "";
  return [`Suggested ${sets}${side}`, dose, basis].filter(Boolean).join(" · ");
}

function pnfLine(logging: Logging | undefined): string | null {
  const pnf = logging?.optional?.pnf;
  if (!pnf) {
    return null;
  }
  return `Contract ${pnf.contractSec}s · stretch ${pnf.stretchSec}s · ${pnf.cycles} cycles · moderate effort`;
}

function progressionHint(logging: Logging | undefined, plan: SetPlan[]): string | null {
  const top = logging?.repRange?.[1];
  const step = logging?.progression.incrementLb;
  if (!logging || logging.progression.rule !== "double" || top == null || step == null) {
    return null;
  }
  if (plan.length === 0 || plan.some((row) => !row.completedAt || (row.reps ?? -1) < top)) {
    return null;
  }
  return `Next time, add ${step} lb`;
}

function setLabel(row: SetPlan, plan: SetPlan[], setIndex: number): string {
  if (!row.side) {
    return String(setIndex + 1);
  }
  const count = plan.slice(0, setIndex + 1).filter((entry) => entry.side === row.side).length;
  return `${count}${row.side}`;
}

function signedLoad(row: SetPlan): number | undefined {
  if (row.assistWeight != null) {
    return -row.assistWeight;
  }
  return row.addedWeight;
}

function fieldText(row: SetPlan, key: PlanColumnKey): string {
  const value = fieldValue(row, key);
  return value == null ? "" : String(value);
}

function fieldValue(row: SetPlan, key: PlanColumnKey): number | string | undefined {
  switch (key) {
    case "weight":
      return row.weight;
    case "reps":
      return row.reps;
    case "seconds":
      return row.seconds;
    case "band":
      return row.bandLevel;
    case "load":
      return signedLoad(row);
    case "added":
      return row.addedWeight;
    case "distance":
      return row.distanceM;
    case "contacts":
      return row.contacts;
    case "height":
      return row.boxHeightCm;
  }
}

function fieldPatch(key: PlanColumnKey, value: string): Partial<SetPlan> {
  if (key === "band") {
    const trimmed = value.trim();
    return { bandLevel: trimmed ? trimmed : undefined };
  }
  const parsed = numberOrUndefined(value);
  if (key === "load") {
    if (parsed == null) {
      return { addedWeight: undefined, assistWeight: undefined };
    }
    if (parsed < 0) {
      return { addedWeight: undefined, assistWeight: Math.abs(parsed) };
    }
    return { addedWeight: parsed, assistWeight: undefined };
  }
  switch (key) {
    case "weight":
      return { weight: parsed };
    case "reps":
      return { reps: parsed };
    case "seconds":
      return { seconds: parsed };
    case "added":
      return { addedWeight: parsed };
    case "distance":
      return { distanceM: parsed };
    case "contacts":
      return { contacts: parsed };
    case "height":
      return { boxHeightCm: parsed };
  }
}

function planFromLogs(logged: SetLog[], logging: Logging | undefined, unit: WeightUnit): SetPlan[] {
  const seeded = logging ? defaultRows(logging, unit) : [];
  if (logged.length === 0) {
    return seeded;
  }
  const rows: SetPlan[] = logged.map((set) => ({
    unit: set.unit,
    weight: set.weight,
    reps: set.reps,
    seconds: set.seconds,
    side: set.side,
    rir: set.rir,
    bandLevel: set.bandLevel,
    addedWeight: set.addedWeight,
    assistWeight: set.assistWeight,
    distanceM: set.distanceM,
    contacts: set.contacts,
    boxHeightCm: set.boxHeightCm,
    breaths: set.breaths,
    notes: set.notes,
    pain: set.pain,
    completedAt: set.completedAt,
  }));
  for (const row of seeded) {
    if (rows.length >= seeded.length) {
      break;
    }
    rows.push(row);
  }
  return rows;
}

function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) {
    return value;
  }
  const pounds = from === "lb" ? value : value * 2.2;
  const next = to === "lb" ? pounds : pounds / 2.2;
  return Math.round(next * 10) / 10;
}

function previousLabel(set: SetLog | undefined, columns: PlanColumn[]): string {
  if (!set) {
    return "—";
  }
  const bits = columns.map((column) => {
    const value = fieldValue(set, column.key);
    if (value == null || value === "") {
      return "";
    }
    if (column.key === "reps") {
      return `× ${value}`;
    }
    if (column.key === "seconds") {
      return `${value}s`;
    }
    return String(value);
  });
  return bits.filter(Boolean).join(" ") || "—";
}

function PlanField({
  column,
  row,
  editing,
  draft,
  onStart,
  onDraft,
  onCommit,
}: {
  column: PlanColumn;
  row: SetPlan;
  editing: boolean;
  draft: string;
  onStart: () => void;
  onDraft: (value: string) => void;
  onCommit: (value: string) => void;
}) {
  const shown = fieldText(row, column.key);
  if (editing) {
    return (
      <input
        autoFocus
        inputMode={column.key === "band" ? "text" : "decimal"}
        value={draft}
        aria-label={column.label}
        onChange={(event) => onDraft(event.target.value)}
        onBlur={() => onCommit(draft)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onCommit(draft);
          }
        }}
        className="h-9 w-full rounded-lg bg-white px-1 text-center text-sm tabular-nums ring-1 ring-[#0071e3]"
      />
    );
  }
  return (
    <button type="button" onClick={onStart} className="h-9 w-full rounded-lg text-center text-sm tabular-nums">
      {shown || "—"}
    </button>
  );
}

function rankedStart(items: WorkoutExercise[], focus: MuscleId[]): WorkoutExercise[] {
  return [...items].sort(
    (a, b) => intensity(b, focus) - intensity(a, focus) || a.name.localeCompare(b.name),
  );
}

function intensity(item: WorkoutExercise, focus: MuscleId[]): number {
  const primary = item.muscles[0];
  let score = primary && focus.includes(primary) ? 24 : 6;
  if (item.level === "advanced") {
    score += 30;
  } else if (item.level === "intermediate") {
    score += 16;
  }
  if (item.compound) {
    score += 18;
  }
  if (item.exerciseType === "strength") {
    score += 14;
  }
  if (item.exerciseType === "stretch" || item.exerciseType === "mobility") {
    score -= 40;
  }
  return score;
}

function MusclePick({
  label,
  selected,
  onSelect,
  note,
}: {
  label: string;
  selected: MuscleId[];
  onSelect: (id: MuscleId) => void;
  note: string;
}) {
  const [hovered, setHovered] = useState<MuscleId | null>(null);
  const live = new Set(MUSCLES.map((muscle) => muscle.id));
  return (
    <div className="mt-4">
      <p className="text-xs uppercase tracking-[0.14em] text-ink/45">{label}</p>
      <div className="mt-2 rounded-2xl bg-card px-3 py-3 ring-1 ring-ink/8">
        <div className="grid grid-cols-2 gap-2">
          {(["front", "back"] as const).map((view) => (
            <div key={view}>
              <BodyFigure
                view={view}
                selected={selected}
                hovered={hovered}
                counts={{}}
                live={live}
                onSelect={onSelect}
                onHover={setHovered}
                showCaption={false}
                className="mx-auto h-auto w-full"
              />
              <p className="text-center text-[0.65rem] tracking-[0.14em] uppercase text-ink/45">
                {view === "front" ? "Front" : "Back"}
              </p>
            </div>
          ))}
        </div>
        <p className="px-2 pt-1 text-center text-[0.7rem] text-ink/55">{note}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card px-3 py-3 ring-1 ring-ink/10">
      <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-ink/45">{label}</dt>
      <dd className="mt-1 text-lg">{value}</dd>
    </div>
  );
}

function HoldField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [left, setLeft] = useState(Number(value) || 30);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) {
      return;
    }
    const timer = window.setInterval(() => {
      setLeft((current) => {
        if (current <= 1) {
          setRunning(false);
          playDone();
          onChange("0");
          return 0;
        }
        const next = current - 1;
        onChange(String(next));
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, onChange]);
  return (
    <button type="button" onClick={() => setRunning((value) => !value)} className="w-full rounded-2xl bg-card px-3 py-4 text-sm text-ink/70 ring-1 ring-ink/10">
      {running ? <RoundClock seconds={left} total={Math.max(Number(value) || 30, left, 1)} /> : `Start hold ${value || 30}s`}
    </button>
  );
}

const MUSCLE_COLOR: Record<string, string> = {
  neck: "#7aa2c4",
  traps: "#5b7c99",
  shoulders: "#e09f3e",
  chest: "#e15d55",
  lats: "#3d8b7a",
  "upper-back": "#2f6f62",
  biceps: "#6c8cff",
  triceps: "#3d5ad4",
  forearms: "#8e7cc3",
  abs: "#d4a017",
  obliques: "#c47b2b",
  diaphragm: "#9aa0a6",
  "lower-back": "#6b8f71",
  glutes: "#c45c8a",
  "hip-flexors": "#d48aa8",
  "hip-rotators": "#a14d73",
  quads: "#4aa3df",
  hamstrings: "#2b6cb0",
  calves: "#7dcea0",
};

function exerciseBlock(item: WorkoutExercise): number {
  const sets = 3;
  const work = item.dose === "seconds" || item.dose === "minutes" ? 40 : item.dose === "breaths" ? 60 : 35;
  const rest = item.exerciseType === "stretch" || item.exerciseType === "mobility" || item.exerciseType === "breathing" ? 15 : 60;
  return sets * work + Math.max(0, sets - 1) * rest;
}

function planSegments(
  ids: string[],
  byId: Map<string, WorkoutExercise>,
): { seconds: number; muscle: string; label: string }[] {
  return ids.flatMap((id, index) => {
    const item = byId.get(id);
    if (!item) {
      return [];
    }
    const rest = item.exerciseType === "stretch" || item.exerciseType === "mobility" || item.exerciseType === "breathing" ? 15 : 60;
    const gap = index < ids.length - 1 ? rest : 0;
    const muscle = item.muscles[0] ?? "other";
    return [{ seconds: exerciseBlock(item) + gap, muscle, label: MUSCLES.find((entry) => entry.id === muscle)?.label ?? "Other" }];
  });
}

function PlanBar({
  segments,
  day,
}: {
  segments: { seconds: number; muscle: string; label: string }[];
  day: DayType;
}) {
  const seconds = segments.reduce((sum, segment) => sum + segment.seconds, 0);
  const minutes = seconds === 0 ? 0 : Math.max(1, Math.round(seconds / 60));
  const scale = day.targetMinutes * 60;
  const seen = new Map<string, string>();
  for (const segment of segments) {
    if (!seen.has(segment.muscle)) {
      seen.set(segment.muscle, segment.label);
    }
  }
  return (
    <div className="sticky top-0 z-20 -mx-3 mt-3 border-b border-black/10 bg-[#f5f5f7]/95 px-3 py-2 backdrop-blur">
      <div className="flex items-baseline justify-between text-sm">
        <p className="font-medium">{day.label} · {minutes} min</p>
        <p className="text-ink/50">of {day.targetMinutes} min</p>
      </div>
      <div className="mt-1.5 flex h-3 overflow-hidden rounded-full bg-black/10">
        {segments.map((segment, index) => (
          <div
            key={`${segment.muscle}-${index}`}
            title={segment.label}
            className="h-full shrink-0"
            style={{
              width: `${(segment.seconds / scale) * 100}%`,
              background: MUSCLE_COLOR[segment.muscle] ?? "#6e6e73",
            }}
          />
        ))}
      </div>
      {seen.size > 0 ? (
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
          {[...seen.entries()].map(([muscle, label]) => (
            <span key={muscle} className="flex items-center gap-1 text-[0.65rem] text-ink/70">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: MUSCLE_COLOR[muscle] ?? "#6e6e73" }} />
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function loggingDose(info: WorkoutExercise): "reps" | "seconds" | "breaths" {
  if (info.dose === "seconds" || info.dose === "minutes") {
    return "seconds";
  }
  if (info.dose === "breaths") {
    return "breaths";
  }
  if (info.dose === "reps") {
    return "reps";
  }
  if (info.exerciseType === "breathing" || info.exerciseType === "meditation") {
    return "breaths";
  }
  if (info.exerciseType === "stretch" || info.exerciseType === "mobility" || info.exerciseType === "hang") {
    return "seconds";
  }
  return "reps";
}

function doseLine(info: WorkoutExercise): string {
  const dose = loggingDose(info);
  const each = info.bothSides ? " · each side" : "";
  if (dose === "seconds") {
    return `${info.repRange ?? "Hold 30s"}${each}`;
  }
  if (dose === "breaths") {
    return `8 breaths${each}`;
  }
  return `3 × ${info.repRange ?? "8–12"}${each}`;
}

function toCandidates(items: WorkoutExercise[]): SuggestCandidate[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    muscles: item.muscles,
    pattern: item.pattern,
    force: item.force,
    exerciseType: item.exerciseType,
    compound: item.compound,
  }));
}

export function PastSets({ practiceId }: { practiceId: string }) {
  const [rows, setRows] = useState<{ at: string; sets: SetLog[] }[]>([]);
  const [unit, setUnit] = useState<WeightUnit>("lb");
  useEffect(() => {
    setRows(historyFor(practiceId));
    setUnit(loadPrefs().unit);
  }, [practiceId]);
  if (rows.length === 0) {
    return null;
  }
  return (
    <section className="mt-6">
      <h2 className="font-display text-xl">Past sets</h2>
      <ul className="mt-2 space-y-2">
        {rows.map((row) => (
          <li key={row.at} className="rounded-2xl bg-card px-3 py-2 text-sm ring-1 ring-ink/10">
            <p className="text-ink/50">{new Date(row.at).toLocaleDateString()}</p>
            {row.sets.map((set, index) => (
              <p key={set.completedAt + index}>
                Set {index + 1}
                {set.side ? ` · ${set.side}` : ""}
                {set.weight != null ? ` · ${set.weight} ${set.unit}` : ""}
                {set.reps ? ` × ${set.reps}` : ""}
                {set.seconds ? ` · ${set.seconds}s` : ""}
                {set.breaths ? ` · ${set.breaths} breaths` : ""}
              </p>
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}
