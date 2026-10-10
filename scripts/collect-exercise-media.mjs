#!/usr/bin/env node
/**
 * Collect freely licensed photos + source links for the practice catalog.
 * Photos come from Wikimedia Commons (compressed thumbs). We do not copy
 * commercial gym-site images.
 *
 * Run: node scripts/collect-exercise-media.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const photoRoot = path.join(root, "public", "practices", "photos");
const outJson = path.join(root, "data", "media.json");
const UA = "WorkOutMachine/0.1 (personal offline library; local use)";

const SKIP =
  /logo|icon|coat of arms|flag|map of|diagram of a|svg|pictogram|emoji|signature|stamp|qr code/i;

function parsePractices() {
  const files = ["inner.ts", "soft-body.ts", "strength.ts", "strength-staples.ts"];
  const items = [];
  for (const file of files) {
    const text = fs.readFileSync(path.join(root, "data", file), "utf8");
    const blocks = text.split(/\n  \{\n/).slice(1);
    for (const block of blocks) {
      const id = block.match(/id: "([^"]+)"/)?.[1];
      const name = block.match(/name: "([^"]+)"/)?.[1];
      if (!id || !name) {
        continue;
      }
      const aka = [...block.matchAll(/"([^"]+)"/g)]
        .map((match) => match[1])
        .filter((value) => value !== id && value !== name);
      const akaBlock = block.match(/aka: \[([^\]]*)\]/)?.[1] ?? "";
      const aliases = [...akaBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
      items.push({ id, name, aka: aliases });
    }
  }
  return items;
}

function queriesFor(item) {
  const base = [item.name, ...item.aka].filter(Boolean);
  const extra = [`${item.name} exercise`, `${item.name} fitness`];
  if (/yoga|pose|fold|dog|cow|twist|child/i.test(item.name)) {
    extra.push(`${item.name} yoga`);
  }
  if (/breath|sit|meditat|scan/i.test(item.name)) {
    extra.push(`${item.name} meditation`);
  }
  return [...new Set([...base, ...extra])].slice(0, 4);
}

async function commonsSearch(query) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", "8");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|size|mime|extmetadata");
  url.searchParams.set("iiurlwidth", "480");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) {
    return [];
  }
  const json = await res.json();
  return Object.values(json.query?.pages ?? {});
}

async function wikipediaArticle(name) {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "opensearch");
  url.searchParams.set("search", name);
  url.searchParams.set("limit", "1");
  url.searchParams.set("namespace", "0");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) {
    return null;
  }
  const json = await res.json();
  const title = json[1]?.[0];
  const link = json[3]?.[0];
  if (!title || !link) {
    return null;
  }
  return { title, url: link };
}

function photoMeta(page) {
  const info = page.imageinfo?.[0];
  if (!info) {
    return null;
  }
  const mime = info.mime ?? "";
  if (!mime.startsWith("image/") || mime.includes("svg")) {
    return null;
  }
  const title = page.title ?? "";
  if (SKIP.test(title)) {
    return null;
  }
  const meta = info.extmetadata ?? {};
  const artist = strip(meta.Artist?.value ?? "Wikimedia Commons");
  const license = strip(meta.LicenseShortName?.value ?? meta.License?.value ?? "see file page");
  const thumb = info.thumburl ?? info.url;
  if (!thumb) {
    return null;
  }
  return {
    title,
    thumb,
    attribution: artist,
    license,
    pageUrl: info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
  };
}

function strip(html) {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 160);
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) {
    return false;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 800 || buf.length > 900_000) {
    return false;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return true;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function collectOne(item) {
  const seen = new Set();
  const photos = [];
  for (const query of queriesFor(item)) {
    const pages = await commonsSearch(query);
    await sleep(120);
    for (const page of pages) {
      const meta = photoMeta(page);
      if (!meta || seen.has(meta.pageUrl) || photos.length >= 4) {
        continue;
      }
      seen.add(meta.pageUrl);
      const id = `c${photos.length + 1}`;
      const ext = meta.thumb.includes(".png") ? "png" : "jpg";
      const rel = `/practices/photos/${item.id}/${id}.${ext}`;
      const dest = path.join(root, "public", rel);
      const ok = await download(meta.thumb, dest);
      await sleep(80);
      if (!ok) {
        continue;
      }
      photos.push({
        id,
        src: rel,
        attribution: meta.attribution,
        license: meta.license,
        pageUrl: meta.pageUrl,
      });
    }
    if (photos.length >= 4) {
      break;
    }
  }

  const links = [
    {
      title: `Watch “${item.name}”`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${item.name} exercise form`)}`,
      kind: "search",
    },
    {
      title: "ExRx exercise directory",
      url: "https://exrx.net/Lists/Directory",
      kind: "database",
    },
  ];
  const article = await wikipediaArticle(item.name);
  await sleep(80);
  if (article) {
    links.unshift({ title: article.title, url: article.url, kind: "article" });
  }

  return { practiceId: item.id, photos, links };
}

async function main() {
  const items = parsePractices();
  console.log(`Collecting media for ${items.length} practices…`);
  const catalog = [];
  for (const [index, item] of items.entries()) {
    process.stdout.write(`[${index + 1}/${items.length}] ${item.id}… `);
    try {
      const entry = await collectOne(item);
      catalog.push(entry);
      console.log(`${entry.photos.length} photos`);
    } catch (error) {
      console.log("failed", error instanceof Error ? error.message : error);
      catalog.push({
        practiceId: item.id,
        photos: [],
        links: [
          {
            title: `Watch “${item.name}”`,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${item.name} exercise`)}`,
            kind: "search",
          },
        ],
      });
    }
  }
  fs.writeFileSync(outJson, `${JSON.stringify(catalog, null, 2)}\n`);
  const withPhotos = catalog.filter((entry) => entry.photos.length > 0).length;
  console.log(`Wrote ${outJson} (${withPhotos} with photos)`);
}

main();
