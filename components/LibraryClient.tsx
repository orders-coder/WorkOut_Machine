"use client";

import { useMemo, useState } from "react";
import type { Equipment, Level, Practice, Sport } from "@/lib/types";
import { EQUIPMENT_LABEL, LEVEL_LABEL, SPORT_LABEL } from "@/lib/labels";
import { EMPTY_FILTERS, filterPractices, type WayFilter } from "@/lib/filter";
import { Disclaimer } from "./Disclaimer";
import { useLibrary } from "./LibraryProvider";
import { PracticeCard } from "./PracticeCard";

const WAYS: { id: WayFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "inner", label: "Inner" },
  { id: "soft-body", label: "Soft" },
  { id: "strength", label: "Strength" },
];

const SPORT_CHIPS: Sport[] = ["surfing", "climbing", "cycling"];
const EQUIPMENT_CHIPS: Equipment[] = [
  "none",
  "mat",
  "wall",
  "band",
  "pull-up-bar",
  "dumbbells",
  "floor",
];
const LEVEL_CHIPS: Level[] = ["beginner", "intermediate", "advanced"];

function toggleIn<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item];
}

export function LibraryClient({
  practices,
  heading = "Exercises",
  intro,
  empty,
  lockFavorites,
  lockWay,
}: {
  practices: Practice[];
  heading?: string;
  intro?: string;
  empty?: string;
  lockFavorites?: boolean;
  lockWay?: WayFilter;
}) {
  const { state, setView } = useLibrary();
  const [query, setQuery] = useState("");
  const [way, setWay] = useState<WayFilter>(lockWay ?? "all");
  const [sports, setSports] = useState<Sport[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(Boolean(lockFavorites));

  const filtered = useMemo(() => {
    const dumpedIds = [
      ...state.dumpster.filter((entry) => entry.kind === "exercise").map((entry) => entry.id),
      ...state.purged.filter((entry) => entry.kind === "exercise").map((entry) => entry.id),
    ];
    return filterPractices(
      practices,
      {
        ...EMPTY_FILTERS,
        query,
        way: lockWay ?? way,
        sports,
        equipment,
        levels,
        favoritesOnly: lockFavorites ? true : favoritesOnly,
      },
      {
        favorites: state.favorites,
        dumpedIds,
        customTags: state.customTags,
      },
    );
  }, [
    practices,
    query,
    way,
    lockWay,
    sports,
    equipment,
    levels,
    favoritesOnly,
    lockFavorites,
    state.dumpster,
    state.purged,
    state.favorites,
    state.customTags,
  ]);

  return (
    <div className="px-3 pt-1">
      <header className="mb-3">
        <p className="text-[0.65rem] tracking-[0.18em] uppercase text-ink/45">
          Work Out Machine
        </p>
        <h1 className="mt-1 font-display text-[2.35rem] leading-none tracking-tight text-ink">{heading}</h1>
        {intro ? <p className="mt-1.5 max-w-[22rem] text-sm leading-snug text-ink/70">{intro}</p> : null}
      </header>

      <label className="sr-only" htmlFor="library-search">
        Search practices
      </label>
      <input
        id="library-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search name, target, tag, sport…"
        className="mt-4 h-11 w-full rounded-full bg-card px-4 text-sm text-ink shadow-sm ring-1 ring-ink/8 placeholder:text-ink/35"
      />

      {lockWay ? null : (
        <div
          className="mt-3 flex gap-1.5"
          role="tablist"
          aria-label="Filter by way"
        >
          {WAYS.map((item) => {
            const active = way === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setWay(item.id)}
                className={`min-h-8 rounded-full px-3 text-xs ${
                  active ? "bg-[#0071e3] text-white" : "bg-card text-[#1d1d1f] ring-1 ring-black/10"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {lockFavorites ? null : (
          <Chip
            label="Favorites"
            active={favoritesOnly}
            onClick={() => setFavoritesOnly((value) => !value)}
          />
        )}
        {SPORT_CHIPS.map((sport) => (
          <Chip
            key={sport}
            label={SPORT_LABEL[sport]}
            active={sports.includes(sport)}
            onClick={() => setSports((list) => toggleIn(list, sport))}
          />
        ))}
        {EQUIPMENT_CHIPS.map((item) => (
          <Chip
            key={item}
            label={EQUIPMENT_LABEL[item]}
            active={equipment.includes(item)}
            onClick={() => setEquipment((list) => toggleIn(list, item))}
          />
        ))}
        {LEVEL_CHIPS.map((level) => (
          <Chip
            key={level}
            label={LEVEL_LABEL[level]}
            active={levels.includes(level)}
            onClick={() => setLevels((list) => toggleIn(list, level))}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm text-ink/50">
          {filtered.length} {filtered.length === 1 ? "practice" : "practices"}
        </p>
        <div className="flex rounded-full bg-card p-1 ring-1 ring-ink/8" role="group" aria-label="Layout">
          <button
            type="button"
            className={`min-h-8 min-w-14 rounded-full text-[0.7rem] tracking-wide ${
              state.view === "grid" ? "bg-[#0071e3] text-white" : "text-[#6e6e73]"
            }`}
            aria-pressed={state.view === "grid"}
            onClick={() => setView("grid")}
          >
            Grid
          </button>
          <button
            type="button"
            className={`min-h-8 min-w-14 rounded-full text-[0.7rem] tracking-wide ${
              state.view === "list" ? "bg-[#0071e3] text-white" : "text-[#6e6e73]"
            }`}
            aria-pressed={state.view === "list"}
            onClick={() => setView("list")}
          >
            List
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center font-display text-xl leading-snug text-ink/70">
          {empty ?? "Nothing in this room yet."}
        </p>
      ) : state.view === "grid" ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {filtered.map((practice) => (
            <PracticeCard key={practice.id} practice={practice} layout="grid" />
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-1.5">
          {filtered.map((practice) => (
            <PracticeCard key={practice.id} practice={practice} layout="list" />
          ))}
        </div>
      )}

      <footer className="mt-8 pb-2">
        <Disclaimer />
      </footer>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-8 rounded-full px-2.5 text-xs ${
        active ? "bg-[#0071e3] text-white" : "bg-card text-[#6e6e73] ring-1 ring-black/10"
      }`}
    >
      {label}
    </button>
  );
}
