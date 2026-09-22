"use client";

import { useEffect, useRef, useState } from "react";
import { PAGE_SECTIONS } from "@/lib/fundamentals/rows";
import { cn } from "@/lib/utils";

/**
 * The bar's own height, in px. Sections scroll-margin by exactly this, and
 * the observer discounts exactly this, so "jump to Ratios" lands the
 * heading directly under the bar instead of near it.
 */
export const SECTION_NAV_HEIGHT = 44;

/** The id of the page top, which the company's own name jumps back to. */
export const TOP_SECTION_ID = "top";

/**
 * The sub-navigation, directly under the app's own bar and sticky there.
 *
 * Every section is already on the page; this only moves the viewport, and
 * it moves it instantly. A smooth scroll across a page this tall is a
 * second of watching rows fly past, which tells the reader nothing and
 * delays what they asked for.
 *
 * The current section is tracked from scroll position, so the bar doubles
 * as a "where am I" — hence the underline rather than a filled pill: it
 * marks a position in the page, not a filter that has been switched on.
 */
export function SectionNav({
  companyName,
  sections = PAGE_SECTIONS,
}: {
  /** Shown first, jumping back to the top of the page. */
  companyName?: string;
  sections?: { id: string; label: string }[];
}) {
  const items = companyName
    ? [{ id: TOP_SECTION_ID, label: companyName }, ...sections]
    : sections;
  const [active, setActive] = useState<string>(items[0]?.id ?? "");
  const bar = useRef<HTMLElement>(null);

  // Which section is under the bar, measured rather than observed.
  //
  // An IntersectionObserver would need its band expressed as a static
  // rootMargin, and this bar's distance from the top of the viewport is
  // not static — it sits below the app's own bar, so the band starts at
  // 93px, not at the bar's own 44. Reading the bar's live position each
  // time is both shorter and correct at any chrome height. Eight sections
  // is nothing to measure; the work is thrown away until the next frame.
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const scroller = el.closest<HTMLElement>(".overflow-y-auto");
    const target: HTMLElement | Window = scroller ?? window;
    let frame = 0;

    const measure = () => {
      frame = 0;
      // A few pixels of slack: a section landed exactly under the bar by
      // scroll-margin shouldn't lose to rounding.
      const band = el.getBoundingClientRect().bottom + 4;
      let current = items[0]?.id ?? "";
      for (const section of items) {
        const node = document.getElementById(section.id);
        if (node && node.getBoundingClientRect().top <= band) current = section.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    target.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      target.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // `items` is rebuilt each render; its identity is the company name.
  }, [companyName, sections]); // eslint-disable-line react-hooks/exhaustive-deps

  const jump = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ block: "start", behavior: "instant" });
    setActive(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav
      ref={bar}
      aria-label="Sections"
      className="sticky top-0 z-10 -mx-4 border-b border-line-subtle bg-canvas px-4"
    >
      <ul className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((s) => (
          <li key={s.id} className="shrink-0">
            <a
              href={`#${s.id}`}
              onClick={jump(s.id)}
              aria-current={active === s.id ? "location" : undefined}
              className={cn(
                "inline-flex h-11 items-center border-b-2 px-3 text-label font-medium whitespace-nowrap transition-colors",
                active === s.id
                  ? "border-brand text-brand-ink"
                  : "border-transparent text-ink-muted hover:text-ink"
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
