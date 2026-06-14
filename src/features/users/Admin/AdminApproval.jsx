import React, { useState } from 'react';
import './AdminApproval.css';

const AdminApproval = () => {
    // Tình trạng Tab hiện tại: 'approval', 'packages', hoặc 'cards'
    const [adminTab, setAdminTab] = useState('approval');

    // ==========================================
    // 1. LOGIC: PHÊ DUYỆT PHƯƠNG TIỆN (CŨ)
    // ==========================================
    const [pendingRequests, setPendingRequests] = useState([
        { id: 1, licensePlate: '51K-777.77', type: 'Ô tô', ownerName: 'Nguyễn Văn A', createdAt: '06/06/2026', packageName: 'Gói Tháng Cao Cấp' },
        { id: 2, licensePlate: '59P2-345.67', type: 'Xe máy', ownerName: 'Trần Thị B', createdAt: '07/06/2026', packageName: 'Gói Vé Tháng Cơ Bản' },
        { id: 3, licensePlate: '43A-999.88', type: 'Ô tô', ownerName: 'Lê Hoàng C', createdAt: '07/06/2026', packageName: 'Gói Tháng Cao Cấp' },
    ]);
    const [approvalHistory, setApprovalHistory] = useState([]);

    const handleApprove = (id) => {
        const request = pendingRequests.find(item => item.id === id);
        if (!request) return;
        alert(`✔️ Đã DUYỆT phương tiện ${request.licensePlate} vào hệ thống.`);
        setApprovalHistory([{ ...request, status: 'approved', actionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...approvalHistory]);
        setPendingRequests(pendingRequests.filter(item => item.id !== id));
    };

    const handleReject = (id) => {
        const request = pendingRequests.find(item => item.id === id);
        if (!request) return;
        const reason = prompt("Nhập lý do từ chối phê duyệt xe:", "Ảnh chụp biển số mờ, không rõ ký tự");
        if (reason === null) return;
        alert(`❌ Đã TỪ CHỐI xe ${request.licensePlate}. Lý do: ${reason}`);
        setApprovalHistory([{ ...request, status: 'rejected', reason, actionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...approvalHistory]);
        setPendingRequests(pendingRequests.filter(item => item.id !== id));
    };


    // ==========================================
    // 2. LOGIC: QUẢN LÝ GÓI CƯỚC THÁNG (CŨ)
    // ==========================================
    const [packages, setPackages] = useState([
        { id: 1, name: 'Gói Vé Tháng Cơ Bản', vehicleType: 'Xe máy', price: 150000, duration: 30, status: 'Hoạt động' },
        { id: 2, name: 'Gói Tháng Cao Cấp', vehicleType: 'Ô tô', price: 1200000, duration: 30, status: 'Hoạt động' },
        { id: 3, name: 'Vé Lượt Vãng Lai XM', vehicleType: 'Xe máy', price: 50000, duration: 1, status: 'Hoạt động' },
    ]);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [pkgName, setPkgName] = useState('');
    const [pkgVehicleType, setPkgVehicleType] = useState('Xe máy');
    const [pkgPrice, setPkgPrice] = useState('');
    const [pkgDuration, setPkgDuration] = useState('30');
    const [pkgStatus, setPkgStatus] = useState('Hoạt động');

    const handleSavePackage = (e) => {
        e.preventDefault();
        if (!pkgName.trim() || !pkgPrice) return alert("⚠️ Vui lòng nhập đủ thông tin!");
        if (isEditing) {
            setPackages(packages.map(p => p.id === editId ? { ...p, name: pkgName.trim(), vehicleType: pkgVehicleType, price: parseInt(pkgPrice), duration: parseInt(pkgDuration), status: pkgStatus } : p));
            alert("✔️ Cập nhật gói cước thành công!");
        } else {
            setPackages([...packages, { id: Date.now(), name: pkgName.trim(), vehicleType: pkgVehicleType, price: parseInt(pkgPrice), duration: parseInt(pkgDuration), status: pkgStatus }]);
            alert("🚀 Thêm mới gói cước thành công!");
        }
        resetPkgForm();
    };
    const handleStartEdit = (pkg) => {
        setIsEditing(true); setEditId(pkg.id); setPkgName(pkg.name); setPkgVehicleType(pkg.vehicleType); setPkgPrice(pkg.price); setPkgDuration(pkg.duration); setPkgStatus(pkg.status);
    };
    const handleDeletePackage = (id, name) => {
        if (window.confirm(`⚠️ Xóa gói cước "${name}"?`)) { setPackages(packages.filter(p => p.id !== id)); alert("🗑️ Đã xóa gói."); }
    };
    const resetPkgForm = () => { setIsEditing(false); setEditId(null); setPkgName(''); setPkgVehicleType('Xe máy'); setPkgPrice(''); setPkgDuration('30'); setPkgStatus('Hoạt động'); };


    // =========================================================
    // 3. LOGIC MỚI: QUẢN LÝ DANH SÁCH QR / CARD TẠM VÃNG LAI
    // =========================================================
    const [cards, setCards] = useState([
        { id: 1, code: 'CARD_MANUAL_101', type: 'Thẻ Ô tô', status: 'Đang sử dụng', lastUsed: '08:15', note: 'Xe 51G-123.45 đang cầm' },
        { id: 2, code: 'CARD_MANUAL_102', type: 'Thẻ Xe máy', status: 'Đang sử dụng', lastUsed: '09:30', note: 'Xe 59T1-888.88 đang cầm' },
        { id: 3, code: 'CARD_TEMP_201', type: 'Thẻ Xe máy', status: 'Sẵn sàng', lastUsed: 'Hôm qua', note: 'Nằm tại hòm checkpoint' },
        { id: 4, code: 'CARD_TEMP_202', type: 'Thẻ Ô tô', status: 'Đã hoàn tất', lastUsed: '10:00', note: 'Vừa thu hồi từ khách' },
        { id: 5, code: 'CARD_TEMP_999', type: 'Thẻ Xe máy', status: 'Mất/hỏng/tạm khóa', lastUsed: '01/06', note: 'Cư dân làm rơi mất bao thẻ' },
    ]);

    // State form thêm đơn lẻ / thêm nhanh hàng loạt thẻ
    const [newCardCode, setNewCardCode] = useState('');
    const [newCardType, setNewCardType] = useState('Thẻ Xe máy');
    const [filterStatus, setFilterStatus] = useState('Tất cả');

    // Hàm tạo 1 thẻ đơn lẻ
    const handleCreateSingleCard = (e) => {
        e.preventDefault();
        if (!newCardCode.trim()) return alert("⚠️ Vui lòng nhập mã thẻ!");
        const formattedCode = newCardCode.toUpperCase().trim();

        if (cards.some(c => c.code === formattedCode)) {
            return alert("❌ Mã thẻ này đã tồn tại trên hệ thống!");
        }

        const newCard = {
            id: Date.now(),
            code: formattedCode,
            type: newCardType,
            status: 'Sẵn sàng',
            lastUsed: 'Vừa tạo',
            note: 'Thẻ mới tạo chưa sử dụng'
        };

        setCards([newCard, ...cards]);
        setNewCardCode('');
        alert(`🎴 Đã khởi tạo thẻ vãng lai ${formattedCode} thành công!`);
    };

    // Hàm đổi trạng thái thẻ nhanh trên bảng
    const handleChangeCardStatus = (id, targetStatus) => {
        const updated = cards.map(c => {
            if (c.id === id) {
                let updatedNote = c.note;
                if (targetStatus === 'Mất/hỏng/tạm khóa') updatedNote = 'Báo khóa khẩn cấp bởi Admin';
                if (targetStatus === 'Sẵn sàng') updatedNote = 'Đã thu hồi về kho';
                return { ...c, status: targetStatus, note: updatedNote };
            }
            return c;
        });
        setCards(updated);
    };

    // Hàm xóa bỏ vĩnh viễn thẻ khỏi hệ thống cấu hình
    const handleDeleteCard = (id, code) => {
        if (window.confirm(`⚠️ Bạn có chắc muốn xóa thẻ ${code} khỏi cơ sở dữ liệu?`)) {
            setCards(cards.filter(c => c.id !== id));
        }
    };

    // Lọc danh sách thẻ hiển thị
    const filteredCards = cards.filter(c => filterStatus === 'Tất cả' || c.status === filterStatus);

    return (
        <div className="admin-container">
            <div className="admin-content">

                {/* ADMIN HEADER */}
                <div className="admin-header">
                    <div>
                        <h2>🛡️ ADMIN DASHBOARD</h2>
                        <p className="admin-sub">Hệ thống xét duyệt xe, cấu hình gói phí & cấp phát mã thẻ QR vãng lai</p>
                    </div>
                    <div className="admin-badge">QUẢN TRỊ VIÊN</div>
                </div>

                {/* THANH TAB ĐIỀU HƯỚNG 3 PHÂN HỆ CỦA ADMIN */}
                <div className="admin-tab-header">
                    <button className={`admin-tab-btn ${adminTab === 'approval' ? 'active' : ''}`} onClick={() => setAdminTab('approval')}>
                        ⏳ Phê Duyệt Xe ({pendingRequests.length})
                    </button>
                    <button className={`admin-tab-btn ${adminTab === 'packages' ? 'active' : ''}`} onClick={() => setAdminTab('packages')}>
                        ⚙️ Thiết Lập Gói Cước ({packages.length})
                    </button>
                    <button className={`admin-tab-btn ${adminTab === 'cards' ? 'active' : ''}`} onClick={() => setAdminTab('cards')}>
                        🎴 Quản Lý Thẻ QR ({cards.length})
                    </button>
                </div>

                {/* ======================================================== */}
                {/* TAB 1: PHÊ DUYỆT PHƯƠNG TIỆN CỦA CƯ DÂN */}
                {/* ======================================================== */}
                {adminTab === 'approval' && (
                    <>
                        <div className="admin-section">
                            <div className="admin-section-title"><h3>📋 DANH SÁCH PHƯƠNG TIỆN CHỜ DUYỆT</h3></div>
                            {pendingRequests.length === 0 ? (
                                <p className="admin-empty-msg">🎉 Tuyệt vời! Đã xét duyệt xong toàn bộ yêu cầu.</p>
                            ) : (
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Biển số xe</th>
                                                <th>Loại xe</th>
                                                <th>Chủ sở hữu</th>
                                                <th>Ngày tạo</th>
                                                <th>Gói mong muốn</th>
                                                <th style={{ textAlign: 'center' }}>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingRequests.map((req) => (
                                                <tr key={req.id}>
                                                    <td><span className="admin-plate">{req.licensePlate}</span></td>
                                                    <td>{req.type === 'Ô tô' ? '🚗 Ô tô' : '🏍️ Xe máy'}</td>
                                                    <td style={{ fontWeight: '600' }}>{req.ownerName}</td>
                                                    <td style={{ color: '#64748b' }}>{req.createdAt}</td>
                                                    <td><span className="admin-pkg-text">{req.packageName}</span></td>
                                                    <td>
                                                        <div className="admin-actions">
                                                            <button onClick={() => handleApprove(req.id)} className="btn-approve">Duyệt</button>
                                                            <button onClick={() => handleReject(req.id)} className="btn-reject">Từ chối</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* ======================================================== */}
                {/* TAB 2: QUẢN LÝ CẤU HÌNH GÓI CƯỚC */}
                {/* ======================================================== */}
                {adminTab === 'packages' && (
                    <div className="pkg-dashboard-grid">
                        <div className="admin-section pkg-form-panel">
                            <div className="admin-section-title"><h3>{isEditing ? '📝 CẬP NHẬT GÓI CƯỚC' : '🚀 THÊM GÓI CƯỚC MỚI'}</h3></div>
                            <form onSubmit={handleSavePackage} className="pkg-admin-form">
                                <div className="pkg-form-group"><label>Tên gói cước *</label><input type="text" value={pkgName} onChange={(e) => setPkgName(e.target.value)} /></div>
                                <div className="pkg-form-group">
                                    <label>Loại xe áp dụng</label>
                                    <select value={pkgVehicleType} onChange={(e) => setPkgVehicleType(e.target.value)}><option value="Xe máy">🏍️ Xe máy</option><option value="Ô tô">🚗 Ô tô</option></select>
                                </div>
                                <div className="pkg-form-group"><label>Giá tiền gói (VNĐ) *</label><input type="number" value={pkgPrice} onChange={(e) => setPkgPrice(e.target.value)} /></div>
                                <div className="pkg-form-group"><label>Thời hạn sử dụng (Ngày)</label><input type="number" value={pkgDuration} onChange={(e) => setPkgDuration(e.target.value)} /></div>
                                <div className="pkg-form-group">
                                    <label>Trạng thái</label>
                                    <div className="pkg-status-toggle">
                                        <label className={`status-radio-label ${pkgStatus === 'Hoạt động' ? 'active-green' : ''}`}><input type="radio" checked={pkgStatus === 'Hoạt động'} onChange={() => setPkgStatus('Hoạt động')} /><span>Hoạt động</span></label>
                                        <label className={`status-radio-label ${pkgStatus === 'Tạm dừng' ? 'active-red' : ''}`}><input type="radio" checked={pkgStatus === 'Tạm dừng'} onChange={() => setPkgStatus('Tạm dừng')} /><span>Tạm dừng</span></label>
                                    </div>
                                </div>
                                <div className="pkg-form-buttons">
                                    <button type="submit" className="pkg-btn-save">{isEditing ? 'Cập nhật gói' : 'Tạo gói cước'}</button>
                                    {isEditing && <button type="button" className="pkg-btn-cancel" onClick={resetPkgForm}>Hủy</button>}
                                </div>
                            </form>
                        </div>
                        <div className="admin-section pkg-list-panel">
                            <div className="admin-section-title"><h3>📋 DANH SÁCH BIỂU PHÍ HỆ THỐNG</h3></div>
                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead><tr><th>Tên gói</th><th>Áp dụng</th><th>Giá (Vé)</th><th>Trạng thái</th><th style={{ textAlign: 'center' }}>Hành động</th></tr></thead>
                                    <tbody>
                                        {packages.map((pkg) => (
                                            <tr key={pkg.id}>
                                                <td style={{ fontWeight: '600', color: '#fff' }}>{pkg.name}</td>
                                                <td>{pkg.vehicleType === 'Ô tô' ? '🚗 Ô tô' : '🏍️ Xe máy'}</td>
                                                <td style={{ color: '#3498db', fontWeight: '700' }}>{pkg.price.toLocaleString()}đ</td>
                                                <td><span className={`pkg-status-pill ${pkg.status === 'Hoạt động' ? 'pill-active' : 'pill-paused'}`}>{pkg.status}</span></td>
                                                <td>
                                                    <div className="admin-actions">
                                                        <button onClick={() => handleStartEdit(pkg)} className="btn-edit-inline">⚙️ Sửa</button>
                                                        <button onClick={() => handleDeletePackage(pkg.id, pkg.name)} className="btn-delete-inline">🗑️ Xóa</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ======================================================== */}
                {/* TAB 3: QUẢN LÝ DANH SÁCH QR / CARD TẠM VÃNG LAI (MỚI) */}
                {/* ======================================================== */}
                {adminTab === 'cards' && (
                    <div className="pkg-dashboard-grid">

                        {/* PANEL BÊN TRÁI: FORM CẤP THẺ MỚI */}
                        <div className="admin-section pkg-form-panel">
                            <div className="admin-section-title">
                                <h3>🎴 KHỞI TẠO THẺ VÃNG LAI</h3>
                            </div>
                            <form onSubmit={handleCreateSingleCard} className="pkg-admin-form">
                                <div className="pkg-form-group">
                                    <label>Mã ID định danh thẻ (QR Code Code) *</label>
                                    <input
                                        type="text"
                                        placeholder="Ví dụ: CARD_TEMP_205"
                                        value={newCardCode}
                                        onChange={(e) => setNewCardCode(e.target.value)}
                                    />
                                </div>

                                <div className="pkg-form-group">
                                    <label>Loại phân nhóm phương tiện</label>
                                    <select value={newCardType} onChange={(e) => setNewCardType(e.target.value)}>
                                        <option value="Thẻ Xe máy">🏍️ Phân làn Xe máy</option>
                                        <option value="Thẻ Ô tô">🚗 Phân làn Ô tô</option>
                                    </select>
                                </div>

                                <button type="submit" className="pkg-btn-save" style={{ background: 'linear-gradient(135deg, #9b59b6, #8e44ad)' }}>
                                    ➕ Tạo thẻ vãng lai
                                </button>
                            </form>

                            {/* BỘ LỌC NHANH TRẠNG THÁI */}
                            <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #232931' }}>
                                <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '10px' }}>🔍 Lọc theo trạng thái thẻ:</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="card-filter-select"
                                    style={{ width: '100%', padding: '10px', background: '#111419', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }}
                                >
                                    <option value="Tất cả">📋 Tất cả ({cards.length} thẻ)</option>
                                    <option value="Sẵn sàng">🟢 Sẵn sàng</option>
                                    <option value="Đang sử dụng">🔵 Đang sử dụng</option>
                                    <option value="Đã hoàn tất">⚪ Đã hoàn tất</option>
                                    <option value="Mất/hỏng/tạm khóa">🔴 Mất/hỏng/tạm khóa</option>
                                </select>
                            </div>
                        </div>

                        {/* PANEL BÊN PHẢI: BẢNG GIÁM SÁT TRẠNG THÁI VÒNG ĐỜI THẺ */}
                        <div className="admin-section pkg-list-panel">
                            <div className="admin-section-title">
                                <h3>📊 KHO THẺ QUÉT VÃNG LAI HỆ THỐNG ({filteredCards.length})</h3>
                            </div>

                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Mã Thẻ (QR)</th>
                                            <th>Loại làn</th>
                                            <th>Trạng thái thẻ</th>
                                            <th>Ghi chú vận hành</th>
                                            <th style={{ textAlign: 'center' }}>Cập nhật nhanh</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCards.map((card) => (
                                            <tr key={card.id}>
                                                <td><span className="admin-plate" style={{ borderColor: '#8e44ad', color: '#d2b4de' }}>{card.code}</span></td>
                                                <td>{card.type}</td>
                                                <td>
                                                    <span className={`card-status-badge status-${card.status.replace(/\//g, '-').toLowerCase()}`}>
                                                        {card.status}
                                                    </span>
                                                </td>
                                                <td style={{ color: '#94a3b8', fontSize: '13px' }}>{card.note}</td>
                                                <td>
                                                    <div className="admin-actions" style={{ gap: '4px' }}>
                                                        {/* Các nút bấm đổi trạng thái nhanh mock */}
                                                        {card.status !== 'Sẵn sàng' && (
                                                            <button title="Đưa về kho sẵn sàng" onClick={() => handleChangeCardStatus(card.id, 'Sẵn sàng')} className="card-action-btn btn-ready">🟢</button>
                                                        )}
                                                        {card.status !== 'Mất/hỏng/tạm khóa' && (
                                                            <button title="Khóa/Báo mất thẻ" onClick={() => handleChangeCardStatus(card.id, 'Mất/hỏng/tạm khóa')} className="card-action-btn btn-lock">🔴</button>
                                                        )}
                                                        <button title="Xóa vĩnh viễn" onClick={() => handleDeleteCard(card.id, card.code)} className="btn-delete-inline" style={{ padding: '2px 6px' }}>🗑️</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminApproval;