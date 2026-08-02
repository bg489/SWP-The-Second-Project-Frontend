/**
 * @fileoverview Khai báo state, action và reducer Redux cho miền dữ liệu parkingSlice.
 *
 * Luồng chính: Action được dispatch -> reducer tương ứng cập nhật state bất biến do Redux Toolkit quản lý.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { createSlice } from "@reduxjs/toolkit";
import {
    monthlyPackages,
    monthlyPasses,
    parkingSessions,
    payments,
    pricingPolicy,
    reportSummary,
    slotRegistrations,
    tempQrCards,
    vehicles,
    violations,
} from "../../../services/mockParkingData";
import { reconcileCollectionById } from "../../../utils/reconcileCollection";

/**
 * Khai báo `pricingPoliciesSeed` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/backend/parking/parkingSlice.jsx.
 */
const pricingPoliciesSeed = [
    {
        id: "PRICE-MOTORBIKE-TURN",
        vehicleType: "MOTORBIKE",
        pricingType: "TURN",
        amount: pricingPolicy.motorbikeTurn,
        status: "ACTIVE",
    },
    {
        id: "PRICE-CAR-HOURLY",
        vehicleType: "CAR",
        pricingType: "HOURLY",
        amount: pricingPolicy.carHourly,
        status: "ACTIVE",
    },
];

/**
 * Khai báo `packagePlanSeed` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/backend/parking/parkingSlice.jsx.
 */
/* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
const packagePlanSeed = monthlyPackages.map((plan) => ({
    ...plan,
    durationDays: Number(String(plan.duration).replace(/\D/g, "")) || 30,
    status: "ACTIVE",
}));

/**
 * Lấy nghiệp vụ `readCollectionSyncPayload` (read collection sync payload). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
 *
 * @function readCollectionSyncPayload
 * @param {*} payload - Dữ liệu nghiệp vụ được truyền vào hàm.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const readCollectionSyncPayload = (payload) =>
    Array.isArray(payload)
        ? { items: payload, silent: false }
        : {
            items: Array.isArray(payload?.items) ? payload.items : [],
            silent: Boolean(payload?.silent),
        };

/**
 * Lấy nghiệp vụ `readSyncFailure` (read sync failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
 *
 * @function readSyncFailure
 * @param {*} payload - Dữ liệu nghiệp vụ được truyền vào hàm.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const readSyncFailure = (payload) =>
    typeof payload === "object"
        ? payload
        : { error: payload, silent: false };

/**
 * Tạo nghiệp vụ `buildReportsSeed` (build reports seed). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
 *
 * @function buildReportsSeed
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const buildReportsSeed = () => ({
    traffic: {
        trafficIn: reportSummary.trafficIn,
        trafficOut: reportSummary.trafficOut,
        byVehicleType: [
            { label: "Xe máy", value: 612 },
            { label: "Ô tô", value: 230 },
        ],
    },
    motorbikeCapacity: {
        total: 560,
        current: 485,
        remaining: 75,
    },
    carSlots: {
        total: 36,
        occupied: 7,
        available: 18,
        reserved: 3,
        locked: 8,
    },
    revenue: reportSummary,
    qrPasses: {
        active: reportSummary.activeQrPasses,
        expiring: reportSummary.expiringQrPasses,
        expired: reportSummary.expiredQrPasses,
    },
    violations: {
        total: violations.length,
        /* Callback nội bộ của lời gọi `reduce`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        pendingAmount: violations.reduce((sum, item) => sum + Number(item.fine || 0), 0),
    },
});

/**
 * Khai báo `initialState` để mô tả trạng thái khởi tạo trước khi người dùng hoặc API tạo ra thay đổi.
 * Phạm vi sử dụng: src/features/backend/parking/parkingSlice.jsx.
 */
const initialState = {
    health: {
        ready: false,
        loading: false,
        error: null,
        checkedAt: null,
    },
    violationTypes: {
        items: [],
        loading: false,
        error: null,
        saving: false,
        mutationSuccess: null,
    },

    vehicles: {
        all: vehicles,
        /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        mine: vehicles.filter((vehicle) => vehicle.userId === 1),
        loading: false,
        saving: false,
        updatingId: null,
        error: null,
    },

    pricingPolicies: {
        items: pricingPoliciesSeed,
        loading: false,
        saving: false,
        deletingId: null,
        error: null,
    },

    packagePlans: {
        items: packagePlanSeed,
        loading: false,
        saving: false,
        deletingId: null,
        buyingId: null,
        purchaseResult: null,
        error: null,
    },

    monthlyPasses: {
        items: monthlyPasses,
        /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        mine: monthlyPasses.filter((pass) => pass.userId === 1),
        loading: false,
        saving: false,
        payingId: null,
        error: null,
    },

    tempQrCards: {
        items: tempQrCards,
        loading: false,
        saving: false,
        updatingId: null,
        error: null,
    },

    qrPasses: {
        mine: monthlyPasses,
        items: monthlyPasses,
        validation: null,
        loading: false,
        validating: false,
        updatingId: null,
        error: null,
    },

    slotRegistrations: {
        mine: slotRegistrations,
        creating: false,
        loading: false,
        lastCreated: null,
        error: null,
    },

    hourlyReservations: {
        availability: {
            buildingId: null,
            startAt: null,
            endAt: null,
            quote: null,
            slots: [],
        },
        mine: [],
        staffItems: [],
        checkInMatch: null,
        matchingCheckIn: false,
        availabilityLoading: false,
        listLoading: false,
        creatingUser: false,
        creatingGuest: false,
        lastCreated: null,
        error: null,
    },

    notifications: {
        mine: [],
        loading: false,
        updatingId: null,
        markingAll: false,
        preferences: {
            emailNotificationsEnabled: true,
            loading: false,
            saving: false,
            error: null,
        },
        error: null,
    },

    staffAssignments: {
        building: null,
        items: [],
        loading: false,
        assigningId: null,
        error: null,
    },

    wrongSlotCases: {
        items: [],
        myItems: [],
        loading: false,
        reporting: false,
        confirmingId: null,
        movingId: null,
        lastCase: null,
        error: null,
    },

    floorMismatchCases: {
        items: [],
        myItems: [],
        loading: false,
        reporting: false,
        confirmingId: null,
        movingId: null,
        lastCase: null,
        error: null,
    },

    parkingSessions: {
        /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
        active: parkingSessions.filter((session) =>
            ["ACTIVE", "PENDING_PAYMENT"].includes(session.status)
        ),
        dailyActivity: {
            date: null,
            scope: { buildingId: null },
            sessions: [],
            buildingSummaries: [],
            summary: {
                currentlyParked: { total: 0, motorbike: 0, car: 0 },
                enteredToday: { total: 0, motorbike: 0, car: 0 },
                exitedToday: { total: 0, motorbike: 0, car: 0 },
            },
            loading: false,
            error: null,
        },
        mine: parkingSessions.filter(
            /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
            (session) =>
                session.userId === 1 &&
                ["ACTIVE", "PENDING_PAYMENT"].includes(session.status)
        ),
        loading: false,
        myLoading: false,
        checkingIn: false,
        checkingOut: false,
        lastCheckIn: null,
        checkoutResult: null,
        error: null,
    },

    plateRecognition: {
        requestId: null,
        plateNumber: "",
        rawText: "",
        confidence: 0,
        detectionConfidence: 0,
        ocrConfidence: 0,
        engine: null,
        candidates: [],
        loading: false,
        error: null,
    },

    violations: {
        items: [], // Hoặc gán bằng biến dữ liệu seed từ mockParkingData nếu cần
        loading: false,
        error: null
    },

    payments: {
        items: payments,
        loading: false,
        error: null,
    },

    reports: {
        data: buildReportsSeed(),
        loading: false,
        error: null,
    },


    notice: null,
};

/**
 * Thực hiện nghiệp vụ `upsertById` (upsert by id). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
 *
 * @function upsertById
 * @param {*} items - Giá trị `items` được hàm sử dụng trong quá trình xử lý.
 * @param {*} item - Giá trị `item` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const upsertById = (items, item) => {
    if (!item?.id) return items;

    /* Callback nội bộ của lời gọi `some`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    const exists = items.some((current) => String(current.id) === String(item.id));
    if (!exists) return [item, ...items];

    /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    return items.map((current) =>
        String(current.id) === String(item.id) ? { ...current, ...item } : current
    );
};

/**
 * Khai báo `parkingSlice` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/backend/parking/parkingSlice.jsx.
 */
const parkingSlice = createSlice({
    name: "parking",
    initialState,
    reducers: {
        /**
         * Lấy nghiệp vụ `fetchViolationTypesRequest` (fetch violation types request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchViolationTypesRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchViolationTypesRequest: (state) => {
            state.violationTypes.loading = true;
            state.violationTypes.error = null;
        },
        /**
         * Lấy nghiệp vụ `fetchViolationTypesSuccess` (fetch violation types success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchViolationTypesSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchViolationTypesSuccess: (state, action) => {
            state.violationTypes.loading = false;
            state.violationTypes.items = action.payload || [];
        },
        /**
         * Lấy nghiệp vụ `fetchViolationTypesFailure` (fetch violation types failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchViolationTypesFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchViolationTypesFailure: (state, action) => {
            state.violationTypes.loading = false;
            state.violationTypes.error = action.payload;
        },

        // Luồng lưu (Thêm mới/Cập nhật) cấu hình lỗi vi phạm
        saveViolationTypeRequest: (state) => {
            state.violationTypes.saving = true;
            state.violationTypes.error = null;
            state.violationTypes.mutationSuccess = null;
            state.notice = null;
        },
        /**
         * Cập nhật nghiệp vụ `saveViolationTypeSuccess` (save violation type success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function saveViolationTypeSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        saveViolationTypeSuccess: (state, action) => {
            state.violationTypes.saving = false;
            const updated = action.payload;
            /* Callback nội bộ của lời gọi `findIndex`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
            const index = state.violationTypes.items.findIndex(item => item.id === updated.id);
            if (index !== -1) {
                state.violationTypes.items[index] = updated;
            } else {
                state.violationTypes.items.unshift(updated);
            }
            state.violationTypes.mutationSuccess = "Đã lưu mức phí vi phạm.";
            state.notice = state.violationTypes.mutationSuccess;
        },
        /**
         * Cập nhật nghiệp vụ `saveViolationTypeFailure` (save violation type failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function saveViolationTypeFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        saveViolationTypeFailure: (state, action) => {
            state.violationTypes.saving = false;
            state.violationTypes.error = action.payload;
        },

        // Luồng ngưng áp dụng cấu hình lỗi vi phạm
        deactivateViolationTypeRequest: (state) => {
            state.violationTypes.saving = true;
            state.violationTypes.error = null;
            state.violationTypes.mutationSuccess = null;
            state.notice = null;
        },
        /**
         * Thực hiện nghiệp vụ `deactivateViolationTypeSuccess` (deactivate violation type success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function deactivateViolationTypeSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        deactivateViolationTypeSuccess: (state, action) => {
            state.violationTypes.saving = false;
            const updated = action.payload;
            const index = state.violationTypes.items.findIndex(
                /* Callback nội bộ của lời gọi `findIndex`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
                (item) => String(item.id) === String(updated?.id)
            );
            if (index !== -1) {
                state.violationTypes.items[index] = updated;
            }
            state.violationTypes.mutationSuccess = "Đã ngừng áp dụng mức phí vi phạm.";
            state.notice = state.violationTypes.mutationSuccess;
        },
        /**
         * Xóa hoặc đặt lại nghiệp vụ `clearParkingNotice` (clear parking notice). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function clearParkingNotice
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        clearParkingNotice: (state) => {
            state.notice = null;
            state.health.error = null;
            state.vehicles.error = null;
            state.pricingPolicies.error = null;
            state.packagePlans.error = null;
            state.monthlyPasses.error = null;
            state.tempQrCards.error = null;
            state.qrPasses.error = null;
            state.slotRegistrations.error = null;
            state.hourlyReservations.error = null;
            state.notifications.error = null;
            state.notifications.preferences.error = null;
            state.staffAssignments.error = null;
            state.wrongSlotCases.error = null;
            state.floorMismatchCases.error = null;
            state.parkingSessions.error = null;
            state.violations.error = null;
            state.payments.error = null;
            state.reports.error = null;
            state.violationTypes.error = null;
            state.violationTypes.mutationSuccess = null;
        },

        /**
         * Lấy nghiệp vụ `fetchHealthRequest` (fetch health request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchHealthRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchHealthRequest: (state) => {
            state.health.loading = true;
            state.health.error = null;
        },
        /**
         * Lấy nghiệp vụ `fetchHealthSuccess` (fetch health success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchHealthSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchHealthSuccess: (state, action) => {
            state.health.loading = false;
            state.health.ready = true;
            state.health.checkedAt = action.payload?.checkedAt || new Date().toISOString();
        },
        /**
         * Lấy nghiệp vụ `fetchHealthFailure` (fetch health failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchHealthFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchHealthFailure: (state, action) => {
            state.health.loading = false;
            state.health.ready = false;
            state.health.error = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchMyVehiclesRequest` (fetch my vehicles request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyVehiclesRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyVehiclesRequest: (state) => {
            state.vehicles.loading = true;
            state.vehicles.error = null;
        },
        /**
         * Lấy nghiệp vụ `fetchMyVehiclesSuccess` (fetch my vehicles success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyVehiclesSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyVehiclesSuccess: (state, action) => {
            state.vehicles.loading = false;
            state.vehicles.mine = action.payload || [];
        },
        /**
         * Lấy nghiệp vụ `fetchMyVehiclesFailure` (fetch my vehicles failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyVehiclesFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyVehiclesFailure: (state, action) => {
            state.vehicles.loading = false;
            state.vehicles.error = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchAllVehiclesRequest` (fetch all vehicles request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchAllVehiclesRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchAllVehiclesRequest: (state) => {
            state.vehicles.loading = true;
            state.vehicles.error = null;
        },
        /**
         * Lấy nghiệp vụ `fetchAllVehiclesSuccess` (fetch all vehicles success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchAllVehiclesSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchAllVehiclesSuccess: (state, action) => {
            state.vehicles.loading = false;
            state.vehicles.all = action.payload || [];
        },
        /**
         * Lấy nghiệp vụ `fetchAllVehiclesFailure` (fetch all vehicles failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchAllVehiclesFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchAllVehiclesFailure: (state, action) => {
            state.vehicles.loading = false;
            state.vehicles.error = action.payload;
        },

        /**
         * Tạo nghiệp vụ `createVehicleRequest` (create vehicle request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createVehicleRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createVehicleRequest: (state) => {
            state.vehicles.saving = true;
            state.vehicles.error = null;
            state.notice = null;
        },
        /**
         * Tạo nghiệp vụ `createVehicleSuccess` (create vehicle success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createVehicleSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createVehicleSuccess: (state, action) => {
            state.vehicles.saving = false;
            state.vehicles.mine = upsertById(state.vehicles.mine, action.payload);
            state.vehicles.all = upsertById(state.vehicles.all, action.payload);
            state.notice = "Đã gửi hồ sơ xe để chờ duyệt.";
        },
        /**
         * Tạo nghiệp vụ `createVehicleFailure` (create vehicle failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createVehicleFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createVehicleFailure: (state, action) => {
            state.vehicles.saving = false;
            state.vehicles.error = action.payload;
        },

        /**
         * Thực hiện nghiệp vụ `approveVehicleRequest` (approve vehicle request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function approveVehicleRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        approveVehicleRequest: (state, action) => {
            state.vehicles.updatingId = action.payload.id;
            state.vehicles.error = null;
            state.notice = null;
        },
        /**
         * Thực hiện nghiệp vụ `approveVehicleSuccess` (approve vehicle success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function approveVehicleSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        approveVehicleSuccess: (state, action) => {
            state.vehicles.updatingId = null;
            state.vehicles.all = upsertById(state.vehicles.all, action.payload);
            state.notice = "Đã duyệt xe.";
        },
        /**
         * Thực hiện nghiệp vụ `approveVehicleFailure` (approve vehicle failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function approveVehicleFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        approveVehicleFailure: (state, action) => {
            state.vehicles.updatingId = null;
            state.vehicles.error = action.payload;
        },

        /**
         * Thực hiện nghiệp vụ `rejectVehicleRequest` (reject vehicle request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function rejectVehicleRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        rejectVehicleRequest: (state, action) => {
            state.vehicles.updatingId = action.payload.id;
            state.vehicles.error = null;
            state.notice = null;
        },
        /**
         * Thực hiện nghiệp vụ `rejectVehicleSuccess` (reject vehicle success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function rejectVehicleSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        rejectVehicleSuccess: (state, action) => {
            state.vehicles.updatingId = null;
            state.vehicles.all = upsertById(state.vehicles.all, action.payload);
            state.notice = "Đã từ chối xe.";
        },
        /**
         * Thực hiện nghiệp vụ `rejectVehicleFailure` (reject vehicle failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function rejectVehicleFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        rejectVehicleFailure: (state, action) => {
            state.vehicles.updatingId = null;
            state.vehicles.error = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchPricingPoliciesRequest` (fetch pricing policies request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchPricingPoliciesRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchPricingPoliciesRequest: (state) => {
            state.pricingPolicies.loading = true;
            state.pricingPolicies.error = null;
        },
        /**
         * Lấy nghiệp vụ `fetchPricingPoliciesSuccess` (fetch pricing policies success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchPricingPoliciesSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchPricingPoliciesSuccess: (state, action) => {
            state.pricingPolicies.loading = false;
            state.pricingPolicies.items = action.payload || [];
        },
        /**
         * Lấy nghiệp vụ `fetchPricingPoliciesFailure` (fetch pricing policies failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchPricingPoliciesFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchPricingPoliciesFailure: (state, action) => {
            state.pricingPolicies.loading = false;
            state.pricingPolicies.error = action.payload;
        },

        /**
         * Cập nhật nghiệp vụ `savePricingPolicyRequest` (save pricing policy request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function savePricingPolicyRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        savePricingPolicyRequest: (state) => {
            state.pricingPolicies.saving = true;
            state.pricingPolicies.error = null;
            state.notice = null;
        },
        /**
         * Cập nhật nghiệp vụ `savePricingPolicySuccess` (save pricing policy success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function savePricingPolicySuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        savePricingPolicySuccess: (state, action) => {
            state.pricingPolicies.saving = false;
            state.pricingPolicies.items = upsertById(
                state.pricingPolicies.items,
                action.payload
            );
            state.notice = "Đã lưu bảng giá.";
        },
        /**
         * Cập nhật nghiệp vụ `savePricingPolicyFailure` (save pricing policy failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function savePricingPolicyFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        savePricingPolicyFailure: (state, action) => {
            state.pricingPolicies.saving = false;
            state.pricingPolicies.error = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchPackagePlansRequest` (fetch package plans request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchPackagePlansRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchPackagePlansRequest: (state) => {
            state.packagePlans.loading = true;
            state.packagePlans.error = null;
        },
        /**
         * Lấy nghiệp vụ `fetchPackagePlansSuccess` (fetch package plans success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchPackagePlansSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchPackagePlansSuccess: (state, action) => {
            state.packagePlans.loading = false;
            state.packagePlans.items = action.payload || [];
        },
        /**
         * Lấy nghiệp vụ `fetchPackagePlansFailure` (fetch package plans failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchPackagePlansFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchPackagePlansFailure: (state, action) => {
            state.packagePlans.loading = false;
            state.packagePlans.error = action.payload;
        },

        /**
         * Cập nhật nghiệp vụ `savePackagePlanRequest` (save package plan request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function savePackagePlanRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        savePackagePlanRequest: (state) => {
            state.packagePlans.saving = true;
            state.packagePlans.error = null;
            state.notice = null;
        },
        /**
         * Cập nhật nghiệp vụ `savePackagePlanSuccess` (save package plan success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function savePackagePlanSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        savePackagePlanSuccess: (state, action) => {
            state.packagePlans.saving = false;
            state.packagePlans.items = upsertById(state.packagePlans.items, action.payload);
            state.notice = "Đã lưu gói tháng.";
        },
        /**
         * Cập nhật nghiệp vụ `savePackagePlanFailure` (save package plan failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function savePackagePlanFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        savePackagePlanFailure: (state, action) => {
            state.packagePlans.saving = false;
            state.packagePlans.error = action.payload;
        },

        /**
         * Thực hiện nghiệp vụ `deactivatePackagePlanRequest` (deactivate package plan request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function deactivatePackagePlanRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        deactivatePackagePlanRequest: (state, action) => {
            state.packagePlans.deletingId = action.payload.id;
            state.packagePlans.error = null;
            state.notice = null;
        },
        /**
         * Thực hiện nghiệp vụ `deactivatePackagePlanSuccess` (deactivate package plan success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function deactivatePackagePlanSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        deactivatePackagePlanSuccess: (state, action) => {
            state.packagePlans.deletingId = null;
            /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
            state.packagePlans.items = state.packagePlans.items.map((item) =>
                String(item.id) === String(action.payload.id)
                    ? { ...item, status: "INACTIVE" }
                    : item
            );
            state.notice = "Đã ngưng gói tháng.";
        },
        /**
         * Thực hiện nghiệp vụ `deactivatePackagePlanFailure` (deactivate package plan failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function deactivatePackagePlanFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        deactivatePackagePlanFailure: (state, action) => {
            state.packagePlans.deletingId = null;
            state.packagePlans.error = action.payload;
        },

        /**
         * Thực hiện nghiệp vụ `buyPackagePlanRequest` (buy package plan request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function buyPackagePlanRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        buyPackagePlanRequest: (state, action) => {
            state.packagePlans.buyingId = action.payload.id;
            state.packagePlans.purchaseResult = null;
            state.packagePlans.error = null;
            state.notice = null;
        },
        /**
         * Thực hiện nghiệp vụ `buyPackagePlanSuccess` (buy package plan success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function buyPackagePlanSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        buyPackagePlanSuccess: (state, action) => {
            state.packagePlans.buyingId = null;
            state.packagePlans.purchaseResult = action.payload;
            state.notice = "Đã tạo yêu cầu thanh toán gói tháng.";
        },
        /**
         * Thực hiện nghiệp vụ `buyPackagePlanFailure` (buy package plan failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function buyPackagePlanFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        buyPackagePlanFailure: (state, action) => {
            state.packagePlans.buyingId = null;
            state.packagePlans.error = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchMonthlyPassesRequest` (fetch monthly passes request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMonthlyPassesRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMonthlyPassesRequest: (state) => {
            state.monthlyPasses.loading = true;
            state.monthlyPasses.error = null;
        },
        /**
         * Lấy nghiệp vụ `fetchMonthlyPassesSuccess` (fetch monthly passes success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMonthlyPassesSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMonthlyPassesSuccess: (state, action) => {
            state.monthlyPasses.loading = false;
            state.monthlyPasses.items = action.payload || [];
        },
        /**
         * Lấy nghiệp vụ `fetchMonthlyPassesFailure` (fetch monthly passes failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMonthlyPassesFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMonthlyPassesFailure: (state, action) => {
            state.monthlyPasses.loading = false;
            state.monthlyPasses.error = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchMyMonthlyPassesRequest` (fetch my monthly passes request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyMonthlyPassesRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyMonthlyPassesRequest: (state) => {
            state.monthlyPasses.loading = true;
            state.monthlyPasses.error = null;
        },
        /**
         * Lấy nghiệp vụ `fetchMyMonthlyPassesSuccess` (fetch my monthly passes success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyMonthlyPassesSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyMonthlyPassesSuccess: (state, action) => {
            state.monthlyPasses.loading = false;
            state.monthlyPasses.mine = action.payload || [];
        },
        /**
         * Lấy nghiệp vụ `fetchMyMonthlyPassesFailure` (fetch my monthly passes failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyMonthlyPassesFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyMonthlyPassesFailure: (state, action) => {
            state.monthlyPasses.loading = false;
            state.monthlyPasses.error = action.payload;
        },

        /**
         * Tạo nghiệp vụ `createMonthlyPassRequest` (create monthly pass request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createMonthlyPassRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createMonthlyPassRequest: (state) => {
            state.monthlyPasses.saving = true;
            state.monthlyPasses.error = null;
            state.notice = null;
        },
        /**
         * Tạo nghiệp vụ `createMonthlyPassSuccess` (create monthly pass success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createMonthlyPassSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createMonthlyPassSuccess: (state, action) => {
            state.monthlyPasses.saving = false;
            state.monthlyPasses.items = upsertById(state.monthlyPasses.items, action.payload);
            state.notice = "Đã tạo thẻ tháng.";
        },
        /**
         * Tạo nghiệp vụ `createMonthlyPassFailure` (create monthly pass failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createMonthlyPassFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createMonthlyPassFailure: (state, action) => {
            state.monthlyPasses.saving = false;
            state.monthlyPasses.error = action.payload;
        },

        /**
         * Thực hiện nghiệp vụ `continueMonthlyPassPaymentRequest` (continue monthly pass payment request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function continueMonthlyPassPaymentRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        continueMonthlyPassPaymentRequest: (state, action) => {
            state.monthlyPasses.payingId = action.payload.id;
            state.monthlyPasses.error = null;
            state.notice = null;
        },
        /**
         * Thực hiện nghiệp vụ `continueMonthlyPassPaymentSuccess` (continue monthly pass payment success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function continueMonthlyPassPaymentSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        continueMonthlyPassPaymentSuccess: (state, action) => {
            state.monthlyPasses.payingId = null;
            const pass = action.payload?.monthlyPass || action.payload;
            state.monthlyPasses.mine = upsertById(state.monthlyPasses.mine, pass);
            state.monthlyPasses.items = upsertById(state.monthlyPasses.items, pass);
            state.notice = "Đã mở lại yêu cầu thanh toán.";
        },
        /**
         * Thực hiện nghiệp vụ `continueMonthlyPassPaymentFailure` (continue monthly pass payment failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function continueMonthlyPassPaymentFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        continueMonthlyPassPaymentFailure: (state, action) => {
            state.monthlyPasses.payingId = null;
            state.monthlyPasses.error = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchTempQrCardsRequest` (fetch temp qr cards request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchTempQrCardsRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchTempQrCardsRequest: (state, action) => {
            if (!action.payload?.silent) {
                state.tempQrCards.loading = true;
                state.tempQrCards.error = null;
            }
        },
        /**
         * Lấy nghiệp vụ `fetchTempQrCardsSuccess` (fetch temp qr cards success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchTempQrCardsSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchTempQrCardsSuccess: (state, action) => {
            const { items, silent } = readCollectionSyncPayload(action.payload);

            if (!silent) {
                state.tempQrCards.loading = false;
            }
            state.tempQrCards.items = reconcileCollectionById(
                state.tempQrCards.items,
                items
            );
        },
        /**
         * Lấy nghiệp vụ `fetchTempQrCardsFailure` (fetch temp qr cards failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchTempQrCardsFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchTempQrCardsFailure: (state, action) => {
            const payload = readSyncFailure(action.payload);

            if (!payload.silent) {
                state.tempQrCards.loading = false;
                state.tempQrCards.error = payload.error;
            }
        },

        /**
         * Tạo nghiệp vụ `createTempQrCardRequest` (create temp qr card request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createTempQrCardRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createTempQrCardRequest: (state) => {
            state.tempQrCards.saving = true;
            state.tempQrCards.error = null;
            state.notice = null;
        },
        /**
         * Tạo nghiệp vụ `createTempQrCardSuccess` (create temp qr card success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createTempQrCardSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createTempQrCardSuccess: (state, action) => {
            state.tempQrCards.saving = false;
            const createdCards = Array.isArray(action.payload)
                ? action.payload
                : [action.payload].filter(Boolean);

            /* Callback nội bộ của lời gọi `forEach`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
            createdCards.forEach((card) => {
                state.tempQrCards.items = upsertById(state.tempQrCards.items, card);
            });
            state.notice =
                createdCards.length > 1
                    ? `Đã tạo ${createdCards.length} thẻ QR tạm.`
                    : "Đã thêm thẻ QR tạm.";
        },
        /**
         * Tạo nghiệp vụ `createTempQrCardFailure` (create temp qr card failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createTempQrCardFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createTempQrCardFailure: (state, action) => {
            state.tempQrCards.saving = false;
            state.tempQrCards.error = action.payload;
        },

        /**
         * Cập nhật nghiệp vụ `updateTempQrCardStatusRequest` (update temp qr card status request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateTempQrCardStatusRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateTempQrCardStatusRequest: (state, action) => {
            state.tempQrCards.updatingId = action.payload.id;
            state.tempQrCards.error = null;
            state.notice = null;
        },
        /**
         * Cập nhật nghiệp vụ `updateTempQrCardStatusSuccess` (update temp qr card status success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateTempQrCardStatusSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateTempQrCardStatusSuccess: (state, action) => {
            state.tempQrCards.updatingId = null;
            state.tempQrCards.items = upsertById(state.tempQrCards.items, action.payload);
            state.notice = "Đã cập nhật thẻ QR tạm.";
        },
        /**
         * Cập nhật nghiệp vụ `updateTempQrCardStatusFailure` (update temp qr card status failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateTempQrCardStatusFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateTempQrCardStatusFailure: (state, action) => {
            state.tempQrCards.updatingId = null;
            state.tempQrCards.error = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchMyQrPassesRequest` (fetch my qr passes request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyQrPassesRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyQrPassesRequest: (state) => {
            state.qrPasses.loading = true;
            state.qrPasses.error = null;
        },
        /**
         * Lấy nghiệp vụ `fetchMyQrPassesSuccess` (fetch my qr passes success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyQrPassesSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyQrPassesSuccess: (state, action) => {
            state.qrPasses.loading = false;
            state.qrPasses.mine = action.payload || [];
        },
        /**
         * Lấy nghiệp vụ `fetchMyQrPassesFailure` (fetch my qr passes failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyQrPassesFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyQrPassesFailure: (state, action) => {
            state.qrPasses.loading = false;
            state.qrPasses.error = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchQrPassesRequest` (fetch qr passes request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchQrPassesRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchQrPassesRequest: (state) => {
            state.qrPasses.loading = true;
            state.qrPasses.error = null;
        },
        /**
         * Lấy nghiệp vụ `fetchQrPassesSuccess` (fetch qr passes success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchQrPassesSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchQrPassesSuccess: (state, action) => {
            state.qrPasses.loading = false;
            state.qrPasses.items = action.payload || [];
        },
        /**
         * Lấy nghiệp vụ `fetchQrPassesFailure` (fetch qr passes failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchQrPassesFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchQrPassesFailure: (state, action) => {
            state.qrPasses.loading = false;
            state.qrPasses.error = action.payload;
        },

        /**
         * Kiểm tra nghiệp vụ `validateQrPassRequest` (validate qr pass request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function validateQrPassRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        validateQrPassRequest: (state) => {
            state.qrPasses.validating = true;
            state.qrPasses.validation = null;
            state.qrPasses.error = null;
        },
        /**
         * Kiểm tra nghiệp vụ `validateQrPassSuccess` (validate qr pass success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function validateQrPassSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        validateQrPassSuccess: (state, action) => {
            state.qrPasses.validating = false;
            state.qrPasses.validation = action.payload;
        },
        /**
         * Kiểm tra nghiệp vụ `validateQrPassFailure` (validate qr pass failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function validateQrPassFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        validateQrPassFailure: (state, action) => {
            state.qrPasses.validating = false;
            state.qrPasses.error = action.payload;
        },

        /**
         * Cập nhật nghiệp vụ `updateQrPassStatusRequest` (update qr pass status request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateQrPassStatusRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateQrPassStatusRequest: (state, action) => {
            state.qrPasses.updatingId = action.payload.id;
            state.qrPasses.error = null;
            state.notice = null;
        },
        /**
         * Cập nhật nghiệp vụ `updateQrPassStatusSuccess` (update qr pass status success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateQrPassStatusSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateQrPassStatusSuccess: (state, action) => {
            state.qrPasses.updatingId = null;
            state.qrPasses.items = upsertById(state.qrPasses.items, action.payload);
            state.qrPasses.mine = upsertById(state.qrPasses.mine, action.payload);
            state.notice = "Đã cập nhật mã QR.";
        },
        /**
         * Cập nhật nghiệp vụ `updateQrPassStatusFailure` (update qr pass status failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateQrPassStatusFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateQrPassStatusFailure: (state, action) => {
            state.qrPasses.updatingId = null;
            state.qrPasses.error = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchMySlotRegistrationsRequest` (fetch my slot registrations request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMySlotRegistrationsRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMySlotRegistrationsRequest: (state) => {
            state.slotRegistrations.loading = true;
            state.slotRegistrations.error = null;
        },
        /**
         * Lấy nghiệp vụ `fetchMySlotRegistrationsSuccess` (fetch my slot registrations success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMySlotRegistrationsSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMySlotRegistrationsSuccess: (state, action) => {
            state.slotRegistrations.loading = false;
            state.slotRegistrations.mine = action.payload || [];
        },
        /**
         * Lấy nghiệp vụ `fetchMySlotRegistrationsFailure` (fetch my slot registrations failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMySlotRegistrationsFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMySlotRegistrationsFailure: (state, action) => {
            state.slotRegistrations.loading = false;
            state.slotRegistrations.error = action.payload;
        },

        /**
         * Tạo nghiệp vụ `createSlotRegistrationRequest` (create slot registration request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createSlotRegistrationRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createSlotRegistrationRequest: (state) => {
            state.slotRegistrations.creating = true;
            state.slotRegistrations.error = null;
            state.slotRegistrations.lastCreated = null;
            state.notice = null;
        },
        /**
         * Tạo nghiệp vụ `createSlotRegistrationSuccess` (create slot registration success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createSlotRegistrationSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createSlotRegistrationSuccess: (state, action) => {
            state.slotRegistrations.creating = false;
            state.slotRegistrations.lastCreated = action.payload;
            state.slotRegistrations.mine = upsertById(
                state.slotRegistrations.mine,
                action.payload
            );
            state.notice = "Đã tạo yêu cầu giữ ô đỗ.";
        },
        /**
         * Tạo nghiệp vụ `createSlotRegistrationFailure` (create slot registration failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createSlotRegistrationFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createSlotRegistrationFailure: (state, action) => {
            state.slotRegistrations.creating = false;
            state.slotRegistrations.error = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchHourlyReservationAvailabilityRequest` (fetch hourly reservation availability request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchHourlyReservationAvailabilityRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchHourlyReservationAvailabilityRequest: (state) => {
            state.hourlyReservations.availabilityLoading = true;
            state.hourlyReservations.error = null;
            state.hourlyReservations.availability = {
                buildingId: null,
                startAt: null,
                endAt: null,
                quote: null,
                slots: [],
            };
        },
        /**
         * Lấy nghiệp vụ `fetchHourlyReservationAvailabilitySuccess` (fetch hourly reservation availability success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchHourlyReservationAvailabilitySuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchHourlyReservationAvailabilitySuccess: (state, action) => {
            state.hourlyReservations.availabilityLoading = false;
            state.hourlyReservations.availability = {
                buildingId: action.payload?.buildingId || null,
                startAt: action.payload?.startAt || null,
                endAt: action.payload?.endAt || null,
                quote: action.payload?.quote || null,
                slots: Array.isArray(action.payload?.slots)
                    ? action.payload.slots
                    : [],
            };
        },
        /**
         * Lấy nghiệp vụ `fetchHourlyReservationAvailabilityFailure` (fetch hourly reservation availability failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchHourlyReservationAvailabilityFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchHourlyReservationAvailabilityFailure: (state, action) => {
            state.hourlyReservations.availabilityLoading = false;
            state.hourlyReservations.error = action.payload;
        },
        /**
         * Lấy nghiệp vụ `fetchMyHourlyReservationsRequest` (fetch my hourly reservations request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyHourlyReservationsRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyHourlyReservationsRequest: (state) => {
            state.hourlyReservations.listLoading = true;
            state.hourlyReservations.error = null;
        },
        /**
         * Lấy nghiệp vụ `fetchMyHourlyReservationsSuccess` (fetch my hourly reservations success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyHourlyReservationsSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyHourlyReservationsSuccess: (state, action) => {
            state.hourlyReservations.listLoading = false;
            state.hourlyReservations.mine = action.payload || [];
        },
        /**
         * Lấy nghiệp vụ `fetchMyHourlyReservationsFailure` (fetch my hourly reservations failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyHourlyReservationsFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyHourlyReservationsFailure: (state, action) => {
            state.hourlyReservations.listLoading = false;
            state.hourlyReservations.error = action.payload;
        },
        /**
         * Lấy nghiệp vụ `fetchStaffHourlyReservationsRequest` (fetch staff hourly reservations request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchStaffHourlyReservationsRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchStaffHourlyReservationsRequest: (state) => {
            state.hourlyReservations.listLoading = true;
            state.hourlyReservations.error = null;
        },
        /**
         * Lấy nghiệp vụ `fetchStaffHourlyReservationsSuccess` (fetch staff hourly reservations success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchStaffHourlyReservationsSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchStaffHourlyReservationsSuccess: (state, action) => {
            state.hourlyReservations.listLoading = false;
            state.hourlyReservations.staffItems = action.payload || [];
        },
        /**
         * Lấy nghiệp vụ `fetchStaffHourlyReservationsFailure` (fetch staff hourly reservations failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchStaffHourlyReservationsFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchStaffHourlyReservationsFailure: (state, action) => {
            state.hourlyReservations.listLoading = false;
            state.hourlyReservations.error = action.payload;
        },
        /**
         * Lấy nghiệp vụ `fetchHourlyCheckInMatchRequest` (fetch hourly check in match request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchHourlyCheckInMatchRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchHourlyCheckInMatchRequest: (state) => {
            state.hourlyReservations.matchingCheckIn = true;
            state.hourlyReservations.checkInMatch = null;
        },
        /**
         * Lấy nghiệp vụ `fetchHourlyCheckInMatchSuccess` (fetch hourly check in match success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchHourlyCheckInMatchSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchHourlyCheckInMatchSuccess: (state, action) => {
            state.hourlyReservations.matchingCheckIn = false;
            state.hourlyReservations.checkInMatch = action.payload || null;
        },
        /**
         * Lấy nghiệp vụ `fetchHourlyCheckInMatchFailure` (fetch hourly check in match failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchHourlyCheckInMatchFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchHourlyCheckInMatchFailure: (state) => {
            state.hourlyReservations.matchingCheckIn = false;
            state.hourlyReservations.checkInMatch = null;
        },
        /**
         * Xóa hoặc đặt lại nghiệp vụ `clearHourlyCheckInMatch` (clear hourly check in match). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function clearHourlyCheckInMatch
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        clearHourlyCheckInMatch: (state) => {
            state.hourlyReservations.matchingCheckIn = false;
            state.hourlyReservations.checkInMatch = null;
        },
        /**
         * Tạo nghiệp vụ `createUserHourlyReservationRequest` (create user hourly reservation request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createUserHourlyReservationRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createUserHourlyReservationRequest: (state) => {
            state.hourlyReservations.creatingUser = true;
            state.hourlyReservations.lastCreated = null;
            state.hourlyReservations.error = null;
            state.notice = null;
        },
        /**
         * Tạo nghiệp vụ `createUserHourlyReservationSuccess` (create user hourly reservation success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createUserHourlyReservationSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createUserHourlyReservationSuccess: (state, action) => {
            const reservation = action.payload?.reservation || action.payload;

            state.hourlyReservations.creatingUser = false;
            state.hourlyReservations.lastCreated = action.payload;
            state.hourlyReservations.mine = upsertById(
                state.hourlyReservations.mine,
                reservation
            );
            state.notice =
                "Đã tạo lượt đặt ô. Vui lòng hoàn tất thanh toán VNPay để giữ chỗ.";
        },
        /**
         * Tạo nghiệp vụ `createUserHourlyReservationFailure` (create user hourly reservation failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createUserHourlyReservationFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createUserHourlyReservationFailure: (state, action) => {
            state.hourlyReservations.creatingUser = false;
            state.hourlyReservations.error = action.payload;
        },
        /**
         * Tạo nghiệp vụ `createGuestHourlyReservationRequest` (create guest hourly reservation request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createGuestHourlyReservationRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createGuestHourlyReservationRequest: (state) => {
            state.hourlyReservations.creatingGuest = true;
            state.hourlyReservations.lastCreated = null;
            state.hourlyReservations.error = null;
            state.notice = null;
        },
        /**
         * Tạo nghiệp vụ `createGuestHourlyReservationSuccess` (create guest hourly reservation success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createGuestHourlyReservationSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createGuestHourlyReservationSuccess: (state, action) => {
            const reservation = action.payload?.reservation || action.payload;

            state.hourlyReservations.creatingGuest = false;
            state.hourlyReservations.lastCreated = action.payload;
            state.hourlyReservations.staffItems = upsertById(
                state.hourlyReservations.staffItems,
                reservation
            );
            state.notice =
                reservation?.paymentMethod === "CASH"
                    ? "Đã thu tiền mặt và giữ ô cho khách."
                    : "Đã tạo lượt đặt ô và chuyển sang VNPay.";
        },
        /**
         * Tạo nghiệp vụ `createGuestHourlyReservationFailure` (create guest hourly reservation failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createGuestHourlyReservationFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createGuestHourlyReservationFailure: (state, action) => {
            state.hourlyReservations.creatingGuest = false;
            state.hourlyReservations.error = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchMyNotificationsRequest` (fetch my notifications request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyNotificationsRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyNotificationsRequest: (state) => {
            state.notifications.loading = true;
            state.notifications.error = null;
        },
        /**
         * Lấy nghiệp vụ `fetchMyNotificationsSuccess` (fetch my notifications success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyNotificationsSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyNotificationsSuccess: (state, action) => {
            state.notifications.loading = false;
            state.notifications.mine = action.payload || [];
        },
        /**
         * Lấy nghiệp vụ `fetchMyNotificationsFailure` (fetch my notifications failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyNotificationsFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyNotificationsFailure: (state, action) => {
            state.notifications.loading = false;
            state.notifications.error = action.payload;
        },
        /**
         * Thực hiện nghiệp vụ `markNotificationReadRequest` (mark notification read request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function markNotificationReadRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        markNotificationReadRequest: (state, action) => {
            state.notifications.updatingId = action.payload.id;
            state.notifications.error = null;
        },
        /**
         * Thực hiện nghiệp vụ `markNotificationReadSuccess` (mark notification read success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function markNotificationReadSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        markNotificationReadSuccess: (state, action) => {
            state.notifications.updatingId = null;
            state.notifications.mine = upsertById(
                state.notifications.mine,
                action.payload
            );
        },
        /**
         * Thực hiện nghiệp vụ `markNotificationReadFailure` (mark notification read failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function markNotificationReadFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        markNotificationReadFailure: (state, action) => {
            state.notifications.updatingId = null;
            state.notifications.error = action.payload;
        },
        /**
         * Thực hiện nghiệp vụ `markAllNotificationsReadRequest` (mark all notifications read request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function markAllNotificationsReadRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        markAllNotificationsReadRequest: (state) => {
            state.notifications.markingAll = true;
            state.notifications.error = null;
        },
        /**
         * Thực hiện nghiệp vụ `markAllNotificationsReadSuccess` (mark all notifications read success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function markAllNotificationsReadSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        markAllNotificationsReadSuccess: (state) => {
            state.notifications.markingAll = false;
            /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
            state.notifications.mine = state.notifications.mine.map((item) => ({
                ...item,
                status: item.status === "UNREAD" ? "READ" : item.status,
            }));
        },
        /**
         * Thực hiện nghiệp vụ `markAllNotificationsReadFailure` (mark all notifications read failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function markAllNotificationsReadFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        markAllNotificationsReadFailure: (state, action) => {
            state.notifications.markingAll = false;
            state.notifications.error = action.payload;
        },
        /**
         * Lấy nghiệp vụ `fetchNotificationPreferencesRequest` (fetch notification preferences request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchNotificationPreferencesRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchNotificationPreferencesRequest: (state) => {
            state.notifications.preferences.loading = true;
            state.notifications.preferences.error = null;
        },
        /**
         * Lấy nghiệp vụ `fetchNotificationPreferencesSuccess` (fetch notification preferences success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchNotificationPreferencesSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchNotificationPreferencesSuccess: (state, action) => {
            state.notifications.preferences.loading = false;
            state.notifications.preferences.emailNotificationsEnabled =
                action.payload?.emailNotificationsEnabled !== false;
        },
        /**
         * Lấy nghiệp vụ `fetchNotificationPreferencesFailure` (fetch notification preferences failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchNotificationPreferencesFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchNotificationPreferencesFailure: (state, action) => {
            state.notifications.preferences.loading = false;
            state.notifications.preferences.error = action.payload;
        },
        /**
         * Cập nhật nghiệp vụ `updateNotificationPreferencesRequest` (update notification preferences request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateNotificationPreferencesRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateNotificationPreferencesRequest: (state, action) => {
            state.notifications.preferences.saving = true;
            state.notifications.preferences.error = null;
            state.notifications.preferences.emailNotificationsEnabled =
                action.payload?.emailNotificationsEnabled !== false;
        },
        /**
         * Cập nhật nghiệp vụ `updateNotificationPreferencesSuccess` (update notification preferences success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateNotificationPreferencesSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateNotificationPreferencesSuccess: (state, action) => {
            state.notifications.preferences.saving = false;
            state.notifications.preferences.emailNotificationsEnabled =
                action.payload?.emailNotificationsEnabled !== false;
        },
        /**
         * Cập nhật nghiệp vụ `updateNotificationPreferencesFailure` (update notification preferences failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateNotificationPreferencesFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateNotificationPreferencesFailure: (state, action) => {
            state.notifications.preferences.saving = false;
            state.notifications.preferences.error = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchStaffAssignmentsRequest` (fetch staff assignments request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchStaffAssignmentsRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchStaffAssignmentsRequest: (state) => {
            state.staffAssignments.loading = true;
            state.staffAssignments.error = null;
        },
        /**
         * Lấy nghiệp vụ `fetchStaffAssignmentsSuccess` (fetch staff assignments success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchStaffAssignmentsSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchStaffAssignmentsSuccess: (state, action) => {
            const payload = action.payload || {};

            state.staffAssignments.loading = false;
            state.staffAssignments.building = payload.building || null;
            state.staffAssignments.items =
                payload.staff || payload.users || (Array.isArray(payload) ? payload : []);
        },
        /**
         * Lấy nghiệp vụ `fetchStaffAssignmentsFailure` (fetch staff assignments failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchStaffAssignmentsFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchStaffAssignmentsFailure: (state, action) => {
            state.staffAssignments.loading = false;
            state.staffAssignments.error = action.payload;
        },
        /**
         * Cập nhật nghiệp vụ `assignStaffToBuildingRequest` (assign staff to building request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function assignStaffToBuildingRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        assignStaffToBuildingRequest: (state, action) => {
            state.staffAssignments.assigningId = action.payload.id;
            state.staffAssignments.error = null;
            state.notice = null;
        },
        /**
         * Cập nhật nghiệp vụ `assignStaffToBuildingSuccess` (assign staff to building success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function assignStaffToBuildingSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        assignStaffToBuildingSuccess: (state, action) => {
            state.staffAssignments.assigningId = null;
            state.staffAssignments.items = upsertById(
                state.staffAssignments.items,
                action.payload
            );
            state.notice = "Đã gán nhân viên vào tòa nhà.";
        },
        /**
         * Cập nhật nghiệp vụ `assignStaffToBuildingFailure` (assign staff to building failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function assignStaffToBuildingFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        assignStaffToBuildingFailure: (state, action) => {
            state.staffAssignments.assigningId = null;
            state.staffAssignments.error = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchWrongSlotCasesRequest` (fetch wrong slot cases request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchWrongSlotCasesRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchWrongSlotCasesRequest: (state, action) => {
            if (!action.payload?.silent) {
                state.wrongSlotCases.loading = true;
                state.wrongSlotCases.error = null;
            }
        },
        /**
         * Lấy nghiệp vụ `fetchWrongSlotCasesSuccess` (fetch wrong slot cases success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchWrongSlotCasesSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchWrongSlotCasesSuccess: (state, action) => {
            const { items, silent } = readCollectionSyncPayload(action.payload);

            if (!silent) {
                state.wrongSlotCases.loading = false;
            }
            state.wrongSlotCases.items = reconcileCollectionById(
                state.wrongSlotCases.items,
                items
            );
        },
        /**
         * Lấy nghiệp vụ `fetchWrongSlotCasesFailure` (fetch wrong slot cases failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchWrongSlotCasesFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchWrongSlotCasesFailure: (state, action) => {
            const payload = readSyncFailure(action.payload);

            if (!payload.silent) {
                state.wrongSlotCases.loading = false;
                state.wrongSlotCases.error = payload.error;
            }
        },
        /**
         * Lấy nghiệp vụ `fetchMyWrongSlotCasesRequest` (fetch my wrong slot cases request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyWrongSlotCasesRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyWrongSlotCasesRequest: (state, action) => {
            if (!action.payload?.silent) {
                state.wrongSlotCases.loading = true;
                state.wrongSlotCases.error = null;
            }
        },
        /**
         * Lấy nghiệp vụ `fetchMyWrongSlotCasesSuccess` (fetch my wrong slot cases success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyWrongSlotCasesSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyWrongSlotCasesSuccess: (state, action) => {
            const { items, silent } = readCollectionSyncPayload(action.payload);

            if (!silent) {
                state.wrongSlotCases.loading = false;
            }
            state.wrongSlotCases.myItems = reconcileCollectionById(
                state.wrongSlotCases.myItems,
                items
            );
        },
        /**
         * Lấy nghiệp vụ `fetchMyWrongSlotCasesFailure` (fetch my wrong slot cases failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyWrongSlotCasesFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyWrongSlotCasesFailure: (state, action) => {
            const payload = readSyncFailure(action.payload);

            if (!payload.silent) {
                state.wrongSlotCases.loading = false;
                state.wrongSlotCases.error = payload.error;
            }
        },
        /**
         * Thực hiện nghiệp vụ `reportWrongSlotRequest` (report wrong slot request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function reportWrongSlotRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        reportWrongSlotRequest: (state) => {
            state.wrongSlotCases.reporting = true;
            state.wrongSlotCases.error = null;
            state.wrongSlotCases.lastCase = null;
            state.notice = null;
        },
        /**
         * Thực hiện nghiệp vụ `reportWrongSlotSuccess` (report wrong slot success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function reportWrongSlotSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        reportWrongSlotSuccess: (state, action) => {
            state.wrongSlotCases.reporting = false;
            state.wrongSlotCases.lastCase = action.payload;
            state.wrongSlotCases.items = upsertById(state.wrongSlotCases.items, action.payload);
            state.notice =
                action.payload?.status === "ALLOWED"
                    ? "Slot chưa được đặt trước, xe được phép đậu tại đó và không phát sinh phí."
                    : "Đã gửi thông báo yêu cầu dời xe trong 15 phút.";
        },
        /**
         * Thực hiện nghiệp vụ `reportWrongSlotFailure` (report wrong slot failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function reportWrongSlotFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        reportWrongSlotFailure: (state, action) => {
            state.wrongSlotCases.reporting = false;
            state.wrongSlotCases.error = action.payload;
        },
        /**
         * Xử lý nghiệp vụ `confirmWrongSlotRequest` (confirm wrong slot request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function confirmWrongSlotRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        confirmWrongSlotRequest: (state, action) => {
            state.wrongSlotCases.confirmingId = action.payload.id;
            state.wrongSlotCases.error = null;
            state.notice = null;
        },
        /**
         * Xử lý nghiệp vụ `confirmWrongSlotSuccess` (confirm wrong slot success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function confirmWrongSlotSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        confirmWrongSlotSuccess: (state, action) => {
            state.wrongSlotCases.confirmingId = null;
            state.wrongSlotCases.items = upsertById(state.wrongSlotCases.items, action.payload);
            state.notice = "Đã xác nhận quá hạn dời xe và ghi nhận phí vi phạm.";
        },
        /**
         * Xử lý nghiệp vụ `confirmWrongSlotFailure` (confirm wrong slot failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function confirmWrongSlotFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        confirmWrongSlotFailure: (state, action) => {
            state.wrongSlotCases.confirmingId = null;
            state.wrongSlotCases.error = action.payload;
        },
        /**
         * Thực hiện nghiệp vụ `markWrongSlotMovedRequest` (mark wrong slot moved request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function markWrongSlotMovedRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        markWrongSlotMovedRequest: (state, action) => {
            state.wrongSlotCases.movingId = action.payload.id;
            state.wrongSlotCases.error = null;
            state.notice = null;
        },
        /**
         * Thực hiện nghiệp vụ `markWrongSlotMovedSuccess` (mark wrong slot moved success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function markWrongSlotMovedSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        markWrongSlotMovedSuccess: (state, action) => {
            state.wrongSlotCases.movingId = null;
            state.wrongSlotCases.items = upsertById(
                state.wrongSlotCases.items,
                action.payload
            );
            state.notice = "Đã xác nhận xe được dời đúng hạn và không phát sinh phí.";
        },
        /**
         * Thực hiện nghiệp vụ `markWrongSlotMovedFailure` (mark wrong slot moved failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function markWrongSlotMovedFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        markWrongSlotMovedFailure: (state, action) => {
            state.wrongSlotCases.movingId = null;
            state.wrongSlotCases.error = action.payload;
        },
        /**
         * Thực hiện nghiệp vụ `markMyWrongSlotMovedRequest` (mark my wrong slot moved request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function markMyWrongSlotMovedRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        markMyWrongSlotMovedRequest: (state, action) => {
            state.wrongSlotCases.movingId = action.payload.id;
            state.wrongSlotCases.error = null;
            state.notice = null;
        },
        /**
         * Thực hiện nghiệp vụ `markMyWrongSlotMovedSuccess` (mark my wrong slot moved success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function markMyWrongSlotMovedSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        markMyWrongSlotMovedSuccess: (state, action) => {
            state.wrongSlotCases.movingId = null;
            state.wrongSlotCases.myItems = upsertById(
                state.wrongSlotCases.myItems,
                action.payload
            );
            state.notice = "Đã xác nhận xe được dời trước thời hạn.";
        },
        /**
         * Thực hiện nghiệp vụ `markMyWrongSlotMovedFailure` (mark my wrong slot moved failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function markMyWrongSlotMovedFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        markMyWrongSlotMovedFailure: (state, action) => {
            state.wrongSlotCases.movingId = null;
            state.wrongSlotCases.error = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchFloorMismatchCasesRequest` (fetch floor mismatch cases request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchFloorMismatchCasesRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchFloorMismatchCasesRequest: (state, action) => {
            if (!action.payload?.silent) {
                state.floorMismatchCases.loading = true;
                state.floorMismatchCases.error = null;
            }
        },
        /**
         * Lấy nghiệp vụ `fetchFloorMismatchCasesSuccess` (fetch floor mismatch cases success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchFloorMismatchCasesSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchFloorMismatchCasesSuccess: (state, action) => {
            const { items, silent } = readCollectionSyncPayload(action.payload);

            if (!silent) {
                state.floorMismatchCases.loading = false;
            }
            state.floorMismatchCases.items = reconcileCollectionById(
                state.floorMismatchCases.items,
                items
            );
        },
        /**
         * Lấy nghiệp vụ `fetchFloorMismatchCasesFailure` (fetch floor mismatch cases failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchFloorMismatchCasesFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchFloorMismatchCasesFailure: (state, action) => {
            const payload = readSyncFailure(action.payload);

            if (!payload.silent) {
                state.floorMismatchCases.loading = false;
                state.floorMismatchCases.error = payload.error;
            }
        },
        /**
         * Lấy nghiệp vụ `fetchMyFloorMismatchCasesRequest` (fetch my floor mismatch cases request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyFloorMismatchCasesRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyFloorMismatchCasesRequest: (state, action) => {
            if (!action.payload?.silent) {
                state.floorMismatchCases.loading = true;
                state.floorMismatchCases.error = null;
            }
        },
        /**
         * Lấy nghiệp vụ `fetchMyFloorMismatchCasesSuccess` (fetch my floor mismatch cases success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyFloorMismatchCasesSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyFloorMismatchCasesSuccess: (state, action) => {
            const { items, silent } = readCollectionSyncPayload(action.payload);

            if (!silent) {
                state.floorMismatchCases.loading = false;
            }
            state.floorMismatchCases.myItems = reconcileCollectionById(
                state.floorMismatchCases.myItems,
                items
            );
        },
        /**
         * Lấy nghiệp vụ `fetchMyFloorMismatchCasesFailure` (fetch my floor mismatch cases failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyFloorMismatchCasesFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyFloorMismatchCasesFailure: (state, action) => {
            const payload = readSyncFailure(action.payload);

            if (!payload.silent) {
                state.floorMismatchCases.loading = false;
                state.floorMismatchCases.error = payload.error;
            }
        },
        /**
         * Thực hiện nghiệp vụ `reportFloorMismatchRequest` (report floor mismatch request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function reportFloorMismatchRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        reportFloorMismatchRequest: (state) => {
            state.floorMismatchCases.reporting = true;
            state.floorMismatchCases.error = null;
            state.floorMismatchCases.lastCase = null;
            state.notice = null;
        },
        /**
         * Thực hiện nghiệp vụ `reportFloorMismatchSuccess` (report floor mismatch success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function reportFloorMismatchSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        reportFloorMismatchSuccess: (state, action) => {
            state.floorMismatchCases.reporting = false;
            state.floorMismatchCases.lastCase = action.payload;
            state.floorMismatchCases.items = upsertById(
                state.floorMismatchCases.items,
                action.payload
            );
            state.notice =
                action.payload?.status === "LOCKED_AND_PENALIZED"
                    ? "Đã ghi nhận xe máy vào sai khu, khóa xe và cộng phí vi phạm."
                    : "Đã gửi thông báo yêu cầu dời ô tô trong 15 phút.";
        },
        /**
         * Thực hiện nghiệp vụ `reportFloorMismatchFailure` (report floor mismatch failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function reportFloorMismatchFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        reportFloorMismatchFailure: (state, action) => {
            state.floorMismatchCases.reporting = false;
            state.floorMismatchCases.error = action.payload;
        },
        /**
         * Xử lý nghiệp vụ `confirmFloorMismatchRequest` (confirm floor mismatch request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function confirmFloorMismatchRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        confirmFloorMismatchRequest: (state, action) => {
            state.floorMismatchCases.confirmingId = action.payload.id;
            state.floorMismatchCases.error = null;
            state.notice = null;
        },
        /**
         * Xử lý nghiệp vụ `confirmFloorMismatchSuccess` (confirm floor mismatch success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function confirmFloorMismatchSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        confirmFloorMismatchSuccess: (state, action) => {
            state.floorMismatchCases.confirmingId = null;
            state.floorMismatchCases.items = upsertById(
                state.floorMismatchCases.items,
                action.payload
            );
            state.notice = "Đã xác nhận quá hạn và cộng chi phí xử lý.";
        },
        /**
         * Xử lý nghiệp vụ `confirmFloorMismatchFailure` (confirm floor mismatch failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function confirmFloorMismatchFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        confirmFloorMismatchFailure: (state, action) => {
            state.floorMismatchCases.confirmingId = null;
            state.floorMismatchCases.error = action.payload;
        },
        /**
         * Thực hiện nghiệp vụ `markFloorMismatchMovedRequest` (mark floor mismatch moved request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function markFloorMismatchMovedRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        markFloorMismatchMovedRequest: (state, action) => {
            state.floorMismatchCases.movingId = action.payload.id;
            state.floorMismatchCases.error = null;
            state.notice = null;
        },
        /**
         * Thực hiện nghiệp vụ `markFloorMismatchMovedSuccess` (mark floor mismatch moved success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function markFloorMismatchMovedSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        markFloorMismatchMovedSuccess: (state, action) => {
            state.floorMismatchCases.movingId = null;
            state.floorMismatchCases.items = upsertById(
                state.floorMismatchCases.items,
                action.payload
            );
            state.notice = "Đã xác nhận xe được dời đúng hạn và không phát sinh phí.";
        },
        /**
         * Thực hiện nghiệp vụ `markFloorMismatchMovedFailure` (mark floor mismatch moved failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function markFloorMismatchMovedFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        markFloorMismatchMovedFailure: (state, action) => {
            state.floorMismatchCases.movingId = null;
            state.floorMismatchCases.error = action.payload;
        },
        /**
         * Thực hiện nghiệp vụ `markMyFloorMismatchMovedRequest` (mark my floor mismatch moved request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function markMyFloorMismatchMovedRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        markMyFloorMismatchMovedRequest: (state, action) => {
            state.floorMismatchCases.movingId = action.payload.id;
            state.floorMismatchCases.error = null;
            state.notice = null;
        },
        /**
         * Thực hiện nghiệp vụ `markMyFloorMismatchMovedSuccess` (mark my floor mismatch moved success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function markMyFloorMismatchMovedSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        markMyFloorMismatchMovedSuccess: (state, action) => {
            state.floorMismatchCases.movingId = null;
            state.floorMismatchCases.myItems = upsertById(
                state.floorMismatchCases.myItems,
                action.payload
            );
            state.notice = "Đã xác nhận xe được dời trước thời hạn.";
        },
        /**
         * Thực hiện nghiệp vụ `markMyFloorMismatchMovedFailure` (mark my floor mismatch moved failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function markMyFloorMismatchMovedFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        markMyFloorMismatchMovedFailure: (state, action) => {
            state.floorMismatchCases.movingId = null;
            state.floorMismatchCases.error = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchActiveParkingSessionsRequest` (fetch active parking sessions request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchActiveParkingSessionsRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchActiveParkingSessionsRequest: (state, action) => {
            if (!action.payload?.silent) {
                state.parkingSessions.loading = true;
                state.parkingSessions.error = null;
            }
        },
        /**
         * Lấy nghiệp vụ `fetchActiveParkingSessionsSuccess` (fetch active parking sessions success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchActiveParkingSessionsSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchActiveParkingSessionsSuccess: (state, action) => {
            const { items, silent } = readCollectionSyncPayload(action.payload);

            if (!silent) {
                state.parkingSessions.loading = false;
            }
            state.parkingSessions.active = reconcileCollectionById(
                state.parkingSessions.active,
                items
            );
        },
        /**
         * Lấy nghiệp vụ `fetchActiveParkingSessionsFailure` (fetch active parking sessions failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchActiveParkingSessionsFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchActiveParkingSessionsFailure: (state, action) => {
            const payload = readSyncFailure(action.payload);

            if (!payload.silent) {
                state.parkingSessions.loading = false;
                state.parkingSessions.error = payload.error;
            }
        },

        /**
         * Lấy nghiệp vụ `fetchDailyParkingActivityRequest` (fetch daily parking activity request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchDailyParkingActivityRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchDailyParkingActivityRequest: (state) => {
            state.parkingSessions.dailyActivity.loading = true;
            state.parkingSessions.dailyActivity.error = null;
        },
        /**
         * Lấy nghiệp vụ `fetchDailyParkingActivitySuccess` (fetch daily parking activity success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchDailyParkingActivitySuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchDailyParkingActivitySuccess: (state, action) => {
            const data = action.payload || {};
            state.parkingSessions.dailyActivity.loading = false;
            state.parkingSessions.dailyActivity.date = data.date || null;
            state.parkingSessions.dailyActivity.scope = data.scope || { buildingId: null };
            state.parkingSessions.dailyActivity.sessions = data.sessions || [];
            state.parkingSessions.dailyActivity.buildingSummaries =
                data.buildingSummaries || [];
            state.parkingSessions.dailyActivity.summary = data.summary || {
                currentlyParked: { total: 0, motorbike: 0, car: 0 },
                enteredToday: { total: 0, motorbike: 0, car: 0 },
                exitedToday: { total: 0, motorbike: 0, car: 0 },
            };
        },
        /**
         * Lấy nghiệp vụ `fetchDailyParkingActivityFailure` (fetch daily parking activity failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchDailyParkingActivityFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchDailyParkingActivityFailure: (state, action) => {
            state.parkingSessions.dailyActivity.loading = false;
            state.parkingSessions.dailyActivity.error = action.payload;
        },

        /**
         * Thực hiện nghiệp vụ `recognizePlateRequest` (recognize plate request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function recognizePlateRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        recognizePlateRequest: (state, action) => {
            state.plateRecognition.requestId = action.payload?.requestId || null;
            state.plateRecognition.plateNumber = "";
            state.plateRecognition.rawText = "";
            state.plateRecognition.confidence = 0;
            state.plateRecognition.detectionConfidence = 0;
            state.plateRecognition.ocrConfidence = 0;
            state.plateRecognition.engine = null;
            state.plateRecognition.candidates = [];
            state.plateRecognition.loading = true;
            state.plateRecognition.error = null;
        },
        /**
         * Thực hiện nghiệp vụ `recognizePlateSuccess` (recognize plate success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function recognizePlateSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        recognizePlateSuccess: (state, action) => {
            state.plateRecognition.requestId = action.payload?.requestId || null;
            state.plateRecognition.plateNumber = action.payload?.plateNumber || "";
            state.plateRecognition.rawText = action.payload?.rawText || "";
            state.plateRecognition.confidence = Number(action.payload?.confidence || 0);
            state.plateRecognition.detectionConfidence =
                Number(action.payload?.detectionConfidence || 0);
            state.plateRecognition.ocrConfidence =
                Number(action.payload?.ocrConfidence || 0);
            state.plateRecognition.engine = action.payload?.engine || null;
            state.plateRecognition.candidates =
                Array.isArray(action.payload?.candidates)
                    ? action.payload.candidates
                    : [];
            state.plateRecognition.loading = false;
            state.plateRecognition.error = null;
        },
        /**
         * Thực hiện nghiệp vụ `recognizePlateFailure` (recognize plate failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function recognizePlateFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        recognizePlateFailure: (state, action) => {
            state.plateRecognition.requestId = action.payload?.requestId || null;
            state.plateRecognition.loading = false;
            state.plateRecognition.error = action.payload?.error || "Không đọc được biển số xe.";
        },
        /**
         * Xóa hoặc đặt lại nghiệp vụ `clearPlateRecognition` (clear plate recognition). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function clearPlateRecognition
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        clearPlateRecognition: (state) => {
            state.plateRecognition = {
                requestId: null,
                plateNumber: "",
                rawText: "",
                confidence: 0,
                detectionConfidence: 0,
                ocrConfidence: 0,
                engine: null,
                candidates: [],
                loading: false,
                error: null,
            };
        },

        /**
         * Lấy nghiệp vụ `fetchMyActiveParkingSessionsRequest` (fetch my active parking sessions request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyActiveParkingSessionsRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyActiveParkingSessionsRequest: (state) => {
            state.parkingSessions.myLoading = true;
            state.parkingSessions.error = null;
        },
        /**
         * Lấy nghiệp vụ `fetchMyActiveParkingSessionsSuccess` (fetch my active parking sessions success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyActiveParkingSessionsSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyActiveParkingSessionsSuccess: (state, action) => {
            state.parkingSessions.myLoading = false;
            state.parkingSessions.mine = action.payload || [];
        },
        /**
         * Lấy nghiệp vụ `fetchMyActiveParkingSessionsFailure` (fetch my active parking sessions failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyActiveParkingSessionsFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyActiveParkingSessionsFailure: (state, action) => {
            state.parkingSessions.myLoading = false;
            state.parkingSessions.error = action.payload;
        },

        /**
         * Kiểm tra nghiệp vụ `checkInRequest` (check in request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function checkInRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        checkInRequest: (state) => {
            state.parkingSessions.checkingIn = true;
            state.parkingSessions.lastCheckIn = null;
            state.parkingSessions.error = null;
            state.notice = null;
        },
        /**
         * Kiểm tra nghiệp vụ `checkInSuccess` (check in success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function checkInSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        checkInSuccess: (state, action) => {
            state.parkingSessions.checkingIn = false;
            state.parkingSessions.lastCheckIn = action.payload;
            state.parkingSessions.active = upsertById(
                state.parkingSessions.active,
                action.payload
            );
            state.notice = "Đã ghi nhận xe vào bãi.";
        },
        /**
         * Kiểm tra nghiệp vụ `checkInFailure` (check in failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function checkInFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        checkInFailure: (state, action) => {
            state.parkingSessions.checkingIn = false;
            state.parkingSessions.error = action.payload;
        },

        /**
         * Kiểm tra nghiệp vụ `checkOutRequest` (check out request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function checkOutRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        checkOutRequest: (state) => {
            state.parkingSessions.checkingOut = true;
            state.parkingSessions.checkoutResult = null;
            state.parkingSessions.error = null;
            state.notice = null;
        },
        /**
         * Kiểm tra nghiệp vụ `checkOutSuccess` (check out success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function checkOutSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        checkOutSuccess: (state, action) => {
            state.parkingSessions.checkingOut = false;
            state.parkingSessions.checkoutResult = action.payload;
            const checkedOutSession = action.payload?.session || action.payload;
            state.parkingSessions.active = state.parkingSessions.active.filter(
                /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
                (session) => String(session.id) !== String(checkedOutSession?.id)
            );
            state.parkingSessions.mine = state.parkingSessions.mine.filter(
                /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
                (session) => String(session.id) !== String(checkedOutSession?.id)
            );
            state.notice = "Đã hoàn tất xe ra.";
        },
        /**
         * Kiểm tra nghiệp vụ `checkOutFailure` (check out failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function checkOutFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        checkOutFailure: (state, action) => {
            state.parkingSessions.checkingOut = false;
            state.parkingSessions.error = action.payload;
        },

        /**
         * Kiểm tra nghiệp vụ `checkOutByQrRequest` (check out by qr request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function checkOutByQrRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        checkOutByQrRequest: (state) => {
            state.parkingSessions.checkingOut = true;
            state.parkingSessions.checkoutResult = null;
            state.parkingSessions.error = null;
            state.notice = null;
        },
        /**
         * Kiểm tra nghiệp vụ `checkOutByQrSuccess` (check out by qr success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function checkOutByQrSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        checkOutByQrSuccess: (state, action) => {
            state.parkingSessions.checkingOut = false;
            state.parkingSessions.checkoutResult = action.payload;
            const checkedOutSession = action.payload?.session || action.payload;
            state.parkingSessions.active = state.parkingSessions.active.filter(
                /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
                (session) => String(session.id) !== String(checkedOutSession?.id)
            );
            state.parkingSessions.mine = state.parkingSessions.mine.filter(
                /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
                (session) => String(session.id) !== String(checkedOutSession?.id)
            );
            state.notice = "Đã hoàn tất xe ra.";
        },
        /**
         * Kiểm tra nghiệp vụ `checkOutByQrFailure` (check out by qr failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function checkOutByQrFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        checkOutByQrFailure: (state, action) => {
            state.parkingSessions.checkingOut = false;
            state.parkingSessions.error = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchViolationsRequest` (fetch violations request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchViolationsRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchViolationsRequest: (state) => {
            state.violations.loading = true;
            state.violations.error = null;
        },
        /**
         * Lấy nghiệp vụ `fetchViolationsSuccess` (fetch violations success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchViolationsSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchViolationsSuccess: (state, action) => {
            state.violations.loading = false;
            state.violations.items = action.payload || [];
        },
        /**
         * Lấy nghiệp vụ `fetchViolationsFailure` (fetch violations failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchViolationsFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchViolationsFailure: (state, action) => {
            state.violations.loading = false;
            state.violations.error = action.payload;
        },

        /**
         * Tạo nghiệp vụ `createViolationRequest` (create violation request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createViolationRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createViolationRequest: (state) => {
            state.violations.saving = true;
            state.violations.error = null;
            state.notice = null;
        },
        /**
         * Tạo nghiệp vụ `createViolationSuccess` (create violation success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createViolationSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createViolationSuccess: (state, action) => {
            state.violations.saving = false;
            state.violations.items = upsertById(state.violations.items, action.payload);
            state.notice = "Đã ghi nhận vi phạm.";
        },
        /**
         * Tạo nghiệp vụ `createViolationFailure` (create violation failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createViolationFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createViolationFailure: (state, action) => {
            state.violations.saving = false;
            state.violations.error = action.payload;
        },

        /**
         * Cập nhật nghiệp vụ `updateViolationStatusRequest` (update violation status request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateViolationStatusRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateViolationStatusRequest: (state, action) => {
            state.violations.updatingId = action.payload.id;
            state.violations.error = null;
            state.notice = null;
        },
        /**
         * Cập nhật nghiệp vụ `updateViolationStatusSuccess` (update violation status success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateViolationStatusSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateViolationStatusSuccess: (state, action) => {
            state.violations.updatingId = null;
            state.violations.items = upsertById(state.violations.items, action.payload);
            state.notice = "Đã cập nhật vi phạm.";
        },
        /**
         * Cập nhật nghiệp vụ `updateViolationStatusFailure` (update violation status failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateViolationStatusFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateViolationStatusFailure: (state, action) => {
            state.violations.updatingId = null;
            state.violations.error = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchReportsRequest` (fetch reports request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchReportsRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchReportsRequest: (state) => {
            state.reports.loading = true;
            state.reports.error = null;
        },
        /**
         * Lấy nghiệp vụ `fetchReportsSuccess` (fetch reports success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchReportsSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchReportsSuccess: (state, action) => {
            state.reports.loading = false;
            state.reports.data = action.payload || state.reports.data;
        },
        /**
         * Lấy nghiệp vụ `fetchReportsFailure` (fetch reports failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchReportsFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchReportsFailure: (state, action) => {
            state.reports.loading = false;
            state.reports.error = action.payload;
        },
    },
});

export const {
    approveVehicleFailure,
    approveVehicleRequest,
    approveVehicleSuccess,
    assignStaffToBuildingFailure,
    assignStaffToBuildingRequest,
    assignStaffToBuildingSuccess,
    buyPackagePlanFailure,
    buyPackagePlanRequest,
    buyPackagePlanSuccess,
    checkInFailure,
    checkInRequest,
    checkInSuccess,
    checkOutByQrFailure,
    checkOutByQrRequest,
    checkOutByQrSuccess,
    checkOutFailure,
    checkOutRequest,
    checkOutSuccess,
    clearHourlyCheckInMatch,
    clearParkingNotice,
    confirmFloorMismatchFailure,
    confirmFloorMismatchRequest,
    confirmFloorMismatchSuccess,
    confirmWrongSlotFailure,
    confirmWrongSlotRequest,
    confirmWrongSlotSuccess,
    continueMonthlyPassPaymentFailure,
    continueMonthlyPassPaymentRequest,
    continueMonthlyPassPaymentSuccess,
    createMonthlyPassFailure,
    createMonthlyPassRequest,
    createMonthlyPassSuccess,
    createSlotRegistrationFailure,
    createSlotRegistrationRequest,
    createSlotRegistrationSuccess,
    createGuestHourlyReservationFailure,
    createGuestHourlyReservationRequest,
    createGuestHourlyReservationSuccess,
    createUserHourlyReservationFailure,
    createUserHourlyReservationRequest,
    createUserHourlyReservationSuccess,
    createTempQrCardFailure,
    createTempQrCardRequest,
    createTempQrCardSuccess,
    createVehicleFailure,
    createVehicleRequest,
    createVehicleSuccess,
    createViolationFailure,
    createViolationRequest,
    createViolationSuccess,
    deactivatePackagePlanFailure,
    deactivatePackagePlanRequest,
    deactivatePackagePlanSuccess,
    fetchActiveParkingSessionsFailure,
    fetchActiveParkingSessionsRequest,
    fetchActiveParkingSessionsSuccess,
    fetchDailyParkingActivityFailure,
    fetchDailyParkingActivityRequest,
    fetchDailyParkingActivitySuccess,
    recognizePlateFailure,
    recognizePlateRequest,
    recognizePlateSuccess,
    clearPlateRecognition,
    fetchMyActiveParkingSessionsFailure,
    fetchMyActiveParkingSessionsRequest,
    fetchMyActiveParkingSessionsSuccess,
    fetchMyNotificationsFailure,
    fetchMyNotificationsRequest,
    fetchMyNotificationsSuccess,
    markAllNotificationsReadFailure,
    markAllNotificationsReadRequest,
    markAllNotificationsReadSuccess,
    markNotificationReadFailure,
    markNotificationReadRequest,
    markNotificationReadSuccess,
    fetchNotificationPreferencesFailure,
    fetchNotificationPreferencesRequest,
    fetchNotificationPreferencesSuccess,
    fetchAllVehiclesFailure,
    fetchAllVehiclesRequest,
    fetchAllVehiclesSuccess,
    fetchFloorMismatchCasesFailure,
    fetchFloorMismatchCasesRequest,
    fetchFloorMismatchCasesSuccess,
    fetchMyFloorMismatchCasesFailure,
    fetchMyFloorMismatchCasesRequest,
    fetchMyFloorMismatchCasesSuccess,
    fetchHealthFailure,
    fetchHealthRequest,
    fetchHealthSuccess,
    fetchHourlyReservationAvailabilityFailure,
    fetchHourlyReservationAvailabilityRequest,
    fetchHourlyReservationAvailabilitySuccess,
    fetchHourlyCheckInMatchFailure,
    fetchHourlyCheckInMatchRequest,
    fetchHourlyCheckInMatchSuccess,
    fetchMonthlyPassesFailure,
    fetchMonthlyPassesRequest,
    fetchMonthlyPassesSuccess,
    fetchMyMonthlyPassesFailure,
    fetchMyMonthlyPassesRequest,
    fetchMyMonthlyPassesSuccess,
    fetchMyQrPassesFailure,
    fetchMyQrPassesRequest,
    fetchMyQrPassesSuccess,
    fetchMySlotRegistrationsFailure,
    fetchMySlotRegistrationsRequest,
    fetchMySlotRegistrationsSuccess,
    fetchMyHourlyReservationsFailure,
    fetchMyHourlyReservationsRequest,
    fetchMyHourlyReservationsSuccess,
    fetchMyVehiclesFailure,
    fetchMyVehiclesRequest,
    fetchMyVehiclesSuccess,
    fetchPackagePlansFailure,
    fetchPackagePlansRequest,
    fetchPackagePlansSuccess,
    fetchPricingPoliciesFailure,
    fetchPricingPoliciesRequest,
    fetchPricingPoliciesSuccess,
    fetchQrPassesFailure,
    fetchQrPassesRequest,
    fetchQrPassesSuccess,
    fetchReportsFailure,
    fetchReportsRequest,
    fetchReportsSuccess,
    fetchStaffAssignmentsFailure,
    fetchStaffAssignmentsRequest,
    fetchStaffAssignmentsSuccess,
    fetchStaffHourlyReservationsFailure,
    fetchStaffHourlyReservationsRequest,
    fetchStaffHourlyReservationsSuccess,
    fetchTempQrCardsFailure,
    fetchTempQrCardsRequest,
    fetchTempQrCardsSuccess,
    fetchViolationsFailure,
    fetchViolationsRequest,
    fetchViolationsSuccess,
    fetchWrongSlotCasesFailure,
    fetchWrongSlotCasesRequest,
    fetchWrongSlotCasesSuccess,
    markFloorMismatchMovedFailure,
    markFloorMismatchMovedRequest,
    markFloorMismatchMovedSuccess,
    fetchMyWrongSlotCasesFailure,
    fetchMyWrongSlotCasesRequest,
    fetchMyWrongSlotCasesSuccess,
    markMyFloorMismatchMovedFailure,
    markMyFloorMismatchMovedRequest,
    markMyFloorMismatchMovedSuccess,
    markMyWrongSlotMovedFailure,
    markMyWrongSlotMovedRequest,
    markMyWrongSlotMovedSuccess,
    markWrongSlotMovedFailure,
    markWrongSlotMovedRequest,
    markWrongSlotMovedSuccess,
    rejectVehicleFailure,
    rejectVehicleRequest,
    rejectVehicleSuccess,
    reportFloorMismatchFailure,
    reportFloorMismatchRequest,
    reportFloorMismatchSuccess,
    reportWrongSlotFailure,
    reportWrongSlotRequest,
    reportWrongSlotSuccess,
    savePackagePlanFailure,
    savePackagePlanRequest,
    savePackagePlanSuccess,
    savePricingPolicyFailure,
    savePricingPolicyRequest,
    savePricingPolicySuccess,
    updateQrPassStatusFailure,
    updateQrPassStatusRequest,
    updateQrPassStatusSuccess,
    updateNotificationPreferencesFailure,
    updateNotificationPreferencesRequest,
    updateNotificationPreferencesSuccess,
    updateTempQrCardStatusFailure,
    updateTempQrCardStatusRequest,
    updateTempQrCardStatusSuccess,
    updateViolationStatusFailure,
    updateViolationStatusRequest,
    updateViolationStatusSuccess,
    validateQrPassFailure,
    validateQrPassRequest,
    validateQrPassSuccess,
    fetchViolationTypesRequest,
    fetchViolationTypesSuccess,
    fetchViolationTypesFailure,
    saveViolationTypeRequest,
    saveViolationTypeSuccess,
    saveViolationTypeFailure,
    deactivateViolationTypeRequest,
    deactivateViolationTypeSuccess,
} = parkingSlice.actions;

export default parkingSlice.reducer;
