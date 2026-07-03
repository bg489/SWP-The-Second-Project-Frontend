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

const packagePlanSeed = monthlyPackages.map((plan) => ({
    ...plan,
    durationDays: Number(String(plan.duration).replace(/\D/g, "")) || 30,
    status: "ACTIVE",
}));

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
        pendingAmount: violations.reduce((sum, item) => sum + Number(item.fine || 0), 0),
    },
});

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
        saving: false
    },

    vehicles: {
        all: vehicles,
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

    notifications: {
        mine: [],
        loading: false,
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
        loading: false,
        reporting: false,
        confirmingId: null,
        lastCase: null,
        error: null,
    },

    parkingSessions: {
        active: parkingSessions.filter((session) =>
            ["ACTIVE", "PENDING_PAYMENT"].includes(session.status)
        ),
        mine: parkingSessions.filter(
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

const upsertById = (items, item) => {
    if (!item?.id) return items;

    const exists = items.some((current) => String(current.id) === String(item.id));
    if (!exists) return [item, ...items];

    return items.map((current) =>
        String(current.id) === String(item.id) ? { ...current, ...item } : current
    );
};

const parkingSlice = createSlice({
    name: "parking",
    initialState,
    reducers: {
        fetchViolationTypesRequest: (state) => {
            state.violationTypes.loading = true;
            state.violationTypes.error = null;
        },
        fetchViolationTypesSuccess: (state, action) => {
            state.violationTypes.loading = false;
            state.violationTypes.items = action.payload || [];
        },
        fetchViolationTypesFailure: (state, action) => {
            state.violationTypes.loading = false;
            state.violationTypes.error = action.payload;
        },

        // Luồng lưu (Thêm mới/Cập nhật) cấu hình lỗi vi phạm
        saveViolationTypeRequest: (state) => {
            state.violationTypes.saving = true;
        },
        saveViolationTypeSuccess: (state, action) => {
            state.violationTypes.saving = false;
            const updated = action.payload;
            const index = state.violationTypes.items.findIndex(item => item.id === updated.id);
            if (index !== -1) {
                state.violationTypes.items[index] = updated;
            } else {
                state.violationTypes.items.unshift(updated);
            }
        },
        saveViolationTypeFailure: (state, action) => {
            state.violationTypes.saving = false;
            state.notice = action.payload;
        },

        // Luồng ngưng áp dụng cấu hình lỗi vi phạm
        deactivateViolationTypeRequest: (state) => {
            state.violationTypes.saving = true;
        },
        deactivateViolationTypeSuccess: (state, action) => {
            state.violationTypes.saving = false;
            state.violationTypes.items = state.violationTypes.items.filter(
                item => item.id !== action.payload
            );
        },
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
            state.notifications.error = null;
            state.notifications.preferences.error = null;
            state.staffAssignments.error = null;
            state.wrongSlotCases.error = null;
            state.parkingSessions.error = null;
            state.violations.error = null;
            state.payments.error = null;
            state.reports.error = null;
        },

        fetchHealthRequest: (state) => {
            state.health.loading = true;
            state.health.error = null;
        },
        fetchHealthSuccess: (state, action) => {
            state.health.loading = false;
            state.health.ready = true;
            state.health.checkedAt = action.payload?.checkedAt || new Date().toISOString();
        },
        fetchHealthFailure: (state, action) => {
            state.health.loading = false;
            state.health.ready = false;
            state.health.error = action.payload;
        },

        fetchMyVehiclesRequest: (state) => {
            state.vehicles.loading = true;
            state.vehicles.error = null;
        },
        fetchMyVehiclesSuccess: (state, action) => {
            state.vehicles.loading = false;
            state.vehicles.mine = action.payload || [];
        },
        fetchMyVehiclesFailure: (state, action) => {
            state.vehicles.loading = false;
            state.vehicles.error = action.payload;
        },

        fetchAllVehiclesRequest: (state) => {
            state.vehicles.loading = true;
            state.vehicles.error = null;
        },
        fetchAllVehiclesSuccess: (state, action) => {
            state.vehicles.loading = false;
            state.vehicles.all = action.payload || [];
        },
        fetchAllVehiclesFailure: (state, action) => {
            state.vehicles.loading = false;
            state.vehicles.error = action.payload;
        },

        createVehicleRequest: (state) => {
            state.vehicles.saving = true;
            state.vehicles.error = null;
            state.notice = null;
        },
        createVehicleSuccess: (state, action) => {
            state.vehicles.saving = false;
            state.vehicles.mine = upsertById(state.vehicles.mine, action.payload);
            state.vehicles.all = upsertById(state.vehicles.all, action.payload);
            state.notice = "Đã gửi hồ sơ xe để chờ duyệt.";
        },
        createVehicleFailure: (state, action) => {
            state.vehicles.saving = false;
            state.vehicles.error = action.payload;
        },

        approveVehicleRequest: (state, action) => {
            state.vehicles.updatingId = action.payload.id;
            state.vehicles.error = null;
            state.notice = null;
        },
        approveVehicleSuccess: (state, action) => {
            state.vehicles.updatingId = null;
            state.vehicles.all = upsertById(state.vehicles.all, action.payload);
            state.notice = "Đã duyệt xe.";
        },
        approveVehicleFailure: (state, action) => {
            state.vehicles.updatingId = null;
            state.vehicles.error = action.payload;
        },

        rejectVehicleRequest: (state, action) => {
            state.vehicles.updatingId = action.payload.id;
            state.vehicles.error = null;
            state.notice = null;
        },
        rejectVehicleSuccess: (state, action) => {
            state.vehicles.updatingId = null;
            state.vehicles.all = upsertById(state.vehicles.all, action.payload);
            state.notice = "Đã từ chối xe.";
        },
        rejectVehicleFailure: (state, action) => {
            state.vehicles.updatingId = null;
            state.vehicles.error = action.payload;
        },

        fetchPricingPoliciesRequest: (state) => {
            state.pricingPolicies.loading = true;
            state.pricingPolicies.error = null;
        },
        fetchPricingPoliciesSuccess: (state, action) => {
            state.pricingPolicies.loading = false;
            state.pricingPolicies.items = action.payload || [];
        },
        fetchPricingPoliciesFailure: (state, action) => {
            state.pricingPolicies.loading = false;
            state.pricingPolicies.error = action.payload;
        },

        savePricingPolicyRequest: (state) => {
            state.pricingPolicies.saving = true;
            state.pricingPolicies.error = null;
            state.notice = null;
        },
        savePricingPolicySuccess: (state, action) => {
            state.pricingPolicies.saving = false;
            state.pricingPolicies.items = upsertById(
                state.pricingPolicies.items,
                action.payload
            );
            state.notice = "Đã lưu bảng giá.";
        },
        savePricingPolicyFailure: (state, action) => {
            state.pricingPolicies.saving = false;
            state.pricingPolicies.error = action.payload;
        },

        fetchPackagePlansRequest: (state) => {
            state.packagePlans.loading = true;
            state.packagePlans.error = null;
        },
        fetchPackagePlansSuccess: (state, action) => {
            state.packagePlans.loading = false;
            state.packagePlans.items = action.payload || [];
        },
        fetchPackagePlansFailure: (state, action) => {
            state.packagePlans.loading = false;
            state.packagePlans.error = action.payload;
        },

        savePackagePlanRequest: (state) => {
            state.packagePlans.saving = true;
            state.packagePlans.error = null;
            state.notice = null;
        },
        savePackagePlanSuccess: (state, action) => {
            state.packagePlans.saving = false;
            state.packagePlans.items = upsertById(state.packagePlans.items, action.payload);
            state.notice = "Đã lưu gói tháng.";
        },
        savePackagePlanFailure: (state, action) => {
            state.packagePlans.saving = false;
            state.packagePlans.error = action.payload;
        },

        deactivatePackagePlanRequest: (state, action) => {
            state.packagePlans.deletingId = action.payload.id;
            state.packagePlans.error = null;
            state.notice = null;
        },
        deactivatePackagePlanSuccess: (state, action) => {
            state.packagePlans.deletingId = null;
            state.packagePlans.items = state.packagePlans.items.map((item) =>
                String(item.id) === String(action.payload.id)
                    ? { ...item, status: "INACTIVE" }
                    : item
            );
            state.notice = "Đã ngưng gói tháng.";
        },
        deactivatePackagePlanFailure: (state, action) => {
            state.packagePlans.deletingId = null;
            state.packagePlans.error = action.payload;
        },

        buyPackagePlanRequest: (state, action) => {
            state.packagePlans.buyingId = action.payload.id;
            state.packagePlans.purchaseResult = null;
            state.packagePlans.error = null;
            state.notice = null;
        },
        buyPackagePlanSuccess: (state, action) => {
            state.packagePlans.buyingId = null;
            state.packagePlans.purchaseResult = action.payload;
            state.notice = "Đã tạo yêu cầu thanh toán gói tháng.";
        },
        buyPackagePlanFailure: (state, action) => {
            state.packagePlans.buyingId = null;
            state.packagePlans.error = action.payload;
        },

        fetchMonthlyPassesRequest: (state) => {
            state.monthlyPasses.loading = true;
            state.monthlyPasses.error = null;
        },
        fetchMonthlyPassesSuccess: (state, action) => {
            state.monthlyPasses.loading = false;
            state.monthlyPasses.items = action.payload || [];
        },
        fetchMonthlyPassesFailure: (state, action) => {
            state.monthlyPasses.loading = false;
            state.monthlyPasses.error = action.payload;
        },

        fetchMyMonthlyPassesRequest: (state) => {
            state.monthlyPasses.loading = true;
            state.monthlyPasses.error = null;
        },
        fetchMyMonthlyPassesSuccess: (state, action) => {
            state.monthlyPasses.loading = false;
            state.monthlyPasses.mine = action.payload || [];
        },
        fetchMyMonthlyPassesFailure: (state, action) => {
            state.monthlyPasses.loading = false;
            state.monthlyPasses.error = action.payload;
        },

        createMonthlyPassRequest: (state) => {
            state.monthlyPasses.saving = true;
            state.monthlyPasses.error = null;
            state.notice = null;
        },
        createMonthlyPassSuccess: (state, action) => {
            state.monthlyPasses.saving = false;
            state.monthlyPasses.items = upsertById(state.monthlyPasses.items, action.payload);
            state.notice = "Đã tạo thẻ tháng.";
        },
        createMonthlyPassFailure: (state, action) => {
            state.monthlyPasses.saving = false;
            state.monthlyPasses.error = action.payload;
        },

        continueMonthlyPassPaymentRequest: (state, action) => {
            state.monthlyPasses.payingId = action.payload.id;
            state.monthlyPasses.error = null;
            state.notice = null;
        },
        continueMonthlyPassPaymentSuccess: (state, action) => {
            state.monthlyPasses.payingId = null;
            const pass = action.payload?.monthlyPass || action.payload;
            state.monthlyPasses.mine = upsertById(state.monthlyPasses.mine, pass);
            state.monthlyPasses.items = upsertById(state.monthlyPasses.items, pass);
            state.notice = "Đã mở lại yêu cầu thanh toán.";
        },
        continueMonthlyPassPaymentFailure: (state, action) => {
            state.monthlyPasses.payingId = null;
            state.monthlyPasses.error = action.payload;
        },

        fetchTempQrCardsRequest: (state) => {
            state.tempQrCards.loading = true;
            state.tempQrCards.error = null;
        },
        fetchTempQrCardsSuccess: (state, action) => {
            state.tempQrCards.loading = false;
            state.tempQrCards.items = action.payload || [];
        },
        fetchTempQrCardsFailure: (state, action) => {
            state.tempQrCards.loading = false;
            state.tempQrCards.error = action.payload;
        },

        createTempQrCardRequest: (state) => {
            state.tempQrCards.saving = true;
            state.tempQrCards.error = null;
            state.notice = null;
        },
        createTempQrCardSuccess: (state, action) => {
            state.tempQrCards.saving = false;
            const createdCards = Array.isArray(action.payload)
                ? action.payload
                : [action.payload].filter(Boolean);

            createdCards.forEach((card) => {
                state.tempQrCards.items = upsertById(state.tempQrCards.items, card);
            });
            state.notice =
                createdCards.length > 1
                    ? `Đã tạo ${createdCards.length} thẻ QR tạm.`
                    : "Đã thêm thẻ QR tạm.";
        },
        createTempQrCardFailure: (state, action) => {
            state.tempQrCards.saving = false;
            state.tempQrCards.error = action.payload;
        },

        updateTempQrCardStatusRequest: (state, action) => {
            state.tempQrCards.updatingId = action.payload.id;
            state.tempQrCards.error = null;
            state.notice = null;
        },
        updateTempQrCardStatusSuccess: (state, action) => {
            state.tempQrCards.updatingId = null;
            state.tempQrCards.items = upsertById(state.tempQrCards.items, action.payload);
            state.notice = "Đã cập nhật thẻ QR tạm.";
        },
        updateTempQrCardStatusFailure: (state, action) => {
            state.tempQrCards.updatingId = null;
            state.tempQrCards.error = action.payload;
        },

        fetchMyQrPassesRequest: (state) => {
            state.qrPasses.loading = true;
            state.qrPasses.error = null;
        },
        fetchMyQrPassesSuccess: (state, action) => {
            state.qrPasses.loading = false;
            state.qrPasses.mine = action.payload || [];
        },
        fetchMyQrPassesFailure: (state, action) => {
            state.qrPasses.loading = false;
            state.qrPasses.error = action.payload;
        },

        fetchQrPassesRequest: (state) => {
            state.qrPasses.loading = true;
            state.qrPasses.error = null;
        },
        fetchQrPassesSuccess: (state, action) => {
            state.qrPasses.loading = false;
            state.qrPasses.items = action.payload || [];
        },
        fetchQrPassesFailure: (state, action) => {
            state.qrPasses.loading = false;
            state.qrPasses.error = action.payload;
        },

        validateQrPassRequest: (state) => {
            state.qrPasses.validating = true;
            state.qrPasses.validation = null;
            state.qrPasses.error = null;
        },
        validateQrPassSuccess: (state, action) => {
            state.qrPasses.validating = false;
            state.qrPasses.validation = action.payload;
        },
        validateQrPassFailure: (state, action) => {
            state.qrPasses.validating = false;
            state.qrPasses.error = action.payload;
        },

        updateQrPassStatusRequest: (state, action) => {
            state.qrPasses.updatingId = action.payload.id;
            state.qrPasses.error = null;
            state.notice = null;
        },
        updateQrPassStatusSuccess: (state, action) => {
            state.qrPasses.updatingId = null;
            state.qrPasses.items = upsertById(state.qrPasses.items, action.payload);
            state.qrPasses.mine = upsertById(state.qrPasses.mine, action.payload);
            state.notice = "Đã cập nhật mã QR.";
        },
        updateQrPassStatusFailure: (state, action) => {
            state.qrPasses.updatingId = null;
            state.qrPasses.error = action.payload;
        },

        fetchMySlotRegistrationsRequest: (state) => {
            state.slotRegistrations.loading = true;
            state.slotRegistrations.error = null;
        },
        fetchMySlotRegistrationsSuccess: (state, action) => {
            state.slotRegistrations.loading = false;
            state.slotRegistrations.mine = action.payload || [];
        },
        fetchMySlotRegistrationsFailure: (state, action) => {
            state.slotRegistrations.loading = false;
            state.slotRegistrations.error = action.payload;
        },

        createSlotRegistrationRequest: (state) => {
            state.slotRegistrations.creating = true;
            state.slotRegistrations.error = null;
            state.slotRegistrations.lastCreated = null;
            state.notice = null;
        },
        createSlotRegistrationSuccess: (state, action) => {
            state.slotRegistrations.creating = false;
            state.slotRegistrations.lastCreated = action.payload;
            state.slotRegistrations.mine = upsertById(
                state.slotRegistrations.mine,
                action.payload
            );
            state.notice = "Đã tạo yêu cầu giữ ô đỗ.";
        },
        createSlotRegistrationFailure: (state, action) => {
            state.slotRegistrations.creating = false;
            state.slotRegistrations.error = action.payload;
        },

        fetchMyNotificationsRequest: (state) => {
            state.notifications.loading = true;
            state.notifications.error = null;
        },
        fetchMyNotificationsSuccess: (state, action) => {
            state.notifications.loading = false;
            state.notifications.mine = action.payload || [];
        },
        fetchMyNotificationsFailure: (state, action) => {
            state.notifications.loading = false;
            state.notifications.error = action.payload;
        },
        fetchNotificationPreferencesRequest: (state) => {
            state.notifications.preferences.loading = true;
            state.notifications.preferences.error = null;
        },
        fetchNotificationPreferencesSuccess: (state, action) => {
            state.notifications.preferences.loading = false;
            state.notifications.preferences.emailNotificationsEnabled =
                action.payload?.emailNotificationsEnabled !== false;
        },
        fetchNotificationPreferencesFailure: (state, action) => {
            state.notifications.preferences.loading = false;
            state.notifications.preferences.error = action.payload;
        },
        updateNotificationPreferencesRequest: (state, action) => {
            state.notifications.preferences.saving = true;
            state.notifications.preferences.error = null;
            state.notifications.preferences.emailNotificationsEnabled =
                action.payload?.emailNotificationsEnabled !== false;
        },
        updateNotificationPreferencesSuccess: (state, action) => {
            state.notifications.preferences.saving = false;
            state.notifications.preferences.emailNotificationsEnabled =
                action.payload?.emailNotificationsEnabled !== false;
        },
        updateNotificationPreferencesFailure: (state, action) => {
            state.notifications.preferences.saving = false;
            state.notifications.preferences.error = action.payload;
        },

        fetchStaffAssignmentsRequest: (state) => {
            state.staffAssignments.loading = true;
            state.staffAssignments.error = null;
        },
        fetchStaffAssignmentsSuccess: (state, action) => {
            const payload = action.payload || {};

            state.staffAssignments.loading = false;
            state.staffAssignments.building = payload.building || null;
            state.staffAssignments.items =
                payload.staff || payload.users || (Array.isArray(payload) ? payload : []);
        },
        fetchStaffAssignmentsFailure: (state, action) => {
            state.staffAssignments.loading = false;
            state.staffAssignments.error = action.payload;
        },
        assignStaffToBuildingRequest: (state, action) => {
            state.staffAssignments.assigningId = action.payload.id;
            state.staffAssignments.error = null;
            state.notice = null;
        },
        assignStaffToBuildingSuccess: (state, action) => {
            state.staffAssignments.assigningId = null;
            state.staffAssignments.items = upsertById(
                state.staffAssignments.items,
                action.payload
            );
            state.notice = "Đã gán nhân viên vào tòa nhà.";
        },
        assignStaffToBuildingFailure: (state, action) => {
            state.staffAssignments.assigningId = null;
            state.staffAssignments.error = action.payload;
        },

        fetchWrongSlotCasesRequest: (state) => {
            state.wrongSlotCases.loading = true;
            state.wrongSlotCases.error = null;
        },
        fetchWrongSlotCasesSuccess: (state, action) => {
            state.wrongSlotCases.loading = false;
            state.wrongSlotCases.items = action.payload || [];
        },
        fetchWrongSlotCasesFailure: (state, action) => {
            state.wrongSlotCases.loading = false;
            state.wrongSlotCases.error = action.payload;
        },
        reportWrongSlotRequest: (state) => {
            state.wrongSlotCases.reporting = true;
            state.wrongSlotCases.error = null;
            state.wrongSlotCases.lastCase = null;
            state.notice = null;
        },
        reportWrongSlotSuccess: (state, action) => {
            state.wrongSlotCases.reporting = false;
            state.wrongSlotCases.lastCase = action.payload;
            state.wrongSlotCases.items = upsertById(state.wrongSlotCases.items, action.payload);
            state.notice =
                action.payload?.status === "ALLOWED"
                    ? "Slot chưa được đặt trước, xe được phép đậu tại đó và không phát sinh phí."
                    : "Đã gửi thông báo yêu cầu dời xe trong 15 phút.";
        },
        reportWrongSlotFailure: (state, action) => {
            state.wrongSlotCases.reporting = false;
            state.wrongSlotCases.error = action.payload;
        },
        confirmWrongSlotRequest: (state, action) => {
            state.wrongSlotCases.confirmingId = action.payload.id;
            state.wrongSlotCases.error = null;
            state.notice = null;
        },
        confirmWrongSlotSuccess: (state, action) => {
            state.wrongSlotCases.confirmingId = null;
            state.wrongSlotCases.items = upsertById(state.wrongSlotCases.items, action.payload);
            state.notice = "Đã xác nhận quá hạn dời xe và ghi nhận phí vi phạm.";
        },
        confirmWrongSlotFailure: (state, action) => {
            state.wrongSlotCases.confirmingId = null;
            state.wrongSlotCases.error = action.payload;
        },

        fetchActiveParkingSessionsRequest: (state) => {
            state.parkingSessions.loading = true;
            state.parkingSessions.error = null;
        },
        fetchActiveParkingSessionsSuccess: (state, action) => {
            state.parkingSessions.loading = false;
            state.parkingSessions.active = action.payload || [];
        },
        fetchActiveParkingSessionsFailure: (state, action) => {
            state.parkingSessions.loading = false;
            state.parkingSessions.error = action.payload;
        },

        fetchMyActiveParkingSessionsRequest: (state) => {
            state.parkingSessions.myLoading = true;
            state.parkingSessions.error = null;
        },
        fetchMyActiveParkingSessionsSuccess: (state, action) => {
            state.parkingSessions.myLoading = false;
            state.parkingSessions.mine = action.payload || [];
        },
        fetchMyActiveParkingSessionsFailure: (state, action) => {
            state.parkingSessions.myLoading = false;
            state.parkingSessions.error = action.payload;
        },

        checkInRequest: (state) => {
            state.parkingSessions.checkingIn = true;
            state.parkingSessions.lastCheckIn = null;
            state.parkingSessions.error = null;
            state.notice = null;
        },
        checkInSuccess: (state, action) => {
            state.parkingSessions.checkingIn = false;
            state.parkingSessions.lastCheckIn = action.payload;
            state.parkingSessions.active = upsertById(
                state.parkingSessions.active,
                action.payload
            );
            state.notice = "Đã ghi nhận xe vào bãi.";
        },
        checkInFailure: (state, action) => {
            state.parkingSessions.checkingIn = false;
            state.parkingSessions.error = action.payload;
        },

        checkOutRequest: (state) => {
            state.parkingSessions.checkingOut = true;
            state.parkingSessions.checkoutResult = null;
            state.parkingSessions.error = null;
            state.notice = null;
        },
        checkOutSuccess: (state, action) => {
            state.parkingSessions.checkingOut = false;
            state.parkingSessions.checkoutResult = action.payload;
            const checkedOutSession = action.payload?.session || action.payload;
            state.parkingSessions.active = state.parkingSessions.active.filter(
                (session) => String(session.id) !== String(checkedOutSession?.id)
            );
            state.parkingSessions.mine = state.parkingSessions.mine.filter(
                (session) => String(session.id) !== String(checkedOutSession?.id)
            );
            state.notice = "Đã hoàn tất xe ra.";
        },
        checkOutFailure: (state, action) => {
            state.parkingSessions.checkingOut = false;
            state.parkingSessions.error = action.payload;
        },

        checkOutByQrRequest: (state) => {
            state.parkingSessions.checkingOut = true;
            state.parkingSessions.checkoutResult = null;
            state.parkingSessions.error = null;
            state.notice = null;
        },
        checkOutByQrSuccess: (state, action) => {
            state.parkingSessions.checkingOut = false;
            state.parkingSessions.checkoutResult = action.payload;
            const checkedOutSession = action.payload?.session || action.payload;
            state.parkingSessions.active = state.parkingSessions.active.filter(
                (session) => String(session.id) !== String(checkedOutSession?.id)
            );
            state.parkingSessions.mine = state.parkingSessions.mine.filter(
                (session) => String(session.id) !== String(checkedOutSession?.id)
            );
            state.notice = "Đã hoàn tất xe ra.";
        },
        checkOutByQrFailure: (state, action) => {
            state.parkingSessions.checkingOut = false;
            state.parkingSessions.error = action.payload;
        },

        fetchViolationsRequest: (state) => {
            state.violations.loading = true;
            state.violations.error = null;
        },
        fetchViolationsSuccess: (state, action) => {
            state.violations.loading = false;
            state.violations.items = action.payload || [];
        },
        fetchViolationsFailure: (state, action) => {
            state.violations.loading = false;
            state.violations.error = action.payload;
        },

        createViolationRequest: (state) => {
            state.violations.saving = true;
            state.violations.error = null;
            state.notice = null;
        },
        createViolationSuccess: (state, action) => {
            state.violations.saving = false;
            state.violations.items = upsertById(state.violations.items, action.payload);
            state.notice = "Đã ghi nhận vi phạm.";
        },
        createViolationFailure: (state, action) => {
            state.violations.saving = false;
            state.violations.error = action.payload;
        },

        updateViolationStatusRequest: (state, action) => {
            state.violations.updatingId = action.payload.id;
            state.violations.error = null;
            state.notice = null;
        },
        updateViolationStatusSuccess: (state, action) => {
            state.violations.updatingId = null;
            state.violations.items = upsertById(state.violations.items, action.payload);
            state.notice = "Đã cập nhật vi phạm.";
        },
        updateViolationStatusFailure: (state, action) => {
            state.violations.updatingId = null;
            state.violations.error = action.payload;
        },

        fetchReportsRequest: (state) => {
            state.reports.loading = true;
            state.reports.error = null;
        },
        fetchReportsSuccess: (state, action) => {
            state.reports.loading = false;
            state.reports.data = action.payload || state.reports.data;
        },
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
    clearParkingNotice,
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
    fetchMyActiveParkingSessionsFailure,
    fetchMyActiveParkingSessionsRequest,
    fetchMyActiveParkingSessionsSuccess,
    fetchMyNotificationsFailure,
    fetchMyNotificationsRequest,
    fetchMyNotificationsSuccess,
    fetchNotificationPreferencesFailure,
    fetchNotificationPreferencesRequest,
    fetchNotificationPreferencesSuccess,
    fetchAllVehiclesFailure,
    fetchAllVehiclesRequest,
    fetchAllVehiclesSuccess,
    fetchHealthFailure,
    fetchHealthRequest,
    fetchHealthSuccess,
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
    fetchTempQrCardsFailure,
    fetchTempQrCardsRequest,
    fetchTempQrCardsSuccess,
    fetchViolationsFailure,
    fetchViolationsRequest,
    fetchViolationsSuccess,
    fetchWrongSlotCasesFailure,
    fetchWrongSlotCasesRequest,
    fetchWrongSlotCasesSuccess,
    rejectVehicleFailure,
    rejectVehicleRequest,
    rejectVehicleSuccess,
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
