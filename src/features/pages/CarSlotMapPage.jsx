/**
 * @fileoverview Xây dựng màn hình CarSlotMapPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, Car, ShieldAlert, Wrench, X } from "lucide-react";

import StatusBanner from "../../components/Feedback/StatusBanner";
import Select from "../../components/Form/Select";
import { fetchBuildingsRequest } from "../backend/buildings/buildingSlice";
import { fetchFloorsRequest } from "../backend/floors/floorSlice";
import { fetchSlotsByFloorRequest } from "../backend/slots/slotSlice";
import {
  formatDateTime,
  getStatusLabel,
  getStatusTone,
} from "../../services/mockParkingData";

/**
 * Khai báo `slotClass` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/pages/CarSlotMapPage.jsx.
 */
const slotClass = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  RESERVED: "reserved",
  MAINTENANCE: "maintenance",
  LOCKED: "locked",
  CONFLICT: "conflict",
};

/**
 * Lấy nghiệp vụ `getSlotClass` (get slot class). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getSlotClass
 * @param {*} status - Giá trị `status` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getSlotClass = (status) => slotClass[String(status || "AVAILABLE").toUpperCase()] || "available";

/**
 * Lấy nghiệp vụ `getSizeLabel` (get size label). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getSizeLabel
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getSizeLabel = (value) => {
  const normalized = String(value || "").toUpperCase();
  if (normalized === "STANDARD") return "Tiêu chuẩn";
  if (normalized === "LARGE") return "Rộng";
  return value || "-";
};

/**
 * Thực hiện nghiệp vụ `CarSlotMapPage` (car slot map page). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function CarSlotMapPage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const CarSlotMapPage = () => {
  const dispatch = useDispatch();
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { user } = useSelector((state) => state.auth);
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { buildings, error: buildingsError } = useSelector((state) => state.buildings);
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { floors, loading: floorsLoading, error: floorsError } = useSelector((state) => state.floors);
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { slotsByFloor, loading: slotsLoading, error: slotsError } = useSelector((state) => state.slots);

  const [selectedFloorId, setSelectedFloorId] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState(null);

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
  const carFloors = useMemo(() => {
    return floors.filter(
      /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      (floor) =>
        Number(floor.buildingId) === Number(currentBuildingId) &&
        floor.floorType === "CAR" &&
        floor.status === "ACTIVE"
    );
  }, [floors, currentBuildingId]);

  const effectiveFloorId = selectedFloorId || (carFloors[0]?.id ? String(carFloors[0].id) : "");
  /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const selectedFloor = carFloors.find((floor) => String(floor.id) === String(effectiveFloorId));
  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const slots = useMemo(() => {
    return effectiveFloorId ? slotsByFloor[effectiveFloorId] || [] : [];
  }, [effectiveFloorId, slotsByFloor]);
  const autoSelectedSlotId =
    /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    slots.find((slot) => slot.status === "CONFLICT")?.id ||
    /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    slots.find((slot) => slot.status === "OCCUPIED")?.id ||
    slots[0]?.id ||
    null;
  /* Callback nội bộ của lời gọi `some`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const selectedSlotStillExists = slots.some((slot) => String(slot.id) === String(selectedSlotId));
  const effectiveSelectedSlotId =
    selectedSlotId === "__CLOSED__" ? null : selectedSlotStillExists ? selectedSlotId : autoSelectedSlotId;
  /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const selectedSlot = slots.find((slot) => String(slot.id) === String(effectiveSelectedSlotId)) || null;

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const summary = useMemo(() => {
    return slots.reduce(
      /* Callback nội bộ của lời gọi `reduce`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      (sum, slot) => {
        const status = String(slot.status || "AVAILABLE").toUpperCase();
        return {
          total: sum.total + 1,
          available: sum.available + (status === "AVAILABLE" ? 1 : 0),
          occupied: sum.occupied + (status === "OCCUPIED" ? 1 : 0),
          reserved: sum.reserved + (status === "RESERVED" ? 1 : 0),
          attention: sum.attention + (["MAINTENANCE", "LOCKED", "CONFLICT"].includes(status) ? 1 : 0),
        };
      },
      { total: 0, available: 0, occupied: 0, reserved: 0, attention: 0 }
    );
  }, [slots]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    dispatch(fetchBuildingsRequest());
  }, [dispatch]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (!currentBuildingId) return;
    dispatch(fetchFloorsRequest({ buildingId: currentBuildingId, status: "ACTIVE", limit: 100 }));
  }, [currentBuildingId, dispatch]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (!effectiveFloorId) return;
    dispatch(fetchSlotsByFloorRequest({ floorId: effectiveFloorId }));
  }, [dispatch, effectiveFloorId]);

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><Car size={16} /> Ô đỗ ô tô</div>
          <h1 className="page-title">Sơ đồ ô đỗ ô tô của tòa nhà đang trực</h1>
          <p className="page-subtitle">
            Nhân viên chỉ nhìn và chọn các ô thuộc tòa nhà của mình. Trạng thái ô lấy từ dữ liệu thật của bãi xe.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Ô trống</span>
          <span className="page-hero-number">{summary.available}</span>
          <span className="page-hero-label">trên {summary.total} ô</span>
        </div>
      </section>

      <section className="card soft-panel">
        <div className="data-row">
          <span>Tòa nhà đang trực</span>
          <strong>{currentBuilding?.name || "Chưa có tòa nhà"}</strong>
        </div>
        <div className="data-row">
          <span>Địa chỉ</span>
          <strong>{currentBuilding?.address || "Chưa có địa chỉ"}</strong>
        </div>
        <div className="data-row">
          <span>Tầng đang xem</span>
          <strong>{selectedFloor?.name || "Chưa có tầng ô tô"}</strong>
        </div>
      </section>

      <StatusBanner errors={[buildingsError, floorsError, slotsError]} />

      <div className="dashboard-grid">
        <div className="card metric-card"><div className="metric-label">Trống</div><div className="metric-value">{summary.available}</div></div>
        <div className="card metric-card"><div className="metric-label">Đang dùng</div><div className="metric-value">{summary.occupied}</div></div>
        <div className="card metric-card"><div className="metric-label">Đã đặt</div><div className="metric-value">{summary.reserved}</div></div>
        <div className="card metric-card"><div className="metric-label">Cần kiểm tra</div><div className="metric-value">{summary.attention}</div></div>
      </div>

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><Building2 size={19} /> Sơ đồ tầng ô tô</h2>
              <p className="section-copy">Bấm từng ô để xem chi tiết. Ô trống là ô có thể chọn khi nhận xe ô tô.</p>
            </div>
            {carFloors.length > 1 && (
              <Select
                value={effectiveFloorId}
                onChange={(event) => {
                  setSelectedFloorId(event.target.value);
                  setSelectedSlotId(null);
                }}
                options={carFloors.map((floor) => ({ value: floor.id, label: floor.name }))}
                placeholder="Chọn tầng"
              />
            )}
          </div>

          <div className="action-row" style={{ marginBottom: 16 }}>
            {["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE", "LOCKED"].map((status) => (
              <span className={`pill ${getStatusTone(status)}`} key={status}>{getStatusLabel(status)}</span>
            ))}
          </div>

          <div className="slot-map-grid">
            {slots.map((slot) => (
              <button
                type="button"
                className={`slot-tile ${getSlotClass(slot.status)} ${String(effectiveSelectedSlotId) === String(slot.id) ? "selected" : ""}`}
                key={slot.id}
                onClick={() => setSelectedSlotId(slot.id)}
              >
                <div>{slot.slotCode}</div>
                <small>{getStatusLabel(slot.status)}</small>
              </button>
            ))}
          </div>

          {slotsLoading && <div className="soft-panel" style={{ marginTop: 16 }}>Đang tải ô đỗ...</div>}
          {!slotsLoading && effectiveFloorId && slots.length === 0 && (
            <div className="soft-panel" style={{ marginTop: 16 }}>Tầng này chưa có ô ô tô.</div>
          )}
          {!floorsLoading && carFloors.length === 0 && (
            <div className="soft-panel" style={{ marginTop: 16 }}>Tòa nhà hiện tại chưa có tầng ô tô đang hoạt động.</div>
          )}
        </section>

        {selectedSlot && (
          <section className="card section-card">
            <div className="section-header">
              <div>
                <h2 className="section-title"><Car size={19} /> Ô {selectedSlot.slotCode}</h2>
                <p className="section-copy">{getSizeLabel(selectedSlot.sizeLabel)} - {selectedSlot.note || selectedSlot.positionDescription || "Không có ghi chú."}</p>
              </div>
              <button className="theme-toggle-btn" onClick={() => setSelectedSlotId("__CLOSED__")} aria-label="Đóng chi tiết">
                <X size={18} />
              </button>
            </div>

            <div className="data-list">
              <div className="data-row"><span>Trạng thái</span><strong>{getStatusLabel(selectedSlot.status)}</strong></div>
              <div className="data-row"><span>Tòa nhà</span><strong>{selectedSlot.buildingName || currentBuilding?.name || "-"}</strong></div>
              <div className="data-row"><span>Tầng</span><strong>{selectedSlot.floorName || selectedFloor?.name || "-"}</strong></div>
              <div className="data-row"><span>Biển số</span><strong>{selectedSlot.plateNumber || "-"}</strong></div>
              <div className="data-row"><span>Giờ vào</span><strong>{formatDateTime(selectedSlot.checkInAt)}</strong></div>
            </div>

            {selectedSlot.status === "AVAILABLE" && (
              <div className="soft-panel" style={{ marginTop: 16 }}>
                <span className="pill success">Có thể nhận xe</span>
                <p className="section-copy">Khi nhận xe ô tô, chọn đúng ô này ở màn hình xe vào bãi.</p>
              </div>
            )}

            {["MAINTENANCE", "LOCKED", "CONFLICT"].includes(selectedSlot.status) && (
              <div className="soft-panel" style={{ marginTop: 16 }}>
                <span className="pill danger"><ShieldAlert size={14} /> Cần kiểm tra</span>
                <p className="section-copy">Không chọn ô này cho xe mới cho đến khi trạng thái được cập nhật.</p>
              </div>
            )}

            {selectedSlot.status === "MAINTENANCE" && (
              <div className="soft-panel" style={{ marginTop: 16 }}>
                <span className="pill warning"><Wrench size={14} /> Đang bảo trì</span>
                <p className="section-copy">Ô này tạm thời không dùng để nhận xe.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default CarSlotMapPage;
