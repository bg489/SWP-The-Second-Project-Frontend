import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, RefreshCcw, Send } from "lucide-react";

import Button from "../../../components/Button/Button";
import StatusBanner from "../../../components/Feedback/StatusBanner";
import FormField from "../../../components/Form/FormField";
import Table from "../../../components/Table/Table";
import {
    fetchBuildingsRequest,
    fetchMyBuildingChangeRequestsRequest,
    submitBuildingChangeRequest,
} from "../buildingChange/buildingChangeSlice";

const statusLabels = {
    PENDING: "Chờ quản trị viên duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Đã từ chối",
    CANCELLED: "Đã hủy",
};

const statusTone = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "danger",
    CANCELLED: "neutral",
};

const UserBuildingChangeRequestPage = () => {
    const dispatch = useDispatch();
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
    } = useSelector((state) => state.buildingChange);

    const [form, setForm] = useState({
        requestedBuildingId: "",
        reason: "",
    });
    const [formError, setFormError] = useState("");

    const currentBuildingId = user?.buildingId;
    const currentBuilding = useMemo(() => {
        return buildings.find((building) => Number(building.id) === Number(currentBuildingId)) || {
            id: currentBuildingId,
            name: user?.buildingName || "Chưa có tòa nhà",
            address: user?.buildingAddress || "",
        };
    }, [buildings, currentBuildingId, user?.buildingAddress, user?.buildingName]);

    const availableBuildings = useMemo(() => {
        return buildings.filter((building) => Number(building.id) !== Number(currentBuildingId));
    }, [buildings, currentBuildingId]);

    useEffect(() => {
        dispatch(fetchBuildingsRequest());
        dispatch(fetchMyBuildingChangeRequestsRequest());
    }, [dispatch]);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!form.requestedBuildingId) {
            setFormError("Vui lòng chọn tòa nhà muốn chuyển đến.");
            return;
        }

        dispatch(
            submitBuildingChangeRequest({
                requestedBuildingId: Number(form.requestedBuildingId),
                reason: form.reason.trim() || undefined,
            })
        );

        setForm({
            requestedBuildingId: "",
            reason: "",
        });
        setFormError("");
    };

    const refresh = () => {
        dispatch(fetchBuildingsRequest());
        dispatch(fetchMyBuildingChangeRequestsRequest());
    };

    const columns = [
        { header: "Mã", key: "id", render: (request) => `#${request.id}` },
        { header: "Tòa nhà muốn chuyển", key: "requestedBuildingName" },
        { header: "Lý do", key: "reason", render: (request) => request.reason || "-" },
        {
            header: "Trạng thái",
            key: "status",
            render: (request) => (
                <span className={`pill ${statusTone[request.status] || "neutral"}`}>
                    {statusLabels[request.status] || request.status}
                </span>
            ),
        },
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
