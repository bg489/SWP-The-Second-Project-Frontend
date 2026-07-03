import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CalendarDays, Clock3, QrCode, RefreshCcw, Search, ShieldCheck } from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import QrCodeImage from "../../components/QrCode/QrCodeImage";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import { clearParkingNotice, fetchMonthlyPassesRequest } from "../backend/parking/parkingSlice";
import { formatCurrency } from "../../services/mockParkingData";

const statusOptions = [
  { value: "", label: "Tất cả" },
  { value: "ACTIVE", label: "Còn hạn" },
  { value: "EXPIRING", label: "Sắp hết hạn" },
  { value: "PENDING_PAYMENT", label: "Chờ thanh toán" },
  { value: "EXPIRED", label: "Đã hết hạn" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s.-]/g, "");

const normalizePlateQrValue = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s.-]/g, "");

const getPassQrValue = (pass) =>
  normalizePlateQrValue(pass?.plateNumber || pass?.vehiclePlateNumber) ||
  pass?.qrCode ||
  pass?.code ||
  "";

const formatDate = (value) => {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "-";
  }
};

const getLifeState = (pass) => {
  const status = pass.status || "ACTIVE";

  if (status === "PENDING_PAYMENT") {
    return { label: "Chờ thanh toán", tone: "warning" };
  }

  if (status === "CANCELLED" || status === "INACTIVE") {
    return { label: "Đã hủy", tone: "danger" };
  }

  const endDate = pass.endDate || pass.qrValidTo;
  const endTime = endDate ? new Date(endDate).getTime() : 0;
  const now = Date.now();
  const daysLeft = endTime ? Math.ceil((endTime - now) / 86400000) : null;

  if (daysLeft !== null && daysLeft < 0) {
    return { label: "Đã hết hạn", tone: "danger" };
  }

  if (daysLeft !== null && daysLeft <= 7) {
    return { label: `Sắp hết hạn (${daysLeft} ngày)`, tone: "warning" };
  }

  return { label: "Còn hạn", tone: "success" };
};

const ManagerMonthlyPassesPage = () => {
  const dispatch = useDispatch();
  const { monthlyPasses } = useSelector((state) => state.parking);
  const { user } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({
    q: "",
    status: "",
  });

  useEffect(() => {
    dispatch(fetchMonthlyPassesRequest());
  }, [dispatch]);

  const rows = useMemo(() => {
    const keyword = normalizeText(filters.q);

    return (monthlyPasses.items || []).filter((pass) => {
      const lifeState = getLifeState(pass);
      const matchesStatus =
        !filters.status ||
        (filters.status === "ACTIVE" && lifeState.tone === "success") ||
        (filters.status === "EXPIRING" && lifeState.tone === "warning") ||
        (filters.status === "EXPIRED" && lifeState.label === "Đã hết hạn") ||
        pass.status === filters.status;

      if (!matchesStatus) return false;
      if (!keyword) return true;

      return [
        pass.ownerName,
        pass.plateNumber,
        pass.packagePlanName,
        pass.qrCode,
      ].some((value) => normalizeText(value).includes(keyword));
    });
  }, [filters.q, filters.status, monthlyPasses.items]);

  const summary = useMemo(() => {
    return rows.reduce(
      (result, pass) => {
        const lifeState = getLifeState(pass);
        result.total += 1;
        result.amount += Number(pass.amount || 0);

        if (lifeState.tone === "success") result.active += 1;
        if (lifeState.tone === "warning") result.expiring += 1;
        if (lifeState.tone === "danger") result.expired += 1;

        return result;
      },
      { active: 0, amount: 0, expired: 0, expiring: 0, total: 0 }
    );
  }, [rows]);

  const columns = [
    {
      header: "QR",
      key: "qrCode",
      width: "96px",
      render: (row) => {
        const qrValue = getPassQrValue(row);

        return qrValue ? (
          <QrCodeImage value={qrValue} size={62} title={`QR ${row.plateNumber || row.id}`} />
        ) : (
          <span className="pill warning">Chưa có</span>
        );
      },
    },
    {
      header: "Người dùng",
      key: "ownerName",
      render: (row) => (
        <div>
          <strong>{row.ownerName || "Chưa có tên"}</strong>
          <p className="section-copy">{row.buildingName || user?.buildingName || "Tòa đang quản lý"}</p>
        </div>
      ),
    },
    {
      header: "Xe",
      key: "plateNumber",
      render: (row) => (
        <div>
          <strong>{row.plateNumber || "-"}</strong>
          <p className="section-copy">{row.vehicleType === "CAR" ? "Ô tô" : "Xe máy"}</p>
        </div>
      ),
    },
    {
      header: "Gói",
      key: "packagePlanName",
      render: (row) => row.packagePlanName || row.note || "Gói tháng",
    },
    {
      header: "Thời hạn",
      key: "dateRange",
      render: (row) => `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`,
    },
    {
      header: "Số tiền",
      key: "amount",
      render: (row) => formatCurrency(row.amount || 0),
    },
    {
      header: "Trạng thái",
      key: "status",
      render: (row) => {
        const lifeState = getLifeState(row);

        return <span className={`pill ${lifeState.tone}`}>{lifeState.label}</span>;
      },
    },
  ];

  const refresh = () => {
    dispatch(clearParkingNotice());
    dispatch(fetchMonthlyPassesRequest());
  };

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><QrCode size={16} /> QR tháng</div>
          <h1 className="page-title">Quản lý QR gói tháng trong tòa nhà</h1>
          <p className="page-subtitle">
            Theo dõi chủ xe, phương tiện, gói đã mua, ngày hết hạn và mã QR đang được dùng tại tòa của bạn.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Còn hạn</span>
          <span className="page-hero-number">{summary.active}</span>
          <span className="page-hero-label">thẻ QR</span>
        </div>
      </section>

      <StatusBanner errors={monthlyPasses.error} />

      <div className="dashboard-grid">
        <div className="card metric-card">
          <div className="metric-icon"><ShieldCheck size={22} /></div>
          <div className="metric-label">Tổng gói tháng</div>
          <div className="metric-value">{summary.total}</div>
          <div className="metric-note">Trong tòa đang quản lý</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><Clock3 size={22} /></div>
          <div className="metric-label">Sắp hết hạn</div>
          <div className="metric-value">{summary.expiring}</div>
          <div className="metric-note">Cần nhắc người dùng gia hạn</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><CalendarDays size={22} /></div>
          <div className="metric-label">Đã hết hạn</div>
          <div className="metric-value">{summary.expired}</div>
          <div className="metric-note">Không còn dùng để ra vào</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><QrCode size={22} /></div>
          <div className="metric-label">Doanh thu gói</div>
          <div className="metric-value">{formatCurrency(summary.amount)}</div>
          <div className="metric-note">Tổng theo danh sách đang lọc</div>
        </div>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Search size={19} /> Danh sách QR gói tháng</h2>
            <p className="section-copy">Tìm nhanh theo tên người dùng, biển số, tên gói hoặc mã QR.</p>
          </div>
          <Button variant="outline" icon={RefreshCcw} loading={monthlyPasses.loading} onClick={refresh}>
            Làm mới
          </Button>
        </div>

        <div className="filter-grid">
          <FormField label="Tìm kiếm">
            <Input
              value={filters.q}
              onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
              placeholder="Nhập tên, biển số hoặc mã QR"
            />
          </FormField>
          <FormField label="Trạng thái">
            <Select
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
              options={statusOptions}
              placeholder={null}
            />
          </FormField>
        </div>

        <Table
          columns={columns}
          data={rows}
          loading={monthlyPasses.loading}
          emptyMessage="Chưa có QR gói tháng trong tòa này."
        />
      </section>
    </div>
  );
};

export default ManagerMonthlyPassesPage;
