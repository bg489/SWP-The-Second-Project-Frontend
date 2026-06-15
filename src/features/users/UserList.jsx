import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsersRequest, addUser, editUser, deleteUser } from "./userSlice";
import Button from "../../components/Button/Button";
import Table from "../../components/Table/Table";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import { UserPlus, Pencil, Trash2, Search, X, Check } from "lucide-react";

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
      // Edit User Action
      dispatch(editUser({ id: currentUserId, name: userName, email: userEmail }));
      setIsEditing(false);
      setCurrentUserId(null);
    } else {
      // Create User Action
      const newUser = {
        id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
        name: userName,
        email: userEmail,
        created_at: new Date().toISOString().split("T")[0],
      };
      dispatch(addUser(newUser));
    }

    // Reset Form
    setUserName("");
    setUserEmail("");
    setFormError({});
    setShowForm(false);
  };

  const handleEditClick = (user) => {
    setIsEditing(true);
    setCurrentUserId(user.id);
    setUserName(user.name);
    setUserEmail(user.email);
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
    { header: "ID", key: "id", width: "80px" },
    { header: "Họ và tên", key: "name" },
    { header: "Địa chỉ Email", key: "email" },
    { header: "Ngày đăng ký", key: "created_at" },
    {
      header: "Hành động",
      key: "actions",
      width: "160px",
      render: (row) => (
        <div style={{ display: "flex", gap: "6px" }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditClick(row)}
            icon={Pencil}
            title="Sửa thông tin"
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
                {isEditing ? `Chỉnh sửa thông tin User (ID: ${currentUserId})` : "Tạo người dùng mới"}
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
                />
              </FormField>

              <FormField label="Địa chỉ Email" error={formError.email} required>
                <Input
                  placeholder="Nhập email..."
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </FormField>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  style={{
                    backgroundColor: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid #d1d5db", // Light grey border
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
                    backgroundColor: "#2563eb", // Solid distinct blue
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