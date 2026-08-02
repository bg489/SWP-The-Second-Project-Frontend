/**
 * @fileoverview Xây dựng màn hình UserBuildingChangeRequestPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, RefreshCcw, Send } from "lucide-react";

import Button from "../../../components/Button/Button";
import StatusBanner from "../../../components/Feedback/StatusBanner";
import FormField from "../../../components/Form/FormField";
import Table from "../../../components/Table/Table";
import useResetAfterSuccess from "../../../hooks/useResetAfterSuccess";
import {
    fetchBuildingsRequest,
    fetchMyBuildingChangeRequestsRequest,
    submitBuildingChangeRequest,
} from "../buildingChange/buildingChangeSlice";

/**
 * Khai báo `statusLabels` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/backend/pages/UserBuildingChangeRequestPage.jsx.
 */
const statusLabels = {
    PENDING: "Chờ quản trị viên duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Đã từ chối",
    CANCELLED: "Đã hủy",
};

/**
 * Khai báo `statusTone` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/backend/pages/UserBuildingChangeRequestPage.jsx.
 */
const statusTone = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "danger",
    CANCELLED: "neutral",
};

/**
 * Thực hiện nghiệp vụ `UserBuildingChangeRequestPage` (user building change request page). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function UserBuildingChangeRequestPage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const UserBuildingChangeRequestPage = () => {
    const dispatch = useDispatch();
    /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    const { user } = useSelector((state) => state.auth);
    const {
        buildings,
        buildingsLoading,
        buildingsError,
        myRequests,
        myLoading,
        submitLoading,
        error,
        notice,
    /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    } = useSelector((state) => state.buildingChange);

    const [form, setForm] = useState({
        requestedBuildingId: "",
        reason: "",
    });
    const [formError, setFormError] = useState("");

    const currentBuildingId = user?.buildingId;
    /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    const currentBuilding = useMemo(() => {
        /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        return buildings.find((building) => Number(building.id) === Number(currentBuildingId)) || {
            id: currentBuildingId,
            name: user?.buildingName || "Chưa có tòa nhà",
            address: user?.buildingAddress || "",
        };
    }, [buildings, currentBuildingId, user?.buildingAddress, user?.buildingName]);

    /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    const availableBuildings = useMemo(() => {
        /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        return buildings.filter((building) => Number(building.id) !== Number(currentBuildingId));
    }, [buildings, currentBuildingId]);

    /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    useEffect(() => {
        dispatch(fetchBuildingsRequest());
        dispatch(fetchMyBuildingChangeRequestsRequest());
    }, [dispatch]);

    /**
     * Xóa hoặc đặt lại nghiệp vụ `resetRequestForm` (reset request form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function resetRequestForm
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    const resetRequestForm = () => {
        setForm({
            requestedBuildingId: "",
            reason: "",
        });
        setFormError("");
    };

    const markRequestSubmitted = useResetAfterSuccess({
        submitting: submitLoading,
        success: notice,
        error,
        onSuccess: resetRequestForm,
    });

    /**
     * Xử lý nghiệp vụ `handleSubmit` (handle submit). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function handleSubmit
     * @param {*} event - Sự kiện phát sinh từ thao tác của người dùng.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    const handleSubmit = (event) => {
        event.preventDefault();

        if (!form.requestedBuildingId) {
            setFormError("Vui lòng chọn tòa nhà muốn chuyển đến.");
            return;
        }

        markRequestSubmitted();
        dispatch(
            submitBuildingChangeRequest({
                requestedBuildingId: Number(form.requestedBuildingId),
                reason: form.reason.trim() || undefined,
            })
        );
    };

    /**
     * Thực hiện nghiệp vụ `refresh` (refresh). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function refresh
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    const refresh = () => {
        dispatch(fetchBuildingsRequest());
        dispatch(fetchMyBuildingChangeRequestsRequest());
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
        { header: "Tòa nhà muốn chuyển", key: "requestedBuildingName" },
        /**
         * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
         *
         * @function render
         * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
         * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
         */
        { header: "Lý do", key: "reason", render: (request) => request.reason || "-" },
        {
            header: "Trạng thái",
            key: "status",
            /**
             * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
             *
             * @function render
             * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
             * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
             */
            render: (request) => (
                <span className={`pill ${statusTone[request.status] || "neutral"}`}>
                    {statusLabels[request.status] || request.status}
                </span>
            ),
        },
        /**
         * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
         *
         * @function render
         * @param {*} request - Giá trị `request` được hàm sử dụng trong quá trình xử lý.
         * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
         */
        { header: "Ghi chú duyệt", key: "adminNote", render: (request) => request.adminNote || "-" },
    ];

    return (
        <div className="parking-page">
            <section className="page-hero">
                <div>
                    <div className="page-eyebrow">
                        <Building2 size={16} /> Đổi tòa nhà
                    </div>
                    <h1 className="page-title">Yêu cầu đổi tòa nhà</h1>
                    <p className="page-subtitle">
                        Gửi yêu cầu chuyển sang tòa nhà khác. Quản trị viên sẽ duyệt trước khi thay đổi có hiệu lực.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    icon={RefreshCcw}
                    onClick={refresh}
                    loading={myLoading || buildingsLoading}
                >
                    Tải lại
                </Button>
            </section>

            <section className="section-card card">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Thông tin hiện tại</h2>
                        <p className="section-copy">Kiểm tra tòa nhà đang ở trước khi chọn nơi muốn chuyển đến.</p>
                    </div>
                </div>

                <div className="data-list" style={{ marginBottom: 16 }}>
                    <div className="data-row">
                        <span>Tòa nhà hiện tại</span>
                        <strong>{currentBuilding?.name || "Chưa có tòa nhà"}</strong>
                    </div>
                    <div className="data-row">
                        <span>Địa chỉ</span>
                        <strong>{currentBuilding?.address || "Chưa có địa chỉ"}</strong>
                    </div>
                    <div className="data-row">
                        <span>Tài khoản</span>
                        <strong>{user?.name || user?.email || "-"}</strong>
                    </div>
                </div>

                <StatusBanner success={notice} errors={[formError, error, buildingsError]} />

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
                    <FormField label="Tòa nhà muốn chuyển đến" required>
                        <select
                            className="form-input"
                            value={form.requestedBuildingId}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    requestedBuildingId: event.target.value,
                                }))
                            }
                            disabled={submitLoading || buildingsLoading}
                        >
                            <option value="">
                                {buildingsLoading ? "Đang tải tòa nhà..." : "Chọn tòa nhà"}
                            </option>

                            {availableBuildings.map((building) => (
                                <option key={building.id} value={building.id}>
                                    {building.name}
                                    {building.address ? ` - ${building.address}` : ""}
                                </option>
                            ))}
                        </select>
                    </FormField>

                    <FormField label="Lý do đổi tòa nhà">
                        <textarea
                            className="form-input"
                            rows="4"
                            placeholder="Ví dụ: Tôi đã chuyển căn hộ sang tòa nhà khác..."
                            value={form.reason}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    reason: event.target.value,
                                }))
                            }
                            disabled={submitLoading}
                        />
                    </FormField>

                    <Button type="submit" icon={Send} loading={submitLoading} disabled={submitLoading}>
                        Gửi yêu cầu
                    </Button>
                </form>
            </section>

            <section className="section-card card">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Lịch sử yêu cầu</h2>
                        <p className="section-copy">Theo dõi trạng thái các yêu cầu đã gửi.</p>
                    </div>
                </div>

                <Table
                    columns={columns}
                    data={myRequests}
                    loading={myLoading}
                    emptyMessage="Chưa có yêu cầu đổi tòa nhà."
                />
            </section>
        </div>
    );
};

export default UserBuildingChangeRequestPage;
