"use client";

import { useState } from "react";
import type { Practice } from "@/lib/types";
import { useLibrary } from "./LibraryProvider";

export function DetailActions({ practice }: { practice: Practice }) {
  const {
    isFavorite,
    isInDumpster,
    toggleFavorite,
    askToDelete,
    restoreFromDumpster,
    state,
    setNote,
    addTag,
    removeTag,
  } = useLibrary();
  const [draftTag, setDraftTag] = useState("");
  const favored = isFavorite(practice.id);
  const dumped = isInDumpster("exercise", practice.id);
  const note = state.notes[practice.id] ?? "";
  const tags = state.customTags[practice.id] ?? [];

  return (
    <section className={`mt-5 space-y-3 ${dumped ? "opacity-45" : ""}`}>
      {dumped ? (
        <div className="rounded-xl bg-card px-3 py-2.5 ring-1 ring-ink/8">
          <p className="text-sm leading-snug text-ink/70">
            This exercise is in the dumpster. Restore it here, or open the dumpster icon. It is
            permanently deleted in a couple of days.
          </p>
          <button
            type="button"
            onClick={() => restoreFromDumpster("exercise", practice.id)}
            className="mt-2 min-h-9 rounded-xl bg-ink px-3 text-sm text-paper"
          >
            Restore
          </button>
        </div>
      ) : null}
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => toggleFavorite(practice.id)}
          aria-pressed={favored}
          className={`min-h-9 flex-1 rounded-xl text-sm tracking-wide ${
            favored ? "bg-ink text-paper" : "bg-card text-ink ring-1 ring-ink/10"
          }`}
        >
          {favored ? "In favorites" : "Favorite"}
        </button>
        {dumped ? null : (
          <button
            type="button"
            onClick={() => askToDelete("exercise", practice.id, practice.name)}
            className="min-h-9 flex-1 rounded-xl bg-card text-sm tracking-wide text-ink ring-1 ring-ink/10"
          >
            Delete
          </button>
        )}
      </div>

      <div>
        <label htmlFor={`note-${practice.id}`} className="text-[0.7rem] tracking-[0.18em] uppercase text-ink/45">
          Personal note
        </label>
        <textarea
          id={`note-${practice.id}`}
          value={note}
          onChange={(event) => setNote(practice.id, event.target.value)}
          rows={2}
          placeholder="A sentence for later you."
          className="mt-1 w-full rounded-xl bg-card px-3 py-2 text-sm leading-snug text-ink ring-1 ring-ink/10 placeholder:text-ink/35"
        />
      </div>

      <div>
        <p className="text-[0.7rem] tracking-[0.18em] uppercase text-ink/45">Your tags</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(practice.id, tag)}
              className="min-h-8 rounded-full bg-card px-2.5 text-xs text-ink/70 ring-1 ring-ink/10"
              aria-label={`Remove tag ${tag}`}
            >
              {tag} ×
            </button>
          ))}
        </div>
        <form
          className="mt-2 flex gap-1.5"
          onSubmit={(event) => {
            event.preventDefault();
            addTag(practice.id, draftTag);
            setDraftTag("");
          }}
        >
          <label htmlFor={`tag-${practice.id}`} className="sr-only">
            Add a tag
          </label>
          <input
            id={`tag-${practice.id}`}
            value={draftTag}
            onChange={(event) => setDraftTag(event.target.value)}
            placeholder="Add a tag"
            className="h-9 min-w-0 flex-1 rounded-xl bg-card px-3 text-sm ring-1 ring-ink/10"
          />
          <button
            type="submit"
            className="h-9 rounded-xl bg-ink px-3 text-sm text-paper"
          >
            Add
          </button>
        </form>
      </div>
    </section>
  );
}
