"use client";

import { useEffect, useState } from "react";
import { PAGE_SECTIONS } from "@/lib/fundamentals/rows";
import { cn } from "@/lib/utils";

/**
 * The sticky sub-navigation across the top of a company page. Every
 * section is on the page already; this only scrolls. The current section
 * is tracked from scroll position so the bar doubles as a "where am I".
 */
export function SectionNav({ sections = PAGE_SECTIONS }: { sections?: { id: string; label: string }[] }) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    if (elements.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // The topmost visible section wins; a section that just scrolled
        // above the fold stays active until the next one arrives.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-56px 0px -60% 0px", threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const jump = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ block: "start", behavior: "smooth" });
    setActive(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav
      aria-label="Sections"
      className="sticky top-0 z-10 -mx-4 border-b border-line-subtle bg-canvas px-4"
    >
      <ul className="flex gap-1 overflow-x-auto py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((s) => (
          <li key={s.id} className="shrink-0">
            <a
              href={`#${s.id}`}
              onClick={jump(s.id)}
              aria-current={active === s.id ? "location" : undefined}
              className={cn(
                "inline-flex h-8 items-center rounded-sm px-2.5 text-meta font-medium transition-colors",
                active === s.id
                  ? "bg-brand text-brand-on"
                  : "text-ink-muted hover:bg-surface-hover hover:text-ink"
              )}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
