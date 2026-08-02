/**
 * @fileoverview Xây dựng màn hình AdminBuildingChangeRequestsPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, CalendarDays, CheckCircle2, Mail, Phone, RefreshCcw, XCircle } from "lucide-react";

import Button from "../../../components/Button/Button";
import StatusBanner from "../../../components/Feedback/StatusBanner";
import Table from "../../../components/Table/Table";
import {
    approveBuildingChangeRequest,
    fetchAdminBuildingChangeRequestsRequest,
    rejectBuildingChangeRequest,
} from "../buildingChange/buildingChangeSlice";

/**
 * Khai báo `roleLabels` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/backend/pages/AdminBuildingChangeRequestsPage.jsx.
 */
const roleLabels = {
    ADMIN: "Quản trị viên",
    MANAGER: "Quản lý bãi xe",
    STAFF: "Nhân viên bãi xe",
    USER: "Cư dân",
};

/**
 * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `formatDateTime` (format date time). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function formatDateTime
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const formatDateTime = (value) =>
    value
        ? new Date(value).toLocaleString("vi-VN", {
            dateStyle: "short",
            timeStyle: "short",
        })
        : "-";

/**
 * Thực hiện nghiệp vụ `AdminBuildingChangeRequestsPage` (admin building change requests page). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function AdminBuildingChangeRequestsPage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const AdminBuildingChangeRequestsPage = () => {
    const dispatch = useDispatch();
    const { adminRequests, adminLoading, actionId, error, notice } = useSelector(
        /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        (state) => state.buildingChange
    );

    /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    useEffect(() => {
        dispatch(fetchAdminBuildingChangeRequestsRequest({ status: "PENDING" }));
    }, [dispatch]);

    /**
     * Thực hiện nghiệp vụ `refresh` (refresh). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function refresh
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    const refresh = () => {
        dispatch(fetchAdminBuildingChangeRequestsRequest({ status: "PENDING" }));
    };

    /**
     * Thực hiện nghiệp vụ `approveRequest` (approve request). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function approveRequest
     * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    const approveRequest = (request) => {
        const adminNote = window.prompt("Ghi chú duyệt:", "Đã duyệt đổi tòa nhà");

        dispatch(
            approveBuildingChangeRequest({
                id: request.id,
                adminNote: adminNote || undefined,
            })
        );
    };

    /**
     * Thực hiện nghiệp vụ `rejectRequest` (reject request). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function rejectRequest
     * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    const rejectRequest = (request) => {
        const adminNote = window.prompt("Lý do từ chối:", "Thông tin chưa hợp lệ");

        dispatch(
            rejectBuildingChangeRequest({
                id: request.id,
                adminNote: adminNote || undefined,
            })
        );
    };

    const columns = [
        /**
         * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
         *
         * @function render
         * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
         * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
         */
        { header: "Mã", key: "id", render: (request) => `#${request.id}` },
        {
            header: "Người yêu cầu",
            key: "userName",
            minWidth: "245px",
            /**
             * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
             *
             * @function render
             * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
             * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
             */
            render: (request) => (
                <div className="request-person">
                    <div className="request-person-avatar">
                        {request.userAvatarUrl ? (
                            <img
                                src={request.userAvatarUrl}
                                alt={request.userName}
                                style={{
                                    objectPosition: `${Number(request.userAvatarCropX ?? 50)}% ${Number(request.userAvatarCropY ?? 50)}%`,
                                    transform: `scale(${Number(request.userAvatarCropZoom ?? 1)})`,
                                }}
                            />
                        ) : (
                            String(request.userName || "U").slice(0, 1).toUpperCase()
                        )}
                    </div>
                    <div className="request-person-copy">
                        <strong>{request.userName || "Chưa cập nhật họ tên"}</strong>
                        <span className="pill info">{roleLabels[request.userRole] || request.userRole || "Người dùng"}</span>
                        <small>Mã tài khoản #{request.userId}</small>
                    </div>
                </div>
            ),
        },
        {
            header: "Thông tin cá nhân",
            key: "contact",
            minWidth: "230px",
            /**
             * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
             *
             * @function render
             * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
             * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
             */
            render: (request) => (
                <div className="request-contact-list">
                    <span><Mail size={14} /> {request.userEmail || "Chưa có email"}</span>
                    <span><Phone size={14} /> {request.userPhone || "Chưa có số điện thoại"}</span>
                    <span><CalendarDays size={14} /> Tham gia {formatDateTime(request.userCreatedAt)}</span>
                </div>
            ),
        },
        {
            header: "Tòa hiện tại",
            key: "currentBuildingName",
            minWidth: "190px",
            /**
             * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
             *
             * @function render
             * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
             * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
             */
            render: (request) => (
                <>
                    <strong>{request.currentBuildingName || "Chưa được phân tòa"}</strong>
                    <br />
                    <span className="metric-note">{request.currentBuildingAddress || "Chưa có địa chỉ"}</span>
                </>
            ),
        },
        {
            header: "Tòa muốn chuyển",
            key: "requestedBuildingName",
            minWidth: "190px",
            /**
             * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
             *
             * @function render
             * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
             * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
             */
            render: (request) => (
                <>
                    <strong>{request.requestedBuildingName}</strong>
                    <br />
                    <span className="metric-note">{request.requestedBuildingAddress || "-"}</span>
                </>
            ),
        },
        {
            header: "Lý do và thời gian",
            key: "reason",
            minWidth: "210px",
            /**
             * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
             *
             * @function render
             * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
             * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
             */
            render: (request) => (
                <>
                    <span>{request.reason || "Không ghi lý do"}</span>
                    <br />
                    <span className="metric-note">Gửi lúc {formatDateTime(request.createdAt)}</span>
                </>
            ),
        },
        {
            header: "Thao tác",
            key: "actions",
            /**
             * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
             *
             * @function render
             * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
             * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
             */
            render: (request) => (
                <div className="action-row">
                    <Button
                        type="button"
                        size="sm"
                        icon={CheckCircle2}
                        loading={actionId === request.id}
                        disabled={actionId === request.id}
                        onClick={() => approveRequest(request)}
                    >
                        Duyệt
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        icon={XCircle}
                        disabled={actionId === request.id}
                        onClick={() => rejectRequest(request)}
                    >
                        Từ chối
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="parking-page">
            <section className="page-hero">
                <div>
                    <div className="page-eyebrow">
                        <Building2 size={16} /> Duyệt đổi tòa nhà
                    </div>
                    <h1 className="page-title">Duyệt yêu cầu đổi tòa nhà</h1>
                    <p className="page-subtitle">
                        Kiểm tra đầy đủ hồ sơ cư dân hoặc nhân viên trước khi chuyển sang tòa nhà mới.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    icon={RefreshCcw}
                    onClick={refresh}
                    loading={adminLoading}
                >
                    Tải lại
                </Button>
            </section>

            <StatusBanner success={notice} errors={error} />

            <section className="section-card card">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Yêu cầu đang chờ duyệt</h2>
                        <p className="section-copy">Mỗi yêu cầu có đầy đủ thông tin liên hệ, vai trò và nơi làm việc hiện tại.</p>
                    </div>
                </div>

                <Table
                    columns={columns}
                    data={adminRequests}
                    loading={adminLoading}
                    emptyMessage="Không có yêu cầu chờ duyệt."
                />
            </section>
        </div>
    );
};

export default AdminBuildingChangeRequestsPage;
