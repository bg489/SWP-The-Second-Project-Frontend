import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { QrCode, RefreshCcw, Save, ShieldAlert } from "lucide-react";

import Button from "../../components/Button/Button";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import { useMockAuth } from "../../context/MockAuthContext";
import {
  clearParkingNotice,
  createTempQrCardRequest,
  fetchTempQrCardsRequest,
  updateTempQrCardStatusRequest,
} from "../backend/parking/parkingSlice";
import { getStatusLabel, getStatusTone } from "../../services/mockParkingData";

const statusOptions = [
  { value: "READY", label: "Sẵn sàng phát" },
  { value: "IN_USE", label: "Đang dùng" },
  { value: "RETURNED", label: "Đã trả" },
  { value: "COMPLETED", label: "Đã hoàn tất" },
  { value: "LOCKED", label: "Tạm khóa" },
  { value: "LOST", label: "Mất thẻ" },
];

const TempQrCardsPage = () => {
  const dispatch = useDispatch();
  const { role } = useMockAuth();
  const { tempQrCards, notice } = useSelector((state) => state.parking);
  const canCreate = role === "PARKING_MANAGER";

  const [form, setForm] = useState({
    cardCode: "TEMP-001",
    status: "READY",
  });

  const [filter, setFilter] = useState("");

  useEffect(() => {
    dispatch(fetchTempQrCardsRequest());
  }, [dispatch]);

  const cards = useMemo(() => {
    if (!filter) return tempQrCards.items;
    return tempQrCards.items.filter((card) => card.status === filter);
  }, [filter, tempQrCards.items]);

  const readyCount = useMemo(() => {
    return tempQrCards.items.filter((card) => card.status === "READY").length;
  }, [tempQrCards.items]);

  const updateForm = (field, value) => {
    dispatch(clearParkingNotice());
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const createCard = (event) => {
    event.preventDefault();
    dispatch(
      createTempQrCardRequest({
        cardCode: form.cardCode.trim().toUpperCase(),
        status: form.status,
      })
    );
  };

  const refresh = () => {
    dispatch(clearParkingNotice());
    dispatch(fetchTempQrCardsRequest(filter ? { status: filter } : undefined));
  };

  const columns = [
    {
      header: "Mã thẻ",
      key: "cardCode",
      render: (row) => <strong>{row.cardCode || row.id}</strong>,
    },
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

      {(notice || tempQrCards.error) && (
        <section className="card soft-panel">
          {notice && <span className="pill success">{notice}</span>}
          {tempQrCards.error && <p style={{ color: "var(--danger)" }}>{tempQrCards.error}</p>}
        </section>
      )}

      <div className={canCreate ? "two-column-grid" : "dashboard-grid"}>
        {canCreate && (
          <section className="card section-card">
            <div className="section-header">
              <div>
                <h2 className="section-title"><Save size={19} /> Thêm thẻ QR</h2>
                <p className="section-copy">Tạo sẵn thẻ để nhân viên phát cho khách vãng lai.</p>
              </div>
            </div>
            <form onSubmit={createCard} style={{ display: "grid", gap: 14 }}>
              <FormField label="Mã thẻ" required>
                <Input value={form.cardCode} onChange={(event) => updateForm("cardCode", event.target.value)} />
              </FormField>
              <FormField label="Trạng thái ban đầu">
                <Select
                  value={form.status}
                  onChange={(event) => updateForm("status", event.target.value)}
                  options={statusOptions}
                  placeholder={null}
                />
              </FormField>
              <Button type="submit" icon={Save} loading={tempQrCards.saving}>
                Lưu thẻ QR
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
    </div>
  );
};

export default TempQrCardsPage;
