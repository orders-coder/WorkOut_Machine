"use client";

import { useEffect, useId, useRef, useState } from "react";

export function RoundClock({
  seconds,
  total,
  running = true,
}: {
  seconds: number;
  total: number;
  running?: boolean;
}) {
  const size = 112;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const gradientId = useId();
  const budget = useRef(Math.max(total, seconds, 1));
  const anchor = useRef<{ at: number; remaining: number } | null>(null);
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (!running) {
      anchor.current = null;
      budget.current = Math.max(total, seconds, 1);
      setLeft(seconds);
      return;
    }

    const now = performance.now();
    const expected = anchor.current
      ? anchor.current.remaining - (now - anchor.current.at) / 1000
      : null;
    const reset = expected == null || seconds > expected + 0.35 || seconds < expected - 1.5;
    if (reset) {
      budget.current = Math.max(total, seconds, 1);
      anchor.current = { at: now, remaining: seconds };
      setLeft(seconds);
    }

    let frame = 0;
    const loop = () => {
      const mark = anchor.current;
      if (!mark) {
        return;
      }
      const next = Math.max(0, mark.remaining - (performance.now() - mark.at) / 1000);
      setLeft(next);
      if (next > 0) {
        frame = requestAnimationFrame(loop);
      }
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [running, seconds, total]);

  const ratio = Math.min(1, Math.max(0, left / budget.current));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  const label = minutes > 0 ? `${minutes}:${rest.toString().padStart(2, "0")}` : `${seconds}`;

  return (
    <div className="mx-auto flex w-full flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c5d7cb" />
            <stop offset="100%" stopColor="#7f9f8e" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="#f7f4ef" stroke="#e7e0d6" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <p className="mt-2 text-sm tabular-nums tracking-wide text-ink/45">{label}</p>
    </div>
  );
}
