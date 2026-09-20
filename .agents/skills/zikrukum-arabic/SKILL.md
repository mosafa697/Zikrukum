---
name: zikrukum-arabic
description: Ensure Zikrukum Arabic texts and zikr follow Arabic grammar rules and full tashkil. Use when adding or editing UI strings or dataset phrases.
---

## What I do
- Enforce correct Arabic grammar, orthography, and **full vocalization (tashkil)** on every Arabic string in the app.
- Cover both surfaces: UI copy in `src/i18n/ar.ts` and the zikr corpus in `src/dataset/azkar.json`.
- Protect authenticated wording: verify against trusted sources, never rewrite from memory.

## When to use me
Use when adding or editing any Arabic text: UI strings, category titles, phrases, subtexts (virtues), notification/milestone copy, verse/hadith banners, or dataset entries. Also use when reviewing a diff that touches Arabic text.

## Sources of truth
- UI copy: `src/i18n/ar.ts` is the source of truth; look up with `t('key')` from `src/i18n/index.ts`. Never hardcode Arabic strings in screens/components.
- Zikr corpus: `src/dataset/azkar.json` (merged 135-cat union; raw: `[{ id, category, array: [{ id, text, count, subtext?, filename? }] }]`) mapped by `src/mappers/azkarMapper.ts` to typed `AzkarCategory[]` / `AzkarPhrase`.
- Wording authority: Hisn al-Muslim (Fortress of the Muslim) for zikr wording; the Uthmani mushaf for Quranic verses. When in doubt, leave the text unchanged and flag it in the issue instead of guessing.

## Full tashkil rules
- Vocalize fully: every consonant that takes a mark carries it — fatha, damma, kasra, sukun, shadda (+ its vowel), tanween (ً ٌ ٍ), and madd/waqf marks where the source has them.
- Order marks canonically: shadda first, then the vowel (e.g. `اللَّهُ`, not `اللّهُ` with split marks).
- Keep tanween on the alef pattern used by the source; do not "modernize" tanween placement across the corpus in a single edit.
- Never strip diacritics for a "cleaner look". If a phrase arrives without tashkil, add it from the trusted source or flag it as unvocalized — do not ship it half-vocalized.
- Religious UI phrases get the same treatment as zikr: `بسم الله الرحمن الرحيم` preview, verse/hadith banners, reminder and milestone copy that quotes a dhikr.

## Orthography (meaning-preserving only)
- Alef variants: `أ / إ / آ / ا` per standard spelling (e.g. `أذكار`, `إعدادات`, `آية`).
- Hamza seats: `ؤ / ئ / ء` (e.g. `مؤمن`, `شَيْء`).
- Ta-marbuta vs ha: `ة` vs `ه` (e.g. `فئة` not `فئه`).
- Alef-maqsura vs ya: `ى` vs `ي` (e.g. `على` not `علي`).
- Honorifics: `ﷺ` after the Prophet's name, `تعالى` / `عز وجل` where the source uses them. Do not add or remove honorifics from authenticated zikr.
- Stop rule: if a fix could change the authenticated wording (not just spelling), do not make it — flag it for Hisn al-Muslim verification.

## Whitespace and punctuation
- Trim leading/trailing spaces per line; collapse double spaces and tabs (prior art: issue #9 cleanup).
- No ` \n` / `\n ` artifacts; at most one consecutive blank line (`\n\n` max).
- Arabic punctuation: `، ؛ ؟` without a preceding space; Quranic ornaments `﴿ ﴾` hug their content.
- Keep the existing `\n` line-break structure of long phrases (verse blocks, repeated `بسم الله الرحمن الرحيم` sections) — reflow only when the source dictates it.

## Numbers and refs
- Counters and counts render Western digits via `formatNumber()` (Hindi conversion is disabled) — do not hardcode Hindi digits in new strings.
- Verse/hadith refs keep their established style (e.g. `سورة الرعد — آية ٢٨`, `صحيح البخاري 7405`); flag digit-style inconsistency in review rather than mass-changing refs here.

## Fonts and RTL (see zikrukum-theming, not duplicated)
- Body/religious text renders in `ScheherazadeNew` (Regular-only — never rely on `fontWeight: bold`); numeric counters use `TajawalBold`. Full tashkil is a shaping test: verify shadda/vowel stacks render cleanly at min/max fontScale steps.
- RTL plumbing (`I18nManager.forceRTL` native, `scaleX: -1` mirror on web) is owned by `zikrukum-theming`; this skill only ensures the text itself is grammatically RTL-clean (no stray Latin punctuation order issues).

## What NOT to do
- Do not touch Uthmani-script Quranic verses to "normalize" them (e.g. `ٱلۡحَمۡدُ`, `ٱلصِّرَٰطَ`) — verbatim preservation beats uniformity.
- Do not reword zikr for style, brevity, or dialect. MSA + classical dhikr register only.
- Do not add network spellcheckers or new dependencies — the app stays fully offline-capable.
- Do not bundle dataset re-vocalization with unrelated features; a corpus-wide tashkil audit is its own data task (phrase `filename` fields must stay intact).

## Verification checklist
- [ ] Read the full diff of every touched Arabic string (UI key + dataset `text`/`subtext`/`category`).
- [ ] Full tashkil present on new/edited zikr and religious UI phrases; shadda+vowel order correct.
- [ ] No whitespace artifacts (`\n\n\n`, double spaces, ` \n`); blank lines capped at one.
- [ ] New UI copy lives in `ar.ts` behind `t()`; no hardcoded Arabic in screens/components.
- [ ] `npm run lint` and `npx tsc --noEmit` clean.
