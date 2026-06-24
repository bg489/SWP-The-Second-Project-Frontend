import Button from "../../components/Button/Button";
import Table from "../../components/Table/Table";
import { useMockAuth } from "../../context/MockAuthContext";
import {
  buildingInfo,
  carSlots,
  floors,
  formatCurrency,
  getStatusLabel,
  getStatusTone,
  reportSummary,
  revenueSeries,
  violations,
} from "../../services/mockParkingData";
import { AlertTriangle, BarChart3, Building2, Car, Download, Layers, TrendingUp } from "lucide-react";

const ManagerDashboard = () => {
  const { user } = useMockAuth();
  const motorbikeCapacity = floors.filter((floor) => floor.floorType === "MOTORBIKE").reduce((sum, floor) => sum + floor.capacity, 0);
  const motorbikeCount = floors.filter((floor) => floor.floorType === "MOTORBIKE").reduce((sum, floor) => sum + floor.currentCount, 0);
  const occupiedCarSlots = carSlots.filter((slot) => slot.status === "OCCUPIED").length;

  const floorColumns = [
    { header: "Tầng", key: "name" },
    { header: "Loại", key: "floorType", render: (row) => (row.floorType === "CAR" ? "Ô tô theo ô đỗ" : "Xe máy theo sức chứa") },
    { header: "Sức chứa / Ô đỗ", key: "capacity", render: (row) => (row.floorType === "CAR" ? `${row.slotsCount} ô` : `${row.currentCount}/${row.capacity}`) },
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
          <div className="page-eyebrow"><Building2 size={16} /> Quản lý bãi xe</div>
          <h1 className="page-title">{buildingInfo.name} đang vận hành ổn định</h1>
          <p className="page-subtitle">
            Xin chào {user.name}. Trang này gom sức chứa, ô đỗ, doanh thu, mã QR và vi phạm của một tòa nhà.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Doanh thu tháng</span>
          <span className="page-hero-number">{Math.round(reportSummary.revenueMonth / 1000000)}M</span>
          <span className="page-hero-label">đồng</span>
        </div>
      </section>

      <div className="dashboard-grid">
        <div className="card metric-card">
          <div className="metric-icon"><TrendingUp size={22} /></div>
          <div className="metric-label">Doanh thu hôm nay</div>
          <div className="metric-value">{formatCurrency(reportSummary.revenueToday)}</div>
          <div className="metric-note">Gói tháng, gửi lượt, phí vi phạm</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><Layers size={22} /></div>
          <div className="metric-label">Xe máy đang gửi</div>
          <div className="metric-value">{motorbikeCount}/{motorbikeCapacity}</div>
          <div className="metric-note">{Math.round((motorbikeCount / motorbikeCapacity) * 100)}% sức chứa</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><Car size={22} /></div>
          <div className="metric-label">Ô tô đang dùng ô đỗ</div>
          <div className="metric-value">{occupiedCarSlots}/{carSlots.length}</div>
          <div className="metric-note">Bao gồm ô cần kiểm tra riêng</div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon"><AlertTriangle size={22} /></div>
          <div className="metric-label">Vi phạm trong ngày</div>
          <div className="metric-value">{violations.length}</div>
          <div className="metric-note">Nhân viên ghi nhận tại bãi</div>
        </div>
      </div>

      <div className="two-column-grid">
        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><BarChart3 size={19} /> Doanh thu 5 tháng gần nhất</h2>
              <p className="section-copy">Tổng hợp doanh thu theo tháng để nắm xu hướng vận hành.</p>
            </div>
            <Button variant="outline" icon={Download}>Xuất báo cáo</Button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${revenueSeries.length}, 1fr)`, gap: 12, alignItems: "end", minHeight: 220 }}>
            {revenueSeries.map((item) => (
              <div key={item.label} style={{ display: "grid", gap: 8, alignItems: "end" }}>
                <div style={{ height: `${item.value}px`, borderRadius: "8px 8px 0 0", background: "linear-gradient(180deg, var(--pink), var(--orange))" }} />
                <strong style={{ textAlign: "center", fontSize: 12 }}>{item.label}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="card section-card">
          <div className="section-header">
            <div>
              <h2 className="section-title"><QrPassIcon /> Mã QR tháng</h2>
              <p className="section-copy">Theo dõi QR còn hạn, sắp hết hạn và đã hết hạn.</p>
            </div>
          </div>
          <div className="data-list">
            <div className="data-row"><span>QR còn hiệu lực</span><strong>{reportSummary.activeQrPasses}</strong></div>
            <div className="data-row"><span>Sắp hết hạn</span><strong>{reportSummary.expiringQrPasses}</strong></div>
            <div className="data-row"><span>Đã hết hạn</span><strong>{reportSummary.expiredQrPasses}</strong></div>
            <div className="data-row"><span>Doanh thu gói tháng</span><strong>{formatCurrency(reportSummary.monthlyPassRevenue)}</strong></div>
          </div>
        </section>
      </div>

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Layers size={19} /> Tầng gửi xe</h2>
            <p className="section-copy">Quản lý cấu hình loại tầng, sức chứa, ô đỗ và trạng thái vận hành.</p>
          </div>
        </div>
        <Table columns={floorColumns} data={floors} />
      </section>
    </div>
  );
};

const QrPassIcon = () => <BarChart3 size={19} />;

export default ManagerDashboard;
