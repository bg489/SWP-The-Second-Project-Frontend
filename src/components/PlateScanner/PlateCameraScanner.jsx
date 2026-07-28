import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  ImagePlus,
  RefreshCcw,
  ScanLine,
  X,
} from "lucide-react";

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
  confidence: 0,
  loading: false,
  error: null,
};

const CAMERA_SCAN_DELAY = 1200;

const PlateCameraScanner = ({
  autoApply = true,
  open,
  onClose,
  onScan,
  title = "Quét biển số xe",
}) => {
  const dispatch = useDispatch();
  const recognition = useSelector(
    (state) => state.parking.plateRecognition || EMPTY_RECOGNITION
  );
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const operationRef = useRef(0);
  const appliedRequestRef = useRef(null);
  const previewUrlRef = useRef("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [editedPlate, setEditedPlate] = useState(null);
  const [localError, setLocalError] = useState("");
  const [currentRequestId, setCurrentRequestId] = useState(0);
  const [cameraStatus, setCameraStatus] = useState("idle");
  const recognitionMatches =
    currentRequestId !== 0 && recognition.requestId === currentRequestId;
  const recognizedPlate = recognitionMatches ? recognition.plateNumber : "";
  const plateNumber = editedPlate ?? recognizedPlate;
  const reading = recognitionMatches && recognition.loading;
  const error = localError || (recognitionMatches ? recognition.error : "");
  const cameraActive = cameraStatus === "active";

  const replacePreviewUrl = useCallback((nextUrl) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    replacePreviewUrl("");
    setLocalError("");
    setCameraStatus("starting");
    setCurrentRequestId(0);
    setEditedPlate(null);
    appliedRequestRef.current = null;

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("unavailable");
      setLocalError("Thiết bị không mở được camera trực tiếp. Bạn có thể chọn ảnh có sẵn.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          height: { ideal: 720 },
          width: { ideal: 1280 },
        },
      });

      streamRef.current = stream;
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        setCameraStatus("unavailable");
        setLocalError("Camera đã dừng. Hãy bật lại camera để tiếp tục quét.");
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraStatus("active");
    } catch (cameraError) {
      stopCamera();
      setCameraStatus("unavailable");
      setLocalError(
        cameraError?.name === "NotAllowedError"
          ? "Camera đang bị chặn. Hãy cho phép dùng camera hoặc chọn ảnh có sẵn."
          : "Không mở được camera sau. Hãy thử lại hoặc chọn ảnh có sẵn."
      );
    }
  }, [replacePreviewUrl, stopCamera]);

  const readPlate = useCallback((file) => {
    const requestId = operationRef.current + 1;
    operationRef.current = requestId;
    setCurrentRequestId(requestId);
    setLocalError("");
    setEditedPlate(null);
    appliedRequestRef.current = null;
    dispatch(clearPlateRecognition());
    dispatch(recognizePlateRequest({ file, requestId }));
  }, [dispatch]);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (
      !cameraActive ||
      !video ||
      !canvas ||
      reading ||
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      return;
    }

    const sourceWidth = video.videoWidth;
    const sourceHeight = video.videoHeight;
    const cropWidth = sourceWidth * 0.86;
    const cropHeight = sourceHeight * 0.52;
    const sourceX = (sourceWidth - cropWidth) / 2;
    const sourceY = (sourceHeight - cropHeight) / 2;
    const outputWidth = Math.min(1280, Math.round(cropWidth));
    const outputHeight = Math.max(
      280,
      Math.round(outputWidth * (cropHeight / cropWidth))
    );

    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const context = canvas.getContext("2d", { alpha: false });

    if (!context) {
      setLocalError("Không lấy được hình từ camera. Hãy thử bật lại camera.");
      return;
    }

    context.drawImage(
      video,
      sourceX,
      sourceY,
      cropWidth,
      cropHeight,
      0,
      0,
      outputWidth,
      outputHeight
    );
    canvas.toBlob((blob) => {
      if (!blob) {
        setLocalError("Không lấy được hình từ camera. Hãy thử lại.");
        return;
      }

      readPlate(blob);
    }, "image/jpeg", 0.88);
  }, [cameraActive, readPlate, reading]);

  useEffect(() => {
    if (!open) return undefined;

    operationRef.current += 1;
    appliedRequestRef.current = null;
    dispatch(clearPlateRecognition());
    const startTimer = window.setTimeout(startCamera, 0);

    return () => {
      window.clearTimeout(startTimer);
      operationRef.current += 1;
      stopCamera();
      replacePreviewUrl("");
    };
  }, [dispatch, open, replacePreviewUrl, startCamera, stopCamera]);

  useEffect(() => {
    if (
      !open ||
      !cameraActive ||
      reading ||
      recognizedPlate ||
      editedPlate
    ) {
      return undefined;
    }

    const timer = window.setTimeout(captureFrame, CAMERA_SCAN_DELAY);
    return () => window.clearTimeout(timer);
  }, [
    cameraActive,
    captureFrame,
    currentRequestId,
    editedPlate,
    open,
    reading,
    recognition.requestId,
    recognizedPlate,
  ]);

  useEffect(() => {
    if (
      !autoApply ||
      !recognizedPlate ||
      appliedRequestRef.current === currentRequestId
    ) {
      return;
    }

    const formattedPlate = formatPlateNumber(recognizedPlate);
    if (!formattedPlate) return;

    appliedRequestRef.current = currentRequestId;
    onScan?.(formattedPlate);
  }, [autoApply, currentRequestId, onScan, recognizedPlate]);

  useEffect(() => () => {
    stopCamera();
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }
  }, [stopCamera]);

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLocalError("Vui lòng chọn một ảnh biển số.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setLocalError("Ảnh lớn hơn 8 MB. Hãy chọn ảnh có dung lượng nhỏ hơn.");
      return;
    }

    stopCamera();
    setCameraStatus("paused");
    replacePreviewUrl(URL.createObjectURL(file));
    readPlate(file);
  };

  const confirmPlate = () => {
    const formattedPlate = formatPlateNumber(plateNumber);
    if (!formattedPlate) return;

    onScan?.(formattedPlate);
    closeScanner();
  };

  const closeScanner = () => {
    operationRef.current += 1;
    stopCamera();
    replacePreviewUrl("");
    setCurrentRequestId(0);
    setEditedPlate(null);
    setLocalError("");
    setCameraStatus("idle");
    appliedRequestRef.current = null;
    dispatch(clearPlateRecognition());
    onClose?.();
  };

  if (!open) return null;

  const message = reading
    ? "Đang đọc biển số từ khung hình hiện tại..."
    : recognizedPlate
      ? "Đã nhận diện và tự động điền biển số vào biểu mẫu."
      : cameraActive
        ? "Giữ biển số trong khung. Hệ thống sẽ tự đọc liên tục."
        : previewUrl
          ? "Đã lấy ảnh. Hệ thống đang tìm biển số trong ảnh."
          : "Bật camera sau hoặc chọn một ảnh biển số có sẵn.";

  return createPortal(
    <div
      className="modal-backdrop plate-scanner-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <section className="card plate-scanner-card">
        <div className="plate-scanner-header">
          <div>
            <span className="page-eyebrow"><ScanLine size={15} /> Camera nhận diện trực tiếp</span>
            <h2 className="section-title"><Camera size={20} /> {title}</h2>
          </div>
          <button
            type="button"
            className="plate-scanner-close"
            onClick={closeScanner}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <div className={`plate-scanner-preview ${cameraActive || previewUrl ? "has-image" : ""}`}>
          <video
            ref={videoRef}
            className={cameraActive ? "is-visible" : ""}
            autoPlay
            muted
            playsInline
            aria-label="Hình ảnh trực tiếp từ camera"
          />
          {previewUrl && !cameraActive && (
            <img src={previewUrl} alt="Ảnh biển số đang nhận diện" />
          )}
          {!cameraActive && !previewUrl && (
            <div className="plate-scanner-empty">
              {cameraStatus === "starting" ? <RefreshCcw className="spin" size={42} /> : <CameraOff size={42} />}
              <strong>{cameraStatus === "starting" ? "Đang mở camera sau" : "Camera chưa hoạt động"}</strong>
              <span>Đưa camera lại gần để biển số nằm trọn trong khung.</span>
            </div>
          )}
          {(cameraActive || previewUrl) && <div className="plate-scanner-guide" aria-hidden="true" />}
          {cameraActive && (
            <span className="plate-scanner-live">
              <i aria-hidden="true" /> Đang quét
            </span>
          )}
        </div>

        <canvas ref={canvasRef} className="plate-scanner-canvas" />

        {reading && (
          <div className="plate-scan-progress" aria-live="polite">
            <div className="plate-scan-progress-bar"><span /></div>
            <strong>Đang đọc</strong>
          </div>
        )}

        <p className="plate-scanner-message">{message}</p>
        {error && <p className="plate-scanner-error">{error}</p>}

        <div className="plate-scanner-result">
          <div className="plate-scanner-result-label">
            <label htmlFor="recognized-plate">Biển số nhận được</label>
            {recognitionMatches && recognition.confidence > 0 && (
              <span>Độ rõ {Math.round(recognition.confidence)}%</span>
            )}
          </div>
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
          onChange={handleFile}
        />

        <div className="plate-scanner-actions">
          <Button
            type="button"
            variant="outline"
            icon={cameraActive ? ScanLine : Camera}
            onClick={cameraActive ? captureFrame : startCamera}
            disabled={reading || cameraStatus === "starting"}
          >
            {cameraActive ? "Đọc ngay" : "Bật camera"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            icon={ImagePlus}
            onClick={() => fileInputRef.current?.click()}
            disabled={reading}
          >
            Chọn ảnh
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
    </div>,
    document.body
  );
};

export default PlateCameraScanner;
