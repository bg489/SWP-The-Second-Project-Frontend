/**
 * @fileoverview Khai báo chức năng frontend của module Login.
 *
 * Luồng chính: Dữ liệu đầu vào -> xử lý theo trách nhiệm của module -> xuất kết quả cho lớp gọi.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useState } from 'react';
import './Login.css';
import VehicleList from '../vehicle/VehicleList.jsx';
import StaffDashboard from '../staffDashBoard/StaffDashboard.jsx';
import AdminApproval from '../admin/AdminApproval.jsx'; // Chỉnh lại dấu ../ cho đúng đường dẫn thực tế của bạn
const Login = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('user'); // Mặc định ban đầu chọn quyền user
    const [errors, setErrors] = useState({});
    const [successMsg, setSuccessMsg] = useState('');
    const [dashboardView, setDashboardView] = useState(null);

    /**
     * Kiểm tra nghiệp vụ `validateForm` (validate form). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
     *
     * @function validateForm
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    const validateForm = () => {
        let tempErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) tempErrors.email = 'Email không được để trống';
        else if (!emailRegex.test(email)) tempErrors.email = 'Định dạng Email không hợp lệ';

        if (!password) tempErrors.password = 'Mật khẩu không được để trống';
        else if (password.length < 6) tempErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';

        if (!isLoginView) {
            if (!fullName.trim()) tempErrors.fullName = 'Vui lòng nhập họ và tên';
            if (password !== confirmPassword) tempErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    /**
     * Xử lý nghiệp vụ `handleSubmit` (handle submit). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
     *
     * @function handleSubmit
     * @param {*} e - Giá trị `e` được hàm sử dụng trong quá trình xử lý.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            if (isLoginView) {
                setSuccessMsg(`Đăng nhập thành công với quyền: ${role.toUpperCase()}!`);
                /* Callback nội bộ của lời gọi `setTimeout`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
                setTimeout(() => { setDashboardView(role); }, 1200);
            } else {
                setSuccessMsg('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.');
                /* Callback nội bộ của lời gọi `setTimeout`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
                setTimeout(() => {
                    setIsLoginView(true);
                    setSuccessMsg('');
                    setErrors({});
                }, 1500);
            }
        }
    };

    /**
     * Thực hiện nghiệp vụ `switchView` (switch view). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
     *
     * @function switchView
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    const switchView = () => {
        setIsLoginView(!isLoginView);
        setErrors({});
        setSuccessMsg('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
    };

    // --- ĐIỀU HƯỚNG DASHBOARD THEO ROLE (ĐÃ CẬP NHẬT STAFF) ---
    // --- ĐIỀU HƯỚNG DASHBOARD THEO ROLE ---
    if (dashboardView) {
        if (dashboardView === 'admin') {
            // SỬA TẠI ĐÂY: Thay đổi <StaffDashboard /> thành <AdminApproval />
            return (
                <div style={{ width: '100%', maxWidth: '1020px', margin: '0 auto', padding: '10px' }}>
                    <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                        <button onClick={() => setDashboardView(null)} className="logout-btn" style={{ width: 'auto', padding: '6px 12px' }}>
                            Đăng xuất Admin ⚙️
                        </button>
                    </div>
                    {/* Gọi chính xác trang duyệt xe của Admin */}
                    <AdminApproval />
                </div>
            );
        } else if (dashboardView === 'staff') {
            // NẾU LÀ STAFF: Giữ nguyên để hiển thị bảng quét QR bãi xe
            return (
                <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '10px' }}>
                    <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                        <button onClick={() => setDashboardView(null)} className="logout-btn" style={{ width: 'auto', padding: '6px 12px' }}>
                            Đăng xuất Staff 🛠️
                        </button>
                    </div>
                    <StaffDashboard />
                </div>
            );
        } else {
            // NẾU LÀ USER: Xem phương tiện cá nhân
            return (
                <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', background: '#242424', padding: '6px 12px', borderRadius: '4px', border: '1px solid #333' }}>
                            👤 MÀN HÌNH USER
                        </div>
                        <button onClick={() => setDashboardView(null)} className="logout-btn" style={{ width: 'auto', margin: 0, padding: '6px 15px', fontSize: '13px' }}>
                            Đăng xuất
                        </button>
                    </div>
                    <VehicleList />
                </div>
            );
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>{isLoginView ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}</h2>
                    <p>{isLoginView ? 'Vui lòng truy cập tài khoản của bạn' : 'Tạo tài khoản mới để trải nghiệm'}</p>
                </div>

                {successMsg && <div className="success-toast">{successMsg}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    {!isLoginView && (
                        <div className="input-group">
                            <label>Họ và tên</label>
                            <input type="text" placeholder="Nguyễn Văn A" value={fullName} onChange={(e) => setFullName(e.target.value)} className={errors.fullName ? 'input-error' : ''} />
                            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                        </div>
                    )}

                    <div className="input-group">
                        <label>Email</label>
                        <input type="text" placeholder="example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} className={errors.email ? 'input-error' : ''} />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    <div className="input-group">
                        <label>Mật khẩu</label>
                        <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={errors.password ? 'input-error' : ''} />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>

                    {!isLoginView && (
                        <div className="input-group">
                            <label>Xác nhận mật khẩu</label>
                            <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={errors.confirmPassword ? 'input-error' : ''} />
                            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                        </div>
                    )}

                    {isLoginView && (
                        <div className="input-group">
                            <label>Chọn quyền đăng nhập (Mock Role)</label>
                            <select value={role} onChange={(e) => setRole(e.target.value)} className="role-select">
                                <option value="user">User (Thành viên thông thường)</option>
                                <option value="staff">Staff (Nhân viên điều hành bãi)</option>
                                <option value="admin">Admin (Quản trị viên)</option>
                            </select>
                        </div>
                    )}

                    <button type="submit" className="login-btn">{isLoginView ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}</button>
                </form>

                <div className="login-footer">
                    <p>
                        {isLoginView ? 'Chưa có tài khoản?' : 'Đã có tài khoản rồi?'}
                        <button type="button" onClick={switchView} className="switch-view-btn">{isLoginView ? 'Đăng ký ngay' : 'Quay lại Đăng nhập'}</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;