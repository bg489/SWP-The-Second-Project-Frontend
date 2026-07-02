import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCcw, Search, ShieldCheck, UserCheck, UserX } from "lucide-react";

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
    { label: "Chờ duyệt", value: "PENDING" },
    { label: "Đang hoạt động", value: "ACTIVE" },
    { label: "Đã khóa", value: "LOCKED" },
    { label: "Không hoạt động", value: "INACTIVE" },
    { label: "Tất cả", value: "" },
];

const roleOptions = [
    { label: "Cư dân", value: "USER" },
    { label: "Nhân viên bãi xe", value: "STAFF" },
    { label: "Quản lý bãi xe", value: "MANAGER" },
    { label: "Quản trị viên", value: "ADMIN" },
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
        status: "PENDING",
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
            render: (user) => (
                <select
                    className="form-input"
                    value={roleDrafts[user.id] || user.role || "USER"}
                    onChange={(event) => handleRoleDraftChange(user.id, event.target.value)}
                    disabled={updatingId === user.id || user.status === "ACTIVE"}
                >
                    {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
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
            render: (user) => (
                <div className="action-row">
                    <Button
                        type="button"
                        size="sm"
                        icon={UserCheck}
                        loading={updatingId === user.id}
                        disabled={updatingId === user.id || user.status === "ACTIVE"}
                        onClick={() => approveUser(user)}
                    >
                        Duyệt
                    </Button>

                    {user.status !== "INACTIVE" && user.status !== "ACTIVE" && (
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
            ),
        },
    ];

    return (
        <div className="parking-page">
            <section className="page-hero">
                <div>
                    <div className="page-eyebrow">
                        <ShieldCheck size={16} /> Duyệt tài khoản
                    </div>
                    <h1 className="page-title">Duyệt tài khoản đăng ký</h1>
                    <p className="page-subtitle">
                        Tài khoản mới cần được quản trị viên duyệt trước khi đăng nhập và sử dụng hệ thống.
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
                    <div className="metric-note">Cần quản trị viên kiểm tra</div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">Đã duyệt</div>
                    <div className="metric-value">{activeCount}</div>
                    <div className="metric-note">Có thể đăng nhập hệ thống</div>
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
                            Chọn quyền phù hợp rồi bấm duyệt để tài khoản được sử dụng hệ thống.
                        </p>
                    </div>
                </div>

                <Table
                    columns={columns}
                    data={users}
                    loading={loading}
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
