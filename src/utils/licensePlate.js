/**
 * @fileoverview Cung cấp hàm hỗ trợ dùng chung của frontend trong licensePlate.
 *
 * Luồng chính: Dữ liệu đầu vào -> xử lý theo trách nhiệm của module -> xuất kết quả cho lớp gọi.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
/**
 * Khai báo `DIGIT_REPLACEMENTS` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/utils/licensePlate.js.
 */
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

/**
 * Khai báo `LETTER_REPLACEMENTS` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/utils/licensePlate.js.
 */
const LETTER_REPLACEMENTS = {
  0: "O",
  1: "I",
  2: "Z",
  5: "S",
  6: "G",
  8: "B",
};

/**
 * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `normalizePlateSearch` (normalize plate search). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function normalizePlateSearch
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
export const normalizePlateSearch = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[.\-\s]/g, "");

/**
 * Thực hiện nghiệp vụ `toDigit` (to digit). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function toDigit
 * @param {*} character - Giá trị `character` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const toDigit = (character) =>
  /\d/.test(character) ? character : DIGIT_REPLACEMENTS[character] || "";

/**
 * Thực hiện nghiệp vụ `toLetter` (to letter). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function toLetter
 * @param {*} character - Giá trị `character` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const toLetter = (character) =>
  /[A-Z]/.test(character) ? character : LETTER_REPLACEMENTS[character] || "";

/**
 * Tạo nghiệp vụ `buildCandidate` (build candidate). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function buildCandidate
 * @param {*} source - Giá trị `source` được hàm sử dụng trong quá trình xử lý.
 * @param {*} layout - Giá trị `layout` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
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

/**
 * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `formatPlateNumber` (format plate number). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function formatPlateNumber
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
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

/**
 * Thực hiện nghiệp vụ `extractPlateNumber` (extract plate number). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function extractPlateNumber
 * @param {*} recognizedText - Giá trị `recognizedText` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
export const extractPlateNumber = (recognizedText) => {
  const rawText = String(recognizedText || "").toUpperCase();
  const compactLines = rawText
    .split(/\r?\n/)
    /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    .map((line) => line.replace(/[^A-Z0-9]/g, ""))
    .filter(Boolean);
  const compactTokens = rawText
    .split(/[^A-Z0-9]+/)
    /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    .map((token) => token.replace(/[^A-Z0-9]/g, ""))
    .filter(Boolean);
  const allText = rawText.replace(/[^A-Z0-9]/g, "");
  const sources = [...new Set([...compactLines, ...compactTokens, allText])];
  const layouts = ["DDLDDDDDD", "DDLLDDDDD", "DDLDDDDD"];
  const candidates = [];

  /* Callback nội bộ của lời gọi `forEach`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  sources.forEach((source, sourceIndex) => {
    /* Callback nội bộ của lời gọi `forEach`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
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

  /* Callback nội bộ của lời gọi `sort`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  candidates.sort((left, right) =>
    left.boundaryPenalty - right.boundaryPenalty
    || left.replacements - right.replacements
    || left.sourceIndex - right.sourceIndex
    || left.start - right.start
  );

  return candidates[0] ? formatPlateNumber(candidates[0].value) : "";
};
