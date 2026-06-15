import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    CheckCircle2,
    RefreshCcw,
    Search,
    ShieldCheck,
    UserCheck,
    UserX,
} from "lucide-react";

import Button from "../../../components/Button/Button";
import FormField from "../../../components/Form/FormField";
import Input from "../../../components/Form/Input";
import {
    clearAdminUserNotice,
    fetchAdminUsersRequest,
    updateAdminUserStatusRequest,
} from "../adminUsers/adminUserSlice";

const statusOptions = [
    { label: "Chờ duyệt", value: "PENDING" },
    { label: "Đang hoạt động", value: "ACTIVE" },
    { label: "Đã khóa", value: "LOCKED" },
    { label: "Không hoạt động", value: "INACTIVE" },
    { label: "Tất cả", value: "" },
];

const roleOptions = [
    { label: "User / Cư dân", value: "USER" },
    { label: "Staff / Nhân viên bãi xe", value: "STAFF" },
    { label: "Manager / Quản lý bãi xe", value: "MANAGER" },
    { label: "Admin", value: "ADMIN" },
];

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
    INACTIVE: "muted",
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
        status: "PENDING",
        role: "",
        page: 1,
        limit: 20,
    });

    const [roleDrafts, setRoleDrafts] = useState({});

    const pendingCount = useMemo(() => {
        return users.filter((user) => user.status === "PENDING").length;
    }, [users]);

    const activeCount = useMemo(() => {
        return users.filter((user) => user.status === "ACTIVE").length;
    }, [users]);

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
        fetchUsers();
    }, [dispatch, filters.status, filters.role, filters.page]);

    useEffect(() => {
        const drafts = {};

        users.forEach((user) => {
            drafts[user.id] = user.role || "USER";
        });

        setRoleDrafts(drafts);
    }, [users]);

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
        fetchUsers({
            ...filters,
            page: 1,
        });
    };

    const handleRefresh = () => {
        dispatch(clearAdminUserNotice());
        fetchUsers();
    };

    const handleRoleDraftChange = (userId, role) => {
        setRoleDrafts((prev) => ({
            ...prev,
            [userId]: role,
        }));
    };

    const approveUser = (user) => {
        dispatch(
            updateAdminUserStatusRequest({
                id: user.id,
                role: roleDrafts[user.id] || user.role || "USER",
                status: "ACTIVE",
            })
        );
    };

    const rejectUser = (user) => {
        dispatch(
            updateAdminUserStatusRequest({
                id: user.id,
                role: roleDrafts[user.id] || user.role || "USER",
                status: "INACTIVE",
            })
        );
    };

    const lockUser = (user) => {
        dispatch(
            updateAdminUserStatusRequest({
                id: user.id,
                role: roleDrafts[user.id] || user.role || "USER",
                status: "LOCKED",
            })
        );
    };

    return (
        <div className="parking-page">
            <section className="page-hero">
                <div>
                    <div className="page-eyebrow">
                        <ShieldCheck size={16} /> Admin approval
                    </div>

                    <h1 className="page-title">Duyệt tài khoản đăng ký</h1>

                    <p className="page-subtitle">
                        User mới đăng ký sẽ ở trạng thái PENDING. Admin duyệt sang ACTIVE
                        thì tài khoản mới đăng nhập và dùng API được.
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
                    <div className="metric-value">{users.length}</div>
                    <div className="metric-note">Tài khoản theo bộ lọc hiện tại</div>
                </div>

                <div className="metric-card">
                    <div className="metric-label">Chờ duyệt</div>
                    <div className="metric-value">{pendingCount}</div>
                    <div className="metric-note">Status PENDING</div>
                </div>

                <div className="metric-card">
                    <div className="metric-label">Đã active</div>
                    <div className="metric-value">{activeCount}</div>
                    <div className="metric-note">Có thể đăng nhập hệ thống</div>
                </div>
            </section>

            <section className="section-card card">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Bộ lọc tài khoản</h2>
                        <p className="section-copy">
                            Lọc nhanh tài khoản chờ duyệt, đã duyệt, đã khóa hoặc theo role.
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

                    <FormField label="Role">
                        <select
                            className="form-input"
                            value={filters.role}
                            onChange={(event) => updateFilter("role", event.target.value)}
                        >
                            <option value="">Tất cả role</option>
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

            {(error || updateError || updateSuccess) && (
                <section className="section-card card">
                    {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
                    {updateError && (
                        <p style={{ color: "var(--danger)" }}>{updateError}</p>
                    )}
                    {updateSuccess && (
                        <p style={{ color: "var(--success)" }}>{updateSuccess}</p>
                    )}
                </section>
            )}

            <section className="section-card card">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Danh sách tài khoản</h2>
                        <p className="section-copy">
                            Chọn role rồi bấm duyệt để chuyển user sang ACTIVE.
                        </p>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Người dùng</th>
                                <th>Liên hệ</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Ngày tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan="7">Đang tải danh sách tài khoản...</td>
                                </tr>
                            )}

                            {!loading && users.length === 0 && (
                                <tr>
                                    <td colSpan="7">Không có tài khoản phù hợp.</td>
                                </tr>
                            )}

                            {!loading &&
                                users.map((user) => (
                                    <tr key={user.id}>
                                        <td>#{user.id}</td>

                                        <td>
                                            <strong>{user.name}</strong>
                                            <br />
                                            <span className="metric-note">
                                                {user.buildingName || "Chưa gán tòa nhà"}
                                            </span>
                                        </td>

                                        <td>
                                            <span>{user.email}</span>
                                            <br />
                                            <span className="metric-note">
                                                {user.phone || "Chưa có SĐT"}
                                            </span>
                                        </td>

                                        <td>
                                            <select
                                                className="form-input"
                                                value={roleDrafts[user.id] || user.role || "USER"}
                                                onChange={(event) =>
                                                    handleRoleDraftChange(user.id, event.target.value)
                                                }
                                                disabled={updatingId === user.id}
                                            >
                                                {roleOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        <td>
                                            <span
                                                className={`status-pill ${statusTone[user.status] || "muted"
                                                    }`}
                                            >
                                                {statusLabels[user.status] || user.status}
                                            </span>
                                        </td>

                                        <td>
                                            {user.createdAt
                                                ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                                                : "-"}
                                        </td>

                                        <td>
                                            <div className="action-row">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    icon={UserCheck}
                                                    loading={updatingId === user.id}
                                                    disabled={updatingId === user.id}
                                                    onClick={() => approveUser(user)}
                                                >
                                                    Duyệt
                                                </Button>

                                                {user.status !== "INACTIVE" && (
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

                                                {user.status === "ACTIVE" && (
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
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {pagination && (
                    <div className="section-copy" style={{ marginTop: 14 }}>
                        Trang {pagination.page}/{pagination.totalPages || 1} — Tổng{" "}
                        {pagination.total} tài khoản
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminUserApprovalPage;