"use client";

import { Disclaimer } from "./Disclaimer";
import { RoutineList } from "./RoutineList";

export function RoutinesHome() {
  return (
    <>
      <RoutineList
        heading="Build a routine"
        intro="Put exercises together for the day. Yours start empty. Two suggested routines are here to open or copy from."
        emptyMine="None yet. Open a suggestion, or pick exercises and we will save your own here later."
      />
      <p className="px-3 text-sm leading-snug text-ink/55">
        The full catalog lives under Exercises. Assembling your own saved list comes next.
      </p>
      <footer className="mt-8 px-3 pb-6">
        <Disclaimer />
      </footer>
    </>
  );
}
