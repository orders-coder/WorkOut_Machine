"use client";

import Link from "next/link";
import { getPracticeById } from "@/data/practices";
import { getRoutine } from "@/data/routines";
import { daysLeft, type DumpsterKind } from "@/lib/dumpster";
import { useLibrary } from "./LibraryProvider";

const KIND_LABEL: Record<DumpsterKind, string> = {
  exercise: "Exercise",
  routine: "Routine",
  log: "Log",
};

function hrefFor(kind: DumpsterKind, id: string): string | undefined {
  if (kind === "exercise") {
    return `/practice/${id}`;
  }
  if (kind === "routine") {
    return `/routines/${id}`;
  }
  return undefined;
}

function exists(kind: DumpsterKind, id: string): boolean {
  if (kind === "exercise") {
    return Boolean(getPracticeById(id));
  }
  if (kind === "routine") {
    return Boolean(getRoutine(id));
  }
  return true;
}

export function Dumpster() {
  const { state, restoreFromDumpster } = useLibrary();
  const entries = [...state.dumpster].sort((a, b) => b.deletedAt - a.deletedAt);

  return (
    <div className="px-3 pb-6 pt-1">
      <p className="text-[0.65rem] tracking-[0.18em] uppercase text-ink/45">
        Work Out Machine
      </p>
      <h1 className="mt-1 font-display text-3xl text-ink">Dumpster</h1>
      <p className="mt-1.5 max-w-[24rem] text-sm leading-snug text-ink/70">
        Deleted exercises, routines, and logs stay here for a couple of days. Restore one, or it is
        permanently deleted.
      </p>

      {entries.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-card px-4 py-3 text-sm leading-snug text-ink/60 ring-1 ring-ink/8">
          Empty. Nothing waiting to be thrown out.
        </p>
      ) : (
        <ul className="mt-5 space-y-1.5">
          {entries.map((entry) => {
            const href = hrefFor(entry.kind, entry.id);
            const stillExists = exists(entry.kind, entry.id);
            return (
              <li
                key={`${entry.kind}-${entry.id}`}
                className="flex items-center gap-2 rounded-2xl bg-card px-3 py-2.5 ring-1 ring-ink/8"
              >
                <div className="min-w-0 flex-1 opacity-50">
                  {href && stillExists ? (
                    <Link href={href} className="font-display text-lg leading-tight text-ink">
                      {entry.title}
                    </Link>
                  ) : (
                    <p className="font-display text-lg leading-tight text-ink">{entry.title}</p>
                  )}
                  <p className="text-[0.7rem] text-ink/55">
                    {KIND_LABEL[entry.kind]} · {daysLeft(entry)}{" "}
                    {daysLeft(entry) === 1 ? "day" : "days"} left
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => restoreFromDumpster(entry.kind, entry.id)}
                  className="min-h-8 shrink-0 rounded-full bg-ink px-3 text-xs text-paper"
                >
                  Restore
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
