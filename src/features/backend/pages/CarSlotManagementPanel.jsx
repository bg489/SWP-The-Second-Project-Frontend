import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Car,
    CheckCircle,
    Edit2,
    Plus,
    RefreshCcw,
    Save,
    Trash2,
    X,
} from "lucide-react";

import Button from "../../../components/Button/Button";
import FormField from "../../../components/Form/FormField";
import Input from "../../../components/Form/Input";
import {
    clearSlotNotice,
    createSlotRequest,
    deleteSlotRequest,
    fetchSlotsByFloorRequest,
    updateSlotRequest,
} from "../slots/slotSlice";

const emptyForm = {
    slotCode: "",
    status: "AVAILABLE",
    sizeLabel: "STANDARD",
    positionDescription: "",
    note: "",
};

const statusLabels = {
    AVAILABLE: "Trống",
    RESERVED: "Đã đặt",
    OCCUPIED: "Có xe",
    MAINTENANCE: "Bảo trì",
    LOCKED: "Khóa",
    CONFLICT: "Lỗi",
};

const CarSlotManagementPanel = ({ floor }) => {
    const dispatch = useDispatch();

    const {
        slotsByFloor,
        loading,
        error,
        creating,
        updatingId,
        deletingId,
        mutationError,
        mutationSuccess,
    } = useSelector((state) => state.slots);

    const floorId = floor?.id;

    const slots = useMemo(() => {
        return slotsByFloor[floorId] || [];
    }, [slotsByFloor, floorId]);

    const normalizeText = (value) => {
        return String(value ?? "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    };

    const getSlotSearchValue = (slot, column) => {
        const values = {
            id: slot.id,
            slotCode: slot.slotCode || slot.slot_code,
            status: statusLabels[slot.status] || slot.status,
            sizeLabel: slot.sizeLabel || slot.size_label,
            positionDescription:
                slot.positionDescription || slot.position_description,
            note: slot.note,
        };

        if (column === "all") {
            return Object.values(values).join(" ");
        }

        return values[column] ?? "";
    };



    const [editingSlotId, setEditingSlotId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formErrors, setFormErrors] = useState({});

    const [slotFilters, setSlotFilters] = useState({
        searchText: "",
        searchColumn: "all",
        status: "",
        sizeLabel: "",
    });

    const filteredSlots = useMemo(() => {
        const search = normalizeText(slotFilters.searchText);

        return slots.filter((slot) => {
            const matchSearch =
                !search ||
                normalizeText(getSlotSearchValue(slot, slotFilters.searchColumn)).includes(
                    search
                );

            const matchStatus = !slotFilters.status || slot.status === slotFilters.status;

            const currentSize = slot.sizeLabel || slot.size_label || "";
            const matchSize =
                !slotFilters.sizeLabel ||
                normalizeText(currentSize).includes(normalizeText(slotFilters.sizeLabel));

            return matchSearch && matchStatus && matchSize;
        });
    }, [slots, slotFilters]);

    useEffect(() => {
        if (floorId) {
            dispatch(fetchSlotsByFloorRequest({ floorId }));
        }
    }, [dispatch, floorId]);

    const updateField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        setFormErrors((prev) => ({
            ...prev,
            [field]: "",
        }));

        dispatch(clearSlotNotice());
    };

    const validateForm = () => {
        const nextErrors = {};

        if (!form.slotCode.trim()) {
            nextErrors.slotCode = "Vui lòng nhập mã slot.";
        }

        setFormErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const resetForm = () => {
        setEditingSlotId(null);
        setForm(emptyForm);
        setFormErrors({});
    };

    const startEditSlot = (slot) => {
        setEditingSlotId(slot.id);

        setForm({
            slotCode: slot.slotCode || "",
            status: slot.status || "AVAILABLE",
            sizeLabel: slot.sizeLabel || "STANDARD",
            positionDescription: slot.positionDescription || "",
            note: slot.note || "",
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        const payload = {
            floorId,
            slotCode: form.slotCode.trim(),
            status: form.status,
            sizeLabel: form.sizeLabel.trim() || undefined,
            positionDescription: form.positionDescription.trim() || undefined,
            note: form.note.trim() || undefined,
        };

        if (editingSlotId) {
            dispatch(
                updateSlotRequest({
                    id: editingSlotId,
                    ...payload,
                })
            );
        } else {
            dispatch(createSlotRequest(payload));
        }

        resetForm();
    };

    const handleDeleteSlot = (slot) => {
        const ok = window.confirm(`Bạn chắc muốn xóa slot "${slot.slotCode}" không?`);

        if (!ok) return;

        dispatch(
            deleteSlotRequest({
                id: slot.id,
                floorId,
            })
        );

        if (editingSlotId === slot.id) {
            resetForm();
        }
    };

    const refreshSlots = () => {
        dispatch(clearSlotNotice());
        dispatch(fetchSlotsByFloorRequest({ floorId }));
    };

    if (!floor || floor.floorType !== "CAR") {
        return null;
    }

    return (
        <section className="card section-card">
            <div className="section-header">
                <div>
                    <h2 className="section-title">
                        <Car size={19} /> Quản lý slot ô tô - {floor.name}
                    </h2>

                    <p className="section-copy">
                        Bấm vào từng ô để sửa. Thêm slot sẽ tăng slotCount, xóa slot sẽ giảm
                        slotCount.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    icon={RefreshCcw}
                    loading={loading}
                    disabled={loading}
                    onClick={refreshSlots}
                >
                    Tải lại slot
                </Button>
            </div>

            {(mutationSuccess || mutationError || error) && (
                <div className="soft-panel" style={{ marginBottom: 16 }}>
                    {mutationSuccess && (
                        <span className="pill success">
                            <CheckCircle size={14} /> {mutationSuccess}
                        </span>
                    )}

                    {mutationError && (
                        <p style={{ color: "var(--danger)" }}>{mutationError}</p>
                    )}

                    {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
                </div>
            )}

            <div className="car-slot-manager-grid">
                <div className="car-slot-map-card">
                    <div className="car-slot-map-header">
                        <strong>Sơ đồ slot</strong>
                        <span>
                            Hiển thị {filteredSlots.length}/{slots.length} slot
                        </span>
                    </div>

                    <div className="car-slot-grid">
                        {loading && <p>Đang tải slot...</p>}

                        {!loading && filteredSlots.length === 0 && (
                            <p>Chưa có slot nào trong tầng này.</p>
                        )}

                        {!loading &&
                            filteredSlots.map((slot) => (
                                <button
                                    key={slot.id}
                                    type="button"
                                    className={`car-slot-card ${String(
                                        slot.status || "AVAILABLE"
                                    ).toLowerCase()} ${editingSlotId === slot.id ? "selected" : ""
                                        }`}
                                    onClick={() => startEditSlot(slot)}
                                >
                                    <span className="car-slot-code">{slot.slotCode}</span>
                                    <span className="car-slot-status">
                                        {statusLabels[slot.status] || slot.status}
                                    </span>
                                    {slot.sizeLabel && (
                                        <span className="car-slot-size">{slot.sizeLabel}</span>
                                    )}
                                </button>
                            ))}
                    </div>

                    <div className="car-slot-legend">
                        <span className="legend-dot available"></span> Trống
                        <span className="legend-dot reserved"></span> Đã đặt
                        <span className="legend-dot occupied"></span> Có xe
                        <span className="legend-dot maintenance"></span> Bảo trì/khóa
                    </div>
                </div>

                <div className="car-slot-form-card">
                    <h3>{editingSlotId ? "Sửa slot" : "Thêm slot mới"}</h3>

                    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
                        <FormField label="Mã slot" required error={formErrors.slotCode || undefined}>
                            <Input
                                placeholder="Ví dụ: CAR-A21"
                                value={form.slotCode}
                                onChange={(event) => updateField("slotCode", event.target.value)}
                                disabled={creating || Boolean(updatingId)}
                            />
                        </FormField>

                        <FormField label="Trạng thái">
                            <select
                                className="form-input"
                                value={form.status}
                                onChange={(event) => updateField("status", event.target.value)}
                                disabled={creating || Boolean(updatingId)}
                            >
                                <option value="AVAILABLE">Trống</option>
                                <option value="RESERVED">Đã đặt</option>
                                <option value="OCCUPIED">Có xe</option>
                                <option value="MAINTENANCE">Bảo trì</option>
                                <option value="LOCKED">Khóa</option>
                                <option value="CONFLICT">Lỗi</option>
                            </select>
                        </FormField>

                        <FormField label="Kích thước">
                            <Input
                                placeholder="STANDARD / LARGE / EV"
                                value={form.sizeLabel}
                                onChange={(event) => updateField("sizeLabel", event.target.value)}
                                disabled={creating || Boolean(updatingId)}
                            />
                        </FormField>

                        <FormField label="Vị trí">
                            <Input
                                placeholder="Ví dụ: Gần cổng vào, hàng A"
                                value={form.positionDescription}
                                onChange={(event) =>
                                    updateField("positionDescription", event.target.value)
                                }
                                disabled={creating || Boolean(updatingId)}
                            />
                        </FormField>

                        <FormField label="Ghi chú">
                            <textarea
                                className="form-input"
                                rows="3"
                                placeholder="Ghi chú thêm cho slot"
                                value={form.note}
                                onChange={(event) => updateField("note", event.target.value)}
                                disabled={creating || Boolean(updatingId)}
                            />
                        </FormField>

                        <div className="action-row">
                            <Button
                                type="submit"
                                icon={editingSlotId ? Save : Plus}
                                loading={creating || Boolean(updatingId)}
                                disabled={creating || Boolean(updatingId)}
                            >
                                {editingSlotId ? "Lưu slot" : "Thêm slot"}
                            </Button>

                            {editingSlotId && (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        icon={X}
                                        onClick={resetForm}
                                    >
                                        Hủy
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="danger"
                                        icon={Trash2}
                                        loading={deletingId === editingSlotId}
                                        disabled={Boolean(deletingId)}
                                        onClick={() =>
                                            handleDeleteSlot(slots.find((slot) => slot.id === editingSlotId))
                                        }
                                    >
                                        Xóa
                                    </Button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            <div className="filter-grid" style={{ marginBottom: 16 }}>
                <FormField label="Tìm kiếm slot">
                    <Input
                        placeholder="Nhập mã slot, trạng thái, vị trí, ghi chú..."
                        value={slotFilters.searchText}
                        onChange={(event) =>
                            setSlotFilters((prev) => ({
                                ...prev,
                                searchText: event.target.value,
                            }))
                        }
                    />
                </FormField>

                <FormField label="Tìm theo cột">
                    <select
                        className="form-input"
                        value={slotFilters.searchColumn}
                        onChange={(event) =>
                            setSlotFilters((prev) => ({
                                ...prev,
                                searchColumn: event.target.value,
                            }))
                        }
                    >
                        <option value="all">Tất cả cột</option>
                        <option value="id">ID</option>
                        <option value="slotCode">Mã slot</option>
                        <option value="status">Trạng thái</option>
                        <option value="sizeLabel">Kích thước</option>
                        <option value="positionDescription">Vị trí</option>
                        <option value="note">Ghi chú</option>
                    </select>
                </FormField>

                <FormField label="Trạng thái">
                    <select
                        className="form-input"
                        value={slotFilters.status}
                        onChange={(event) =>
                            setSlotFilters((prev) => ({
                                ...prev,
                                status: event.target.value,
                            }))
                        }
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="AVAILABLE">Trống</option>
                        <option value="RESERVED">Đã đặt</option>
                        <option value="OCCUPIED">Có xe</option>
                        <option value="MAINTENANCE">Bảo trì</option>
                        <option value="LOCKED">Khóa</option>
                        <option value="CONFLICT">Lỗi</option>
                    </select>
                </FormField>

                <FormField label="Kích thước">
                    <Input
                        placeholder="STANDARD / LARGE / EV..."
                        value={slotFilters.sizeLabel}
                        onChange={(event) =>
                            setSlotFilters((prev) => ({
                                ...prev,
                                sizeLabel: event.target.value,
                            }))
                        }
                    />
                </FormField>

                <div style={{ alignSelf: "end" }}>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            setSlotFilters({
                                searchText: "",
                                searchColumn: "all",
                                status: "",
                                sizeLabel: "",
                            })
                        }
                    >
                        Xóa lọc
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default CarSlotManagementPanel;