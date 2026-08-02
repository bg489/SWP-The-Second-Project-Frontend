/**
 * @fileoverview Xây dựng màn hình TempQrCardsPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Maximize2, QrCode, RefreshCcw, Save, ShieldAlert, X } from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import QrCodeImage from "../../components/QrCode/QrCodeImage";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import useResetAfterSuccess from "../../hooks/useResetAfterSuccess";
import { useMockAuth } from "../../context/MockAuthContext";
import {
  clearParkingNotice,
  createTempQrCardRequest,
  fetchTempQrCardsRequest,
  updateTempQrCardStatusRequest,
} from "../backend/parking/parkingSlice";
import { fetchBuildingsRequest } from "../backend/buildings/buildingSlice";
import { getStatusLabel, getStatusTone } from "../../services/mockParkingData";

/**
 * Khai báo `statusOptions` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/pages/TempQrCardsPage.jsx.
 */
const statusOptions = [
  { value: "READY", label: "Sẵn sàng phát" },
  { value: "IN_USE", label: "Đang dùng" },
  { value: "RETURNED", label: "Đã trả" },
  { value: "COMPLETED", label: "Đã hoàn tất" },
  { value: "LOCKED", label: "Tạm khóa" },
  { value: "LOST", label: "Mất thẻ" },
];

/**
 * Tạo nghiệp vụ `buildBuildingPrefix` (build building prefix). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function buildBuildingPrefix
 * @param {*} buildingName - Giá trị `buildingName` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const buildBuildingPrefix = (buildingName = "") => {
  const normalized = buildingName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim();
  const prefix = normalized
    .split(/\s+/)
    .filter(Boolean)
    /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return prefix || "QR";
};

/**
 * Lấy nghiệp vụ `getNextPreviewNumber` (get next preview number). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getNextPreviewNumber
 * @param {*} cards - Giá trị `cards` được hàm sử dụng trong quá trình xử lý.
 * @param {*} prefix - Giá trị `prefix` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getNextPreviewNumber = (cards, prefix) => {
  const matcher = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-(\\d+)$`);

  /* Callback nội bộ của lời gọi `reduce`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  return cards.reduce((max, card) => {
    const match = String(card.cardCode || "").match(matcher);
    if (!match) return max;

    return Math.max(max, Number(match[1]) || 0);
  }, 0) + 1;
};

/**
 * Lấy nghiệp vụ `getExistingCardPrefix` (get existing card prefix). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getExistingCardPrefix
 * @param {*} cards - Giá trị `cards` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getExistingCardPrefix = (cards) =>
  cards
    /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    .map((card) => String(card.cardCode || "").match(/^([A-Z0-9]+)-\d+$/)?.[1])
    .find(Boolean);

/**
 * Thực hiện nghiệp vụ `TempQrCardsPage` (temp qr cards page). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function TempQrCardsPage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const TempQrCardsPage = () => {
  const dispatch = useDispatch();
  const { role } = useMockAuth();
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { user: authUser, frontendRole } = useSelector((state) => state.auth);
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { tempQrCards, notice } = useSelector((state) => state.parking);
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { buildings, loading: buildingsLoading } = useSelector((state) => state.buildings);
  const effectiveRole = frontendRole || role;
  const canCreate = effectiveRole === "PARKING_MANAGER";

  const [form, setForm] = useState({
    quantity: "50",
    status: "READY",
    note: "",
  });

  const [filter, setFilter] = useState("");
  const [formError, setFormError] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const effectiveBuildingId = canCreate
    ? selectedBuildingId || (buildings[0]?.id ? String(buildings[0].id) : "")
    : authUser?.buildingId ? String(authUser.buildingId) : "";

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    dispatch(fetchBuildingsRequest());
  }, [dispatch]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (!effectiveBuildingId) return;

    dispatch(
      fetchTempQrCardsRequest({
        buildingId: effectiveBuildingId,
        ...(filter ? { status: filter } : {}),
      })
    );
  }, [dispatch, effectiveBuildingId, filter]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const cards = useMemo(() => {
    if (!filter) return tempQrCards.items;
    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return tempQrCards.items.filter((card) => card.status === filter);
  }, [filter, tempQrCards.items]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const readyCount = useMemo(() => {
    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return tempQrCards.items.filter((card) => card.status === "READY").length;
  }, [tempQrCards.items]);

  /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const selectedBuilding = buildings.find((building) => String(building.id) === String(effectiveBuildingId));
  const previewPrefix =
    getExistingCardPrefix(tempQrCards.items) ||
    buildBuildingPrefix(selectedBuilding?.name || authUser?.buildingName || "QR");
  const previewStart = getNextPreviewNumber(tempQrCards.items, previewPrefix);
  const previewEnd = previewStart + Math.max(Number(form.quantity) || 0, 1) - 1;
  const previewFirstCode = `${previewPrefix}-${String(previewStart).padStart(4, "0")}`;
  const previewLastCode = `${previewPrefix}-${String(previewEnd).padStart(4, "0")}`;

  /**
   * Cập nhật nghiệp vụ `updateForm` (update form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function updateForm
   * @param {*} field - Giá trị `field` được hàm sử dụng trong quá trình xử lý.
   * @param {*} value - Giá trị đầu vào cần xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const updateForm = (field, value) => {
    dispatch(clearParkingNotice());
    setFormError("");
    /* Callback nội bộ của lời gọi `setForm`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setForm((prev) => ({
      ...prev,
      [field]: field === "quantity" ? value.replace(/\D/g, "").slice(0, 3) : value,
    }));
  };

  const markCardsSubmitted = useResetAfterSuccess({
    submitting: tempQrCards.saving,
    success: notice,
    error: tempQrCards.error,
    /**
     * Xử lý nghiệp vụ `onSuccess` (on success). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function onSuccess
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    onSuccess: () => {
      setForm({
        quantity: "",
        status: "READY",
        note: "",
      });
      setFormError("");
    },
  });

  /**
   * Tạo nghiệp vụ `createCard` (create card). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function createCard
   * @param {*} event - Sự kiện phát sinh từ thao tác của người dùng.
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const createCard = (event) => {
    event.preventDefault();
    const quantity = Number(form.quantity);

    if (!effectiveBuildingId) {
      setFormError("Vui lòng chọn tòa nhà cho thẻ QR tạm.");
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 500) {
      setFormError("Số lượng cần từ 1 đến 500 thẻ.");
      return;
    }

    markCardsSubmitted();
    dispatch(
      createTempQrCardRequest({
        quantity,
        buildingId: Number(effectiveBuildingId),
        status: form.status,
        note: form.note.trim() || undefined,
      })
    );
  };

  /**
   * Thực hiện nghiệp vụ `refresh` (refresh). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function refresh
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const refresh = () => {
    dispatch(clearParkingNotice());
    dispatch(fetchTempQrCardsRequest({
      buildingId: effectiveBuildingId,
      ...(filter ? { status: filter } : {}),
    }));
  };

  const columns = [
    {
      header: "Mã QR",
      key: "qrPreview",
      width: "94px",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => {
        const value = row.cardCode || row.id;

        return (
          <button
            type="button"
            className="qr-thumb-button"
            onClick={() => setSelectedCard(row)}
            aria-label={`Xem QR ${value}`}
          >
            <QrCodeImage value={value} size={66} title={`QR ${value}`} />
          </button>
        );
      },
    },
    {
      header: "Mã thẻ",
      key: "cardCode",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => <strong>{row.cardCode || row.id}</strong>,
    },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Tòa nhà", key: "buildingName", render: (row) => row.buildingName || "-" },
    {
      header: "Trạng thái",
      key: "status",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => <span className={`pill ${getStatusTone(row.status)}`}>{getStatusLabel(row.status)}</span>,
    },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Gắn với lượt gửi", key: "currentSessionId", render: (row) => row.currentSessionId || "Chưa dùng" },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Ghi chú", key: "note", render: (row) => row.note || "-" },
    {
      header: "Đổi trạng thái",
      key: "actions",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => (
        <Select
          value={row.status}
          onChange={(event) =>
            dispatch(
              updateTempQrCardStatusRequest({
                ...row,
                id: row.id,
                status: event.target.value,
              })
            )
          }
          options={statusOptions}
          placeholder={null}
          disabled={tempQrCards.updatingId === row.id}
        />
      ),
    },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><QrCode size={16} /> QR tạm</div>
          <h1 className="page-title">Chuẩn bị thẻ QR cho khách gửi lẻ</h1>
          <p className="page-subtitle">
            Thẻ sẵn sàng sẽ được phát khi xe vào bãi. Khi xe ra và trả thẻ, nhân viên chuyển lại trạng thái để dùng tiếp.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Có thể phát ngay</span>
          <span className="page-hero-number">{readyCount}</span>
          <span className="page-hero-label">thẻ QR</span>
        </div>
      </section>

      <StatusBanner success={notice} errors={tempQrCards.error} />

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">Tòa nhà sử dụng QR tạm</h2>
            <p className="section-copy">Thẻ QR tạm chỉ dùng trong đúng tòa nhà đang chọn.</p>
          </div>
        </div>
        <FormField label="Tòa nhà">
          {canCreate ? (
            <Select
              value={effectiveBuildingId}
              onChange={(event) => setSelectedBuildingId(event.target.value)}
              options={buildings.map((building) => ({ value: building.id, label: building.name }))}
              placeholder={buildingsLoading ? "Đang tải tòa nhà..." : "Chọn tòa nhà"}
            />
          ) : (
            <Input
              value={buildings.find((building) => String(building.id) === String(effectiveBuildingId))?.name || authUser?.buildingName || "Chưa có tòa nhà"}
              disabled
            />
          )}
        </FormField>
      </section>

      <div className={canCreate ? "two-column-grid" : "dashboard-grid"}>
        {canCreate && (
          <section className="card section-card">
            <div className="section-header">
              <div>
                <h2 className="section-title"><Save size={19} /> Tạo thẻ QR tự động</h2>
                <p className="section-copy">Nhập số lượng, hệ thống sẽ tự sinh mã theo tên tòa nhà và số thứ tự kế tiếp.</p>
              </div>
            </div>
            <form onSubmit={createCard} style={{ display: "grid", gap: 14 }}>
              <FormField label="Số lượng thẻ cần tạo" required>
                <Input
                  value={form.quantity}
                  maxLength={3}
                  onChange={(event) => updateForm("quantity", event.target.value)}
                  placeholder="Ví dụ: 50"
                />
              </FormField>
              {formError && <p style={{ color: "var(--danger)", marginTop: -6 }}>{formError}</p>}
              <FormField label="Trạng thái ban đầu">
                <Select
                  value={form.status}
                  onChange={(event) => updateForm("status", event.target.value)}
                  options={statusOptions}
                  placeholder={null}
                />
              </FormField>
              <FormField label="Ghi chú">
                <Input
                  value={form.note}
                  onChange={(event) => updateForm("note", event.target.value)}
                  placeholder="Ví dụ: Thẻ dự phòng cổng B"
                />
              </FormField>

              <div className="qr-live-preview">
                <QrCodeImage value={previewFirstCode} size={168} title={`QR ${previewFirstCode}`} />
                <div>
                  <span className="metric-label">Dải mã sẽ tạo</span>
                  <strong>{previewFirstCode} đến {previewLastCode}</strong>
                  <p className="section-copy">
                    Backend sẽ lưu từng mã vào đúng tòa nhà đang chọn, ví dụ {previewPrefix}-0001, {previewPrefix}-0002.
                  </p>
                </div>
              </div>

              <Button type="submit" icon={Save} loading={tempQrCards.saving}>
                Tạo dải thẻ QR
              </Button>
            </form>
          </section>
        )}

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><ShieldAlert size={19} /> Quy tắc sử dụng</h2>
              <p className="section-copy">Chỉ phát thẻ đang sẵn sàng. Thẻ mất hoặc hỏng cần khóa để tránh nhầm lượt gửi.</p>
            </div>
          </div>
          <div className="data-list">
            <div className="data-row"><span>Sẵn sàng</span><strong>Phát cho xe mới</strong></div>
            <div className="data-row"><span>Đang dùng</span><strong>Đã gắn với xe trong bãi</strong></div>
            <div className="data-row"><span>Đã trả</span><strong>Có thể chuẩn bị dùng lại</strong></div>
            <div className="data-row"><span>Tạm khóa</span><strong>Không phát cho khách</strong></div>
          </div>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><QrCode size={19} /> Danh sách thẻ QR tạm</h2>
            <p className="section-copy">Nhân viên cổng dùng danh sách này để phát đúng thẻ cho khách gửi lẻ.</p>
          </div>
          <Button variant="outline" icon={RefreshCcw} loading={tempQrCards.loading} onClick={refresh}>
            Làm mới
          </Button>
        </div>

        <div className="filter-grid" style={{ marginBottom: 16 }}>
          <FormField label="Lọc theo trạng thái">
            <Select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              options={[{ value: "", label: "Tất cả" }, ...statusOptions]}
              placeholder={null}
            />
          </FormField>
        </div>

        <Table columns={columns} data={cards} loading={tempQrCards.loading} />
      </section>

      {selectedCard && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="card section-card qr-modal-card animate-fade-in"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="section-header">
              <div>
                <h2 className="section-title">
                  <QrCode size={19} /> {selectedCard.cardCode || selectedCard.id}
                </h2>
                <p className="section-copy">Dùng mã này để in hoặc đối chiếu khi phát thẻ.</p>
              </div>
              <button className="theme-toggle-btn" onClick={() => setSelectedCard(null)} aria-label="Đóng QR">
                <X size={18} />
              </button>
            </div>

            <div className="qr-large-frame">
              <QrCodeImage
                value={selectedCard.cardCode || selectedCard.id}
                size={260}
                title={`QR ${selectedCard.cardCode || selectedCard.id}`}
              />
            </div>

            <div className="action-row" style={{ justifyContent: "center" }}>
              <span className={`pill ${getStatusTone(selectedCard.status)}`}>
                {getStatusLabel(selectedCard.status)}
              </span>
              <Button variant="outline" icon={Maximize2} onClick={() => window.print()}>
                In QR
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TempQrCardsPage;
