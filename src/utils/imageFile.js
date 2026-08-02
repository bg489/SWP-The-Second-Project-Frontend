/**
 * @fileoverview Cung cấp hàm hỗ trợ dùng chung của frontend trong imageFile.
 *
 * Luồng chính: Dữ liệu đầu vào -> xử lý theo trách nhiệm của module -> xuất kết quả cho lớp gọi.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
/**
 * Lấy nghiệp vụ `readFileAsDataUrl` (read file as data url). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function readFileAsDataUrl
 * @param {*} file - Giá trị `file` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const readFileAsDataUrl = (file) =>
  /* Callback nội bộ của biểu thức hiện tại; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    /**
     * Xử lý nghiệp vụ `onload` (onload). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
     *
     * @function onload
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    reader.onload = () => resolve(reader.result);
    /**
     * Xử lý nghiệp vụ `onerror` (onerror). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
     *
     * @function onerror
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    reader.onerror = () => reject(new Error("Không đọc được ảnh đã chọn."));
    reader.readAsDataURL(file);
  });

/**
 * Lấy nghiệp vụ `loadImage` (load image). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function loadImage
 * @param {*} source - Giá trị `source` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const loadImage = (source) =>
  /* Callback nội bộ của biểu thức hiện tại; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  new Promise((resolve, reject) => {
    const image = new Image();
    /**
     * Xử lý nghiệp vụ `onload` (onload). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
     *
     * @function onload
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    image.onload = () => resolve(image);
    /**
     * Xử lý nghiệp vụ `onerror` (onerror). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
     *
     * @function onerror
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    image.onerror = () => reject(new Error("Ảnh này không thể mở được."));
    image.src = source;
  });

/**
 * Thực hiện nghiệp vụ `compressImageFile` (compress image file). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
 *
 * @function compressImageFile
 * @param {*} file - Giá trị `file` được hàm sử dụng trong quá trình xử lý.
 * @param {*} options2 - Giá trị `options2` được hàm sử dụng trong quá trình xử lý.
 * @returns {Promise<*>} Promise chứa kết quả khi toàn bộ thao tác bất đồng bộ hoàn tất.
 */
export const compressImageFile = async (
  file,
  { maxWidth = 1400, maxHeight = 1000, maxLength = 900_000 } = {}
) => {
  if (!file?.type?.startsWith("image/")) {
    throw new Error("Vui lòng chọn một ảnh hợp lệ.");
  }

  if (file.size > 12 * 1024 * 1024) {
    throw new Error("Ảnh quá lớn. Vui lòng chụp lại ở chất lượng thấp hơn.");
  }

  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);

  const ratio = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight, 1);
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  let quality = 0.82;
  let result = canvas.toDataURL("image/jpeg", quality);

  while (result.length > maxLength && quality > 0.52) {
    quality -= 0.08;
    result = canvas.toDataURL("image/jpeg", quality);
  }

  if (result.length > maxLength) {
    throw new Error("Ảnh vẫn còn quá lớn. Vui lòng giảm chất lượng ảnh hoặc chụp lại ở khoảng cách phù hợp.");
  }

  return result;
};
