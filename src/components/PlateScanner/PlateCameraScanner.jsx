import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Camera, CheckCircle2, ImagePlus, ScanLine, X } from "lucide-react";

import Button from "../Button/Button";
import Input from "../Form/Input";
import {
  clearPlateRecognition,
  recognizePlateRequest,
} from "../../features/backend/parking/parkingSlice";
import { formatPlateNumber } from "../../utils/licensePlate";
import "./PlateCameraScanner.css";

const EMPTY_RECOGNITION = {
  requestId: null,
  plateNumber: "",
  loading: false,
  error: null,
};

const PlateCameraScanner = ({
  open,
  onClose,
  onScan,
  title = "Quét biển số xe",
}) => {
  const dispatch = useDispatch();
  const recognition = useSelector(
    (state) => state.parking.plateRecognition || EMPTY_RECOGNITION
  );
  const fileInputRef = useRef(null);
  const operationRef = useRef(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [editedPlate, setEditedPlate] = useState(null);
  const [localError, setLocalError] = useState("");
  const [currentRequestId, setCurrentRequestId] = useState(0);
  const recognitionMatches = currentRequestId !== 0 && recognition.requestId === currentRequestId;
  const recognizedPlate = recognitionMatches ? recognition.plateNumber : "";
  const plateNumber = editedPlate ?? recognizedPlate;
  const reading = recognitionMatches && recognition.loading;
  const error = localError || (recognitionMatches ? recognition.error : "");
  const progress = recognition.loading && recognitionMatches ? 0.62 : recognizedPlate ? 1 : 0;
  const message = recognition.loading && recognitionMatches
    ? "Hệ thống đang đọc ký tự trên biển số..."
    : recognizedPlate
      ? "Đã đọc được biển số. Hãy kiểm tra lại trước khi sử dụng."
      : recognitionMatches && recognition.requestId && !recognition.error
        ? "Ảnh chưa đủ rõ để nhận diện tự động."
        : "Chụp rõ toàn bộ biển số, tránh lóa sáng và nghiêng ảnh.";

  const resetScanner = () => {
    operationRef.current += 1;
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return "";
    });
    setEditedPlate(null);
    setLocalError("");
    setCurrentRequestId(0);
    dispatch(clearPlateRecognition());
  };

  useEffect(() => () => {
    operationRef.current += 1;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const readPlate = (file) => {
    const operationId = operationRef.current + 1;
    operationRef.current = operationId;
    setCurrentRequestId(operationId);
    setLocalError("");
    setEditedPlate(null);
    dispatch(clearPlateRecognition());
    dispatch(recognizePlateRequest({ file, requestId: operationId }));
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLocalError("Vui lòng chọn một ảnh biển số.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setLocalError("Ảnh lớn hơn 8 MB. Hãy chụp lại ở chất lượng vừa phải.");
      return;
    }

    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    readPlate(file);
  };

  const confirmPlate = () => {
    const formattedPlate = formatPlateNumber(plateNumber);
    if (!formattedPlate) return;

    onScan?.(formattedPlate);
    resetScanner();
    onClose?.();
  };

  const closeScanner = () => {
    resetScanner();
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop plate-scanner-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <section className="card plate-scanner-card">
        <div className="plate-scanner-header">
          <div>
            <span className="page-eyebrow"><ScanLine size={15} /> Nhận diện tự động</span>
            <h2 className="section-title"><Camera size={20} /> {title}</h2>
          </div>
          <button type="button" className="plate-scanner-close" onClick={closeScanner} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        <div className={`plate-scanner-preview ${previewUrl ? "has-image" : ""}`}>
          {previewUrl ? (
            <img src={previewUrl} alt="Ảnh biển số đang nhận diện" />
          ) : (
            <div className="plate-scanner-empty">
              <Camera size={42} />
              <strong>Đặt biển số nằm trọn trong ảnh</strong>
              <span>Ảnh thẳng, đủ sáng và không bị che ký tự.</span>
            </div>
          )}
          <div className="plate-scanner-guide" aria-hidden="true" />
        </div>

        {reading && (
          <div className="plate-scan-progress" aria-live="polite">
            <div className="plate-scan-progress-bar">
              <span style={{ width: `${Math.max(6, Math.round(progress * 100))}%` }} />
            </div>
            <strong>{Math.round(progress * 100)}%</strong>
          </div>
        )}

        <p className="plate-scanner-message">{message}</p>
        {error && <p className="plate-scanner-error">{error}</p>}

        <div className="plate-scanner-result">
          <label htmlFor="recognized-plate">Biển số nhận được</label>
          <Input
            id="recognized-plate"
            value={plateNumber}
            onChange={(event) => setEditedPlate(event.target.value.toUpperCase())}
            placeholder="Ví dụ: 51G-123.45"
            disabled={reading}
          />
        </div>

        <input
          ref={fileInputRef}
          className="plate-scanner-file-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
        />

        <div className="plate-scanner-actions">
          <Button
            type="button"
            variant="secondary"
            icon={ImagePlus}
            onClick={() => fileInputRef.current?.click()}
            disabled={reading}
          >
            {previewUrl ? "Chụp lại" : "Chụp hoặc chọn ảnh"}
          </Button>
          <Button
            type="button"
            variant="primary"
            icon={CheckCircle2}
            onClick={confirmPlate}
            disabled={reading || !plateNumber.trim()}
          >
            Dùng biển số này
          </Button>
        </div>
      </section>
    </div>
  );
};

export default PlateCameraScanner;
