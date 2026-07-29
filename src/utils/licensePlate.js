const DIGIT_REPLACEMENTS = {
  B: "8",
  D: "0",
  G: "6",
  I: "1",
  L: "1",
  O: "0",
  Q: "0",
  S: "5",
  Z: "2",
};

const LETTER_REPLACEMENTS = {
  0: "O",
  1: "I",
  2: "Z",
  5: "S",
  6: "G",
  8: "B",
};

export const normalizePlateSearch = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[.\-\s]/g, "");

const toDigit = (character) =>
  /\d/.test(character) ? character : DIGIT_REPLACEMENTS[character] || "";

const toLetter = (character) =>
  /[A-Z]/.test(character) ? character : LETTER_REPLACEMENTS[character] || "";

const buildCandidate = (source, layout) => {
  if (source.length !== layout.length) return null;

  let value = "";
  let replacements = 0;

  for (let index = 0; index < layout.length; index += 1) {
    const original = source[index];
    const converted = layout[index] === "D" ? toDigit(original) : toLetter(original);

    if (!converted) return null;
    if (converted !== original) replacements += 1;
    value += converted;
  }

  return { replacements, value };
};

export const formatPlateNumber = (value) => {
  const normalized = normalizePlateSearch(value).replace(/[^A-Z0-9]/g, "");

  const motorbikeMatch = normalized.match(/^(\d{2})([A-Z]\d)(\d{5})$/);
  if (motorbikeMatch) {
    const [, province, series, serial] = motorbikeMatch;
    return `${province}-${series}${serial.slice(0, 3)}.${serial.slice(3)}`;
  }

  if (/^\d{2}[A-Z]{1,2}\d{5}$/.test(normalized)) {
    const serial = normalized.slice(-5);
    const prefix = normalized.slice(0, -5);
    return `${prefix}-${serial.slice(0, 3)}.${serial.slice(3)}`;
  }

  return String(value || "").trim().toUpperCase();
};

export const extractPlateNumber = (recognizedText) => {
  const rawText = String(recognizedText || "").toUpperCase();
  const compactLines = rawText
    .split(/\r?\n/)
    .map((line) => line.replace(/[^A-Z0-9]/g, ""))
    .filter(Boolean);
  const compactTokens = rawText
    .split(/[^A-Z0-9]+/)
    .map((token) => token.replace(/[^A-Z0-9]/g, ""))
    .filter(Boolean);
  const allText = rawText.replace(/[^A-Z0-9]/g, "");
  const sources = [...new Set([...compactLines, ...compactTokens, allText])];
  const layouts = ["DDLDDDDDD", "DDLLDDDDD", "DDLDDDDD"];
  const candidates = [];

  sources.forEach((source, sourceIndex) => {
    layouts.forEach((layout) => {
      if (source.length < layout.length) return;

      for (let start = 0; start <= source.length - layout.length; start += 1) {
        const result = buildCandidate(source.slice(start, start + layout.length), layout);
        if (!result) continue;

        candidates.push({
          ...result,
          boundaryPenalty: source.length === layout.length ? 0 : 1,
          sourceIndex,
          start,
        });
      }
    });
  });

  candidates.sort((left, right) =>
    left.boundaryPenalty - right.boundaryPenalty
    || left.replacements - right.replacements
    || left.sourceIndex - right.sourceIndex
    || left.start - right.start
  );

  return candidates[0] ? formatPlateNumber(candidates[0].value) : "";
};
