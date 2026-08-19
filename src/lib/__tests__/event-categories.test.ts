import { describe, it, expect } from "vitest";
import {
  EVENT_CATEGORIES,
  eventCategory,
  toCurrentCategory,
} from "../event-categories";

describe("EVENT_CATEGORIES", () => {
  it("is one simple category per event, never the taxonomy underneath", () => {
    expect(EVENT_CATEGORIES).toHaveLength(9);
    // taxonomy leaf slugs ("ceo_departure") must never reach this list
    for (const c of EVENT_CATEGORIES) expect(c).not.toContain("_");
  });

  it("ends with Other so the toolbar can drop it", () => {
    expect(EVENT_CATEGORIES[EVENT_CATEGORIES.length - 1]).toBe("Other");
  });
});

describe("toCurrentCategory", () => {
  it("maps pre-taxonomy labels onto the category they fold into", () => {
    expect(toCurrentCategory("Acquisition")).toBe("Strategic Transactions");
    expect(toCurrentCategory("Cybersecurity Incident")).toBe("Risk Events");
  });

  it("leaves current categories alone", () => {
    for (const c of EVENT_CATEGORIES) expect(toCurrentCategory(c)).toBe(c);
  });

  it("passes through anything it doesn't recognize", () => {
    expect(toCurrentCategory("Something New")).toBe("Something New");
  });
});

describe("eventCategory", () => {
  const briefing = (primary_event_type: string) =>
    ({ primary_event_type }) as { primary_event_type: string };

  it("returns the display category", () => {
    expect(eventCategory(briefing("Risk Events"))).toBe("Risk Events");
  });

  it("normalizes a legacy label so the feed shows one vocabulary", () => {
    expect(eventCategory(briefing("Earnings"))).toBe("Financial Results");
  });

  it("is null when there is nothing worth showing", () => {
    expect(eventCategory(briefing("Other"))).toBeNull();
    expect(eventCategory(null)).toBeNull();
    expect(eventCategory(undefined)).toBeNull();
  });
});
