import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCcw, Save, Search, ShieldCheck, UserCheck, UserX } from "lucide-react";

import Button from "../../../components/Button/Button";
import StatusBanner from "../../../components/Feedback/StatusBanner";
import FormField from "../../../components/Form/FormField";
import Input from "../../../components/Form/Input";
import Table from "../../../components/Table/Table";
import {
    clearAdminUserNotice,
    fetchAdminUsersRequest,
    updateAdminUserStatusRequest,
} from "../adminUsers/adminUserSlice";

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
    if (role === "STAFF") {
        return "Quyền Staff chỉ thay đổi qua hồ sơ do Manager gửi";
    }

    if (["USER", "MANAGER"].includes(role)) {
        return "Admin có thể chuyển trực tiếp giữa User và Manager";
    }

    return "Tài khoản Admin có thể chuyển sang Manager";
};

const statusLabels = {
    PENDING: "Chờ duyệt",
    ACTIVE: "Đã duyệt",
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
        updatingId,
        updateError,
        updateSuccess,
    } = useSelector((state) => state.adminUsers);

    const [filters, setFilters] = useState({
        q: "",
        status: "",
        role: "",
        page: 1,
        limit: 10,
    });
    const [roleDrafts, setRoleDrafts] = useState({});

    const pendingCount = useMemo(
        () => users.filter((user) => user.status === "PENDING").length,
        [users]
    );
    const activeCount = useMemo(
        () => users.filter((user) => user.status === "ACTIVE").length,
        [users]
    );

    const fetchUsers = (nextFilters = filters) => {
        dispatch(
            fetchAdminUsersRequest({
                q: nextFilters.q || undefined,
                status: nextFilters.status || undefined,
                role: nextFilters.role || undefined,
                page: nextFilters.page,
                limit: nextFilters.limit,
            })
        );
    };

    useEffect(() => {
        dispatch(
            fetchAdminUsersRequest({
                q: filters.q || undefined,
                status: filters.status || undefined,
                role: filters.role || undefined,
                page: filters.page,
                limit: filters.limit,
            })
        );
    }, [dispatch, filters.q, filters.status, filters.role, filters.page, filters.limit]);

    const updateFilter = (field, value) => {
        dispatch(clearAdminUserNotice());
        setFilters((prev) => ({
            ...prev,
            [field]: value,
            page: 1,
        }));
    };

    const handleSearch = (event) => {
        event.preventDefault();
        dispatch(clearAdminUserNotice());
        setFilters((prev) => ({ ...prev, page: 1 }));
    };

    const handleRefresh = () => {
        dispatch(clearAdminUserNotice());
        fetchUsers();
    };

    const handlePageChange = (page) => {
        setFilters((prev) => ({
            ...prev,
            page: Math.max(1, page),
        }));
    };

    const handleRoleDraftChange = (userId, role) => {
        setRoleDrafts((prev) => ({
            ...prev,
            [userId]: role,
        }));
    };

    const getRefreshParams = () => ({
        q: filters.q || undefined,
        status: filters.status || undefined,
        role: filters.role || undefined,
        page: filters.page,
        limit: filters.limit,
    });

    const approveUser = (user) => {
        dispatch(
            updateAdminUserStatusRequest({
                id: user.id,
                role: roleDrafts[user.id] || user.role || "USER",
                status: "ACTIVE",
                refreshParams: getRefreshParams(),
            })
        );
    };

    const rejectUser = (user) => {
        dispatch(
            updateAdminUserStatusRequest({
                id: user.id,
                role: roleDrafts[user.id] || user.role || "USER",
                status: "INACTIVE",
                refreshParams: getRefreshParams(),
            })
        );
    };

    const lockUser = (user) => {
        dispatch(
            updateAdminUserStatusRequest({
                id: user.id,
                role: roleDrafts[user.id] || user.role || "USER",
                status: "LOCKED",
                refreshParams: getRefreshParams(),
            })
        );
    };

    const saveRole = (user) => {
        dispatch(
            updateAdminUserStatusRequest({
                id: user.id,
                role: roleDrafts[user.id] || user.role || "USER",
                status: user.status,
                refreshParams: getRefreshParams(),
            })
        );
    };

    const columns = [
        { header: "Mã", key: "id", render: (user) => `#${user.id}` },
        {
            header: "Người dùng",
            key: "name",
            render: (user) => (
                <>
                    <strong>{user.name}</strong>
                    <br />
                    <span className="metric-note">{user.buildingName || "Chưa gán tòa nhà"}</span>
                </>
            ),
        },
        {
            header: "Liên hệ",
            key: "email",
            render: (user) => (
                <>
                    <span>{user.email}</span>
                    <br />
                    <span className="metric-note">{user.phone || "Chưa có SĐT"}</span>
                </>
            ),
        },
        {
            header: "Thông tin duyệt",
            key: "approvalInfo",
            render: (user) => (
                <>
                    <strong>{user.buildingName || "Chưa gán tòa nhà"}</strong>
                    <br />
                    <span className="metric-note">
                        {Number(user.vehicleCount || 0)} xe đã đăng ký
                    </span>
                    <br />
                    <span className="metric-note">
                        {user.vehicleSummary || "Chưa có hồ sơ xe"}
                    </span>
                </>
            ),
        },
        {
            header: "Quyền sử dụng",
            key: "role",
            minWidth: "210px",
            render: (user) => (
                <div className="admin-role-control">
                    <select
                        className="form-input admin-role-select"
                        value={roleDrafts[user.id] || user.role || "USER"}
                        onChange={(event) => handleRoleDraftChange(user.id, event.target.value)}
                        disabled={updatingId === user.id}
                        aria-label={`Quyền sử dụng của ${user.name}`}
                    >
                        {getDirectRoleOptions(user).map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
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
            render: (user) => (user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "-"),
        },
        {
            header: "Thao tác",
            key: "actions",
            minWidth: "240px",
            render: (user) => {
                const isPending = user.status === "PENDING";
                const isInactive = user.status === "INACTIVE";
                const isLocked = user.status === "LOCKED";
                const isActive = user.status === "ACTIVE";

                return (
                    <div className="action-row admin-account-actions">
                        {(isPending || isInactive || isLocked) && (
                            <Button
                                type="button"
                                size="sm"
                                icon={UserCheck}
                                loading={updatingId === user.id}
                                disabled={updatingId === user.id}
                                onClick={() => approveUser(user)}
                            >
                                {isPending ? "Duyệt" : isInactive ? "Duyệt lại" : "Mở khóa"}
                            </Button>
                        )}

                        {isActive && (
                            <Button
                                type="button"
                                size="sm"
                                icon={Save}
                                loading={updatingId === user.id}
                                disabled={
                                    updatingId === user.id ||
                                    (roleDrafts[user.id] || user.role || "USER") === user.role
                                }
                                onClick={() => saveRole(user)}
                            >
                                Lưu quyền
                            </Button>
                        )}

                        {isPending && (
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                icon={UserX}
                                disabled={updatingId === user.id}
                                onClick={() => rejectUser(user)}
                            >
                                Từ chối
                            </Button>
                        )}

                        {isActive && (
                            <Button
                                type="button"
                                size="sm"
                                variant="danger"
                                icon={UserX}
                                disabled={updatingId === user.id}
                                onClick={() => lockUser(user)}
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
                <div>
                    <div className="page-eyebrow">
                        <ShieldCheck size={16} /> Duyệt tài khoản
                    </div>
                    <h1 className="page-title">Duyệt và quản lý tài khoản</h1>
                    <p className="page-subtitle">
                        Duyệt tài khoản, mở khóa và chuyển trực tiếp giữa cư dân với quản lý. Mọi thay đổi có liên quan tới nhân viên bãi xe phải đi qua hồ sơ của Manager.
                    </p>
                </div>

                <div className="action-row">
                    <Button
                        type="button"
                        variant="outline"
                        icon={RefreshCcw}
                        loading={loading}
                        disabled={loading}
                        onClick={handleRefresh}
                    >
                        Tải lại
                    </Button>
                </div>
            </section>

            <section className="dashboard-grid">
                <div className="metric-card">
                    <div className="metric-label">Đang hiển thị</div>
                    <div className="metric-value">{Number(pagination?.total || users.length)}</div>
                    <div className="metric-note">Kết quả theo bộ lọc hiện tại</div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">Chờ duyệt</div>
                    <div className="metric-value">{pendingCount}</div>
                    <div className="metric-note">Trên trang hiện tại</div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">Đã duyệt</div>
                    <div className="metric-value">{activeCount}</div>
                    <div className="metric-note">Trên trang hiện tại</div>
                </div>
            </section>

            <section className="section-card card">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Bộ lọc tài khoản</h2>
                        <p className="section-copy">
                            Lọc nhanh tài khoản chờ duyệt, đã duyệt, đã khóa hoặc theo quyền sử dụng.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSearch}
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1.4fr 0.8fr 0.8fr auto",
                        gap: 12,
                        alignItems: "end",
                    }}
                >
                    <FormField label="Tìm kiếm">
                        <Input
                            icon={Search}
                            placeholder="Tên, email hoặc số điện thoại"
                            value={filters.q}
                            onChange={(event) => updateFilter("q", event.target.value)}
                        />
                    </FormField>

                    <FormField label="Trạng thái">
                        <select
                            className="form-input"
                            value={filters.status}
                            onChange={(event) => updateFilter("status", event.target.value)}
                        >
                            {statusOptions.map((option) => (
                                <option key={option.label} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </FormField>

                    <FormField label="Quyền sử dụng">
                        <select
                            className="form-input"
                            value={filters.role}
                            onChange={(event) => updateFilter("role", event.target.value)}
                        >
                            <option value="">Tất cả quyền</option>
                            {roleOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </FormField>

                    <Button type="submit" loading={loading} disabled={loading}>
                        Tìm
                    </Button>
                </form>
            </section>

            <StatusBanner success={updateSuccess} errors={[error, updateError]} />

            <section className="section-card card">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Danh sách tài khoản</h2>
                        <p className="section-copy">
                            Nút xử lý luôn nằm bên phải: duyệt tài khoản mới, duyệt lại tài khoản đã từ chối hoặc mở khóa tài khoản.
                        </p>
                    </div>
                </div>

                <Table
                    columns={columns}
                    data={users}
                    loading={loading}
                    className="admin-user-table"
                    emptyMessage="Không có tài khoản phù hợp."
                    pagination={
                        pagination
                            ? {
                                currentPage: Number(pagination.page || filters.page || 1),
                                totalPages: Number(pagination.totalPages || 1),
                                totalItems: Number(pagination.total || users.length),
                                onPageChange: handlePageChange,
                            }
                            : null
                    }
                />
            </section>
        </div>
    );
};

export default AdminUserApprovalPage;
