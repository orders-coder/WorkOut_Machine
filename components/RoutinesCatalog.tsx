"use client";

import { Disclaimer } from "./Disclaimer";
import { RoutineList } from "./RoutineList";

export function RoutinesCatalog() {
  return (
    <>
      <RoutineList
        heading="Routines"
        intro="A small library of sessions. Yours will land here. Two examples to start."
        emptyMine="Empty. Build one from the home page, or start from a suggestion."
      />
      <footer className="px-3 pb-6">
        <Disclaimer />
      </footer>
    </>
  );
}
