/**
 * @fileoverview Khai báo state, action và reducer Redux cho miền dữ liệu floorSlice.
 *
 * Luồng chính: Action được dispatch -> reducer tương ứng cập nhật state bất biến do Redux Toolkit quản lý.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { createSlice } from "@reduxjs/toolkit";
import { reconcileCollectionById } from "../../../utils/reconcileCollection";

/**
 * Khai báo `initialState` để mô tả trạng thái khởi tạo trước khi người dùng hoặc API tạo ra thay đổi.
 * Phạm vi sử dụng: src/features/backend/floors/floorSlice.jsx.
 */
const initialState = {
    floors: [],
    pagination: null,

    loading: false,
    error: null,

    creating: false,
    updatingId: null,
    deletingId: null,

    mutationError: null,
    mutationSuccess: null,
};

/**
 * Khai báo `floorSlice` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/backend/floors/floorSlice.jsx.
 */
const floorSlice = createSlice({
    name: "floors",
    initialState,
    reducers: {
        /**
         * Lấy nghiệp vụ `fetchFloorsRequest` (fetch floors request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchFloorsRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchFloorsRequest: (state, action) => {
            if (!action.payload?.silent) {
                state.loading = true;
                state.error = null;
            }
        },

        /**
         * Lấy nghiệp vụ `fetchFloorsSuccess` (fetch floors success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchFloorsSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchFloorsSuccess: (state, action) => {
            if (!action.payload.silent) {
                state.loading = false;
                state.error = null;
            }
            state.floors = reconcileCollectionById(
                state.floors,
                action.payload.floors || []
            );
            if (!action.payload.silent) {
                state.pagination = action.payload.pagination || null;
            }
        },

        /**
         * Lấy nghiệp vụ `fetchFloorsFailure` (fetch floors failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchFloorsFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchFloorsFailure: (state, action) => {
            const payload =
                typeof action.payload === "object"
                    ? action.payload
                    : { error: action.payload, silent: false };

            if (!payload.silent) {
                state.loading = false;
                state.error = payload.error;
            }
        },

        /**
         * Tạo nghiệp vụ `createFloorRequest` (create floor request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createFloorRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createFloorRequest: (state) => {
            state.creating = true;
            state.mutationError = null;
            state.mutationSuccess = null;
        },

        /**
         * Tạo nghiệp vụ `createFloorSuccess` (create floor success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createFloorSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createFloorSuccess: (state, action) => {
            state.creating = false;
            state.mutationSuccess = "Tạo tầng thành công.";

            const createdFloor = action.payload;
            if (createdFloor?.id) {
                state.floors = [createdFloor, ...state.floors];
            }
        },

        /**
         * Tạo nghiệp vụ `createFloorFailure` (create floor failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createFloorFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createFloorFailure: (state, action) => {
            state.creating = false;
            state.mutationError = action.payload;
        },

        /**
         * Cập nhật nghiệp vụ `updateFloorRequest` (update floor request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateFloorRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateFloorRequest: (state, action) => {
            state.updatingId = action.payload.id;
            state.mutationError = null;
            state.mutationSuccess = null;
        },

        /**
         * Cập nhật nghiệp vụ `updateFloorSuccess` (update floor success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateFloorSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateFloorSuccess: (state, action) => {
            state.updatingId = null;
            state.mutationSuccess = "Cập nhật tầng thành công.";

            const updatedFloor = action.payload;

            /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
            state.floors = state.floors.map((floor) =>
                Number(floor.id) === Number(updatedFloor.id) ? updatedFloor : floor
            );
        },

        /**
         * Cập nhật nghiệp vụ `updateFloorFailure` (update floor failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateFloorFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateFloorFailure: (state, action) => {
            state.updatingId = null;
            state.mutationError = action.payload;
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `deleteFloorRequest` (delete floor request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function deleteFloorRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        deleteFloorRequest: (state, action) => {
            state.deletingId = action.payload.id;
            state.mutationError = null;
            state.mutationSuccess = null;
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `deleteFloorSuccess` (delete floor success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function deleteFloorSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        deleteFloorSuccess: (state, action) => {
            state.deletingId = null;
            state.mutationSuccess = "Xóa tầng thành công.";

            state.floors = state.floors.filter(
                /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
                (floor) => Number(floor.id) !== Number(action.payload)
            );
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `deleteFloorFailure` (delete floor failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function deleteFloorFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        deleteFloorFailure: (state, action) => {
            state.deletingId = null;
            state.mutationError = action.payload;
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `clearFloorNotice` (clear floor notice). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function clearFloorNotice
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        clearFloorNotice: (state) => {
            state.error = null;
            state.mutationError = null;
            state.mutationSuccess = null;
        },
    },
});

export const {
    fetchFloorsRequest,
    fetchFloorsSuccess,
    fetchFloorsFailure,
    createFloorRequest,
    createFloorSuccess,
    createFloorFailure,
    updateFloorRequest,
    updateFloorSuccess,
    updateFloorFailure,
    deleteFloorRequest,
    deleteFloorSuccess,
    deleteFloorFailure,
    clearFloorNotice,
} = floorSlice.actions;

export default floorSlice.reducer;
