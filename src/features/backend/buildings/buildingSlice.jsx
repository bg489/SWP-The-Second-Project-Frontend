/**
 * @fileoverview Khai báo state, action và reducer Redux cho miền dữ liệu buildingSlice.
 *
 * Luồng chính: Action được dispatch -> reducer tương ứng cập nhật state bất biến do Redux Toolkit quản lý.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { createSlice } from "@reduxjs/toolkit";

/**
 * Khai báo `initialState` để mô tả trạng thái khởi tạo trước khi người dùng hoặc API tạo ra thay đổi.
 * Phạm vi sử dụng: src/features/backend/buildings/buildingSlice.jsx.
 */
const initialState = {
    buildings: [],
    loading: false,
    error: null,

    creating: false,
    updatingId: null,
    deletingId: null,

    mutationError: null,
    mutationSuccess: null,
};

/**
 * Khai báo `buildingSlice` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/backend/buildings/buildingSlice.jsx.
 */
const buildingSlice = createSlice({
    name: "buildings",
    initialState,
    reducers: {
        /**
         * Lấy nghiệp vụ `fetchBuildingsRequest` (fetch buildings request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchBuildingsRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchBuildingsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        /**
         * Lấy nghiệp vụ `fetchBuildingsSuccess` (fetch buildings success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchBuildingsSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchBuildingsSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.buildings = action.payload || [];
        },

        /**
         * Lấy nghiệp vụ `fetchBuildingsFailure` (fetch buildings failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchBuildingsFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchBuildingsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        /**
         * Tạo nghiệp vụ `createBuildingRequest` (create building request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createBuildingRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createBuildingRequest: (state) => {
            state.creating = true;
            state.mutationError = null;
            state.mutationSuccess = null;
        },

        /**
         * Tạo nghiệp vụ `createBuildingSuccess` (create building success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createBuildingSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createBuildingSuccess: (state, action) => {
            state.creating = false;
            state.mutationSuccess = "Tạo tòa nhà thành công.";

            const createdBuilding = action.payload;
            if (createdBuilding?.id) {
                state.buildings = [createdBuilding, ...state.buildings];
            }
        },

        /**
         * Tạo nghiệp vụ `createBuildingFailure` (create building failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createBuildingFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createBuildingFailure: (state, action) => {
            state.creating = false;
            state.mutationError = action.payload;
        },

        /**
         * Cập nhật nghiệp vụ `updateBuildingRequest` (update building request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateBuildingRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateBuildingRequest: (state, action) => {
            state.updatingId = action.payload.id;
            state.mutationError = null;
            state.mutationSuccess = null;
        },

        /**
         * Cập nhật nghiệp vụ `updateBuildingSuccess` (update building success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateBuildingSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateBuildingSuccess: (state, action) => {
            state.updatingId = null;
            state.mutationSuccess = "Cập nhật tòa nhà thành công.";

            const updatedBuilding = action.payload;

            /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
            state.buildings = state.buildings.map((building) =>
                Number(building.id) === Number(updatedBuilding.id)
                    ? updatedBuilding
                    : building
            );
        },

        /**
         * Cập nhật nghiệp vụ `updateBuildingFailure` (update building failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateBuildingFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateBuildingFailure: (state, action) => {
            state.updatingId = null;
            state.mutationError = action.payload;
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `deleteBuildingRequest` (delete building request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function deleteBuildingRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        deleteBuildingRequest: (state, action) => {
            state.deletingId = action.payload.id;
            state.mutationError = null;
            state.mutationSuccess = null;
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `deleteBuildingSuccess` (delete building success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function deleteBuildingSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        deleteBuildingSuccess: (state, action) => {
            state.deletingId = null;
            state.mutationSuccess = "Xóa tòa nhà thành công.";

            state.buildings = state.buildings.filter(
                /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
                (building) => Number(building.id) !== Number(action.payload)
            );
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `deleteBuildingFailure` (delete building failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function deleteBuildingFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        deleteBuildingFailure: (state, action) => {
            state.deletingId = null;
            state.mutationError = action.payload;
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `clearBuildingNotice` (clear building notice). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function clearBuildingNotice
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        clearBuildingNotice: (state) => {
            state.error = null;
            state.mutationError = null;
            state.mutationSuccess = null;
        },
    },
});

export const {
    fetchBuildingsRequest,
    fetchBuildingsSuccess,
    fetchBuildingsFailure,
    createBuildingRequest,
    createBuildingSuccess,
    createBuildingFailure,
    updateBuildingRequest,
    updateBuildingSuccess,
    updateBuildingFailure,
    deleteBuildingRequest,
    deleteBuildingSuccess,
    deleteBuildingFailure,
    clearBuildingNotice,
} = buildingSlice.actions;

export default buildingSlice.reducer;