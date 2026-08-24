import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("keeps a design-system size alongside a design-system colour", () => {
    // Both look like `text-*`; tailwind-merge must not treat them as a conflict
    expect(cn("text-label text-ink")).toBe("text-label text-ink");
    expect(cn("text-micro font-medium text-brand-on")).toBe(
      "text-micro font-medium text-brand-on"
    );
  });

  it("still resolves genuine conflicts", () => {
    expect(cn("text-label", "text-body")).toBe("text-body");
    expect(cn("text-ink", "text-ink-faint")).toBe("text-ink-faint");
    expect(cn("bg-surface", "bg-brand")).toBe("bg-brand");
    expect(cn("rounded-sm", "rounded-lg")).toBe("rounded-lg");
  });
});
