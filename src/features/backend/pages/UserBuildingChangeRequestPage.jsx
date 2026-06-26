import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, RefreshCcw, Send } from "lucide-react";

import Button from "../../../components/Button/Button";
import FormField from "../../../components/Form/FormField";
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
        return buildings.filter(
            (building) => Number(building.id) !== Number(currentBuildingId)
        );
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

    return (
        <div className="parking-page">
            <section className="page-hero">
                <div>
                    <div className="page-eyebrow">
                        <Building2 size={16} /> Đổi tòa nhà
                    </div>

                    <h1 className="page-title">Yêu cầu đổi tòa nhà</h1>

                    <p className="page-subtitle">
                        Gửi yêu cầu chuyển sang tòa nhà khác. Quản trị viên sẽ duyệt trước khi thay
                        đổi có hiệu lực.
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

                {(error || buildingsError || formError || notice) && (
                    <div className="soft-panel">
                        {notice && <p style={{ color: "var(--success)" }}>{notice}</p>}
                        {formError && <p style={{ color: "var(--danger)" }}>{formError}</p>}
                        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
                        {buildingsError && (
                            <p style={{ color: "var(--danger)" }}>{buildingsError}</p>
                        )}
                    </div>
                )}

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

                    <Button
                        type="submit"
                        icon={Send}
                        loading={submitLoading}
                        disabled={submitLoading}
                    >
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

                <div className="table-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Mã</th>
                                <th>Tòa nhà muốn chuyển</th>
                                <th>Lý do</th>
                                <th>Trạng thái</th>
                                <th>Ghi chú duyệt</th>
                            </tr>
                        </thead>

                        <tbody>
                            {myLoading && (
                                <tr>
                                    <td colSpan="5">Đang tải yêu cầu...</td>
                                </tr>
                            )}

                            {!myLoading && myRequests.length === 0 && (
                                <tr>
                                    <td colSpan="5">Chưa có yêu cầu đổi tòa nhà.</td>
                                </tr>
                            )}

                            {!myLoading &&
                                myRequests.map((request) => (
                                    <tr key={request.id}>
                                        <td>#{request.id}</td>
                                        <td>{request.requestedBuildingName}</td>
                                        <td>{request.reason || "-"}</td>
                                        <td>{statusLabels[request.status] || request.status}</td>
                                        <td>{request.adminNote || "-"}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default UserBuildingChangeRequestPage;
