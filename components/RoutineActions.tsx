"use client";

import type { Routine } from "@/lib/types";
import { useLibrary } from "./LibraryProvider";

export function RoutineActions({ routine }: { routine: Routine }) {
  const { isInDumpster, askToDelete, restoreFromDumpster } = useLibrary();
  const trashed = isInDumpster("routine", routine.slug);

  if (trashed) {
    return (
      <div className="mt-4 rounded-2xl bg-card px-4 py-3 opacity-50 ring-1 ring-ink/8">
        <p className="text-sm leading-snug text-ink/70">
          This routine is in the dumpster. Restore it here, or open the dumpster icon. It is
          permanently deleted in a couple of days.
        </p>
        <button
          type="button"
          onClick={() => restoreFromDumpster("routine", routine.slug)}
          className="mt-2 min-h-9 rounded-xl bg-ink px-3 text-sm text-paper"
        >
          Restore
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => askToDelete("routine", routine.slug, routine.title)}
      className="mt-4 min-h-9 rounded-xl bg-card px-3 text-sm text-ink ring-1 ring-ink/10"
    >
      Delete routine
    </button>
  );
}
