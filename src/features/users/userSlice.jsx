import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    users: [],
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        fetchUsersRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        fetchUsersSuccess: (state, action) => {
            state.loading = false;
            state.users = action.payload;
        },

        fetchUsersFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        addUser: (state, action) => {
            state.users.unshift(action.payload);
        },

        editUser: (state, action) => {
            const index = state.users.findIndex(u => u.id === action.payload.id);
            if (index !== -1) {
                state.users[index] = { ...state.users[index], ...action.payload };
            }
        },

        deleteUser: (state, action) => {
            state.users = state.users.filter(u => u.id !== action.payload);
        },
        updateUserRoleStatusRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateUserRoleStatusSuccess: (state, action) => {
            state.loading = false;
            const index = state.users.findIndex(u => u.id === action.payload.id);
            if (index !== -1) {
                state.users[index] = { ...state.users[index], ...action.payload };
            }
        },
        updateUserRoleStatusFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        lockUserRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        lockUserSuccess: (state, action) => {
            state.loading = false;
            const index = state.users.findIndex(u => u.id === action.payload);
            if (index !== -1) {
                state.users[index].status = "LOCKED";
            }
        },
        lockUserFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        unlockUserRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        unlockUserSuccess: (state, action) => {
            state.loading = false;
            const index = state.users.findIndex(u => u.id === action.payload);
            if (index !== -1) {
                state.users[index].status = "ACTIVE";
            }
        },
        unlockUserFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    },
});

export const {
    fetchUsersRequest,
    fetchUsersSuccess,
    fetchUsersFailure,
    addUser,
    editUser,
    deleteUser,
    updateUserRoleStatusRequest,
    updateUserRoleStatusSuccess,
    updateUserRoleStatusFailure,
    lockUserRequest,
    lockUserSuccess,
    lockUserFailure,
    unlockUserRequest,
    unlockUserSuccess,
    unlockUserFailure
} = userSlice.actions;

export default userSlice.reducer;