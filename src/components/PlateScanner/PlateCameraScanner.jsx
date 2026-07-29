import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Camera,
  CameraOff,
  CheckCircle2,
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
  rawText: "",
  confidence: 0,
  detectionConfidence: 0,
  ocrConfidence: 0,
  engine: null,
  candidates: [],
  loading: false,
  error: null,
};

const CAMERA_SCAN_DELAY = 1200;
const REQUIRED_MATCHES = 3;
const SAMPLE_WINDOW_SIZE = 6;

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
  const streamRef = useRef(null);
  const operationRef = useRef(0);
  const appliedPlateRef = useRef(null);
  const processedRequestRef = useRef(null);
  const [editedPlate, setEditedPlate] = useState(null);
  const [localError, setLocalError] = useState("");
  const [currentRequestId, setCurrentRequestId] = useState(0);
  const [cameraStatus, setCameraStatus] = useState("idle");
  const [samples, setSamples] = useState([]);
  const recognitionMatches =
    currentRequestId !== 0 && recognition.requestId === currentRequestId;
  const recognizedPlate = recognitionMatches ? recognition.plateNumber : "";
  const consensus = useMemo(() => {
    const groups = new Map();

    samples.forEach((sample) => {
      const key = sample.plateNumber.replace(/[^A-Z0-9]/g, "");
      const current = groups.get(key) || {
        confidenceTotal: 0,
        count: 0,
        plateNumber: sample.plateNumber,
      };
      current.confidenceTotal += sample.confidence;
      current.count += 1;
      groups.set(key, current);
    });

    return [...groups.values()]
      .map((group) => ({
        ...group,
        averageConfidence: group.confidenceTotal / group.count,
      }))
      .sort((left, right) =>
        right.count - left.count
        || right.averageConfidence - left.averageConfidence
      )[0] || null;
  }, [samples]);
  const confirmedPlate = consensus?.count >= REQUIRED_MATCHES
    ? consensus.plateNumber
    : "";
  const candidatePlate = confirmedPlate || consensus?.plateNumber || recognizedPlate;
  const plateNumber = editedPlate ?? candidatePlate;
  const displayedConfidence = consensus?.averageConfidence
    || (recognitionMatches ? Number(recognition.confidence || 0) : 0);
  const reading = recognitionMatches && recognition.loading;
  const error = localError || (recognitionMatches ? recognition.error : "");
  const cameraActive = cameraStatus === "active";
  const editing = editedPlate !== null;

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
    setLocalError("");
    setCameraStatus("starting");
    setCurrentRequestId(0);
    setEditedPlate(null);
    setSamples([]);
    appliedPlateRef.current = null;
    processedRequestRef.current = null;

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("unavailable");
      setLocalError("Thiết bị không mở được camera trực tiếp.");
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
          ? "Camera đang bị chặn. Hãy cấp quyền camera cho trang này."
          : "Không mở được camera sau. Hãy kiểm tra thiết bị rồi thử lại."
      );
    }
  }, [stopCamera]);

  const readPlate = useCallback((file) => {
    const requestId = operationRef.current + 1;
    operationRef.current = requestId;
    setCurrentRequestId(requestId);
    setLocalError("");
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
    appliedPlateRef.current = null;
    processedRequestRef.current = null;
    dispatch(clearPlateRecognition());
    const startTimer = window.setTimeout(startCamera, 0);

    return () => {
      window.clearTimeout(startTimer);
      operationRef.current += 1;
      stopCamera();
    };
  }, [dispatch, open, startCamera, stopCamera]);

  useEffect(() => {
    if (
      !open ||
      !cameraActive ||
      reading ||
      editing ||
      confirmedPlate
    ) {
      return undefined;
    }

    const timer = window.setTimeout(captureFrame, CAMERA_SCAN_DELAY);
    return () => window.clearTimeout(timer);
  }, [
    cameraActive,
    captureFrame,
    currentRequestId,
    editing,
    confirmedPlate,
    open,
    reading,
    recognition.requestId,
  ]);

  useEffect(() => {
    if (
      !recognitionMatches ||
      recognition.loading ||
      !recognizedPlate ||
      processedRequestRef.current === currentRequestId
    ) {
      return;
    }

    const formattedPlate = formatPlateNumber(recognizedPlate);
    if (!formattedPlate) return;

    processedRequestRef.current = currentRequestId;
    const sampleTimer = window.setTimeout(() => {
      setSamples((current) => [
        ...current,
        {
          confidence: Number(recognition.confidence || 0),
          plateNumber: formattedPlate,
          requestId: currentRequestId,
        },
      ].slice(-SAMPLE_WINDOW_SIZE));
    }, 0);

    return () => window.clearTimeout(sampleTimer);
  }, [
    currentRequestId,
    recognition.confidence,
    recognition.loading,
    recognitionMatches,
    recognizedPlate,
  ]);

  useEffect(() => {
    if (
      !consensus ||
      consensus.count < REQUIRED_MATCHES
    ) {
      return;
    }

    if (
      autoApply &&
      appliedPlateRef.current !== consensus.plateNumber
    ) {
      appliedPlateRef.current = consensus.plateNumber;
      onScan?.(consensus.plateNumber);
    }
  }, [autoApply, consensus, onScan]);

  useEffect(() => () => {
    stopCamera();
  }, [stopCamera]);

  const confirmPlate = () => {
    const formattedPlate = formatPlateNumber(plateNumber);
    if (!formattedPlate) return;

    onScan?.(formattedPlate);
    closeScanner();
  };

  const closeScanner = () => {
    operationRef.current += 1;
    stopCamera();
    setCurrentRequestId(0);
    setEditedPlate(null);
    setSamples([]);
    setLocalError("");
    setCameraStatus("idle");
    appliedPlateRef.current = null;
    processedRequestRef.current = null;
    dispatch(clearPlateRecognition());
    onClose?.();
  };

  const scanAgain = () => {
    operationRef.current += 1;
    setCurrentRequestId(0);
    setEditedPlate(null);
    setSamples([]);
    setLocalError("");
    appliedPlateRef.current = null;
    processedRequestRef.current = null;
    dispatch(clearPlateRecognition());
  };

  if (!open) return null;

  const message = reading
    ? "Đang đọc biển số từ khung hình hiện tại..."
    : confirmedPlate
      ? `Đã xác nhận ${confirmedPlate} qua ${REQUIRED_MATCHES} lần quét trùng khớp.`
      : consensus
        ? `Đã khớp ${consensus.count}/${REQUIRED_MATCHES} lần. Giữ camera ổn định thêm một chút.`
      : cameraActive
        ? "Giữ biển số trong khung. Hệ thống sẽ tự đọc liên tục."
        : "Bật camera sau và đưa biển số vào giữa khung.";

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

        <div className={`plate-scanner-preview ${cameraActive ? "has-image" : ""}`}>
          <video
            ref={videoRef}
            className={cameraActive ? "is-visible" : ""}
            autoPlay
            muted
            playsInline
            aria-label="Hình ảnh trực tiếp từ camera"
          />
          {!cameraActive && (
            <div className="plate-scanner-empty">
              {cameraStatus === "starting" ? <RefreshCcw className="spin" size={42} /> : <CameraOff size={42} />}
              <strong>{cameraStatus === "starting" ? "Đang mở camera sau" : "Camera chưa hoạt động"}</strong>
              <span>Đưa camera lại gần để biển số nằm trọn trong khung.</span>
            </div>
          )}
          {cameraActive && <div className="plate-scanner-guide" aria-hidden="true" />}
          {cameraActive && (
            <span className={`plate-scanner-live ${confirmedPlate ? "is-confirmed" : ""}`}>
              <i aria-hidden="true" /> {confirmedPlate ? "Đã xác nhận" : "Đang quét"}
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
            {displayedConfidence > 0 && (
              <span>
                Tin cậy {Math.round(displayedConfidence)}%
                {consensus ? ` · ${Math.min(consensus.count, REQUIRED_MATCHES)}/${REQUIRED_MATCHES} lần` : ""}
              </span>
            )}
          </div>
          <Input
            id="recognized-plate"
            value={plateNumber}
            onChange={(event) => {
              setEditedPlate(event.target.value.toUpperCase());
            }}
            placeholder="Ví dụ: 51G-123.45"
            disabled={reading}
          />
        </div>

        <div className="plate-scanner-actions">
          <Button
            type="button"
            variant="outline"
            icon={cameraActive ? ScanLine : Camera}
            onClick={
              cameraActive
                ? confirmedPlate || editing
                  ? scanAgain
                  : captureFrame
                : startCamera
            }
            disabled={reading || cameraStatus === "starting"}
          >
            {cameraActive
              ? confirmedPlate || editing
                ? "Quét lại"
                : "Đọc ngay"
              : "Bật camera"}
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
