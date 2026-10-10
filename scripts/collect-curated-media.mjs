#!/usr/bin/env node
/**
 * Collect curated, freely licensed photos (Commons + Wikipedia thumbs)
 * and source links. Slow on purpose — Wikimedia rate-limits burst search.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const sources = JSON.parse(fs.readFileSync(path.join(root, "data", "media-sources.json"), "utf8"));
const outJson = path.join(root, "data", "media.json");
const UA = "WorkOutMachine/0.1 (personal exercise library; contact via local project)";

function parsePractices() {
  const files = ["inner.ts", "soft-body.ts", "strength.ts", "strength-staples.ts"];
  const items = [];
  for (const file of files) {
    const text = fs.readFileSync(path.join(root, "data", file), "utf8");
    for (const block of text.split(/\n  \{\n/).slice(1)) {
      const id = block.match(/id: "([^"]+)"/)?.[1];
      const name = block.match(/name: "([^"]+)"/)?.[1];
      if (id && name) {
        items.push({ id, name });
      }
    }
  }
  return items;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (res.status === 429) {
    const wait = Number(res.headers.get("retry-after") ?? 15) * 1000;
    await sleep(wait);
    return getJson(url);
  }
  if (!res.ok) {
    return null;
  }
  return res.json();
}

async function commonsByTitles(titles) {
  if (titles.length === 0) {
    return [];
  }
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("titles", titles.join("|"));
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime|extmetadata");
  url.searchParams.set("iiurlwidth", "480");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  const json = await getJson(url);
  return Object.values(json?.query?.pages ?? {}).filter((page) => !page.missing && page.imageinfo);
}

async function wikiSummary(title) {
  const slug = encodeURIComponent(title.replace(/ /g, "_"));
  return getJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`);
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) {
    return false;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 600 || buf.length > 1_200_000) {
    return false;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return true;
}

function strip(html) {
  return String(html ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

async function photosFor(id, spec) {
  const photos = [];
  const pages = await commonsByTitles(spec.files ?? []);
  await sleep(800);
  for (const page of pages) {
    const info = page.imageinfo[0];
    const srcUrl = info.thumburl ?? info.url;
    if (!srcUrl || (info.mime ?? "").includes("svg")) {
      continue;
    }
    const ext = srcUrl.includes(".png") ? "png" : "jpg";
    const pid = `c${photos.length + 1}`;
    const rel = `/practices/photos/${id}/${pid}.${ext}`;
    if (await download(srcUrl, path.join(root, "public", rel))) {
      photos.push({
        id: pid,
        src: rel,
        attribution: strip(info.extmetadata?.Artist?.value) || "Wikimedia Commons",
        license: strip(info.extmetadata?.LicenseShortName?.value) || "see file page",
        pageUrl: info.descriptionurl,
      });
    }
    await sleep(400);
  }

  if (spec.wiki) {
    const summary = await wikiSummary(spec.wiki);
    await sleep(900);
    const thumb = summary?.originalimage?.source ?? summary?.thumbnail?.source;
    if (thumb && photos.length < 4) {
      const pid = `c${photos.length + 1}`;
      const ext = thumb.includes(".png") ? "png" : "jpg";
      const rel = `/practices/photos/${id}/${pid}.${ext}`;
      if (await download(`${thumb}${thumb.includes("?") ? "&" : "?"}width=480`, path.join(root, "public", rel))) {
        photos.push({
          id: pid,
          src: rel,
          attribution: "Wikipedia",
          license: "see article",
          pageUrl: summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${spec.wiki}`,
        });
      } else if (await download(thumb, path.join(root, "public", rel))) {
        photos.push({
          id: pid,
          src: rel,
          attribution: "Wikipedia",
          license: "see article",
          pageUrl: summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${spec.wiki}`,
        });
      }
    }
  }
  return photos;
}

async function main() {
  const items = parsePractices();
  const catalog = [];
  for (const [index, item] of items.entries()) {
    const spec = sources[item.id] ?? {};
    process.stdout.write(`[${index + 1}/${items.length}] ${item.id}… `);
    const photos = spec.wiki || (spec.files ?? []).length ? await photosFor(item.id, spec) : [];
    const links = [
      {
        title: `Watch “${item.name}”`,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${item.name} exercise form`)}`,
        kind: "search",
      },
      {
        title: "ExRx directory",
        url: "https://exrx.net/Lists/Directory",
        kind: "database",
      },
    ];
    if (spec.wiki) {
      links.unshift({
        title: spec.wiki,
        url: `https://en.wikipedia.org/wiki/${spec.wiki.replace(/ /g, "_")}`,
        kind: "article",
      });
    }
    catalog.push({ practiceId: item.id, photos, links });
    console.log(`${photos.length} photos`);
  }
  fs.writeFileSync(outJson, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(`Done. ${catalog.filter((e) => e.photos.length).length} practices have photos.`);
}

main();
