import { useState } from "react";
import Button from "../../components/Button/Button";
import { floors as mockFloors, getStatusLabel, getStatusTone } from "../../services/mockParkingData";
import { AlertTriangle, CheckCircle, Layers, Minus, Plus } from "lucide-react";

const MotorbikeFloorStatusPage = () => {
  const [floors, setFloors] = useState(mockFloors.filter((floor) => floor.floorType === "MOTORBIKE"));

  const updateCount = (floorId, delta) => {
    setFloors((rows) =>
      rows.map((floor) => {
        if (floor.id !== floorId) return floor;
        const nextCount = Math.min(floor.capacity, Math.max(0, floor.currentCount + delta));
        return { ...floor, currentCount: nextCount };
      })
    );
  };

  const totalCapacity = floors.reduce((sum, floor) => sum + floor.capacity, 0);
  const totalCount = floors.reduce((sum, floor) => sum + floor.currentCount, 0);

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><Layers size={16} /> Xe máy theo capacity</div>
          <h1 className="page-title">Không gán slot xe máy, chỉ kiểm soát số lượng còn chỗ</h1>
          <p className="page-subtitle">
            Khi xe máy vào thì tăng `current_count`; khi xe ra thì giảm. Nếu tầng đầy, staff không nhận thêm xe mới.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Tổng đang gửi</span>
          <span className="page-hero-number">{totalCount}/{totalCapacity}</span>
          <span className="page-hero-label">{Math.round((totalCount / totalCapacity) * 100)}% capacity</span>
        </div>
      </section>

      <div className="dashboard-grid">
        {floors.map((floor) => {
          const percent = Math.round((floor.currentCount / floor.capacity) * 100);
          const isFull = floor.currentCount >= floor.capacity;
          return (
            <section className="card section-card" key={floor.id}>
              <div className="section-header">
                <div>
                  <h2 className="section-title"><Layers size={19} /> {floor.name}</h2>
                  <p className="section-copy">{floor.note}</p>
                </div>
                <span className={`pill ${isFull ? "danger" : getStatusTone(floor.status)}`}>
                  {isFull ? "Đầy chỗ" : getStatusLabel(floor.status)}
                </span>
              </div>

              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${percent}%` }} />
              </div>

              <div className="dashboard-grid" style={{ marginTop: 16 }}>
                <div className="soft-panel"><span className="metric-label">Sức chứa</span><div className="metric-value">{floor.capacity}</div></div>
                <div className="soft-panel"><span className="metric-label">Đang gửi</span><div className="metric-value">{floor.currentCount}</div></div>
                <div className="soft-panel"><span className="metric-label">Còn trống</span><div className="metric-value">{floor.capacity - floor.currentCount}</div></div>
              </div>

              {isFull && (
                <div className="soft-panel" style={{ marginTop: 14 }}>
                  <span className="pill danger"><AlertTriangle size={14} /> Bãi đầy</span>
                  <p className="section-copy">Không nhận thêm xe máy mới trừ khi có chính sách ưu tiên.</p>
                </div>
              )}

              <div className="action-row" style={{ marginTop: 16 }}>
                <Button variant="primary" icon={Plus} disabled={isFull} onClick={() => updateCount(floor.id, 1)}>
                  Xe vào
                </Button>
                <Button variant="outline" icon={Minus} disabled={floor.currentCount === 0} onClick={() => updateCount(floor.id, -1)}>
                  Xe ra
                </Button>
                <span className="pill success"><CheckCircle size={14} /> Mock realtime</span>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default MotorbikeFloorStatusPage;
