/**
 * @fileoverview Xây dựng màn hình ManagerPricingPackagesPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BadgeDollarSign, CalendarDays, CreditCard, Plus, RefreshCcw, Save, XCircle } from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import useResetAfterSuccess from "../../hooks/useResetAfterSuccess";
import {
  clearParkingNotice,
  deactivatePackagePlanRequest,
  fetchPackagePlansRequest,
  fetchPricingPoliciesRequest,
  savePackagePlanRequest,
  savePricingPolicyRequest,
} from "../backend/parking/parkingSlice";
import { fetchBuildingsRequest } from "../backend/buildings/buildingSlice";
import { formatCurrency, getStatusLabel, getStatusTone, getVehicleTypeLabel } from "../../services/mockParkingData";

/**
 * Khai báo `pricingTypeLabels` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/pages/ManagerPricingPackagesPage.jsx.
 */
const pricingTypeLabels = {
  TURN: "Theo lượt",
  HOURLY: "Theo giờ",
};

/**
 * Khai báo `statusOptions` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/pages/ManagerPricingPackagesPage.jsx.
 */
const statusOptions = [
  { value: "ACTIVE", label: "Đang áp dụng" },
  { value: "INACTIVE", label: "Ngưng áp dụng" },
];

/**
 * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `formatDate` (format date). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function formatDate
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const formatDate = (value) => (value ? new Date(value).toLocaleString("vi-VN") : "-");

/**
 * Thực hiện nghiệp vụ `ManagerPricingPackagesPage` (manager pricing packages page). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function ManagerPricingPackagesPage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const ManagerPricingPackagesPage = () => {
  const dispatch = useDispatch();
  const {
    pricingPolicies,
    packagePlans,
    notice,
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  } = useSelector((state) => state.parking);
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { buildings } = useSelector((state) => state.buildings);
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const effectiveBuildingId = selectedBuildingId || (buildings[0]?.id ? String(buildings[0].id) : "");

  const [priceForm, setPriceForm] = useState({
    vehicleType: "MOTORBIKE",
    pricingType: "TURN",
    amount: "4000",
    status: "ACTIVE",
  });

  const [planForm, setPlanForm] = useState({
    name: "Gói tháng xe máy",
    vehicleType: "MOTORBIKE",
    price: "120000",
    durationDays: "30",
    status: "ACTIVE",
  });

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    dispatch(fetchBuildingsRequest());
  }, [dispatch]);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    if (!effectiveBuildingId) return;

    dispatch(fetchPricingPoliciesRequest({ buildingId: effectiveBuildingId }));
    dispatch(fetchPackagePlansRequest({ buildingId: effectiveBuildingId }));
  }, [dispatch, effectiveBuildingId]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const activePackages = useMemo(() => {
    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return packagePlans.items.filter((plan) => (plan.status || "ACTIVE") === "ACTIVE").length;
  }, [packagePlans.items]);

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const sortedPricingPolicies = useMemo(() => {
    /* Callback nội bộ của lời gọi `sort`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return [...pricingPolicies.items].sort((left, right) => {
      const leftTime = new Date(left.updatedAt || left.createdAt || 0).getTime();
      const rightTime = new Date(right.updatedAt || right.createdAt || 0).getTime();

      return rightTime - leftTime || Number(right.id || 0) - Number(left.id || 0);
    });
  }, [pricingPolicies.items]);

  /**
   * Cập nhật nghiệp vụ `updatePriceForm` (update price form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function updatePriceForm
   * @param {*} field - Giá trị `field` được hàm sử dụng trong quá trình xử lý.
   * @param {*} value - Giá trị đầu vào cần xử lý.
   * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
   */
  const updatePriceForm = (field, value) => {
    dispatch(clearParkingNotice());
    /* Callback nội bộ của lời gọi `setPriceForm`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setPriceForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "vehicleType") {
        next.pricingType = value === "CAR" ? "HOURLY" : "TURN";
        next.amount = value === "CAR" ? "20000" : "4000";
      }

      return next;
    });
  };

  /**
   * Cập nhật nghiệp vụ `updatePlanForm` (update plan form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function updatePlanForm
   * @param {*} field - Giá trị `field` được hàm sử dụng trong quá trình xử lý.
   * @param {*} value - Giá trị đầu vào cần xử lý.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const updatePlanForm = (field, value) => {
    dispatch(clearParkingNotice());
    /* Callback nội bộ của lời gọi `setPlanForm`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setPlanForm((prev) => ({ ...prev, [field]: value }));
  };

  const markPriceSubmitted = useResetAfterSuccess({
    submitting: pricingPolicies.saving,
    success: notice,
    error: pricingPolicies.error,
    /**
     * Xử lý nghiệp vụ `onSuccess` (on success). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function onSuccess
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    onSuccess: () => setPriceForm({
      vehicleType: "MOTORBIKE",
      pricingType: "TURN",
      amount: "",
      status: "ACTIVE",
    }),
  });

  const markPlanSubmitted = useResetAfterSuccess({
    submitting: packagePlans.saving,
    success: notice,
    error: packagePlans.error,
    /**
     * Xử lý nghiệp vụ `onSuccess` (on success). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function onSuccess
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    onSuccess: () => setPlanForm({
      name: "",
      vehicleType: "MOTORBIKE",
      price: "",
      durationDays: "30",
      status: "ACTIVE",
    }),
  });

  /**
   * Xử lý nghiệp vụ `handleSavePrice` (handle save price). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handleSavePrice
   * @param {*} event - Sự kiện phát sinh từ thao tác của người dùng.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const handleSavePrice = (event) => {
    event.preventDefault();
    markPriceSubmitted();
    dispatch(
      savePricingPolicyRequest({
        vehicleType: priceForm.vehicleType,
        pricingType: priceForm.pricingType,
        amount: Number(priceForm.amount),
        status: priceForm.status,
        buildingId: Number(effectiveBuildingId),
      })
    );
  };

  /**
   * Xử lý nghiệp vụ `handleSavePlan` (handle save plan). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handleSavePlan
   * @param {*} event - Sự kiện phát sinh từ thao tác của người dùng.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const handleSavePlan = (event) => {
    event.preventDefault();
    markPlanSubmitted();
    dispatch(
      savePackagePlanRequest({
        name: planForm.name.trim(),
        vehicleType: planForm.vehicleType,
        price: Number(planForm.price),
        durationDays: Number(planForm.durationDays),
        status: planForm.status,
        buildingId: Number(effectiveBuildingId),
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
    dispatch(fetchPricingPoliciesRequest({ buildingId: effectiveBuildingId }));
    dispatch(fetchPackagePlansRequest({ buildingId: effectiveBuildingId }));
  };

  const priceColumns = [
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Tòa nhà", key: "buildingName", render: (row) => row.buildingName || "Dùng chung" },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Loại xe", key: "vehicleType", render: (row) => getVehicleTypeLabel(row.vehicleType) },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Cách tính", key: "pricingType", render: (row) => pricingTypeLabels[row.pricingType] || row.pricingType },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Mức thu", key: "amount", render: (row) => formatCurrency(row.amount) },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Cập nhật", key: "updatedAt", render: (row) => formatDate(row.updatedAt || row.createdAt) },
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
      render: (row) => <span className={`pill ${getStatusTone(row.status || "ACTIVE")}`}>{getStatusLabel(row.status || "ACTIVE")}</span>,
    },
  ];

  const packageColumns = [
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Tòa nhà", key: "buildingName", render: (row) => row.buildingName || "Dùng chung" },
    { header: "Tên gói", key: "name" },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Loại xe", key: "vehicleType", render: (row) => getVehicleTypeLabel(row.vehicleType) },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Thời hạn", key: "durationDays", render: (row) => `${row.durationDays || 30} ngày` },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Giá gói", key: "price", render: (row) => formatCurrency(row.price) },
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
      render: (row) => <span className={`pill ${getStatusTone(row.status || "ACTIVE")}`}>{getStatusLabel(row.status || "ACTIVE")}</span>,
    },
    {
      header: "Thao tác",
      key: "actions",
      /**
       * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
       *
       * @function render
       * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
       * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
       */
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          icon={XCircle}
          disabled={packagePlans.deletingId === row.id || (row.status || "ACTIVE") !== "ACTIVE"}
          loading={packagePlans.deletingId === row.id}
          onClick={() => dispatch(deactivatePackagePlanRequest({ id: row.id }))}
        >
          Ngưng
        </Button>
      ),
    },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><BadgeDollarSign size={16} /> Bảng giá</div>
          <h1 className="page-title">Cài đặt mức thu và gói tháng</h1>
          <p className="page-subtitle">
            Xe máy có thể tính theo lượt hoặc theo gói tháng. Ô tô tính theo giờ khi gửi lẻ và dùng gói tháng khi đã có ô đỗ phù hợp.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Gói đang áp dụng</span>
          <span className="page-hero-number">{activePackages}</span>
          <span className="page-hero-label">gói tháng</span>
        </div>
      </section>

      <StatusBanner success={notice} errors={[pricingPolicies.error, packagePlans.error]} />

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><BadgeDollarSign size={19} /> Chọn tòa nhà áp dụng</h2>
            <p className="section-copy">Mỗi tòa có giá lượt và gói tháng riêng.</p>
          </div>
        </div>
        <FormField label="Tòa nhà">
          <Select
            value={effectiveBuildingId}
            onChange={(event) => setSelectedBuildingId(event.target.value)}
            options={buildings.map((building) => ({ value: building.id, label: building.name }))}
            placeholder="Chọn tòa nhà"
          />
        </FormField>
      </section>

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><CreditCard size={19} /> Thêm mức thu</h2>
              <p className="section-copy">Dùng cho xe gửi lẻ: xe máy theo lượt, ô tô theo giờ.</p>
            </div>
          </div>

          <form onSubmit={handleSavePrice} style={{ display: "grid", gap: 14 }}>
            <FormField label="Loại xe">
              <Select
                value={priceForm.vehicleType}
                onChange={(event) => updatePriceForm("vehicleType", event.target.value)}
                options={[
                  { value: "MOTORBIKE", label: "Xe máy" },
                  { value: "CAR", label: "Ô tô" },
                ]}
                placeholder={null}
              />
            </FormField>

            <FormField label="Cách tính">
              <Select
                value={priceForm.pricingType}
                onChange={(event) => updatePriceForm("pricingType", event.target.value)}
                options={[
                  { value: "TURN", label: "Theo lượt" },
                  { value: "HOURLY", label: "Theo giờ" },
                ]}
                placeholder={null}
              />
            </FormField>

            <FormField label="Số tiền" required>
              <Input
                type="number"
                min="0"
                value={priceForm.amount}
                onChange={(event) => updatePriceForm("amount", event.target.value)}
              />
            </FormField>

            <FormField label="Trạng thái">
              <Select
                value={priceForm.status}
                onChange={(event) => updatePriceForm("status", event.target.value)}
                options={statusOptions}
                placeholder={null}
              />
            </FormField>

            <Button type="submit" icon={Save} loading={pricingPolicies.saving} disabled={!effectiveBuildingId || pricingPolicies.saving}>
              Lưu mức thu
            </Button>
          </form>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><CalendarDays size={19} /> Thêm gói tháng</h2>
              <p className="section-copy">Gói tháng được cư dân chọn sau khi xe đã được duyệt.</p>
            </div>
          </div>

          <form onSubmit={handleSavePlan} style={{ display: "grid", gap: 14 }}>
            <FormField label="Tên gói" required>
              <Input value={planForm.name} onChange={(event) => updatePlanForm("name", event.target.value)} />
            </FormField>

            <FormField label="Loại xe">
              <Select
                value={planForm.vehicleType}
                onChange={(event) => updatePlanForm("vehicleType", event.target.value)}
                options={[
                  { value: "MOTORBIKE", label: "Xe máy" },
                  { value: "CAR", label: "Ô tô" },
                ]}
                placeholder={null}
              />
            </FormField>

            <FormField label="Giá gói" required>
              <Input type="number" min="0" value={planForm.price} onChange={(event) => updatePlanForm("price", event.target.value)} />
            </FormField>

            <FormField label="Số ngày" required>
              <Input type="number" min="1" value={planForm.durationDays} onChange={(event) => updatePlanForm("durationDays", event.target.value)} />
            </FormField>

            <Button type="submit" icon={Plus} loading={packagePlans.saving} disabled={!effectiveBuildingId || packagePlans.saving}>
              Lưu gói tháng
            </Button>
          </form>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><BadgeDollarSign size={19} /> Mức thu hiện có</h2>
            <p className="section-copy">Các mức thu đang dùng cho xe gửi lẻ.</p>
          </div>
          <Button variant="outline" icon={RefreshCcw} loading={pricingPolicies.loading || packagePlans.loading} onClick={refresh}>
            Làm mới
          </Button>
        </div>
        <Table columns={priceColumns} data={sortedPricingPolicies} loading={pricingPolicies.loading} />
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><CalendarDays size={19} /> Gói tháng hiện có</h2>
            <p className="section-copy">Dùng cho cư dân sau khi xe đã được duyệt.</p>
          </div>
        </div>
        <Table columns={packageColumns} data={packagePlans.items} loading={packagePlans.loading} />
      </section>
    </div>
  );
};

export default ManagerPricingPackagesPage;
