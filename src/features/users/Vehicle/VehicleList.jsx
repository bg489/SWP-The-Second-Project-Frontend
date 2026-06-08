import React, { useState } from 'react';
import './VehicleList.css';

const VehicleList = () => {
    // 1. Dữ liệu Mock danh sách xe ban đầu của cá nhân User
    const [vehicles, setVehicles] = useState([
        { id: 1, licensePlate: '51G-123.45', type: 'Ô tô', note: 'Xe cá nhân đi làm', status: 'approved', package: 'Gói Cao Cấp (Vip)' },
        { id: 2, licensePlate: '51A-987.65', type: 'Ô tô', note: '', status: 'pending', package: 'Gói Cơ Bản' },
        { id: 3, licensePlate: '59T1-555.55', type: 'Xe máy', note: 'Xe của em trai', status: 'rejected', package: 'Không có' },
    ]);

    // 2. Các State quản lý trạng thái đóng/mở và dữ liệu của Form tạo mới
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPlate, setNewPlate] = useState('');
    const [newType, setNewType] = useState('Ô tô'); // Mặc định ban đầu chọn Ô tô
    const [newNote, setNewNote] = useState('');
    const [formError, setFormError] = useState('');

    // Hàm xử lý khi bấm Xem chi tiết phương tiện
    const handleDetail = (plate, note) => {
        alert(`Biển số: ${plate}\nGhi chú: ${note || 'Không có ghi chú'}`);
    };

    // Hàm xử lý khi bấm nút "Lưu xe mới" trên Form
    const handleFormSubmit = (e) => {
        e.preventDefault();

        // Validate frontend cơ bản: Không cho bỏ trống ô nhập biển số
        if (!newPlate.trim()) {
            setFormError('Vui lòng nhập biển số xe!');
            return;
        }

        // Tạo đối tượng phương tiện mới (Mặc định trạng thái luôn là 'pending' - Chờ duyệt)
        const newVehicle = {
            id: Date.now(),
            licensePlate: newPlate.toUpperCase(), // Tự động viết hoa toàn bộ biển số xe
            type: newType,
            note: newNote,
            status: 'pending', // Giả lập trạng thái Chờ Admin Phê Duyệt
            package: 'Chưa đăng ký'
        };

        // Đẩy xe mới tạo lên đầu danh sách hiển thị
        setVehicles([newVehicle, ...vehicles]);

        // Reset lại tất cả các ô Form và đóng popup đi
        setNewPlate('');
        setNewType('Ô tô');
        setNewNote('');
        setFormError('');
        setIsModalOpen(false);

        alert('Tạo xe mới thành công! Phương tiện đang ở trạng thái: CHỜ ADMIN DUYỆT.');
    };

    // Hàm render badge màu sắc dựa theo trạng thái duyệt của Admin
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'approved': return <span className="badge status-approved">Đã duyệt</span>;
            case 'pending': return <span className="badge status-pending">Chờ duyệt</span>;
            case 'rejected': return <span className="badge status-rejected">Bị từ chối</span>;
            default: return <span className="badge">Không rõ</span>;
        }
    };

    return (
        <div className="vehicle-container">
            <div className="vehicle-card">

                {/* Khu vực Tiêu đề & Nút Thêm xe */}
                <div className="vehicle-header">
                    <div>
                        <h2>🚗 DANH SÁCH XE CỦA BẠN</h2>
                        <p className="sub-title">Quản lý phương tiện và theo dõi trạng thái phê duyệt</p>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="create-vehicle-btn">
                        + Tạo xe mới
                    </button>
                </div>

                {/* Bảng hiển thị danh sách xe */}
                <div className="table-responsive">
                    <table className="vehicle-table">
                        <thead>
                            <tr>
                                <th>Biển số xe</th>
                                <th>Loại xe</th>
                                <th>Ghi chú</th>
                                <th>Trạng thái duyệt</th>
                                <th>Gói hiện tại</th>
                                <th style={{ textAlign: 'center' }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((item) => (
                                <tr key={item.id}>
                                    <td className="plate-cell">
                                        <span className="plate-number">{item.licensePlate}</span>
                                    </td>
                                    <td>{item.type}</td>
                                    <td className="note-text">
                                        {item.note || <span style={{ color: '#444' }}>---</span>}
                                    </td>
                                    <td>{renderStatusBadge(item.status)}</td>
                                    <td><span className="package-text">{item.package}</span></td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => handleDetail(item.licensePlate, item.note)} className="detail-btn">
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* ---------------- CỬA SỔ FORM POPUP (MODAL) TẠO XE MỚI ---------------- */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Thêm Phương Tiện Mới</h3>
                            <button onClick={() => setIsModalOpen(false)} className="close-modal-btn">&times;</button>
                        </div>

                        {formError && <div className="form-error-msg">{formError}</div>}

                        <form onSubmit={handleFormSubmit} className="modal-form">
                            {/* Ô nhập biển số xe */}
                            <div className="form-group">
                                <label>Biển số xe <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: 51G-123.45"
                                    value={newPlate}
                                    onChange={(e) => setNewPlate(e.target.value)}
                                />
                            </div>

                            {/* Ô lựa chọn loại phương tiện */}
                            <div className="form-group">
                                <label>Loại xe</label>
                                <div className="radio-group">
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="vehicleType"
                                            value="Ô tô"
                                            checked={newType === 'Ô tô'}
                                            onChange={() => setNewType('Ô tô')}
                                        />
                                        <span>Ô tô</span>
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="vehicleType"
                                            value="Xe máy"
                                            checked={newType === 'Xe máy'}
                                            onChange={() => setNewType('Xe máy')}
                                        />
                                        <span>Xe máy</span>
                                    </label>
                                </div>
                            </div>

                            {/* Ô nhập ghi chú bổ sung */}
                            <div className="form-group">
                                <label>Ghi chú (Nếu có)</label>
                                <textarea
                                    placeholder="Nhập mục đích sử dụng, mô tả xe..."
                                    rows="3"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                ></textarea>
                            </div>

                            {/* Nhóm các nút bấm tương tác */}
                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="cancel-btn">
                                    Hủy bỏ
                                </button>
                                <button type="submit" className="save-btn">
                                    Lưu xe mới
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default VehicleList;