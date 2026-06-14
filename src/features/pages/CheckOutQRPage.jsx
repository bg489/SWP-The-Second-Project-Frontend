import React, { useState, useEffect } from "react";
import { mockCarSlots, mockViolations, mockVehicles } from "../../services/mockParkingData";
import Button from "../../components/Button/Button";
import FormField from "../../components/Form/FormField";
import Select from "../../components/Form/Select";
import { QrCode, CreditCard, Clock, AlertTriangle, ShieldCheck, CheckCircle } from "lucide-react";

const CheckOutQRPage = () => {
  // Mock active parking sessions list
  const [sessions, setSessions] = useState([
    { id: "SESS-9982", plate: "30F-999.99", type: "Ô tô", checkInTime: "2026-06-07T14:30:00+07:00", slot: "C-05" }, // User's car (has VIP monthly package)
    { id: "SESS-9911", plate: "30F-555.55", type: "Ô tô", checkInTime: "2026-06-07T08:15:00+07:00", slot: "C-02" }, // Guest car (has Violation VIO-01)
    { id: "SESS-9922", plate: "29A-234.56", type: "Ô tô", checkInTime: "2026-06-07T09:30:00+07:00", slot: "C-08" }, // Guest car (has Violation VIO-02)
    { id: "SESS-9933", plate: "29A-123.45", type: "Xe máy", checkInTime: "2026-06-07T10:00:00+07:00", slot: "Khu vực xe máy B1" }, // User's bike (has monthly package)
    { id: "SESS-9944", plate: "29X-888.88", type: "Xe máy", checkInTime: "2026-06-07T15:30:00+07:00", slot: "Khu vực xe máy B1" }  // Guest bike
  ]);

  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [currentSession, setCurrentSession] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState("");
  const [feeDetails, setFeeDetails] = useState(null);
  const [receipt, setReceipt] = useState(null);

  // Set checkout time to current local time (2026-06-07T19:17:34)
  useEffect(() => {
    const now = new Date("2026-06-07T19:17:34");
    
    // Formatting date to readable local string
    const options = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" };
    setCheckOutTime(now.toLocaleString("vi-VN", options));
  }, [selectedSessionId]);

  const handleSessionSelect = (e) => {
    const sessId = e.target.value;
    setSelectedSessionId(sessId);
    setReceipt(null);
    
    if (!sessId) {
      setCurrentSession(null);
      setFeeDetails(null);
      return;
    }

    const sess = sessions.find(s => s.id === sessId);
    setCurrentSession(sess);

    // Calculate Fees (Fee Calculation Page logic)
    const checkIn = new Date(sess.checkInTime);
    const checkOut = new Date("2026-06-07T19:17:34"); // Fixed current mock time
    const diffMs = checkOut - checkIn;
    const diffHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60))); // Min 1 hour

    // Check if vehicle has a monthly package
    const vehicleInfo = mockVehicles.find(v => v.plate === sess.plate);
    const hasPackage = vehicleInfo && vehicleInfo.package && vehicleInfo.package !== "Chưa đăng ký";

    // Rate Rules: Car = 20,000đ/hour, Motorbike = 5,000đ flat rate
    let timeFee = 0;
    if (!hasPackage) {
      if (sess.type === "Ô tô") {
        timeFee = diffHours * 20000;
      } else {
        timeFee = 5000;
      }
    }

    // Check violations fine
    const violation = mockViolations.find(v => v.plate === sess.plate && v.status === "Chưa thanh toán");
    let fineFee = 0;
    let violationDesc = "";
    if (violation) {
      fineFee = parseInt(violation.fine.replace(/[^0-9]/g, ""), 10);
      violationDesc = violation.type;
    }

    const totalFee = timeFee + fineFee;

    setFeeDetails({
      hours: diffHours,
      hasPackage,
      packageName: hasPackage ? vehicleInfo.package : null,
      timeFee,
      fineFee,
      violationDesc,
      totalFee
    });
  };

  const handleConfirmCheckOut = () => {
    if (!currentSession || !feeDetails) return;

    // Simulate completion receipt
    setReceipt({
      id: `REC-${Math.floor(Math.random() * 9000) + 1000}`,
      plate: currentSession.plate,
      type: currentSession.type,
      checkIn: new Date(currentSession.checkInTime).toLocaleString("vi-VN"),
      checkOut: checkOutTime,
      total: feeDetails.totalFee,
      fine: feeDetails.fineFee,
      timeFee: feeDetails.timeFee,
      packageName: feeDetails.packageName
    });

    // Remove from active sessions
    setSessions(sessions.filter(s => s.id !== currentSession.id));
    
    // Clear selection
    setSelectedSessionId("");
    setCurrentSession(null);
    setFeeDetails(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div className="card" style={{ padding: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800" }}>Check-out Phương tiện (Quét xe ra)</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
          Nhân viên trực chốt tiến hành quét thẻ/mã QR của phương tiện khi rời bãi. Hệ thống tự động truy xuất giờ vào, tính toán phí đỗ xe và phạt vi phạm (nếu có).
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", alignItems: "start" }}>
        
        {/* Checkout Scanning Control */}
        <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
            <QrCode size={20} style={{ color: "var(--primary)" }} /> Quét mã QR Pass của xe ra
          </h3>

          <FormField label="Chọn phiên xe đang gửi trong bãi (Mô phỏng quét QR)" required>
            <Select
              value={selectedSessionId}
              onChange={handleSessionSelect}
              placeholder="Chọn xe muốn check-out..."
              options={sessions.map(s => ({
                value: s.id,
                label: `${s.plate} — ${s.type} (Khu vực: ${s.slot})`
              }))}
            />
          </FormField>

          {currentSession && feeDetails && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="animate-fade-in">
              <div style={{ padding: "16px", borderRadius: "8px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Mã phiên:</span>
                  <span style={{ fontWeight: "700" }}>{currentSession.id}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Biển số xe:</span>
                  <span style={{ fontWeight: "700", color: "var(--primary)", fontSize: "16px" }}>{currentSession.plate}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Loại xe:</span>
                  <span>{currentSession.type}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Thời gian vào:</span>
                  <span>{new Date(currentSession.checkInTime).toLocaleTimeString("vi-VN")} — {new Date(currentSession.checkInTime).toLocaleDateString("vi-VN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Thời gian ra:</span>
                  <span style={{ color: "var(--primary)", fontWeight: "600" }}>{checkOutTime}</span>
                </div>
              </div>

              {/* Warnings / Violations Notification */}
              {feeDetails.fineFee > 0 && (
                <div style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  backgroundColor: "var(--danger-light)",
                  color: "var(--danger)",
                  border: "1px solid var(--danger)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  fontSize: "13px"
                }}>
                  <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <strong style={{ display: "block", marginBottom: "2px" }}>Cảnh báo vi phạm!</strong>
                    Xe bị ghi nhận lỗi: <em>{feeDetails.violationDesc}</em>. Cộng phí phạt đền bù <strong>{feeDetails.fineFee.toLocaleString("vi-VN")}đ</strong> vào hóa đơn đỗ xe.
                  </div>
                </div>
              )}

              {feeDetails.hasPackage && (
                <div style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  backgroundColor: "var(--success-light)",
                  color: "var(--success)",
                  border: "1px solid var(--success)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13px"
                }}>
                  <ShieldCheck size={20} />
                  <div>
                    Xe sử dụng vé tháng đăng ký <strong>{feeDetails.packageName}</strong>. Miễn phí gửi xe theo thời gian.
                  </div>
                </div>
              )}

              <Button variant="primary" onClick={handleConfirmCheckOut} style={{ width: "100%" }} icon={CheckCircle}>
                Xác nhận cho xe ra & Xuất hóa đơn
              </Button>
            </div>
          )}
        </div>

        {/* Dynamic Billing and Fee Calculation Card */}
        <div className="card" style={{ padding: "24px", minHeight: "250px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <CreditCard size={20} style={{ color: "var(--primary)" }} /> Chi tiết Hóa đơn & Biên lai đỗ xe
          </h3>

          {!feeDetails && !receipt && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed var(--border-color)", borderRadius: "12px", padding: "32px", color: "var(--text-muted)", textAlign: "center", fontSize: "13px" }}>
              Vui lòng chọn xe cần quét ra ở bảng điều khiển bên trái để tính toán hóa đơn chi tiết.
            </div>
          )}

          {/* Real-time calculated fee preview */}
          {feeDetails && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="animate-fade-in">
              <h4 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Hóa đơn tạm tính</h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "4px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span>Phí thời gian ({feeDetails.hours} giờ):</span>
                  <span>{feeDetails.timeFee.toLocaleString("vi-VN")}đ</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span>Phí phạt vi phạm:</span>
                  <span>{feeDetails.fineFee.toLocaleString("vi-VN")}đ</span>
                </div>
                <hr style={{ border: "none", borderTop: "1px dashed var(--border-color)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "16px", color: "var(--text-primary)" }}>Tổng số tiền cần thu:</strong>
                  <strong style={{ fontSize: "22px", color: "var(--danger)" }}>{feeDetails.totalFee.toLocaleString("vi-VN")}đ</strong>
                </div>
              </div>
            </div>
          )}

          {/* Final Receipt printed */}
          {receipt && (
            <div className="animate-fade-in" style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              padding: "20px",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              fontFamily: "monospace",
              fontSize: "13px",
              color: "var(--text-primary)"
            }}>
              <div style={{ textAlign: "center", fontWeight: "800", fontSize: "14px", marginBottom: "8px", textTransform: "uppercase" }}>
                Hóa đơn xuất bến thành công
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Hóa đơn ID:</span>
                <span>{receipt.id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Biển số xe:</span>
                <span style={{ fontWeight: "700" }}>{receipt.plate}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Loại xe:</span>
                <span>{receipt.type}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Thời gian vào:</span>
                <span>{receipt.checkIn.split(" ")[0]}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Thời gian ra:</span>
                <span>{receipt.checkOut.split(" ")[0]}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Gói cước tháng:</span>
                <span>{receipt.packageName || "Không sử dụng"}</span>
              </div>
              <hr style={{ border: "none", borderTop: "1px dashed var(--text-muted)" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Phí dịch vụ:</span>
                <span>{receipt.timeFee.toLocaleString("vi-VN")}đ</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Phí phạt vi phạm:</span>
                <span>{receipt.fine.toLocaleString("vi-VN")}đ</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "800" }}>
                <span>Tổng thực thu:</span>
                <span>{receipt.total.toLocaleString("vi-VN")}đ</span>
              </div>
              <div style={{ textAlign: "center", marginTop: "12px", color: "var(--text-muted)", fontSize: "11px" }}>
                Cám ơn quý khách. Hẹn gặp lại!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckOutQRPage;
