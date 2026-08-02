/**
 * @fileoverview Xây dựng màn hình VehicleActivityPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Camera,
  Car,
  Clock3,
  Eye,
  MapPin,
  RefreshCcw,
  Search,
  UserRound,
  X,
} from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import PlateCameraScanner from "../../components/PlateScanner/PlateCameraScanner";
import Table from "../../components/Table/Table";
import { fetchBuildingsRequest } from "../backend/buildings/buildingSlice";
import { fetchDailyParkingActivityRequest } from "../backend/parking/parkingSlice";
import {
  formatCurrency,
  formatDateTime,
  getStatusLabel,
  getStatusTone,
  getVehicleTypeLabel,
} from "../../services/mockParkingData";
import { formatPlateNumber } from "../../utils/licensePlate";
import "./VehicleActivityPage.css";

/**
 * Lấy nghiệp vụ `getVietnamDate` (get vietnam date). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getVietnamDate
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getVietnamDate = () =>
  new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
  }).format(new Date());

/**
 * Khai báo `EMPTY_SUMMARY` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/pages/VehicleActivityPage.jsx.
 */
const EMPTY_SUMMARY = {
  currentlyParked: { total: 0, motorbike: 0, car: 0 },
  enteredToday: { total: 0, motorbike: 0, car: 0 },
  exitedToday: { total: 0, motorbike: 0, car: 0 },
};

/**
 * Khai báo `activityOptions` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/pages/VehicleActivityPage.jsx.
 */
const activityOptions = [
  { value: "ALL", label: "Tất cả hoạt động" },
  { value: "CURRENTLY_PARKED", label: "Đang gửi trong bãi" },
  { value: "ENTERED", label: "Đã vào trong ngày" },
  { value: "EXITED", label: "Đã ra trong ngày" },
];

/**
 * Khai báo `vehicleOptions` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/pages/VehicleActivityPage.jsx.
 */
const vehicleOptions = [
  { value: "", label: "Tất cả loại xe" },
  { value: "MOTORBIKE", label: "Xe máy" },
  { value: "CAR", label: "Ô tô" },
];

/**
 * Thực hiện nghiệp vụ `ActivityBadges` (activity badges). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function ActivityBadges
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const ActivityBadges = ({ session }) => (
  <div className="activity-badges">
    {session.currentlyParked && <span className="pill success">Đang gửi</span>}
    {session.enteredOnDate && <span className="pill info">Đã vào</span>}
    {session.exitedOnDate && <span className="pill warning">Đã ra</span>}
  </div>
);

/**
 * Thực hiện nghiệp vụ `ActivityMetric` (activity metric). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function ActivityMetric
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const ActivityMetric = ({ icon: Icon, label, summary, note }) => (
  <article className="card activity-metric-card">
    <div className="activity-metric-head">
      <div className="metric-icon"><Icon size={22} /></div>
      <div>
        <div className="metric-label">{label}</div>
        <div className="metric-value">{Number(summary?.total || 0).toLocaleString("vi-VN")}</div>
      </div>
    </div>
    <div className="activity-metric-breakdown">
      <span><strong>{Number(summary?.motorbike || 0).toLocaleString("vi-VN")}</strong> xe máy</span>
      <span><strong>{Number(summary?.car || 0).toLocaleString("vi-VN")}</strong> ô tô</span>
    </div>
    <p className="metric-note">{note}</p>
  </article>
);

/**
 * Tạo nghiệp vụ `BuildingActivityCard` (building activity card). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function BuildingActivityCard
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const BuildingActivityCard = ({ building }) => {
  const metrics = [
    { key: "currentlyParked", label: "Đang gửi", icon: Car },
    { key: "enteredToday", label: "Đã vào", icon: ArrowDownLeft },
    { key: "exitedToday", label: "Đã ra", icon: ArrowUpRight },
  ];

  return (
    <article className="card activity-building-card">
      <div className="activity-building-header">
        <div className="activity-building-icon"><Building2 size={21} /></div>
        <div>
          <h3>{building.buildingName}</h3>
          <p>{building.buildingAddress || "Chưa cập nhật địa chỉ"}</p>
        </div>
      </div>

      <div className="activity-building-metrics">
        {metrics.map(({ key, label, icon: Icon }) => {
          const values = building[key] || EMPTY_SUMMARY[key];

          return (
            <div className="activity-building-metric" key={key}>
              <div className="activity-building-metric-title">
                <span><Icon size={15} /> {label}</span>
                <strong>{Number(values.total || 0).toLocaleString("vi-VN")}</strong>
              </div>
              <div className="activity-building-vehicle-counts">
                <span>Xe máy <strong>{Number(values.motorbike || 0).toLocaleString("vi-VN")}</strong></span>
                <span>Ô tô <strong>{Number(values.car || 0).toLocaleString("vi-VN")}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
};

/**
 * Thực hiện nghiệp vụ `VehicleActivityPage` (vehicle activity page). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function VehicleActivityPage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const VehicleActivityPage = () => {
  const dispatch = useDispatch();
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { user, frontendRole } = useSelector((state) => state.auth);
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { buildings, error: buildingsError } = useSelector((state) => state.buildings);
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const dailyActivity = useSelector((state) => state.parking.parkingSessions.dailyActivity);
  const isManager = frontendRole === "PARKING_MANAGER" || user?.role === "MANAGER";
  const isStaff = frontendRole === "PARKING_STAFF" || user?.role === "STAFF";
  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const today = useMemo(() => getVietnamDate(), []);
  const [filters, setFilters] = useState({
    activity: "ALL",
    buildingId: isStaff && user?.buildingId ? String(user.buildingId) : "",
    date: today,
    search: "",
    vehicleType: "",
  });
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const staffBuildingId = isStaff && user?.buildingId ? String(user.buildingId) : "";
  const effectiveBuildingId = isStaff ? staffBuildingId : filters.buildingId;

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (isManager) dispatch(fetchBuildingsRequest());
  }, [dispatch, isManager]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    /* Callback nội bộ của lời gọi `setTimeout`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    const timer = window.setTimeout(() => {
      dispatch(fetchDailyParkingActivityRequest({
        activity: filters.activity,
        buildingId: effectiveBuildingId || undefined,
        date: filters.date,
        search: filters.search.trim() || undefined,
        vehicleType: filters.vehicleType || undefined,
      }));
    }, filters.search ? 350 : 0);

    /* Callback nội bộ của biểu thức hiện tại; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return () => window.clearTimeout(timer);
  }, [dispatch, effectiveBuildingId, filters]);

  const sessions = Array.isArray(dailyActivity?.sessions) ? dailyActivity.sessions : [];
  const buildingSummaries = Array.isArray(dailyActivity?.buildingSummaries)
    ? dailyActivity.buildingSummaries
    : [];
  const summary = dailyActivity?.summary || EMPTY_SUMMARY;
  const selectedSession = sessions.find(
    /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    (session) => String(session.id) === String(selectedSessionId)
  );
  const selectedBuilding = buildings.find(
    /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    (building) => String(building.id) === String(effectiveBuildingId)
  );
  const scopeLabel = isStaff
    ? user?.buildingName || selectedBuilding?.name || "Tòa nhà đang làm việc"
    : selectedBuilding?.name || "Tất cả tòa nhà";

  /**
   * Thực hiện nghiệp vụ `requestData` (request data). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function requestData
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const requestData = () => {
    dispatch(fetchDailyParkingActivityRequest({
      activity: filters.activity,
      buildingId: effectiveBuildingId || undefined,
      date: filters.date,
      search: filters.search.trim() || undefined,
      vehicleType: filters.vehicleType || undefined,
    }));
  };

  /**
   * Xóa hoặc đặt lại nghiệp vụ `resetFilters` (reset filters). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function resetFilters
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const resetFilters = () => {
    setFilters({
      activity: "ALL",
      buildingId: isStaff ? staffBuildingId : "",
      date: today,
      search: "",
      vehicleType: "",
    });
  };

  /**
   * Xử lý nghiệp vụ `handlePlateScan` (handle plate scan). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handlePlateScan
   * @param {*} plateNumber - Giá trị `plateNumber` được hàm sử dụng trong quá trình xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const handlePlateScan = (plateNumber) => {
    /* Callback nội bộ của lời gọi `setFilters`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setFilters((current) => ({
      ...current,
      search: formatPlateNumber(plateNumber),
    }));
  };

  const columns = [
    {
      header: "Biển số",
      key: "plateNumber",
      minWidth: 125,
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => (
        <div className="activity-plate-cell">
          <strong>{row.plateNumber}</strong>
          <span>{getVehicleTypeLabel(row.vehicleType)}</span>
        </div>
      ),
    },
    {
      header: "Hoạt động",
      key: "activity",
      minWidth: 170,
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => <ActivityBadges session={row} />,
    },
    {
      header: "Chủ xe",
      key: "ownerName",
      minWidth: 180,
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => (
        <div className="activity-owner-cell">
          <strong>{row.ownerName || "Khách vãng lai"}</strong>
          <span>{row.ownerPhone || row.ownerEmail || "Không có hồ sơ cá nhân"}</span>
        </div>
      ),
    },
    {
      header: "Tòa nhà / vị trí",
      key: "buildingName",
      minWidth: 190,
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => (
        <div className="activity-owner-cell">
          <strong>{row.buildingName}</strong>
          <span>{row.floorName}{row.slotCode ? ` - ${row.slotCode}` : " - Khu xe máy"}</span>
        </div>
      ),
    },
    {
      header: "Giờ vào",
      key: "checkInAt",
      minWidth: 150,
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => formatDateTime(row.checkInAt),
    },
    {
      header: "Giờ ra",
      key: "checkOutAt",
      minWidth: 150,
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => row.status === "COMPLETED" && row.checkOutAt
        ? formatDateTime(row.checkOutAt)
        : "Chưa ra",
    },
    {
      header: "Trạng thái",
      key: "status",
      minWidth: 130,
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => (
        <span className={`pill ${getStatusTone(row.status)}`}>{getStatusLabel(row.status)}</span>
      ),
    },
    {
      header: "Chi tiết",
      key: "detail",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => (
        <Button size="sm" variant="outline" icon={Eye} onClick={() => setSelectedSessionId(row.id)}>
          Xem
        </Button>
      ),
    },
  ];

  return (
    <div className="parking-page vehicle-activity-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><Clock3 size={16} /> Nhật ký ra vào</div>
          <h1 className="page-title">Lượt xe trong ngày tại {scopeLabel}</h1>
          <p className="page-subtitle">
            Theo dõi xe máy và ô tô đang gửi, đã vào, đã ra cùng hồ sơ người dùng và vị trí đỗ thực tế.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Đang trong bãi</span>
          <span className="page-hero-number">{Number(summary.currentlyParked?.total || 0).toLocaleString("vi-VN")}</span>
          <span className="page-hero-label">xe</span>
        </div>
      </section>

      <StatusBanner errors={[dailyActivity?.error, buildingsError]} />

      <section className="card section-card activity-filter-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Search size={19} /> Tìm lượt xe</h2>
            <p className="section-copy">Có thể nhập một phần biển số, tên, email hoặc số điện thoại.</p>
          </div>
          <div className="action-row">
            <Button variant="outline" icon={RefreshCcw} onClick={requestData} loading={dailyActivity?.loading}>
              Làm mới
            </Button>
            <Button variant="secondary" onClick={resetFilters}>Xóa bộ lọc</Button>
          </div>
        </div>

        <div className="activity-filter-grid">
          <FormField label="Ngày xem">
            <Input
              type="date"
              value={filters.date}
              max={today}
                  onChange={(event) => setFilters((current) => ({
                    ...current,
                    date: event.target.value || today,
                  }))}
              icon={CalendarDays}
            />
          </FormField>

          {isManager ? (
            <FormField label="Tòa nhà">
              <Select
                value={filters.buildingId}
                onChange={(event) => setFilters((current) => ({ ...current, buildingId: event.target.value }))}
                options={[
                  { value: "", label: "Tất cả tòa nhà" },
                  ...buildings.map((building) => ({ value: building.id, label: building.name })),
                ]}
                placeholder={null}
              />
            </FormField>
          ) : (
            <div className="activity-fixed-building">
              <span>Tòa nhà</span>
              <strong><Building2 size={16} /> {scopeLabel}</strong>
            </div>
          )}

          <FormField label="Loại xe">
            <Select
              value={filters.vehicleType}
              onChange={(event) => setFilters((current) => ({ ...current, vehicleType: event.target.value }))}
              options={vehicleOptions}
              placeholder={null}
            />
          </FormField>

          <FormField label="Hoạt động">
            <Select
              value={filters.activity}
              onChange={(event) => setFilters((current) => ({ ...current, activity: event.target.value }))}
              options={activityOptions}
              placeholder={null}
            />
          </FormField>

          <FormField label="Tìm kiếm">
            <Input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Biển số, tên hoặc liên hệ"
              icon={Search}
            />
          </FormField>

          <div className="activity-scan-control">
            <span>Quét biển số</span>
            <Button variant="primary" icon={Camera} onClick={() => setScannerOpen(true)}>
              Chụp biển số
            </Button>
          </div>
        </div>
      </section>

      <div className="activity-summary-grid">
        <ActivityMetric
          icon={Car}
          label="Đang gửi"
          summary={summary.currentlyParked}
          note="Tổng xe hiện vẫn thuộc phiên đang mở"
        />
        <ActivityMetric
          icon={ArrowDownLeft}
          label="Đã vào trong ngày"
          summary={summary.enteredToday}
          note={`Tính theo ngày ${new Date(`${filters.date}T00:00:00`).toLocaleDateString("vi-VN")}`}
        />
        <ActivityMetric
          icon={ArrowUpRight}
          label="Đã ra trong ngày"
          summary={summary.exitedToday}
          note="Chỉ tính những lượt đã ghi nhận thời điểm ra"
        />
      </div>

      <section className="activity-building-section">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Building2 size={19} /> Thống kê theo từng tòa nhà</h2>
            <p className="section-copy">
              Số liệu ngày {new Date(`${filters.date}T00:00:00`).toLocaleDateString("vi-VN")}, tách riêng xe máy và ô tô tại mỗi tòa.
            </p>
          </div>
        </div>

        {buildingSummaries.length > 0 ? (
          <div className="activity-building-grid">
            {buildingSummaries.map((building) => (
              <BuildingActivityCard building={building} key={building.buildingId} />
            ))}
          </div>
        ) : (
          <div className="card activity-building-empty">
            Chưa có tòa nhà để thống kê.
          </div>
        )}
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Car size={19} /> Danh sách xe</h2>
            <p className="section-copy">
              {sessions.length.toLocaleString("vi-VN")} lượt phù hợp với bộ lọc hiện tại. Mỗi trang hiển thị 10 dòng.
            </p>
          </div>
        </div>
        <Table
          columns={columns}
          data={sessions}
          loading={dailyActivity?.loading}
          emptyMessage="Không tìm thấy lượt xe phù hợp trong ngày này."
          pageSize={10}
        />
      </section>

      <PlateCameraScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handlePlateScan}
        title="Chụp biển số để tìm lượt xe"
      />

      {selectedSession && (
        <div className="modal-backdrop activity-detail-backdrop" role="dialog" aria-modal="true">
          <section className="card activity-detail-modal">
            <div className="activity-detail-header">
              <div>
                <span className="page-eyebrow"><Car size={15} /> Hồ sơ lượt xe #{selectedSession.id}</span>
                <h2>{selectedSession.plateNumber}</h2>
                <ActivityBadges session={selectedSession} />
              </div>
              <button type="button" onClick={() => setSelectedSessionId(null)} aria-label="Đóng chi tiết">
                <X size={20} />
              </button>
            </div>

            <div className="activity-detail-grid">
              <div className="activity-person-panel">
                <div className="activity-avatar">
                  {selectedSession.ownerAvatarUrl ? (
                    <img src={selectedSession.ownerAvatarUrl} alt={selectedSession.ownerName || "Chủ xe"} />
                  ) : (
                    <UserRound size={32} />
                  )}
                </div>
                <div>
                  <span>{selectedSession.customerType === "REGISTERED_USER" ? "Chủ xe" : "Loại khách"}</span>
                  <strong>{selectedSession.ownerName || "Khách vãng lai"}</strong>
                  <p>{selectedSession.ownerEmail || "Không có email"}</p>
                  <p>{selectedSession.ownerPhone || "Không có số điện thoại"}</p>
                </div>
              </div>

              {selectedSession.plateImageUrl && (
                <div className="activity-plate-image">
                  <img src={selectedSession.plateImageUrl} alt={`Biển số ${selectedSession.plateNumber}`} />
                </div>
              )}
            </div>

            <div className="activity-detail-rows">
              <div><span>Phương tiện</span><strong>{getVehicleTypeLabel(selectedSession.vehicleType)}{selectedSession.vehicleBrand ? ` - ${selectedSession.vehicleBrand}` : ""}{selectedSession.vehicleColor ? ` - ${selectedSession.vehicleColor}` : ""}</strong></div>
              <div><span><MapPin size={15} /> Vị trí</span><strong>{selectedSession.buildingName} - {selectedSession.floorName}{selectedSession.slotCode ? ` - ${selectedSession.slotCode}` : ""}</strong></div>
              <div><span>Giờ vào</span><strong>{formatDateTime(selectedSession.checkInAt)}</strong></div>
              <div><span>Nhân viên nhận xe</span><strong>{selectedSession.checkInStaffName || "Chưa có thông tin"}</strong></div>
              <div><span>Giờ ra</span><strong>{selectedSession.status === "COMPLETED" && selectedSession.checkOutAt ? formatDateTime(selectedSession.checkOutAt) : "Chưa ra"}</strong></div>
              <div><span>Nhân viên trả xe</span><strong>{selectedSession.checkOutStaffName || "Chưa có"}</strong></div>
              <div><span>Phí gửi xe</span><strong>{formatCurrency(selectedSession.baseFee || 0)}</strong></div>
              <div><span>Phí vi phạm</span><strong>{formatCurrency(selectedSession.violationFee || 0)}</strong></div>
              <div><span>Tổng thanh toán</span><strong>{formatCurrency(selectedSession.totalAmount || 0)}</strong></div>
              <div><span>Trạng thái thanh toán</span><strong>{getStatusLabel(selectedSession.paymentStatus)}</strong></div>
            </div>

            <Button variant="primary" onClick={() => setSelectedSessionId(null)}>Đóng hồ sơ</Button>
          </section>
        </div>
      )}
    </div>
  );
};

export default VehicleActivityPage;
