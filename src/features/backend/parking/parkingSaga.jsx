import { all, call, put, takeEvery, takeLatest } from "redux-saga/effects";
import api from "../../../services/api";
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
    fetchTempQrCardsFailure,
    fetchTempQrCardsRequest,
    fetchTempQrCardsSuccess,
    fetchViolationsFailure,
    fetchViolationsRequest,
    fetchViolationsSuccess,
    rejectVehicleFailure,
    rejectVehicleRequest,
    rejectVehicleSuccess,
    savePackagePlanFailure,
    savePackagePlanRequest,
    savePackagePlanSuccess,
    savePricingPolicyFailure,
    savePricingPolicyRequest,
    savePricingPolicySuccess,
    updateQrPassStatusFailure,
    updateQrPassStatusRequest,
    updateQrPassStatusSuccess,
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

const packagePlanSeed = monthlyPackages.map((plan) => ({
    ...plan,
    durationDays: Number(String(plan.duration).replace(/\D/g, "")) || 30,
    status: "ACTIVE",
}));

const extractData = (response) => response?.data?.data || response?.data || null;

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

const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

const shouldUseSample = (error) => !error?.response;

const TEMP_QR_STORAGE_KEY = "parking_temp_qr_cards";
const PAYMENT_RETURN_STORAGE_KEY = "parking_payment_return_path";

const readStoredTempQrCards = () => {
    try {
        const stored = localStorage.getItem(TEMP_QR_STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : null;
        return Array.isArray(parsed) ? parsed : tempQrCards;
    } catch {
        return tempQrCards;
    }
};

const writeStoredTempQrCards = (cards) => {
    try {
        localStorage.setItem(TEMP_QR_STORAGE_KEY, JSON.stringify(cards));
    } catch {
        // Ignore storage errors; the active page state still contains the new QR card.
    }
};

const extractPaymentUrl = (data) =>
    data?.payment?.paymentUrl ||
    data?.paymentUrl ||
    data?.registration?.paymentUrl ||
    data?.monthlyPass?.paymentUrl;

const redirectToPayment = (paymentUrl) => {
    if (!paymentUrl || paymentUrl === "#") return;

    sessionStorage.setItem(
        PAYMENT_RETURN_STORAGE_KEY,
        `${window.location.pathname}${window.location.search || ""}`
    );
    window.location.assign(paymentUrl);
};

const withId = (payload, prefix) => ({
    id: payload?.id || `${prefix}-${Date.now()}`,
    ...payload,
});

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
        pendingAmount: violations.reduce((sum, item) => sum + Number(item.fine || 0), 0),
    },
});

function* handleHealth() {
    try {
        yield call([api, api.get], "/health");
        yield put(fetchHealthSuccess({ checkedAt: new Date().toISOString() }));
    } catch (error) {
        yield put(fetchHealthFailure(getErrorMessage(error, "Chưa kiểm tra được tình trạng hệ thống.")));
    }
}

function* handleFetchMyVehicles() {
    try {
        const response = yield call([api, api.get], "/vehicles/my");
        yield put(fetchMyVehiclesSuccess(extractList(response, ["vehicles"])));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(fetchMyVehiclesSuccess(vehicles.filter((vehicle) => vehicle.userId === 1)));
            return;
        }

        yield put(fetchMyVehiclesFailure(getErrorMessage(error, "Không lấy được danh sách xe của bạn.")));
    }
}

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
                    status ? vehicles.filter((vehicle) => vehicle.status === status) : vehicles
                )
            );
            return;
        }

        yield put(fetchAllVehiclesFailure(getErrorMessage(error, "Không lấy được danh sách xe.")));
    }
}

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

function* handleApproveVehicle(action) {
    try {
        const { id } = action.payload;
        const response = yield call([api, api.patch], `/vehicles/${id}/approve`);
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

function* handleRejectVehicle(action) {
    try {
        const { id } = action.payload;
        const response = yield call([api, api.patch], `/vehicles/${id}/reject`);
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

function* handleSavePricingPolicy(action) {
    try {
        const payload = action.payload;
        const hasSavedId = payload.id && !String(payload.id).startsWith("PRICE-");
        const response = hasSavedId
            ? yield call([api, api.put], `/pricing-policies/${payload.id}`, payload)
            : yield call([api, api.post], "/pricing-policies", payload);

        yield put(savePricingPolicySuccess(extractData(response)));
        yield put(fetchPricingPoliciesRequest());
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(savePricingPolicySuccess(withId(action.payload, "PRICE")));
            return;
        }

        yield put(savePricingPolicyFailure(getErrorMessage(error, "Lưu bảng giá thất bại.")));
    }
}

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

function* handleSavePackagePlan(action) {
    try {
        const payload = action.payload;
        const hasSavedId = payload.id && !String(payload.id).startsWith("PKG-");
        const response = hasSavedId
            ? yield call([api, api.put], `/package-plans/${payload.id}`, payload)
            : yield call([api, api.post], "/package-plans", payload);

        yield put(savePackagePlanSuccess(extractData(response)));
        yield put(fetchPackagePlansRequest());
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(savePackagePlanSuccess(withId(action.payload, "PKG")));
            return;
        }

        yield put(savePackagePlanFailure(getErrorMessage(error, "Lưu gói tháng thất bại.")));
    }
}

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

function* handleFetchMonthlyPasses() {
    try {
        const response = yield call([api, api.get], "/monthly-passes");
        yield put(fetchMonthlyPassesSuccess(extractList(response, ["monthlyPasses"])));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(fetchMonthlyPassesSuccess(monthlyPasses));
            return;
        }

        yield put(fetchMonthlyPassesFailure(getErrorMessage(error, "Không lấy được danh sách thẻ tháng.")));
    }
}

function* handleFetchMyMonthlyPasses() {
    try {
        const response = yield call([api, api.get], "/monthly-passes/my");
        yield put(fetchMyMonthlyPassesSuccess(extractList(response, ["monthlyPasses"])));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(
                fetchMyMonthlyPassesSuccess(
                    monthlyPasses.filter((pass) => pass.userId === 1)
                )
            );
            return;
        }

        yield put(fetchMyMonthlyPassesFailure(getErrorMessage(error, "Không lấy được gói tháng của bạn.")));
    }
}

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

function* handleFetchTempQrCards(action) {
    try {
        const response = yield call([api, api.get], "/temp-qr-cards", {
            params: action.payload,
        });
        yield put(fetchTempQrCardsSuccess(extractList(response, ["tempQrCards", "cards"])));
    } catch (error) {
        if (shouldUseSample(error)) {
            const status = action.payload?.status;
            const cards = readStoredTempQrCards();
            yield put(
                fetchTempQrCardsSuccess(
                    status ? cards.filter((card) => card.status === status) : cards
                )
            );
            return;
        }

        yield put(fetchTempQrCardsFailure(getErrorMessage(error, "Không lấy được danh sách QR tạm.")));
    }
}

function* handleCreateTempQrCard(action) {
    try {
        const response = yield call([api, api.post], "/temp-qr-cards", action.payload);
        yield put(createTempQrCardSuccess(extractData(response)));
        yield put(fetchTempQrCardsRequest());
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

function* handleUpdateTempQrCardStatus(action) {
    try {
        const { id, status } = action.payload;
        const response = yield call([api, api.patch], `/temp-qr-cards/${id}/status`, {
            status,
        });
        yield put(updateTempQrCardStatusSuccess(extractData(response)));
    } catch (error) {
        if (shouldUseSample(error)) {
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

function* handleFetchMyQrPasses() {
    try {
        const response = yield call([api, api.get], "/qr-passes/my");
        yield put(fetchMyQrPassesSuccess(extractList(response, ["qrPasses", "passes"])));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(fetchMyQrPassesSuccess(monthlyPasses.filter((pass) => pass.userId === 1)));
            return;
        }

        yield put(fetchMyQrPassesFailure(getErrorMessage(error, "Không lấy được mã QR của bạn.")));
    }
}

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

function* handleValidateQrPass(action) {
    try {
        const response = yield call([api, api.post], "/qr-passes/validate", action.payload);
        yield put(validateQrPassSuccess(extractData(response)));
    } catch (error) {
        if (shouldUseSample(error)) {
            const qrCode = action.payload?.qrCode;
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

function* handleFetchMySlotRegistrations() {
    try {
        const response = yield call([api, api.get], "/slot-registrations/my");
        yield put(fetchMySlotRegistrationsSuccess(extractList(response, ["slotRegistrations", "registrations"])));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(fetchMySlotRegistrationsSuccess(slotRegistrations.filter((item) => item.userId === 1)));
            return;
        }

        yield put(fetchMySlotRegistrationsFailure(getErrorMessage(error, "Không lấy được yêu cầu giữ ô đỗ.")));
    }
}

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

function* handleFetchActiveParkingSessions(action) {
    try {
        const response = yield call([api, api.get], "/parking-sessions/active", {
            params: action.payload,
        });
        yield put(fetchActiveParkingSessionsSuccess(extractList(response, ["parkingSessions", "sessions"])));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(
                fetchActiveParkingSessionsSuccess(
                    parkingSessions.filter((session) =>
                        ["ACTIVE", "PENDING_PAYMENT"].includes(session.status)
                    )
                )
            );
            return;
        }

        yield put(fetchActiveParkingSessionsFailure(getErrorMessage(error, "Không lấy được danh sách xe đang gửi.")));
    }
}

function* handleFetchMyActiveParkingSessions() {
    try {
        const response = yield call([api, api.get], "/parking-sessions/my-active");
        yield put(fetchMyActiveParkingSessionsSuccess(extractList(response, ["parkingSessions", "sessions"])));
    } catch (error) {
        if (shouldUseSample(error)) {
            yield put(
                fetchMyActiveParkingSessionsSuccess(
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

function* handleCheckIn(action) {
    try {
        const response = yield call([api, api.post], "/parking-sessions/check-in", action.payload);
        yield put(checkInSuccess(extractData(response)));
        yield put(fetchActiveParkingSessionsRequest());
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
                        ? violations.filter((item) => String(item.sessionId) === String(parkingSessionId))
                        : violations
                )
            );
            return;
        }

        yield put(fetchViolationsFailure(getErrorMessage(error, "Không lấy được danh sách vi phạm.")));
    }
}

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

function* handleFetchReports(action) {
    try {
        const params = action.payload;
        const [
            traffic,
            motorbikeCapacity,
            carSlots,
            revenue,
            qrPasses,
            violationReport,
        ] = yield all([
            call([api, api.get], "/reports/traffic", { params }),
            call([api, api.get], "/reports/motorbike-capacity", { params }),
            call([api, api.get], "/reports/car-slots", { params }),
            call([api, api.get], "/reports/revenue", { params }),
            call([api, api.get], "/reports/qr-passes", { params }),
            call([api, api.get], "/reports/violations", { params }),
        ]);

        yield put(
            fetchReportsSuccess({
                traffic: extractData(traffic),
                motorbikeCapacity: extractData(motorbikeCapacity),
                carSlots: extractData(carSlots),
                revenue: extractData(revenue),
                qrPasses: extractData(qrPasses),
                violations: extractData(violationReport),
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
function* handleFetchViolationTypes() {
    try {
        const response = yield call([api, api.get], "/violation-types?status=ACTIVE");
        const data = response?.data?.data || response?.data || [];
        yield put(fetchViolationTypesSuccess(data));
    } catch (error) {
        yield put(fetchViolationTypesFailure(error?.response?.data?.message || "Lỗi tải cấu hình vi phạm."));
    }
}

function* handleSaveViolationType(action) {
    try {
        let response;
        if (action.payload.id) {
            response = yield call([api, api.put], `/violation-types/${action.payload.id}`, action.payload);
        } else {
            response = yield call([api, api.post], "/violation-types", action.payload);
        }
        const data = response?.data?.data || response?.data;
        yield put(saveViolationTypeSuccess(data));
        yield put(fetchViolationTypesRequest());
    } catch (error) {
        yield put(saveViolationTypeFailure(error?.response?.data?.message || "Lỗi lưu cấu hình vi phạm."));
    }
}

function* handleDeactivateViolationType(action) {
    try {
        yield call([api, api.delete], `/violation-types/${action.payload.id}`);
        yield put(deactivateViolationTypeSuccess(action.payload.id));
        yield put(fetchViolationTypesRequest());
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

    yield takeLatest(fetchActiveParkingSessionsRequest.type, handleFetchActiveParkingSessions);
    yield takeLatest(fetchMyActiveParkingSessionsRequest.type, handleFetchMyActiveParkingSessions);
    yield takeEvery(checkInRequest.type, handleCheckIn);
    yield takeEvery(checkOutRequest.type, handleCheckOut);
    yield takeEvery(checkOutByQrRequest.type, handleCheckOutByQr);

    yield takeLatest(fetchViolationsRequest.type, handleFetchViolations);
    yield takeEvery(createViolationRequest.type, handleCreateViolation);
    yield takeEvery(updateViolationStatusRequest.type, handleUpdateViolationStatus);

    yield takeLatest(fetchReportsRequest.type, handleFetchReports);
}
