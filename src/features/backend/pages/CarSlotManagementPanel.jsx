/**
 * @fileoverview Xây dựng màn hình CarSlotManagementPanel, kết nối state, dữ liệu API và các thao tác người dùng.
 *
 * Luồng chính: State và dữ liệu API -> tính toán dữ liệu hiển thị -> render giao diện -> dispatch thao tác người dùng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Car,
    Plus,
    RefreshCcw,
    Save,
    Trash2,
    X,
} from "lucide-react";

import Button from "../../../components/Button/Button";
import StatusBanner from "../../../components/Feedback/StatusBanner";
import FormField from "../../../components/Form/FormField";
import Input from "../../../components/Form/Input";
import useResetAfterSuccess from "../../../hooks/useResetAfterSuccess";
import {
    clearSlotNotice,
    createSlotRequest,
    deleteSlotRequest,
    fetchSlotsByFloorRequest,
    updateSlotRequest,
} from "../slots/slotSlice";

/**
 * Khai báo `emptyForm` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/backend/pages/CarSlotManagementPanel.jsx.
 */
const emptyForm = {
    slotCode: "",
    status: "AVAILABLE",
    sizeLabel: "Tiêu chuẩn",
    positionDescription: "",
    note: "",
};

/**
 * Khai báo `statusLabels` để định nghĩa tập lựa chọn, nhãn hoặc quy tắc hợp lệ dùng xuyên suốt module.
 * Phạm vi sử dụng: src/features/backend/pages/CarSlotManagementPanel.jsx.
 */
const statusLabels = {
    AVAILABLE: "Trống",
    RESERVED: "Đã đặt",
    OCCUPIED: "Có xe",
    MAINTENANCE: "Bảo trì",
    LOCKED: "Khóa",
    CONFLICT: "Cần kiểm tra",
};

/**
 * Lấy nghiệp vụ `getSizeLabel` (get size label). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function getSizeLabel
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getSizeLabel = (value) => {
    const normalized = String(value || "").toUpperCase();
    if (normalized === "STANDARD") return "Tiêu chuẩn";
    if (normalized === "LARGE") return "Rộng";
    return value || "-";
};

/**
 * Thực hiện nghiệp vụ `CarSlotManagementPanel` (car slot management panel). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function CarSlotManagementPanel
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
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
    /* Callback nội bộ của lời gọi `useSelector`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    } = useSelector((state) => state.slots);

    const floorId = floor?.id;

    /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    const slots = useMemo(() => {
        return slotsByFloor[floorId] || [];
    }, [slotsByFloor, floorId]);

    /**
     * Chuẩn hóa hoặc chuyển đổi nghiệp vụ `normalizeText` (normalize text). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function normalizeText
     * @param {*} value - Giá trị đầu vào cần xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    const normalizeText = (value) => {
        return String(value ?? "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    };

    /**
     * Lấy nghiệp vụ `getSlotSearchValue` (get slot search value). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function getSlotSearchValue
     * @param {*} slot - Giá trị `slot` được hàm sử dụng trong quá trình xử lý.
     * @param {*} column - Giá trị `column` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    const getSlotSearchValue = (slot, column) => {
        const values = {
            id: slot.id,
            slotCode: slot.slotCode || slot.slot_code,
            status: statusLabels[slot.status] || slot.status,
            sizeLabel: getSizeLabel(slot.sizeLabel || slot.size_label),
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

    /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    const filteredSlots = useMemo(() => {
        const search = normalizeText(slotFilters.searchText);

        /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
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

    /* Callback nội bộ của lời gọi `useEffect`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    useEffect(() => {
        if (floorId) {
            dispatch(fetchSlotsByFloorRequest({ floorId }));
        }
    }, [dispatch, floorId]);

    /**
     * Cập nhật nghiệp vụ `updateField` (update field). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function updateField
     * @param {*} field - Giá trị `field` được hàm sử dụng trong quá trình xử lý.
     * @param {*} value - Giá trị đầu vào cần xử lý.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    const updateField = (field, value) => {
        /* Callback nội bộ của lời gọi `setForm`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        /* Callback nội bộ của lời gọi `setFormErrors`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        setFormErrors((prev) => ({
            ...prev,
            [field]: "",
        }));

        dispatch(clearSlotNotice());
    };

    /**
     * Kiểm tra nghiệp vụ `validateForm` (validate form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function validateForm
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    const validateForm = () => {
        const nextErrors = {};

        if (!form.slotCode.trim()) {
            nextErrors.slotCode = "Vui lòng nhập mã ô đỗ.";
        }

        setFormErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    /**
     * Xóa hoặc đặt lại nghiệp vụ `resetForm` (reset form). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function resetForm
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    const resetForm = () => {
        setEditingSlotId(null);
        setForm(emptyForm);
        setFormErrors({});
    };

    const markFormSubmitted = useResetAfterSuccess({
        submitting: creating || Boolean(updatingId),
        success: mutationSuccess,
        error: mutationError,
        onSuccess: resetForm,
    });

    /**
     * Thực hiện nghiệp vụ `startEditSlot` (start edit slot). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function startEditSlot
     * @param {*} slot - Giá trị `slot` được hàm sử dụng trong quá trình xử lý.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    const startEditSlot = (slot) => {
        setEditingSlotId(slot.id);

        setForm({
            slotCode: slot.slotCode || "",
            status: slot.status || "AVAILABLE",
            sizeLabel: getSizeLabel(slot.sizeLabel) || "Tiêu chuẩn",
            positionDescription: slot.positionDescription || "",
            note: slot.note || "",
        });
    };

    /**
     * Xử lý nghiệp vụ `handleSubmit` (handle submit). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function handleSubmit
     * @param {*} event - Sự kiện phát sinh từ thao tác của người dùng.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
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

        markFormSubmitted();

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
    };

    /**
     * Xử lý nghiệp vụ `handleDeleteSlot` (handle delete slot). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function handleDeleteSlot
     * @param {*} slot - Giá trị `slot` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    const handleDeleteSlot = (slot) => {
        const ok = window.confirm(`Bạn chắc muốn xóa ô đỗ "${slot.slotCode}" không?`);

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

    /**
     * Thực hiện nghiệp vụ `refreshSlots` (refresh slots). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
     *
     * @function refreshSlots
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
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
                        <Car size={19} /> Quản lý ô đỗ ô tô - {floor.name}
                    </h2>

                    <p className="section-copy">
                        Bấm vào từng ô để sửa. Thêm hoặc xóa ô đỗ sẽ cập nhật số lượng chỗ của tầng.
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
                    Tải lại ô đỗ
                </Button>
            </div>

            <StatusBanner success={mutationSuccess} errors={[mutationError, error]} />

            <div className="car-slot-manager-grid">
                <div className="car-slot-map-card">
                    <div className="car-slot-map-header">
                        <strong>Sơ đồ ô đỗ</strong>
                        <span>
                            Hiển thị {filteredSlots.length}/{slots.length} ô
                        </span>
                    </div>

                    <div className="car-slot-grid">
                        {loading && <p>Đang tải ô đỗ...</p>}

                        {!loading && filteredSlots.length === 0 && (
                            <p>Chưa có ô đỗ nào trong tầng này.</p>
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
                                        <span className="car-slot-size">{getSizeLabel(slot.sizeLabel)}</span>
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
                    <h3>{editingSlotId ? "Sửa ô đỗ" : "Thêm ô đỗ mới"}</h3>

                    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
                        <FormField label="Mã ô đỗ" required error={formErrors.slotCode || undefined}>
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
                                <option value="CONFLICT">Cần kiểm tra</option>
                            </select>
                        </FormField>

                        <FormField label="Kích thước">
                            <Input
                                placeholder="Tiêu chuẩn hoặc rộng"
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
                                placeholder="Ghi chú thêm cho ô đỗ"
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
                                {editingSlotId ? "Lưu ô đỗ" : "Thêm ô đỗ"}
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
                <FormField label="Tìm kiếm ô đỗ">
                    <Input
                        placeholder="Nhập mã ô đỗ, trạng thái, vị trí, ghi chú..."
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
                        <option value="id">Mã</option>
                        <option value="slotCode">Mã ô đỗ</option>
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
                        <option value="CONFLICT">Cần kiểm tra</option>
                    </select>
                </FormField>

                <FormField label="Kích thước">
                    <Input
                        placeholder="Tiêu chuẩn hoặc rộng"
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
