/**
 * Strip model glitch tokens from assistant Markdown before render/copy.
 * Targets mixed-script junk (e.g. Arabic+Cyrillic "لارга") and unexpected
 * non AR/EN script runs that free bilingual models occasionally emit.
 */

function collectScripts(core: string): Set<string> {
  const scripts = new Set<string>();

  for (const char of core) {
    if (/\p{Script=Arabic}/u.test(char)) scripts.add("Arabic");
    else if (/\p{Script=Latin}/u.test(char)) scripts.add("Latin");
    else if (/\p{Script=Cyrillic}/u.test(char)) scripts.add("Cyrillic");
    else if (/\p{Script=Han}/u.test(char)) scripts.add("Han");
    else if (/\p{Script=Hiragana}/u.test(char) || /\p{Script=Katakana}/u.test(char)) {
      scripts.add("Japanese");
    } else if (/\p{Script=Hangul}/u.test(char)) scripts.add("Hangul");
  }

  return scripts;
}

function isGlitchToken(token: string): boolean {
  // Preserve pure Markdown punctuation / fence markers.
  if (/^[#>*`~\-_=[\](){}|\\./:]+$/.test(token)) return false;

  const core = token.replace(/[\p{P}\p{S}\p{N}\p{Zs}]/gu, "");
  if (!core) return false;

  const scripts = collectScripts(core);
  if (scripts.size === 0) return false;

  const hasArabicOrLatin = scripts.has("Arabic") || scripts.has("Latin");
  const hasForeign =
    scripts.has("Cyrillic") ||
    scripts.has("Han") ||
    scripts.has("Japanese") ||
    scripts.has("Hangul");

  // Mixed AR/EN with Cyrillic/CJK in a single token — classic Gemma glitch.
  if (hasArabicOrLatin && hasForeign) return true;

  // Standalone foreign-script tokens are never valid for DevGrow AR/EN replies.
  if (!hasArabicOrLatin && hasForeign) return true;

  return false;
}

/**
 * Clean streamed/final assistant text for display and clipboard.
 * Leaves legitimate Arabic, Latin, digits, and Markdown intact.
 */
export function sanitizeAssistantText(text: string): string {
  if (!text) return text;

  const withoutReplacement = text.replace(/\uFFFD+/g, "");

  const stripped = withoutReplacement
    .split(/(\s+)/u)
    .map((part) => {
      if (/^\s+$/u.test(part)) return part;
      return isGlitchToken(part) ? "" : part;
    })
    .join("");

  return stripped
    .replace(/[^\S\n]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n");
}
