const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Không đọc được ảnh đã chọn."));
    reader.readAsDataURL(file);
  });

const loadImage = (source) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Ảnh này không thể mở được."));
    image.src = source;
  });

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
