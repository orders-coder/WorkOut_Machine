import { isDumpsterEntry, splitDumpster } from "./dumpster";
import {
  isPhotoChoiceRecord,
  type LibraryView,
  type PurgedId,
  type UserLibraryState,
  type UserLog,
} from "./types";

export const STORAGE_KEY = "work-out-machine:library-v1";

export const DEFAULT_STATE: UserLibraryState = {
  favorites: [],
  customTags: {},
  notes: {},
  view: "grid",
  photoChoice: {},
  dumpster: [],
  purged: [],
  logs: [],
};

function emptyState(): UserLibraryState {
  return {
    ...DEFAULT_STATE,
    customTags: {},
    notes: {},
    dumpster: [],
    purged: [],
    logs: [],
  };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isTagRecord(value: unknown): value is Record<string, string[]> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  return Object.values(value).every(isStringArray);
}

function isNoteRecord(value: unknown): value is Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  return Object.values(value).every((item) => typeof item === "string");
}

function isLog(value: unknown): value is UserLog {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.title === "string" &&
    typeof record.at === "number"
  );
}

function isPurgedId(value: unknown): value is PurgedId {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    (record.kind === "exercise" || record.kind === "routine" || record.kind === "log") &&
    typeof record.id === "string"
  );
}

function mergePurged(existing: PurgedId[], extra: PurgedId[]): PurgedId[] {
  const next = [...existing];
  for (const item of extra) {
    if (!next.some((entry) => entry.kind === item.kind && entry.id === item.id)) {
      next.push(item);
    }
  }
  return next;
}

export function parseUserLibraryState(raw: string | null): UserLibraryState {
  if (!raw) {
    return emptyState();
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return emptyState();
    }
    const record = parsed as Record<string, unknown>;
    const view: LibraryView = record.view === "list" ? "list" : "grid";
    const fromHidden = isStringArray(record.hidden)
      ? record.hidden.map((id) => ({
          kind: "exercise" as const,
          id,
          title: id,
          deletedAt: Date.now(),
        }))
      : [];
    const stored = Array.isArray(record.dumpster)
      ? record.dumpster.filter(isDumpsterEntry)
      : [];
    const merged = [
      ...stored,
      ...fromHidden.filter(
        (item) => !stored.some((entry) => entry.id === item.id && entry.kind === item.kind),
      ),
    ];
    const { live, expired } = splitDumpster(merged);
    const storedPurged = Array.isArray(record.purged) ? record.purged.filter(isPurgedId) : [];
    const purged = mergePurged(
      storedPurged,
      expired.map((entry) => ({ kind: entry.kind, id: entry.id })),
    );
    const dumpster = live.filter(
      (entry) => !purged.some((item) => item.kind === entry.kind && item.id === entry.id),
    );
    const logs = Array.isArray(record.logs)
      ? record.logs.filter(
          (log) => isLog(log) && !purged.some((item) => item.kind === "log" && item.id === log.id),
        )
      : [];
    return {
      favorites: isStringArray(record.favorites) ? record.favorites : [],
      customTags: isTagRecord(record.customTags) ? record.customTags : {},
      notes: isNoteRecord(record.notes) ? record.notes : {},
      view,
      photoChoice: isPhotoChoiceRecord(record.photoChoice) ? record.photoChoice : {},
      dumpster,
      purged,
      logs,
    };
  } catch {
    return emptyState();
  }
}

export function readUserLibraryState(): UserLibraryState {
  if (typeof window === "undefined") {
    return emptyState();
  }
  return parseUserLibraryState(window.localStorage.getItem(STORAGE_KEY));
}

export function writeUserLibraryState(state: UserLibraryState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
