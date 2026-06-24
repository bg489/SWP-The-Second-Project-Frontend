import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";

import Button from "../Button/Button";

const QrCameraScanner = ({ open, title = "Quét QR", onClose, onScan }) => {
  const videoRef = useRef(null);
  const lastValueRef = useRef("");
  const [message, setMessage] = useState("Đưa mã QR vào giữa khung camera.");

  useEffect(() => {
    if (!open) return undefined;

    let controls = null;
    let active = true;
    lastValueRef.current = "";

    const stopCamera = () => {
      controls?.stop?.();
    };

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
