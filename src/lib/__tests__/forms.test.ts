import { describe, it, expect } from "vitest";
import { filedPhrase, formPhrase, formTag } from "@/lib/forms";

describe("press-release display helpers", () => {
  it("phrases a PR as a press release", () => {
    expect(formPhrase("PR")).toBe("a press release");
    expect(formTag("PR")).toBe("Press Release");
  });

  it("filedPhrase uses 'issued' for press releases", () => {
    expect(filedPhrase("PR")).toBe("issued a press release");
  });

  it("filedPhrase keeps 'filed' for SEC forms", () => {
    expect(filedPhrase("8-K")).toBe("filed an 8-K");
    expect(filedPhrase("8-K/A")).toBe("filed an 8-K amendment");
    expect(filedPhrase("SC 13D")).toBe("filed a 13D stake disclosure");
  });

  it("filedPhrase falls back sanely on unknown forms", () => {
    expect(filedPhrase("S-1")).toBe("filed a S-1");
  });
});
