export const DUMPSTER_KEEP_MS = 2 * 24 * 60 * 60 * 1000;

export type DumpsterKind = "exercise" | "routine" | "log";

export interface DumpsterEntry {
  kind: DumpsterKind;
  id: string;
  title: string;
  deletedAt: number;
}

export function daysLeft(entry: DumpsterEntry, now = Date.now()): number {
  const remain = entry.deletedAt + DUMPSTER_KEEP_MS - now;
  return Math.max(0, Math.ceil(remain / (24 * 60 * 60 * 1000)));
}

export function isExpired(entry: DumpsterEntry, now = Date.now()): boolean {
  return now - entry.deletedAt >= DUMPSTER_KEEP_MS;
}

export function purgeDumpster(entries: DumpsterEntry[], now = Date.now()): DumpsterEntry[] {
  return entries.filter((entry) => !isExpired(entry, now));
}

export function splitDumpster(
  entries: DumpsterEntry[],
  now = Date.now(),
): { live: DumpsterEntry[]; expired: DumpsterEntry[] } {
  const live: DumpsterEntry[] = [];
  const expired: DumpsterEntry[] = [];
  for (const entry of entries) {
    if (isExpired(entry, now)) {
      expired.push(entry);
    } else {
      live.push(entry);
    }
  }
  return { live, expired };
}

export function isDumpsterEntry(value: unknown): value is DumpsterEntry {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    (record.kind === "exercise" || record.kind === "routine" || record.kind === "log") &&
    typeof record.id === "string" &&
    typeof record.title === "string" &&
    typeof record.deletedAt === "number"
  );
}

export const DELETE_WARNING =
  "It will fade and sit in the dumpster for 2 days. Open the dumpster icon to restore it. After that it is permanently deleted.";
