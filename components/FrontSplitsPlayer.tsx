"use client";

import { useEffect, useRef, useState } from "react";
import type { GuideStep } from "@/data/front-splits";
import { clearFrontSplitsLive } from "./FrontSplitsRoutine";
import { upsertSession } from "@/lib/workout-session";
import { RoundClock } from "./RoundClock";

const PHOTO_KEY = "work-out-machine:splits-photos-v1";

interface SavedPhoto {
  at: string;
  dataUrl: string;
}

function beep() {
  const context = new AudioContext();
  const tone = context.createOscillator();
  const gain = context.createGain();
  tone.frequency.value = 660;
  gain.gain.value = 0.04;
  tone.connect(gain);
  gain.connect(context.destination);
  tone.start();
  tone.stop(context.currentTime + 0.12);
  window.setTimeout(() => void context.close(), 400);
}

function loadPhotos(): SavedPhoto[] {
  try {
    const raw = window.localStorage.getItem(PHOTO_KEY);
    const parsed = raw ? (JSON.parse(raw) as SavedPhoto[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function FrontSplitsPlayer({
  steps,
  rounds,
  startedAt,
}: {
  steps: GuideStep[];
  rounds: number;
  startedAt: string;
}) {
  const [index, setIndex] = useState(0);
  const [moveIndex, setMoveIndex] = useState(0);
  const [remaining, setRemaining] = useState(steps[0]?.seconds ?? 0);
  const [running, setRunning] = useState(steps[0]?.guide === "hold" || steps[0]?.guide === "pnf" || steps[0]?.guide === "breath");
  const [reps, setReps] = useState(0);
  const [transition, setTransition] = useState(0);
  const [pnf, setPnf] = useState({ cycle: 1, phase: "Press", left: 5 });
  const [breath, setBreath] = useState({ phase: "Inhale", left: 4 });
  const [done, setDone] = useState(false);
  const [photoNote, setPhotoNote] = useState("");
  const warned = useRef(false);

  const step = steps[index];

  useEffect(() => {
    if (!step || done || transition > 0 || !running) {
      return;
    }
    if (step.guide === "reps" || step.guide === "switch" || step.guide === "note") {
      return;
    }
    const timer = window.setInterval(() => {
      if (step.guide === "pnf") {
        setPnf((current) => {
          if (current.left > 1) {
            return { ...current, left: current.left - 1 };
          }
          beep();
          if (current.phase === "Press") {
            return { ...current, phase: "Relax", left: 5 };
          }
          if (current.phase === "Relax") {
            return { ...current, phase: "Sink deeper", left: 10 };
          }
          if (current.cycle < 3) {
            return { cycle: current.cycle + 1, phase: "Press", left: 5 };
          }
          window.setTimeout(() => advance(), 0);
          return current;
        });
        return;
      }
      if (step.guide === "breath") {
        setBreath((current) => {
          if (current.left > 1) {
            return { ...current, left: current.left - 1 };
          }
          return current.phase === "Inhale" ? { phase: "Exhale", left: 6 } : { phase: "Inhale", left: 4 };
        });
      }
      setRemaining((value) => {
        if (value === 6) {
          beep();
        }
        if (value <= 1) {
          beep();
          window.setTimeout(() => advance(), 0);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step, running, done, transition, index, moveIndex]);

  function advance() {
    if (!step) {
      return;
    }
    const next = steps[index + 1];
    if (!next) {
      finish();
      return;
    }
    setTransition(5);
  }

  useEffect(() => {
    if (transition <= 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setTransition((value) => {
        if (value <= 1) {
          const nextIndex = index + 1;
          const next = steps[nextIndex];
          setIndex(nextIndex);
          setMoveIndex(0);
          setReps(0);
          setPnf({ cycle: 1, phase: "Press", left: 5 });
          setBreath({ phase: "Inhale", left: 4 });
          setRemaining(next?.seconds ?? 0);
          setRunning(next?.guide === "hold" || next?.guide === "pnf" || next?.guide === "breath");
          warned.current = false;
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [transition, index, steps]);

  function finish() {
    const finishedAt = new Date().toISOString();
    upsertSession({
      id: `splits-${startedAt}`,
      dayType: "20",
      mains: ["hip-flexors", "hamstrings"],
      bodyweightOnly: true,
      startedAt,
      finishedAt,
      title: "Front Splits",
      rounds,
      exercises: steps
        .filter((item) => item.guide !== "switch" && item.guide !== "note")
        .map((item) => ({
          practiceId: item.id,
          sets: [{ seconds: item.seconds, at: finishedAt }],
        })),
      index: steps.length,
      phase: "done",
    });
    const photos = loadPhotos();
    const last = photos[0] ? new Date(photos[0].at).getTime() : 0;
    const weeks = last ? (Date.now() - last) / (1000 * 60 * 60 * 24 * 7) : 99;
    setPhotoNote(weeks >= 4 ? "It has been a few weeks. A progress photo helps you see the change." : "");
    setDone(true);
    clearFrontSplitsLive();
  }

  function savePhoto(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      const next = [{ at: new Date().toISOString(), dataUrl }, ...loadPhotos()].slice(0, 12);
      window.localStorage.setItem(PHOTO_KEY, JSON.stringify(next));
      setPhotoNote("Saved on this phone.");
    };
    reader.readAsDataURL(file);
  }

  if (done) {
    const minutes = Math.max(1, Math.round((Date.now() - new Date(startedAt).getTime()) / 60000));
    return (
      <div className="px-3 py-6">
        <p className="text-sm text-ink/50">Logged</p>
        <h1 className="mt-2 font-display text-4xl text-ink">Front Splits</h1>
        <p className="mt-2 text-sm text-ink/70">
          {rounds} {rounds === 1 ? "round" : "rounds"} · {minutes} min
        </p>
        <label className="mt-6 block text-sm">
          Progress photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="mt-2 block w-full text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                savePhoto(file);
              }
            }}
          />
        </label>
        {photoNote ? <p className="mt-2 text-sm text-ink/70">{photoNote}</p> : null}
      </div>
    );
  }

  if (!step) {
    return null;
  }

  if (transition > 0) {
    const next = steps[index + 1];
    return (
      <div className="px-3 py-6 text-center">
        <RoundClock seconds={transition} total={5} />
        {next?.image ? <img src={next.image} alt="" className="mx-auto mt-4 h-52 w-full rounded-2xl bg-white object-contain" /> : null}
        <p className="mt-4 font-display text-4xl leading-tight text-ink">Next: {next?.name}</p>
        <button type="button" onClick={() => setTransition(1)} className="mt-8 min-h-12 w-full rounded-full bg-ink text-sm text-white">
          Skip
        </button>
      </div>
    );
  }

  const image = step.image;
  const title = step.name;

  return (
    <div className="px-3 pb-6 pt-4">
      <p className="text-xs uppercase tracking-[0.14em] text-ink/45">
          {step.guide === "note"
            ? "Before you start"
            : step.guide === "switch"
            ? "Switch"
            : step.side === "right"
              ? "Right leg"
              : "Left leg"}
        </p>
      {step.image ? <img src={image} alt="" className="mt-3 h-40 w-full rounded-2xl bg-white object-contain" /> : null}
      <h1 className="mt-3 font-display text-3xl leading-none text-ink">{title}</h1>
      {step.setup ? <p className="mt-2 text-sm text-ink/70">{step.setup}</p> : null}

      {step.guide === "note" ? (
        <ol className="mt-4 space-y-2">
          <li className="flex items-center gap-3 rounded-2xl bg-white p-2 ring-1 ring-ink/10">
            <span className="w-6 text-center text-sm text-ink/45">1</span>
            <img src="/exercises/warm-up-general/demo.gif" alt="" className="h-16 w-16 rounded-xl bg-[#f5f5f7] object-contain" />
            <span className="text-sm text-ink">Warm-up</span>
          </li>
          {steps
            .filter((item) => item.side === "right")
            .map((item, itemIndex) => (
              <li key={item.id} className="flex items-center gap-3 rounded-2xl bg-white p-2 ring-1 ring-ink/10">
                <span className="w-6 text-center text-sm text-ink/45">{itemIndex + 2}</span>
                {item.image ? <img src={item.image} alt="" className="h-16 w-16 rounded-xl bg-[#f5f5f7] object-contain" /> : null}
                <span className="text-sm text-ink">{item.name}</span>
              </li>
            ))}
          <li className="px-2 pt-1 text-sm text-ink/60">Then the same sequence on the left leg.</li>
        </ol>
      ) : null}

      {step.guide === "switch" || step.guide === "note" ? (
        <button type="button" onClick={advance} className="mt-8 min-h-14 w-full rounded-full bg-[#0071e3] text-base text-white">
          {step.guide === "note" ? "Begin" : "Switch to the left leg"}
        </button>
      ) : null}

      {step.guide === "reps" ? (
        <button
          type="button"
          onClick={() => setReps((value) => value + 1)}
          className="mt-6 flex h-36 w-full items-center justify-center rounded-3xl bg-white font-display text-6xl text-ink ring-1 ring-ink/10"
        >
          {reps}
        </button>
      ) : null}

      {step.guide !== "reps" && step.guide !== "switch" && step.guide !== "note" ? (
        <div className="mt-5">
          <RoundClock
            running={running}
            seconds={step.guide === "pnf" ? pnf.left : remaining}
            total={
              step.guide === "pnf"
                ? pnf.phase === "Sink deeper"
                  ? 10
                  : 5
                : Math.max(step.seconds, remaining, 1)
            }
          />
        </div>
      ) : null}
      {step.guide === "pnf" ? (
        <p className="text-sm text-ink/70">
          {pnf.phase} · cycle {pnf.cycle} of 3
        </p>
      ) : null}
      {step.guide === "breath" ? (
        <p className="text-sm text-ink/70">
          {breath.phase} {breath.left}s
        </p>
      ) : null}

      {step.guide === "note" ? null : (
      <ul className="mt-4 space-y-1 text-sm text-ink">
        {step.cues.slice(0, 3).map((cue) => (
          <li key={cue}>{cue}</li>
        ))}
      </ul>
      )}
      {step.why ? <p className="mt-3 text-sm text-ink/70">{step.why}</p> : null}
      {step.mistake ? <p className="mt-3 text-sm text-ink/70">Common mistake: {step.mistake}</p> : null}

      {step.guide === "switch" || step.guide === "note" ? null : (
      <div className="mt-6 grid grid-cols-3 gap-2">
        {step.guide !== "reps" ? (
          <button type="button" onClick={() => setRunning((value) => !value)} className="min-h-12 rounded-full bg-white text-sm ring-1 ring-ink/10">
            {running ? "Pause" : "Resume"}
          </button>
        ) : (
          <span />
        )}
        <button type="button" onClick={advance} className="min-h-12 rounded-full bg-white text-sm ring-1 ring-ink/10">
          Skip
        </button>
        {step.guide !== "reps" ? (
          <button type="button" onClick={() => setRemaining((value) => value + 15)} className="min-h-12 rounded-full bg-white text-sm ring-1 ring-ink/10">
            +15s
          </button>
        ) : (
          <button
            type="button"
            disabled={reps < step.minReps}
            onClick={advance}
            className="min-h-12 rounded-full bg-[#0071e3] text-sm text-white disabled:opacity-40"
          >
            Done
          </button>
        )}
      </div>
      )}
    </div>
  );
}
