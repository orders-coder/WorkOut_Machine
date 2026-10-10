"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MUSCLES, type MuscleId } from "@/lib/muscles";
import { DAY_TYPES, dayTypeById, type DayTypeId } from "@/lib/routine-types";
import { readyToFinish, suggestNext, type SuggestCandidate } from "@/lib/suggest-next";
import type { ExerciseType, ForceType, Level, MovementPattern } from "@/lib/types";
import {
  activeSession,
  historyFor,
  lastSetFor,
  loadPrefs,
  loadSessions,
  savePrefs,
  upsertSession,
  volumeOf,
  type SessionExercise,
  type SetLog,
  type WeightUnit,
  type WorkoutSession,
} from "@/lib/workout-session";
import { RoutineList } from "./RoutineList";

export interface WorkoutExercise {
  id: string;
  name: string;
  image: string;
  level: Level;
  bodyweight: boolean;
  exerciseType?: ExerciseType;
  pattern?: MovementPattern;
  force?: ForceType;
  dose?: "reps" | "seconds" | "breaths" | "minutes";
  repRange?: string;
  muscles: MuscleId[];
  compound: boolean;
}

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

export function LiveWorkout({ catalog }: { catalog: WorkoutExercise[] }) {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [ready, setReady] = useState(false);
  const [day, setDay] = useState<DayTypeId>("standard");
  const [mains, setMains] = useState<MuscleId[]>([]);
  const [addon, setAddon] = useState<MuscleId | undefined>();
  const [bodyweightOnly, setBodyweightOnly] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [now, setNow] = useState(() => Date.now());
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [seconds, setSeconds] = useState("");
  const [breaths, setBreaths] = useState(0);
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    const existing = activeSession();
    setSession(existing ?? null);
    setHistory(loadSessions().filter((item) => item.finishedAt));
    setUnit(loadPrefs().unit);
    setReady(true);
  }, []);

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

  const byId = useMemo(() => new Map(catalog.map((item) => [item.id, item])), [catalog]);
  const dayInfo = dayTypeById(session?.dayType ?? day);

  const pool = catalog.filter((item) => {
    if (bodyweightOnly && !item.bodyweight) {
      return false;
    }
    const info = dayTypeById(day);
    if (info.mobilityOnly && item.exerciseType !== "mobility" && item.exerciseType !== "stretch") {
      return false;
    }
    if (info.harder && item.level === "beginner" && item.exerciseType === "strength") {
      return false;
    }
    const focus = addon ? [...mains, addon] : mains;
    return item.muscles.some((muscle) => focus.includes(muscle));
  });

  function toggleMain(id: MuscleId) {
    setAddon((current) => (current === id ? undefined : current));
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
  }

  function start() {
    if (picked.length === 0) {
      return;
    }
    const next: WorkoutSession = {
      id: crypto.randomUUID(),
      dayType: day,
      mains,
      addon,
      bodyweightOnly,
      startedAt: new Date().toISOString(),
      exercises: picked.map((practiceId) => ({ practiceId, sets: [] })),
      index: 0,
      phase: "work",
    };
    persist(next);
    fillFromLast(picked[0]);
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
    const entry: SetLog = { at: new Date().toISOString() };
    if (info.dose === "seconds" || info.dose === "minutes") {
      entry.seconds = Number(seconds) || 30;
    } else if (info.dose === "breaths") {
      entry.breaths = breaths || 8;
    } else {
      entry.reps = Number(reps) || 0;
      if (weight) {
        entry.weight = Number(weight);
      }
    }
    const exercises = session.exercises.map((item, index) =>
      index === session.index ? { ...item, sets: [...item.sets, entry] } : item,
    );
    const restEndsAt = new Date(Date.now() + dayTypeById(session.dayType).restSeconds * 1000).toISOString();
    persist({ ...session, exercises, phase: "rest", restEndsAt });
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
    persist({ ...session, phase: "suggest" });
  }

  function chooseNext(id: string) {
    if (!session) {
      return;
    }
    const exercises = [...session.exercises, { practiceId: id, sets: [] }];
    persist({ ...session, exercises, index: exercises.length - 1, phase: "work" });
    fillFromLast(id);
    setQuery("");
  }

  function finishWorkout() {
    if (!session) {
      return;
    }
    persist({ ...session, phase: "done", finishedAt: new Date().toISOString(), restEndsAt: undefined });
  }

  const elapsed = session ? Math.max(0, Math.floor((now - new Date(session.startedAt).getTime()) / 1000)) : 0;
  const restLeft = session?.restEndsAt
    ? Math.max(0, Math.ceil((new Date(session.restEndsAt).getTime() - now) / 1000))
    : 0;

  if (!ready) {
    return null;
  }

  if (!session) {
    return (
      <div className="px-3 pb-6 pt-1">
        <p className="text-[0.65rem] tracking-[0.18em] uppercase text-ink/45">Work Out Machine</p>
        <h1 className="mt-1 font-display text-[2.35rem] leading-none tracking-tight text-ink">Workout</h1>
        <p className="mt-1.5 text-sm text-ink/70">Pick a day, a couple of muscles, and the first exercise. The rest gets suggested as you go.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {DAY_TYPES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setDay(item.id);
                setPicked([]);
              }}
              className={`min-h-11 rounded-full px-3 text-sm ${day === item.id ? "bg-[#0071e3] text-white" : "bg-card text-ink ring-1 ring-ink/10"}`}
            >
              {item.label}
              <span className="ml-1 text-xs opacity-70">{item.targetMinutes}m</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs uppercase tracking-[0.14em] text-ink/45">Main muscles, up to two</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MUSCLES.map((muscle) => (
            <button
              key={muscle.id}
              type="button"
              onClick={() => toggleMain(muscle.id)}
              className={`min-h-11 rounded-full px-3 text-sm ${mains.includes(muscle.id) ? "bg-ink text-white" : "bg-card text-ink ring-1 ring-ink/10"}`}
            >
              {muscle.label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs uppercase tracking-[0.14em] text-ink/45">Add-on, optional</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MUSCLES.filter((muscle) => !mains.includes(muscle.id)).map((muscle) => (
            <button
              key={muscle.id}
              type="button"
              onClick={() => {
                setAddon((current) => (current === muscle.id ? undefined : muscle.id));
                setPicked([]);
              }}
              className={`min-h-11 rounded-full px-3 text-sm ${addon === muscle.id ? "bg-[#0071e3] text-white" : "bg-card text-ink ring-1 ring-ink/10"}`}
            >
              {muscle.label}
            </button>
          ))}
        </div>

        <label className="mt-4 flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={bodyweightOnly}
            onChange={(event) => {
              setBodyweightOnly(event.target.checked);
              setPicked([]);
            }}
          />
          No equipment
        </label>

        {mains.length > 0 ? (
          <div className="mt-4 space-y-2">
            <p className="text-xs uppercase tracking-[0.14em] text-ink/45">First exercises, pick 1 or 2</p>
            {pool.slice(0, 8).map((item) => {
              const on = picked.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setPicked((current) => {
                      if (current.includes(item.id)) {
                        return current.filter((id) => id !== item.id);
                      }
                      if (current.length >= 2) {
                        return [current[1], item.id];
                      }
                      return [...current, item.id];
                    })
                  }
                  className={`flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 text-left ${on ? "bg-ink text-white" : "bg-card ring-1 ring-ink/10"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt="" className="h-12 w-12 rounded-xl object-contain bg-white" />
                  <span className="text-base">{item.name}</span>
                </button>
              );
            })}
            {pool.length === 0 ? <p className="text-sm text-ink/60">Nothing matches those muscles and that filter.</p> : null}
          </div>
        ) : null}

        <button
          type="button"
          disabled={picked.length === 0}
          onClick={start}
          className="mt-4 min-h-14 w-full rounded-full bg-[#0071e3] text-base text-white disabled:opacity-40"
        >
          Start
        </button>

        {history.length > 0 ? (
          <section className="mt-8">
            <h2 className="font-display text-xl">History</h2>
            <ul className="mt-2 space-y-2">
              {history.map((item) => (
                <li key={item.id} className="rounded-2xl bg-card px-3 py-3 text-sm ring-1 ring-ink/10">
                  <p className="font-medium">{dayTypeById(item.dayType).label}</p>
                  <p className="text-ink/60">
                    {new Date(item.startedAt).toLocaleDateString()} · {item.exercises.length} exercises ·{" "}
                    {item.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)} sets
                  </p>
                </li>
              ))}
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
          onClick={() => setSession(null)}
        >
          Back to workouts
        </button>
      </div>
    );
  }

  const exercise = currentExercise();
  const info = exercise ? byId.get(exercise.practiceId) : undefined;
  const candidates = toCandidates(catalog.filter((item) => (session.bodyweightOnly ? item.bodyweight : true)));
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
    setsPerMain: dayInfo.setsPerMain,
    setsPerAddon: dayInfo.setsPerAddon,
  };
  const suggestions = suggestNext(suggestionInput);

  return (
    <div className="px-3 pb-6 pt-1">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-ink/70">
          {formatClock(elapsed)} <span className="text-ink/40">/ {dayInfo.targetMinutes}:00</span>
        </p>
        <p className="text-xs uppercase tracking-[0.14em] text-ink/45">{dayInfo.label}</p>
      </div>

      {session.phase === "suggest" && info ? (
        <div className="mt-4">
          <h1 className="font-display text-3xl">Next</h1>
          {readyToFinish(suggestionInput) ? (
            <p className="mt-1 text-sm text-ink/70">Time or muscles are covered. A stretch is a good way to stop.</p>
          ) : null}
          <div className="mt-3 space-y-2">
            {suggestions.map((item) => {
              const full = byId.get(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => chooseNext(item.id)}
                  className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-card px-3 text-left ring-1 ring-ink/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={full?.image} alt="" className="h-12 w-12 rounded-xl object-contain" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search any exercise"
            className="mt-3 min-h-12 w-full rounded-full bg-card px-4 ring-1 ring-ink/10"
          />
          {query ? (
            <div className="mt-2 space-y-2">
              {catalog
                .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 6)
                .map((item) => (
                  <button key={item.id} type="button" onClick={() => chooseNext(item.id)} className="min-h-12 w-full rounded-2xl bg-card px-3 text-left ring-1 ring-ink/10">
                    {item.name}
                  </button>
                ))}
            </div>
          ) : null}
          <button type="button" onClick={finishWorkout} className="mt-4 min-h-14 w-full rounded-full bg-ink text-white">
            Finish
          </button>
        </div>
      ) : null}

      {info && exercise && session.phase !== "suggest" ? (
        <div className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={info.image} alt="" className="mx-auto h-36 w-auto object-contain" />
          <h1 className="mt-2 font-display text-4xl leading-none">{info.name}</h1>
          <p className="mt-1 text-sm text-ink/60">{doseLine(info, dayInfo.harder)}</p>
          <p className="mt-1 text-sm text-ink/50">
            {exercise.sets.length} {exercise.sets.length === 1 ? "set" : "sets"} logged
          </p>

          {session.phase === "rest" ? (
            <div className="mt-4 rounded-3xl bg-ink px-4 py-6 text-center text-white">
              <p className="text-xs uppercase tracking-[0.16em] text-white/60">Rest</p>
              <p className="mt-1 font-display text-6xl">{formatClock(restLeft)}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => addRest(15)} className="min-h-14 rounded-full bg-white/15">
                  +15s
                </button>
                <button type="button" onClick={() => persist({ ...session, phase: "work", restEndsAt: undefined })} className="min-h-14 rounded-full bg-white text-ink">
                  Skip
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {info.dose === "breaths" ? (
                <button type="button" onClick={() => setBreaths((count) => count + 1)} className="min-h-14 w-full rounded-2xl bg-card text-lg ring-1 ring-ink/10">
                  Breath {breaths}
                </button>
              ) : info.dose === "seconds" || info.dose === "minutes" ? (
                <HoldField value={seconds} onChange={setSeconds} />
              ) : (
                <>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input
                      inputMode="decimal"
                      value={weight}
                      onChange={(event) => setWeight(event.target.value)}
                      placeholder="Weight"
                      className="min-h-14 rounded-2xl bg-card px-3 text-lg ring-1 ring-ink/10"
                    />
                    <button
                      type="button"
                      className="min-h-14 rounded-2xl bg-card px-4 ring-1 ring-ink/10"
                      onClick={() => {
                        const next = unit === "kg" ? "lb" : "kg";
                        setUnit(next);
                        savePrefs({ unit: next });
                      }}
                    >
                      {unit}
                    </button>
                  </div>
                  <input
                    inputMode="numeric"
                    value={reps}
                    onChange={(event) => setReps(event.target.value)}
                    placeholder="Reps"
                    className="min-h-14 w-full rounded-2xl bg-card px-3 text-lg ring-1 ring-ink/10"
                  />
                </>
              )}
              <button type="button" onClick={logSet} className="min-h-14 w-full rounded-full bg-[#0071e3] text-base text-white">
                Log set
              </button>
              <button type="button" onClick={finishExercise} className="min-h-12 w-full rounded-full text-sm text-ink/70">
                Exercise done
              </button>
              <button
                type="button"
                onClick={() => persist({ ...session, phase: "suggest" })}
                className="min-h-12 w-full rounded-full bg-card text-sm ring-1 ring-ink/10"
              >
                Add exercise
              </button>
            </div>
          )}
          <p className="mt-4 text-center text-xs">
            <Link href={`/practice/${info.id}`} className="text-[#0071e3]">
              Open the exercise page
            </Link>
          </p>
        </div>
      ) : null}
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
    <button type="button" onClick={() => setRunning((value) => !value)} className="min-h-14 w-full rounded-2xl bg-card text-lg ring-1 ring-ink/10">
      {running ? `Hold ${formatClock(left)}` : `Start hold ${value || 30}s`}
    </button>
  );
}

function doseLine(info: WorkoutExercise, harder: boolean): string {
  if (info.dose === "seconds" || info.dose === "minutes") {
    return info.repRange ?? "Hold 30s";
  }
  if (info.dose === "breaths") {
    return "8 breaths";
  }
  const sets = harder ? 4 : 3;
  return `${sets} × ${info.repRange ?? "8–12"}`;
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
  const [unit, setUnit] = useState<WeightUnit>("kg");
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
              <p key={set.at}>
                Set {index + 1}
                {set.weight ? ` · ${set.weight} ${unit}` : ""}
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
