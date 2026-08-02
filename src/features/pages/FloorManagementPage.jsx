/**
 * @fileoverview Xây dựng màn hình FloorManagementPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  Edit2,
  Layers,
  Plus,
  RefreshCcw,
  Trash2,
  X,
} from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Table from "../../components/Table/Table";
import useResetAfterSuccess from "../../hooks/useResetAfterSuccess";
import { fetchBuildingsRequest } from "../backend/buildings/buildingSlice";
import {
  clearFloorNotice,
  createFloorRequest,
  deleteFloorRequest,
  fetchFloorsRequest,
  updateFloorRequest,
} from "../backend/floors/floorSlice";
import CarSlotManagementPanel from "../backend/pages/CarSlotManagementPanel";

/**
 * Khai báo `floorTypeLabels` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/pages/FloorManagementPage.jsx.
 */
const floorTypeLabels = {
  MOTORBIKE: "Tầng xe máy",
  CAR: "Tầng ô tô",
};

/**
 * Khai báo `statusLabels` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/pages/FloorManagementPage.jsx.
 */
const statusLabels = {
  ACTIVE: "Đang hoạt động",
  LOCKED: "Đã khóa",
  MAINTENANCE: "Bảo trì",
  INACTIVE: "Ngưng hoạt động",
};

/**
 * Khai báo `emptyForm` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/pages/FloorManagementPage.jsx.
 */
const emptyForm = {
  buildingId: "",
  name: "",
  floorType: "MOTORBIKE",
  capacity: "",
  slotPrefix: "",
  slotCount: "",
  slotsText: "",
  status: "ACTIVE",
  operationNote: "",
};

/**
 * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `normalizeSlotPrefixPreview` (normalize slot prefix preview). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function normalizeSlotPrefixPreview
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const normalizeSlotPrefixPreview = (value) => {
  const normalized = String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();

  return normalized || "CAR";
};

/**
 * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `normalizeText` (normalize text). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function normalizeText
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const normalizeText = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/**
 * Lấy nghiệp vụ `getFloorType` (get floor type). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getFloorType
 * @param {*} floor - Giá trị `floor` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getFloorType = (floor) => floor.floorType || floor.floor_type;
/**
 * Lấy nghiệp vụ `getBuildingId` (get building id). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getBuildingId
 * @param {*} floor - Giá trị `floor` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getBuildingId = (floor) => floor.buildingId || floor.building_id;

/**
 * Lấy nghiệp vụ `getFloorSearchValue` (get floor search value). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getFloorSearchValue
 * @param {*} floor - Giá trị `floor` được hàm sử dụng trong quá trình xử lý.
 * @param {*} column - Giá trị `column` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getFloorSearchValue = (floor, column) => {
  const floorType = getFloorType(floor);
  const capacityOrSlot =
    floorType === "MOTORBIKE"
      ? `${floor.capacity || 0} xe máy`
      : `${floor.slotCount || floor.slot_count || 0} ô đỗ ô tô`;

  const values = {
    id: floor.id,
    name: floor.name,
    buildingName: floor.buildingName || floor.building_name,
    floorType: floorTypeLabels[floorType] || floorType,
    capacityOrSlot,
    status: statusLabels[floor.status] || floor.status,
    note: floor.operationNote || floor.operation_note || floor.note,
  };

  if (column === "all") {
    return Object.values(values).join(" ");
  }

  return values[column] ?? "";
};

/**
 * Thực hiện nghiệp vụ `FloorManagementPage` (floor management page). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function FloorManagementPage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const FloorManagementPage = () => {
  const dispatch = useDispatch();
  const formSectionRef = useRef(null);

  const { buildings, loading: buildingsLoading } = useSelector(
    /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    (state) => state.buildings
  );

  const {
    floors,
    loading,
    error,
    creating,
    updatingId,
    deletingId,
    mutationError,
    mutationSuccess,
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  } = useSelector((state) => state.floors);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [selectedCarFloorId, setSelectedCarFloorId] = useState(null);
  const [filters, setFilters] = useState({
    searchText: "",
    searchColumn: "all",
    buildingId: "",
    floorType: "",
    status: "",
  });

  const isEditing = Boolean(editingId);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const selectedCarFloor = useMemo(() => {
    /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return floors.find((floor) => Number(floor.id) === Number(selectedCarFloorId));
  }, [floors, selectedCarFloorId]);

  const motorbikeCount = useMemo(
    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    () => floors.filter((floor) => getFloorType(floor) === "MOTORBIKE").length,
    [floors]
  );

  const carCount = useMemo(
    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    () => floors.filter((floor) => getFloorType(floor) === "CAR").length,
    [floors]
  );

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const filteredFloors = useMemo(() => {
    const search = normalizeText(filters.searchText);

    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return floors.filter((floor) => {
      const floorType = getFloorType(floor);
      const buildingId = getBuildingId(floor);
      const matchSearch =
        !search ||
        normalizeText(getFloorSearchValue(floor, filters.searchColumn)).includes(search);
      const matchBuilding =
        !filters.buildingId || Number(buildingId) === Number(filters.buildingId);
      const matchType = !filters.floorType || floorType === filters.floorType;
      const matchStatus = !filters.status || floor.status === filters.status;

      return matchSearch && matchBuilding && matchType && matchStatus;
    });
  }, [floors, filters]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const previewSlotCodes = useMemo(() => {
    if (form.floorType !== "CAR" || isEditing) return [];

    const manualSlots = form.slotsText
      .split("\n")
      /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      .map((slot) => slot.trim().toUpperCase())
      .filter(Boolean);

    if (manualSlots.length > 0) {
      return manualSlots.slice(0, 12);
    }

    const count = Math.max(Number(form.slotCount || 0), 0);
    const previewCount = Math.min(count, 12);
    const prefix = normalizeSlotPrefixPreview(form.slotPrefix || form.name);

    /* Callback nội bộ của lời gọi `from`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return Array.from({ length: previewCount }, (_, index) => {
      const slotNumber = String(index + 1).padStart(2, "0");
      return `${prefix}-${slotNumber}`;
    });
  }, [form.floorType, form.name, form.slotCount, form.slotPrefix, form.slotsText, isEditing]);

  /**
   * Thực hiện nghiệp vụ `scrollToForm` (scroll to form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function scrollToForm
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const scrollToForm = () => {
    /* Callback nội bộ của lời gọi `setTimeout`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    dispatch(fetchBuildingsRequest());
    dispatch(fetchFloorsRequest());
  }, [dispatch]);

  /**
   * Cập nhật nghiệp vụ `updateField` (update field). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function updateField
   * @param {*} field - Giá trị `field` được hàm sử dụng trong quá trình xử lý.
   * @param {*} value - Giá trị đầu vào cần xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const updateField = (field, value) => {
    /* Callback nội bộ của lời gọi `setForm`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    /* Callback nội bộ của lời gọi `setFormErrors`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setFormErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    dispatch(clearFloorNotice());
  };

  /**
   * Cập nhật nghiệp vụ `updateFilter` (update filter). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function updateFilter
   * @param {*} field - Giá trị `field` được hàm sử dụng trong quá trình xử lý.
   * @param {*} value - Giá trị đầu vào cần xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const updateFilter = (field, value) => {
    /* Callback nội bộ của lời gọi `setFilters`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Kiểm tra nghiệp vụ `validateForm` (validate form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function validateForm
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const validateForm = () => {
    const nextErrors = {};

    if (!form.buildingId) {
      nextErrors.buildingId = "Vui lòng chọn tòa nhà.";
    }

    if (!form.name.trim()) {
      nextErrors.name = "Vui lòng nhập tên tầng.";
    }

    if (form.floorType === "MOTORBIKE" && (!form.capacity || Number(form.capacity) <= 0)) {
      nextErrors.capacity = "Tầng xe máy cần sức chứa lớn hơn 0.";
    }

    if (form.floorType === "CAR" && !isEditing && (!form.slotCount || Number(form.slotCount) <= 0)) {
      nextErrors.slotCount = "Tầng ô tô cần số lượng ô lớn hơn 0.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  /**
   * Tạo nghiệp vụ `buildPayload` (build payload). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function buildPayload
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const buildPayload = () => {
    const payload = {
      buildingId: Number(form.buildingId),
      name: form.name.trim(),
      status: form.status,
      operationNote: form.operationNote.trim() || undefined,
    };

    if (!isEditing) {
      payload.floorType = form.floorType;
    }

    if (form.floorType === "MOTORBIKE") {
      payload.floorType = "MOTORBIKE";
      payload.capacity = Number(form.capacity);
    }

    if (form.floorType === "CAR" && !isEditing) {
      payload.floorType = "CAR";
      payload.slotCount = Number(form.slotCount);

      if (form.slotPrefix.trim()) {
        payload.slotPrefix = form.slotPrefix.trim();
      }

      const slots = form.slotsText
        .split("\n")
        /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        .map((slot) => slot.trim())
        .filter(Boolean);

      if (slots.length > 0) {
        payload.slots = slots;
      }
    }

    return payload;
  };

  /**
   * Xóa hoặc đặt lại nghiệp vụ `resetForm` (reset form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function resetForm
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setSelectedCarFloorId(null);
  };

  const markFormSubmitted = useResetAfterSuccess({
    submitting: creating || Boolean(updatingId),
    success: mutationSuccess,
    error: mutationError,
    onSuccess: resetForm,
  });

  /**
   * Xử lý nghiệp vụ `handleSubmit` (handle submit). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handleSubmit
   * @param {*} event - Sự kiện phát sinh từ thao tác của người dùng.
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const payload = buildPayload();
    markFormSubmitted();

    if (editingId) {
      dispatch(
        updateFloorRequest({
          id: editingId,
          ...payload,
        })
      );
    } else {
      dispatch(createFloorRequest(payload));
    }
  };

  /**
   * Thực hiện nghiệp vụ `startEdit` (start edit). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function startEdit
   * @param {*} floor - Giá trị `floor` được hàm sử dụng trong quá trình xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const startEdit = (floor) => {
    dispatch(clearFloorNotice());
    setEditingId(floor.id);
    setForm({
      buildingId: String(getBuildingId(floor) || ""),
      name: floor.name || "",
      floorType: getFloorType(floor) || "MOTORBIKE",
      capacity: floor.capacity ? String(floor.capacity) : "",
      slotPrefix: "",
      slotCount: floor.slotCount ? String(floor.slotCount) : "",
      slotsText: "",
      status: floor.status || "ACTIVE",
      operationNote: floor.operationNote || floor.operation_note || "",
    });

    if (getFloorType(floor) === "CAR") {
      setSelectedCarFloorId(floor.id);
    } else {
      setSelectedCarFloorId(null);
    }

    scrollToForm();
  };

  /**
   * Xử lý nghiệp vụ `handleDelete` (handle delete). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handleDelete
   * @param {*} floor - Giá trị `floor` được hàm sử dụng trong quá trình xử lý.
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const handleDelete = (floor) => {
    const ok = window.confirm(`Bạn chắc muốn xóa tầng "${floor.name}" không?`);

    if (!ok) return;

    dispatch(deleteFloorRequest({ id: floor.id }));
  };

  /**
   * Xử lý nghiệp vụ `handleRefresh` (handle refresh). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handleRefresh
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const handleRefresh = () => {
    dispatch(clearFloorNotice());
    dispatch(fetchFloorsRequest());
  };

  const columns = [
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} floor - Giá trị `floor` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Mã", key: "id", render: (floor) => `#${floor.id}` },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} floor - Giá trị `floor` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Tên tầng", key: "name", render: (floor) => <strong>{floor.name}</strong> },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} floor - Giá trị `floor` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Tòa nhà", key: "buildingName", render: (floor) => floor.buildingName || floor.building_name || "-" },
    {
      header: "Loại",
      key: "floorType",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} floor - Giá trị `floor` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (floor) => floorTypeLabels[getFloorType(floor)] || getFloorType(floor),
    },
    {
      header: "Sức chứa / Ô đỗ",
      key: "capacity",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} floor - Giá trị `floor` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (floor) =>
        getFloorType(floor) === "MOTORBIKE"
          ? `${floor.capacity || 0} xe máy`
          : `${floor.slotCount || floor.slot_count || 0} ô tô`,
    },
    {
      header: "Trạng thái",
      key: "status",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} floor - Giá trị `floor` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (floor) => statusLabels[floor.status] || floor.status || "-",
    },
    {
      header: "Ghi chú",
      key: "operationNote",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} floor - Giá trị `floor` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (floor) => floor.operationNote || floor.operation_note || "-",
    },
    {
      header: "Thao tác",
      key: "actions",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} floor - Giá trị `floor` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (floor) => (
        <div className="action-row">
          <Button
            type="button"
            size="sm"
            variant="outline"
            icon={Edit2}
            disabled={Boolean(updatingId) || Boolean(deletingId)}
            onClick={() => startEdit(floor)}
          >
            Sửa
          </Button>

          <Button
            type="button"
            size="sm"
            variant="danger"
            icon={Trash2}
            loading={deletingId === floor.id}
            disabled={Boolean(deletingId)}
            onClick={() => handleDelete(floor)}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow">
            <Layers size={16} /> Tầng gửi xe
          </div>

          <h1 className="page-title">Quản lý tầng xe máy & ô tô</h1>

          <p className="page-subtitle">
            Quản lý có thể thêm, sửa, xóa tầng xe máy và tầng ô tô theo từng tòa nhà.
          </p>
        </div>

        <div className="page-hero-aside">
          <span className="page-hero-label">Tổng tầng</span>
          <span className="page-hero-number">{floors.length}</span>
          <span className="page-hero-label">
            Xe máy: {motorbikeCount} • Ô tô: {carCount}
          </span>
        </div>
      </section>

      <StatusBanner success={mutationSuccess} errors={[mutationError, error]} />

      <section ref={formSectionRef} className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              {editingId ? <Edit2 size={19} /> : <Plus size={19} />}
              {editingId ? "Sửa tầng" : "Tạo tầng mới"}
            </h2>

            <p className="section-copy">
              Tầng xe máy dùng sức chứa. Tầng ô tô dùng từng ô đỗ cụ thể.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <FormField label="Tòa nhà" required error={formErrors.buildingId}>
            <select
              className="form-input"
              value={form.buildingId}
              onChange={(event) => updateField("buildingId", event.target.value)}
              disabled={creating || Boolean(updatingId) || buildingsLoading}
            >
              <option value="">
                {buildingsLoading ? "Đang tải tòa nhà..." : "Chọn tòa nhà"}
              </option>

              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Tên tầng" required error={formErrors.name}>
            <Input
              placeholder="Ví dụ: B1 - Tầng xe máy"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              disabled={creating || Boolean(updatingId)}
            />
          </FormField>

          <FormField label="Loại tầng">
            <select
              className="form-input"
              value={form.floorType}
              onChange={(event) => updateField("floorType", event.target.value)}
              disabled={creating || Boolean(updatingId) || isEditing}
            >
              <option value="MOTORBIKE">Tầng xe máy</option>
              <option value="CAR">Tầng ô tô</option>
            </select>
          </FormField>

          {form.floorType === "MOTORBIKE" && (
            <FormField label="Sức chứa xe máy" required error={formErrors.capacity}>
              <Input
                type="number"
                min="1"
                placeholder="Ví dụ: 500"
                value={form.capacity}
                onChange={(event) => updateField("capacity", event.target.value)}
                disabled={creating || Boolean(updatingId)}
              />
            </FormField>
          )}

          {form.floorType === "CAR" && !isEditing && (
            <>
              <FormField label="Tiền tố mã ô">
                <Input
                  placeholder="Ví dụ: B3, C1, TANG-OTO"
                  value={form.slotPrefix}
                  onChange={(event) => updateField("slotPrefix", event.target.value.toUpperCase())}
                  disabled={creating || Boolean(updatingId)}
                />
              </FormField>

              <FormField label="Số lượng ô tô" required error={formErrors.slotCount}>
                <Input
                  type="number"
                  min="1"
                  placeholder="Ví dụ: 20"
                  value={form.slotCount}
                  onChange={(event) => updateField("slotCount", event.target.value)}
                  disabled={creating || Boolean(updatingId)}
                />
              </FormField>

              {previewSlotCodes.length > 0 && (
                <div className="slot-preview-panel">
                  <strong>Mã ô sẽ được tạo</strong>
                  <span className="section-copy">
                    {form.slotsText.trim()
                      ? "Đang dùng danh sách mã bạn nhập."
                      : "Hệ thống sẽ tự sinh theo tiền tố và số lượng ô."}
                  </span>
                  <div className="slot-preview-list">
                    {previewSlotCodes.map((slotCode) => (
                      <span className="slot-preview-pill" key={slotCode}>
                        {slotCode}
                      </span>
                    ))}
                    {Number(form.slotCount || 0) > previewSlotCodes.length && (
                      <span className="slot-preview-more">
                        +{Number(form.slotCount || 0) - previewSlotCodes.length} ô khác
                      </span>
                    )}
                  </div>
                </div>
              )}

              <FormField label="Mã ô đỗ ô tô">
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder={`Mỗi dòng là 1 mã ô đỗ, ví dụ:\nCAR-A01\nCAR-A02\nCAR-A03`}
                  value={form.slotsText}
                  onChange={(event) => updateField("slotsText", event.target.value)}
                  disabled={creating || Boolean(updatingId)}
                />
              </FormField>
            </>
          )}

          <FormField label="Trạng thái">
            <select
              className="form-input"
              value={form.status}
              onChange={(event) => updateField("status", event.target.value)}
              disabled={creating || Boolean(updatingId)}
            >
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="LOCKED">Đã khóa</option>
              <option value="MAINTENANCE">Bảo trì</option>
              <option value="INACTIVE">Ngưng hoạt động</option>
            </select>
          </FormField>

          <FormField label="Ghi chú vận hành">
            <textarea
              className="form-input"
              rows="3"
              placeholder="Ví dụ: Tầng dành cho cư dân block A"
              value={form.operationNote}
              onChange={(event) => updateField("operationNote", event.target.value)}
              disabled={creating || Boolean(updatingId)}
            />
          </FormField>

          <div className="action-row">
            <Button
              type="submit"
              icon={editingId ? Edit2 : Plus}
              loading={creating || Boolean(updatingId)}
              disabled={creating || Boolean(updatingId)}
            >
              {editingId ? "Lưu thay đổi" : "Tạo tầng"}
            </Button>

            {editingId && (
              <Button type="button" variant="outline" icon={X} onClick={resetForm}>
                Hủy sửa
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              icon={RefreshCcw}
              loading={loading}
              disabled={loading}
              onClick={handleRefresh}
            >
              Tải lại
            </Button>
          </div>
        </form>
      </section>

      {selectedCarFloor && <CarSlotManagementPanel floor={selectedCarFloor} />}

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <Building2 size={19} /> Bộ lọc tầng
            </h2>

            <p className="section-copy">
              Lọc tầng theo tòa nhà, loại tầng hoặc trạng thái.
            </p>
          </div>
        </div>

        <div className="filter-grid">
          <FormField label="Tìm kiếm">
            <Input
              placeholder="Nhập nội dung cần tìm..."
              value={filters.searchText}
              onChange={(event) => updateFilter("searchText", event.target.value)}
            />
          </FormField>

          <FormField label="Tìm theo cột" className="mg-pagination">
            <select
              className="form-input"
              value={filters.searchColumn}
              onChange={(event) => updateFilter("searchColumn", event.target.value)}
            >
              <option value="all">Tất cả cột</option>
              <option value="id">Mã</option>
              <option value="name">Tên tầng</option>
              <option value="buildingName">Tòa nhà</option>
              <option value="floorType">Loại tầng</option>
              <option value="capacityOrSlot">Sức chứa / Ô đỗ</option>
              <option value="status">Trạng thái</option>
              <option value="note">Ghi chú</option>
            </select>
          </FormField>

          <FormField label="Tòa nhà" className="mg-pagination">
            <select
              className="form-input"
              value={filters.buildingId}
              onChange={(event) => updateFilter("buildingId", event.target.value)}
            >
              <option value="">Tất cả tòa nhà</option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Loại tầng" className="mg-pagination">
            <select
              className="form-input"
              value={filters.floorType}
              onChange={(event) => updateFilter("floorType", event.target.value)}
            >
              <option value="">Tất cả loại tầng</option>
              <option value="MOTORBIKE">Tầng xe máy</option>
              <option value="CAR">Tầng ô tô</option>
            </select>
          </FormField>

          <FormField label="Trạng thái" className="mg-pagination">
            <select
              className="form-input"
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="LOCKED">Đã khóa</option>
              <option value="MAINTENANCE">Bảo trì</option>
              <option value="INACTIVE">Ngưng hoạt động</option>
            </select>
          </FormField>

          <div style={{ alignSelf: "end" }}>
            <Button
              className="mg-pagination"
              type="button"
              variant="outline"
              onClick={() =>
                setFilters({
                  searchText: "",
                  searchColumn: "all",
                  buildingId: "",
                  floorType: "",
                  status: "",
                })
              }
            >
              Xóa lọc
            </Button>
          </div>
        </div>
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <Layers size={19} /> Danh sách tầng
            </h2>

            <p className="section-copy">
              Danh sách tầng xe máy theo sức chứa và tầng ô tô theo từng ô đỗ.
            </p>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredFloors}
          loading={loading}
          emptyMessage="Chưa có tầng nào."
        />
      </section>
    </div>
  );
};

export default FloorManagementPage;
