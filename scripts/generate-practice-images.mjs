#!/usr/bin/env node
/**
 * Artistic line figures for Work Out Machine.
 * Run: node scripts/generate-practice-images.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "practices");

const WAYS = {
  inner: {
    bg: "#f3eee6",
    wash: "#e4ddd2",
    ink: "#4a5a62",
    accent: "#7a8a90",
    width: 1.55,
  },
  soft: {
    bg: "#f2efe4",
    wash: "#dfe6d6",
    ink: "#4a5c48",
    accent: "#8a9a7a",
    width: 1.85,
  },
  strength: {
    bg: "#f1e7de",
    wash: "#e4d0c4",
    ink: "#3a2c28",
    accent: "#9a5a42",
    width: 2.25,
  },
};

function figure(j, s) {
  const hr = j.hr ?? 30;
  const torso = `M ${j.n[0]} ${j.n[1]} C ${j.sl[0]} ${j.sl[1] + 20}, ${j.hl[0]} ${j.hl[1] - 40}, ${j.hl[0]} ${j.hl[1]} L ${j.hrp[0]} ${j.hrp[1]} C ${j.sr[0]} ${j.sr[1] + 20}, ${j.n[0]} ${j.n[1] + 30}, ${j.n[0]} ${j.n[1]}`;
  const armL = `M ${j.sl[0]} ${j.sl[1]} Q ${j.el[0]} ${j.el[1]} ${j.wl[0]} ${j.wl[1]}`;
  const armR = `M ${j.sr[0]} ${j.sr[1]} Q ${j.er[0]} ${j.er[1]} ${j.wr[0]} ${j.wr[1]}`;
  const legL = `M ${j.hl[0]} ${j.hl[1]} Q ${j.kl[0]} ${j.kl[1]} ${j.al[0]} ${j.al[1]}`;
  const legR = `M ${j.hrp[0]} ${j.hrp[1]} Q ${j.kr[0]} ${j.kr[1]} ${j.ar[0]} ${j.ar[1]}`;
  return `
    <circle cx="${j.h[0]}" cy="${j.h[1]}" r="${hr}" fill="none" stroke="${s.ink}" stroke-width="${s.width}"/>
    <path d="${torso}" fill="none" stroke="${s.ink}" stroke-width="${s.width}" stroke-linejoin="round"/>
    <path d="${armL}" fill="none" stroke="${s.ink}" stroke-width="${s.width}" stroke-linecap="round"/>
    <path d="${armR}" fill="none" stroke="${s.ink}" stroke-width="${s.width}" stroke-linecap="round"/>
    <path d="${legL}" fill="none" stroke="${s.ink}" stroke-width="${s.width}" stroke-linecap="round"/>
    <path d="${legR}" fill="none" stroke="${s.ink}" stroke-width="${s.width}" stroke-linecap="round"/>
    <circle cx="${j.al[0]}" cy="${j.al[1]}" r="4" fill="${s.ink}" opacity="0.35"/>
    <circle cx="${j.ar[0]}" cy="${j.ar[1]}" r="4" fill="${s.ink}" opacity="0.35"/>
  `;
}

function sit(ox = 400, oy = 0) {
  return {
    h: [ox, 318 + oy],
    n: [ox, 352 + oy],
    sl: [ox - 52, 378 + oy],
    sr: [ox + 52, 378 + oy],
    el: [ox - 58, 430 + oy],
    er: [ox + 58, 430 + oy],
    wl: [ox - 28, 470 + oy],
    wr: [ox + 28, 470 + oy],
    hl: [ox - 38, 500 + oy],
    hrp: [ox + 38, 500 + oy],
    kl: [ox - 70, 560 + oy],
    kr: [ox + 70, 560 + oy],
    al: [ox - 42, 575 + oy],
    ar: [ox + 42, 575 + oy],
  };
}

function stand(ox = 400, oy = 0) {
  return {
    h: [ox, 210 + oy],
    n: [ox, 248 + oy],
    sl: [ox - 48, 278 + oy],
    sr: [ox + 48, 278 + oy],
    el: [ox - 54, 360 + oy],
    er: [ox + 54, 360 + oy],
    wl: [ox - 50, 438 + oy],
    wr: [ox + 50, 438 + oy],
    hl: [ox - 32, 470 + oy],
    hrp: [ox + 32, 470 + oy],
    kl: [ox - 36, 600 + oy],
    kr: [ox + 36, 600 + oy],
    al: [ox - 34, 730 + oy],
    ar: [ox + 38, 730 + oy],
  };
}

function supine(ox = 400) {
  return {
    h: [ox - 210, 430],
    n: [ox - 170, 438],
    sl: [ox - 150, 400],
    sr: [ox - 148, 478],
    el: [ox - 90, 360],
    er: [ox - 88, 520],
    wl: [ox - 30, 350],
    wr: [ox - 28, 530],
    hl: [ox + 40, 408],
    hrp: [ox + 42, 468],
    kl: [ox + 150, 390],
    kr: [ox + 152, 490],
    al: [ox + 250, 400],
    ar: [ox + 252, 480],
    hr: 26,
  };
}

function wrap(way, extras, body) {
  const s = WAYS[way];
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <rect width="800" height="1000" fill="${s.bg}"/>
  ${extras}
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    ${body}
  </g>
</svg>
`;
}

function washCircle(s, cx, cy, r) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${s.wash}" opacity="0.9"/>`;
}

function ground(s, y = 780) {
  return `<path d="M 120 ${y} Q 400 ${y + 18} 680 ${y}" fill="none" stroke="${s.accent}" stroke-width="1.2" opacity="0.5"/>`;
}

const images = {
  "box-breathing": () => {
    const s = WAYS.inner;
    const j = sit();
    j.wl = [372, 455];
    j.wr = [428, 455];
    return wrap(
      "inner",
      washCircle(s, 400, 430, 280) +
        `<rect x="268" y="250" width="264" height="264" fill="none" stroke="${s.accent}" stroke-width="1.1" opacity="0.55"/>`,
      figure(j, s),
    );
  },
  "four-seven-eight": () => {
    const s = WAYS.inner;
    const j = sit();
    return wrap(
      "inner",
      washCircle(s, 400, 400, 260) +
        `<path d="M 520 280 C 620 360, 600 520, 430 640" fill="none" stroke="${s.accent}" stroke-width="1.2" opacity="0.7"/>`,
      figure(j, s),
    );
  },
  "belly-breathing": () => {
    const s = WAYS.inner;
    const j = supine();
    j.wl = [40, 470];
    j.wr = [80, 500];
    j.el = [-10, 455];
    return wrap(
      "inner",
      washCircle(s, 430, 450, 300) +
        `<ellipse cx="430" cy="448" rx="48" ry="28" fill="none" stroke="${s.accent}" stroke-width="1" opacity="0.5"/>`,
      figure(j, s),
    );
  },
  "physiological-sigh": () => {
    const s = WAYS.inner;
    const j = sit();
    return wrap(
      "inner",
      washCircle(s, 400, 380, 240) +
        `<path d="M 300 240 q 20 -40 40 0" fill="none" stroke="${s.accent}" stroke-width="1.3"/>
         <path d="M 355 228 q 12 -22 24 0" fill="none" stroke="${s.accent}" stroke-width="1.1"/>
         <path d="M 470 260 C 560 400, 540 560, 400 640" fill="none" stroke="${s.accent}" stroke-width="1.2" opacity="0.7"/>`,
      figure(j, s),
    );
  },
  "counting-the-breath": () => {
    const s = WAYS.inner;
    const j = sit(400, 20);
    const marks = [1, 2, 3]
      .map(
        (n, i) =>
          `<text x="${560}" y="${300 + i * 36}" fill="${s.accent}" font-size="22" font-family="Georgia, serif" opacity="0.45">${n}</text>`,
      )
      .join("");
    return wrap("inner", washCircle(s, 400, 430, 250) + marks, figure(j, s));
  },
  "short-sit": () => {
    const s = WAYS.inner;
    const j = sit(400, 40);
    j.wl = [378, 468];
    j.wr = [422, 468];
    return wrap("inner", washCircle(s, 400, 420, 200), figure(j, s));
  },
  "body-scan": () => {
    const s = WAYS.inner;
    const j = supine();
    return wrap(
      "inner",
      washCircle(s, 400, 460, 320) +
        `<path d="M 190 430 C 280 500, 500 390, 660 450" fill="none" stroke="${s.accent}" stroke-width="1.1" stroke-dasharray="4 10" opacity="0.7"/>`,
      figure(j, s),
    );
  },
  "ocean-breath": () => {
    const s = WAYS.inner;
    const j = sit();
    return wrap(
      "inner",
      washCircle(s, 400, 400, 250) +
        `<path d="M 160 720 C 240 680, 320 760, 400 720 C 480 680, 560 760, 640 720" fill="none" stroke="${s.accent}" stroke-width="1.3" opacity="0.65"/>
         <path d="M 180 750 C 260 710, 340 790, 420 750 C 500 710, 580 790, 660 750" fill="none" stroke="${s.accent}" stroke-width="1" opacity="0.4"/>`,
      figure(j, s),
    );
  },
  "breathing-bridge": () => {
    const s = WAYS.inner;
    const j = {
      h: [220, 470],
      n: [260, 455],
      sl: [290, 430],
      sr: [295, 490],
      el: [250, 520],
      er: [255, 555],
      wl: [210, 540],
      wr: [215, 575],
      hl: [430, 390],
      hrp: [430, 430],
      kl: [520, 500],
      kr: [530, 530],
      al: [500, 600],
      ar: [545, 600],
      hr: 26,
    };
    return wrap(
      "inner",
      washCircle(s, 400, 460, 280) +
        `<path d="M 200 610 H 620" stroke="${s.accent}" stroke-width="1" opacity="0.35"/>`,
      figure(j, s),
    );
  },
  "standing-arrival-breath": () => {
    const s = WAYS.inner;
    const j = stand();
    j.wl = [352, 430];
    j.wr = [448, 430];
    return wrap("inner", washCircle(s, 400, 420, 230) + ground(s, 760), figure(j, s));
  },
  "exhale-emphasis": () => {
    const s = WAYS.inner;
    const j = stand();
    return wrap(
      "inner",
      washCircle(s, 400, 400, 240) +
        `<path d="M 500 240 C 580 360, 560 560, 430 720" fill="none" stroke="${s.accent}" stroke-width="1.3" opacity="0.7"/>` +
        ground(s, 760),
      figure(j, s),
    );
  },
  "hands-on-heart": () => {
    const s = WAYS.inner;
    const j = sit();
    j.el = [360, 410];
    j.er = [440, 410];
    j.wl = [392, 430];
    j.wr = [412, 428];
    return wrap(
      "inner",
      washCircle(s, 400, 400, 240) +
        `<path d="M 392 424 c 0 -10 16 -10 16 0 c 0 12 -16 20 -16 20 c 0 0 -16 -8 -16 -20 c 0 -10 16 -10 16 0" fill="none" stroke="${s.accent}" stroke-width="1" opacity="0.5"/>`,
      figure(j, s),
    );
  },
  "chin-tuck": () => {
    const s = WAYS.soft;
    const j = stand();
    j.h = [388, 214];
    j.n = [396, 250];
    return wrap(
      "soft",
      washCircle(s, 400, 430, 260) +
        `<path d="M 430 200 H 500" stroke="${s.accent}" stroke-width="1.2" marker-end=""/>
         <path d="M 490 200 l -12 -8 m 12 8 l -12 8" stroke="${s.accent}" stroke-width="1.2"/>` +
        ground(s),
      figure(j, s),
    );
  },
  "neck-side-stretch": () => {
    const s = WAYS.soft;
    const j = stand();
    j.h = [430, 200];
    j.n = [418, 248];
    j.wr = [430, 210];
    j.er = [455, 250];
    j.sr = [438, 278];
    return wrap("soft", washCircle(s, 400, 430, 250) + ground(s), figure(j, s));
  },
  "doorway-pec-stretch": () => {
    const s = WAYS.soft;
    const j = stand(430);
    j.sl = [390, 280];
    j.el = [330, 250];
    j.wl = [300, 200];
    j.al = [410, 730];
    j.ar = [490, 730];
    return wrap(
      "soft",
      washCircle(s, 420, 430, 250) +
        `<path d="M 280 140 V 780" stroke="${s.accent}" stroke-width="2" opacity="0.45"/>
         <path d="M 520 140 V 780" stroke="${s.accent}" stroke-width="2" opacity="0.25"/>`,
      figure(j, s),
    );
  },
  "upper-trap-stretch": () => {
    const s = WAYS.soft;
    const j = sit(400, -20);
    j.h = [430, 290];
    j.n = [415, 330];
    j.wl = [340, 520];
    j.el = [330, 470];
    j.wr = [445, 310];
    j.er = [455, 360];
    return wrap("soft", washCircle(s, 400, 420, 250), figure(j, s));
  },
  "cat-cow": () => {
    const s = WAYS.soft;
    const j = {
      h: [230, 430],
      n: [270, 450],
      sl: [320, 500],
      sr: [330, 470],
      el: [300, 560],
      er: [310, 520],
      wl: [290, 630],
      wr: [300, 590],
      hl: [500, 500],
      hrp: [510, 470],
      kl: [530, 590],
      kr: [540, 560],
      al: [520, 660],
      ar: [560, 640],
      hr: 26,
    };
    return wrap(
      "soft",
      washCircle(s, 400, 500, 280) +
        `<path d="M 280 455 C 360 380, 470 380, 540 460" fill="none" stroke="${s.accent}" stroke-width="1.2" opacity="0.45"/>`,
      figure(j, s),
    );
  },
  "childs-pose": () => {
    const s = WAYS.soft;
    const j = {
      h: [250, 560],
      n: [290, 555],
      sl: [340, 540],
      sr: [345, 570],
      el: [400, 535],
      er: [405, 575],
      wl: [500, 530],
      wr: [505, 580],
      hl: [360, 620],
      hrp: [370, 650],
      kl: [300, 680],
      kr: [330, 700],
      al: [270, 690],
      ar: [300, 710],
      hr: 24,
    };
    return wrap("soft", washCircle(s, 400, 560, 260), figure(j, s));
  },
  "downward-dog": () => {
    const s = WAYS.soft;
    const j = {
      h: [250, 520],
      n: [280, 490],
      sl: [300, 470],
      sr: [320, 455],
      el: [250, 560],
      er: [270, 540],
      wl: [210, 650],
      wr: [230, 640],
      hl: [500, 360],
      hrp: [530, 370],
      kl: [540, 500],
      kr: [570, 510],
      al: [560, 650],
      ar: [600, 650],
      hr: 24,
    };
    return wrap("soft", washCircle(s, 400, 480, 280) + ground(s, 680), figure(j, s));
  },
  "thread-the-needle": () => {
    const s = WAYS.soft;
    const j = {
      h: [280, 560],
      n: [320, 540],
      sl: [380, 520],
      sr: [360, 500],
      el: [250, 550],
      er: [420, 430],
      wl: [180, 560],
      wr: [480, 360],
      hl: [500, 530],
      hrp: [520, 500],
      kl: [540, 610],
      kr: [560, 580],
      al: [530, 680],
      ar: [580, 660],
      hr: 24,
    };
    return wrap("soft", washCircle(s, 400, 520, 270), figure(j, s));
  },
  "standing-forward-fold": () => {
    const s = WAYS.soft;
    const j = {
      h: [400, 560],
      n: [400, 520],
      sl: [360, 490],
      sr: [440, 490],
      el: [350, 560],
      er: [450, 560],
      wl: [355, 630],
      wr: [445, 630],
      hl: [370, 430],
      hrp: [430, 430],
      kl: [368, 560],
      kr: [432, 560],
      al: [365, 720],
      ar: [435, 720],
      hr: 26,
    };
    return wrap("soft", washCircle(s, 400, 500, 260) + ground(s, 750), figure(j, s));
  },
  "kneeling-hip-flexor": () => {
    const s = WAYS.soft;
    const j = {
      h: [400, 220],
      n: [400, 260],
      sl: [355, 295],
      sr: [445, 295],
      el: [340, 370],
      er: [460, 340],
      wl: [370, 400],
      wr: [455, 400],
      hl: [380, 470],
      hrp: [430, 470],
      kl: [300, 600],
      kr: [520, 620],
      al: [240, 700],
      ar: [500, 720],
      hr: 28,
    };
    return wrap("soft", washCircle(s, 400, 430, 270) + ground(s, 760), figure(j, s));
  },
  "figure-four": () => {
    const s = WAYS.soft;
    const j = {
      h: [220, 400],
      n: [260, 415],
      sl: [300, 390],
      sr: [295, 450],
      el: [340, 360],
      er: [350, 490],
      wl: [430, 430],
      wr: [440, 500],
      hl: [470, 410],
      hrp: [480, 460],
      kl: [420, 520],
      kr: [600, 480],
      al: [500, 600],
      ar: [560, 400],
      hr: 26,
    };
    return wrap("soft", washCircle(s, 420, 470, 280), figure(j, s));
  },
  "seated-spinal-twist": () => {
    const s = WAYS.soft;
    const j = sit();
    j.sr = [430, 370];
    j.er = [480, 420];
    j.wr = [360, 500];
    j.sl = [360, 380];
    j.el = [320, 430];
    j.wl = [300, 390];
    j.h = [430, 310];
    j.n = [415, 348];
    return wrap("soft", washCircle(s, 400, 430, 250), figure(j, s));
  },
  "worlds-greatest-stretch": () => {
    const s = WAYS.soft;
    const j = {
      h: [420, 240],
      n: [410, 280],
      sl: [360, 330],
      sr: [450, 310],
      el: [320, 430],
      er: [520, 240],
      wl: [300, 530],
      wr: [560, 180],
      hl: [380, 500],
      hrp: [450, 490],
      kl: [300, 620],
      kr: [560, 600],
      al: [250, 700],
      ar: [620, 700],
      hr: 26,
    };
    return wrap("soft", washCircle(s, 400, 430, 280) + ground(s, 730), figure(j, s));
  },
  "thoracic-extension-roller": () => {
    const s = WAYS.soft;
    const j = {
      h: [230, 420],
      n: [270, 430],
      sl: [310, 400],
      sr: [315, 470],
      el: [250, 360],
      er: [255, 500],
      wl: [230, 400],
      wr: [235, 440],
      hl: [500, 430],
      hrp: [505, 470],
      kl: [580, 500],
      kr: [590, 540],
      al: [560, 600],
      ar: [610, 610],
      hr: 24,
    };
    return wrap(
      "soft",
      washCircle(s, 400, 460, 280) +
        `<ellipse cx="400" cy="500" rx="70" ry="22" fill="none" stroke="${s.accent}" stroke-width="2"/>`,
      figure(j, s),
    );
  },
  "wall-angels": () => {
    const s = WAYS.soft;
    const j = stand();
    j.el = [300, 300];
    j.er = [500, 300];
    j.wl = [250, 220];
    j.wr = [550, 220];
    return wrap(
      "soft",
      `<rect x="140" y="120" width="18" height="680" fill="${s.wash}"/>` +
        washCircle(s, 420, 430, 240) +
        ground(s, 770),
      figure(j, s),
    );
  },
  "couch-stretch": () => {
    const s = WAYS.soft;
    const j = {
      h: [360, 250],
      n: [365, 290],
      sl: [330, 330],
      sr: [410, 325],
      el: [320, 400],
      er: [430, 390],
      wl: [350, 430],
      wr: [400, 430],
      hl: [350, 500],
      hrp: [410, 500],
      kl: [280, 620],
      kr: [500, 600],
      al: [270, 500],
      ar: [480, 720],
      hr: 26,
    };
    return wrap(
      "soft",
      `<path d="M 230 200 V 740 H 310" fill="none" stroke="${s.accent}" stroke-width="2" opacity="0.45"/>` +
        washCircle(s, 420, 450, 250),
      figure(j, s),
    );
  },
  "calf-stretch": () => {
    const s = WAYS.soft;
    const j = stand(420);
    j.hl = [390, 470];
    j.kl = [360, 600];
    j.al = [300, 730];
    j.hrp = [450, 470];
    j.kr = [460, 600];
    j.ar = [470, 730];
    j.wl = [340, 360];
    j.wr = [360, 350];
    j.el = [360, 320];
    j.er = [380, 310];
    return wrap(
      "soft",
      `<path d="M 220 140 V 760" stroke="${s.accent}" stroke-width="2" opacity="0.4"/>` +
        washCircle(s, 430, 430, 240) +
        ground(s, 760),
      figure(j, s),
    );
  },
  "wrist-stretch": () => {
    const s = WAYS.soft;
    const j = stand();
    j.el = [320, 330];
    j.wl = [270, 300];
    j.er = [360, 340];
    j.wr = [300, 280];
    return wrap("soft", washCircle(s, 400, 420, 240) + ground(s, 760), figure(j, s));
  },
  "scapular-retraction": () => {
    const s = WAYS.strength;
    const j = stand();
    j.sl = [360, 285];
    j.sr = [440, 285];
    return wrap(
      "strength",
      washCircle(s, 400, 400, 240) +
        `<path d="M 355 300 C 380 330, 420 330, 445 300" fill="none" stroke="${s.accent}" stroke-width="1.4"/>` +
        ground(s, 760),
      figure(j, s),
    );
  },
  "dead-hang": () => {
    const s = WAYS.strength;
    const j = {
      h: [400, 320],
      n: [400, 360],
      sl: [350, 390],
      sr: [450, 390],
      el: [345, 300],
      er: [455, 300],
      wl: [340, 210],
      wr: [460, 210],
      hl: [370, 520],
      hrp: [430, 520],
      kl: [365, 640],
      kr: [435, 640],
      al: [360, 760],
      ar: [440, 760],
      hr: 28,
    };
    return wrap(
      "strength",
      `<path d="M 160 200 H 640" stroke="${s.ink}" stroke-width="6" stroke-linecap="round"/>` +
        washCircle(s, 400, 480, 260),
      figure(j, s),
    );
  },
  "scapular-pull-up": () => {
    const s = WAYS.strength;
    const j = {
      h: [400, 300],
      n: [400, 340],
      sl: [348, 355],
      sr: [452, 355],
      el: [340, 280],
      er: [460, 280],
      wl: [336, 200],
      wr: [464, 200],
      hl: [370, 500],
      hrp: [430, 500],
      kl: [366, 620],
      kr: [434, 620],
      al: [362, 740],
      ar: [438, 740],
      hr: 28,
    };
    return wrap(
      "strength",
      `<path d="M 160 188 H 640" stroke="${s.ink}" stroke-width="6" stroke-linecap="round"/>` +
        washCircle(s, 400, 460, 250) +
        `<path d="M 400 360 v 40" stroke="${s.accent}" stroke-width="1.5"/>
         <path d="M 400 400 l -8 -12 m 8 12 l 8 -12" stroke="${s.accent}" stroke-width="1.5"/>`,
      figure(j, s),
    );
  },
  "pull-up-or-negative": () => {
    const s = WAYS.strength;
    const j = {
      h: [400, 250],
      n: [400, 288],
      sl: [350, 310],
      sr: [450, 310],
      el: [330, 250],
      er: [470, 250],
      wl: [340, 195],
      wr: [460, 195],
      hl: [372, 430],
      hrp: [428, 430],
      kl: [360, 540],
      kr: [440, 540],
      al: [350, 650],
      ar: [450, 650],
      hr: 26,
    };
    return wrap(
      "strength",
      `<path d="M 160 188 H 640" stroke="${s.ink}" stroke-width="6" stroke-linecap="round"/>` +
        washCircle(s, 400, 430, 250),
      figure(j, s),
    );
  },
  "inverted-row": () => {
    const s = WAYS.strength;
    const j = {
      h: [220, 430],
      n: [260, 435],
      sl: [310, 400],
      sr: [315, 470],
      el: [300, 330],
      er: [305, 350],
      wl: [290, 270],
      wr: [300, 270],
      hl: [520, 450],
      hrp: [530, 490],
      kl: [600, 500],
      kr: [610, 530],
      al: [680, 540],
      ar: [690, 560],
      hr: 24,
    };
    return wrap(
      "strength",
      `<path d="M 180 250 H 420" stroke="${s.ink}" stroke-width="5" stroke-linecap="round"/>` +
        washCircle(s, 420, 450, 260),
      figure(j, s),
    );
  },
  "push-up": () => {
    const s = WAYS.strength;
    const j = {
      h: [210, 390],
      n: [250, 400],
      sl: [300, 410],
      sr: [310, 390],
      el: [280, 490],
      er: [290, 470],
      wl: [270, 580],
      wr: [280, 560],
      hl: [500, 430],
      hrp: [510, 410],
      kl: [560, 500],
      kr: [570, 480],
      al: [630, 580],
      ar: [650, 560],
      hr: 24,
    };
    return wrap("strength", washCircle(s, 400, 460, 270) + ground(s, 620), figure(j, s));
  },
  "glute-bridge": () => {
    const s = WAYS.strength;
    const j = {
      h: [220, 500],
      n: [260, 480],
      sl: [300, 460],
      sr: [305, 510],
      el: [250, 530],
      er: [255, 560],
      wl: [210, 550],
      wr: [215, 585],
      hl: [450, 380],
      hrp: [455, 420],
      kl: [530, 500],
      kr: [540, 530],
      al: [510, 610],
      ar: [555, 620],
      hr: 24,
    };
    return wrap("strength", washCircle(s, 400, 480, 270) + ground(s, 640), figure(j, s));
  },
  "goblet-squat": () => {
    const s = WAYS.strength;
    const j = {
      h: [400, 280],
      n: [400, 318],
      sl: [350, 350],
      sr: [450, 350],
      el: [360, 410],
      er: [440, 410],
      wl: [385, 450],
      wr: [415, 450],
      hl: [360, 520],
      hrp: [440, 520],
      kl: [320, 620],
      kr: [480, 620],
      al: [300, 730],
      ar: [500, 730],
      hr: 28,
    };
    return wrap(
      "strength",
      washCircle(s, 400, 450, 260) +
        `<path d="M 385 448 L 400 500 L 415 448 Z" fill="none" stroke="${s.accent}" stroke-width="2"/>` +
        ground(s, 760),
      figure(j, s),
    );
  },
  "db-rdl": () => {
    const s = WAYS.strength;
    const j = {
      h: [340, 300],
      n: [360, 335],
      sl: [330, 380],
      sr: [410, 360],
      el: [350, 450],
      er: [430, 430],
      wl: [360, 530],
      wr: [440, 510],
      hl: [390, 480],
      hrp: [450, 470],
      kl: [400, 600],
      kr: [460, 590],
      al: [395, 730],
      ar: [470, 730],
      hr: 26,
    };
    return wrap(
      "strength",
      washCircle(s, 400, 450, 250) +
        `<rect x="348" y="530" width="18" height="36" rx="4" stroke="${s.accent}" fill="none" stroke-width="1.6"/>
         <rect x="428" y="510" width="18" height="36" rx="4" stroke="${s.accent}" fill="none" stroke-width="1.6"/>` +
        ground(s, 760),
      figure(j, s),
    );
  },
  "bird-dog": () => {
    const s = WAYS.strength;
    const j = {
      h: [250, 400],
      n: [290, 420],
      sl: [340, 450],
      sr: [350, 430],
      el: [250, 420],
      er: [320, 520],
      wl: [170, 400],
      wr: [310, 590],
      hl: [500, 450],
      hrp: [510, 430],
      kl: [560, 430],
      kr: [540, 520],
      al: [650, 410],
      ar: [530, 600],
      hr: 24,
    };
    return wrap("strength", washCircle(s, 400, 480, 270) + ground(s, 640), figure(j, s));
  },
  "farmer-carry": () => {
    const s = WAYS.strength;
    const j = stand();
    j.wl = [330, 470];
    j.wr = [470, 470];
    j.al = [360, 730];
    j.ar = [455, 720];
    return wrap(
      "strength",
      washCircle(s, 400, 420, 240) +
        `<rect x="318" y="470" width="22" height="40" rx="4" stroke="${s.accent}" fill="none" stroke-width="1.8"/>
         <rect x="460" y="470" width="22" height="40" rx="4" stroke="${s.accent}" fill="none" stroke-width="1.8"/>` +
        ground(s, 760),
      figure(j, s),
    );
  },
  "band-pull-apart": () => {
    const s = WAYS.strength;
    const j = stand();
    j.el = [280, 320];
    j.er = [520, 320];
    j.wl = [210, 310];
    j.wr = [590, 310];
    return wrap(
      "strength",
      washCircle(s, 400, 420, 250) +
        `<path d="M 210 310 Q 400 340 590 310" fill="none" stroke="${s.accent}" stroke-width="2.2"/>` +
        ground(s, 760),
      figure(j, s),
    );
  },
  "surf-floor-popup": () => {
    const s = WAYS.strength;
    const j = {
      h: [430, 260],
      n: [425, 300],
      sl: [380, 340],
      sr: [460, 335],
      el: [350, 400],
      er: [490, 390],
      wl: [340, 460],
      wr: [500, 450],
      hl: [370, 520],
      hrp: [470, 510],
      kl: [300, 600],
      kr: [540, 590],
      al: [250, 680],
      ar: [600, 670],
      hr: 26,
    };
    return wrap(
      "strength",
      washCircle(s, 400, 450, 270) +
        `<ellipse cx="400" cy="700" rx="220" ry="28" fill="none" stroke="${s.accent}" stroke-width="1.6" opacity="0.6"/>`,
      figure(j, s),
    );
  },
  "surf-look-down-the-line": () => {
    const s = WAYS.strength;
    const j = stand(400);
    j.h = [455, 200];
    j.n = [430, 248];
    j.sr = [470, 270];
    j.er = [520, 320];
    j.wr = [560, 300];
    j.al = [340, 730];
    j.ar = [480, 730];
    return wrap(
      "strength",
      washCircle(s, 400, 430, 250) +
        `<path d="M 120 760 C 280 720, 500 780, 700 730" fill="none" stroke="${s.accent}" stroke-width="1.4" opacity="0.55"/>` +
        ground(s, 770),
      figure(j, s),
    );
  },
  "paddling-shoulder-er": () => {
    const s = WAYS.strength;
    const j = stand();
    j.er = [500, 360];
    j.wr = [530, 300];
    j.el = [350, 360];
    j.wl = [348, 438];
    return wrap(
      "strength",
      washCircle(s, 400, 420, 240) +
        `<path d="M 500 360 Q 560 280 530 300" fill="none" stroke="${s.accent}" stroke-width="1.8"/>` +
        ground(s, 760),
      figure(j, s),
    );
  },
  "active-passive-hang": () => {
    const s = WAYS.strength;
    const left = {
      h: [280, 340],
      n: [280, 378],
      sl: [240, 410],
      sr: [320, 410],
      el: [235, 310],
      er: [325, 310],
      wl: [230, 215],
      wr: [330, 215],
      hl: [255, 530],
      hrp: [305, 530],
      kl: [250, 650],
      kr: [310, 650],
      al: [245, 760],
      ar: [315, 760],
      hr: 22,
    };
    const right = {
      h: [520, 310],
      n: [520, 348],
      sl: [478, 365],
      sr: [562, 365],
      el: [470, 290],
      er: [570, 290],
      wl: [465, 215],
      wr: [575, 215],
      hl: [495, 500],
      hrp: [545, 500],
      kl: [490, 630],
      kr: [550, 630],
      al: [485, 760],
      ar: [555, 760],
      hr: 22,
    };
    return wrap(
      "strength",
      `<path d="M 140 200 H 660" stroke="${s.ink}" stroke-width="6" stroke-linecap="round"/>` +
        washCircle(s, 400, 480, 280),
      figure(left, s) + figure(right, s),
    );
  },
  "open-hand-hang": () => {
    const s = WAYS.strength;
    return wrap(
      "strength",
      washCircle(s, 400, 420, 280) +
        `<path d="M 180 280 H 620" stroke="${s.ink}" stroke-width="10" stroke-linecap="round"/>
         <g stroke="${s.ink}" stroke-width="2.2" fill="none">
           <path d="M 300 280 q -8 70 0 110"/>
           <path d="M 330 280 q -4 75 8 115"/>
           <path d="M 360 280 q 0 78 12 118"/>
           <path d="M 390 280 q 6 76 18 114"/>
           <path d="M 250 300 q -30 40 -20 70"/>
           <path d="M 470 280 q 8 70 0 110"/>
           <path d="M 500 280 q 4 75 -8 115"/>
           <path d="M 530 280 q 0 78 -12 118"/>
           <path d="M 560 280 q -6 76 -18 114"/>
           <path d="M 610 300 q 30 40 20 70"/>
         </g>`,
      "",
    );
  },
  "finger-extension": () => {
    const s = WAYS.strength;
    return wrap(
      "strength",
      washCircle(s, 400, 480, 280) +
        `<g stroke="${s.ink}" stroke-width="2.4" fill="none" transform="translate(400 520)">
           <path d="M 0 40 q -10 40 0 90"/>
           <path d="M -30 20 q -40 50 -20 110"/>
           <path d="M 30 20 q 40 50 20 110"/>
           <path d="M -55 5 q -55 40 -40 100"/>
           <path d="M 55 5 q 55 40 40 100"/>
           <circle cx="0" cy="20" r="28"/>
         </g>
         <ellipse cx="400" cy="430" rx="90" ry="36" fill="none" stroke="${s.accent}" stroke-width="1.8"/>`,
      "",
    );
  },
  "ride-glute-bridge": () => {
    const s = WAYS.strength;
    const j = {
      h: [200, 500],
      n: [240, 480],
      sl: [280, 460],
      sr: [285, 510],
      el: [230, 530],
      er: [235, 560],
      wl: [190, 550],
      wr: [195, 585],
      hl: [430, 380],
      hrp: [435, 420],
      kl: [510, 500],
      kr: [520, 530],
      al: [490, 610],
      ar: [535, 620],
      hr: 24,
    };
    return wrap(
      "strength",
      washCircle(s, 380, 480, 250) +
        `<circle cx="620" cy="620" r="70" fill="none" stroke="${s.accent}" stroke-width="2"/>
         <circle cx="620" cy="620" r="12" fill="none" stroke="${s.accent}" stroke-width="1.5"/>`,
      figure(j, s),
    );
  },
  "hip-flexor-antidote": () => {
    const s = WAYS.strength;
    const j = {
      h: [400, 210],
      n: [400, 250],
      sl: [355, 290],
      sr: [445, 290],
      el: [340, 360],
      er: [470, 300],
      wl: [370, 400],
      wr: [490, 230],
      hl: [380, 470],
      hrp: [430, 470],
      kl: [300, 600],
      kr: [520, 620],
      al: [240, 700],
      ar: [500, 720],
      hr: 28,
    };
    return wrap(
      "strength",
      washCircle(s, 400, 430, 260) +
        `<circle cx="640" cy="720" r="40" fill="none" stroke="${s.accent}" stroke-width="1.6" opacity="0.5"/>` +
        ground(s, 760),
      figure(j, s),
    );
  },
  "back-squat": () => {
    const s = WAYS.strength;
    const j = stand();
    j.h = [400, 280];
    j.n = [400, 318];
    j.hl = [370, 520];
    j.hrp = [430, 520];
    j.kl = [350, 640];
    j.kr = [450, 640];
    j.al = [340, 760];
    j.ar = [460, 760];
    j.wl = [300, 300];
    j.wr = [500, 300];
    return wrap(
      "strength",
      washCircle(s, 400, 430, 270) +
        `<line x1="250" y1="295" x2="550" y2="295" stroke="${s.accent}" stroke-width="4"/>` +
        ground(s, 780),
      figure(j, s),
    );
  },
  "front-squat": () => {
    const s = WAYS.strength;
    const j = stand();
    j.h = [400, 270];
    j.n = [400, 308];
    j.el = [350, 300];
    j.er = [450, 300];
    j.wl = [380, 270];
    j.wr = [420, 270];
    j.kl = [355, 630];
    j.kr = [445, 630];
    j.al = [345, 750];
    j.ar = [455, 750];
    return wrap(
      "strength",
      washCircle(s, 400, 420, 260) +
        `<line x1="300" y1="268" x2="500" y2="268" stroke="${s.accent}" stroke-width="4"/>` +
        ground(s, 770),
      figure(j, s),
    );
  },
  "split-squat": () => {
    const s = WAYS.strength;
    const j = {
      h: [400, 200],
      n: [400, 238],
      sl: [360, 280],
      sr: [440, 280],
      el: [340, 360],
      er: [460, 360],
      wl: [330, 430],
      wr: [470, 430],
      hl: [360, 470],
      hrp: [440, 470],
      kl: [300, 600],
      kr: [500, 560],
      al: [280, 730],
      ar: [540, 700],
    };
    return wrap("strength", washCircle(s, 400, 430, 270) + ground(s, 760), figure(j, s));
  },
  "bulgarian-split-squat": () => {
    const s = WAYS.strength;
    const j = {
      h: [370, 200],
      n: [370, 238],
      sl: [330, 280],
      sr: [410, 280],
      el: [310, 360],
      er: [430, 360],
      wl: [300, 430],
      wr: [440, 430],
      hl: [340, 470],
      hrp: [410, 480],
      kl: [280, 610],
      kr: [500, 520],
      al: [260, 740],
      ar: [560, 500],
    };
    return wrap(
      "strength",
      washCircle(s, 400, 420, 260) +
        `<rect x="520" y="470" width="90" height="18" fill="none" stroke="${s.accent}" stroke-width="2"/>` +
        ground(s, 760),
      figure(j, s),
    );
  },
  "reverse-lunge": () => {
    const s = WAYS.strength;
    const j = {
      h: [390, 200],
      n: [390, 238],
      sl: [350, 278],
      sr: [430, 278],
      el: [330, 360],
      er: [450, 360],
      wl: [320, 430],
      wr: [460, 430],
      hl: [360, 470],
      hrp: [430, 470],
      kl: [320, 600],
      kr: [500, 580],
      al: [300, 730],
      ar: [560, 720],
    };
    return wrap("strength", washCircle(s, 400, 430, 270) + ground(s, 760), figure(j, s));
  },
  "walking-lunge": () => {
    const s = WAYS.strength;
    const j = {
      h: [380, 190],
      n: [385, 230],
      sl: [350, 275],
      sr: [430, 268],
      el: [320, 360],
      er: [470, 340],
      wl: [300, 420],
      wr: [500, 400],
      hl: [360, 470],
      hrp: [430, 460],
      kl: [300, 600],
      kr: [520, 560],
      al: [270, 730],
      ar: [580, 700],
    };
    return wrap("strength", washCircle(s, 400, 420, 270) + ground(s, 760), figure(j, s));
  },
  "step-up": () => {
    const s = WAYS.strength;
    const j = stand();
    j.kl = [360, 560];
    j.al = [350, 620];
    j.kr = [430, 620];
    j.ar = [430, 750];
    return wrap(
      "strength",
      washCircle(s, 400, 420, 250) +
        `<rect x="280" y="620" width="160" height="24" fill="none" stroke="${s.accent}" stroke-width="2"/>` +
        ground(s, 770),
      figure(j, s),
    );
  },
  "conventional-deadlift": () => {
    const s = WAYS.strength;
    const j = stand();
    j.h = [400, 260];
    j.n = [400, 300];
    j.wl = [360, 520];
    j.wr = [440, 520];
    j.el = [350, 420];
    j.er = [450, 420];
    j.kl = [360, 580];
    j.kr = [440, 580];
    return wrap(
      "strength",
      washCircle(s, 400, 430, 270) +
        `<line x1="250" y1="530" x2="550" y2="530" stroke="${s.accent}" stroke-width="4"/>` +
        ground(s, 770),
      figure(j, s),
    );
  },
  "hip-thrust": () => {
    const s = WAYS.strength;
    const j = {
      h: [220, 420],
      n: [260, 400],
      sl: [300, 370],
      sr: [305, 430],
      el: [250, 340],
      er: [255, 460],
      wl: [210, 360],
      wr: [215, 480],
      hl: [470, 360],
      hrp: [475, 400],
      kl: [540, 500],
      kr: [550, 530],
      al: [520, 640],
      ar: [570, 650],
      hr: 24,
    };
    return wrap(
      "strength",
      washCircle(s, 400, 450, 260) +
        `<rect x="200" y="400" width="70" height="14" fill="none" stroke="${s.accent}" stroke-width="2"/>
         <line x1="360" y1="370" x2="560" y2="370" stroke="${s.accent}" stroke-width="3"/>`,
      figure(j, s),
    );
  },
  "kettlebell-swing": () => {
    const s = WAYS.strength;
    const j = stand();
    j.wl = [300, 280];
    j.wr = [360, 260];
    j.el = [330, 340];
    j.er = [380, 320];
    return wrap(
      "strength",
      washCircle(s, 400, 400, 260) +
        `<ellipse cx="270" cy="250" rx="22" ry="28" fill="none" stroke="${s.accent}" stroke-width="2.2"/>` +
        ground(s, 760),
      figure(j, s),
    );
  },
  "good-morning": () => {
    const s = WAYS.strength;
    const j = stand();
    j.h = [460, 280];
    j.n = [440, 320];
    j.wl = [400, 290];
    j.wr = [480, 300];
    j.hl = [380, 500];
    j.hrp = [420, 500];
    return wrap(
      "strength",
      washCircle(s, 400, 420, 260) +
        `<line x1="360" y1="300" x2="520" y2="310" stroke="${s.accent}" stroke-width="3"/>` +
        ground(s, 760),
      figure(j, s),
    );
  },
  "bench-press": () => {
    const s = WAYS.strength;
    const j = supine();
    j.wl = [400, 280];
    j.wr = [400, 580];
    return wrap(
      "strength",
      washCircle(s, 400, 460, 270) +
        `<line x1="280" y1="250" x2="280" y2="560" stroke="${s.accent}" stroke-width="3"/>
         <rect x="180" y="400" width="200" height="16" fill="none" stroke="${s.accent}" stroke-width="1.6"/>`,
      figure(j, s),
    );
  },
  "overhead-press": () => {
    const s = WAYS.strength;
    const j = stand();
    j.el = [360, 200];
    j.er = [440, 200];
    j.wl = [365, 140];
    j.wr = [435, 140];
    return wrap(
      "strength",
      washCircle(s, 400, 400, 260) +
        `<line x1="300" y1="130" x2="500" y2="130" stroke="${s.accent}" stroke-width="4"/>` +
        ground(s, 760),
      figure(j, s),
    );
  },
  "dip": () => {
    const s = WAYS.strength;
    const j = {
      h: [400, 280],
      n: [400, 320],
      sl: [350, 360],
      sr: [450, 360],
      el: [300, 390],
      er: [500, 390],
      wl: [270, 360],
      wr: [530, 360],
      hl: [375, 500],
      hrp: [425, 500],
      kl: [370, 600],
      kr: [430, 600],
      al: [365, 700],
      ar: [435, 700],
    };
    return wrap(
      "strength",
      washCircle(s, 400, 420, 260) +
        `<line x1="200" y1="355" x2="320" y2="355" stroke="${s.accent}" stroke-width="3"/>
         <line x1="480" y1="355" x2="600" y2="355" stroke="${s.accent}" stroke-width="3"/>`,
      figure(j, s),
    );
  },
  "dumbbell-row": () => {
    const s = WAYS.strength;
    const j = {
      h: [280, 280],
      n: [310, 310],
      sl: [340, 340],
      sr: [380, 360],
      el: [300, 400],
      er: [450, 420],
      wl: [280, 430],
      wr: [500, 500],
      hl: [400, 480],
      hrp: [430, 500],
      kl: [380, 600],
      kr: [500, 620],
      al: [360, 720],
      ar: [540, 730],
    };
    return wrap(
      "strength",
      washCircle(s, 400, 430, 260) +
        `<rect x="230" y="420" width="80" height="14" fill="none" stroke="${s.accent}" stroke-width="2"/>` +
        ground(s, 760),
      figure(j, s),
    );
  },
  "barbell-row": () => {
    const s = WAYS.strength;
    const j = stand();
    j.h = [480, 300];
    j.n = [450, 340];
    j.wl = [360, 480];
    j.wr = [440, 490];
    return wrap(
      "strength",
      washCircle(s, 400, 420, 260) +
        `<line x1="280" y1="500" x2="520" y2="510" stroke="${s.accent}" stroke-width="4"/>` +
        ground(s, 760),
      figure(j, s),
    );
  },
  "chin-up": () => {
    const s = WAYS.strength;
    const j = {
      h: [400, 260],
      n: [400, 300],
      sl: [350, 340],
      sr: [450, 340],
      el: [340, 250],
      er: [460, 250],
      wl: [330, 180],
      wr: [470, 180],
      hl: [375, 470],
      hrp: [425, 470],
      kl: [370, 580],
      kr: [430, 580],
      al: [365, 680],
      ar: [435, 680],
    };
    return wrap(
      "strength",
      washCircle(s, 400, 400, 260) +
        `<line x1="220" y1="170" x2="580" y2="170" stroke="${s.accent}" stroke-width="3"/>`,
      figure(j, s),
    );
  },
  "lat-pulldown": () => {
    const s = WAYS.strength;
    const j = sit();
    j.el = [340, 300];
    j.er = [460, 300];
    j.wl = [320, 220];
    j.wr = [480, 220];
    return wrap(
      "strength",
      washCircle(s, 400, 400, 260) +
        `<line x1="260" y1="200" x2="540" y2="200" stroke="${s.accent}" stroke-width="3"/>` +
        ground(s, 620),
      figure(j, s),
    );
  },
  "plank": () => {
    const s = WAYS.strength;
    const j = {
      h: [180, 400],
      n: [220, 410],
      sl: [260, 390],
      sr: [265, 450],
      el: [230, 470],
      er: [235, 500],
      wl: [200, 500],
      wr: [205, 530],
      hl: [480, 400],
      hrp: [485, 450],
      kl: [600, 410],
      kr: [605, 460],
      al: [720, 420],
      ar: [725, 470],
      hr: 24,
    };
    return wrap("strength", washCircle(s, 420, 450, 270) + ground(s, 540), figure(j, s));
  },
  "side-plank": () => {
    const s = WAYS.strength;
    const j = {
      h: [220, 320],
      n: [260, 350],
      sl: [300, 380],
      sr: [290, 420],
      el: [250, 450],
      er: [340, 300],
      wl: [220, 500],
      wr: [380, 250],
      hl: [430, 430],
      hrp: [440, 470],
      kl: [560, 450],
      kr: [570, 490],
      al: [680, 470],
      ar: [690, 510],
      hr: 24,
    };
    return wrap("strength", washCircle(s, 420, 430, 270) + ground(s, 540), figure(j, s));
  },
  "pallof-press": () => {
    const s = WAYS.strength;
    const j = stand();
    j.el = [360, 340];
    j.er = [400, 340];
    j.wl = [430, 340];
    j.wr = [470, 340];
    return wrap(
      "strength",
      washCircle(s, 400, 400, 250) +
        `<path d="M 480 340 L 620 340" stroke="${s.accent}" stroke-width="2"/>` +
        ground(s, 760),
      figure(j, s),
    );
  },
  "hanging-knee-raise": () => {
    const s = WAYS.strength;
    const j = {
      h: [400, 240],
      n: [400, 280],
      sl: [350, 320],
      sr: [450, 320],
      el: [345, 230],
      er: [455, 230],
      wl: [340, 160],
      wr: [460, 160],
      hl: [375, 460],
      hrp: [425, 460],
      kl: [360, 420],
      kr: [440, 420],
      al: [350, 380],
      ar: [450, 380],
    };
    return wrap(
      "strength",
      washCircle(s, 400, 400, 260) +
        `<line x1="220" y1="150" x2="580" y2="150" stroke="${s.accent}" stroke-width="3"/>`,
      figure(j, s),
    );
  },
  "suitcase-carry": () => {
    const s = WAYS.strength;
    const j = stand();
    j.wl = [330, 500];
    j.wr = [450, 440];
    return wrap(
      "strength",
      washCircle(s, 400, 400, 250) +
        `<rect x="310" y="510" width="28" height="40" fill="none" stroke="${s.accent}" stroke-width="2"/>` +
        ground(s, 760),
      figure(j, s),
    );
  },
  "turkish-get-up": () => {
    const s = WAYS.strength;
    const j = {
      h: [360, 220],
      n: [370, 260],
      sl: [340, 310],
      sr: [410, 300],
      el: [300, 380],
      er: [430, 220],
      wl: [270, 430],
      wr: [440, 150],
      hl: [380, 470],
      hrp: [450, 480],
      kl: [320, 600],
      kr: [540, 560],
      al: [280, 720],
      ar: [600, 700],
    };
    return wrap(
      "strength",
      washCircle(s, 400, 420, 270) +
        `<circle cx="440" cy="130" r="16" fill="none" stroke="${s.accent}" stroke-width="2"/>` +
        ground(s, 760),
      figure(j, s),
    );
  },
  "box-jump": () => {
    const s = WAYS.strength;
    const j = stand(400, -40);
    j.kl = [360, 520];
    j.kr = [440, 520];
    j.al = [350, 580];
    j.ar = [450, 580];
    return wrap(
      "strength",
      washCircle(s, 400, 400, 250) +
        `<rect x="300" y="590" width="200" height="30" fill="none" stroke="${s.accent}" stroke-width="2"/>` +
        ground(s, 760),
      figure(j, s),
    );
  },
  "jump-squat": () => {
    const s = WAYS.strength;
    const j = stand(400, -80);
    j.wl = [330, 300];
    j.wr = [470, 300];
    return wrap("strength", washCircle(s, 400, 380, 250) + ground(s, 760), figure(j, s));
  },
  "biceps-curl": () => {
    const s = WAYS.strength;
    const j = stand();
    j.el = [350, 360];
    j.er = [450, 360];
    j.wl = [360, 300];
    j.wr = [440, 300];
    return wrap("strength", washCircle(s, 400, 400, 250) + ground(s, 760), figure(j, s));
  },
  "overhead-tricep-extension": () => {
    const s = WAYS.strength;
    const j = stand();
    j.el = [390, 200];
    j.er = [430, 200];
    j.wl = [385, 160];
    j.wr = [415, 140];
    return wrap(
      "strength",
      washCircle(s, 400, 400, 250) +
        `<ellipse cx="400" cy="125" rx="16" ry="20" fill="none" stroke="${s.accent}" stroke-width="2"/>` +
        ground(s, 760),
      figure(j, s),
    );
  },
  "lateral-raise": () => {
    const s = WAYS.strength;
    const j = stand();
    j.el = [300, 300];
    j.er = [500, 300];
    j.wl = [240, 300];
    j.wr = [560, 300];
    return wrap("strength", washCircle(s, 400, 400, 260) + ground(s, 760), figure(j, s));
  },
  "calf-raise": () => {
    const s = WAYS.strength;
    const j = stand(400, -20);
    j.al = [366, 700];
    j.ar = [438, 700];
    return wrap("strength", washCircle(s, 400, 400, 240) + ground(s, 760), figure(j, s));
  },
  "y-t-w-raise": () => {
    const s = WAYS.strength;
    const j = {
      h: [220, 360],
      n: [260, 380],
      sl: [300, 360],
      sr: [305, 420],
      el: [360, 280],
      er: [365, 500],
      wl: [430, 220],
      wr: [435, 560],
      hl: [480, 380],
      hrp: [485, 430],
      kl: [600, 390],
      kr: [605, 440],
      al: [720, 400],
      ar: [725, 450],
      hr: 24,
    };
    return wrap("strength", washCircle(s, 420, 420, 270), figure(j, s));
  },
  "nordic-hamstring": () => {
    const s = WAYS.strength;
    const j = {
      h: [280, 280],
      n: [310, 320],
      sl: [340, 360],
      sr: [360, 380],
      el: [300, 420],
      er: [320, 440],
      wl: [270, 460],
      wr: [290, 480],
      hl: [430, 500],
      hrp: [450, 520],
      kl: [480, 620],
      kr: [500, 640],
      al: [520, 740],
      ar: [540, 750],
    };
    return wrap("strength", washCircle(s, 400, 450, 260) + ground(s, 770), figure(j, s));
  },
  "thoracic-after-bars": () => {
    const s = WAYS.strength;
    const j = {
      h: [230, 410],
      n: [270, 420],
      sl: [310, 390],
      sr: [315, 460],
      el: [250, 350],
      er: [255, 490],
      wl: [230, 390],
      wr: [235, 430],
      hl: [500, 430],
      hrp: [505, 470],
      kl: [580, 500],
      kr: [590, 540],
      al: [560, 600],
      ar: [610, 610],
      hr: 24,
    };
    return wrap(
      "strength",
      washCircle(s, 400, 460, 270) +
        `<ellipse cx="400" cy="500" rx="70" ry="22" fill="none" stroke="${s.accent}" stroke-width="2"/>
         <path d="M 560 220 h 80 l 40 40" fill="none" stroke="${s.accent}" stroke-width="1.6" opacity="0.5"/>`,
      figure(j, s),
    );
  },
};

fs.mkdirSync(outDir, { recursive: true });
for (const [id, render] of Object.entries(images)) {
  fs.writeFileSync(path.join(outDir, `${id}.svg`), render());
}
console.log(`Wrote ${Object.keys(images).length} practice images to public/practices`);
