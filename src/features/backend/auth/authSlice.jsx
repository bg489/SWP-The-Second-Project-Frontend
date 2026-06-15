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
} = authSlice.actions;

export default authSlice.reducer;