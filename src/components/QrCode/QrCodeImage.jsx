import { useMemo } from "react";

import { createQrMatrix } from "../../utils/qrCode";

const QrCodeImage = ({ value, size = 128, className = "", title }) => {
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
    .flatMap((row, y) =>
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
