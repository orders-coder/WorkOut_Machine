"use client";

import { useEffect, useMemo, useState } from "react";
import { MUSCLES, getMuscle, type MuscleId } from "@/lib/muscles";
import { practiceHitsMuscle } from "@/lib/muscle-index";
import { customToPractice, loadCustomExercises, saveCustomExercise } from "@/lib/custom-exercises";
import type { Equipment, Level, Practice, Sport } from "@/lib/types";
import { EQUIPMENT_LABEL, LEVEL_LABEL, SPORT_LABEL } from "@/lib/labels";
import { EMPTY_FILTERS, filterPractices, type WayFilter } from "@/lib/filter";
import { Disclaimer } from "./Disclaimer";
import { useLibrary } from "./LibraryProvider";
import { PracticeCard } from "./PracticeCard";
import { BodyFigure } from "./BodyMap";

const WAYS: { id: WayFilter; label: string }[] = [
  { id: "all", label: "All" },
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
  showBody,
}: {
  practices: Practice[];
  heading?: string;
  intro?: string;
  empty?: string;
  lockFavorites?: boolean;
  lockWay?: WayFilter;
  showBody?: boolean;
}) {
  const { state, setView } = useLibrary();
  const [query, setQuery] = useState("");
  const [way, setWay] = useState<WayFilter>(lockWay ?? "all");
  const [sports, setSports] = useState<Sport[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(Boolean(lockFavorites));
  const [custom, setCustom] = useState<Practice[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [muscles, setMuscles] = useState<MuscleId[]>([]);
  const [level, setLevel] = useState<Level>("intermediate");
  const [gear, setGear] = useState<Equipment>("none");
  const [dose, setDose] = useState<"reps" | "seconds">("reps");
  const [repRange, setRepRange] = useState("8–12");
  const [muscle, setMuscle] = useState<MuscleId | null>(null);
  const [hovered, setHovered] = useState<MuscleId | null>(null);
  const live = useMemo(() => new Set(MUSCLES.map((item) => item.id)), []);

  useEffect(() => {
    setCustom(loadCustomExercises().map(customToPractice));
    const param = new URLSearchParams(window.location.search).get("m");
    if (param && MUSCLES.some((item) => item.id === param)) {
      setMuscle(param as MuscleId);
    }
  }, []);

  const catalog = useMemo(() => [...custom, ...practices], [custom, practices]);

  const filtered = useMemo(() => {
    const dumpedIds = [
      ...state.dumpster.filter((entry) => entry.kind === "exercise").map((entry) => entry.id),
      ...state.purged.filter((entry) => entry.kind === "exercise").map((entry) => entry.id),
    ];
    return filterPractices(
      catalog,
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
    catalog,
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

  const visible = useMemo(() => {
    if (!muscle) {
      return filtered;
    }
    const label = getMuscle(muscle)?.label.toLowerCase();
    return filtered.filter((practice) => {
      const named = label ? practice.target.some((target) => target.toLowerCase() === label) : false;
      return practiceHitsMuscle(practice.id, muscle) || named;
    });
  }, [filtered, muscle]);

  return (
    <div className="px-3 pt-1">
      <header className="mb-3">
        <p className="text-[0.65rem] tracking-[0.18em] uppercase text-ink/45">
          Work Out Machine
        </p>
        <h1 className="mt-1 font-display text-[2.35rem] leading-none tracking-tight text-ink">{heading}</h1>
        {intro ? <p className="mt-1.5 max-w-[22rem] text-sm leading-snug text-ink/70">{intro}</p> : null}
      </header>

      {showBody ? (
        <div className="rounded-2xl bg-card px-3 py-3 ring-1 ring-ink/8">
          <div className="grid grid-cols-2 gap-2">
            {(["front", "back"] as const).map((view) => (
              <div key={view}>
                <BodyFigure
                  view={view}
                  selected={muscle}
                  hovered={hovered}
                  counts={{}}
                  live={live}
                  onSelect={(id) => {
                    const next = muscle === id ? null : id;
                    setMuscle(next);
                    const url = new URL(window.location.href);
                    if (next) {
                      url.searchParams.set("m", next);
                    } else {
                      url.searchParams.delete("m");
                    }
                    window.history.replaceState(null, "", url);
                  }}
                  onHover={setHovered}
                  showCaption={false}
                  className="mx-auto h-auto w-full"
                />
                <p className="text-center text-[0.65rem] tracking-[0.14em] uppercase text-ink/45">
                  {view}
                </p>
              </div>
            ))}
          </div>
          <p className="px-2 pt-1 text-center text-[0.7rem] text-ink/45">
            {muscle ? `${getMuscle(muscle)?.label}. Tap it again to show every exercise.` : "Tap a muscle to see its exercises."}
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setAdding((open) => !open)}
        className="mt-4 flex min-h-11 w-full items-center justify-center rounded-full bg-[#0071e3] text-sm text-white"
      >
        {adding ? "Close" : "Add exercise"}
      </button>
      {adding ? (
        <form
          className="mt-3 space-y-3 rounded-2xl bg-card p-3 ring-1 ring-ink/10"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = name.trim();
            if (!trimmed || muscles.length === 0) {
              return;
            }
            const saved = saveCustomExercise({
              name: trimmed,
              muscles,
              level,
              equipment: gear,
              dose,
              repRange: dose === "reps" ? repRange : "",
            });
            const gearMap: Record<string, string> = {
              none: "bodyweight",
              dumbbells: "dumbbell",
              barbell: "barbell",
              kettlebell: "kettlebell",
              "cable-or-machine": "machine",
              band: "band",
              "medicine-ball": "medicine_ball",
            };
            void fetch("/api/exercises", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                id: saved.id,
                name: saved.name,
                primary_muscles: saved.muscles.map((id) => MUSCLES.find((muscle) => muscle.id === id)?.label ?? id),
                secondary_muscles: [],
                movement_pattern: "squat",
                equipment: [gearMap[gear] ?? "bodyweight"],
                environment: ["floor"],
                difficulty: level,
                force_type: "static",
                laterality: "bilateral",
                default_rep_range: dose === "seconds" ? "30s" : (repRange.replace("–", "-").match(/^[1-9][0-9]*(-[1-9][0-9]*)?s?$/) ? repRange.replace("–", "-") : "8-12"),
                default_rest_seconds: 0,
                posture_alignment_tags: [],
                corrective_or_performance: "performance",
                progression_path: [],
                dominant_contraction: dose === "seconds" ? "isometric" : "concentric",
                tempo_suggestion: "",
                contraindications: [],
                notes: [],
                media: "",
                setup: "",
                common_mistake: "",
                why: "",
                guide: "",
                duration_seconds: dose === "seconds" ? 30 : 0,
                min_reps: 0,
              }),
            });
            setCustom((current) => [customToPractice(saved), ...current]);
            setName("");
            setMuscles([]);
            setAdding(false);
          }}
        >
          <label className="block text-sm">
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="mt-1 h-11 w-full rounded-xl bg-wash px-3 ring-1 ring-ink/10"
            />
          </label>
          <fieldset>
            <legend className="text-sm">Muscles</legend>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {MUSCLES.map((muscle) => {
                const on = muscles.includes(muscle.id);
                return (
                  <button
                    key={muscle.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setMuscles((current) => toggleIn(current, muscle.id))}
                    className={`min-h-8 rounded-full px-2.5 text-xs ${on ? "bg-[#0071e3] text-white" : "bg-wash ring-1 ring-ink/10"}`}
                  >
                    {muscle.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm">
              Level
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value as Level)}
                className="mt-1 h-11 w-full rounded-xl bg-wash px-2 ring-1 ring-ink/10"
              >
                {LEVEL_CHIPS.map((item) => (
                  <option key={item} value={item}>{LEVEL_LABEL[item]}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Count
              <select
                value={dose}
                onChange={(event) => setDose(event.target.value as "reps" | "seconds")}
                className="mt-1 h-11 w-full rounded-xl bg-wash px-2 ring-1 ring-ink/10"
              >
                <option value="reps">Reps</option>
                <option value="seconds">Hold</option>
              </select>
            </label>
          </div>
          <label className="block text-sm">
            Equipment
            <select
              value={gear}
              onChange={(event) => setGear(event.target.value as Equipment)}
              className="mt-1 h-11 w-full rounded-xl bg-wash px-2 ring-1 ring-ink/10"
            >
              {EQUIPMENT_CHIPS.map((item) => (
                <option key={item} value={item}>{EQUIPMENT_LABEL[item]}</option>
              ))}
            </select>
          </label>
          {dose === "reps" ? (
            <label className="block text-sm">
              Reps
              <input
                value={repRange}
                onChange={(event) => setRepRange(event.target.value)}
                className="mt-1 h-11 w-full rounded-xl bg-wash px-3 ring-1 ring-ink/10"
              />
            </label>
          ) : null}
          <button type="submit" className="flex min-h-11 w-full items-center justify-center rounded-full bg-ink text-sm text-white">
            Save exercise
          </button>
          {muscles.length === 0 ? <p className="text-xs text-ink/50">Pick at least one muscle.</p> : null}
        </form>
      ) : null}

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
          {visible.length} {visible.length === 1 ? "practice" : "practices"}
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

      {visible.length === 0 ? (
        <p className="mt-8 text-center font-display text-xl leading-snug text-ink/70">
          {empty ?? "Nothing in this room yet."}
        </p>
      ) : state.view === "grid" ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {visible.map((practice) => (
            <PracticeCard key={practice.id} practice={practice} layout="grid" />
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-1.5">
          {visible.map((practice) => (
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
