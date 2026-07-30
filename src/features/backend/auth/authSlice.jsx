import { createSlice } from "@reduxjs/toolkit";

const safeJsonParse = (value) => {
    try {
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
};

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

const authSlice = createSlice({
    name: "auth",
    initialState: getInitialState(),
    reducers: {
        loginRequest: (state) => {
            state.loading = true;
            state.googleLoading = false;
            state.error = null;
            state.loginCompleted = false;
        },

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

        googleAuthRequest: (state) => {
            state.googleLoading = true;
            state.loading = false;
            state.error = null;
            state.loginCompleted = false;
        },

        googleAuthFailure: (state, action) => {
            state.googleLoading = false;
            state.error = action.payload;
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            state.requiresBuildingSelection = false;
            state.loginCompleted = false;
        },

        registerRequest: (state) => {
            state.registerLoading = true;
            state.registerError = null;
            state.registerSuccess = false;
            state.registeredUser = null;
            state.registrationVerificationError = null;
            state.registrationVerificationNotice = null;
            state.registrationVerified = false;
        },

        registerSuccess: (state, action) => {
            state.registerLoading = false;
            state.registerError = null;
            state.registerSuccess = true;
            state.registeredUser = action.payload;
        },

        registerFailure: (state, action) => {
            state.registerLoading = false;
            state.registerError = action.payload;
            state.registerSuccess = false;
            state.registeredUser = null;
        },

        verifyRegistrationRequest: (state) => {
            state.registrationVerificationLoading = true;
            state.registrationVerificationAction = "verify";
            state.registrationVerificationError = null;
            state.registrationVerificationNotice = null;
            state.registrationVerified = false;
        },

        verifyRegistrationSuccess: (state, action) => {
            state.registrationVerificationLoading = false;
            state.registrationVerificationAction = null;
            state.registrationVerificationError = null;
            state.registrationVerificationNotice = action.payload;
            state.registrationVerified = true;
        },

        verifyRegistrationFailure: (state, action) => {
            state.registrationVerificationLoading = false;
            state.registrationVerificationAction = null;
            state.registrationVerificationError = action.payload;
            state.registrationVerified = false;
        },

        resendRegistrationOtpRequest: (state) => {
            state.registrationVerificationLoading = true;
            state.registrationVerificationAction = "resend";
            state.registrationVerificationError = null;
            state.registrationVerificationNotice = null;
        },

        resendRegistrationOtpSuccess: (state, action) => {
            state.registrationVerificationLoading = false;
            state.registrationVerificationAction = null;
            state.registrationVerificationError = null;
            state.registrationVerificationNotice = action.payload;
        },

        resendRegistrationOtpFailure: (state, action) => {
            state.registrationVerificationLoading = false;
            state.registrationVerificationAction = null;
            state.registrationVerificationError = action.payload;
        },

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

        clearLoginRedirect: (state) => {
            state.loginCompleted = false;
        },

        fetchRegisterBuildingsRequest: (state) => {
            state.registerBuildingsLoading = true;
            state.registerBuildingsError = null;
        },

        fetchRegisterBuildingsSuccess: (state, action) => {
            state.registerBuildingsLoading = false;
            state.registerBuildingsError = null;
            state.registerBuildings = action.payload || [];
        },

        fetchRegisterBuildingsFailure: (state, action) => {
            state.registerBuildingsLoading = false;
            state.registerBuildingsError = action.payload;
        },

        refreshSessionRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

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

        refreshSessionFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            state.requiresBuildingSelection = false;
        },

        completeGoogleOnboardingRequest: (state) => {
            state.onboardingLoading = true;
            state.onboardingError = null;
        },

        completeGoogleOnboardingSuccess: (state, action) => {
            state.onboardingLoading = false;
            state.onboardingError = null;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.frontendRole = action.payload.frontendRole;
            state.isAuthenticated = true;
            state.requiresBuildingSelection = false;
        },

        completeGoogleOnboardingFailure: (state, action) => {
            state.onboardingLoading = false;
            state.onboardingError = action.payload;
        },

        updateAvatarRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        updateAvatarSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.user = action.payload;
        },

        updateAvatarFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        updateProfileRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        updateProfileSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.user = action.payload;
        },

        updateProfileFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        requestProfileUpdateOtpRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.profileUpdateNotice = null;
            state.profileUpdateRequestId = null;
        },

        requestProfileUpdateOtpSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.profileUpdateNotice = action.payload?.message;
            state.profileUpdateRequestId = action.payload?.requestId || null;
        },

        requestProfileUpdateOtpFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        confirmProfileUpdateRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        confirmProfileUpdateSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.user = action.payload?.user || action.payload;
            state.profileUpdateNotice = "Cập nhật hồ sơ thành công.";
            state.profileUpdateRequestId = null;
        },

        confirmProfileUpdateFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        clearProfileUpdateState: (state) => {
            state.profileUpdateNotice = null;
            state.profileUpdateRequestId = null;
        },

        requestPasswordResetRequest: (state) => {
            state.passwordResetLoading = true;
            state.passwordResetAction = "request";
            state.passwordResetError = null;
            state.passwordResetNotice = null;
            state.passwordResetVerified = false;
            state.passwordResetCompleted = false;
        },

        requestPasswordResetSuccess: (state, action) => {
            state.passwordResetLoading = false;
            state.passwordResetAction = null;
            state.passwordResetError = null;
            state.passwordResetNotice = action.payload;
        },

        requestPasswordResetFailure: (state, action) => {
            state.passwordResetLoading = false;
            state.passwordResetAction = null;
            state.passwordResetError = action.payload;
        },

        verifyPasswordResetRequest: (state) => {
            state.passwordResetLoading = true;
            state.passwordResetAction = "verify";
            state.passwordResetError = null;
            state.passwordResetVerified = false;
            state.passwordResetCompleted = false;
        },

        verifyPasswordResetSuccess: (state, action) => {
            state.passwordResetLoading = false;
            state.passwordResetAction = null;
            state.passwordResetError = null;
            state.passwordResetNotice = action.payload;
            state.passwordResetVerified = true;
        },

        verifyPasswordResetFailure: (state, action) => {
            state.passwordResetLoading = false;
            state.passwordResetAction = null;
            state.passwordResetError = action.payload;
            state.passwordResetVerified = false;
        },

        resetPasswordRequest: (state) => {
            state.passwordResetLoading = true;
            state.passwordResetAction = "reset";
            state.passwordResetError = null;
            state.passwordResetNotice = null;
            state.passwordResetCompleted = false;
        },

        resetPasswordSuccess: (state, action) => {
            state.passwordResetLoading = false;
            state.passwordResetAction = null;
            state.passwordResetError = null;
            state.passwordResetNotice = action.payload;
            state.passwordResetVerified = false;
            state.passwordResetCompleted = true;
        },

        resetPasswordFailure: (state, action) => {
            state.passwordResetLoading = false;
            state.passwordResetAction = null;
            state.passwordResetError = action.payload;
        },

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
