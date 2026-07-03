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
import { useMockAuth } from "../../context/MockAuthContext";
import {
  clearParkingNotice,
  createTempQrCardRequest,
  fetchTempQrCardsRequest,
  updateTempQrCardStatusRequest,
} from "../backend/parking/parkingSlice";
import { fetchBuildingsRequest } from "../backend/buildings/buildingSlice";
import { getStatusLabel, getStatusTone } from "../../services/mockParkingData";

const statusOptions = [
  { value: "READY", label: "Sẵn sàng phát" },
  { value: "IN_USE", label: "Đang dùng" },
  { value: "RETURNED", label: "Đã trả" },
  { value: "COMPLETED", label: "Đã hoàn tất" },
  { value: "LOCKED", label: "Tạm khóa" },
  { value: "LOST", label: "Mất thẻ" },
];

const buildBuildingPrefix = (buildingName = "") => {
  const normalized = buildingName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim();
  const prefix = normalized
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return prefix || "QR";
};

const getNextPreviewNumber = (cards, prefix) => {
  const matcher = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-(\\d+)$`);

  return cards.reduce((max, card) => {
    const match = String(card.cardCode || "").match(matcher);
    if (!match) return max;

    return Math.max(max, Number(match[1]) || 0);
  }, 0) + 1;
};

const TempQrCardsPage = () => {
  const dispatch = useDispatch();
  const { role } = useMockAuth();
  const { user: authUser, frontendRole } = useSelector((state) => state.auth);
  const { tempQrCards, notice } = useSelector((state) => state.parking);
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

  useEffect(() => {
    dispatch(fetchBuildingsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (!effectiveBuildingId) return;

    dispatch(
      fetchTempQrCardsRequest({
        buildingId: effectiveBuildingId,
        ...(filter ? { status: filter } : {}),
      })
    );
  }, [dispatch, effectiveBuildingId, filter]);

  const cards = useMemo(() => {
    if (!filter) return tempQrCards.items;
    return tempQrCards.items.filter((card) => card.status === filter);
  }, [filter, tempQrCards.items]);

  const readyCount = useMemo(() => {
    return tempQrCards.items.filter((card) => card.status === "READY").length;
  }, [tempQrCards.items]);

  const selectedBuilding = buildings.find((building) => String(building.id) === String(effectiveBuildingId));
  const previewPrefix = buildBuildingPrefix(selectedBuilding?.name || authUser?.buildingName || "QR");
  const previewStart = getNextPreviewNumber(tempQrCards.items, previewPrefix);
  const previewEnd = previewStart + Math.max(Number(form.quantity) || 0, 1) - 1;
  const previewFirstCode = `${previewPrefix}-${String(previewStart).padStart(4, "0")}`;
  const previewLastCode = `${previewPrefix}-${String(previewEnd).padStart(4, "0")}`;

  const updateForm = (field, value) => {
    dispatch(clearParkingNotice());
    setFormError("");
    setForm((prev) => ({
      ...prev,
      [field]: field === "quantity" ? value.replace(/\D/g, "").slice(0, 3) : value,
    }));
  };

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

    dispatch(
      createTempQrCardRequest({
        quantity,
        buildingId: Number(effectiveBuildingId),
        status: form.status,
        note: form.note.trim() || undefined,
      })
    );
  };

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
      render: (row) => <strong>{row.cardCode || row.id}</strong>,
    },
    { header: "Tòa nhà", key: "buildingName", render: (row) => row.buildingName || "-" },
    {
      header: "Trạng thái",
      key: "status",
      render: (row) => <span className={`pill ${getStatusTone(row.status)}`}>{getStatusLabel(row.status)}</span>,
    },
    { header: "Gắn với lượt gửi", key: "currentSessionId", render: (row) => row.currentSessionId || "Chưa dùng" },
    { header: "Ghi chú", key: "note", render: (row) => row.note || "-" },
    {
      header: "Đổi trạng thái",
      key: "actions",
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
