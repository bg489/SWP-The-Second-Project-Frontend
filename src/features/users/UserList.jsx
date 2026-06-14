import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsersRequest,
  addUser,
  deleteUser,
  updateUserRoleStatusRequest,
  lockUserRequest,
  unlockUserRequest
} from "./userSlice";
import Button from "../../components/Button/Button";
import Table from "../../components/Table/Table";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Select from "../../components/Form/Select";
import { UserPlus, Pencil, Trash2, Search, X, Check, Lock, Unlock } from "lucide-react";

function UserList() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // CRUD Form states
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("USER");
  const [userStatus, setUserStatus] = useState("ACTIVE");
  const [formError, setFormError] = useState({});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Only dispatch request if store is empty to prevent resetting modified local store
    if (users.length === 0) {
      dispatch(fetchUsersRequest());
    }
  }, [dispatch, users.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!userName.trim()) errors.name = "Họ tên không được để trống";
    if (!userEmail.trim()) {
      errors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(userEmail)) {
      errors.email = "Email không đúng định dạng";
    }

    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }

    if (isEditing) {
      // Edit User Role & Status Action
      dispatch(updateUserRoleStatusRequest({ id: currentUserId, role: userRole, status: userStatus }));
      setIsEditing(false);
      setCurrentUserId(null);
    } else {
      // Create User Action
      const newUser = {
        id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
        name: userName,
        email: userEmail,
        role: "USER",
        status: "ACTIVE",
        created_at: new Date().toISOString().split("T")[0],
      };
      dispatch(addUser(newUser));
    }

    // Reset Form
    setUserName("");
    setUserEmail("");
    setUserRole("USER");
    setUserStatus("ACTIVE");
    setFormError({});
    setShowForm(false);
  };

  const handleEditClick = (user) => {
    setIsEditing(true);
    setCurrentUserId(user.id);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserRole(user.role || "USER");
    setUserStatus(user.status || "ACTIVE");
    setFormError({});
    setShowForm(true);
  };

  const handleDeleteClick = (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      dispatch(deleteUser(userId));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentUserId(null);
    setUserName("");
    setUserEmail("");
    setUserRole("USER");
    setUserStatus("ACTIVE");
    setFormError({});
    setShowForm(false);
  };

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: "ID", key: "id", width: "70px" },
    { header: "Họ và tên", key: "name" },
    { header: "Địa chỉ Email", key: "email" },
    {
      header: "Vai trò",
      key: "role",
      render: (row) => {
        let badgeColor = "var(--text-secondary)";
        if (row.role === "ADMIN") badgeColor = "var(--danger)";
        if (row.role === "MANAGER") badgeColor = "var(--success)";
        if (row.role === "STAFF") badgeColor = "var(--warning)";

        return (
          <span style={{
            fontSize: "11px",
            fontWeight: "700",
            padding: "3px 8px",
            borderRadius: "4px",
            backgroundColor: `${badgeColor}15`,
            color: badgeColor,
            border: `1px solid ${badgeColor}30`
          }}>{row.role || "USER"}</span>
        );
      }
    },
    {
      header: "Trạng thái",
      key: "status",
      render: (row) => {
        let statusText = row.status || "ACTIVE";
        let badgeColor = "var(--success)";
        if (statusText === "LOCKED") badgeColor = "var(--danger)";
        if (statusText === "INACTIVE") badgeColor = "var(--text-muted)";

        return (
          <span style={{
            fontSize: "11px",
            fontWeight: "700",
            padding: "3px 8px",
            borderRadius: "4px",
            backgroundColor: `${badgeColor}15`,
            color: badgeColor,
            border: `1px solid ${badgeColor}30`
          }}>{statusText}</span>
        );
      }
    },
    {
      header: "Hành động",
      key: "actions",
      width: "190px",
      render: (row) => (
        <div style={{ display: "flex", gap: "6px" }}>
          {/* Lock / Unlock Toggle Button */}
          {row.status === "LOCKED" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(unlockUserRequest(row.id))}
              icon={Unlock}
              title="Mở khóa tài khoản"
              style={{ color: "var(--success)", borderColor: "var(--success)" }}
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(lockUserRequest(row.id))}
              icon={Lock}
              title="Khóa tài khoản"
              style={{ color: "var(--warning)", borderColor: "var(--warning)" }}
            />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditClick(row)}
            icon={Pencil}
            title="Sửa vai trò & trạng thái"
          />
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(row.id)}
            icon={Trash2}
            title="Xóa user"
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Search and Action Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ position: "relative", width: "300px" }}>
          <Input
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)} icon={UserPlus}>
            Thêm User mới
          </Button>
        )}
      </div>

      {/* CRUD Form Modal Popup */}
      {showForm && createPortal(
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }} onClick={handleCancel}>
          <div className="card animate-fade-in" style={{
            maxWidth: "500px",
            width: "100%",
            padding: "28px",
            borderRadius: "8px", // Clean, rounded corners 8px radius
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.05)", // Soft drop shadow
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800" }}>
                {isEditing ? `Cấu hình phân quyền User (ID: ${currentUserId})` : "Tạo người dùng mới"}
              </h3>
              <button onClick={handleCancel} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <FormField label="Họ tên người dùng" error={formError.name} required>
                <Input
                  placeholder="Nhập họ tên đầy đủ..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  disabled={isEditing}
                />
              </FormField>

              <FormField label="Địa chỉ Email" error={formError.email} required>
                <Input
                  placeholder="Nhập email..."
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  disabled={isEditing}
                />
              </FormField>

              {isEditing && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <FormField label="Vai trò hệ thống" required>
                    <Select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                      options={[
                        { value: "USER", label: "USER" },
                        { value: "STAFF", label: "STAFF" },
                        { value: "MANAGER", label: "MANAGER" },
                        { value: "ADMIN", label: "ADMIN" }
                      ]}
                      placeholder={null}
                    />
                  </FormField>

                  <FormField label="Trạng thái tài khoản" required>
                    <Select
                      value={userStatus}
                      onChange={(e) => setUserStatus(e.target.value)}
                      options={[
                        { value: "ACTIVE", label: "ACTIVE" },
                        { value: "LOCKED", label: "LOCKED" },
                        { value: "INACTIVE", label: "INACTIVE" }
                      ]}
                      placeholder={null}
                    />
                  </FormField>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  style={{
                    backgroundColor: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    padding: "10px 18px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  icon={X}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                    e.currentTarget.style.borderColor = "#9ca3af";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "#d1d5db";
                  }}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  style={{
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "10px 18px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
                  }}
                  icon={Check}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#1d4ed8";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.3)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563eb";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(37, 99, 235, 0.2)";
                  }}
                >
                  {isEditing ? "Lưu thay đổi" : "Lưu mới"}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Users List Card */}
      <div className="card" style={{ padding: "24px" }}>
        <div className="card-header" style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700" }}>Quản lý Tài khoản</h2>
          <Button variant="outline" size="sm" onClick={() => dispatch(fetchUsersRequest())} loading={loading}>
            Tải lại dữ liệu
          </Button>
        </div>

        {error && <p className="error" style={{ marginBottom: "16px" }}>Lỗi hệ thống: {error}</p>}

        <Table
          columns={columns}
          data={filteredUsers}
          loading={loading}
          emptyMessage="Không tìm thấy người dùng nào phù hợp"
        />
      </div>
    </div>
  );
}

export default UserList;