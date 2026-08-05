/**
 * @fileoverview Điều phối các tác vụ bất đồng bộ của parkingSaga, gọi API và phát action kết quả về Redux.
 *
 * Luồng chính: Action yêu cầu -> Saga gọi API -> action thành công/thất bại -> reducer cập nhật giao diện.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import api from "../../../services/api";
import { PAYMENT_RETURN_STORAGE_KEY } from "../../../utils/paymentReturn";
import {
    monthlyPackages,
    monthlyPasses,
    parkingSessions,
    reportSummary,
    slotRegistrations,
    tempQrCards,
    vehicles,
    violations,
} from "../../../services/mockParkingData";
import { fetchSlotsByFloorRequest } from "../slots/slotSlice";
import {
    fetchViolationTypesSuccess,
    fetchViolationTypesFailure,
    saveViolationTypeSuccess,
    saveViolationTypeFailure,
    deactivateViolationTypeSuccess,
    fetchViolationTypesRequest
} from "./parkingSlice";
import {
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
    confirmFloorMismatchFailure,
    confirmFloorMismatchRequest,
    confirmFloorMismatchSuccess,
    confirmWrongSlotFailure,
    confirmWrongSlotRequest,
    confirmWrongSlotSuccess,
    markFloorMismatchMovedFailure,
    markFloorMismatchMovedRequest,
    markFloorMismatchMovedSuccess,
    markWrongSlotMovedFailure,
    markWrongSlotMovedRequest,
    markWrongSlotMovedSuccess,
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
    fetchMyWrongSlotCasesFailure,
    fetchMyWrongSlotCasesRequest,
    fetchMyWrongSlotCasesSuccess,
    markMyFloorMismatchMovedFailure,
    markMyFloorMismatchMovedRequest,
    markMyFloorMismatchMovedSuccess,
    markMyWrongSlotMovedFailure,
    markMyWrongSlotMovedRequest,
    markMyWrongSlotMovedSuccess,
    recognizePlateFailure,
    recognizePlateRequest,
    recognizePlateSuccess,
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
} from "./parkingSlice";

/**
 * Khai báo `pricingPolicySeed` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/backend/parking/parkingSaga.jsx.
 */
const pricingPolicySeed = [
    {
        id: "PRICE-MOTORBIKE-TURN",
        vehicleType: "MOTORBIKE",
        pricingType: "TURN",
        amount: 4000,
        status: "ACTIVE",
    },
    {
        id: "PRICE-CAR-HOURLY",
        vehicleType: "CAR",
        pricingType: "HOURLY",
        amount: 20000,
        status: "ACTIVE",
    },
];

/**
 * Khai báo `packagePlanSeed` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/backend/parking/parkingSaga.jsx.
 */
/* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
const packagePlanSeed = monthlyPackages.map((plan) => ({
    ...plan,
    durationDays: Number(String(plan.duration).replace(/\D/g, "")) || 30,
    status: "ACTIVE",
}));

/**
 * Thực hiện nghiệp vụ `extractData` (extract data). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function extractData
 * @param {*} response - Giá trị `response` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const extractData = (response) => response?.data?.data || response?.data || null;

/**
 * Thực hiện nghiệp vụ `extractList` (extract list). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function extractList
 * @param {*} response - Giá trị `response` được hàm sử dụng trong quá trình xử lý.
 * @param {*} keys - Giá trị `keys` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const extractList = (response, keys = []) => {
    const data = extractData(response);

    if (Array.isArray(data)) return data;

    for (const key of keys) {
        if (Array.isArray(data?.[key])) return data[key];
    }

    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.rows)) return data.rows;

    return [];
};

/**
 * Lấy nghiệp vụ `getErrorMessage` (get error message). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function getErrorMessage
 * @param {*} error - Giá trị `error` được hàm sử dụng trong quá trình xử lý.
 * @param {*} fallback - Giá trị `fallback` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

/**
 * Thực hiện nghiệp vụ `splitSyncOptions` (split sync options). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function splitSyncOptions
 * @param {*} payload - Dữ liệu nghiệp vụ được truyền vào hàm.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const splitSyncOptions = (payload) => {
    const { silent = false, ...params } = payload || {};
    return { params, silent };
};

/**
 * Thực hiện nghiệp vụ `syncCollectionPayload` (sync collection payload). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function syncCollectionPayload
 * @param {*} items - Giá trị `items` được hàm sử dụng trong quá trình xử lý.
 * @param {*} silent - Giá trị `silent` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const syncCollectionPayload = (items, silent) => ({
    items,
    silent,
});

/**
 * Kiểm tra nghiệp vụ `shouldUseSample` (should use sample). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function shouldUseSample
 * @param {*} error - Giá trị `error` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const shouldUseSample = (error) => !error?.response;

/**
 * Khai báo `TEMP_QR_STORAGE_KEY` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/backend/parking/parkingSaga.jsx.
 */
const TEMP_QR_STORAGE_KEY = "parking_temp_qr_cards";
/**
 * Lấy nghiệp vụ `readStoredTempQrCards` (read stored temp qr cards). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function readStoredTempQrCards
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const readStoredTempQrCards = () => {
    try {
        const stored = localStorage.getItem(TEMP_QR_STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : null;
        return Array.isArray(parsed) ? parsed : tempQrCards;
    } catch {
        return tempQrCards;
    }
};

/**
 * Thực hiện nghiệp vụ `writeStoredTempQrCards` (write stored temp qr cards). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function writeStoredTempQrCards
 * @param {*} cards - Giá trị `cards` được hàm sử dụng trong quá trình xử lý.
 * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
 */
const writeStoredTempQrCards = (cards) => {
    try {
        localStorage.setItem(TEMP_QR_STORAGE_KEY, JSON.stringify(cards));
    } catch {
        // Ignore storage errors; the active page state still contains the new QR card.
    }
};

/**
 * Thực hiện nghiệp vụ `extractPaymentUrl` (extract payment url). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function extractPaymentUrl
 * @param {*} data - Giá trị `data` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const extractPaymentUrl = (data) =>
    data?.payment?.paymentUrl ||
    data?.paymentUrl ||
    data?.registration?.paymentUrl ||
    data?.monthlyPass?.paymentUrl;

/**
 * Thực hiện nghiệp vụ `redirectToPayment` (redirect to payment). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function redirectToPayment
 * @param {*} paymentUrl - Giá trị `paymentUrl` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const redirectToPayment = (paymentUrl) => {
    if (!paymentUrl || paymentUrl === "#") return;

    sessionStorage.setItem(
        PAYMENT_RETURN_STORAGE_KEY,
        `${window.location.pathname}${window.location.search || ""}`
    );
    window.location.assign(paymentUrl);
};

/**
 * Thực hiện nghiệp vụ `withId` (with id). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function withId
 * @param {*} payload - Dữ liệu nghiệp vụ được truyền vào hàm.
 * @param {*} prefix - Giá trị `prefix` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const withId = (payload, prefix) => ({
    id: payload?.id || `${prefix}-${Date.now()}`,
    ...payload,
});

/**
 * Tạo nghiệp vụ `buildReportFallback` (build report fallback). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function buildReportFallback
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const buildReportFallback = () => ({
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
 * Xử lý nghiệp vụ `handleHealth` (handle health). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleHealth
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleHealth() {
    try {
        yield call([api, api.get], "/health");
        yield put(fetchHealthSuccess({ checkedAt: new Date().toISOString() }));
    } catch (error) {
        yield put(fetchHealthFailure(getErrorMessage(error, "Chưa kiểm tra được tình trạng hệ thống.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchMyVehicles` (handle fetch my vehicles). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchMyVehicles
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchMyVehicles() {
    try {
        const response = yield call([api, api.get], "/vehicles/my");
        yield put(fetchMyVehiclesSuccess(extractList(response, ["vehicles"])));
    } catch (error) {
        if (shouldUseSample(error)) {
            /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
            yield put(fetchMyVehiclesSuccess(vehicles.filter((vehicle) => vehicle.userId === 1)));
            return;
        }

        yield put(fetchMyVehiclesFailure(getErrorMessage(error, "Không lấy được danh sách xe của bạn.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchAllVehicles` (handle fetch all vehicles). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchAllVehicles
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchAllVehicles(action) {
    try {
        const response = yield call([api, api.get], "/vehicles", {
            params: action.payload,
        });
        yield put(fetchAllVehiclesSuccess(extractList(response, ["vehicles"])));
    } catch (error) {
        if (shouldUseSample(error)) {
            const status = action.payload?.status;
            yield put(
                fetchAllVehiclesSuccess(
                    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
                    status ? vehicles.filter((vehicle) => vehicle.status === status) : vehicles
                )
            );
            return;
        }

        yield put(fetchAllVehiclesFailure(getErrorMessage(error, "Không lấy được danh sách xe.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleCreateVehicle` (handle create vehicle). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleCreateVehicle
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleCreateVehicle(action) {
    try {
        const response = yield call([api, api.post], "/vehicles", action.payload);
        yield put(createVehicleSuccess(extractData(response)));
        yield put(fetchMyVehiclesRequest());
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(
                createVehicleSuccess(
                    withId(
                        {
                            userId: 1,
                            owner: "Nguyễn An",
                            status: "PENDING",
                            buildingId: 1,
                            ...action.payload,
                        },
                        "VEH"
                    )
                )
            );
            return;
        }

        yield put(createVehicleFailure(getErrorMessage(error, "Gửi hồ sơ xe thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleApproveVehicle` (handle approve vehicle). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleApproveVehicle
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleApproveVehicle(action) {
    try {
        const { id } = action.payload;
        const response = yield call(
            [api, api.patch],
            `/vehicles/${id}/approve`,
            undefined,
            { timeout: 15000 }
        );
        yield put(approveVehicleSuccess(extractData(response)));
        yield put(fetchAllVehiclesRequest());
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(approveVehicleSuccess({ ...action.payload.vehicle, status: "APPROVED" }));
            return;
        }

        yield put(approveVehicleFailure(getErrorMessage(error, "Duyệt xe thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleRejectVehicle` (handle reject vehicle). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleRejectVehicle
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleRejectVehicle(action) {
    try {
        const { id } = action.payload;
        const response = yield call(
            [api, api.patch],
            `/vehicles/${id}/reject`,
            undefined,
            { timeout: 15000 }
        );
        yield put(rejectVehicleSuccess(extractData(response)));
        yield put(fetchAllVehiclesRequest());
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(rejectVehicleSuccess({ ...action.payload.vehicle, status: "REJECTED" }));
            return;
        }

        yield put(rejectVehicleFailure(getErrorMessage(error, "Từ chối xe thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchPricingPolicies` (handle fetch pricing policies). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchPricingPolicies
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchPricingPolicies(action) {
    try {
        const response = yield call([api, api.get], "/pricing-policies", {
            params: action.payload,
        });
        yield put(fetchPricingPoliciesSuccess(extractList(response, ["pricingPolicies"])));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(fetchPricingPoliciesSuccess(pricingPolicySeed));
            return;
        }

        yield put(fetchPricingPoliciesFailure(getErrorMessage(error, "Không lấy được bảng giá.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleSavePricingPolicy` (handle save pricing policy). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleSavePricingPolicy
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleSavePricingPolicy(action) {
    try {
        const payload = action.payload;
        const hasSavedId = payload.id && !String(payload.id).startsWith("PRICE-");
        const response = hasSavedId
            ? yield call([api, api.put], `/pricing-policies/${payload.id}`, payload)
            : yield call([api, api.post], "/pricing-policies", payload);

        yield put(savePricingPolicySuccess(extractData(response)));
        yield put(fetchPricingPoliciesRequest({ buildingId: payload.buildingId }));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(savePricingPolicySuccess(withId(action.payload, "PRICE")));
            return;
        }

        yield put(savePricingPolicyFailure(getErrorMessage(error, "Lưu bảng giá thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchPackagePlans` (handle fetch package plans). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchPackagePlans
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchPackagePlans(action) {
    try {
        const response = yield call([api, api.get], "/package-plans", {
            params: action.payload,
        });
        yield put(fetchPackagePlansSuccess(extractList(response, ["packagePlans", "plans"])));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(fetchPackagePlansSuccess(packagePlanSeed));
            return;
        }

        yield put(fetchPackagePlansFailure(getErrorMessage(error, "Không lấy được danh sách gói tháng.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleSavePackagePlan` (handle save package plan). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleSavePackagePlan
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleSavePackagePlan(action) {
    try {
        const payload = action.payload;
        const hasSavedId = payload.id && !String(payload.id).startsWith("PKG-");
        const response = hasSavedId
            ? yield call([api, api.put], `/package-plans/${payload.id}`, payload)
            : yield call([api, api.post], "/package-plans", payload);

        yield put(savePackagePlanSuccess(extractData(response)));
        yield put(fetchPackagePlansRequest({ buildingId: payload.buildingId }));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(savePackagePlanSuccess(withId(action.payload, "PKG")));
            return;
        }

        yield put(savePackagePlanFailure(getErrorMessage(error, "Lưu gói tháng thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleDeactivatePackagePlan` (handle deactivate package plan). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleDeactivatePackagePlan
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleDeactivatePackagePlan(action) {
    try {
        const { id } = action.payload;
        yield call([api, api.delete], `/package-plans/${id}`);
        yield put(deactivatePackagePlanSuccess({ id }));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(deactivatePackagePlanSuccess({ id: action.payload.id }));
            return;
        }

        yield put(deactivatePackagePlanFailure(getErrorMessage(error, "Ngưng gói tháng thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleBuyPackagePlan` (handle buy package plan). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleBuyPackagePlan
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleBuyPackagePlan(action) {
    try {
        const { id, ...payload } = action.payload;
        const response = yield call([api, api.post], `/package-plans/${id}/buy`, payload);
        const data = extractData(response);

        yield put(buyPackagePlanSuccess(data));
        yield put(fetchMyMonthlyPassesRequest());
        yield call(redirectToPayment, extractPaymentUrl(data));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(
                buyPackagePlanSuccess({
                    paymentUrl: "#",
                    packagePlanId: action.payload.id,
                    vehicleId: action.payload.vehicleId,
                    status: "PENDING_PAYMENT",
                })
            );
            return;
        }

        yield put(buyPackagePlanFailure(getErrorMessage(error, "Tạo thanh toán gói tháng thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchMonthlyPasses` (handle fetch monthly passes). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchMonthlyPasses
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchMonthlyPasses(action) {
    try {
        const response = yield call([api, api.get], "/monthly-passes", {
            params: action.payload,
        });
        yield put(fetchMonthlyPassesSuccess(extractList(response, ["monthlyPasses"])));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(fetchMonthlyPassesSuccess(monthlyPasses));
            return;
        }

        yield put(fetchMonthlyPassesFailure(getErrorMessage(error, "Không lấy được danh sách thẻ tháng.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchMyMonthlyPasses` (handle fetch my monthly passes). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchMyMonthlyPasses
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchMyMonthlyPasses() {
    try {
        const response = yield call([api, api.get], "/monthly-passes/my");
        yield put(fetchMyMonthlyPassesSuccess(extractList(response, ["monthlyPasses"])));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(
                fetchMyMonthlyPassesSuccess(
                    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
                    monthlyPasses.filter((pass) => pass.userId === 1)
                )
            );
            return;
        }

        yield put(fetchMyMonthlyPassesFailure(getErrorMessage(error, "Không lấy được gói tháng của bạn.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleCreateMonthlyPass` (handle create monthly pass). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleCreateMonthlyPass
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleCreateMonthlyPass(action) {
    try {
        const response = yield call([api, api.post], "/monthly-passes", action.payload);
        yield put(createMonthlyPassSuccess(extractData(response)));
        yield put(fetchMonthlyPassesRequest());
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(createMonthlyPassSuccess(withId(action.payload, "PASS")));
            return;
        }

        yield put(createMonthlyPassFailure(getErrorMessage(error, "Tạo thẻ tháng thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleContinueMonthlyPassPayment` (handle continue monthly pass payment). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleContinueMonthlyPassPayment
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleContinueMonthlyPassPayment(action) {
    try {
        const { id, ...payload } = action.payload;
        const response = yield call(
            [api, api.post],
            `/monthly-passes/${id}/payment-url`,
            payload
        );
        const data = extractData(response);

        yield put(continueMonthlyPassPaymentSuccess(data));
        yield call(redirectToPayment, extractPaymentUrl(data));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(
                continueMonthlyPassPaymentSuccess({
                    monthlyPass: {
                        id: action.payload.id,
                        status: "PENDING_PAYMENT",
                        paymentUrl: "#",
                    },
                })
            );
            return;
        }

        yield put(
            continueMonthlyPassPaymentFailure(
                getErrorMessage(error, "Không mở lại được yêu cầu thanh toán.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchTempQrCards` (handle fetch temp qr cards). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchTempQrCards
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchTempQrCards(action) {
    const { params, silent } = splitSyncOptions(action.payload);

    try {
        const response = yield call([api, api.get], "/temp-qr-cards", {
            params,
        });
        yield put(fetchTempQrCardsSuccess(syncCollectionPayload(
            extractList(response, ["tempQrCards", "cards"]),
            silent
        )));
    } catch (error) {
        if (shouldUseSample(error)) {
            const status = params.status;
            const buildingId = params.buildingId;
            const cards = readStoredTempQrCards();
            yield put(
                fetchTempQrCardsSuccess(syncCollectionPayload(
                    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
                    cards.filter((card) =>
                        (!status || card.status === status) &&
                        (!buildingId || String(card.buildingId || 1) === String(buildingId))
                    ),
                    silent
                ))
            );
            return;
        }

        yield put(fetchTempQrCardsFailure({
            error: getErrorMessage(error, "Không lấy được danh sách QR tạm."),
            silent,
        }));
    }
}

/**
 * Xử lý nghiệp vụ `handleCreateTempQrCard` (handle create temp qr card). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleCreateTempQrCard
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleCreateTempQrCard(action) {
    try {
        const response = yield call([api, api.post], "/temp-qr-cards", action.payload);
        yield put(createTempQrCardSuccess(extractData(response)));
        yield put(fetchTempQrCardsRequest({
            buildingId: action.payload?.buildingId,
            status: action.payload?.status,
        }));
    } catch (error) {
        if (shouldUseSample(error)) {
            const card = withId(
                {
                    label: action.payload.cardCode || action.payload.id,
                    status: "READY",
                    currentSessionId: null,
                    ...action.payload,
                },
                "TMP"
            );
            /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
            const cards = [card, ...readStoredTempQrCards().filter((item) => item.cardCode !== card.cardCode)];
            writeStoredTempQrCards(cards);
            yield put(
                createTempQrCardSuccess(card)
            );
            return;
        }

        yield put(createTempQrCardFailure(getErrorMessage(error, "Tạo QR tạm thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleUpdateTempQrCardStatus` (handle update temp qr card status). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleUpdateTempQrCardStatus
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleUpdateTempQrCardStatus(action) {
    try {
        const { id, status } = action.payload;
        const response = yield call([api, api.patch], `/temp-qr-cards/${id}/status`, {
            status,
        });
        yield put(updateTempQrCardStatusSuccess(extractData(response)));
    } catch (error) {
        if (shouldUseSample(error)) {
            /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
            const cards = readStoredTempQrCards().map((card) =>
                String(card.id) === String(action.payload.id) ? { ...card, ...action.payload } : card
            );
            writeStoredTempQrCards(cards);
            yield put(updateTempQrCardStatusSuccess(action.payload));
            return;
        }

        yield put(updateTempQrCardStatusFailure(getErrorMessage(error, "Cập nhật QR tạm thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchMyQrPasses` (handle fetch my qr passes). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchMyQrPasses
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchMyQrPasses() {
    try {
        const response = yield call([api, api.get], "/qr-passes/my");
        yield put(fetchMyQrPassesSuccess(extractList(response, ["qrPasses", "passes"])));
    } catch (error) {
        if (shouldUseSample(error)) {
            /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
            yield put(fetchMyQrPassesSuccess(monthlyPasses.filter((pass) => pass.userId === 1)));
            return;
        }

        yield put(fetchMyQrPassesFailure(getErrorMessage(error, "Không lấy được mã QR của bạn.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchQrPasses` (handle fetch qr passes). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchQrPasses
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchQrPasses(action) {
    try {
        const response = yield call([api, api.get], "/qr-passes", {
            params: action.payload,
        });
        yield put(fetchQrPassesSuccess(extractList(response, ["qrPasses", "passes"])));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(fetchQrPassesSuccess(monthlyPasses));
            return;
        }

        yield put(fetchQrPassesFailure(getErrorMessage(error, "Không lấy được danh sách mã QR.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleValidateQrPass` (handle validate qr pass). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleValidateQrPass
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleValidateQrPass(action) {
    try {
        const response = yield call([api, api.post], "/qr-passes/validate", action.payload);
        yield put(validateQrPassSuccess(extractData(response)));
    } catch (error) {
        if (shouldUseSample(error)) {
            const qrCode = action.payload?.qrCode;
            /* Callback nội bộ của lời gọi `find`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
            const pass = monthlyPasses.find((item) => item.qrCode === qrCode);
            yield put(
                validateQrPassSuccess({
                    valid: Boolean(pass),
                    pass,
                    message: pass ? "Mã QR hợp lệ." : "Không tìm thấy mã QR hợp lệ.",
                })
            );
            return;
        }

        yield put(validateQrPassFailure(getErrorMessage(error, "Kiểm tra mã QR thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleUpdateQrPassStatus` (handle update qr pass status). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleUpdateQrPassStatus
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleUpdateQrPassStatus(action) {
    try {
        const { id, status } = action.payload;
        const response = yield call([api, api.patch], `/qr-passes/${id}/status`, {
            status,
        });
        yield put(updateQrPassStatusSuccess(extractData(response)));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(updateQrPassStatusSuccess(action.payload));
            return;
        }

        yield put(updateQrPassStatusFailure(getErrorMessage(error, "Cập nhật mã QR thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchMySlotRegistrations` (handle fetch my slot registrations). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchMySlotRegistrations
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchMySlotRegistrations() {
    try {
        const response = yield call([api, api.get], "/slot-registrations/my");
        yield put(fetchMySlotRegistrationsSuccess(extractList(response, ["slotRegistrations", "registrations"])));
    } catch (error) {
        if (shouldUseSample(error)) {
            /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
            yield put(fetchMySlotRegistrationsSuccess(slotRegistrations.filter((item) => item.userId === 1)));
            return;
        }

        yield put(fetchMySlotRegistrationsFailure(getErrorMessage(error, "Không lấy được yêu cầu giữ ô đỗ.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleCreateSlotRegistration` (handle create slot registration). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleCreateSlotRegistration
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleCreateSlotRegistration(action) {
    try {
        const response = yield call([api, api.post], "/slot-registrations", action.payload);
        const data = extractData(response);
        yield put(createSlotRegistrationSuccess(data));
        yield put(fetchMySlotRegistrationsRequest());
        yield call(redirectToPayment, extractPaymentUrl(data));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(
                createSlotRegistrationSuccess(
                    withId(
                        {
                            userId: 1,
                            status: "PENDING_PAYMENT",
                            amount: 1800000,
                            ...action.payload,
                        },
                        "REG"
                    )
                )
            );
            return;
        }

        yield put(createSlotRegistrationFailure(getErrorMessage(error, "Đăng ký ô đỗ thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchMyNotifications` (handle fetch my notifications). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchMyNotifications
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchMyNotifications() {
    try {
        const response = yield call([api, api.get], "/notifications/my");
        yield put(fetchMyNotificationsSuccess(extractList(response, ["notifications"])));
    } catch (error) {
        yield put(fetchMyNotificationsFailure(getErrorMessage(error, "Không lấy được thông báo của bạn.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleMarkNotificationRead` (handle mark notification read). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleMarkNotificationRead
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleMarkNotificationRead(action) {
    try {
        const response = yield call(
            [api, api.patch],
            `/notifications/${action.payload.id}/read`
        );
        yield put(markNotificationReadSuccess(extractData(response)));
    } catch (error) {
        yield put(
            markNotificationReadFailure(
                getErrorMessage(error, "Không đánh dấu được thông báo đã đọc.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleMarkAllNotificationsRead` (handle mark all notifications read). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleMarkAllNotificationsRead
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleMarkAllNotificationsRead() {
    try {
        yield call([api, api.patch], "/notifications/my/read-all");
        yield put(markAllNotificationsReadSuccess());
    } catch (error) {
        yield put(
            markAllNotificationsReadFailure(
                getErrorMessage(error, "Không đánh dấu được tất cả thông báo.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchNotificationPreferences` (handle fetch notification preferences). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchNotificationPreferences
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchNotificationPreferences() {
    try {
        const response = yield call([api, api.get], "/notifications/preferences");
        yield put(fetchNotificationPreferencesSuccess(extractData(response)));
    } catch (error) {
        yield put(
            fetchNotificationPreferencesFailure(
                getErrorMessage(error, "Không lấy được tùy chọn thông báo.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleUpdateNotificationPreferences` (handle update notification preferences). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleUpdateNotificationPreferences
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleUpdateNotificationPreferences(action) {
    try {
        const response = yield call(
            [api, api.patch],
            "/notifications/preferences",
            action.payload
        );
        yield put(updateNotificationPreferencesSuccess(extractData(response)));
    } catch (error) {
        yield put(
            updateNotificationPreferencesFailure(
                getErrorMessage(error, "Không cập nhật được tùy chọn thông báo.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchStaffAssignments` (handle fetch staff assignments). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchStaffAssignments
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchStaffAssignments(action) {
    try {
        const response = yield call([api, api.get], "/users/staff-candidates", {
            params: action.payload,
        });

        yield put(fetchStaffAssignmentsSuccess(extractData(response)));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(fetchStaffAssignmentsSuccess({ staff: [], building: null }));
            return;
        }

        yield put(
            fetchStaffAssignmentsFailure(
                getErrorMessage(error, "Không lấy được danh sách nhân viên.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleAssignStaffToBuilding` (handle assign staff to building). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleAssignStaffToBuilding
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleAssignStaffToBuilding(action) {
    try {
        const { id } = action.payload;
        const response = yield call([api, api.patch], `/users/staff/${id}/building`);

        yield put(assignStaffToBuildingSuccess(extractData(response)));
        yield put(fetchStaffAssignmentsRequest());
    } catch (error) {
        yield put(
            assignStaffToBuildingFailure(
                getErrorMessage(error, "Không gán được nhân viên vào tòa nhà.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchWrongSlotCases` (handle fetch wrong slot cases). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchWrongSlotCases
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchWrongSlotCases(action) {
    const { params, silent } = splitSyncOptions(action.payload);

    try {
        const response = yield call([api, api.get], "/wrong-slot-cases", {
            params,
        });
        yield put(fetchWrongSlotCasesSuccess(syncCollectionPayload(
            extractList(response, ["wrongSlotCases", "cases"]),
            silent
        )));
    } catch (error) {
        yield put(fetchWrongSlotCasesFailure({
            error: getErrorMessage(error, "Không lấy được danh sách đậu sai ô."),
            silent,
        }));
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchMyWrongSlotCases` (handle fetch my wrong slot cases). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchMyWrongSlotCases
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchMyWrongSlotCases(action) {
    const { params, silent } = splitSyncOptions(action.payload);

    try {
        const response = yield call([api, api.get], "/wrong-slot-cases/my", {
            params,
        });
        yield put(
            fetchMyWrongSlotCasesSuccess(syncCollectionPayload(
                extractList(response, ["wrongSlotCases", "cases"]),
                silent
            ))
        );
    } catch (error) {
        yield put(
            fetchMyWrongSlotCasesFailure({
                error: getErrorMessage(error, "Không lấy được tình trạng ô đỗ của bạn."),
                silent,
            })
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleMarkMyWrongSlotMoved` (handle mark my wrong slot moved). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleMarkMyWrongSlotMoved
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleMarkMyWrongSlotMoved(action) {
    try {
        const response = yield call(
            [api, api.post],
            `/wrong-slot-cases/my/${action.payload.id}/moved`
        );
        yield put(markMyWrongSlotMovedSuccess(extractData(response)));
        yield put(fetchMyWrongSlotCasesRequest());
        yield put(fetchMyNotificationsRequest());
        yield put(fetchMySlotRegistrationsRequest());
    } catch (error) {
        yield put(
            markMyWrongSlotMovedFailure(
                getErrorMessage(error, "Không xác nhận được việc dời xe.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleReportWrongSlot` (handle report wrong slot). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleReportWrongSlot
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleReportWrongSlot(action) {
    try {
        const { buildingId, ...payload } = action.payload || {};
        const response = yield call([api, api.post], "/wrong-slot-cases/report", payload);
        yield put(reportWrongSlotSuccess(extractData(response)));
        yield put(fetchWrongSlotCasesRequest({
            ...(buildingId ? { buildingId } : {}),
            silent: true,
        }));
        yield put(fetchActiveParkingSessionsRequest({
            ...(buildingId ? { buildingId } : {}),
            silent: true,
        }));
    } catch (error) {
        yield put(reportWrongSlotFailure(getErrorMessage(error, "Ghi nhận đậu sai ô thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleConfirmWrongSlot` (handle confirm wrong slot). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleConfirmWrongSlot
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleConfirmWrongSlot(action) {
    try {
        const { buildingId, id, ...payload } = action.payload;
        const response = yield call([api, api.post], `/wrong-slot-cases/${id}/confirm`, payload);
        yield put(confirmWrongSlotSuccess(extractData(response)));
        yield put(fetchWrongSlotCasesRequest({
            ...(buildingId ? { buildingId } : {}),
            silent: true,
        }));
        yield put(fetchActiveParkingSessionsRequest({
            ...(buildingId ? { buildingId } : {}),
            silent: true,
        }));
        yield put(fetchViolationsRequest());
    } catch (error) {
        yield put(confirmWrongSlotFailure(getErrorMessage(error, "Xác nhận đậu sai ô thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchHourlyReservationAvailability` (handle fetch hourly reservation availability). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchHourlyReservationAvailability
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchHourlyReservationAvailability(action) {
    try {
        const response = yield call(
            [api, api.get],
            "/hourly-slot-reservations/availability",
            { params: action.payload }
        );
        yield put(
            fetchHourlyReservationAvailabilitySuccess(extractData(response))
        );
    } catch (error) {
        yield put(
            fetchHourlyReservationAvailabilityFailure(
                getErrorMessage(
                    error,
                    "Không thể tải các ô đỗ phù hợp với khung giờ đã chọn."
                )
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchHourlyCheckInMatch` (handle fetch hourly check in match). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchHourlyCheckInMatch
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchHourlyCheckInMatch(action) {
    try {
        const response = yield call(
            [api, api.get],
            "/hourly-slot-reservations/check-in-match",
            { params: action.payload }
        );
        yield put(fetchHourlyCheckInMatchSuccess(extractData(response)));
    } catch {
        yield put(fetchHourlyCheckInMatchFailure());
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchMyHourlyReservations` (handle fetch my hourly reservations). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchMyHourlyReservations
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchMyHourlyReservations() {
    try {
        const response = yield call(
            [api, api.get],
            "/hourly-slot-reservations/my"
        );
        yield put(
            fetchMyHourlyReservationsSuccess(
                extractList(response, ["reservations"])
            )
        );
    } catch (error) {
        yield put(
            fetchMyHourlyReservationsFailure(
                getErrorMessage(error, "Không thể tải danh sách ô đã đặt.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchStaffHourlyReservations` (handle fetch staff hourly reservations). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchStaffHourlyReservations
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchStaffHourlyReservations(action) {
    try {
        const response = yield call(
            [api, api.get],
            "/hourly-slot-reservations/staff",
            { params: action.payload }
        );
        yield put(
            fetchStaffHourlyReservationsSuccess(
                extractList(response, ["reservations"])
            )
        );
    } catch (error) {
        yield put(
            fetchStaffHourlyReservationsFailure(
                getErrorMessage(
                    error,
                    "Không thể tải danh sách đặt ô của tòa nhà."
                )
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleCreateUserHourlyReservation` (handle create user hourly reservation). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleCreateUserHourlyReservation
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleCreateUserHourlyReservation(action) {
    try {
        const response = yield call(
            [api, api.post],
            "/hourly-slot-reservations/my",
            action.payload
        );
        const data = extractData(response);

        yield put(createUserHourlyReservationSuccess(data));
        yield put(fetchMyHourlyReservationsRequest());
        yield call(redirectToPayment, extractPaymentUrl(data));
    } catch (error) {
        yield put(
            createUserHourlyReservationFailure(
                getErrorMessage(error, "Không thể tạo lượt đặt ô theo giờ.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleCreateGuestHourlyReservation` (handle create guest hourly reservation). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleCreateGuestHourlyReservation
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleCreateGuestHourlyReservation(action) {
    try {
        const response = yield call(
            [api, api.post],
            "/hourly-slot-reservations/staff",
            action.payload
        );
        const data = extractData(response);

        yield put(createGuestHourlyReservationSuccess(data));
        yield put(
            fetchStaffHourlyReservationsRequest({
                buildingId: action.payload?.buildingId,
            })
        );
        yield put(
            fetchHourlyReservationAvailabilityRequest({
                buildingId: action.payload?.buildingId,
                endAt: action.payload?.endAt,
                startAt: action.payload?.startAt,
            })
        );
        yield call(redirectToPayment, extractPaymentUrl(data));
    } catch (error) {
        yield put(
            createGuestHourlyReservationFailure(
                getErrorMessage(
                    error,
                    "Không thể tạo lượt đặt ô cho khách vãng lai."
                )
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleMarkWrongSlotMoved` (handle mark wrong slot moved). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleMarkWrongSlotMoved
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleMarkWrongSlotMoved(action) {
    try {
        const {
            buildingId,
            floorIds = [],
            id,
        } = action.payload;
        const response = yield call(
            [api, api.post],
            `/wrong-slot-cases/${id}/moved`
        );
        yield put(markWrongSlotMovedSuccess(extractData(response)));
        yield put(fetchWrongSlotCasesRequest({
            ...(buildingId ? { buildingId } : {}),
            silent: true,
        }));
        yield put(fetchActiveParkingSessionsRequest({
            ...(buildingId ? { buildingId } : {}),
            silent: true,
        }));

        for (const floorId of floorIds) {
            yield put(fetchSlotsByFloorRequest({ floorId, silent: true }));
        }
    } catch (error) {
        yield put(
            markWrongSlotMovedFailure(
                getErrorMessage(error, "Không xác nhận được việc xe đã dời.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchFloorMismatchCases` (handle fetch floor mismatch cases). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchFloorMismatchCases
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchFloorMismatchCases(action) {
    const { params, silent } = splitSyncOptions(action.payload);

    try {
        const response = yield call([api, api.get], "/floor-mismatch-cases", {
            params,
        });
        yield put(
            fetchFloorMismatchCasesSuccess(syncCollectionPayload(
                extractList(response, ["floorMismatchCases", "cases"]),
                silent
            ))
        );
    } catch (error) {
        yield put(
            fetchFloorMismatchCasesFailure({
                error: getErrorMessage(error, "Không lấy được danh sách xe đậu sai khu."),
                silent,
            })
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchMyFloorMismatchCases` (handle fetch my floor mismatch cases). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchMyFloorMismatchCases
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchMyFloorMismatchCases(action) {
    const { params, silent } = splitSyncOptions(action.payload);

    try {
        const response = yield call([api, api.get], "/floor-mismatch-cases/my", {
            params,
        });
        yield put(
            fetchMyFloorMismatchCasesSuccess(syncCollectionPayload(
                extractList(response, ["floorMismatchCases", "cases"]),
                silent
            ))
        );
    } catch (error) {
        yield put(
            fetchMyFloorMismatchCasesFailure({
                error: getErrorMessage(error, "Không lấy được tình trạng xe đậu sai khu."),
                silent,
            })
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleMarkMyFloorMismatchMoved` (handle mark my floor mismatch moved). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleMarkMyFloorMismatchMoved
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleMarkMyFloorMismatchMoved(action) {
    try {
        const response = yield call(
            [api, api.post],
            `/floor-mismatch-cases/my/${action.payload.id}/moved`
        );
        yield put(markMyFloorMismatchMovedSuccess(extractData(response)));
        yield put(fetchMyFloorMismatchCasesRequest());
        yield put(fetchMyNotificationsRequest());
    } catch (error) {
        yield put(
            markMyFloorMismatchMovedFailure(
                getErrorMessage(error, "Không xác nhận được việc dời xe.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleReportFloorMismatch` (handle report floor mismatch). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleReportFloorMismatch
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleReportFloorMismatch(action) {
    try {
        const { buildingId, ...payload } = action.payload || {};
        const response = yield call([api, api.post], "/floor-mismatch-cases/report", payload);
        yield put(reportFloorMismatchSuccess(extractData(response)));
        yield put(fetchFloorMismatchCasesRequest({
            ...(buildingId ? { buildingId } : {}),
            silent: true,
        }));
        yield put(fetchActiveParkingSessionsRequest({
            ...(buildingId ? { buildingId } : {}),
            silent: true,
        }));
        yield put(fetchViolationsRequest());
    } catch (error) {
        yield put(
            reportFloorMismatchFailure(
                getErrorMessage(error, "Ghi nhận xe đậu sai khu thất bại.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleConfirmFloorMismatch` (handle confirm floor mismatch). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleConfirmFloorMismatch
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleConfirmFloorMismatch(action) {
    try {
        const { buildingId, id, ...payload } = action.payload;
        const response = yield call([api, api.post], `/floor-mismatch-cases/${id}/confirm`, payload);
        yield put(confirmFloorMismatchSuccess(extractData(response)));
        yield put(fetchFloorMismatchCasesRequest({
            ...(buildingId ? { buildingId } : {}),
            silent: true,
        }));
        yield put(fetchActiveParkingSessionsRequest({
            ...(buildingId ? { buildingId } : {}),
            silent: true,
        }));
        yield put(fetchViolationsRequest());
    } catch (error) {
        yield put(
            confirmFloorMismatchFailure(
                getErrorMessage(error, "Xác nhận xe đậu sai khu thất bại.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleMarkFloorMismatchMoved` (handle mark floor mismatch moved). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleMarkFloorMismatchMoved
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleMarkFloorMismatchMoved(action) {
    try {
        const {
            buildingId,
            floorIds = [],
            id,
        } = action.payload;
        const response = yield call(
            [api, api.post],
            `/floor-mismatch-cases/${id}/moved`
        );
        yield put(markFloorMismatchMovedSuccess(extractData(response)));
        yield put(fetchFloorMismatchCasesRequest({
            ...(buildingId ? { buildingId } : {}),
            silent: true,
        }));
        yield put(fetchActiveParkingSessionsRequest({
            ...(buildingId ? { buildingId } : {}),
            silent: true,
        }));

        for (const floorId of floorIds) {
            yield put(fetchSlotsByFloorRequest({ floorId, silent: true }));
        }
    } catch (error) {
        yield put(
            markFloorMismatchMovedFailure(
                getErrorMessage(error, "Không xác nhận được việc xe đã dời.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchActiveParkingSessions` (handle fetch active parking sessions). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchActiveParkingSessions
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchActiveParkingSessions(action) {
    const { params, silent } = splitSyncOptions(action.payload);

    try {
        const response = yield call([api, api.get], "/parking-sessions/active", {
            params,
        });
        yield put(fetchActiveParkingSessionsSuccess(syncCollectionPayload(
            extractList(response, ["parkingSessions", "sessions"]),
            silent
        )));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(
                fetchActiveParkingSessionsSuccess(syncCollectionPayload(
                    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
                    parkingSessions.filter((session) =>
                        ["ACTIVE", "PENDING_PAYMENT"].includes(session.status)
                    ),
                    silent
                ))
            );
            return;
        }

        yield put(fetchActiveParkingSessionsFailure({
            error: getErrorMessage(error, "Không lấy được danh sách xe đang gửi."),
            silent,
        }));
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchDailyParkingActivity` (handle fetch daily parking activity). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchDailyParkingActivity
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchDailyParkingActivity(action) {
    try {
        const response = yield call([api, api.get], "/parking-sessions/daily-activity", {
            params: action.payload,
        });
        yield put(fetchDailyParkingActivitySuccess(extractData(response) || {}));
    } catch (error) {
        yield put(
            fetchDailyParkingActivityFailure(
                getErrorMessage(error, "Không lấy được lượt xe ra vào trong ngày.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleRecognizePlate` (handle recognize plate). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleRecognizePlate
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleRecognizePlate(action) {
    const requestId = action.payload?.requestId;

    try {
        const formData = new FormData();
        formData.append("image", action.payload?.file);
        const response = yield call(
            [api, api.post],
            "/parking-sessions/recognize-plate",
            formData
        );
        yield put(recognizePlateSuccess({
            ...(extractData(response) || {}),
            requestId,
        }));
    } catch (error) {
        yield put(recognizePlateFailure({
            error: getErrorMessage(error, "Không đọc được biển số xe từ ảnh."),
            requestId,
        }));
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchMyActiveParkingSessions` (handle fetch my active parking sessions). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchMyActiveParkingSessions
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchMyActiveParkingSessions() {
    try {
        const response = yield call([api, api.get], "/parking-sessions/my-active");
        yield put(fetchMyActiveParkingSessionsSuccess(extractList(response, ["parkingSessions", "sessions"])));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(
                fetchMyActiveParkingSessionsSuccess(
                    /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
                    parkingSessions.filter((session) =>
                        session.userId === 1 &&
                        ["ACTIVE", "PENDING_PAYMENT"].includes(session.status)
                    )
                )
            );
            return;
        }

        yield put(fetchMyActiveParkingSessionsFailure(getErrorMessage(error, "Không lấy được xe đang gửi của bạn.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleCheckIn` (handle check in). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleCheckIn
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleCheckIn(action) {
    try {
        const response = yield call([api, api.post], "/parking-sessions/check-in", action.payload);
        yield put(checkInSuccess(extractData(response)));
        yield put(fetchActiveParkingSessionsRequest({ silent: true }));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(
                checkInSuccess(
                    withId(
                        {
                            status: "ACTIVE",
                            checkInAt: new Date().toISOString(),
                            paymentStatus: "UNPAID",
                            ...action.payload,
                        },
                        "SESS"
                    )
                )
            );
            return;
        }

        yield put(checkInFailure(getErrorMessage(error, "Ghi nhận xe vào thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleCheckOut` (handle check out). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleCheckOut
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleCheckOut(action) {
    try {
        const { id, ...payload } = action.payload;
        const response = yield call([api, api.post], `/parking-sessions/${id}/check-out`, payload);
        const data = extractData(response);
        yield put(checkOutSuccess(data));
        yield put(fetchActiveParkingSessionsRequest());
        yield call(redirectToPayment, extractPaymentUrl(data));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(
                checkOutSuccess({
                    id: action.payload.id,
                    status: action.payload.paymentMethod === "VNPAY" ? "PENDING_PAYMENT" : "COMPLETED",
                    paymentMethod: action.payload.paymentMethod,
                    totalAmount: action.payload.totalAmount,
                    checkOutAt: new Date().toISOString(),
                })
            );
            return;
        }

        yield put(checkOutFailure(getErrorMessage(error, "Ghi nhận xe ra thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleCheckOutByQr` (handle check out by qr). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleCheckOutByQr
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleCheckOutByQr(action) {
    try {
        const response = yield call([api, api.post], "/parking-sessions/check-out-by-qr", action.payload);
        const data = extractData(response);
        yield put(checkOutByQrSuccess(data));
        yield put(fetchActiveParkingSessionsRequest());
        yield call(redirectToPayment, extractPaymentUrl(data));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(
                checkOutByQrSuccess({
                    id: action.payload.sessionId || action.payload.qrCode,
                    status: "COMPLETED",
                    paymentMethod: action.payload.paymentMethod,
                    checkOutAt: new Date().toISOString(),
                })
            );
            return;
        }

        yield put(checkOutByQrFailure(getErrorMessage(error, "Ghi nhận xe ra bằng QR thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchViolations` (handle fetch violations). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchViolations
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchViolations(action) {
    try {
        const response = yield call([api, api.get], "/violations", {
            params: action.payload,
        });
        yield put(fetchViolationsSuccess(extractList(response, ["violations"])));
    } catch (error) {
        if (shouldUseSample(error)) {
            const parkingSessionId = action.payload?.parkingSessionId;
            yield put(
                fetchViolationsSuccess(
                    parkingSessionId
                        /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
                        ? violations.filter((item) => String(item.sessionId) === String(parkingSessionId))
                        : violations
                )
            );
            return;
        }

        yield put(fetchViolationsFailure(getErrorMessage(error, "Không lấy được danh sách vi phạm.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleCreateViolation` (handle create violation). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleCreateViolation
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleCreateViolation(action) {
    try {
        const response = yield call([api, api.post], "/violations", action.payload);
        yield put(createViolationSuccess(extractData(response)));
        yield put(fetchViolationsRequest());
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(
                createViolationSuccess(
                    withId(
                        {
                            status: "OPEN",
                            detectedAt: new Date().toISOString(),
                            fine: action.payload.penaltyFee,
                            sessionId: action.payload.parkingSessionId,
                            type: action.payload.violationType,
                            ...action.payload,
                        },
                        "VIO"
                    )
                )
            );
            return;
        }

        yield put(createViolationFailure(getErrorMessage(error, "Ghi nhận vi phạm thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleUpdateViolationStatus` (handle update violation status). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleUpdateViolationStatus
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleUpdateViolationStatus(action) {
    try {
        const { id, status } = action.payload;
        const response = yield call([api, api.patch], `/violations/${id}/status`, {
            status,
        });
        yield put(updateViolationStatusSuccess(extractData(response)));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(updateViolationStatusSuccess(action.payload));
            return;
        }

        yield put(updateViolationStatusFailure(getErrorMessage(error, "Cập nhật vi phạm thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchReports` (handle fetch reports). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchReports
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchReports(action) {
    try {
        const params = action.payload;
        const response = yield call([api, api.get], "/reports/full", { params });
        const fullReport = extractData(response);

        yield put(
            fetchReportsSuccess({
                ...fullReport,
                full: fullReport,
            })
        );
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(fetchReportsSuccess(buildReportFallback()));
            return;
        }

        yield put(fetchReportsFailure(getErrorMessage(error, "Không lấy được báo cáo.")));
    }
}
/**
 * Xử lý nghiệp vụ `handleFetchViolationTypes` (handle fetch violation types). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchViolationTypes
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchViolationTypes(action) {
    try {
        const includeInactive = Boolean(action.payload?.includeInactive);
        const response = yield call(
            [api, api.get],
            includeInactive ? "/violation-types" : "/violation-types?status=ACTIVE"
        );
        const data = response?.data?.data || response?.data || [];
        yield put(fetchViolationTypesSuccess(data));
    } catch (error) {
        yield put(fetchViolationTypesFailure(error?.response?.data?.message || "Lỗi tải cấu hình vi phạm."));
    }
}

/**
 * Xử lý nghiệp vụ `handleSaveViolationType` (handle save violation type). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleSaveViolationType
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleSaveViolationType(action) {
    try {
        const { includeInactive, ...payload } = action.payload;
        let response;
        if (payload.id) {
            response = yield call([api, api.put], `/violation-types/${payload.id}`, payload);
        } else {
            response = yield call([api, api.post], "/violation-types", payload);
        }
        const data = response?.data?.data || response?.data;
        yield put(saveViolationTypeSuccess(data));
        yield put(fetchViolationTypesRequest({ includeInactive }));
    } catch (error) {
        yield put(saveViolationTypeFailure(error?.response?.data?.message || "Lỗi lưu cấu hình vi phạm."));
    }
}

/**
 * Xử lý nghiệp vụ `handleDeactivateViolationType` (handle deactivate violation type). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleDeactivateViolationType
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleDeactivateViolationType(action) {
    try {
        const response = yield call([api, api.delete], `/violation-types/${action.payload.id}`);
        const data = response?.data?.data || response?.data;
        yield put(deactivateViolationTypeSuccess(data));
        yield put(fetchViolationTypesRequest({
            includeInactive: action.payload?.includeInactive,
        }));
    } catch (error) {
        yield put(saveViolationTypeFailure(error?.response?.data?.message || "Không thể tắt mục cấu hình này."));
    }
}

// Đăng ký watchSaga bên trong luồng root của parkingSaga
export default function* parkingSaga() {
    yield takeLatest(fetchViolationTypesRequest.type, handleFetchViolationTypes);
    yield takeEvery("parking/saveViolationTypeRequest", handleSaveViolationType);
    yield takeEvery("parking/deactivateViolationTypeRequest", handleDeactivateViolationType);
    yield takeLatest(fetchHealthRequest.type, handleHealth);
    yield takeLatest(fetchMyVehiclesRequest.type, handleFetchMyVehicles);
    yield takeLatest(fetchAllVehiclesRequest.type, handleFetchAllVehicles);
    yield takeEvery(createVehicleRequest.type, handleCreateVehicle);
    yield takeEvery(approveVehicleRequest.type, handleApproveVehicle);
    yield takeEvery(rejectVehicleRequest.type, handleRejectVehicle);

    yield takeLatest(fetchPricingPoliciesRequest.type, handleFetchPricingPolicies);
    yield takeEvery(savePricingPolicyRequest.type, handleSavePricingPolicy);
    yield takeLatest(fetchPackagePlansRequest.type, handleFetchPackagePlans);
    yield takeEvery(savePackagePlanRequest.type, handleSavePackagePlan);
    yield takeEvery(deactivatePackagePlanRequest.type, handleDeactivatePackagePlan);
    yield takeEvery(buyPackagePlanRequest.type, handleBuyPackagePlan);
    yield takeLatest(fetchMonthlyPassesRequest.type, handleFetchMonthlyPasses);
    yield takeLatest(fetchMyMonthlyPassesRequest.type, handleFetchMyMonthlyPasses);
    yield takeEvery(createMonthlyPassRequest.type, handleCreateMonthlyPass);
    yield takeEvery(
        continueMonthlyPassPaymentRequest.type,
        handleContinueMonthlyPassPayment
    );

    yield takeLatest(fetchTempQrCardsRequest.type, handleFetchTempQrCards);
    yield takeEvery(createTempQrCardRequest.type, handleCreateTempQrCard);
    yield takeEvery(updateTempQrCardStatusRequest.type, handleUpdateTempQrCardStatus);

    yield takeLatest(fetchMyQrPassesRequest.type, handleFetchMyQrPasses);
    yield takeLatest(fetchQrPassesRequest.type, handleFetchQrPasses);
    yield takeEvery(validateQrPassRequest.type, handleValidateQrPass);
    yield takeEvery(updateQrPassStatusRequest.type, handleUpdateQrPassStatus);

    yield takeLatest(fetchMySlotRegistrationsRequest.type, handleFetchMySlotRegistrations);
    yield takeEvery(createSlotRegistrationRequest.type, handleCreateSlotRegistration);
    yield takeLatest(
        fetchHourlyReservationAvailabilityRequest.type,
        handleFetchHourlyReservationAvailability
    );
    yield takeLatest(
        fetchHourlyCheckInMatchRequest.type,
        handleFetchHourlyCheckInMatch
    );
    yield takeLatest(
        fetchMyHourlyReservationsRequest.type,
        handleFetchMyHourlyReservations
    );
    yield takeLatest(
        fetchStaffHourlyReservationsRequest.type,
        handleFetchStaffHourlyReservations
    );
    yield takeEvery(
        createUserHourlyReservationRequest.type,
        handleCreateUserHourlyReservation
    );
    yield takeEvery(
        createGuestHourlyReservationRequest.type,
        handleCreateGuestHourlyReservation
    );
    yield takeLatest(fetchMyNotificationsRequest.type, handleFetchMyNotifications);
    yield takeEvery(markNotificationReadRequest.type, handleMarkNotificationRead);
    yield takeEvery(
        markAllNotificationsReadRequest.type,
        handleMarkAllNotificationsRead
    );
    yield takeLatest(
        fetchNotificationPreferencesRequest.type,
        handleFetchNotificationPreferences
    );
    yield takeEvery(
        updateNotificationPreferencesRequest.type,
        handleUpdateNotificationPreferences
    );
    yield takeLatest(fetchStaffAssignmentsRequest.type, handleFetchStaffAssignments);
    yield takeEvery(assignStaffToBuildingRequest.type, handleAssignStaffToBuilding);
    yield takeLatest(fetchWrongSlotCasesRequest.type, handleFetchWrongSlotCases);
    yield takeLatest(fetchMyWrongSlotCasesRequest.type, handleFetchMyWrongSlotCases);
    yield takeEvery(markMyWrongSlotMovedRequest.type, handleMarkMyWrongSlotMoved);
    yield takeEvery(reportWrongSlotRequest.type, handleReportWrongSlot);
    yield takeEvery(confirmWrongSlotRequest.type, handleConfirmWrongSlot);
    yield takeEvery(markWrongSlotMovedRequest.type, handleMarkWrongSlotMoved);
    yield takeLatest(fetchFloorMismatchCasesRequest.type, handleFetchFloorMismatchCases);
    yield takeLatest(
        fetchMyFloorMismatchCasesRequest.type,
        handleFetchMyFloorMismatchCases
    );
    yield takeEvery(
        markMyFloorMismatchMovedRequest.type,
        handleMarkMyFloorMismatchMoved
    );
    yield takeEvery(reportFloorMismatchRequest.type, handleReportFloorMismatch);
    yield takeEvery(confirmFloorMismatchRequest.type, handleConfirmFloorMismatch);
    yield takeEvery(
        markFloorMismatchMovedRequest.type,
        handleMarkFloorMismatchMoved
    );

    yield takeLatest(fetchActiveParkingSessionsRequest.type, handleFetchActiveParkingSessions);
    yield takeLatest(fetchDailyParkingActivityRequest.type, handleFetchDailyParkingActivity);
    yield takeLatest(recognizePlateRequest.type, handleRecognizePlate);
    yield takeLatest(fetchMyActiveParkingSessionsRequest.type, handleFetchMyActiveParkingSessions);
    yield takeEvery(checkInRequest.type, handleCheckIn);
    yield takeEvery(checkOutRequest.type, handleCheckOut);
    yield takeEvery(checkOutByQrRequest.type, handleCheckOutByQr);

    yield takeLatest(fetchViolationsRequest.type, handleFetchViolations);
    yield takeEvery(createViolationRequest.type, handleCreateViolation);
    yield takeEvery(updateViolationStatusRequest.type, handleUpdateViolationStatus);

    yield takeLatest(fetchReportsRequest.type, handleFetchReports);
}
