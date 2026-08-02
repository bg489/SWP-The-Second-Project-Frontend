/**
 * @fileoverview Xây dựng màn hình MotorbikeFloorStatusPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import { getStatusLabel, getStatusTone } from "../../services/mockParkingData";
import { fetchFloorsRequest } from "../backend/floors/floorSlice";
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, CheckCircle, Layers } from "lucide-react";

/**
 * Thực hiện nghiệp vụ `MotorbikeFloorStatusPage` (motorbike floor status page). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function MotorbikeFloorStatusPage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const MotorbikeFloorStatusPage = () => {
  const dispatch = useDispatch();
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { user } = useSelector((state) => state.auth);
  /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const { floors, loading, error } = useSelector((state) => state.floors);

  /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  useEffect(() => {
    dispatch(
      fetchFloorsRequest({
        buildingId: user?.buildingId,
        floorType: "MOTORBIKE",
        status: "ACTIVE",
        limit: 100,
      })
    );
  }, [dispatch, user?.buildingId]);

  /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const motorbikeFloors = floors.filter((floor) => floor.floorType === "MOTORBIKE");
  /* Callback nội bộ của lời gọi `reduce`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const totalCapacity = motorbikeFloors.reduce((sum, floor) => sum + Number(floor.capacity || 0), 0);
  /* Callback nội bộ của lời gọi `reduce`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const totalCount = motorbikeFloors.reduce((sum, floor) => sum + Number(floor.currentCount || 0), 0);
  const totalPercent = totalCapacity ? Math.round((totalCount / totalCapacity) * 100) : 0;

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><Layers size={16} /> Sức chứa xe máy</div>
          <h1 className="page-title">Sức chứa xe máy của tòa nhà đang trực</h1>
          <p className="page-subtitle">
            Số lượng đang gửi được cập nhật từ hệ thống khi staff nhận xe vào hoặc cho xe ra.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Tổng đang gửi</span>
          <span className="page-hero-number">{totalCount}/{totalCapacity}</span>
          <span className="page-hero-label">{totalPercent}% sức chứa</span>
        </div>
      </section>

      <StatusBanner errors={error} />

      <div className="dashboard-grid">
        {motorbikeFloors.map((floor) => {
          const capacity = Number(floor.capacity || 0);
          const currentCount = Number(floor.currentCount || 0);
          const percent = capacity ? Math.round((currentCount / capacity) * 100) : 0;
          const isFull = capacity > 0 && currentCount >= capacity;

          return (
            <section className="card section-card" key={floor.id}>
              <div className="section-header">
                <div>
                  <h2 className="section-title"><Layers size={19} /> {floor.name}</h2>
                  <p className="section-copy">{floor.note || floor.operationNote || "Theo dõi sức chứa thực tế của tầng."}</p>
                </div>
                <span className={`pill ${isFull ? "danger" : getStatusTone(floor.status)}`}>
                  {isFull ? "Đầy chỗ" : getStatusLabel(floor.status)}
                </span>
              </div>

              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${percent}%` }} />
              </div>

              <div className="dashboard-grid" style={{ marginTop: 16 }}>
                <div className="soft-panel"><span className="metric-label">Sức chứa</span><div className="metric-value">{capacity}</div></div>
                <div className="soft-panel"><span className="metric-label">Đang gửi</span><div className="metric-value">{currentCount}</div></div>
                <div className="soft-panel"><span className="metric-label">Còn trống</span><div className="metric-value">{Math.max(capacity - currentCount, 0)}</div></div>
              </div>

              {isFull && (
                <div className="soft-panel" style={{ marginTop: 14 }}>
                  <span className="pill danger"><AlertTriangle size={14} /> Bãi đầy</span>
                  <p className="section-copy">Không nhận thêm xe máy mới cho tầng này.</p>
                </div>
              )}

              <div className="action-row" style={{ marginTop: 16 }}>
                <Button variant="primary" icon={ArrowDownLeft} onClick={() => (window.location.pathname = "/staff/check-in")}>
                  Xe vào
                </Button>
                <Button variant="outline" icon={ArrowUpRight} onClick={() => (window.location.pathname = "/staff/check-out")}>
                  Xe ra
                </Button>
                <span className="pill success"><CheckCircle size={14} /> Dữ liệu thật</span>
              </div>
            </section>
          );
        })}
        {!loading && motorbikeFloors.length === 0 && (
          <section className="card section-card">Tòa nhà hiện tại chưa có tầng xe máy đang hoạt động.</section>
        )}
      </div>
    </div>
  );
};

export default MotorbikeFloorStatusPage;
