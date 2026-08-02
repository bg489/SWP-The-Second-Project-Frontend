/**
 * @fileoverview Khai báo state, action và reducer Redux cho miền dữ liệu buildingChangeSlice.
 *
 * Luồng chính: Action được dispatch -> reducer tương ứng cập nhật state bất biến do Redux Toolkit quản lý.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { createSlice } from "@reduxjs/toolkit";

/**
 * Khai báo `initialState` để mô tả trạng thái khởi tạo trước khi người dùng hoặc API tạo ra thay đổi.
 * Phạm vi sử dụng: src/features/backend/buildingChange/buildingChangeSlice.jsx.
 */
const initialState = {
    buildings: [],
    buildingsLoading: false,
    buildingsError: null,

    myRequests: [],
    myLoading: false,

    adminRequests: [],
    adminLoading: false,

    submitLoading: false,
    actionId: null,

    error: null,
    notice: null,
};

/**
 * Khai báo `buildingChangeSlice` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/backend/buildingChange/buildingChangeSlice.jsx.
 */
const buildingChangeSlice = createSlice({
    name: "buildingChange",
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
            state.buildingsLoading = true;
            state.buildingsError = null;
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
            state.buildingsLoading = false;
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
            state.buildingsLoading = false;
            state.buildingsError = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchMyBuildingChangeRequestsRequest` (fetch my building change requests request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyBuildingChangeRequestsRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyBuildingChangeRequestsRequest: (state) => {
            state.myLoading = true;
            state.error = null;
        },

        /**
         * Lấy nghiệp vụ `fetchMyBuildingChangeRequestsSuccess` (fetch my building change requests success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyBuildingChangeRequestsSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyBuildingChangeRequestsSuccess: (state, action) => {
            state.myLoading = false;
            state.myRequests = action.payload || [];
        },

        /**
         * Lấy nghiệp vụ `fetchMyBuildingChangeRequestsFailure` (fetch my building change requests failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchMyBuildingChangeRequestsFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchMyBuildingChangeRequestsFailure: (state, action) => {
            state.myLoading = false;
            state.error = action.payload;
        },

        /**
         * Thực hiện nghiệp vụ `submitBuildingChangeRequest` (submit building change request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function submitBuildingChangeRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        submitBuildingChangeRequest: (state) => {
            state.submitLoading = true;
            state.error = null;
            state.notice = null;
        },

        /**
         * Thực hiện nghiệp vụ `submitBuildingChangeSuccess` (submit building change success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function submitBuildingChangeSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        submitBuildingChangeSuccess: (state, action) => {
            state.submitLoading = false;
            state.notice = "Gửi yêu cầu đổi tòa nhà thành công.";
            state.myRequests = [action.payload, ...state.myRequests];
        },

        /**
         * Thực hiện nghiệp vụ `submitBuildingChangeFailure` (submit building change failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function submitBuildingChangeFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        submitBuildingChangeFailure: (state, action) => {
            state.submitLoading = false;
            state.error = action.payload;
        },

        /**
         * Lấy nghiệp vụ `fetchAdminBuildingChangeRequestsRequest` (fetch admin building change requests request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchAdminBuildingChangeRequestsRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchAdminBuildingChangeRequestsRequest: (state) => {
            state.adminLoading = true;
            state.error = null;
        },

        /**
         * Lấy nghiệp vụ `fetchAdminBuildingChangeRequestsSuccess` (fetch admin building change requests success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchAdminBuildingChangeRequestsSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchAdminBuildingChangeRequestsSuccess: (state, action) => {
            state.adminLoading = false;
            state.adminRequests = action.payload || [];
        },

        /**
         * Lấy nghiệp vụ `fetchAdminBuildingChangeRequestsFailure` (fetch admin building change requests failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchAdminBuildingChangeRequestsFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchAdminBuildingChangeRequestsFailure: (state, action) => {
            state.adminLoading = false;
            state.error = action.payload;
        },

        /**
         * Thực hiện nghiệp vụ `approveBuildingChangeRequest` (approve building change request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function approveBuildingChangeRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        approveBuildingChangeRequest: (state, action) => {
            state.actionId = action.payload.id;
            state.error = null;
            state.notice = null;
        },

        /**
         * Thực hiện nghiệp vụ `rejectBuildingChangeRequest` (reject building change request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function rejectBuildingChangeRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        rejectBuildingChangeRequest: (state, action) => {
            state.actionId = action.payload.id;
            state.error = null;
            state.notice = null;
        },

        /**
         * Tạo nghiệp vụ `buildingChangeActionSuccess` (building change action success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function buildingChangeActionSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        buildingChangeActionSuccess: (state, action) => {
            state.actionId = null;
            state.notice = "Cập nhật yêu cầu thành công.";

            const updatedRequest = action.payload;

            state.adminRequests = state.adminRequests
                /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
                .map((request) =>
                    Number(request.id) === Number(updatedRequest.id) ? updatedRequest : request
                )
                /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
                .filter((request) => request.status === "PENDING");
        },

        /**
         * Tạo nghiệp vụ `buildingChangeActionFailure` (building change action failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function buildingChangeActionFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        buildingChangeActionFailure: (state, action) => {
            state.actionId = null;
            state.error = action.payload;
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `clearBuildingChangeNotice` (clear building change notice). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function clearBuildingChangeNotice
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        clearBuildingChangeNotice: (state) => {
            state.error = null;
            state.notice = null;
        },
    },
});

export const {
    fetchBuildingsRequest,
    fetchBuildingsSuccess,
    fetchBuildingsFailure,
    fetchMyBuildingChangeRequestsRequest,
    fetchMyBuildingChangeRequestsSuccess,
    fetchMyBuildingChangeRequestsFailure,
    submitBuildingChangeRequest,
    submitBuildingChangeSuccess,
    submitBuildingChangeFailure,
    fetchAdminBuildingChangeRequestsRequest,
    fetchAdminBuildingChangeRequestsSuccess,
    fetchAdminBuildingChangeRequestsFailure,
    approveBuildingChangeRequest,
    rejectBuildingChangeRequest,
    buildingChangeActionSuccess,
    buildingChangeActionFailure,
    clearBuildingChangeNotice,
} = buildingChangeSlice.actions;

export default buildingChangeSlice.reducer;