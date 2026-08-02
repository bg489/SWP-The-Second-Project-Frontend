/**
 * @fileoverview Khai báo state, action và reducer Redux cho miền dữ liệu userSlice.
 *
 * Luồng chính: Action được dispatch -> reducer tương ứng cập nhật state bất biến do Redux Toolkit quản lý.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { createSlice } from "@reduxjs/toolkit";

/**
 * Khai báo `initialState` để mô tả trạng thái khởi tạo trước khi người dùng hoặc API tạo ra thay đổi.
 * Phạm vi sử dụng: src/features/users/userSlice.jsx.
 */
const initialState = {
    users: [],
    loading: false,
    error: null,
};

/**
 * Khai báo `userSlice` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/users/userSlice.jsx.
 */
const userSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        /**
         * Lấy nghiệp vụ `fetchUsersRequest` (fetch users request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchUsersRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchUsersRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        /**
         * Lấy nghiệp vụ `fetchUsersSuccess` (fetch users success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchUsersSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchUsersSuccess: (state, action) => {
            state.loading = false;
            state.users = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchUsersFailure` (fetch users failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchUsersFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchUsersFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        /**
         * Tạo nghiệp vụ `addUser` (add user). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function addUser
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        addUser: (state, action) => {
            state.users.unshift(action.payload);
        },

        /**
         * Cập nhật nghiệp vụ `editUser` (edit user). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function editUser
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        editUser: (state, action) => {
            /* Callback nội bộ của lời gọi `findIndex`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
            const index = state.users.findIndex(u => u.id === action.payload.id);
            if (index !== -1) {
                state.users[index] = { ...state.users[index], ...action.payload };
            }
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `deleteUser` (delete user). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function deleteUser
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        deleteUser: (state, action) => {
            /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
            state.users = state.users.filter(u => u.id !== action.payload);
        }
    },
});

export const {
    fetchUsersRequest,
    fetchUsersSuccess,
    fetchUsersFailure,
    addUser,
    editUser,
    deleteUser
} = userSlice.actions;

export default userSlice.reducer;