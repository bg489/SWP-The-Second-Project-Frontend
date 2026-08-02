/**
 * @fileoverview Xây dựng màn hình AdminUserApprovalPage, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Camera,
    KeyRound,
    Mail,
    Plus,
    RefreshCcw,
    Search,
    ShieldCheck,
    UserCheck,
    UserPlus,
    UserX,
} from "lucide-react";

import Button from "../../../components/Button/Button";
import StatusBanner from "../../../components/Feedback/StatusBanner";
import FormField from "../../../components/Form/FormField";
import Input from "../../../components/Form/Input";
import Select from "../../../components/Form/Select";
import Table from "../../../components/Table/Table";
import useResetAfterSuccess from "../../../hooks/useResetAfterSuccess";
import { compressImageFile } from "../../../utils/imageFile";
import {
    createAdminUserRequest,
    clearAdminUserNotice,
    fetchAdminUsersRequest,
    setAdminUserLockRequest,
} from "../adminUsers/adminUserSlice";
import { fetchBuildingsRequest } from "../buildings/buildingSlice";

/**
 * Khai báo `statusOptions` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/backend/pages/AdminUserApprovalPage.jsx.
 */
const statusOptions = [
    { label: "Tất cả", value: "" },
    { label: "Chờ duyệt", value: "PENDING" },
    { label: "Đang hoạt động", value: "ACTIVE" },
    { label: "Đã khóa", value: "LOCKED" },
    { label: "Không hoạt động", value: "INACTIVE" },
];

/**
 * Khai báo `roleOptions` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/backend/pages/AdminUserApprovalPage.jsx.
 */
const roleOptions = [
    { label: "Cư dân", value: "USER" },
    { label: "Nhân viên bãi xe", value: "STAFF" },
    { label: "Quản lý bãi xe", value: "MANAGER" },
    { label: "Quản trị viên", value: "ADMIN" },
];

/**
 * Khai báo `roleCreationMeta` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/backend/pages/AdminUserApprovalPage.jsx.
 */
const roleCreationMeta = {
    USER: {
        title: "Tài khoản cư dân",
        description: "Dùng các chức năng đăng ký xe, mua gói tháng và nhận thông báo tại tòa nhà đang ở.",
        requirement: "Bắt buộc chọn tòa nhà",
    },
    STAFF: {
        title: "Tài khoản nhân viên bãi xe",
        description: "Được gắn với một tòa nhà và có hồ sơ nhân viên riêng, tách biệt hoàn toàn với cư dân.",
        requirement: "Tòa nhà và ảnh hồ sơ bắt buộc",
    },
    MANAGER: {
        title: "Tài khoản quản lý bãi xe",
        description: "Quản lý vận hành trên toàn hệ thống và không bị gắn cố định với một tòa nhà.",
        requirement: "Quyền quản lý toàn hệ thống",
    },
    ADMIN: {
        title: "Tài khoản quản trị viên",
        description: "Quản lý tài khoản và các yêu cầu cấp Staff trên toàn hệ thống.",
        requirement: "Quyền quản trị toàn hệ thống",
    },
};

/**
 * Khai báo `roleLabels` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/backend/pages/AdminUserApprovalPage.jsx.
 */
const roleLabels = Object.fromEntries(
    /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    roleOptions.map((option) => [option.value, option.label])
);

/**
 * Khai báo `emptyCreateForm` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/backend/pages/AdminUserApprovalPage.jsx.
 */
const emptyCreateForm = {
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "USER",
    buildingId: "",
    portraitImageUrl: "",
};

/**
 * Khai báo `statusLabels` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/backend/pages/AdminUserApprovalPage.jsx.
 */
const statusLabels = {
    PENDING: "Chờ duyệt",
    ACTIVE: "Đang hoạt động",
    LOCKED: "Đã khóa",
    INACTIVE: "Không hoạt động",
};

/**
 * Khai báo `statusTone` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/backend/pages/AdminUserApprovalPage.jsx.
 */
const statusTone = {
    PENDING: "warning",
    ACTIVE: "success",
    LOCKED: "danger",
    INACTIVE: "neutral",
};

/**
 * Thực hiện nghiệp vụ `AdminUserApprovalPage` (admin user approval page). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function AdminUserApprovalPage
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const AdminUserApprovalPage = () => {
    const dispatch = useDispatch();
    const {
        users,
        pagination,
        loading,
        error,
        creating,
        updatingId,
        updateError,
        updateSuccess,
    /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    } = useSelector((state) => state.adminUsers);
    const { buildings, loading: buildingsLoading, error: buildingsError } = useSelector(
        /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        (state) => state.buildings
    );
    const [filters, setFilters] = useState({
        q: "",
        status: "",
        role: "",
        page: 1,
        limit: 10,
    });
    const [createForm, setCreateForm] = useState(emptyCreateForm);
    const [createErrors, setCreateErrors] = useState({});
    const [processingImage, setProcessingImage] = useState(false);

    const pendingCount = useMemo(
        /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        () => users.filter((user) => user.status === "PENDING").length,
        [users]
    );
    const activeCount = useMemo(
        /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        () => users.filter((user) => user.status === "ACTIVE").length,
        [users]
    );
    const buildingOptions = useMemo(
        /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        () => buildings.map((building) => ({
            value: String(building.id),
            label: `${building.name}${building.address ? ` - ${building.address}` : ""}`,
        })),
        [buildings]
    );
    const accountNeedsBuilding = ["USER", "STAFF"].includes(createForm.role);

    /**
     * Lấy nghiệp vụ `getRefreshParams` (get refresh params). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function getRefreshParams
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    const getRefreshParams = () => ({
        q: filters.q || undefined,
        status: filters.status || undefined,
        role: filters.role || undefined,
        page: filters.page,
        limit: filters.limit,
    });

    /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    useEffect(() => {
        dispatch(fetchBuildingsRequest());
    }, [dispatch]);

    /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    useEffect(() => {
        dispatch(fetchAdminUsersRequest({
            q: filters.q || undefined,
            status: filters.status || undefined,
            role: filters.role || undefined,
            page: filters.page,
            limit: filters.limit,
        }));
    }, [dispatch, filters.q, filters.status, filters.role, filters.page, filters.limit]);

    const markCreateSubmitted = useResetAfterSuccess({
        submitting: creating,
        success: updateSuccess,
        error: updateError,
        /**
         * Xử lý nghiệp vụ `onSuccess` (on success). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
         *
         * @function onSuccess
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        onSuccess: () => {
            setCreateForm(emptyCreateForm);
            setCreateErrors({});
        },
    });

    /**
     * Cập nhật nghiệp vụ `updateFilter` (update filter). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function updateFilter
     * @param {*} field - Giá trị `field` được hàm sử dụng trong quá trình xử lý.
     * @param {*} value - Giá trị đầu vào cần xử lý.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    const updateFilter = (field, value) => {
        dispatch(clearAdminUserNotice());
        /* Callback nội bộ của lời gọi `setFilters`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        setFilters((current) => ({ ...current, [field]: value, page: 1 }));
    };

    /**
     * Cập nhật nghiệp vụ `updateCreateForm` (update create form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function updateCreateForm
     * @param {*} field - Giá trị `field` được hàm sử dụng trong quá trình xử lý.
     * @param {*} value - Giá trị đầu vào cần xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    const updateCreateForm = (field, value) => {
        dispatch(clearAdminUserNotice());
        /* Callback nội bộ của lời gọi `setCreateForm`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        setCreateForm((current) => {
            const next = { ...current, [field]: value };
            if (field === "role" && value !== "STAFF") next.portraitImageUrl = "";
            if (field === "role" && !["USER", "STAFF"].includes(value)) next.buildingId = "";
            return next;
        });
        /* Callback nội bộ của lời gọi `setCreateErrors`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        setCreateErrors((current) => ({ ...current, [field]: "" }));
    };

    /**
     * Xử lý nghiệp vụ `handlePortrait` (handle portrait). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function handlePortrait
     * @param {*} event - Sự kiện phát sinh từ thao tác của người dùng.
     * @returns {Promise<*>} Promise chứa kết quả khi toàn bộ thao tác bất đồng bộ hoàn tất.
     */
    const handlePortrait = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        setProcessingImage(true);
        try {
            const portraitImageUrl = await compressImageFile(file, {
                maxWidth: 900,
                maxHeight: 1200,
                maxLength: 850_000,
            });
            updateCreateForm("portraitImageUrl", portraitImageUrl);
        } catch (imageError) {
            /* Callback nội bộ của lời gọi `setCreateForm`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
            setCreateForm((current) => ({ ...current, portraitImageUrl: "" }));
            /* Callback nội bộ của lời gọi `setCreateErrors`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
            setCreateErrors((current) => ({
                ...current,
                portraitImageUrl: imageError.message || "Không chuẩn bị được ảnh chân dung.",
            }));
        } finally {
            setProcessingImage(false);
        }
    };

    /**
     * Kiểm tra nghiệp vụ `validateCreateForm` (validate create form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function validateCreateForm
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    const validateCreateForm = () => {
        const nextErrors = {};
        if (createForm.name.trim().length < 2) nextErrors.name = "Vui lòng nhập họ tên đầy đủ.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email.trim())) {
            nextErrors.email = "Email không hợp lệ.";
        }
        if (createForm.phone.trim() && !/^0\d{9}$/.test(createForm.phone.trim())) {
            nextErrors.phone = "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.";
        }
        if (createForm.password.length < 6) nextErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
        if (accountNeedsBuilding && !createForm.buildingId) {
            nextErrors.buildingId = "Vui lòng chọn tòa nhà cho tài khoản này.";
        }
        if (createForm.role === "STAFF" && !createForm.portraitImageUrl) {
            nextErrors.portraitImageUrl = "Tài khoản Staff cần có ảnh chân dung hồ sơ.";
        }
        setCreateErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    /**
     * Xử lý nghiệp vụ `handleCreateAccount` (handle create account). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function handleCreateAccount
     * @param {*} event - Sự kiện phát sinh từ thao tác của người dùng.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    const handleCreateAccount = (event) => {
        event.preventDefault();
        dispatch(clearAdminUserNotice());
        if (!validateCreateForm()) return;

        markCreateSubmitted();
        dispatch(createAdminUserRequest({
            name: createForm.name.trim(),
            email: createForm.email.trim(),
            phone: createForm.phone.trim() || undefined,
            password: createForm.password,
            role: createForm.role,
            buildingId: accountNeedsBuilding ? Number(createForm.buildingId) : undefined,
            portraitImageUrl: createForm.role === "STAFF"
                ? createForm.portraitImageUrl
                : undefined,
            refreshParams: { ...getRefreshParams(), page: 1 },
        }));
    };

    /**
     * Cập nhật nghiệp vụ `setAccountLock` (set account lock). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function setAccountLock
     * @param {*} user - Giá trị `user` được hàm sử dụng trong quá trình xử lý.
     * @param {*} locked - Giá trị `locked` được hàm sử dụng trong quá trình xử lý.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    const setAccountLock = (user, locked) => {
        dispatch(setAdminUserLockRequest({
            id: user.id,
            locked,
            refreshParams: getRefreshParams(),
        }));
    };

    const columns = [
        /**
         * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
         *
         * @function render
         * @param {*} user - Giá trị `user` được hàm sử dụng trong quá trình xử lý.
         * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
         */
        { header: "Mã", key: "id", render: (user) => `#${user.id}` },
        {
            header: "Người dùng",
            key: "name",
            minWidth: "180px",
            /**
             * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
             *
             * @function render
             * @param {*} user - Giá trị `user` được hàm sử dụng trong quá trình xử lý.
             * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
             */
            render: (user) => (
                <>
                    <strong>{user.name}</strong>
                    <br />
                    <span className="metric-note">{user.buildingName || "Không gắn tòa nhà"}</span>
                </>
            ),
        },
        {
            header: "Liên hệ",
            key: "email",
            minWidth: "210px",
            /**
             * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
             *
             * @function render
             * @param {*} user - Giá trị `user` được hàm sử dụng trong quá trình xử lý.
             * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
             */
            render: (user) => (
                <>
                    <span>{user.email}</span>
                    <br />
                    <span className="metric-note">{user.phone || "Chưa có số điện thoại"}</span>
                </>
            ),
        },
        {
            header: "Thông tin hồ sơ",
            key: "approvalInfo",
            minWidth: "190px",
            /**
             * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
             *
             * @function render
             * @param {*} user - Giá trị `user` được hàm sử dụng trong quá trình xử lý.
             * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
             */
            render: (user) => (
                <>
                    <strong>{user.role === "STAFF" ? "Tài khoản Staff riêng" : user.role}</strong>
                    <br />
                    <span className="metric-note">{Number(user.vehicleCount || 0)} xe đã đăng ký</span>
                </>
            ),
        },
        {
            header: "Vai trò",
            key: "role",
            minWidth: "220px",
            /**
             * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
             *
             * @function render
             * @param {*} user - Giá trị `user` được hàm sử dụng trong quá trình xử lý.
             * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
             */
            render: (user) => (
                <div className="admin-role-static">
                    <strong>{roleLabels[user.role] || user.role}</strong>
                    <span>Vai trò cố định từ khi tạo</span>
                </div>
            ),
        },
        {
            header: "Trạng thái",
            key: "status",
            /**
             * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
             *
             * @function render
             * @param {*} user - Giá trị `user` được hàm sử dụng trong quá trình xử lý.
             * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
             */
            render: (user) => (
                <span className={`pill ${statusTone[user.status] || "neutral"}`}>
                    {statusLabels[user.status] || user.status}
                </span>
            ),
        },
        {
            header: "Ngày tạo",
            key: "createdAt",
            /**
             * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
             *
             * @function render
             * @param {*} user - Giá trị `user` được hàm sử dụng trong quá trình xử lý.
             * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
             */
            render: (user) => user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                : "-",
        },
        {
            header: "Thao tác",
            key: "actions",
            minWidth: "150px",
            /**
             * Hiển thị nghiệp vụ `render` (render). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
             *
             * @function render
             * @param {*} user - Giá trị `user` được hàm sử dụng trong quá trình xử lý.
             * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
             */
            render: (user) => {
                const isLocked = user.status === "LOCKED";
                const isActive = user.status === "ACTIVE";

                return (
                    <div className="action-row admin-account-actions">
                        {isLocked && (
                            <Button
                                size="sm"
                                icon={UserCheck}
                                loading={updatingId === user.id}
                                disabled={updatingId === user.id}
                                onClick={() => setAccountLock(user, false)}
                            >
                                Mở khóa
                            </Button>
                        )}
                        {isActive && (
                            <Button
                                size="sm"
                                variant="danger"
                                icon={UserX}
                                loading={updatingId === user.id}
                                disabled={updatingId === user.id}
                                onClick={() => setAccountLock(user, true)}
                            >
                                Khóa
                            </Button>
                        )}
                        {!isActive && !isLocked && (
                            <span className="metric-note">Không có thao tác</span>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <div className="parking-page">
            <section className="page-hero">
                <div className="page-hero-content">
                    <div className="page-eyebrow"><ShieldCheck size={16} /> Quản lý tài khoản</div>
                    <h1 className="page-title">Tạo và quản lý toàn bộ tài khoản</h1>
                    <p className="page-subtitle">
                        Admin tạo trực tiếp tài khoản Cư dân, Staff, Manager hoặc Admin và có thể khóa tài khoản khi cần. Vai trò được giữ cố định sau khi tạo.
                    </p>
                </div>
                <div className="page-hero-aside">
                    <span className="page-hero-label">Tổng tài khoản</span>
                    <span className="page-hero-number">{Number(pagination?.total || users.length)}</span>
                    <span className="page-hero-label">tài khoản</span>
                </div>
            </section>

            <StatusBanner success={updateSuccess} errors={[error, updateError, buildingsError]} />

            <section className="dashboard-grid">
                <div className="metric-card">
                    <div className="metric-label">Đang hoạt động</div>
                    <div className="metric-value">{activeCount}</div>
                    <div className="metric-note">Trên trang hiện tại</div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">Chờ duyệt cũ</div>
                    <div className="metric-value">{pendingCount}</div>
                    <div className="metric-note">Dữ liệu đăng ký trước đây</div>
                </div>
            </section>

            <section className="section-card card">
                <div className="section-header">
                    <div>
                        <h2 className="section-title"><UserPlus size={19} /> Tạo tài khoản mới</h2>
                        <p className="section-copy">
                            Mỗi vai trò có hồ sơ và phạm vi sử dụng riêng. Tài khoản được xác minh và kích hoạt ngay sau khi tạo.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleCreateAccount} className="form-stack">
                    <div className="filter-grid">
                        <FormField label="Họ tên" required error={createErrors.name}>
                            <Input
                                value={createForm.name}
                                onChange={(event) => updateCreateForm("name", event.target.value)}
                                placeholder="Nguyễn Văn A"
                                disabled={creating}
                            />
                        </FormField>
                        <FormField label="Email đăng nhập" required error={createErrors.email}>
                            <Input
                                type="email"
                                icon={Mail}
                                value={createForm.email}
                                onChange={(event) => updateCreateForm("email", event.target.value)}
                                placeholder="account@sunrise.vn"
                                disabled={creating}
                            />
                        </FormField>
                        <FormField label="Số điện thoại" error={createErrors.phone}>
                            <Input
                                inputMode="numeric"
                                maxLength={10}
                                value={createForm.phone}
                                onChange={(event) => updateCreateForm("phone", event.target.value.replace(/\D/g, ""))}
                                placeholder="0901234567"
                                disabled={creating}
                            />
                        </FormField>
                        <FormField label="Mật khẩu" required error={createErrors.password}>
                            <Input
                                type="password"
                                icon={KeyRound}
                                value={createForm.password}
                                onChange={(event) => updateCreateForm("password", event.target.value)}
                                placeholder="Tối thiểu 6 ký tự"
                                disabled={creating}
                            />
                        </FormField>
                        <FormField label="Vai trò" required>
                            <Select
                                value={createForm.role}
                                onChange={(event) => updateCreateForm("role", event.target.value)}
                                options={roleOptions}
                                placeholder={null}
                                disabled={creating}
                            />
                        </FormField>
                        {accountNeedsBuilding && (
                            <FormField label="Tòa nhà" required error={createErrors.buildingId}>
                                <Select
                                    value={createForm.buildingId}
                                    onChange={(event) => updateCreateForm("buildingId", event.target.value)}
                                    options={buildingOptions}
                                    placeholder="Chọn tòa nhà"
                                    disabled={creating || buildingsLoading}
                                />
                            </FormField>
                        )}
                    </div>

                    <div className={`role-account-summary role-account-summary--${createForm.role.toLowerCase()}`}>
                        <ShieldCheck size={22} />
                        <div>
                            <strong>{roleCreationMeta[createForm.role].title}</strong>
                            <span>{roleCreationMeta[createForm.role].description}</span>
                        </div>
                        <span className="role-account-requirement">
                            {roleCreationMeta[createForm.role].requirement}
                        </span>
                    </div>

                    {createForm.role === "STAFF" && (
                        <FormField label="Ảnh chân dung hồ sơ Staff" required error={createErrors.portraitImageUrl}>
                            <label className="staff-portrait-upload">
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handlePortrait}
                                    disabled={creating || processingImage}
                                />
                                {createForm.portraitImageUrl ? (
                                    <img src={createForm.portraitImageUrl} alt="Ảnh chân dung Staff" />
                                ) : (
                                    <span>
                                        <Camera size={28} />
                                        <strong>{processingImage ? "Đang chuẩn bị ảnh..." : "Chọn ảnh chân dung"}</strong>
                                        <small>Ảnh này thuộc hồ sơ Staff, tách biệt ảnh đại diện cá nhân</small>
                                    </span>
                                )}
                            </label>
                        </FormField>
                    )}

                    <Button
                        type="submit"
                        icon={Plus}
                        loading={creating}
                        disabled={creating || processingImage}
                    >
                        Tạo và kích hoạt tài khoản
                    </Button>
                </form>
            </section>

            <section className="section-card card">
                <div className="section-header">
                    <div>
                        <h2 className="section-title"><Search size={19} /> Bộ lọc tài khoản</h2>
                        <p className="section-copy">Tìm theo tên, email, số điện thoại, trạng thái hoặc vai trò.</p>
                    </div>
                    <Button
                        variant="outline"
                        icon={RefreshCcw}
                        loading={loading}
                        onClick={() => dispatch(fetchAdminUsersRequest(getRefreshParams()))}
                    >
                        Làm mới
                    </Button>
                </div>

                <div className="filter-grid">
                    <FormField label="Tìm kiếm">
                        <Input
                            icon={Search}
                            placeholder="Tên, email hoặc số điện thoại"
                            value={filters.q}
                            onChange={(event) => updateFilter("q", event.target.value)}
                        />
                    </FormField>
                    <FormField label="Trạng thái">
                        <Select
                            value={filters.status}
                            onChange={(event) => updateFilter("status", event.target.value)}
                            options={statusOptions}
                            placeholder={null}
                        />
                    </FormField>
                    <FormField label="Vai trò">
                        <Select
                            value={filters.role}
                            onChange={(event) => updateFilter("role", event.target.value)}
                            options={[{ value: "", label: "Tất cả vai trò" }, ...roleOptions]}
                            placeholder={null}
                        />
                    </FormField>
                </div>
            </section>

            <section className="section-card card">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Danh sách tài khoản</h2>
                        <p className="section-copy">
                            Vai trò chỉ để xem và không thể chỉnh sửa. Admin chỉ có thể khóa hoặc mở khóa tài khoản đang hoạt động.
                        </p>
                    </div>
                </div>
                <Table
                    columns={columns}
                    data={users}
                    loading={loading}
                    className="admin-user-table"
                    emptyMessage="Không có tài khoản phù hợp."
                    pagination={pagination ? {
                        currentPage: Number(pagination.page || filters.page || 1),
                        totalPages: Number(pagination.totalPages || 1),
                        totalItems: Number(pagination.total || users.length),
                        /**
                         * Xử lý nghiệp vụ `onPageChange` (on page change). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
                         *
                         * @function onPageChange
                         * @param {*} page - Giá trị `page` được hàm sử dụng trong quá trình xử lý.
                         * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
                         */
                        onPageChange: (page) => setFilters((current) => ({
                            ...current,
                            page: Math.max(1, page),
                        })),
                    } : null}
                />
            </section>
        </div>
    );
};

export default AdminUserApprovalPage;
