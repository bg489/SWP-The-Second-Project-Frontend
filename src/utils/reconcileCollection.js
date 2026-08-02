/**
 * @fileoverview Cung cấp hàm hỗ trợ dùng chung của frontend trong reconcileCollection.
 *
 * Luồng chính: Dữ liệu đầu vào -> xử lý theo trách nhiệm của module -> xuất kết quả cho lớp gọi.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
/**
 * Thực hiện nghiệp vụ `valuesEqual` (values equal). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function valuesEqual
 * @param {*} left - Giá trị `left` được hàm sử dụng trong quá trình xử lý.
 * @param {*} right - Giá trị `right` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const valuesEqual = (left, right) => {
  if (Object.is(left, right)) return true;

  if (
    left &&
    right &&
    typeof left === "object" &&
    typeof right === "object"
  ) {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  return false;
};

/**
 * Thực hiện nghiệp vụ `recordsEqual` (records equal). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function recordsEqual
 * @param {*} left - Giá trị `left` được hàm sử dụng trong quá trình xử lý.
 * @param {*} right - Giá trị `right` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const recordsEqual = (left, right) => {
  if (Object.is(left, right)) return true;
  if (!left || !right) return false;

  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(
      /* Callback nội bộ của lời gọi `every`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      (key) =>
        Object.prototype.hasOwnProperty.call(right, key) &&
        valuesEqual(left[key], right[key])
    )
  );
};

/**
 * Thực hiện nghiệp vụ `reconcileCollectionById` (reconcile collection by id). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function reconcileCollectionById
 * @param {*} current - Giá trị `current` được hàm sử dụng trong quá trình xử lý.
 * @param {*} incoming - Giá trị `incoming` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
export const reconcileCollectionById = (current = [], incoming = []) => {
  if (!Array.isArray(incoming)) return current;

  const currentById = new Map(
    /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    current.map((item) => [String(item?.id), item])
  );
  /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const reconciled = incoming.map((item) => {
    const existing = currentById.get(String(item?.id));
    return existing && recordsEqual(existing, item) ? existing : item;
  });
  const unchanged =
    current.length === reconciled.length &&
    /* Callback nội bộ của lời gọi `every`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    current.every((item, index) => item === reconciled[index]);

  return unchanged ? current : reconciled;
};
