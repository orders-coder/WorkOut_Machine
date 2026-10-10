"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { type DumpsterEntry, type DumpsterKind } from "@/lib/dumpster";
import type { LibraryView, UserLibraryState } from "@/lib/types";
import { DEFAULT_STATE, readUserLibraryState, writeUserLibraryState } from "@/lib/storage";

interface LibraryContextValue {
  state: UserLibraryState;
  ready: boolean;
  isFavorite: (id: string) => boolean;
  isInDumpster: (kind: DumpsterKind, id: string) => boolean;
  isGone: (kind: DumpsterKind, id: string) => boolean;
  toggleFavorite: (id: string) => void;
  askToDelete: (kind: DumpsterKind, id: string, title: string) => boolean;
  restoreFromDumpster: (kind: DumpsterKind, id: string) => void;
  setNote: (id: string, note: string) => void;
  addTag: (id: string, tag: string) => void;
  removeTag: (id: string, tag: string) => void;
  setView: (view: LibraryView) => void;
  setPhotoChoice: (practiceId: string, photoId: string) => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserLibraryState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(readUserLibraryState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    writeUserLibraryState(state);
  }, [ready, state]);

  const isFavorite = useCallback(
    (id: string) => state.favorites.includes(id),
    [state.favorites],
  );

  const isInDumpster = useCallback(
    (kind: DumpsterKind, id: string) =>
      state.dumpster.some((entry) => entry.kind === kind && entry.id === id),
    [state.dumpster],
  );

  const isGone = useCallback(
    (kind: DumpsterKind, id: string) =>
      isInDumpster(kind, id) ||
      state.purged.some((entry) => entry.kind === kind && entry.id === id),
    [isInDumpster, state.purged],
  );

  const toggleFavorite = useCallback((id: string) => {
    setState((current) => {
      const has = current.favorites.includes(id);
      return {
        ...current,
        favorites: has
          ? current.favorites.filter((item) => item !== id)
          : [...current.favorites, id],
      };
    });
  }, []);

  const askToDelete = useCallback((kind: DumpsterKind, id: string, title: string) => {
    const noun =
      kind === "exercise" ? "exercise" : kind === "routine" ? "routine" : "log";
    const ok = window.confirm(
      `Delete “${title}”?\n\nThe ${noun} will fade and sit in the dumpster for a couple of days. Open the dumpster icon to restore it. Then it is permanently deleted.`,
    );
    if (!ok) {
      return false;
    }
    setState((current) => {
      if (
        current.dumpster.some((entry) => entry.kind === kind && entry.id === id) ||
        current.purged.some((entry) => entry.kind === kind && entry.id === id)
      ) {
        return current;
      }
      const entry: DumpsterEntry = {
        kind,
        id,
        title,
        deletedAt: Date.now(),
      };
      return { ...current, dumpster: [...current.dumpster, entry] };
    });
    return true;
  }, []);

  const restoreFromDumpster = useCallback((kind: DumpsterKind, id: string) => {
    setState((current) => ({
      ...current,
      dumpster: current.dumpster.filter(
        (entry) => !(entry.kind === kind && entry.id === id),
      ),
    }));
  }, []);

  const setNote = useCallback((id: string, note: string) => {
    setState((current) => {
      const notes = { ...current.notes };
      if (note.trim() === "") {
        delete notes[id];
      } else {
        notes[id] = note;
      }
      return { ...current, notes };
    });
  }, []);

  const addTag = useCallback((id: string, tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed) {
      return;
    }
    setState((current) => {
      const existing = current.customTags[id] ?? [];
      if (existing.includes(trimmed)) {
        return current;
      }
      return {
        ...current,
        customTags: {
          ...current.customTags,
          [id]: [...existing, trimmed],
        },
      };
    });
  }, []);

  const removeTag = useCallback((id: string, tag: string) => {
    setState((current) => {
      const existing = current.customTags[id] ?? [];
      const next = existing.filter((item) => item !== tag);
      const customTags = { ...current.customTags };
      if (next.length === 0) {
        delete customTags[id];
      } else {
        customTags[id] = next;
      }
      return { ...current, customTags };
    });
  }, []);

  const setView = useCallback((view: LibraryView) => {
    setState((current) => ({ ...current, view }));
  }, []);

  const setPhotoChoice = useCallback((practiceId: string, photoId: string) => {
    setState((current) => ({
      ...current,
      photoChoice: { ...current.photoChoice, [practiceId]: photoId },
    }));
  }, []);

  const value = useMemo(
    () => ({
      state,
      ready,
      isFavorite,
      isInDumpster,
      isGone,
      toggleFavorite,
      askToDelete,
      restoreFromDumpster,
      setNote,
      addTag,
      removeTag,
      setView,
      setPhotoChoice,
    }),
    [
      state,
      ready,
      isFavorite,
      isInDumpster,
      isGone,
      toggleFavorite,
      askToDelete,
      restoreFromDumpster,
      setNote,
      addTag,
      removeTag,
      setView,
      setPhotoChoice,
    ],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryContextValue {
  const value = useContext(LibraryContext);
  if (!value) {
    throw new Error("useLibrary must be used within LibraryProvider");
  }
  return value;
}
