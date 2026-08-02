import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Camera,
    KeyRound,
    Mail,
    Plus,
    RefreshCcw,
    Save,
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
    updateAdminUserStatusRequest,
} from "../adminUsers/adminUserSlice";
import { fetchBuildingsRequest } from "../buildings/buildingSlice";

const statusOptions = [
    { label: "Tất cả", value: "" },
    { label: "Chờ duyệt", value: "PENDING" },
    { label: "Đang hoạt động", value: "ACTIVE" },
    { label: "Đã khóa", value: "LOCKED" },
    { label: "Không hoạt động", value: "INACTIVE" },
];

const roleOptions = [
    { label: "Cư dân", value: "USER" },
    { label: "Nhân viên bãi xe", value: "STAFF" },
    { label: "Quản lý bãi xe", value: "MANAGER" },
    { label: "Quản trị viên", value: "ADMIN" },
];

const emptyCreateForm = {
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "USER",
    buildingId: "",
    portraitImageUrl: "",
};

const getDirectRoleOptions = (user) => {
    const currentRole = user.role || "USER";
    if (currentRole === "STAFF") {
        return roleOptions.filter((option) => option.value === "STAFF");
    }
    if (["USER", "MANAGER"].includes(currentRole)) {
        return roleOptions.filter((option) => ["USER", "MANAGER", "ADMIN"].includes(option.value));
    }
    return roleOptions.filter((option) => ["MANAGER", "ADMIN"].includes(option.value));
};

const getRoleCaption = (role) => {
    if (role === "STAFF") return "Staff là tài khoản riêng, không chuyển đổi sang User";
    return "Không thể chuyển tài khoản này thành Staff";
};

const statusLabels = {
    PENDING: "Chờ duyệt",
    ACTIVE: "Đang hoạt động",
    LOCKED: "Đã khóa",
    INACTIVE: "Không hoạt động",
};

const statusTone = {
    PENDING: "warning",
    ACTIVE: "success",
    LOCKED: "danger",
    INACTIVE: "neutral",
};

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
    } = useSelector((state) => state.adminUsers);
    const { buildings, loading: buildingsLoading, error: buildingsError } = useSelector(
        (state) => state.buildings
    );
    const [filters, setFilters] = useState({
        q: "",
        status: "",
        role: "",
        page: 1,
        limit: 10,
    });
    const [roleDrafts, setRoleDrafts] = useState({});
    const [createForm, setCreateForm] = useState(emptyCreateForm);
    const [createErrors, setCreateErrors] = useState({});
    const [processingImage, setProcessingImage] = useState(false);

    const pendingCount = useMemo(
        () => users.filter((user) => user.status === "PENDING").length,
        [users]
    );
    const activeCount = useMemo(
        () => users.filter((user) => user.status === "ACTIVE").length,
        [users]
    );
    const buildingOptions = useMemo(
        () => buildings.map((building) => ({
            value: String(building.id),
            label: `${building.name}${building.address ? ` - ${building.address}` : ""}`,
        })),
        [buildings]
    );
    const accountNeedsBuilding = ["USER", "STAFF"].includes(createForm.role);

    const getRefreshParams = () => ({
        q: filters.q || undefined,
        status: filters.status || undefined,
        role: filters.role || undefined,
        page: filters.page,
        limit: filters.limit,
    });

    useEffect(() => {
        dispatch(fetchBuildingsRequest());
    }, [dispatch]);

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
        onSuccess: () => {
            setCreateForm(emptyCreateForm);
            setCreateErrors({});
        },
    });

    const updateFilter = (field, value) => {
        dispatch(clearAdminUserNotice());
        setFilters((current) => ({ ...current, [field]: value, page: 1 }));
    };

    const updateCreateForm = (field, value) => {
        dispatch(clearAdminUserNotice());
        setCreateForm((current) => {
            const next = { ...current, [field]: value };
            if (field === "role" && value !== "STAFF") next.portraitImageUrl = "";
            if (field === "role" && !["USER", "STAFF"].includes(value)) next.buildingId = "";
            return next;
        });
        setCreateErrors((current) => ({ ...current, [field]: "" }));
    };

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
            setCreateForm((current) => ({ ...current, portraitImageUrl: "" }));
            setCreateErrors((current) => ({
                ...current,
                portraitImageUrl: imageError.message || "Không chuẩn bị được ảnh chân dung.",
            }));
        } finally {
            setProcessingImage(false);
        }
    };

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

    const handleRoleDraftChange = (userId, role) => {
        setRoleDrafts((current) => ({ ...current, [userId]: role }));
    };

    const updateAccount = (user, status) => {
        dispatch(updateAdminUserStatusRequest({
            id: user.id,
            role: roleDrafts[user.id] || user.role || "USER",
            status,
            refreshParams: getRefreshParams(),
        }));
    };

    const columns = [
        { header: "Mã", key: "id", render: (user) => `#${user.id}` },
        {
            header: "Người dùng",
            key: "name",
            minWidth: "180px",
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
            render: (user) => (
                <div className="admin-role-control">
                    <select
                        className="form-input admin-role-select"
                        value={roleDrafts[user.id] || user.role || "USER"}
                        onChange={(event) => handleRoleDraftChange(user.id, event.target.value)}
                        disabled={updatingId === user.id}
                        aria-label={`Vai trò của ${user.name}`}
                    >
                        {getDirectRoleOptions(user).map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <span className="admin-role-caption">{getRoleCaption(user.role)}</span>
                </div>
            ),
        },
        {
            header: "Trạng thái",
            key: "status",
            render: (user) => (
                <span className={`pill ${statusTone[user.status] || "neutral"}`}>
                    {statusLabels[user.status] || user.status}
                </span>
            ),
        },
        {
            header: "Ngày tạo",
            key: "createdAt",
            render: (user) => user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                : "-",
        },
        {
            header: "Thao tác",
            key: "actions",
            minWidth: "230px",
            render: (user) => {
                const isPending = user.status === "PENDING";
                const isInactive = user.status === "INACTIVE";
                const isLocked = user.status === "LOCKED";
                const isActive = user.status === "ACTIVE";
                const roleChanged = (roleDrafts[user.id] || user.role || "USER") !== user.role;

                return (
                    <div className="action-row admin-account-actions">
                        {(isPending || isInactive || isLocked) && (
                            <Button
                                size="sm"
                                icon={UserCheck}
                                loading={updatingId === user.id}
                                disabled={updatingId === user.id}
                                onClick={() => updateAccount(user, "ACTIVE")}
                            >
                                {isPending ? "Duyệt" : isInactive ? "Kích hoạt" : "Mở khóa"}
                            </Button>
                        )}
                        {isActive && (
                            <Button
                                size="sm"
                                icon={Save}
                                loading={updatingId === user.id}
                                disabled={updatingId === user.id || !roleChanged}
                                onClick={() => updateAccount(user, user.status)}
                            >
                                Lưu vai trò
                            </Button>
                        )}
                        {isPending && (
                            <Button
                                size="sm"
                                variant="outline"
                                icon={UserX}
                                disabled={updatingId === user.id}
                                onClick={() => updateAccount(user, "INACTIVE")}
                            >
                                Từ chối
                            </Button>
                        )}
                        {isActive && (
                            <Button
                                size="sm"
                                variant="danger"
                                icon={UserX}
                                disabled={updatingId === user.id}
                                onClick={() => updateAccount(user, "LOCKED")}
                            >
                                Khóa
                            </Button>
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
                        Admin có thể tạo trực tiếp tài khoản User, Staff, Manager hoặc Admin và kích hoạt ngay. Staff luôn là tài khoản riêng, không được tạo bằng cách đổi quyền từ User.
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
                            Tài khoản được xác minh và kích hoạt ngay. User và Staff cần chọn tòa nhà; Staff cần thêm ảnh chân dung nghề nghiệp.
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
                            Có thể khóa, mở khóa và đổi vai trò giữa các tài khoản không phải Staff. Staff chỉ giữ vai trò Staff.
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
