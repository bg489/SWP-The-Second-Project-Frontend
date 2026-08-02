/**
 * @fileoverview Cung cấp component giao diện tái sử dụng QrCodeImage và hành vi hiển thị liên quan.
 *
 * Luồng chính: Props đầu vào -> xử lý trạng thái cục bộ khi cần -> trả về phần giao diện tái sử dụng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useMemo } from "react";

import { createQrMatrix } from "../../utils/qrCode";

/**
 * Thực hiện nghiệp vụ `QrCodeImage` (qr code image). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function QrCodeImage
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const QrCodeImage = ({ value, size = 128, className = "", title }) => {
  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const matrix = useMemo(() => {
    try {
      return createQrMatrix(value);
    } catch {
      return null;
    }
  }, [value]);

  if (!matrix) {
    return (
      <div className={`qr-image qr-image-error ${className}`} style={{ width: size, height: size }}>
        Mã quá dài
      </div>
    );
  }

  const quietZone = 4;
  const viewBoxSize = matrix.length + quietZone * 2;
  const path = matrix
    /* Callback nội bộ của lời gọi `flatMap`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    .flatMap((row, y) =>
      /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      row.map((isDark, x) => (isDark ? `M${x + quietZone} ${y + quietZone}h1v1h-1z` : ""))
    )
    .filter(Boolean)
    .join("");

  return (
    <svg
      className={`qr-image ${className}`}
      width={size}
      height={size}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      role="img"
      aria-label={title || `QR ${value}`}
      shapeRendering="crispEdges"
    >
      <title>{title || `QR ${value}`}</title>
      <rect width={viewBoxSize} height={viewBoxSize} fill="#fff" />
      <path d={path} fill="#171217" />
    </svg>
  );
};

export default QrCodeImage;
