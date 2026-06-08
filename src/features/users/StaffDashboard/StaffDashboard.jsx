import React, { useState } from 'react';
import './StaffDashboard.css';

const StaffDashboard = () => {
    // Thống kê bãi xe
    const [parkingStats, setParkingStats] = useState({
        motorbikeSlotsLeft: 45,
        carSlotsLeft: 12,
        totalCheckInToday: 142,
        totalCheckOutToday: 98,
    });

    // Phiên đang gửi (Bổ sung thêm mảng violations bên trong mỗi xe để lưu vết)
    const [activeSessions, setActiveSessions] = useState([
        { id: 1, licensePlate: '51G-123.45', type: 'Ô tô', checkInTime: '08:15', position: 'Khu A - Ô 04', cardCode: 'CARD_MANUAL_101', violations: [] },
        { id: 2, licensePlate: '59T1-888.88', type: 'Xe máy', checkInTime: '09:30', position: 'Khu B - Tầng 1', cardCode: 'CARD_MANUAL_102', violations: [] },
    ]);

    // --- STATE CHO CÁC TÍNH NĂNG ---
    const [activeTab, setActiveTab] = useState('qr'); // 'qr', 'manual', hoặc 'violation'
    const [qrInput, setQrInput] = useState('');
    const [scanResult, setScanResult] = useState(null);

    // State cho Form nhập thủ công
    const [manualPlate, setManualPlate] = useState('');
    const [manualType, setManualType] = useState('Xe máy');
    const [manualCard, setManualCard] = useState('');

    // --- STATE MỚI: FORM GHI NHẬN VI PHẠM ---
    const [selectedSessionId, setSelectedSessionId] = useState('');
    const [violationType, setViolationType] = useState('Đỗ sai vị trí');
    const [violationDesc, setViolationDesc] = useState('');
    const [violationFine, setViolationFine] = useState('50000'); // Phí phạt mock mặc định
    const [evidenceImage, setEvidenceImage] = useState(null); // Lưu ảnh giả lập dạng chuỗi tên file

    // Danh sách Mock dữ liệu xe hệ thống cho phần quét QR
    const mockQRDatabase = {
        "QR_VIP_001": { licensePlate: "51K-999.99", type: "Ô tô", packageStatus: "Còn hạn", packageName: "Gói Cao Cấp (Vip)", isValid: true },
        "QR_NORMAL_002": { licensePlate: "29A-555.55", type: "Ô tô", packageStatus: "Còn hạn", packageName: "Gói Cơ Bản", isValid: true },
        "QR_EXPIRED_003": { licensePlate: "59X3-111.11", type: "Xe máy", packageStatus: "Hết hạn", packageName: "Gói Ngày (Hết hạn)", isValid: false, reason: "Gói đăng ký đã hết hạn." },
        "QR_BLOCKED_004": { licensePlate: "43C-444.44", type: "Ô tô", packageStatus: "Bị khóa", packageName: "Không có", isValid: false, reason: "Xe nằm trong danh sách đen do vi phạm nhiều lần." }
    };

    // Tự động cập nhật phí phạt mock theo loại vi phạm để Staff không phải nhập tay nhiều
    const handleViolationTypeChange = (type) => {
        setViolationType(type);
        if (type === 'Đỗ sai vị trí') setViolationFine('50000');
        else if (type === 'Chắn lối ra vào') setViolationFine('100000');
        else if (type === 'Gửi xe quá hạn (>48h)') setViolationFine('200000');
        else setViolationFine('0');
    };

    // Xử lý quét QR
    const handleVerifyQR = (e) => {
        e.preventDefault();
        if (!qrInput.trim()) return alert("Vui lòng nhập hoặc chọn một mã QR mock!");
        const code = qrInput.trim();
        const matchedVehicle = mockQRDatabase[code];
        if (matchedVehicle) setScanResult(matchedVehicle);
        else setScanResult({ licensePlate: "Không rõ", type: "Không rõ", packageStatus: "Chưa đăng ký", packageName: "Không có", isValid: false, reason: "Mã QR không tồn tại." });
    };

    const handleAcceptVehicle = () => {
        if (!scanResult) return;
        const newSession = {
            id: Date.now(),
            licensePlate: scanResult.licensePlate,
            type: scanResult.type,
            checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            position: scanResult.type === 'Ô tô' ? 'Khu A - Tự do' : 'Khu B - Tự do',
            cardCode: qrInput.toUpperCase().trim(),
            violations: [] // Mặc định xe vào chưa có vi phạm
        };
        setActiveSessions([newSession, ...activeSessions]);
        setParkingStats(prev => ({
            ...prev,
            totalCheckInToday: prev.totalCheckInToday + 1,
            motorbikeSlotsLeft: scanResult.type === 'Xe máy' ? prev.motorbikeSlotsLeft - 1 : prev.motorbikeSlotsLeft,
            carSlotsLeft: scanResult.type === 'Ô tô' ? prev.carSlotsLeft - 1 : prev.carSlotsLeft
        }));
        setQrInput('');
        setScanResult(null);
        alert(`Đã duyệt xe ${newSession.licensePlate} vào bãi!`);
    };

    // Xử lý xe vãng lai
    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!manualPlate.trim() || !manualCard.trim()) return alert("Vui lòng điền đủ thông tin!");
        const formattedCard = manualCard.toUpperCase().trim();
        if (activeSessions.some(s => s.cardCode === formattedCard)) return alert("Mã thẻ này đang được sử dụng!");

        const newManualSession = {
            id: Date.now(),
            licensePlate: manualPlate.toUpperCase().trim(),
            type: manualType,
            checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            position: manualType === 'Ô tô' ? 'Khu A - Vãng lai' : 'Khu B - Vãng lai',
            cardCode: formattedCard,
            violations: []
        };
        setActiveSessions([newManualSession, ...activeSessions]);
        setParkingStats(prev => ({
            ...prev,
            totalCheckInToday: prev.totalCheckInToday + 1,
            motorbikeSlotsLeft: manualType === 'Xe máy' ? prev.motorbikeSlotsLeft - 1 : prev.motorbikeSlotsLeft,
            carSlotsLeft: manualType === 'Ô tô' ? prev.carSlotsLeft - 1 : prev.carSlotsLeft
        }));
        setManualPlate('');
        setManualCard('');
        alert("Đã tạo phiên xe vãng lai!");
    };

    // --- XỬ LÝ TẠO BIÊN BẢN VI PHẠM MOCK ---
    const handleViolationSubmit = (e) => {
        e.preventDefault();

        if (!selectedSessionId) {
            alert("⚠️ Vui lòng chọn một phương tiện đang có trong bãi!");
            return;
        }

        // Tạo cấu trúc dữ liệu vi phạm
        const newViolation = {
            id: Date.now(),
            type: violationType,
            description: violationDesc.trim() || "Không có mô tả chi tiết.",
            fine: parseInt(violationFine) || 0,
            evidence: evidenceImage || "Chưa đính kèm ảnh"
        };

        // Tìm phiên gửi xe được chọn và đẩy vi phạm vào mảng violations của xe đó
        const updatedSessions = activeSessions.map(session => {
            if (session.id === parseInt(selectedSessionId)) {
                return {
                    ...session,
                    violations: [...session.violations, newViolation]
                };
            }
            return session;
        });

        setActiveSessions(updatedSessions);

        // Reset Form vi phạm
        setSelectedSessionId('');
        setViolationType('Đỗ sai vị trí');
        setViolationDesc('');
        setViolationFine('50000');
        setEvidenceImage(null);

        alert("🚨 Đã lập biên bản vi phạm thành công! Lỗi phạt đã được gắn chặt vào phiên gửi của xe.");
    };

    return (
        <div className="staff-container">
            <div className="staff-content">

                {/* HEADER */}
                <div className="staff-header">
                    <div>
                        <h2>📋 STAFF DASHBOARD</h2>
                        <p className="staff-sub">Hệ thống điều phối bãi xe: Quét QR, Nhập thủ công & Lập biên bản vi phạm</p>
                    </div>
                    <div className="live-badge">🟢 LIVE TRACKING</div>
                </div>

                {/* TABS ĐIỀU HƯỚNG TRANG STAFF (ĐÃ THÊM TAB VI PHẠM) */}
                <div className="entry-control-section">
                    <div className="tab-header">
                        <button className={`tab-btn ${activeTab === 'qr' ? 'active' : ''}`} onClick={() => { setActiveTab('qr'); setScanResult(null); }}>
                            📷 Quét / Nhập mã QR
                        </button>
                        <button className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`} onClick={() => setActiveTab('manual')}>
                            ✍️ Nhập Xe Vãng Lai
                        </button>
                        <button className={`tab-btn ${activeTab === 'violation' ? 'active' : ''}`} onClick={() => setActiveTab('violation')}>
                            🚨 Ghi Nhận Vi Phạm
                        </button>
                    </div>

                    <div className="tab-body">
                        {/* TAB 1: QUÉT QR */}
                        {activeTab === 'qr' && (
                            <div className="qr-grid">
                                <div className="qr-panel-left">
                                    <form onSubmit={handleVerifyQR} className="qr-form">
                                        <label>Nhập mã QR thẻ xe hoặc chọn mã Mock nhanh bên dưới:</label>
                                        <div className="qr-input-group">
                                            <input type="text" placeholder="Ví dụ: QR_VIP_001" value={qrInput} onChange={(e) => setQrInput(e.target.value)} />
                                            <button type="submit" className="verify-btn">Xác thực mã</button>
                                        </div>
                                    </form>
                                    <div className="mock-hints">
                                        <p>Mã test nhanh:</p>
                                        <div className="hint-wrap">
                                            <button onClick={() => setQrInput('QR_VIP_001')} className="hint-btn text-green">Xe VIP (Hợp lệ)</button>
                                            <button onClick={() => setQrInput('QR_EXPIRED_003')} className="hint-btn text-orange">Hết hạn</button>
                                            <button onClick={() => setQrInput('QR_BLOCKED_004')} className="hint-btn text-red">Xe Bị Khóa</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="qr-panel-right">
                                    {scanResult ? (
                                        <div className={`result-box ${scanResult.isValid ? 'valid-bg' : 'invalid-bg'}`}>
                                            <div className="result-card-header">
                                                <h4>🔍 KẾT QUẢ XÁC THỰC HỆ THỐNG</h4>
                                                <span className={`status-pill ${scanResult.isValid ? 'pill-approved' : 'pill-rejected'}`}>{scanResult.isValid ? "XE HỢP LỆ ✔️" : "XE KHÔNG HỢP LỆ ❌"}</span>
                                            </div>
                                            <div className="result-details-list">
                                                <div className="result-detail-item"><span>Biển số xe:</span><strong className="result-plate">{scanResult.licensePlate}</strong></div>
                                                <div className="result-detail-item"><span>Loại xe:</span><strong className="detail-value-white">{scanResult.type === 'Ô tô' ? '🚗 Ô tô' : '🏍️ Xe máy'}</strong></div>
                                                <div className="result-detail-item"><span>Tình trạng gói:</span>
                                                    <div className="package-info-block">
                                                        <span className={`badge-status ${scanResult.packageStatus === 'Còn hạn' ? 'status-green' : 'status-red'}`}>{scanResult.packageStatus.toUpperCase()}</span>
                                                        <span className="package-name-sub">({scanResult.packageName})</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr className="result-divider" />
                                            <div className="action-direction-box">
                                                <span className="direction-title">👉 HƯỚNG XỬ LÝ TIẾP THEO:</span>
                                                {scanResult.isValid ? <p className="text-green-bold">ĐỦ ĐIỀU KIỆN. Cho phép xe vào bãi.</p> : <p className="text-red-bold">TỪ CHỐI! Lý do: {scanResult.reason}</p>}
                                            </div>
                                            {scanResult.isValid && <button onClick={handleAcceptVehicle} className="accept-entry-btn">⚡ Ghi nhận xe vào</button>}
                                        </div>
                                    ) : <div className="result-placeholder"><p>🔲 Chưa có dữ liệu quét.</p></div>}
                                </div>
                            </div>
                        )}

                        {/* TAB 2: NHẬP THỦ CÔNG */}
                        {activeTab === 'manual' && (
                            <div className="manual-entry-container">
                                <div className="manual-form-wrapper">
                                    <h4>✍️ ĐĂNG KÝ VÀO BÃI CHO XE VÃNG LAI / KHÔNG THẺ</h4>
                                    <form onSubmit={handleManualSubmit} className="manual-dashboard-form">
                                        <div className="manual-form-group"><label>Biển số xe *</label><input type="text" placeholder="Ví dụ: 51H-123.45" value={manualPlate} onChange={(e) => setManualPlate(e.target.value)} /></div>
                                        <div className="manual-form-group">
                                            <label>Gán mã QR / Session Card tạm thời *</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <input type="text" placeholder="Ví dụ: CARD_TEMP_999" value={manualCard} onChange={(e) => setManualCard(e.target.value)} style={{ flex: 1 }} />
                                                <button type="button" className="hint-btn" onClick={() => setManualCard(`CARD_MOCK_${Math.floor(100 + Math.random() * 900)}`)}>🎲 Ngẫu nhiên</button>
                                            </div>
                                        </div>
                                        <div className="manual-form-group">
                                            <label>Loại phương tiện</label>
                                            <div className="manual-radio-group">
                                                <label className="manual-radio-label"><input type="radio" name="manualType" value="Xe máy" checked={manualType === 'Xe máy'} onChange={() => setManualType('Xe máy')} /><span>🏍️ Xe máy</span></label>
                                                <label className="manual-radio-label"><input type="radio" name="manualType" value="Ô tô" checked={manualType === 'Ô tô'} onChange={() => setManualType('Ô tô')} /><span>🚗 Ô tô</span></label>
                                            </div>
                                        </div>
                                        <button type="submit" className="manual-submit-btn">🚀 Cấp vé & Cho xe vào bãi</button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: FORM GHI NHẬN VI PHẠM (TÍNH NĂNG MỚI THEO YÊU CẦU) */}
                        {activeTab === 'violation' && (
                            <div className="manual-entry-container">
                                <div className="manual-form-wrapper">
                                    <h4>🚨 LẬP BIÊN BẢN VI PHẠM NỘI QUY BÃI XE</h4>
                                    <p className="manual-desc">Chọn xe đang có trong bãi để gán lỗi vi phạm, áp phí phạt xử lý khi checkout.</p>

                                    <form onSubmit={handleViolationSubmit} className="manual-dashboard-form">
                                        {/* 1. Dropdown chọn xe từ danh sách phiên hiện tại */}
                                        <div className="manual-form-group">
                                            <label>Chọn xe vi phạm (Đang trong bãi) *</label>
                                            <select
                                                value={selectedSessionId}
                                                onChange={(e) => setSelectedSessionId(e.target.value)}
                                                className="violation-select"
                                            >
                                                <option value="">-- Chọn biển số xe đang gửi --</option>
                                                {activeSessions.map(session => (
                                                    <option key={session.id} value={session.id}>
                                                        {session.licensePlate} ({session.type}) - Thẻ: {session.cardCode}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* 2. Loại vi phạm */}
                                        <div className="manual-form-group">
                                            <label>Loại vi phạm *</label>
                                            <select
                                                value={violationType}
                                                onChange={(e) => handleViolationTypeChange(e.target.value)}
                                                className="violation-select"
                                            >
                                                <option value="Đỗ sai vị trí">Đỗ sai vị trí quy định</option>
                                                <option value="Chắn lối ra vào">Đỗ xe chắn lối ra vào bãi</option>
                                                <option value="Gửi xe quá hạn (>48h)">Gửi xe quá hạn quy định (&gt;48h)</option>
                                                <option value="Vi phạm khác">Lý do vi phạm khác</option>
                                            </select>
                                        </div>

                                        {/* 3. Phí phạt Mock */}
                                        <div className="manual-form-group">
                                            <label>Số tiền phạt mock (VNĐ) *</label>
                                            <input
                                                type="number"
                                                value={violationFine}
                                                onChange={(e) => setViolationFine(e.target.value)}
                                                placeholder="Nhập số tiền"
                                            />
                                        </div>

                                        {/* 4. Mô tả chi tiết */}
                                        <div className="manual-form-group">
                                            <label>Mô tả chi tiết sự việc</label>
                                            <textarea
                                                placeholder="Ví dụ: Đỗ lấn chiếm làn xe máy tại Khu B..."
                                                value={violationDesc}
                                                onChange={(e) => setViolationDesc(e.target.value)}
                                                rows="3"
                                                className="violation-textarea"
                                            ></textarea>
                                        </div>

                                        {/* 5. Ảnh bằng chứng Mock */}
                                        <div className="manual-form-group">
                                            <label>Ảnh bằng chứng hiển thị dạng Mock</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    type="button"
                                                    className={`hint-btn ${evidenceImage ? 'text-green' : ''}`}
                                                    onClick={() => setEvidenceImage(`EVIDENCE_CAM_${Math.floor(1000 + Math.random() * 9000)}.JPG`)}
                                                    style={{ width: '100%', padding: '10px' }}
                                                >
                                                    {evidenceImage ? `📸 Đã gán: ${evidenceImage}` : "📸 Giả lập chụp ảnh từ Camera"}
                                                </button>
                                                {evidenceImage && (
                                                    <button type="button" className="hint-btn text-red" onClick={() => setEvidenceImage(null)}>&times;</button>
                                                )}
                                            </div>
                                        </div>

                                        <button type="submit" className="manual-submit-btn" style={{ background: 'linear-gradient(135deg, #ff4d4d, #cf0000)' }}>
                                            🚨 Lập Biên Bản & Gắn Vào Phiên Xe
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* THỐNG KÊ KẾT QUẢ */}
                <div className="stats-grid" style={{ marginTop: '25px' }}>
                    <div className="stat-item border-blue"><span className="stat-icon">📥</span><div className="stat-info"><h3>{parkingStats.totalCheckInToday}</h3><p>Xe vào hôm nay</p></div></div>
                    <div className="stat-item border-green"><span className="stat-icon">🏍️</span><div className="stat-info"><h3>{parkingStats.motorbikeSlotsLeft}</h3><p>Chỗ xe máy còn lại</p></div></div>
                    <div className="stat-item border-yellow"><span className="stat-icon">🚗</span><div className="stat-info"><h3>{parkingStats.carSlotsLeft}</h3><p>Slot ô tô trống</p></div></div>
                </div>

                {/* DANH SÁCH PHIÊN ĐANG GỬI */}
                <div className="session-section" style={{ marginTop: '25px' }}>
                    <div className="section-title">
                        <h3>🚗 CÁC PHIÊN ĐANG GỬI TRONG BÃI ({activeSessions.length})</h3>
                    </div>
                    <div className="table-wrapper">
                        <table className="staff-table">
                            <thead>
                                <tr>
                                    <th>Mã Thẻ (QR)</th>
                                    <th>Biển số</th>
                                    <th>Loại xe</th>
                                    <th>Thời gian vào</th>
                                    <th>Vị trí</th>
                                    <th>Lỗi vi phạm gắn kèm</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeSessions.map((s) => (
                                    <tr key={s.id}>
                                        <td><span className="pos-badge" style={{ background: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8' }}>{s.cardCode}</span></td>
                                        <td><span className="staff-plate">{s.licensePlate}</span></td>
                                        <td>{s.type === 'Ô tô' ? '🚗 Ô tô' : '🏍️ Xe máy'}</td>
                                        <td>{s.checkInTime}</td>
                                        <td><span className="pos-badge">{s.position}</span></td>
                                        {/* Hiển thị số lượng vi phạm được gắn vào xe */}
                                        <td>
                                            {s.violations && s.violations.length > 0 ? (
                                                <span className="status-pill pill-rejected" style={{ fontSize: '12px' }}>
                                                    ⚠️ {s.violations.length} Vi phạm (-{s.violations.reduce((sum, v) => sum + v.fine, 0).toLocaleString()}đ)
                                                </span>
                                            ) : (
                                                <span style={{ color: '#555', fontSize: '13px' }}>Chưa có lỗi</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StaffDashboard;