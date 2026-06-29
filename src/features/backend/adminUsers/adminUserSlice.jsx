import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    users: [],
    pagination: null,

    loading: false,
    error: null,

    updatingId: null,
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

        updateAdminUserStatusRequest: (state, action) => {
            state.updatingId = action.payload.id;
            state.updateError = null;
            state.updateSuccess = null;
        },

        updateAdminUserStatusSuccess: (state, action) => {
            state.updatingId = null;
            state.updateError = null;
            state.updateSuccess = "Cập nhật tài khoản thành công.";

            const updatedUser = action.payload?.user || action.payload;

            state.users = state.users.map((user) =>
                Number(user.id) === Number(updatedUser.id) ? updatedUser : user
            );
        },

        updateAdminUserStatusFailure: (state, action) => {
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
    fetchAdminUsersRequest,
    fetchAdminUsersSuccess,
    fetchAdminUsersFailure,
    updateAdminUserStatusRequest,
    updateAdminUserStatusSuccess,
    updateAdminUserStatusFailure,
    clearAdminUserNotice,
} = adminUserSlice.actions;

export default adminUserSlice.reducer;
