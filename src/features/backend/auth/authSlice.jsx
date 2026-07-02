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

        loading: false,
        error: null,
        loginCompleted: false,

        registerLoading: false,
        registerError: null,
        registerSuccess: false,
        registeredUser: null,

        registerBuildings: [],
        registerBuildingsLoading: false,
        registerBuildingsError: null,

        passwordResetLoading: false,
        passwordResetError: null,
        passwordResetNotice: null,
        passwordResetVerified: false,
    };
};

const authSlice = createSlice({
    name: "auth",
    initialState: getInitialState(),
    reducers: {
        loginRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.loginCompleted = false;
        },

        loginSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.frontendRole = action.payload.frontendRole;
            state.isAuthenticated = true;
            state.loginCompleted = true;
        },

        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            state.loginCompleted = false;
        },

        registerRequest: (state) => {
            state.registerLoading = true;
            state.registerError = null;
            state.registerSuccess = false;
            state.registeredUser = null;
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

        clearRegisterState: (state) => {
            state.registerLoading = false;
            state.registerError = null;
            state.registerSuccess = false;
            state.registeredUser = null;
        },

        logout: (state) => {
            state.token = null;
            state.user = null;
            state.frontendRole = "USER";
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            state.loginCompleted = false;
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
        },

        refreshSessionFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
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

        requestPasswordResetRequest: (state) => {
            state.passwordResetLoading = true;
            state.passwordResetError = null;
            state.passwordResetNotice = null;
            state.passwordResetVerified = false;
        },

        requestPasswordResetSuccess: (state, action) => {
            state.passwordResetLoading = false;
            state.passwordResetError = null;
            state.passwordResetNotice = action.payload;
        },

        requestPasswordResetFailure: (state, action) => {
            state.passwordResetLoading = false;
            state.passwordResetError = action.payload;
        },

        verifyPasswordResetRequest: (state) => {
            state.passwordResetLoading = true;
            state.passwordResetError = null;
            state.passwordResetVerified = false;
        },

        verifyPasswordResetSuccess: (state, action) => {
            state.passwordResetLoading = false;
            state.passwordResetError = null;
            state.passwordResetNotice = action.payload;
            state.passwordResetVerified = true;
        },

        verifyPasswordResetFailure: (state, action) => {
            state.passwordResetLoading = false;
            state.passwordResetError = action.payload;
            state.passwordResetVerified = false;
        },

        resetPasswordRequest: (state) => {
            state.passwordResetLoading = true;
            state.passwordResetError = null;
            state.passwordResetNotice = null;
        },

        resetPasswordSuccess: (state, action) => {
            state.passwordResetLoading = false;
            state.passwordResetError = null;
            state.passwordResetNotice = action.payload;
            state.passwordResetVerified = false;
        },

        resetPasswordFailure: (state, action) => {
            state.passwordResetLoading = false;
            state.passwordResetError = action.payload;
        },

        clearPasswordResetState: (state) => {
            state.passwordResetLoading = false;
            state.passwordResetError = null;
            state.passwordResetNotice = null;
            state.passwordResetVerified = false;
        },
    },
});

export const {
    loginRequest,
    loginSuccess,
    loginFailure,
    registerRequest,
    registerSuccess,
    registerFailure,
    clearRegisterState,
    logout,
    clearLoginRedirect,
    fetchRegisterBuildingsRequest,
    fetchRegisterBuildingsSuccess,
    fetchRegisterBuildingsFailure,
    refreshSessionRequest,
    refreshSessionSuccess,
    refreshSessionFailure,
    updateAvatarRequest,
    updateAvatarSuccess,
    updateAvatarFailure,
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
