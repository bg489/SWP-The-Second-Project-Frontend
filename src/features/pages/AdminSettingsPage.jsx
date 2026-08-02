/**
 * @fileoverview Xây dựng màn hình AdminSettingsPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useState } from "react";
import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Table from "../../components/Table/Table";
import {
  formatCurrency,
  getStatusLabel,
  getStatusTone,
  payments,
  pricingPolicy,
  roleLabels,
  tempQrCards,
} from "../../services/mockParkingData";
import { CreditCard, QrCode, Save, Settings, ShieldCheck } from "lucide-react";

/**
 * Thực hiện nghiệp vụ `AdminSettingsPage` (admin settings page). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function AdminSettingsPage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const AdminSettingsPage = () => {
  const [policy, setPolicy] = useState(pricingPolicy);
  const [notice, setNotice] = useState("");

  /**
   * Xử lý nghiệp vụ `handleSave` (handle save). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
   *
   * @function handleSave
   * @param {*} event - Sự kiện phát sinh từ thao tác của người dùng.
   * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
   */
  const handleSave = (event) => {
    event.preventDefault();
    setNotice("Đã lưu quy tắc chung.");
    /* Callback nội bộ của lời gọi `setTimeout`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    setTimeout(() => setNotice(""), 2400);
  };

  const qrColumns = [
    { header: "Thẻ QR", key: "id" },
    { header: "Tên", key: "label" },
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
    { header: "Ghi chú", key: "note" },
  ];

  const paymentColumns = [
    { header: "Mã giao dịch", key: "transactionRef" },
    { header: "Đơn vị xử lý", key: "provider" },
    /**
     * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function render
     * @param {*} row - Giá trị `row` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    { header: "Số tiền", key: "amount", render: (row) => formatCurrency(row.amount) },
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
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><Settings size={16} /> Quy tắc chung</div>
          <h1 className="page-title">Quy tắc chung của hệ thống giữ xe</h1>
          <p className="page-subtitle">
            Theo dõi mức phí mặc định, thẻ QR tạm, thanh toán và nhóm quyền đang sử dụng.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Nhóm quyền</span>
          <span className="page-hero-number">4</span>
          <span className="page-hero-label">nhóm sử dụng</span>
        </div>
      </section>

      <StatusBanner success={notice} />

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><CreditCard size={19} /> Chính sách phí</h2>
              <p className="section-copy">Mặc định: xe máy 4.000đ/lượt, ô tô 20.000đ/giờ.</p>
            </div>
          </div>
          <form onSubmit={handleSave} style={{ display: "grid", gap: 14 }}>
            <FormField label="Phí xe máy theo lượt">
              <Input type="number" value={policy.motorbikeTurn} onChange={(event) => setPolicy({ ...policy, motorbikeTurn: Number(event.target.value) })} />
            </FormField>
            <FormField label="Phí ô tô theo giờ">
              <Input type="number" value={policy.carHourly} onChange={(event) => setPolicy({ ...policy, carHourly: Number(event.target.value) })} />
            </FormField>
            <FormField label="Phí mất thẻ QR">
              <Input type="number" value={policy.lostQrFine} onChange={(event) => setPolicy({ ...policy, lostQrFine: Number(event.target.value) })} />
            </FormField>
            <FormField label="Phí đỗ sai hoặc chiếm ô">
              <Input type="number" value={policy.wrongSlotFine} onChange={(event) => setPolicy({ ...policy, wrongSlotFine: Number(event.target.value) })} />
            </FormField>
            <Button type="submit" variant="primary" icon={Save}>Lưu chính sách</Button>
          </form>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><ShieldCheck size={19} /> Phân quyền</h2>
              <p className="section-copy">Mỗi nhóm người dùng chỉ nhìn thấy những màn hình phù hợp với công việc của mình.</p>
            </div>
          </div>
          <div className="data-list">
            {["USER", "PARKING_STAFF", "PARKING_MANAGER", "ADMIN"].map((key) => (
              <div className="data-row" key={key}>
                <span>{roleLabels[key]}</span>
                <strong>{key === "USER" ? "Đăng ký xe, mua gói, xem QR" : key === "PARKING_STAFF" ? "Vận hành cổng xe" : key === "PARKING_MANAGER" ? "Cấu hình bãi và xem báo cáo" : "Duyệt tài khoản và xe"}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><QrCode size={19} /> Kho thẻ QR tạm</h2>
            <p className="section-copy">Nhân viên phát cho khách vãng lai, sau khi xe ra thì thẻ có thể dùng lại.</p>
          </div>
        </div>
        <Table columns={qrColumns} data={tempQrCards} />
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><CreditCard size={19} /> Thanh toán VNPay</h2>
            <p className="section-copy">Theo dõi thanh toán cho gói tháng và lượt gửi xe.</p>
          </div>
        </div>
        <Table columns={paymentColumns} data={payments} />
      </section>
    </div>
  );
};

export default AdminSettingsPage;
