/**
 * Company names reach the UI in two different casings. EDGAR stores the
 * filer's legal name shouted — "PURE CYCLE CORP", "TWO HARBORS INVESTMENT
 * CORP" — while newswire events carry the name as the company writes it
 * ("Eos Energy Enterprises, Inc."). Stacked down a watchlist the two read as
 * two different products, so every surface that prints a company name puts it
 * through here first.
 *
 * Only shouted names are rewritten. A name containing any lowercase letter is
 * already cased the way its owner cases it and is returned untouched — this
 * never "fixes" an eBay or a bioAffinity into something the company isn't.
 * Punctuation is left exactly as it arrived: the job is casing, not tidying.
 */

// Legal forms and initialisms that title casing would ruin.
const KEEP_UPPER = new Set([
  // Legal forms
  "LLC", "PLC", "LP", "LLP", "LLLP", "NV", "BV", "AG", "SA", "SAB", "AB",
  "ASA", "OYJ", "SE", "KGAA", "PBC",
  // Initialisms that show up inside names
  "USA", "US", "UK", "EU", "UAE", "AI", "IT", "EV", "TV", "HVAC", "REIT",
  "ETF", "SPAC", "ADR", "ADS", "PC", "MRI", "LED", "GPS", "IP",
]);

// Abbreviations EDGAR shouts that are words, not initialisms — the
// vowel-less rule below would otherwise leave them shouting.
const KEEP_TITLE = new Map([
  ["LTD", "Ltd"], ["MFG", "Mfg"], ["MGMT", "Mgmt"], ["GRP", "Grp"],
  ["HLDG", "Hldg"], ["HLDGS", "Hldgs"], ["BROS", "Bros"], ["SVCS", "Svcs"],
  ["MTG", "Mtg"], ["PTNRS", "Ptnrs"], ["PRTNRS", "Prtnrs"],
]);

// Lowercase inside a name, never at either edge ("Bank of America Corp").
const SMALL_WORDS = new Set(
  "a an and as at but by de del for from in into la las los nor of on or the to van von with y"
    .split(" ")
);

// I through XII — the generations and fund series that appear in filer names.
// Deliberately narrower than full roman-numeral syntax, which would also match
// real words ("MIX" is a valid numeral).
const ROMAN = /^(?:I{1,3}|IV|VI{0,3}|IX|XI{0,2}|XII)$/;

// "U.S.", "A.O." — the dots carry the meaning, so leave the token alone.
const DOTTED_INITIALISM = /^(?:\p{Lu}\.){2,}$/u;

const ORDINAL = /^(\d+)(ST|ND|RD|TH)$/;

const EDGE_PUNCT = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;

/** Shouted = has letters, and not one of them is lowercase. */
function isShouted(name: string): boolean {
  return /\p{Lu}/u.test(name) && !/\p{Ll}/u.test(name);
}

/** "REILLY" → "Reilly"; "MCKESSON" → "McKesson". */
function titleRun(run: string): string {
  const cased = run.charAt(0) + run.slice(1).toLowerCase();
  // Mc-names are common enough among filers (McKesson, McEwen, McAfee) that
  // flattening them to "Mckesson" is the more visible mistake.
  if (/^MC\p{Lu}{2,}$/u.test(run)) {
    return "Mc" + run.charAt(2) + run.slice(3).toLowerCase();
  }
  return cased;
}

function caseToken(token: string, isEdge: boolean): string {
  if (!/\p{Lu}/u.test(token)) return token;
  if (DOTTED_INITIALISM.test(token.replace(/[,;]$/, ""))) return token;

  const core = token.replace(EDGE_PUNCT, "");
  if (KEEP_UPPER.has(core)) return token;
  const titled = KEEP_TITLE.get(core);
  if (titled) return token.replace(core, titled);
  if (ROMAN.test(core)) return token;
  if (core.length === 1) return token;

  const ordinal = core.match(ORDINAL);
  if (ordinal) return token.replace(core, ordinal[1] + ordinal[2].toLowerCase());
  // A short token carrying a digit is a mark, not a word: 3M, P10, K12.
  // Longer ones are words with a number stuck on ("23andMe"), so they fall
  // through to the title pass.
  if (/\p{N}/u.test(core) && (core.match(/\p{L}/gu) ?? []).length <= 3) {
    return token;
  }

  // Vowel-less runs are initialisms: PBF, NRG, CRH, HDFC.
  if (/^\p{Lu}{2,5}$/u.test(core) && !/[AEIOUY]/.test(core)) return token;

  // AT&T, H&R — ampersand joining short runs is an initialism too.
  if (core.includes("&") && core.split("&").every((p) => p.length <= 2)) {
    return token;
  }

  if (!isEdge && SMALL_WORDS.has(core.toLowerCase())) return token.toLowerCase();

  return token
    .replace(/\p{L}+/gu, titleRun)
    // Possessives come out of the run pass as "Sam'S".
    .replace(/'S(?!\p{L})/gu, "'s");
}

/**
 * Display casing for a company name: shouted EDGAR names become Title Case,
 * everything else is passed through as-is.
 *
 * Acronym filers whose name reads like a word ("AES CORP") come out as
 * "Aes Corp" rather than "AES Corp": nothing in the string says which it is,
 * and the whole point of this pass is that nothing shouts.
 */
export function displayCompanyName(name: string | null | undefined): string {
  if (!name) return "";
  if (!isShouted(name)) return name;

  const tokens = name.split(/(\s+)/);
  const words = tokens.filter((t) => /\p{L}/u.test(t));
  const first = words[0];
  const last = words[words.length - 1];

  return tokens
    .map((t) => (/\s/.test(t) ? t : caseToken(t, t === first || t === last)))
    .join("");
}
