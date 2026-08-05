/**
 * @fileoverview Xây dựng màn hình CheckInQRPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowDownLeft, Camera, Car, Layers, QrCode, ShieldCheck } from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import PlateCameraScanner from "../../components/PlateScanner/PlateCameraScanner";
import QrCameraScanner from "../../components/QrScanner/QrCameraScanner";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import useResetAfterSuccess from "../../hooks/useResetAfterSuccess";
import {
  checkInRequest,
  clearHourlyCheckInMatch,
  clearParkingNotice,
  fetchHourlyCheckInMatchRequest,
  fetchActiveParkingSessionsRequest,
  fetchTempQrCardsRequest,
  validateQrPassRequest,
} from "../backend/parking/parkingSlice";
import { fetchBuildingsRequest } from "../backend/buildings/buildingSlice";
import { fetchFloorsRequest } from "../backend/floors/floorSlice";
import { fetchSlotsByFloorRequest } from "../backend/slots/slotSlice";
import {
  formatDateTime,
  getStatusLabel,
  getStatusTone,
  getVehicleTypeLabel,
} from "../../services/mockParkingData";

/**
 * Thực hiện nghiệp vụ `slotClassName` (slot class name). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function slotClassName
 * @param {*} status - Giá trị `status` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const slotClassName = (status) => String(status || "AVAILABLE").toLowerCase();
/**
 * Lấy nghiệp vụ `getCarSlotCount` (get car slot count). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getCarSlotCount
 * @param {*} floor - Giá trị `floor` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getCarSlotCount = (floor) => Number(
  floor?.slotCount ??
  floor?.slotsCount ??
  floor?.slot_count ??
  floor?.slots?.length ??
  0
);

/**
 * Kiểm tra nghiệp vụ `CheckInQRPage` (check in qrpage). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function CheckInQRPage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const CheckInQRPage = () => {
  const dispatch = useDispatch();
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { user } = useSelector((state) => state.auth);
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { hourlyReservations, parkingSessions, qrPasses, tempQrCards, notice } = useSelector((state) => state.parking);
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { buildings, error: buildingsError } = useSelector((state) => state.buildings);
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { floors, loading: floorsLoading, error: floorsError } = useSelector((state) => state.floors);
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { slotsByFloor, loading: slotsLoading, error: slotsError } = useSelector((state) => state.slots);

  const [form, setForm] = useState({
    plateNumber: "",
    vehicleType: "CAR",
    customerType: "WALK_IN_GUEST",
    qrCode: "",
    tempQrCardCode: "",
    slotId: "",
  });
  const [selectedCarFloorId, setSelectedCarFloorId] = useState("");
  const [selectedMotorbikeFloorId, setSelectedMotorbikeFloorId] = useState("");
  const [scannerTarget, setScannerTarget] = useState("");
  const [plateScannerOpen, setPlateScannerOpen] = useState(false);
  const [formError, setFormError] = useState("");

  const currentBuildingId = user?.buildingId;
  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const currentBuilding = useMemo(() => {
    /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return buildings.find((building) => Number(building.id) === Number(currentBuildingId)) || {
      id: currentBuildingId,
      name: user?.buildingName || "Chưa có tòa nhà",
      address: user?.buildingAddress || "",
    };
  }, [buildings, currentBuildingId, user?.buildingAddress, user?.buildingName]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const buildingFloors = useMemo(() => {
    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return floors.filter((floor) => Number(floor.buildingId) === Number(currentBuildingId));
  }, [floors, currentBuildingId]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const motorbikeFloors = useMemo(() => {
    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return buildingFloors.filter((floor) => floor.floorType === "MOTORBIKE" && floor.status === "ACTIVE");
  }, [buildingFloors]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const carFloors = useMemo(() => {
    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return buildingFloors.filter((floor) => floor.floorType === "CAR" && floor.status === "ACTIVE");
  }, [buildingFloors]);

  const isQrPassValid = Boolean(
    qrPasses.validation?.valid || qrPasses.validation?.isValid
  );
  const validQrPass = isQrPassValid
    ? qrPasses.validation.qrPass || qrPasses.validation.pass
    : null;
  const monthlyQrPlateNumber = String(validQrPass?.plateNumber || "")
    .trim()
    .toUpperCase();
  const validatedQrVehicleType = String(validQrPass?.vehicleType || "")
    .trim()
    .toUpperCase();
  const hasValidatedVehicleQr = Boolean(
    isQrPassValid &&
    ["CAR", "MOTORBIKE"].includes(validatedQrVehicleType) &&
    monthlyQrPlateNumber
  );
  const effectivePlateNumber = hasValidatedVehicleQr
    ? monthlyQrPlateNumber
    : form.plateNumber;
  const effectiveVehicleType = hasValidatedVehicleQr
    ? validatedQrVehicleType
    : form.vehicleType;
  const registeredReservedSlotId = validQrPass?.slotId ? String(validQrPass.slotId) : "";
  const registeredSlotFloorId = validQrPass?.slotFloorId ? String(validQrPass.slotFloorId) : "";
  const hourlyReservation = hourlyReservations.checkInMatch;
  const hourlyReservedSlotId = hourlyReservation?.slotId ? String(hourlyReservation.slotId) : "";
  const hourlySlotFloorId = hourlyReservation?.floorId ? String(hourlyReservation.floorId) : "";
  const effectiveCarFloorId =
    hourlySlotFloorId ||
    (form.customerType === "REGISTERED_USER" && registeredSlotFloorId ? registeredSlotFloorId : "") ||
    selectedCarFloorId ||
    (carFloors[0]?.id ? String(carFloors[0].id) : "");
  /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const firstAvailableMotorbikeFloor = motorbikeFloors.find((floor) => Number(floor.currentCount || 0) < Number(floor.capacity || 0));
  const effectiveMotorbikeFloorId = selectedMotorbikeFloorId || (firstAvailableMotorbikeFloor?.id ? String(firstAvailableMotorbikeFloor.id) : "");

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    dispatch(fetchBuildingsRequest());
  }, [dispatch]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (!currentBuildingId) return;

    dispatch(fetchFloorsRequest({ buildingId: currentBuildingId, status: "ACTIVE", limit: 100 }));
    dispatch(fetchActiveParkingSessionsRequest({ buildingId: currentBuildingId }));
    dispatch(fetchTempQrCardsRequest({ buildingId: currentBuildingId, status: "READY" }));
  }, [currentBuildingId, dispatch]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (!effectiveCarFloorId) return;
    dispatch(fetchSlotsByFloorRequest({ floorId: effectiveCarFloorId }));
  }, [dispatch, effectiveCarFloorId]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    const plateNumber = effectivePlateNumber.trim();

    if (
      effectiveVehicleType !== "CAR" ||
      plateNumber.length < 4 ||
      !currentBuildingId
    ) {
      dispatch(clearHourlyCheckInMatch());
      return undefined;
    }

    /* Callback nội bộ của lời gọi `setTimeout`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    const timer = window.setTimeout(() => {
      dispatch(
        fetchHourlyCheckInMatchRequest({
          buildingId: Number(currentBuildingId),
          plateNumber,
        })
      );
    }, 450);

    /* Callback nội bộ của biểu thức hiện tại; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return () => window.clearTimeout(timer);
  }, [currentBuildingId, dispatch, effectivePlateNumber, effectiveVehicleType]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (!currentBuildingId) return undefined;

    /* Callback nội bộ của lời gọi `setInterval`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    const timer = window.setInterval(() => {
      dispatch(fetchFloorsRequest({
        buildingId: currentBuildingId,
        silent: true,
        status: "ACTIVE",
        limit: 100,
      }));
      dispatch(fetchActiveParkingSessionsRequest({
        buildingId: currentBuildingId,
        silent: true,
      }));
      dispatch(fetchTempQrCardsRequest({
        buildingId: currentBuildingId,
        silent: true,
        status: "READY",
      }));
      if (effectiveCarFloorId) {
        dispatch(fetchSlotsByFloorRequest({
          floorId: effectiveCarFloorId,
          silent: true,
        }));
      }
    }, 5000);

    /* Callback nội bộ của biểu thức hiện tại; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return () => window.clearInterval(timer);
  }, [currentBuildingId, dispatch, effectiveCarFloorId]);

  /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const readyCards = tempQrCards.items.filter((card) => card.status === "READY");
  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const currentCarSlots = useMemo(() => {
    return effectiveCarFloorId ? slotsByFloor[effectiveCarFloorId] || [] : [];
  }, [effectiveCarFloorId, slotsByFloor]);
  const isRegisteredCustomer = form.customerType === "REGISTERED_USER";
  /**
   * Kiểm tra nghiệp vụ `isSelectableCarSlot` (is selectable car slot). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function isSelectableCarSlot
   * @param {*} slot - Giá trị `slot` được hàm sử dụng trong quá trình xử lý.
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const isSelectableCarSlot = (slot) =>
    (Boolean(hourlyReservedSlotId) &&
      ["AVAILABLE", "RESERVED"].includes(slot.status) &&
      String(slot.id) === hourlyReservedSlotId) ||
    (!isRegisteredCustomer && slot.status === "AVAILABLE") ||
    (isRegisteredCustomer &&
      Boolean(registeredReservedSlotId) &&
      ["AVAILABLE", "RESERVED"].includes(slot.status) &&
      String(slot.id) === registeredReservedSlotId);
  const selectableCarSlots = currentCarSlots.filter(isSelectableCarSlot);
  /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const availableCarSlots = currentCarSlots.filter((slot) => slot.status === "AVAILABLE");
  const preferredCarSlot = registeredReservedSlotId
    /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    ? selectableCarSlots.find((slot) => String(slot.id) === registeredReservedSlotId)
    : null;
  const hourlyPreferredCarSlot = hourlyReservedSlotId
    /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    ? selectableCarSlots.find((slot) => String(slot.id) === hourlyReservedSlotId)
    : null;
  const fallbackCarSlot = isRegisteredCustomer && !hourlyReservation ? null : selectableCarSlots[0];
  /* Callback nội bộ của lời gọi `some`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const formSlotStillAvailable = selectableCarSlots.some((slot) => String(slot.id) === String(form.slotId));
  const selectedCarSlotId = String(
    (formSlotStillAvailable
      ? form.slotId
      : hourlyPreferredCarSlot?.id || preferredCarSlot?.id || fallbackCarSlot?.id) || ""
  );
  /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const selectedSlot = currentCarSlots.find((slot) => String(slot.id) === selectedCarSlotId);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const motorbikeFloor = useMemo(() => {
    /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return motorbikeFloors.find((floor) => String(floor.id) === String(effectiveMotorbikeFloorId));
  }, [effectiveMotorbikeFloorId, motorbikeFloors]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const motorbikeCapacity = useMemo(() => {
    return motorbikeFloors.reduce(
      /* Callback nội bộ của lời gọi `reduce`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      (sum, floor) => ({
        capacity: sum.capacity + Number(floor.capacity || 0),
        current: sum.current + Number(floor.currentCount || 0),
      }),
      { capacity: 0, current: 0 }
    );
  }, [motorbikeFloors]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const carSummary = useMemo(() => {
    return currentCarSlots.reduce(
      /* Callback nội bộ của lời gọi `reduce`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      (sum, slot) => {
        const status = slot.status || "AVAILABLE";
        return {
          ...sum,
          total: sum.total + 1,
          available: sum.available + (status === "AVAILABLE" ? 1 : 0),
          occupied: sum.occupied + (status === "OCCUPIED" ? 1 : 0),
          reserved: sum.reserved + (status === "RESERVED" ? 1 : 0),
        };
      },
      { total: 0, available: 0, occupied: 0, reserved: 0 }
    );
  }, [currentCarSlots]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const tempQrOptions = useMemo(() => {
    /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    const options = readyCards.map((card) => ({
      value: card.cardCode || card.id,
      label: `${card.cardCode || card.id} - ${card.label || "Sẵn sàng"}`,
    }));
    const selectedCode = form.tempQrCardCode ||
      readyCards[0]?.cardCode ||
      (readyCards[0]?.id ? String(readyCards[0].id) : "");

    /* Callback nội bộ của lời gọi `some`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    if (selectedCode && !options.some((option) => option.value === selectedCode)) {
      options.unshift({
        value: selectedCode,
        label: `${selectedCode} - Đang chọn`,
      });
    }

    return options;
  }, [form.tempQrCardCode, readyCards]);
  const effectiveTempQrCardCode = form.tempQrCardCode ||
    readyCards[0]?.cardCode ||
    (readyCards[0]?.id ? String(readyCards[0].id) : "");

  /**
   * Cập nhật nghiệp vụ `updateForm` (update form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function updateForm
   * @param {*} field - Giá trị `field` được hàm sử dụng trong quá trình xử lý.
   * @param {*} value - Giá trị đầu vào cần xử lý.
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const updateForm = (field, value) => {
    dispatch(clearParkingNotice());
    setFormError("");
    /* Callback nội bộ của lời gọi `setForm`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "vehicleType" && value === "MOTORBIKE") {
        next.slotId = "";
      }
      if (field === "vehicleType" && value === "CAR" && !next.slotId) {
        next.slotId = String(availableCarSlots[0]?.id || "");
      }
      return next;
    });
  };

  const markCheckInSubmitted = useResetAfterSuccess({
    submitting: parkingSessions.checkingIn,
    success: parkingSessions.lastCheckIn,
    error: parkingSessions.error,
    /**
     * Xử lý nghiệp vụ `onSuccess` (on success). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function onSuccess
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    onSuccess: () => {
      setForm({
        plateNumber: "",
        vehicleType: "CAR",
        customerType: "WALK_IN_GUEST",
        qrCode: "",
        tempQrCardCode: "",
        slotId: "",
      });
      setSelectedCarFloorId("");
      setSelectedMotorbikeFloorId("");
      setScannerTarget("");
      setPlateScannerOpen(false);
      setFormError("");
      dispatch(clearHourlyCheckInMatch());

      if (currentBuildingId) {
        dispatch(fetchFloorsRequest({
          buildingId: currentBuildingId,
          silent: true,
          status: "ACTIVE",
          limit: 100,
        }));
        dispatch(fetchActiveParkingSessionsRequest({
          buildingId: currentBuildingId,
          silent: true,
        }));
        dispatch(fetchTempQrCardsRequest({
          buildingId: currentBuildingId,
          silent: true,
          status: "READY",
        }));
      }
      if (effectiveCarFloorId) {
        dispatch(fetchSlotsByFloorRequest({
          floorId: effectiveCarFloorId,
          silent: true,
        }));
      }
    },
  });

  /**
   * Kiểm tra nghiệp vụ `validateQr` (validate qr). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function validateQr
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const validateQr = () => {
    if (!form.qrCode.trim()) return;
    dispatch(validateQrPassRequest({ buildingId: currentBuildingId, qrCode: form.qrCode.trim() }));
  };

  /**
   * Hiển thị nghiệp vụ `openScanner` (open scanner). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function openScanner
   * @param {*} target - Giá trị `target` được hàm sử dụng trong quá trình xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const openScanner = (target) => {
    setScannerTarget(target);
  };

  /**
   * Xử lý nghiệp vụ `handleQrScan` (handle qr scan). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handleQrScan
   * @param {*} value - Giá trị đầu vào cần xử lý.
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const handleQrScan = (value) => {
    const scannedValue = value.trim();

    if (!scannedValue) return;

    if (scannerTarget === "MONTHLY") {
      dispatch(clearParkingNotice());
      setFormError("");
      /* Callback nội bộ của lời gọi `setForm`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      setForm((prev) => ({
        ...prev,
        plateNumber: "",
        qrCode: scannedValue,
      }));
      dispatch(validateQrPassRequest({ buildingId: currentBuildingId, qrCode: scannedValue }));
      return;
    }

    updateForm("tempQrCardCode", scannedValue.toUpperCase());
  };

  /**
   * Thực hiện nghiệp vụ `submitCheckIn` (submit check in). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function submitCheckIn
   * @param {*} event - Sự kiện phát sinh từ thao tác của người dùng.
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const submitCheckIn = (event) => {
    event.preventDefault();
    setFormError("");

    if (!currentBuildingId) {
      setFormError("Tài khoản nhân viên chưa được gắn tòa nhà.");
      return;
    }

    const payload = {
      plateNumber: effectivePlateNumber.trim().toUpperCase(),
      vehicleType: effectiveVehicleType,
      buildingId: Number(currentBuildingId),
    };

    if (form.customerType === "REGISTERED_USER") {
      payload.qrCode = form.qrCode.trim();
    } else {
      const selectedTempCard = readyCards.find(
        /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        (card) =>
          String(card.cardCode || card.id) === String(effectiveTempQrCardCode)
      );

      if (selectedTempCard?.cardCode) {
        payload.tempQrCardCode = selectedTempCard.cardCode;
      } else if (selectedTempCard?.id) {
        payload.tempQrCardId = Number(selectedTempCard.id);
      } else if (effectiveTempQrCardCode) {
        payload.tempQrCardCode = effectiveTempQrCardCode;
      }
    }

    if (effectiveVehicleType === "CAR") {
      if (hourlyReservedSlotId) {
        payload.slotId = Number(hourlyReservedSlotId);
      }

      if (isRegisteredCustomer) {
        if (!payload.slotId && registeredReservedSlotId) {
          payload.slotId = Number(selectedCarSlotId || registeredReservedSlotId);
        }
      } else if (!payload.slotId) {
        payload.slotId = Number(form.slotId || selectedCarSlotId);
      }

      if (!isRegisteredCustomer && !hourlyReservation && !payload.slotId) {
        setFormError("Tòa nhà hiện tại chưa còn ô ô tô trống để nhận xe.");
        return;
      }
    } else if (motorbikeFloor?.id) {
      if (Number(motorbikeFloor.currentCount || 0) >= Number(motorbikeFloor.capacity || 0)) {
        setFormError("Tầng xe máy đang chọn đã hết chỗ.");
        return;
      }
      payload.floorId = Number(motorbikeFloor.id);
    } else {
      setFormError("Khu xe máy của tòa nhà hiện tại đã hết chỗ.");
      return;
    }

    markCheckInSubmitted();
    dispatch(checkInRequest(payload));
  };

  const columns = [
    { header: "Lượt gửi", key: "id" },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Biển số", key: "plateNumber", render: (row) => <strong>{row.plateNumber}</strong> },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Loại xe", key: "vehicleType", render: (row) => getVehicleTypeLabel(row.vehicleType) },
    {
      header: "Thẻ QR",
      key: "sessionQrCode",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => row.tempQrCardCode || row.sessionQrCode || row.qrCode || "-",
    },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Vị trí", key: "slotCode", render: (row) => row.slotCode || "Khu xe máy" },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Giờ vào", key: "checkInAt", render: (row) => formatDateTime(row.checkInAt) },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><ArrowDownLeft size={16} /> Xe vào bãi</div>
          <h1 className="page-title">Quét QR, nhập biển số và ghi nhận xe vào</h1>
          <p className="page-subtitle">
            Cư dân dùng mã QR tháng. Khách vãng lai nhận thẻ QR tạm do nhân viên phát.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">QR tạm sẵn sàng</span>
          <span className="page-hero-number">{readyCards.length}</span>
          <span className="page-hero-label">thẻ</span>
        </div>
      </section>

      <section className="card soft-panel">
        <div className="data-row">
          <span>Tòa nhà đang nhận xe</span>
          <strong>{currentBuilding?.name || "Chưa có tòa nhà"}</strong>
        </div>
        <div className="data-row">
          <span>Địa chỉ</span>
          <strong>{currentBuilding?.address || "Chưa có địa chỉ"}</strong>
        </div>
        <div className="data-row">
          <span>Sức chứa xe máy</span>
          <strong>{motorbikeCapacity.current}/{motorbikeCapacity.capacity}</strong>
        </div>
        <div className="data-row">
          <span>Ô ô tô trống</span>
          <strong>{carSummary.available}/{carSummary.total}</strong>
        </div>
      </section>

      <StatusBanner
        success={notice}
        errors={[
          formError,
          parkingSessions.error,
          qrPasses.error,
          tempQrCards.error,
          buildingsError,
          floorsError,
          slotsError,
        ]}
      />

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><QrCode size={19} /> Thông tin xe vào</h2>
              <p className="section-copy">Nhập biển số, chọn loại khách và thẻ phù hợp trước khi cho xe vào.</p>
            </div>
          </div>
          <form onSubmit={submitCheckIn} style={{ display: "grid", gap: 14 }}>
            <FormField label="Biển số xe" required>
              <div className="plate-input-row">
                <Input
                  value={effectivePlateNumber}
                  onChange={(event) => updateForm("plateNumber", event.target.value.toUpperCase())}
                  placeholder="Ví dụ: 51G-123.45"
                  readOnly={hasValidatedVehicleQr}
                />
                <Button type="button" variant="secondary" icon={Camera} onClick={() => setPlateScannerOpen(true)}>
                  Quét biển số
                </Button>
              </div>
            </FormField>
            <FormField label="Loại xe">
              <Select
                value={effectiveVehicleType}
                onChange={(event) => updateForm("vehicleType", event.target.value)}
                disabled={hasValidatedVehicleQr}
                options={[
                  { value: "MOTORBIKE", label: "Xe máy" },
                  { value: "CAR", label: "Ô tô" },
                ]}
                placeholder={null}
              />
            </FormField>
            <FormField label="Loại khách">
              <Select
                value={form.customerType}
                onChange={(event) => updateForm("customerType", event.target.value)}
                options={[
                  { value: "REGISTERED_USER", label: "Cư dân có gói tháng" },
                  { value: "WALK_IN_GUEST", label: "Khách gửi lẻ" },
                ]}
                placeholder={null}
              />
            </FormField>

            {form.customerType === "REGISTERED_USER" ? (
              <FormField label="Mã QR tháng">
                <div style={{ display: "grid", gap: 10 }}>
                  <Input value={form.qrCode} onChange={(event) => updateForm("qrCode", event.target.value)} placeholder="Dán hoặc nhập mã QR" />
                  <Button type="button" variant="secondary" icon={Camera} onClick={() => openScanner("MONTHLY")}>
                    Quét bằng camera
                  </Button>
                  <Button type="button" variant="outline" icon={ShieldCheck} onClick={validateQr} loading={qrPasses.validating}>
                    Kiểm tra mã QR
                  </Button>
                  <QrCameraScanner
                    open={scannerTarget === "MONTHLY"}
                    title="Quét QR tháng"
                    onClose={() => setScannerTarget("")}
                    onScan={handleQrScan}
                  />
                </div>
              </FormField>
            ) : (
              <FormField label="Thẻ QR tạm">
                <div style={{ display: "grid", gap: 10 }}>
                  <Select
                    value={effectiveTempQrCardCode}
                    onChange={(event) => updateForm("tempQrCardCode", event.target.value)}
                    options={tempQrOptions}
                    placeholder="Chọn thẻ QR tạm"
                  />
                  <Button type="button" variant="secondary" icon={Camera} onClick={() => openScanner("TEMP")}>
                    Quét bằng camera
                  </Button>
                  <QrCameraScanner
                    open={scannerTarget === "TEMP"}
                    title="Quét QR tạm"
                    onClose={() => setScannerTarget("")}
                    onScan={handleQrScan}
                  />
                </div>
              </FormField>
            )}

            {effectiveVehicleType === "MOTORBIKE" && (
              <FormField label="Tầng xe máy">
                <Select
                  value={effectiveMotorbikeFloorId}
                  onChange={(event) => setSelectedMotorbikeFloorId(event.target.value)}
                  options={motorbikeFloors.map((floor) => ({
                    value: floor.id,
                    label: `${floor.name} - ${Math.max(Number(floor.capacity || 0) - Number(floor.currentCount || 0), 0)} chỗ trống`,
                  }))}
                  placeholder={floorsLoading ? "Đang tải tầng xe máy..." : "Chọn tầng xe máy"}
                />
              </FormField>
            )}

            {effectiveVehicleType === "CAR" && (
              <FormField label="Ô đỗ ô tô">
                <div style={{ display: "grid", gap: 12 }}>
                  {hourlyReservations.matchingCheckIn && (
                    <div className="soft-panel">
                      Đang kiểm tra lượt đặt ô đã thanh toán theo biển số...
                    </div>
                  )}
                  {carFloors.length > 1 && (
                    <Select
                      value={effectiveCarFloorId}
                      onChange={(event) => {
                        setSelectedCarFloorId(event.target.value);
                        updateForm("slotId", "");
                      }}
                      options={carFloors.map((floor) => ({ value: floor.id, label: floor.name }))}
                      placeholder="Chọn tầng ô tô"
                    />
                  )}

                  <div className="car-slot-grid">
                    {currentCarSlots.map((slot) => {
                      const isSelectable = isSelectableCarSlot(slot);
                      const isSelected = selectedCarSlotId === String(slot.id);

                      return (
                        <button
                          type="button"
                          key={slot.id}
                          className={`car-slot-card ${slotClassName(slot.status)} ${isSelected ? "selected" : ""}`}
                          disabled={!isSelectable}
                          onClick={() => updateForm("slotId", String(slot.id))}
                        >
                          <span className="car-slot-code">{slot.slotCode}</span>
                          <span className="car-slot-status">{getStatusLabel(slot.status)}</span>
                        </button>
                      );
                    })}

                    {!slotsLoading && currentCarSlots.length === 0 && (
                      <div className="soft-panel">Tầng này chưa có ô ô tô để chọn.</div>
                    )}
                  </div>

                  {slotsLoading && <p className="section-copy">Đang tải ô ô tô...</p>}
                  {isRegisteredCustomer && registeredReservedSlotId && (
                    <p className="section-copy">
                      Xe có ô đã đặt trước, nhân viên có thể chọn đúng ô đó nếu đang còn sẵn sàng.
                    </p>
                  )}
                </div>
              </FormField>
            )}

            <Button type="submit" variant="primary" icon={ArrowDownLeft} loading={parkingSessions.checkingIn}>
              Ghi nhận xe vào
            </Button>
          </form>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><ShieldCheck size={19} /> Kết quả kiểm tra</h2>
              <p className="section-copy">Đối chiếu biển số, tình trạng xe và chỗ còn trống trước khi mở cổng.</p>
            </div>
          </div>
          <div className="data-list">
            <div className="soft-panel">
              <strong>Tòa nhà nhận xe</strong>
              <p className="section-copy">{currentBuilding?.name || "Chưa có tòa nhà"}{currentBuilding?.address ? ` - ${currentBuilding.address}` : ""}</p>
              <span className="pill success">Chỉ dùng sức chứa và ô của tòa này</span>
            </div>
            {qrPasses.validation && (
              <div className="soft-panel">
                <strong>Mã QR tháng</strong>
                <p className="section-copy">{qrPasses.validation.message || (isQrPassValid ? "Mã QR hợp lệ." : "Mã QR chưa hợp lệ.")}</p>
                <span className={`pill ${isQrPassValid ? "success" : "danger"}`}>{isQrPassValid ? "Có thể dùng" : "Không dùng được"}</span>
              </div>
            )}
            <div className="soft-panel">
              <strong>{effectiveVehicleType === "CAR" ? "Ô đỗ ô tô" : "Khu xe máy"}</strong>
              <p className="section-copy">
                {effectiveVehicleType === "CAR"
                  ? selectedSlot
                    ? `Đã chọn ${selectedSlot.slotCode}. Còn ${availableCarSlots.length} ô trống và ${carSummary.reserved} ô đã đặt trước trên tầng này.`
                    : `${selectableCarSlots.length} ô có thể chọn.`
                  : motorbikeFloor
                    ? `${motorbikeFloor.name} còn ${motorbikeFloor.capacity - motorbikeFloor.currentCount} chỗ.`
                    : "Khu xe máy đã đầy."}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Car size={19} /> Xe đang trong bãi</h2>
            <p className="section-copy">Danh sách giúp nhân viên tránh trùng biển số hoặc thẻ QR.</p>
          </div>
        </div>
        <Table columns={columns} data={parkingSessions.active} loading={parkingSessions.loading} />
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Layers size={19} /> Sức chứa nhanh</h2>
            <p className="section-copy">Xe máy quản lý theo sức chứa, ô tô quản lý theo từng ô đỗ.</p>
          </div>
        </div>
        <div className="dashboard-grid">
          {buildingFloors.map((floor) => (
            <div className="soft-panel" key={floor.id}>
              <strong>{floor.name}</strong>
              <p className="section-copy">{floor.floorType === "CAR" ? `${getCarSlotCount(floor)} ô đỗ ô tô` : `${floor.currentCount}/${floor.capacity} xe máy`}</p>
              <span className={`pill ${getStatusTone(floor.status)}`}>{getStatusLabel(floor.status)}</span>
            </div>
          ))}
          {!floorsLoading && buildingFloors.length === 0 && (
            <div className="soft-panel">Tòa nhà hiện tại chưa có tầng đang hoạt động.</div>
          )}
        </div>
      </section>

      <PlateCameraScanner
        open={plateScannerOpen}
        onClose={() => setPlateScannerOpen(false)}
        onScan={(plateNumber) => updateForm("plateNumber", plateNumber)}
        title="Quét biển số xe vào"
      />
    </div>
  );
};

export default CheckInQRPage;
