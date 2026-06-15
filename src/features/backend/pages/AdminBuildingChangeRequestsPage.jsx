import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, CheckCircle2, RefreshCcw, XCircle } from "lucide-react";

import Button from "../../../components/Button/Button";
import {
    approveBuildingChangeRequest,
    fetchAdminBuildingChangeRequestsRequest,
    rejectBuildingChangeRequest,
} from "../buildingChange/buildingChangeSlice";

const AdminBuildingChangeRequestsPage = () => {
    const dispatch = useDispatch();

    const { adminRequests, adminLoading, actionId, error, notice } = useSelector(
        (state) => state.buildingChange
    );

    useEffect(() => {
        dispatch(
            fetchAdminBuildingChangeRequestsRequest({
                status: "PENDING",
            })
        );
    }, [dispatch]);

    const refresh = () => {
        dispatch(
            fetchAdminBuildingChangeRequestsRequest({
                status: "PENDING",
            })
        );
    };

    const approveRequest = (request) => {
        const adminNote = window.prompt("Ghi chú duyệt:", "Đã duyệt đổi tòa nhà");

        dispatch(
            approveBuildingChangeRequest({
                id: request.id,
                adminNote: adminNote || undefined,
            })
        );
    };

    const rejectRequest = (request) => {
        const adminNote = window.prompt("Lý do từ chối:", "Thông tin chưa hợp lệ");

        dispatch(
            rejectBuildingChangeRequest({
                id: request.id,
                adminNote: adminNote || undefined,
            })
        );
    };

    return (
        <div className="parking-page">
            <section className="page-hero">
                <div>
                    <div className="page-eyebrow">
                        <Building2 size={16} /> Admin approval
                    </div>

                    <h1 className="page-title">Duyệt yêu cầu đổi tòa nhà</h1>

                    <p className="page-subtitle">
                        Khi admin duyệt, backend sẽ đổi tòa nhà của user và đồng bộ tòa nhà
                        cho xe của user đó.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    icon={RefreshCcw}
                    onClick={refresh}
                    loading={adminLoading}
                >
                    Tải lại
                </Button>
            </section>

            {(error || notice) && (
                <section className="section-card card">
                    {notice && <p style={{ color: "var(--success)" }}>{notice}</p>}
                    {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
                </section>
            )}

            <section className="section-card card">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Yêu cầu đang chờ duyệt</h2>
                        <p className="section-copy">
                            Chỉ hiển thị các request có trạng thái PENDING.
                        </p>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User</th>
                                <th>Tòa hiện tại</th>
                                <th>Tòa muốn chuyển</th>
                                <th>Lý do</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {adminLoading && (
                                <tr>
                                    <td colSpan="6">Đang tải yêu cầu...</td>
                                </tr>
                            )}

                            {!adminLoading && adminRequests.length === 0 && (
                                <tr>
                                    <td colSpan="6">Không có yêu cầu chờ duyệt.</td>
                                </tr>
                            )}

                            {!adminLoading &&
                                adminRequests.map((request) => (
                                    <tr key={request.id}>
                                        <td>#{request.id}</td>

                                        <td>
                                            <strong>{request.userName}</strong>
                                            <br />
                                            <span className="metric-note">{request.userEmail}</span>
                                        </td>

                                        <td>{request.currentBuildingName || "Chưa có"}</td>

                                        <td>
                                            <strong>{request.requestedBuildingName}</strong>
                                            <br />
                                            <span className="metric-note">
                                                {request.requestedBuildingAddress || "-"}
                                            </span>
                                        </td>

                                        <td>{request.reason || "-"}</td>

                                        <td>
                                            <div className="action-row">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    icon={CheckCircle2}
                                                    loading={actionId === request.id}
                                                    disabled={actionId === request.id}
                                                    onClick={() => approveRequest(request)}
                                                >
                                                    Duyệt
                                                </Button>

                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    icon={XCircle}
                                                    disabled={actionId === request.id}
                                                    onClick={() => rejectRequest(request)}
                                                >
                                                    Từ chối
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminBuildingChangeRequestsPage;