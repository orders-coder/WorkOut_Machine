"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Home" },
  { href: "/routines", label: "Routines" },
  { href: "/live", label: "Live" },
  { href: "/exercises", label: "Exercises" },
  { href: "/muscles", label: "Muscles" },
] as const;

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/80 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <div className="mx-auto max-w-lg">
        <ul className="grid h-12 grid-cols-5 items-center">
          {ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : item.href === "/exercises"
                  ? pathname.startsWith("/exercises") || pathname.startsWith("/practice")
                  : pathname.startsWith(item.href);
            return (
              <li key={item.href} className="flex justify-center">
                <Link
                  href={item.href}
                  className={`text-[0.7rem] tracking-normal ${
                    active ? "font-medium text-[#0071e3]" : "text-[#6e6e73]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
