import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, RefreshCcw, Search, UserPlus, Users } from "lucide-react";

import Button from "../../components/Button/Button";
import StatusBanner from "../../components/Feedback/StatusBanner";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Table from "../../components/Table/Table";
import {
  assignStaffToBuildingRequest,
  clearParkingNotice,
  fetchStaffAssignmentsRequest,
} from "../backend/parking/parkingSlice";

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s.-]/g, "");

const formatDate = (value) => {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "-";
  }
};

const ManagerStaffAssignmentPage = () => {
  const dispatch = useDispatch();
  const { staffAssignments, notice } = useSelector((state) => state.parking);
  const { user } = useSelector((state) => state.auth);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    dispatch(fetchStaffAssignmentsRequest());
  }, [dispatch]);

  const building = staffAssignments.building || {
    id: user?.buildingId,
    name: user?.buildingName,
    address: user?.buildingAddress,
  };

  const filteredStaff = useMemo(() => {
    const normalizedKeyword = normalizeText(keyword);

    if (!normalizedKeyword) return staffAssignments.items || [];

    return (staffAssignments.items || []).filter((staff) =>
      [staff.name, staff.email, staff.phone, staff.buildingName]
        .some((value) => normalizeText(value).includes(normalizedKeyword))
    );
  }, [keyword, staffAssignments.items]);

  const assignedCount = filteredStaff.filter(
    (staff) => String(staff.buildingId || "") === String(building?.id || "")
  ).length;

  const refresh = () => {
    dispatch(clearParkingNotice());
    dispatch(fetchStaffAssignmentsRequest());
  };

  const columns = [
    {
      header: "Nhân viên",
      key: "name",
      render: (row) => (
        <div className="table-person">
          <strong>{row.name || "Chưa có tên"}</strong>
          <p className="section-copy">{row.email || "-"}</p>
          <p className="section-copy">{row.phone || "Chưa cập nhật số điện thoại"}</p>
        </div>
      ),
    },
    {
      header: "Tòa hiện tại",
      key: "buildingName",
      render: (row) =>
        row.buildingName ? (
          <div>
            <strong>{row.buildingName}</strong>
            <p className="section-copy">{row.buildingAddress || "Chưa có địa chỉ"}</p>
          </div>
        ) : (
          <span className="pill warning">Chưa gán tòa</span>
        ),
    },
    {
      header: "Ngày cập nhật",
      key: "updatedAt",
      render: (row) => formatDate(row.updatedAt || row.createdAt),
    },
    {
      header: "Trạng thái",
      key: "status",
      render: (row) => (
        <span className={`pill ${row.status === "ACTIVE" ? "success" : "warning"}`}>
          {row.status === "ACTIVE" ? "Đã duyệt" : "Chờ duyệt"}
        </span>
      ),
    },
    {
      header: "Thao tác",
      key: "actions",
      render: (row) => {
        const isAssigned = String(row.buildingId || "") === String(building?.id || "");

        return (
          <Button
            size="sm"
            variant={isAssigned ? "outline" : "primary"}
            icon={UserPlus}
            disabled={isAssigned || !building?.id}
            loading={staffAssignments.assigningId === row.id}
            onClick={() => dispatch(assignStaffToBuildingRequest({ id: row.id }))}
          >
            {isAssigned ? "Đã ở tòa này" : "Gán vào tòa"}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="parking-page">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="page-eyebrow"><Users size={16} /> Nhân viên</div>
          <h1 className="page-title">Phân công nhân viên theo tòa nhà</h1>
          <p className="page-subtitle">
            Người quản lý chỉ gán nhân viên vào tòa mình đang quản lý. Nhân viên đã thuộc tòa khác sẽ không xuất hiện trong danh sách này.
          </p>
        </div>
        <div className="page-hero-aside">
          <span className="page-hero-label">Đã ở tòa này</span>
          <span className="page-hero-number">{assignedCount}</span>
          <span className="page-hero-label">nhân viên</span>
        </div>
      </section>

      <StatusBanner success={notice} errors={staffAssignments.error} />

      <section className="card section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Building2 size={19} /> Tòa đang quản lý</h2>
            <p className="section-copy">
              {building?.name || "Tài khoản quản lý chưa được gán tòa nhà"}
              {building?.address ? ` - ${building.address}` : ""}
            </p>
          </div>
          <Button variant="outline" icon={RefreshCcw} loading={staffAssignments.loading} onClick={refresh}>
            Làm mới
          </Button>
        </div>

        <div className="filter-grid">
          <FormField label="Tìm nhân viên">
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Nhập tên, email hoặc số điện thoại"
              icon={Search}
            />
          </FormField>
        </div>

        <Table
          columns={columns}
          data={filteredStaff}
          loading={staffAssignments.loading}
          emptyMessage="Chưa có nhân viên phù hợp để gán vào tòa này."
        />
      </section>
    </div>
  );
};

export default ManagerStaffAssignmentPage;
