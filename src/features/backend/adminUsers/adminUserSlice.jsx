import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    users: [],
    pagination: null,

    loading: false,
    error: null,

    updatingId: null,
    creating: false,
    updateError: null,
    updateSuccess: null,
};

const adminUserSlice = createSlice({
    name: "adminUsers",
    initialState,
    reducers: {
        fetchAdminUsersRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        fetchAdminUsersSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.users = action.payload.users || [];
            state.pagination = action.payload.pagination || null;
        },

        fetchAdminUsersFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        createAdminUserRequest: (state) => {
            state.creating = true;
            state.updateError = null;
            state.updateSuccess = null;
        },

        createAdminUserSuccess: (state, action) => {
            state.creating = false;
            state.updateError = null;
            state.updateSuccess = "Đã tạo và kích hoạt tài khoản thành công.";

            if (action.payload?.id) {
                state.users = [action.payload, ...state.users];
            }
        },

        createAdminUserFailure: (state, action) => {
            state.creating = false;
            state.updateError = action.payload;
        },

        setAdminUserLockRequest: (state, action) => {
            state.updatingId = action.payload.id;
            state.updateError = null;
            state.updateSuccess = null;
        },

        setAdminUserLockSuccess: (state, action) => {
            state.updatingId = null;
            state.updateError = null;

            const updatedUser = action.payload?.user || action.payload;
            state.updateSuccess = updatedUser?.status === "LOCKED"
                ? "Đã khóa tài khoản thành công."
                : "Đã mở khóa tài khoản thành công.";

            state.users = state.users.map((user) =>
                Number(user.id) === Number(updatedUser.id) ? { ...user, ...updatedUser } : user
            );
        },

        setAdminUserLockFailure: (state, action) => {
            state.updatingId = null;
            state.updateError = action.payload;
        },

        clearAdminUserNotice: (state) => {
            state.updateError = null;
            state.updateSuccess = null;
        },
    },
});

export const {
    createAdminUserFailure,
    createAdminUserRequest,
    createAdminUserSuccess,
    fetchAdminUsersRequest,
    fetchAdminUsersSuccess,
    fetchAdminUsersFailure,
    setAdminUserLockRequest,
    setAdminUserLockSuccess,
    setAdminUserLockFailure,
    clearAdminUserNotice,
} = adminUserSlice.actions;

export default adminUserSlice.reducer;
