import { useMemo, useState } from "react";
import Button from "../../components/Button/Button";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import Table from "../../components/Table/Table";
import {
  carSlots,
  floors,
  formatDateTime,
  getStatusLabel,
  getStatusTone,
  getVehicleTypeLabel,
  parkingSessions,
  tempQrCards,
  vehicles,
} from "../../services/mockParkingData";
import { ArrowDownLeft, Car, Layers, QrCode, ShieldCheck } from "lucide-react";

const CheckInQRPage = () => {
  const [plateNumber, setPlateNumber] = useState("51G-776.51");
  const [vehicleType, setVehicleType] = useState("CAR");
  const [customerType, setCustomerType] = useState("WALK_IN_GUEST");
  const [qrCardId, setQrCardId] = useState("TMP-001");
  const [suggestion, setSuggestion] = useState(null);

  const activeSessions = parkingSessions.filter((session) => session.status === "ACTIVE");
  const readyCards = tempQrCards.filter((card) => card.status === "READY");
  const approvedVehicle = vehicles.find((vehicle) => vehicle.plateNumber === plateNumber && vehicle.status === "APPROVED");

  const motorbikeFloor = useMemo(() => {
    return floors.find((floor) => floor.floorType === "MOTORBIKE" && floor.currentCount < floor.capacity);
  }, []);

  const handleSuggest = (event) => {
    event.preventDefault();
    if (vehicleType === "CAR") {
      const slot = carSlots.find((item) => item.status === "AVAILABLE");
      setSuggestion({
        title: slot ? `Gợi ý slot ${slot.slotCode}` : "Hết slot ô tô hợp lệ",
        desc: slot
          ? "Slot đang trống, không đặt trước, không bảo trì và có thể staff xác nhận."
          : "Không tạo phiên ô tô mới nếu không còn slot hợp lệ.",
        tone: slot ? "success" : "danger",
      });
    } else {
      setSuggestion({
        title: motorbikeFloor ? `Cho vào ${motorbikeFloor.name}` : "Tầng xe máy đầy",
        desc: motorbikeFloor
          ? `Còn ${motorbikeFloor.capacity - motorbikeFloor.currentCount} chỗ theo capacity. Không gán slot xe máy.`
          : "Không nhận thêm xe máy mới theo rule MVP.",
        tone: motorbikeFloor ? "success" : "danger",
      });
    }
  };

  const columns = [
    { header: "Phiên", key: "id" },
    { header: "Biển số", key: "plateNumber" },
    { header: "Loại xe", key: "vehicleType", render: (row) => getVehicleTypeLabel(row.vehicleType) },
    { header: "QR/Card", key: "qrCardId" },
    { header: "Vị trí", key: "slotCode", render: (row) => row.slotCode || "Capacity xe máy" },
    { header: "Check-in", key: "checkInAt", render: (row) => formatDateTime(row.checkInAt) },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><ArrowDownLeft size={16} /> Xe vào bãi</div>
          <h1 className="page-title">Quét QR, nhập biển số và tạo phiên gửi xe</h1>
          <p className="page-subtitle">
            User có gói dùng QR digital pass; khách vãng lai nhận QR/session card tạm do staff phát.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">QR tạm sẵn sàng</span>
          <span className="page-hero-number">{readyCards.length}</span>
          <span className="page-hero-label">card</span>
        </div>
      </section>

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><QrCode size={19} /> Form check-in mock</h2>
              <p className="section-copy">Sau này sẽ gọi POST `/api/parking-sessions/check-in`.</p>
            </div>
          </div>
          <form onSubmit={handleSuggest} style={{ display: "grid", gap: 14 }}>
            <FormField label="Biển số xe" required>
              <Input value={plateNumber} onChange={(event) => setPlateNumber(event.target.value.toUpperCase())} />
            </FormField>
            <FormField label="Loại xe">
              <Select
                value={vehicleType}
                onChange={(event) => setVehicleType(event.target.value)}
                options={[
                  { value: "MOTORBIKE", label: "Xe máy" },
                  { value: "CAR", label: "Ô tô" },
                ]}
                placeholder={null}
              />
            </FormField>
            <FormField label="Loại khách">
              <Select
                value={customerType}
                onChange={(event) => setCustomerType(event.target.value)}
                options={[
                  { value: "REGISTERED_USER", label: "User đã đăng ký" },
                  { value: "WALK_IN_GUEST", label: "Khách vãng lai" },
                ]}
                placeholder={null}
              />
            </FormField>
            <FormField label="QR/session card tạm">
              <Select
                value={qrCardId}
                onChange={(event) => setQrCardId(event.target.value)}
                options={readyCards.map((card) => ({ value: card.id, label: `${card.id} - ${card.label}` }))}
                placeholder={customerType === "REGISTERED_USER" ? "User dùng QR pass riêng" : "Chọn QR tạm"}
              />
            </FormField>
            <Button type="submit" variant="primary" icon={ArrowDownLeft}>
              Kiểm tra và gợi ý vị trí
            </Button>
          </form>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><ShieldCheck size={19} /> Kết quả xác thực</h2>
              <p className="section-copy">Đối chiếu biển số, loại xe, trạng thái duyệt và chỗ trống.</p>
            </div>
          </div>
          <div className="data-list">
            <div className="soft-panel">
              <strong>Xe đã đăng ký?</strong>
              <p className="section-copy">{approvedVehicle ? `${approvedVehicle.owner} - đã duyệt` : "Không tìm thấy xe đã duyệt, xử lý như khách vãng lai."}</p>
              <span className={`pill ${approvedVehicle ? "success" : "warning"}`}>{approvedVehicle ? "Hợp lệ" : "Khách/Chưa duyệt"}</span>
            </div>
            {suggestion && (
              <div className="soft-panel">
                <strong>{suggestion.title}</strong>
                <p className="section-copy">{suggestion.desc}</p>
                <span className={`pill ${suggestion.tone}`}>{suggestion.tone === "success" ? "Có thể check-in" : "Không nhận thêm"}</span>
              </div>
            )}
            <div className="soft-panel">
              <strong>Rule hệ thống</strong>
              <p className="section-copy">
                Xe máy chỉ tăng `current_count`; ô tô phải gán slot cụ thể và staff xác nhận cuối cùng.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Car size={19} /> Phiên đang trong bãi</h2>
            <p className="section-copy">Danh sách giúp staff tránh trùng biển số/session card.</p>
          </div>
        </div>
        <Table columns={columns} data={activeSessions} />
      </section>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Layers size={19} /> Capacity nhanh</h2>
            <p className="section-copy">Tầng xe máy theo sức chứa, tầng ô tô theo slot.</p>
          </div>
        </div>
        <div className="dashboard-grid">
          {floors.map((floor) => (
            <div className="soft-panel" key={floor.id}>
              <strong>{floor.name}</strong>
              <p className="section-copy">{floor.floorType === "CAR" ? `${floor.slotsCount} slot ô tô` : `${floor.currentCount}/${floor.capacity} xe máy`}</p>
              <span className={`pill ${getStatusTone(floor.status)}`}>{getStatusLabel(floor.status)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CheckInQRPage;
