import { describe, it, expect } from "vitest";
import { caseCompanyName, displayCompanyName } from "@/lib/company-name";

describe("caseCompanyName", () => {
  it("title-cases shouted EDGAR names", () => {
    expect(caseCompanyName("PURE CYCLE CORP")).toBe("Pure Cycle Corp");
    expect(caseCompanyName("TWO HARBORS INVESTMENT CORP")).toBe(
      "Two Harbors Investment Corp"
    );
    expect(caseCompanyName("APPLIED OPTOELECTRONICS, INC.")).toBe(
      "Applied Optoelectronics, Inc."
    );
  });

  it("leaves already-cased names exactly as they arrived", () => {
    expect(caseCompanyName("Eos Energy Enterprises, Inc.")).toBe(
      "Eos Energy Enterprises, Inc."
    );
    expect(caseCompanyName("eBay Inc.")).toBe("eBay Inc.");
    expect(caseCompanyName("bioAffinity Technologies, Inc.")).toBe(
      "bioAffinity Technologies, Inc."
    );
  });

  it("handles empty and missing names", () => {
    expect(caseCompanyName("")).toBe("");
    expect(caseCompanyName(null)).toBe("");
    expect(caseCompanyName(undefined)).toBe("");
  });

  it("keeps legal forms and initialisms upper", () => {
    expect(caseCompanyName("CARLYLE SECURED LENDING LLC")).toBe(
      "Carlyle Secured Lending LLC"
    );
    expect(caseCompanyName("FERGUSON ENTERPRISES PLC")).toBe(
      "Ferguson Enterprises PLC"
    );
    expect(caseCompanyName("BLACKSTONE MORTGAGE TRUST LP")).toBe(
      "Blackstone Mortgage Trust LP"
    );
    expect(caseCompanyName("US PHYSICAL THERAPY INC")).toBe(
      "US Physical Therapy Inc"
    );
    expect(caseCompanyName("GRUPO TELEVISA SAB")).toBe("Grupo Televisa SAB");
  });

  it("keeps vowel-less initialisms and dotted ones upper", () => {
    expect(caseCompanyName("PBF ENERGY INC")).toBe("PBF Energy Inc");
    expect(caseCompanyName("NRG ENERGY, INC.")).toBe("NRG Energy, Inc.");
    expect(caseCompanyName("SPDR S&P 500 ETF TRUST")).toBe(
      "SPDR S&P 500 ETF Trust"
    );
    expect(caseCompanyName("U.S. BANCORP")).toBe("U.S. Bancorp");
    expect(caseCompanyName("AT&T INC.")).toBe("AT&T Inc.");
  });

  it("title-cases shouted abbreviations that are words", () => {
    expect(caseCompanyName("ALIBABA GROUP HOLDING LTD")).toBe(
      "Alibaba Group Holding Ltd"
    );
    expect(caseCompanyName("SMITH MFG CO")).toBe("Smith Mfg Co");
  });

  it("lowercases small words away from the edges", () => {
    expect(caseCompanyName("BANK OF AMERICA CORP")).toBe(
      "Bank of America Corp"
    );
    expect(caseCompanyName("THE CIGNA GROUP")).toBe("The Cigna Group");
    expect(caseCompanyName("SMUCKER J M CO")).toBe("Smucker J M Co");
  });

  it("keeps series numerals and short marks that carry digits", () => {
    expect(caseCompanyName("CARLYLE CREDIT INCOME FUND III")).toBe(
      "Carlyle Credit Income Fund III"
    );
    expect(caseCompanyName("3M CO")).toBe("3M Co");
    expect(caseCompanyName("1ST CONSTITUTION BANCORP")).toBe(
      "1st Constitution Bancorp"
    );
    expect(caseCompanyName("23ANDME HOLDING CO.")).toBe(
      "23Andme Holding Co."
    );
  });

  it("cases the names punctuation hides", () => {
    expect(caseCompanyName("O'REILLY AUTOMOTIVE INC")).toBe(
      "O'Reilly Automotive Inc"
    );
    expect(caseCompanyName("MCKESSON CORP")).toBe("McKesson Corp");
    expect(caseCompanyName("COCA-COLA CO")).toBe("Coca-Cola Co");
    expect(caseCompanyName("SAM'S CLUB")).toBe("Sam's Club");
  });
});

describe("displayCompanyName", () => {
  it.each([
    ["MICRON TECHNOLOGY INC", "Micron Technology"],
    ["Tesla, Inc.", "Tesla"],
    ["Braemar Hotels & Resorts Inc.", "Braemar Hotels & Resorts"],
    ["ACME CORP /DE/", "Acme"],
    ["Booking Holdings Inc.", "Booking Holdings"],
    ["Linde plc", "Linde"],
    ["Inc", "Inc"],
    ["JPMorgan Chase & Co.", "JPMorgan Chase"],
    ["PURE CYCLE CORP", "Pure Cycle"],
    ["eBay Inc.", "eBay"],
    ["Fifth Third Bancorp", "Fifth Third Bancorp"],
    ["Johnson & Johnson", "Johnson & Johnson"],
    ["Energy Transfer LP", "Energy Transfer"],
    ["", ""],
  ])("%s → %s", (input, expected) => {
    expect(displayCompanyName(input)).toBe(expected);
  });
});
