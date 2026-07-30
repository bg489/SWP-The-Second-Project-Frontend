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

const backendToFrontendRole = {
    ADMIN: "ADMIN",
    USER: "USER",
    MANAGER: "PARKING_MANAGER",
    STAFF: "PARKING_STAFF",
    PARKING_MANAGER: "PARKING_MANAGER",
    PARKING_STAFF: "PARKING_STAFF",
};

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

const extractListData = (response) => {
    const data = response?.data?.data || response?.data || [];

    if (Array.isArray(data)) return data;
    if (Array.isArray(data.buildings)) return data.buildings;
    if (Array.isArray(data.items)) return data.items;

    return [];
};

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

const clearStoredSession = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("mock_role");
};

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

const getResponseMessage = (response, fallback) =>
    response?.data?.message || response?.message || fallback;

const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

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

function* handleRequestPasswordReset(action) {
    try {
        const response = yield call([api, api.post], "/auth/forgot-password", action.payload);
        yield put(requestPasswordResetSuccess(getResponseMessage(response, "Đã gửi hướng dẫn đổi mật khẩu tới email của bạn.")));
    } catch (error) {
        yield put(requestPasswordResetFailure(getErrorMessage(error, "Gửi yêu cầu đổi mật khẩu thất bại.")));
    }
}

function* handleVerifyPasswordReset(action) {
    try {
        const response = yield call([api, api.post], "/auth/verify-reset", action.payload);
        yield put(verifyPasswordResetSuccess(getResponseMessage(response, "Mã xác minh hợp lệ.")));
    } catch (error) {
        yield put(verifyPasswordResetFailure(getErrorMessage(error, "Mã xác minh không đúng hoặc đã hết hạn.")));
    }
}

function* handleResetPassword(action) {
    try {
        const response = yield call([api, api.post], "/auth/reset-password", action.payload);
        yield put(resetPasswordSuccess(getResponseMessage(response, "Đổi mật khẩu thành công.")));
    } catch (error) {
        yield put(resetPasswordFailure(getErrorMessage(error, "Đổi mật khẩu thất bại.")));
    }
}

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

function* handleConfirmProfileUpdate(action) {
    try {
        const response = yield call([api, api.patch], "/users/me/confirm-update", action.payload);
        const user = response?.data?.data || response?.data;

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

function* handleLogout() {
    yield call(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_role");
        localStorage.removeItem("mock_role");
    });
}

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
