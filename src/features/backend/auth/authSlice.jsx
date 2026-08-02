/**
 * @fileoverview Khai báo state, action và reducer Redux cho miền dữ liệu authSlice.
 *
 * Luồng chính: Action được dispatch -> reducer tương ứng cập nhật state bất biến do Redux Toolkit quản lý.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { createSlice } from "@reduxjs/toolkit";

/**
 * Thực hiện nghiệp vụ `safeJsonParse` (safe json parse). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
 *
 * @function safeJsonParse
 * @param {*} value - Giá trị đầu vào cần xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const safeJsonParse = (value) => {
    try {
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
};

/**
 * Lấy nghiệp vụ `getInitialState` (get initial state). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
 *
 * @function getInitialState
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getInitialState = () => {
    const token = localStorage.getItem("access_token");
    const user = safeJsonParse(localStorage.getItem("auth_user"));
    const frontendRole = localStorage.getItem("mock_role") || "USER";

    return {
        token,
        user,
        frontendRole,
        isAuthenticated: Boolean(token),
        requiresBuildingSelection: Boolean(
            user?.requiresBuildingSelection || user?.onboardingCompleted === false
        ),

        loading: false,
        googleLoading: false,
        error: null,
        loginCompleted: false,

        registerLoading: false,
        registerError: null,
        registerSuccess: false,
        registeredUser: null,
        registrationVerificationLoading: false,
        registrationVerificationAction: null,
        registrationVerificationError: null,
        registrationVerificationNotice: null,
        registrationVerified: false,

        registerBuildings: [],
        registerBuildingsLoading: false,
        registerBuildingsError: null,

        passwordResetLoading: false,
        passwordResetAction: null,
        passwordResetError: null,
        passwordResetNotice: null,
        passwordResetVerified: false,
        passwordResetCompleted: false,

        profileUpdateRequestId: null,
        profileUpdateNotice: null,

        onboardingLoading: false,
        onboardingError: null,
    };
};

/**
 * Khai báo `authSlice` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/backend/auth/authSlice.jsx.
 */
const authSlice = createSlice({
    name: "auth",
    initialState: getInitialState(),
    reducers: {
        /**
         * Thực hiện nghiệp vụ `loginRequest` (login request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function loginRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        loginRequest: (state) => {
            state.loading = true;
            state.googleLoading = false;
            state.error = null;
            state.loginCompleted = false;
        },

        /**
         * Thực hiện nghiệp vụ `loginSuccess` (login success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function loginSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        loginSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.googleLoading = false;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.frontendRole = action.payload.frontendRole;
            state.isAuthenticated = true;
            state.requiresBuildingSelection = Boolean(
                action.payload.requiresBuildingSelection
            );
            state.loginCompleted = true;
        },

        /**
         * Thực hiện nghiệp vụ `loginFailure` (login failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function loginFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        loginFailure: (state, action) => {
            state.loading = false;
            state.googleLoading = false;
            state.error = action.payload;
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            state.requiresBuildingSelection = false;
            state.loginCompleted = false;
        },

        /**
         * Thực hiện nghiệp vụ `googleAuthRequest` (google auth request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function googleAuthRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        googleAuthRequest: (state) => {
            state.googleLoading = true;
            state.loading = false;
            state.error = null;
            state.loginCompleted = false;
        },

        /**
         * Thực hiện nghiệp vụ `googleAuthFailure` (google auth failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function googleAuthFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        googleAuthFailure: (state, action) => {
            state.googleLoading = false;
            state.error = action.payload;
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            state.requiresBuildingSelection = false;
            state.loginCompleted = false;
        },

        /**
         * Tạo nghiệp vụ `registerRequest` (register request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function registerRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        registerRequest: (state) => {
            state.registerLoading = true;
            state.registerError = null;
            state.registerSuccess = false;
            state.registeredUser = null;
            state.registrationVerificationError = null;
            state.registrationVerificationNotice = null;
            state.registrationVerified = false;
        },

        /**
         * Tạo nghiệp vụ `registerSuccess` (register success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function registerSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        registerSuccess: (state, action) => {
            state.registerLoading = false;
            state.registerError = null;
            state.registerSuccess = true;
            state.registeredUser = action.payload;
        },

        /**
         * Tạo nghiệp vụ `registerFailure` (register failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function registerFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        registerFailure: (state, action) => {
            state.registerLoading = false;
            state.registerError = action.payload;
            state.registerSuccess = false;
            state.registeredUser = null;
        },

        /**
         * Kiểm tra nghiệp vụ `verifyRegistrationRequest` (verify registration request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function verifyRegistrationRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        verifyRegistrationRequest: (state) => {
            state.registrationVerificationLoading = true;
            state.registrationVerificationAction = "verify";
            state.registrationVerificationError = null;
            state.registrationVerificationNotice = null;
            state.registrationVerified = false;
        },

        /**
         * Kiểm tra nghiệp vụ `verifyRegistrationSuccess` (verify registration success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function verifyRegistrationSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        verifyRegistrationSuccess: (state, action) => {
            state.registrationVerificationLoading = false;
            state.registrationVerificationAction = null;
            state.registrationVerificationError = null;
            state.registrationVerificationNotice = action.payload;
            state.registrationVerified = true;
        },

        /**
         * Kiểm tra nghiệp vụ `verifyRegistrationFailure` (verify registration failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function verifyRegistrationFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        verifyRegistrationFailure: (state, action) => {
            state.registrationVerificationLoading = false;
            state.registrationVerificationAction = null;
            state.registrationVerificationError = action.payload;
            state.registrationVerified = false;
        },

        /**
         * Thực hiện nghiệp vụ `resendRegistrationOtpRequest` (resend registration otp request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function resendRegistrationOtpRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        resendRegistrationOtpRequest: (state) => {
            state.registrationVerificationLoading = true;
            state.registrationVerificationAction = "resend";
            state.registrationVerificationError = null;
            state.registrationVerificationNotice = null;
        },

        /**
         * Thực hiện nghiệp vụ `resendRegistrationOtpSuccess` (resend registration otp success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function resendRegistrationOtpSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        resendRegistrationOtpSuccess: (state, action) => {
            state.registrationVerificationLoading = false;
            state.registrationVerificationAction = null;
            state.registrationVerificationError = null;
            state.registrationVerificationNotice = action.payload;
        },

        /**
         * Thực hiện nghiệp vụ `resendRegistrationOtpFailure` (resend registration otp failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function resendRegistrationOtpFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        resendRegistrationOtpFailure: (state, action) => {
            state.registrationVerificationLoading = false;
            state.registrationVerificationAction = null;
            state.registrationVerificationError = action.payload;
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `clearRegisterState` (clear register state). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function clearRegisterState
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        clearRegisterState: (state) => {
            state.registerLoading = false;
            state.registerError = null;
            state.registerSuccess = false;
            state.registeredUser = null;
            state.registrationVerificationLoading = false;
            state.registrationVerificationAction = null;
            state.registrationVerificationError = null;
            state.registrationVerificationNotice = null;
            state.registrationVerified = false;
        },

        /**
         * Thực hiện nghiệp vụ `logout` (logout). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function logout
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.frontendRole = "USER";
            state.isAuthenticated = false;
            state.loading = false;
            state.googleLoading = false;
            state.error = null;
            state.loginCompleted = false;
            state.requiresBuildingSelection = false;
            state.onboardingLoading = false;
            state.onboardingError = null;
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `clearLoginRedirect` (clear login redirect). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function clearLoginRedirect
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        clearLoginRedirect: (state) => {
            state.loginCompleted = false;
        },

        /**
         * Lấy nghiệp vụ `fetchRegisterBuildingsRequest` (fetch register buildings request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchRegisterBuildingsRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchRegisterBuildingsRequest: (state) => {
            state.registerBuildingsLoading = true;
            state.registerBuildingsError = null;
        },

        /**
         * Lấy nghiệp vụ `fetchRegisterBuildingsSuccess` (fetch register buildings success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchRegisterBuildingsSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchRegisterBuildingsSuccess: (state, action) => {
            state.registerBuildingsLoading = false;
            state.registerBuildingsError = null;
            state.registerBuildings = action.payload || [];
        },

        /**
         * Lấy nghiệp vụ `fetchRegisterBuildingsFailure` (fetch register buildings failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchRegisterBuildingsFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchRegisterBuildingsFailure: (state, action) => {
            state.registerBuildingsLoading = false;
            state.registerBuildingsError = action.payload;
        },

        /**
         * Thực hiện nghiệp vụ `refreshSessionRequest` (refresh session request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function refreshSessionRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        refreshSessionRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        /**
         * Thực hiện nghiệp vụ `refreshSessionSuccess` (refresh session success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function refreshSessionSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        refreshSessionSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.frontendRole = action.payload.frontendRole;
            state.isAuthenticated = Boolean(action.payload.token);
            state.requiresBuildingSelection = Boolean(
                action.payload.requiresBuildingSelection
            );
        },

        /**
         * Thực hiện nghiệp vụ `refreshSessionFailure` (refresh session failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function refreshSessionFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        refreshSessionFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            state.requiresBuildingSelection = false;
        },

        /**
         * Xử lý nghiệp vụ `completeGoogleOnboardingRequest` (complete google onboarding request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function completeGoogleOnboardingRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        completeGoogleOnboardingRequest: (state) => {
            state.onboardingLoading = true;
            state.onboardingError = null;
        },

        /**
         * Xử lý nghiệp vụ `completeGoogleOnboardingSuccess` (complete google onboarding success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function completeGoogleOnboardingSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        completeGoogleOnboardingSuccess: (state, action) => {
            state.onboardingLoading = false;
            state.onboardingError = null;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.frontendRole = action.payload.frontendRole;
            state.isAuthenticated = true;
            state.requiresBuildingSelection = false;
        },

        /**
         * Xử lý nghiệp vụ `completeGoogleOnboardingFailure` (complete google onboarding failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function completeGoogleOnboardingFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        completeGoogleOnboardingFailure: (state, action) => {
            state.onboardingLoading = false;
            state.onboardingError = action.payload;
        },

        /**
         * Cập nhật nghiệp vụ `updateAvatarRequest` (update avatar request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateAvatarRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateAvatarRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        /**
         * Cập nhật nghiệp vụ `updateAvatarSuccess` (update avatar success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateAvatarSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateAvatarSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.user = action.payload;
        },

        /**
         * Cập nhật nghiệp vụ `updateAvatarFailure` (update avatar failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateAvatarFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateAvatarFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        /**
         * Cập nhật nghiệp vụ `updateProfileRequest` (update profile request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateProfileRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateProfileRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        /**
         * Cập nhật nghiệp vụ `updateProfileSuccess` (update profile success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateProfileSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateProfileSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.user = action.payload;
        },

        /**
         * Cập nhật nghiệp vụ `updateProfileFailure` (update profile failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateProfileFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateProfileFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        /**
         * Thực hiện nghiệp vụ `requestProfileUpdateOtpRequest` (request profile update otp request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function requestProfileUpdateOtpRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        requestProfileUpdateOtpRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.profileUpdateNotice = null;
            state.profileUpdateRequestId = null;
        },

        /**
         * Thực hiện nghiệp vụ `requestProfileUpdateOtpSuccess` (request profile update otp success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function requestProfileUpdateOtpSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        requestProfileUpdateOtpSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.profileUpdateNotice = action.payload?.message;
            state.profileUpdateRequestId = action.payload?.requestId || null;
        },

        /**
         * Thực hiện nghiệp vụ `requestProfileUpdateOtpFailure` (request profile update otp failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function requestProfileUpdateOtpFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        requestProfileUpdateOtpFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        /**
         * Xử lý nghiệp vụ `confirmProfileUpdateRequest` (confirm profile update request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function confirmProfileUpdateRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        confirmProfileUpdateRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        /**
         * Xử lý nghiệp vụ `confirmProfileUpdateSuccess` (confirm profile update success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function confirmProfileUpdateSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        confirmProfileUpdateSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.user = action.payload?.user || action.payload;
            state.profileUpdateNotice = "Cập nhật hồ sơ thành công.";
            state.profileUpdateRequestId = null;
        },

        /**
         * Xử lý nghiệp vụ `confirmProfileUpdateFailure` (confirm profile update failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function confirmProfileUpdateFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        confirmProfileUpdateFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `clearProfileUpdateState` (clear profile update state). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function clearProfileUpdateState
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        clearProfileUpdateState: (state) => {
            state.profileUpdateNotice = null;
            state.profileUpdateRequestId = null;
        },

        /**
         * Thực hiện nghiệp vụ `requestPasswordResetRequest` (request password reset request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function requestPasswordResetRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        requestPasswordResetRequest: (state) => {
            state.passwordResetLoading = true;
            state.passwordResetAction = "request";
            state.passwordResetError = null;
            state.passwordResetNotice = null;
            state.passwordResetVerified = false;
            state.passwordResetCompleted = false;
        },

        /**
         * Thực hiện nghiệp vụ `requestPasswordResetSuccess` (request password reset success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function requestPasswordResetSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        requestPasswordResetSuccess: (state, action) => {
            state.passwordResetLoading = false;
            state.passwordResetAction = null;
            state.passwordResetError = null;
            state.passwordResetNotice = action.payload;
        },

        /**
         * Thực hiện nghiệp vụ `requestPasswordResetFailure` (request password reset failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function requestPasswordResetFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        requestPasswordResetFailure: (state, action) => {
            state.passwordResetLoading = false;
            state.passwordResetAction = null;
            state.passwordResetError = action.payload;
        },

        /**
         * Kiểm tra nghiệp vụ `verifyPasswordResetRequest` (verify password reset request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function verifyPasswordResetRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        verifyPasswordResetRequest: (state) => {
            state.passwordResetLoading = true;
            state.passwordResetAction = "verify";
            state.passwordResetError = null;
            state.passwordResetVerified = false;
            state.passwordResetCompleted = false;
        },

        /**
         * Kiểm tra nghiệp vụ `verifyPasswordResetSuccess` (verify password reset success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function verifyPasswordResetSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        verifyPasswordResetSuccess: (state, action) => {
            state.passwordResetLoading = false;
            state.passwordResetAction = null;
            state.passwordResetError = null;
            state.passwordResetNotice = action.payload;
            state.passwordResetVerified = true;
        },

        /**
         * Kiểm tra nghiệp vụ `verifyPasswordResetFailure` (verify password reset failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function verifyPasswordResetFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        verifyPasswordResetFailure: (state, action) => {
            state.passwordResetLoading = false;
            state.passwordResetAction = null;
            state.passwordResetError = action.payload;
            state.passwordResetVerified = false;
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `resetPasswordRequest` (reset password request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function resetPasswordRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        resetPasswordRequest: (state) => {
            state.passwordResetLoading = true;
            state.passwordResetAction = "reset";
            state.passwordResetError = null;
            state.passwordResetNotice = null;
            state.passwordResetCompleted = false;
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `resetPasswordSuccess` (reset password success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function resetPasswordSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        resetPasswordSuccess: (state, action) => {
            state.passwordResetLoading = false;
            state.passwordResetAction = null;
            state.passwordResetError = null;
            state.passwordResetNotice = action.payload;
            state.passwordResetVerified = false;
            state.passwordResetCompleted = true;
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `resetPasswordFailure` (reset password failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function resetPasswordFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        resetPasswordFailure: (state, action) => {
            state.passwordResetLoading = false;
            state.passwordResetAction = null;
            state.passwordResetError = action.payload;
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `clearPasswordResetState` (clear password reset state). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function clearPasswordResetState
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        clearPasswordResetState: (state) => {
            state.passwordResetLoading = false;
            state.passwordResetAction = null;
            state.passwordResetError = null;
            state.passwordResetNotice = null;
            state.passwordResetVerified = false;
            state.passwordResetCompleted = false;
        },
    },
});

export const {
    loginRequest,
    loginSuccess,
    loginFailure,
    googleAuthRequest,
    googleAuthFailure,
    registerRequest,
    registerSuccess,
    registerFailure,
    verifyRegistrationRequest,
    verifyRegistrationSuccess,
    verifyRegistrationFailure,
    resendRegistrationOtpRequest,
    resendRegistrationOtpSuccess,
    resendRegistrationOtpFailure,
    clearRegisterState,
    logout,
    clearLoginRedirect,
    fetchRegisterBuildingsRequest,
    fetchRegisterBuildingsSuccess,
    fetchRegisterBuildingsFailure,
    refreshSessionRequest,
    refreshSessionSuccess,
    refreshSessionFailure,
    completeGoogleOnboardingRequest,
    completeGoogleOnboardingSuccess,
    completeGoogleOnboardingFailure,
    updateAvatarRequest,
    updateAvatarSuccess,
    updateAvatarFailure,
    updateProfileRequest,
    updateProfileSuccess,
    updateProfileFailure,
    requestProfileUpdateOtpRequest,
    requestProfileUpdateOtpSuccess,
    requestProfileUpdateOtpFailure,
    confirmProfileUpdateRequest,
    confirmProfileUpdateSuccess,
    confirmProfileUpdateFailure,
    clearProfileUpdateState,
    requestPasswordResetRequest,
    requestPasswordResetSuccess,
    requestPasswordResetFailure,
    verifyPasswordResetRequest,
    verifyPasswordResetSuccess,
    verifyPasswordResetFailure,
    resetPasswordRequest,
    resetPasswordSuccess,
    resetPasswordFailure,
    clearPasswordResetState,
} = authSlice.actions;

export default authSlice.reducer;
