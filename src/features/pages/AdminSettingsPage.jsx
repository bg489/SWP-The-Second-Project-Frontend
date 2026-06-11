import { useState } from "react";
import Button from "../../components/Button/Button";
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

const AdminSettingsPage = () => {
  const [policy, setPolicy] = useState(pricingPolicy);
  const [notice, setNotice] = useState("");

  const handleSave = (event) => {
    event.preventDefault();
    setNotice("Đã lưu chính sách mock. Khi nối backend sẽ gọi endpoint cấu hình tương ứng.");
    setTimeout(() => setNotice(""), 2400);
  };

  const qrColumns = [
    { header: "QR/Card", key: "id" },
    { header: "Tên", key: "label" },
    {
      header: "Trạng thái",
      key: "status",
      render: (row) => <span className={`pill ${getStatusTone(row.status)}`}>{getStatusLabel(row.status)}</span>,
    },
    { header: "Ghi chú", key: "note" },
  ];

  const paymentColumns = [
    { header: "Mã giao dịch", key: "transactionRef" },
    { header: "Provider", key: "provider" },
    { header: "Số tiền", key: "amount", render: (row) => formatCurrency(row.amount) },
    {
      header: "Trạng thái",
      key: "status",
      render: (row) => <span className={`pill ${getStatusTone(row.status)}`}>{getStatusLabel(row.status)}</span>,
    },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><Settings size={16} /> Admin settings</div>
          <h1 className="page-title">Chính sách phí, QR tạm, thanh toán và role hệ thống</h1>
          <p className="page-subtitle">
            Các vùng này tương ứng pricing constants, VNPay payment, QR/session card và phân quyền backend.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Role backend</span>
          <span className="page-hero-number">4</span>
          <span className="page-hero-label">USER/STAFF/MANAGER/ADMIN</span>
        </div>
      </section>

      {notice && <div className="card soft-panel"><strong>{notice}</strong></div>}

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><CreditCard size={19} /> Chính sách phí</h2>
              <p className="section-copy">Mặc định theo backend constants: xe máy lượt 4.000đ, ô tô 20.000đ/giờ.</p>
            </div>
          </div>
          <form onSubmit={handleSave} style={{ display: "grid", gap: 14 }}>
            <FormField label="Phí xe máy theo lượt">
              <Input type="number" value={policy.motorbikeTurn} onChange={(event) => setPolicy({ ...policy, motorbikeTurn: Number(event.target.value) })} />
            </FormField>
            <FormField label="Phí ô tô theo giờ">
              <Input type="number" value={policy.carHourly} onChange={(event) => setPolicy({ ...policy, carHourly: Number(event.target.value) })} />
            </FormField>
            <FormField label="Phí mất QR/session card">
              <Input type="number" value={policy.lostQrFine} onChange={(event) => setPolicy({ ...policy, lostQrFine: Number(event.target.value) })} />
            </FormField>
            <FormField label="Phí đỗ sai/chiếm slot">
              <Input type="number" value={policy.wrongSlotFine} onChange={(event) => setPolicy({ ...policy, wrongSlotFine: Number(event.target.value) })} />
            </FormField>
            <Button type="submit" variant="primary" icon={Save}>Lưu chính sách</Button>
          </form>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><ShieldCheck size={19} /> Phân quyền</h2>
              <p className="section-copy">Role giữ đúng tên backend để Saga/API dễ map.</p>
            </div>
          </div>
          <div className="data-list">
            {Object.entries(roleLabels).map(([key, label]) => (
              <div className="data-row" key={key}>
                <span>{key}</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><QrCode size={19} /> Kho QR/session card tạm</h2>
            <p className="section-copy">Staff phát cho khách vãng lai, trạng thái sẽ chuyển khi tạo/kết thúc phiên.</p>
          </div>
        </div>
        <Table columns={qrColumns} data={tempQrCards} />
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><CreditCard size={19} /> Thanh toán/VNPay mock</h2>
            <p className="section-copy">Dữ liệu map với bảng `payments`, gồm gói tháng và phiên gửi xe.</p>
          </div>
        </div>
        <Table columns={paymentColumns} data={payments} />
      </section>
    </div>
  );
};

export default AdminSettingsPage;
