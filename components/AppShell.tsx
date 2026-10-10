"use client";

import { LibraryProvider } from "./LibraryProvider";
import { TopNav } from "./TopNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LibraryProvider>
      <div
        className="mx-auto min-h-dvh max-w-lg"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div
          className="pb-6"
          style={{ paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
        >
          {children}
        </div>
        <TopNav />
      </div>
    </LibraryProvider>
  );
}
