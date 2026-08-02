/**
 * @fileoverview Cung cấp component giao diện tái sử dụng QrCameraScanner và hành vi hiển thị liên quan.
 *
 * Luồng chính: Props đầu vào -> xử lý trạng thái cục bộ khi cần -> trả về phần giao diện tái sử dụng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";

import Button from "../Button/Button";

/**
 * Thực hiện nghiệp vụ `QrCameraScanner` (qr camera scanner). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function QrCameraScanner
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const QrCameraScanner = ({ open, title = "Quét QR", onClose, onScan }) => {
  const videoRef = useRef(null);
  const lastValueRef = useRef("");
  const [message, setMessage] = useState("Đưa mã QR vào giữa khung camera.");

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (!open) return undefined;

    let controls = null;
    let active = true;
    lastValueRef.current = "";

    /**
     * Thực hiện nghiệp vụ `stopCamera` (stop camera). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function stopCamera
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    const stopCamera = () => {
      controls?.stop?.();
    };

    /**
     * Thực hiện nghiệp vụ `startCamera` (start camera). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function startCamera
     * @returns {Promise<*>} Promise chứa kết quả khi toàn bộ thao tác bất đồng bộ hoàn tất.
     */
    const startCamera = async () => {
      try {
        if (!window.navigator?.mediaDevices?.getUserMedia) {
          setMessage("Không mở được camera trên thiết bị này. Bạn vẫn có thể nhập mã bằng tay.");
          return;
        }

        const { BrowserQRCodeReader } = await import("@zxing/browser");
        const codeReader = new BrowserQRCodeReader(undefined, {
          delayBetweenScanAttempts: 250,
          delayBetweenScanSuccess: 700,
        });

        if (!active || !videoRef.current) {
          return;
        }

        setMessage("Đang quét. Giữ mã QR rõ trong khung.");

        const scannerControls = await codeReader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          videoRef.current,
          /* Callback nội bộ của lời gọi `decodeFromConstraints`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
          (result) => {
            const value = (result?.getText?.() || result?.text || "").trim();

            if (value && value !== lastValueRef.current) {
              lastValueRef.current = value;
              onScan(value);
              onClose();
            }
          }
        );

        if (!active) {
          scannerControls.stop();
          return;
        }

        controls = scannerControls;
      } catch {
        setMessage("Không mở được camera. Hãy kiểm tra quyền camera rồi thử lại.");
      }
    };

    startCamera();

    /* Callback nội bộ của biểu thức hiện tại; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return () => {
      active = false;
      stopCamera();
    };
  }, [onClose, onScan, open]);

  if (!open) return null;

  return (
    <div className="qr-scanner-card">
      <div className="qr-scanner-header">
        <strong>
          <Camera size={17} /> {title}
        </strong>
        <Button type="button" size="sm" variant="outline" icon={X} onClick={onClose}>
          Đóng
        </Button>
      </div>

      <div className="qr-scanner-video-wrap">
        <video ref={videoRef} className="qr-scanner-video" muted playsInline />
        <div className="qr-scanner-frame" />
      </div>

      <p className="section-copy">{message}</p>
    </div>
  );
};

export default QrCameraScanner;
