import { describe, it, expect } from "vitest";
import { displayCompanyName } from "@/lib/company-name";

describe("displayCompanyName", () => {
  it("title-cases shouted EDGAR names", () => {
    expect(displayCompanyName("PURE CYCLE CORP")).toBe("Pure Cycle Corp");
    expect(displayCompanyName("TWO HARBORS INVESTMENT CORP")).toBe(
      "Two Harbors Investment Corp"
    );
    expect(displayCompanyName("APPLIED OPTOELECTRONICS, INC.")).toBe(
      "Applied Optoelectronics, Inc."
    );
  });

  it("leaves already-cased names exactly as they arrived", () => {
    expect(displayCompanyName("Eos Energy Enterprises, Inc.")).toBe(
      "Eos Energy Enterprises, Inc."
    );
    expect(displayCompanyName("eBay Inc.")).toBe("eBay Inc.");
    expect(displayCompanyName("bioAffinity Technologies, Inc.")).toBe(
      "bioAffinity Technologies, Inc."
    );
  });

  it("handles empty and missing names", () => {
    expect(displayCompanyName("")).toBe("");
    expect(displayCompanyName(null)).toBe("");
    expect(displayCompanyName(undefined)).toBe("");
  });

  it("keeps legal forms and initialisms upper", () => {
    expect(displayCompanyName("CARLYLE SECURED LENDING LLC")).toBe(
      "Carlyle Secured Lending LLC"
    );
    expect(displayCompanyName("FERGUSON ENTERPRISES PLC")).toBe(
      "Ferguson Enterprises PLC"
    );
    expect(displayCompanyName("BLACKSTONE MORTGAGE TRUST LP")).toBe(
      "Blackstone Mortgage Trust LP"
    );
    expect(displayCompanyName("US PHYSICAL THERAPY INC")).toBe(
      "US Physical Therapy Inc"
    );
    expect(displayCompanyName("GRUPO TELEVISA SAB")).toBe("Grupo Televisa SAB");
  });

  it("keeps vowel-less initialisms and dotted ones upper", () => {
    expect(displayCompanyName("PBF ENERGY INC")).toBe("PBF Energy Inc");
    expect(displayCompanyName("NRG ENERGY, INC.")).toBe("NRG Energy, Inc.");
    expect(displayCompanyName("SPDR S&P 500 ETF TRUST")).toBe(
      "SPDR S&P 500 ETF Trust"
    );
    expect(displayCompanyName("U.S. BANCORP")).toBe("U.S. Bancorp");
    expect(displayCompanyName("AT&T INC.")).toBe("AT&T Inc.");
  });

  it("title-cases shouted abbreviations that are words", () => {
    expect(displayCompanyName("ALIBABA GROUP HOLDING LTD")).toBe(
      "Alibaba Group Holding Ltd"
    );
    expect(displayCompanyName("SMITH MFG CO")).toBe("Smith Mfg Co");
  });

  it("lowercases small words away from the edges", () => {
    expect(displayCompanyName("BANK OF AMERICA CORP")).toBe(
      "Bank of America Corp"
    );
    expect(displayCompanyName("THE CIGNA GROUP")).toBe("The Cigna Group");
    expect(displayCompanyName("SMUCKER J M CO")).toBe("Smucker J M Co");
  });

  it("keeps series numerals and short marks that carry digits", () => {
    expect(displayCompanyName("CARLYLE CREDIT INCOME FUND III")).toBe(
      "Carlyle Credit Income Fund III"
    );
    expect(displayCompanyName("3M CO")).toBe("3M Co");
    expect(displayCompanyName("1ST CONSTITUTION BANCORP")).toBe(
      "1st Constitution Bancorp"
    );
    expect(displayCompanyName("23ANDME HOLDING CO.")).toBe(
      "23Andme Holding Co."
    );
  });

  it("cases the names punctuation hides", () => {
    expect(displayCompanyName("O'REILLY AUTOMOTIVE INC")).toBe(
      "O'Reilly Automotive Inc"
    );
    expect(displayCompanyName("MCKESSON CORP")).toBe("McKesson Corp");
    expect(displayCompanyName("COCA-COLA CO")).toBe("Coca-Cola Co");
    expect(displayCompanyName("SAM'S CLUB")).toBe("Sam's Club");
  });
});
