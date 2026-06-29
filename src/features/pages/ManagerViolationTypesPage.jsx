import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, Save, Trash2, RefreshCcw, Edit2 } from "lucide-react";
import Button from "../../components/Button/Button";
import FormField from "../../components/Form/FormField";
import Input from "../../components/Form/Input";
import Table from "../../components/Table/Table";
import { formatCurrency } from "../../services/mockParkingData";

const ManagerViolationTypesPage = () => {
    const dispatch = useDispatch();
    const { violationTypes } = useSelector((state) => state.parking);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: "", defaultPenaltyFee: "", description: "" });

    useEffect(() => {
        dispatch({ type: "parking/fetchViolationTypesRequest" });
    }, [dispatch]);

    const handleEdit = (item) => {
        setEditingId(item.id);
        setForm({
            name: item.name,
            defaultPenaltyFee: item.defaultPenaltyFee || item.penaltyFee || "",
            description: item.description || ""
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setForm({ name: "", defaultPenaltyFee: "", description: "" });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.defaultPenaltyFee) return;

        dispatch({
            type: "parking/saveViolationTypeRequest",
            payload: {
                id: editingId || undefined,
                name: form.name.trim(),
                defaultPenaltyFee: Number(form.defaultPenaltyFee),
                description: form.description
            }
        });
        handleCancel();
    };

    const handleDelete = (id) => {
        if (window.confirm("Bạn có chắc chắn muốn ngưng áp dụng loại vi phạm này?")) {
            dispatch({ type: "parking/deactivateViolationTypeRequest", payload: { id } });
        }
    };

    const columns = [
        { header: "Tên loại vi phạm", key: "name" },
        {
            header: "Mức phạt mặc định",
            key: "defaultPenaltyFee",
            render: (row) => formatCurrency(row.defaultPenaltyFee || row.penaltyFee || 0)
        },
        { header: "Mô tả chi tiết", key: "description", render: (row) => row.description || "-" },
        {
            header: "Thao tác",
            key: "actions",
            render: (row) => (
                <div className="action-row">
                    <Button variant="outline" size="sm" icon={Edit2} onClick={() => handleEdit(row)}>Sửa</Button>
                    <Button variant="danger" size="sm" icon={Trash2} onClick={() => handleDelete(row.id)}>Tắt</Button>
                </div>
            )
        }
    ];

    return (
        <div className="parking-page animate-fade-in">
            <section className="card section-card">
                <div className="section-header">
                    <h2 className="section-title">
                        <AlertTriangle size={19} color="var(--orange)" />
                        {editingId ? "Cập nhật loại vi phạm" : "Thêm loại vi phạm hệ thống"}
                    </h2>
                </div>
                <form onSubmit={handleSubmit} className="filter-grid">
                    <FormField label="Tên loại vi phạm" required>
                        <Input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Ví dụ: Đỗ sai ô quy định, mất thẻ..."
                        />
                    </FormField>
                    <FormField label="Số tiền phạt (VND)" required>
                        <Input
                            type="number"
                            value={form.defaultPenaltyFee}
                            onChange={(e) => setForm({ ...form, defaultPenaltyFee: e.target.value })}
                            placeholder="Nhập số tiền..."
                        />
                    </FormField>
                    <FormField label="Ghi chú mô tả">
                        <Input
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Nhập mô tả ngắn..."
                        />
                    </FormField>
                    <div style={{ alignSelf: "end", display: "flex", gap: "8px" }}>
                        <Button type="submit" icon={Save} loading={violationTypes.saving}>Lưu cấu hình</Button>
                        {editingId && <Button variant="outline" onClick={handleCancel}>Hủy</Button>}
                    </div>
                </form>
            </section>

            <section className="card section-card">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Danh mục lỗi vi phạm hiện hành</h2>
                        <p className="section-copy">Các mục lỗi hiển thị để nhân viên trực cổng lựa chọn nhanh.</p>
                    </div>
                    <Button variant="outline" icon={RefreshCcw} onClick={() => dispatch({ type: "parking/fetchViolationTypesRequest" })} />
                </div>
                <Table columns={columns} data={violationTypes.items} loading={violationTypes.loading} />
            </section>
        </div>
    );
};

export default ManagerViolationTypesPage;
