# Work Out Machine

A personal visual library for taking care of the body in three ways:

1. **Inner** — breath and meditation
2. **Soft body** — stretching and mobility
3. **Strength** — capacity, plus surfing, climbing, and bicycling

Version 1 is a field guide. There are no accounts.

Favorites, notes, tags, photo choice, and the dumpster live in `localStorage` on this device only. Deleted items sit in the dumpster (icon in the nav) for two days, then they are permanently deleted.

> General practice reference, not medical advice, physical therapy, or sport coaching. Strength and outdoor sports carry risk.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

This app has no backend. It deploys as a static-capable Next.js app on Vercel, or with `output: "standalone"` on Render.

## Catalog

`data/catalog.ts` is the public entry: exercises, suggested routines, and the catalog dumpster.

- Inner: `data/inner.ts`
- Soft body: `data/soft-body.ts`
- Strength: `data/strength.ts` and `data/strength-staples.ts`
- Combined: `data/practices.ts`
- Muscle roles: `data/muscle-targets.ts`
- Retired duplicates: `data/dumpster.ts` (aliases redirect to the kept exercise)

Add a practice with a stable kebab-case `id`, drop `public/practices/{id}.svg` (or a photo), and map muscles in `data/muscle-targets.ts`.

## Nav

**Home · Routines · Exercises · Muscles**

## Replace an image

Every card reads, in order, from `public/practices/`:

1. `{id}.jpg` (or `.jpeg`, `.webp`, `.png`)
2. `{id}.svg`

Starter drawings:

```bash
node scripts/generate-practice-images.mjs
```
