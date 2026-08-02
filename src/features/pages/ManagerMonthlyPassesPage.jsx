/**
 * @fileoverview Xây dựng màn hình ManagerMonthlyPassesPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  CalendarDays,
  Car,
  Clock3,
  Eye,
  Mail,
  MapPin,
  Phone,
  QrCode,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import QrCodeImage from "../../components/QrCode/QrCodeImage";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import { fetchBuildingsRequest } from "../backend/buildings/buildingSlice";
import { clearParkingNotice, fetchQrPassesRequest } from "../backend/parking/parkingSlice";
import {
  formatCurrency,
  getStatusLabel,
  getStatusTone,
  getVehicleTypeLabel,
  roleLabels,
} from "../../services/mockParkingData";
import "./ManagerMonthlyPassesPage.css";

/**
 * Khai báo `statusOptions` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/pages/ManagerMonthlyPassesPage.jsx.
 */
const statusOptions = [
  { value: "", label: "Tất cả" },
  { value: "ACTIVE", label: "Còn hạn" },
  { value: "EXPIRING", label: "Sắp hết hạn" },
  { value: "PENDING_PAYMENT", label: "Chờ thanh toán" },
  { value: "EXPIRED", label: "Đã hết hạn" },
  { value: "CANCELLED", label: "Đã hủy" },
];

/**
 * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `normalizeText` (normalize text). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function normalizeText
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s.-]/g, "");

/**
 * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `normalizePlateQrValue` (normalize plate qr value). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function normalizePlateQrValue
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const normalizePlateQrValue = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s.-]/g, "");

/**
 * Lấy nghiệp vụ `getPassQrValue` (get pass qr value). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getPassQrValue
 * @param {*} pass - Giá trị `pass` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getPassQrValue = (pass) =>
  normalizePlateQrValue(pass?.plateNumber || pass?.vehiclePlateNumber) ||
  pass?.qrCode ||
  pass?.code ||
  "";

/**
 * Lấy nghiệp vụ `getPassStartDate` (get pass start date). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getPassStartDate
 * @param {*} pass - Giá trị `pass` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getPassStartDate = (pass) =>
  pass?.startDate || pass?.monthlyPassStartDate || pass?.validFrom;

/**
 * Lấy nghiệp vụ `getPassEndDate` (get pass end date). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getPassEndDate
 * @param {*} pass - Giá trị `pass` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getPassEndDate = (pass) =>
  pass?.endDate || pass?.monthlyPassEndDate || pass?.validTo || pass?.qrValidTo;

/**
 * Lấy nghiệp vụ `getPackageName` (get package name). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getPackageName
 * @param {*} pass - Giá trị `pass` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getPackageName = (pass) => {
  if (pass?.packagePlanName) return pass.packagePlanName;

  if (pass?.passType === "SLOT_REGISTRATION" || pass?.vehicleType === "CAR") {
    return `Gói tháng ô tô${pass?.slotCode ? ` - ô ${pass.slotCode}` : ""}`;
  }

  return pass?.note || "Gói tháng xe máy";
};

/**
 * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `formatDate` (format date). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function formatDate
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
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

/**
 * Lấy nghiệp vụ `getLifeState` (get life state). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getLifeState
 * @param {*} pass - Giá trị `pass` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getLifeState = (pass) => {
  const status = pass.status || "ACTIVE";

  if (status === "PENDING_PAYMENT") {
    return { label: "Chờ thanh toán", tone: "warning" };
  }

  if (status === "CANCELLED" || status === "INACTIVE") {
    return { label: "Đã hủy", tone: "danger" };
  }

  const endDate = getPassEndDate(pass);
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

/**
 * Thực hiện nghiệp vụ `ManagerMonthlyPassesPage` (manager monthly passes page). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function ManagerMonthlyPassesPage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const ManagerMonthlyPassesPage = () => {
  const dispatch = useDispatch();
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { qrPasses } = useSelector((state) => state.parking);
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { user } = useSelector((state) => state.auth);
  const {
    buildings,
    error: buildingsError,
    loading: buildingsLoading,
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  } = useSelector((state) => state.buildings);
  const [filters, setFilters] = useState({
    buildingId: "",
    q: "",
    status: "",
  });
  const [selectedPassId, setSelectedPassId] = useState(null);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    dispatch(fetchBuildingsRequest());
  }, [dispatch]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    dispatch(fetchQrPassesRequest(
      filters.buildingId ? { buildingId: Number(filters.buildingId) } : undefined
    ));
  }, [dispatch, filters.buildingId]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (!selectedPassId) return undefined;

    const previousOverflow = document.body.style.overflow;
    /**
     * Xóa hoặc đặt lại nghiệp vụ `closeOnEscape` (close on escape). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function closeOnEscape
     * @param {*} event - Sự kiện phát sinh từ thao tác của người dùng.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedPassId(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    /* Callback nội bộ của biểu thức hiện tại; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedPassId]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const rows = useMemo(() => {
    const keyword = normalizeText(filters.q);

    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return (qrPasses.items || []).filter((pass) => {
      const lifeState = getLifeState(pass);
      const matchesBuilding =
        !filters.buildingId ||
        Number(pass.buildingId) === Number(filters.buildingId);
      const matchesStatus =
        !filters.status ||
        (filters.status === "ACTIVE" && lifeState.tone === "success") ||
        (filters.status === "EXPIRING" && lifeState.tone === "warning") ||
        (filters.status === "EXPIRED" && lifeState.label === "Đã hết hạn") ||
        pass.status === filters.status;

      if (!matchesBuilding || !matchesStatus) return false;
      if (!keyword) return true;

      return [
        pass.ownerName,
        pass.ownerEmail,
        pass.ownerPhone,
        pass.plateNumber,
        getPackageName(pass),
        pass.qrCode,
        pass.slotCode,
        pass.slotFloorName,
      /* Callback nội bộ của lời gọi `some`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      ].some((value) => normalizeText(value).includes(keyword));
    });
  }, [filters.buildingId, filters.q, filters.status, qrPasses.items]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const summary = useMemo(() => {
    return rows.reduce(
      /* Callback nội bộ của lời gọi `reduce`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
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

  const selectedPass = useMemo(
    /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    () => (qrPasses.items || []).find(
      /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      (pass) => Number(pass.id) === Number(selectedPassId)
    ) || null,
    [qrPasses.items, selectedPassId]
  );

  const columns = [
    {
      header: "QR",
      key: "qrCode",
      width: "96px",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
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
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
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
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
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
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => getPackageName(row),
    },
    {
      header: "Thời hạn",
      key: "dateRange",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => `${formatDate(getPassStartDate(row))} - ${formatDate(getPassEndDate(row))}`,
    },
    {
      header: "Số tiền",
      key: "amount",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => formatCurrency(row.amount || 0),
    },
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
      render: (row) => {
        const lifeState = getLifeState(row);

        return <span className={`pill ${lifeState.tone}`}>{lifeState.label}</span>;
      },
    },
    {
      header: "Hồ sơ",
      key: "ownerProfile",
      width: "132px",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          icon={Eye}
          onClick={() => setSelectedPassId(row.id)}
        >
          Xem hồ sơ
        </Button>
      ),
    },
  ];

  /**
   * Thực hiện nghiệp vụ `refresh` (refresh). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function refresh
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const refresh = () => {
    dispatch(clearParkingNotice());
    dispatch(fetchQrPassesRequest(
      filters.buildingId ? { buildingId: Number(filters.buildingId) } : undefined
    ));
  };

  return (
    <div className="parking-page manager-monthly-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><QrCode size={16} /> QR tháng</div>
          <h1 className="page-title">Quản lý QR gói tháng của các tòa nhà</h1>
          <p className="page-subtitle">
            Theo dõi chủ xe, phương tiện, tòa nhà, gói đã mua, ngày hết hạn và mã QR đang được sử dụng.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Còn hạn</span>
          <span className="page-hero-number">{summary.active}</span>
          <span className="page-hero-label">thẻ QR</span>
        </div>
      </section>

      <StatusBanner errors={[qrPasses.error, buildingsError]} />

      <div className="dashboard-grid">
        <div className="card metric-card">
          <div className="metric-icon"><ShieldCheck size={22} /></div>
          <div className="metric-label">Tổng gói tháng</div>
          <div className="metric-value">{summary.total}</div>
          <div className="metric-note">Theo danh sách tòa nhà đang lọc</div>
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
            <p className="section-copy">Tìm nhanh theo tên, email, số điện thoại, biển số, tên gói hoặc mã QR.</p>
          </div>
          <Button variant="outline" icon={RefreshCcw} loading={qrPasses.loading} onClick={refresh}>
            Làm mới
          </Button>
        </div>

        <div className="filter-grid">
          <FormField label="Tòa nhà">
            <Select
              value={filters.buildingId}
              onChange={(event) => setFilters((prev) => ({
                ...prev,
                buildingId: event.target.value,
              }))}
              options={[
                { value: "", label: "Tất cả tòa nhà" },
                ...buildings.map((building) => ({
                  value: building.id,
                  label: building.name,
                })),
              ]}
              placeholder={null}
              disabled={buildingsLoading}
            />
          </FormField>
          <FormField label="Tìm kiếm">
            <Input
              value={filters.q}
              onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
              placeholder="Nhập tên, liên hệ, biển số hoặc mã QR"
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
          loading={qrPasses.loading}
          emptyMessage="Chưa có QR gói tháng phù hợp."
          pageSize={10}
        />
      </section>

      {selectedPass && createPortal(
        <div
          className="modal-backdrop monthly-owner-backdrop"
          role="presentation"
          onMouseDown={() => setSelectedPassId(null)}
        >
          <section
            className="card monthly-owner-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="monthly-owner-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="monthly-owner-header">
              <div>
                <span className="page-eyebrow"><UserRound size={15} /> Hồ sơ chủ thẻ</span>
                <h2 id="monthly-owner-title">{selectedPass.ownerName || "Chưa có tên"}</h2>
                <p>Thông tin dùng để đối chiếu người, phương tiện và gói tháng.</p>
              </div>
              <button
                type="button"
                className="monthly-owner-close"
                onClick={() => setSelectedPassId(null)}
                aria-label="Đóng hồ sơ"
              >
                <X size={20} />
              </button>
            </header>

            <div className="monthly-owner-profile">
              <div className="monthly-owner-avatar">
                {selectedPass.ownerAvatarUrl ? (
                  <img
                    src={selectedPass.ownerAvatarUrl}
                    alt={`Ảnh đại diện của ${selectedPass.ownerName || "chủ thẻ"}`}
                    style={{
                      objectPosition: `${Number(selectedPass.ownerAvatarCropX ?? 50)}% ${Number(selectedPass.ownerAvatarCropY ?? 50)}%`,
                      transform: `scale(${Number(selectedPass.ownerAvatarCropZoom ?? 1)})`,
                    }}
                  />
                ) : (
                  <UserRound size={38} />
                )}
              </div>
              <div className="monthly-owner-summary">
                <span>Chủ thẻ QR gói tháng</span>
                <strong>{selectedPass.ownerName || "Chưa có tên"}</strong>
                <div className="monthly-owner-pills">
                  <span className={`pill ${getStatusTone(selectedPass.ownerStatus)}`}>
                    {getStatusLabel(selectedPass.ownerStatus)}
                  </span>
                  <span className="pill neutral">
                    {roleLabels[selectedPass.ownerRole] || selectedPass.ownerRole || "Cư dân"}
                  </span>
                </div>
              </div>
            </div>

            <div className="monthly-owner-section">
              <h3><UserRound size={17} /> Thông tin cá nhân</h3>
              <div className="monthly-owner-detail-grid">
                <div>
                  <span><Mail size={15} /> Email</span>
                  <strong>{selectedPass.ownerEmail || "Chưa cập nhật"}</strong>
                </div>
                <div>
                  <span><Phone size={15} /> Số điện thoại</span>
                  <strong>{selectedPass.ownerPhone || "Chưa cập nhật"}</strong>
                </div>
                <div>
                  <span><Building2 size={15} /> Tòa nhà đang ở</span>
                  <strong>{selectedPass.ownerBuildingName || "Chưa gán tòa nhà"}</strong>
                </div>
                <div>
                  <span><MapPin size={15} /> Địa chỉ</span>
                  <strong>{selectedPass.ownerBuildingAddress || "Chưa cập nhật"}</strong>
                </div>
                <div className="monthly-owner-detail-wide">
                  <span><CalendarDays size={15} /> Ngày tạo tài khoản</span>
                  <strong>{formatDate(selectedPass.ownerCreatedAt)}</strong>
                </div>
              </div>
            </div>

            <div className="monthly-owner-section">
              <h3><Car size={17} /> Phương tiện và gói tháng</h3>
              <div className="monthly-owner-detail-grid">
                <div>
                  <span>Biển số</span>
                  <strong>{selectedPass.plateNumber || "-"}</strong>
                </div>
                <div>
                  <span>Loại xe</span>
                  <strong>{getVehicleTypeLabel(selectedPass.vehicleType)}</strong>
                </div>
                <div>
                  <span>Thông tin xe</span>
                  <strong>
                    {[selectedPass.vehicleBrand, selectedPass.vehicleColor]
                      .filter(Boolean)
                      .join(" - ") || "Chưa cập nhật"}
                  </strong>
                </div>
                <div>
                  <span>Trạng thái xe</span>
                  <strong>{getStatusLabel(selectedPass.vehicleStatus)}</strong>
                </div>
                <div>
                  <span>Tòa nhà sử dụng gói</span>
                  <strong>{selectedPass.buildingName || "-"}</strong>
                </div>
                <div>
                  <span>Tên gói</span>
                  <strong>{getPackageName(selectedPass)}</strong>
                </div>
                <div>
                  <span>Thời hạn</span>
                  <strong>
                    {formatDate(getPassStartDate(selectedPass))} - {formatDate(getPassEndDate(selectedPass))}
                  </strong>
                </div>
                {selectedPass.vehicleType === "CAR" && (
                  <div>
                    <span>Vị trí đăng ký</span>
                    <strong>
                      {[selectedPass.slotFloorName, selectedPass.slotCode]
                        .filter(Boolean)
                        .join(" - ") || "Chưa có thông tin ô đỗ"}
                    </strong>
                  </div>
                )}
                <div>
                  <span>Giá trị gói</span>
                  <strong>{formatCurrency(selectedPass.amount || 0)}</strong>
                </div>
              </div>
            </div>

            <footer className="monthly-owner-footer">
              <Button variant="primary" onClick={() => setSelectedPassId(null)}>
                Đóng hồ sơ
              </Button>
            </footer>
          </section>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ManagerMonthlyPassesPage;
