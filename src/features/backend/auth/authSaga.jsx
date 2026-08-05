/**
 * @fileoverview Điều phối các tác vụ bất đồng bộ của authSaga, gọi API và phát action kết quả về Redux.
 *
 * Luồng chính: Action yêu cầu -> Saga gọi API -> action thành công/thất bại -> reducer cập nhật giao diện.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import api from "../../../services/api";
import {
    completeGoogleOnboardingFailure,
    completeGoogleOnboardingRequest,
    completeGoogleOnboardingSuccess,
    fetchRegisterBuildingsFailure,
    fetchRegisterBuildingsRequest,
    fetchRegisterBuildingsSuccess,
    confirmProfileUpdateFailure,
    confirmProfileUpdateRequest,
    confirmProfileUpdateSuccess,
    googleAuthFailure,
    googleAuthRequest,
    loginFailure,
    loginRequest,
    loginSuccess,
    logout,
    registerFailure,
    registerRequest,
    registerSuccess,
    resendRegistrationOtpFailure,
    resendRegistrationOtpRequest,
    resendRegistrationOtpSuccess,
    requestPasswordResetFailure,
    requestPasswordResetRequest,
    requestPasswordResetSuccess,
    requestProfileUpdateOtpFailure,
    requestProfileUpdateOtpRequest,
    requestProfileUpdateOtpSuccess,
    resetPasswordFailure,
    resetPasswordRequest,
    resetPasswordSuccess,
    refreshSessionFailure,
    refreshSessionRequest,
    refreshSessionSuccess,
    updateAvatarFailure,
    updateAvatarRequest,
    updateAvatarSuccess,
    updateProfileFailure,
    updateProfileRequest,
    updateProfileSuccess,
    verifyPasswordResetFailure,
    verifyPasswordResetRequest,
    verifyPasswordResetSuccess,
    verifyRegistrationFailure,
    verifyRegistrationRequest,
    verifyRegistrationSuccess,
} from "./authSlice";

/**
 * Khai báo `backendToFrontendRole` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/backend/auth/authSaga.jsx.
 */
const backendToFrontendRole = {
    ADMIN: "ADMIN",
    USER: "USER",
    MANAGER: "PARKING_MANAGER",
    STAFF: "PARKING_STAFF",
    PARKING_MANAGER: "PARKING_MANAGER",
    PARKING_STAFF: "PARKING_STAFF",
};

/**
 * Thực hiện nghiệp vụ `extractLoginData` (extract login data). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function extractLoginData
 * @param {*} response - Giá trị `response` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const extractLoginData = (response) => {
    const payload = response?.data?.data || response?.data || {};

    const token = payload.token || payload.accessToken || payload.jwt;
    const user = payload.user || payload.currentUser || payload.account || payload;

    const backendRole = user?.role || payload.role || "USER";
    const frontendRole = backendToFrontendRole[backendRole] || "USER";
    const requiresBuildingSelection = Boolean(
        payload.requiresBuildingSelection ||
        user?.requiresBuildingSelection ||
        user?.onboardingCompleted === false
    );

    return {
        token,
        user,
        backendRole,
        frontendRole,
        requiresBuildingSelection,
    };
};

/**
 * Thực hiện nghiệp vụ `extractListData` (extract list data). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function extractListData
 * @param {*} response - Giá trị `response` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const extractListData = (response) => {
    const data = response?.data?.data || response?.data || [];

    if (Array.isArray(data)) return data;
    if (Array.isArray(data.buildings)) return data.buildings;
    if (Array.isArray(data.items)) return data.items;

    return [];
};

/**
 * Xử lý nghiệp vụ `handleFetchRegisterBuildings` (handle fetch register buildings). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchRegisterBuildings
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchRegisterBuildings() {
    try {
        const response = yield call([api, api.get], "/buildings");

        yield put(fetchRegisterBuildingsSuccess(extractListData(response)));
    } catch (error) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Không lấy được danh sách tòa nhà.";

        yield put(fetchRegisterBuildingsFailure(message));
    }
}

/**
 * Thực hiện nghiệp vụ `prepareAuthenticatedSession` (prepare authenticated session). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function prepareAuthenticatedSession
 * @param {*} response - Giá trị `response` được hàm sử dụng trong quá trình xử lý.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* prepareAuthenticatedSession(response) {
    const {
        token,
        user,
        backendRole: initialBackendRole,
        frontendRole: initialFrontendRole,
        requiresBuildingSelection: initialOnboardingRequired,
    } = extractLoginData(response);

    if (!token) {
        throw new Error("Đăng nhập chưa hoàn tất. Vui lòng thử lại.");
    }

    localStorage.setItem("access_token", token);

    let currentUser;

    try {
        const meResponse = yield call([api, api.get], "/auth/me");
        currentUser = {
            ...user,
            ...(meResponse?.data?.data || meResponse?.data || {}),
        };
    } catch {
        currentUser = user;
    }

    const backendRole = currentUser?.role || initialBackendRole;
    const frontendRole =
        backendToFrontendRole[backendRole] || initialFrontendRole || "USER";
    const requiresBuildingSelection = Boolean(
        initialOnboardingRequired ||
        currentUser?.requiresBuildingSelection ||
        currentUser?.onboardingCompleted === false
    );
    const storedUser = {
        ...currentUser,
        requiresBuildingSelection,
    };

    localStorage.setItem("auth_user", JSON.stringify(storedUser));
    localStorage.setItem("auth_role", backendRole);
    localStorage.setItem("mock_role", frontendRole);

    return {
        frontendRole,
        requiresBuildingSelection,
        token,
        user: storedUser,
    };
}

/**
 * Xóa hoặc đặt lại nghiệp vụ `clearStoredSession` (clear stored session). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function clearStoredSession
 * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
 */
const clearStoredSession = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("mock_role");
};

/**
 * Xử lý nghiệp vụ `handleLogin` (handle login). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleLogin
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleLogin(action) {
    try {
        const response = yield call([api, api.post], "/auth/login", action.payload);
        const session = yield* prepareAuthenticatedSession(response);

        yield put(loginSuccess(session));
    } catch (error) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.";

        clearStoredSession();

        yield put(loginFailure(message));
    }
}

/**
 * Xử lý nghiệp vụ `handleGoogleAuth` (handle google auth). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleGoogleAuth
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleGoogleAuth(action) {
    try {
        const response = yield call(
            [api, api.post],
            "/auth/google",
            action.payload
        );
        const session = yield* prepareAuthenticatedSession(response);

        yield put(loginSuccess(session));
    } catch (error) {
        clearStoredSession();
        yield put(
            googleAuthFailure(
                getErrorMessage(
                    error,
                    "Đăng nhập Google thất bại. Vui lòng thử lại."
                )
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleRegister` (handle register). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleRegister
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleRegister(action) {
    try {
        const response = yield call([api, api.post], "/auth/register", action.payload);

        const payload = response?.data?.data || response?.data || null;

        yield put(registerSuccess(payload));
    } catch (error) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";

        yield put(registerFailure(message));
    }
}

/**
 * Lấy nghiệp vụ `getResponseMessage` (get response message). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function getResponseMessage
 * @param {*} response - Giá trị `response` được hàm sử dụng trong quá trình xử lý.
 * @param {*} fallback - Giá trị `fallback` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getResponseMessage = (response, fallback) =>
    response?.data?.message || response?.message || fallback;

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
 * Xử lý nghiệp vụ `handleVerifyRegistration` (handle verify registration). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleVerifyRegistration
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleVerifyRegistration(action) {
    try {
        const response = yield call(
            [api, api.post],
            "/auth/verify-registration",
            action.payload
        );

        yield put(
            verifyRegistrationSuccess(
                getResponseMessage(
                    response,
                    "Xác minh email thành công. Bạn có thể đăng nhập ngay."
                )
            )
        );
    } catch (error) {
        yield put(
            verifyRegistrationFailure(
                getErrorMessage(
                    error,
                    "Mã OTP không đúng hoặc đã hết hạn."
                )
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleResendRegistrationOtp` (handle resend registration otp). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleResendRegistrationOtp
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleResendRegistrationOtp(action) {
    try {
        const response = yield call(
            [api, api.post],
            "/auth/resend-registration-otp",
            action.payload
        );

        yield put(
            resendRegistrationOtpSuccess(
                getResponseMessage(
                    response,
                    "Đã gửi lại mã OTP xác minh tới email của bạn."
                )
            )
        );
    } catch (error) {
        yield put(
            resendRegistrationOtpFailure(
                getErrorMessage(error, "Không gửi lại được mã OTP xác minh.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleRequestPasswordReset` (handle request password reset). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleRequestPasswordReset
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleRequestPasswordReset(action) {
    try {
        const response = yield call([api, api.post], "/auth/forgot-password", action.payload);
        yield put(requestPasswordResetSuccess(getResponseMessage(response, "Đã gửi hướng dẫn đổi mật khẩu tới email của bạn.")));
    } catch (error) {
        yield put(requestPasswordResetFailure(getErrorMessage(error, "Gửi yêu cầu đổi mật khẩu thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleVerifyPasswordReset` (handle verify password reset). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleVerifyPasswordReset
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleVerifyPasswordReset(action) {
    try {
        const response = yield call([api, api.post], "/auth/verify-reset", action.payload);
        yield put(verifyPasswordResetSuccess(getResponseMessage(response, "Mã xác minh hợp lệ.")));
    } catch (error) {
        yield put(verifyPasswordResetFailure(getErrorMessage(error, "Mã xác minh không đúng hoặc đã hết hạn.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleResetPassword` (handle reset password). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleResetPassword
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleResetPassword(action) {
    try {
        const response = yield call([api, api.post], "/auth/reset-password", action.payload);
        yield put(resetPasswordSuccess(getResponseMessage(response, "Đổi mật khẩu thành công.")));
    } catch (error) {
        yield put(resetPasswordFailure(getErrorMessage(error, "Đổi mật khẩu thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleRefreshSession` (handle refresh session). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleRefreshSession
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleRefreshSession() {
    try {
        const response = yield call([api, api.post], "/auth/refresh");
        const session = yield* prepareAuthenticatedSession(response);

        yield put(refreshSessionSuccess(session));
    } catch (error) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Phiên đăng nhập đã hết hạn.";

        clearStoredSession();

        yield put(refreshSessionFailure(message));
    }
}

/**
 * Xử lý nghiệp vụ `handleCompleteGoogleOnboarding` (handle complete google onboarding). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleCompleteGoogleOnboarding
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleCompleteGoogleOnboarding(action) {
    try {
        const response = yield call(
            [api, api.post],
            "/auth/google/complete-onboarding",
            action.payload
        );
        const session = yield* prepareAuthenticatedSession(response);

        yield put(completeGoogleOnboardingSuccess(session));
    } catch (error) {
        yield put(
            completeGoogleOnboardingFailure(
                getErrorMessage(error, "Không thể lưu tòa nhà đã chọn.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleUpdateAvatar` (handle update avatar). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleUpdateAvatar
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleUpdateAvatar(action) {
    try {
        const response = yield call([api, api.patch], "/users/me/avatar", action.payload);
        const user = response?.data?.data || response?.data;

        localStorage.setItem("auth_user", JSON.stringify(user));

        yield put(updateAvatarSuccess(user));
    } catch (error) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Cập nhật ảnh đại diện thất bại.";

        yield put(updateAvatarFailure(message));
    }
}

/**
 * Xử lý nghiệp vụ `handleUpdateProfile` (handle update profile). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleUpdateProfile
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleUpdateProfile(action) {
    try {
        const response = yield call([api, api.patch], "/users/me", action.payload);
        const user = response?.data?.data || response?.data;

        localStorage.setItem("auth_user", JSON.stringify(user));

        yield put(updateProfileSuccess(user));
    } catch (error) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Cập nhật hồ sơ thất bại.";

        yield put(updateProfileFailure(message));
    }
}

/**
 * Xử lý nghiệp vụ `handleRequestProfileUpdateOtp` (handle request profile update otp). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleRequestProfileUpdateOtp
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleRequestProfileUpdateOtp(action) {
    try {
        const response = yield call([api, api.post], "/users/me/update-request", action.payload);
        const data = response?.data?.data || response?.data || {};

        yield put(
            requestProfileUpdateOtpSuccess({
                requestId: data.requestId,
                message: response?.data?.message || "Đã gửi mã xác minh tới email của bạn.",
            })
        );
    } catch (error) {
        yield put(
            requestProfileUpdateOtpFailure(
                getErrorMessage(error, "Không gửi được mã xác minh hồ sơ.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleConfirmProfileUpdate` (handle confirm profile update). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleConfirmProfileUpdate
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleConfirmProfileUpdate(action) {
    try {
        const response = yield call([api, api.patch], "/users/me/confirm-update", action.payload);
        const confirmedUser = response?.data?.data || response?.data;
        let user = confirmedUser;

        // Luôn lấy lại hồ sơ từ nguồn dữ liệu chính để giao diện không giữ
        // thông tin cũ nếu response xác nhận chỉ chứa một phần tài khoản.
        try {
            const currentUserResponse = yield call([api, api.get], "/auth/me");
            const currentUser = currentUserResponse?.data?.data || currentUserResponse?.data;

            user = {
                ...(confirmedUser || {}),
                ...(currentUser || {}),
            };
        } catch {
            // Hồ sơ trong response xác nhận vẫn đủ để hoàn tất cập nhật nếu
            // lần tải lại tức thời gặp lỗi mạng tạm thời.
        }

        localStorage.setItem("auth_user", JSON.stringify(user));

        yield put(confirmProfileUpdateSuccess(user));
    } catch (error) {
        yield put(
            confirmProfileUpdateFailure(
                getErrorMessage(error, "Không xác minh được cập nhật hồ sơ.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleLogout` (handle logout). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleLogout
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleLogout() {
    /* Callback nội bộ của lời gọi `call`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
    yield call(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_role");
        localStorage.removeItem("mock_role");
    });
}

/**
 * Thực hiện nghiệp vụ `authSaga` (auth saga). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function authSaga
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
export default function* authSaga() {
    yield takeLatest(loginRequest.type, handleLogin);
    yield takeLatest(googleAuthRequest.type, handleGoogleAuth);
    yield takeLatest(registerRequest.type, handleRegister);
    yield takeLatest(verifyRegistrationRequest.type, handleVerifyRegistration);
    yield takeLatest(
        resendRegistrationOtpRequest.type,
        handleResendRegistrationOtp
    );
    yield takeLatest(requestPasswordResetRequest.type, handleRequestPasswordReset);
    yield takeLatest(verifyPasswordResetRequest.type, handleVerifyPasswordReset);
    yield takeLatest(resetPasswordRequest.type, handleResetPassword);
    yield takeLatest(refreshSessionRequest.type, handleRefreshSession);
    yield takeLatest(
        completeGoogleOnboardingRequest.type,
        handleCompleteGoogleOnboarding
    );
    yield takeLatest(updateAvatarRequest.type, handleUpdateAvatar);
    yield takeLatest(updateProfileRequest.type, handleUpdateProfile);
    yield takeLatest(requestProfileUpdateOtpRequest.type, handleRequestProfileUpdateOtp);
    yield takeLatest(confirmProfileUpdateRequest.type, handleConfirmProfileUpdate);
    yield takeLatest(fetchRegisterBuildingsRequest.type, handleFetchRegisterBuildings);
    yield takeEvery(logout.type, handleLogout);
}
