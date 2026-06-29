import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, CheckCircle2, RefreshCcw, XCircle } from "lucide-react";

import Button from "../../../components/Button/Button";
import StatusBanner from "../../../components/Feedback/StatusBanner";
import Table from "../../../components/Table/Table";
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
        dispatch(fetchAdminBuildingChangeRequestsRequest({ status: "PENDING" }));
    }, [dispatch]);

    const refresh = () => {
        dispatch(fetchAdminBuildingChangeRequestsRequest({ status: "PENDING" }));
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

    const columns = [
        { header: "Mã", key: "id", render: (request) => `#${request.id}` },
        {
            header: "Cư dân",
            key: "userName",
            render: (request) => (
                <>
                    <strong>{request.userName}</strong>
                    <br />
                    <span className="metric-note">{request.userEmail}</span>
                </>
            ),
        },
        { header: "Tòa hiện tại", key: "currentBuildingName", render: (request) => request.currentBuildingName || "Chưa có" },
        {
            header: "Tòa muốn chuyển",
            key: "requestedBuildingName",
            render: (request) => (
                <>
                    <strong>{request.requestedBuildingName}</strong>
                    <br />
                    <span className="metric-note">{request.requestedBuildingAddress || "-"}</span>
                </>
            ),
        },
        { header: "Lý do", key: "reason", render: (request) => request.reason || "-" },
        {
            header: "Thao tác",
            key: "actions",
            render: (request) => (
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
            ),
        },
    ];

    return (
        <div className="parking-page">
            <section className="page-hero">
                <div>
                    <div className="page-eyebrow">
                        <Building2 size={16} /> Duyệt đổi tòa nhà
                    </div>
                    <h1 className="page-title">Duyệt yêu cầu đổi tòa nhà</h1>
                    <p className="page-subtitle">
                        Khi được duyệt, cư dân và các xe đã đăng ký sẽ chuyển sang tòa nhà mới.
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

            <StatusBanner success={notice} errors={error} />

            <section className="section-card card">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Yêu cầu đang chờ duyệt</h2>
                        <p className="section-copy">Chỉ hiển thị các yêu cầu đang chờ duyệt.</p>
                    </div>
                </div>

                <Table
                    columns={columns}
                    data={adminRequests}
                    loading={adminLoading}
                    emptyMessage="Không có yêu cầu chờ duyệt."
                />
            </section>
        </div>
    );
};

export default AdminBuildingChangeRequestsPage;
