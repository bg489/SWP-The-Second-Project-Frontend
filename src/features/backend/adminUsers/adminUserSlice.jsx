/**
 * @fileoverview Khai báo state, action và reducer Redux cho miền dữ liệu adminUserSlice.
 *
 * Luồng chính: Action được dispatch -> reducer tương ứng cập nhật state bất biến do Redux Toolkit quản lý.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { createSlice } from "@reduxjs/toolkit";

/**
 * Khai báo `initialState` để mô tả trạng thái khởi tạo trước khi người dùng hoặc API tạo ra thay đổi.
 * Phạm vi sử dụng: src/features/backend/adminUsers/adminUserSlice.jsx.
 */
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

/**
 * Khai báo `adminUserSlice` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/backend/adminUsers/adminUserSlice.jsx.
 */
const adminUserSlice = createSlice({
    name: "adminUsers",
    initialState,
    reducers: {
        /**
         * Lấy nghiệp vụ `fetchAdminUsersRequest` (fetch admin users request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchAdminUsersRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchAdminUsersRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        /**
         * Lấy nghiệp vụ `fetchAdminUsersSuccess` (fetch admin users success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchAdminUsersSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchAdminUsersSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.users = action.payload.users || [];
            state.pagination = action.payload.pagination || null;
        },

        /**
         * Lấy nghiệp vụ `fetchAdminUsersFailure` (fetch admin users failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchAdminUsersFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchAdminUsersFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        /**
         * Tạo nghiệp vụ `createAdminUserRequest` (create admin user request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createAdminUserRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createAdminUserRequest: (state) => {
            state.creating = true;
            state.updateError = null;
            state.updateSuccess = null;
        },

        /**
         * Tạo nghiệp vụ `createAdminUserSuccess` (create admin user success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createAdminUserSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createAdminUserSuccess: (state, action) => {
            state.creating = false;
            state.updateError = null;
            const emailNotification = action.payload?.accountEmailNotification;
            state.updateSuccess = emailNotification
                ? emailNotification.sent
                    ? "Đã tạo tài khoản và gửi thông tin đăng nhập qua email."
                    : "Đã tạo tài khoản nhưng chưa gửi được thông tin đăng nhập qua email."
                : "Đã tạo và kích hoạt tài khoản thành công.";

            if (action.payload?.id) {
                state.users = [action.payload, ...state.users];
            }
        },

        /**
         * Tạo nghiệp vụ `createAdminUserFailure` (create admin user failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createAdminUserFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createAdminUserFailure: (state, action) => {
            state.creating = false;
            state.updateError = action.payload;
        },

        /**
         * Cập nhật nghiệp vụ `setAdminUserLockRequest` (set admin user lock request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function setAdminUserLockRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        setAdminUserLockRequest: (state, action) => {
            state.updatingId = action.payload.id;
            state.updateError = null;
            state.updateSuccess = null;
        },

        /**
         * Cập nhật nghiệp vụ `setAdminUserLockSuccess` (set admin user lock success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function setAdminUserLockSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        setAdminUserLockSuccess: (state, action) => {
            state.updatingId = null;
            state.updateError = null;

            const updatedUser = action.payload?.user || action.payload;
            state.updateSuccess = updatedUser?.status === "LOCKED"
                ? "Đã khóa tài khoản thành công."
                : "Đã mở khóa tài khoản thành công.";

            /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
            state.users = state.users.map((user) =>
                Number(user.id) === Number(updatedUser.id) ? { ...user, ...updatedUser } : user
            );
        },

        /**
         * Cập nhật nghiệp vụ `setAdminUserLockFailure` (set admin user lock failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function setAdminUserLockFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        setAdminUserLockFailure: (state, action) => {
            state.updatingId = null;
            state.updateError = action.payload;
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `clearAdminUserNotice` (clear admin user notice). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function clearAdminUserNotice
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
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
