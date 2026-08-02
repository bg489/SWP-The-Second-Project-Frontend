/**
 * @fileoverview Khai báo state, action và reducer Redux cho miền dữ liệu staffRoleRequestSlice.
 *
 * Luồng chính: Action được dispatch -> reducer tương ứng cập nhật state bất biến do Redux Toolkit quản lý.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { createSlice } from "@reduxjs/toolkit";

/**
 * Khai báo `initialState` để mô tả trạng thái khởi tạo trước khi người dùng hoặc API tạo ra thay đổi.
 * Phạm vi sử dụng: src/features/backend/staffRoleRequests/staffRoleRequestSlice.jsx.
 */
const initialState = {
  managerRequests: [],
  managerLoading: false,
  adminRequests: [],
  adminLoading: false,
  submitting: false,
  actionId: null,
  actionType: null,
  staffProfiles: [],
  profilesBuilding: null,
  profilesLoading: false,
  profile: null,
  profileLoading: false,
  error: null,
  notice: null,
};

/**
 * Khai báo `staffRoleRequestSlice` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/backend/staffRoleRequests/staffRoleRequestSlice.jsx.
 */
const staffRoleRequestSlice = createSlice({
  name: "staffRoleRequests",
  initialState,
  reducers: {
    /**
     * Lấy nghiệp vụ `fetchManagerStaffRoleRequestsRequest` (fetch manager staff role requests request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function fetchManagerStaffRoleRequestsRequest
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    fetchManagerStaffRoleRequestsRequest: (state) => {
      state.managerLoading = true;
      state.error = null;
    },
    /**
     * Lấy nghiệp vụ `fetchManagerStaffRoleRequestsSuccess` (fetch manager staff role requests success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function fetchManagerStaffRoleRequestsSuccess
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    fetchManagerStaffRoleRequestsSuccess: (state, action) => {
      state.managerLoading = false;
      state.managerRequests = action.payload || [];
    },
    /**
     * Lấy nghiệp vụ `fetchManagerStaffRoleRequestsFailure` (fetch manager staff role requests failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function fetchManagerStaffRoleRequestsFailure
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    fetchManagerStaffRoleRequestsFailure: (state, action) => {
      state.managerLoading = false;
      state.error = action.payload;
    },

    /**
     * Thực hiện nghiệp vụ `submitStaffRoleRequest` (submit staff role request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function submitStaffRoleRequest
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    submitStaffRoleRequest: (state) => {
      state.submitting = true;
      state.error = null;
      state.notice = null;
    },
    /**
     * Thực hiện nghiệp vụ `submitStaffRoleRequestSuccess` (submit staff role request success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function submitStaffRoleRequestSuccess
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    submitStaffRoleRequestSuccess: (state, action) => {
      state.submitting = false;
      state.notice = "Đã gửi đề nghị tạo tài khoản Staff độc lập đến quản trị viên.";
      state.managerRequests = [action.payload, ...state.managerRequests];
    },
    /**
     * Thực hiện nghiệp vụ `submitStaffRoleRequestFailure` (submit staff role request failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function submitStaffRoleRequestFailure
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    submitStaffRoleRequestFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    /**
     * Lấy nghiệp vụ `fetchAdminStaffRoleRequestsRequest` (fetch admin staff role requests request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function fetchAdminStaffRoleRequestsRequest
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    fetchAdminStaffRoleRequestsRequest: (state) => {
      state.adminLoading = true;
      state.error = null;
    },
    /**
     * Lấy nghiệp vụ `fetchAdminStaffRoleRequestsSuccess` (fetch admin staff role requests success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function fetchAdminStaffRoleRequestsSuccess
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    fetchAdminStaffRoleRequestsSuccess: (state, action) => {
      state.adminLoading = false;
      state.adminRequests = action.payload || [];
    },
    /**
     * Lấy nghiệp vụ `fetchAdminStaffRoleRequestsFailure` (fetch admin staff role requests failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function fetchAdminStaffRoleRequestsFailure
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    fetchAdminStaffRoleRequestsFailure: (state, action) => {
      state.adminLoading = false;
      state.error = action.payload;
    },

    /**
     * Thực hiện nghiệp vụ `approveStaffRoleRequest` (approve staff role request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function approveStaffRoleRequest
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    approveStaffRoleRequest: (state, action) => {
      state.actionId = action.payload.id;
      state.actionType = "APPROVE";
      state.error = null;
      state.notice = null;
    },
    /**
     * Thực hiện nghiệp vụ `rejectStaffRoleRequest` (reject staff role request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function rejectStaffRoleRequest
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    rejectStaffRoleRequest: (state, action) => {
      state.actionId = action.payload.id;
      state.actionType = "REJECT";
      state.error = null;
      state.notice = null;
    },
    /**
     * Thực hiện nghiệp vụ `staffRoleRequestActionSuccess` (staff role request action success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function staffRoleRequestActionSuccess
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    staffRoleRequestActionSuccess: (state, action) => {
      state.actionId = null;
      state.actionType = null;
      state.notice = action.payload?.status === "APPROVED"
        ? "Đã duyệt và tạo tài khoản Staff độc lập thành công."
        : "Đã từ chối hồ sơ tạo tài khoản Staff.";
      /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
      state.adminRequests = state.adminRequests.map((request) =>
        Number(request.id) === Number(action.payload?.id) ? action.payload : request
      );
    },
    /**
     * Thực hiện nghiệp vụ `staffRoleRequestActionFailure` (staff role request action failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function staffRoleRequestActionFailure
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    staffRoleRequestActionFailure: (state, action) => {
      state.actionId = null;
      state.actionType = null;
      state.error = action.payload;
    },

    /**
     * Lấy nghiệp vụ `fetchStaffProfilesRequest` (fetch staff profiles request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function fetchStaffProfilesRequest
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    fetchStaffProfilesRequest: (state) => {
      state.profilesLoading = true;
      state.error = null;
      state.staffProfiles = [];
      state.profilesBuilding = null;
    },
    /**
     * Lấy nghiệp vụ `fetchStaffProfilesSuccess` (fetch staff profiles success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function fetchStaffProfilesSuccess
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    fetchStaffProfilesSuccess: (state, action) => {
      state.profilesLoading = false;
      state.profilesBuilding = action.payload?.building || null;
      state.staffProfiles = action.payload?.profiles || [];
    },
    /**
     * Lấy nghiệp vụ `fetchStaffProfilesFailure` (fetch staff profiles failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function fetchStaffProfilesFailure
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    fetchStaffProfilesFailure: (state, action) => {
      state.profilesLoading = false;
      state.staffProfiles = [];
      state.profilesBuilding = null;
      state.error = action.payload;
    },
    /**
     * Xóa hoặc đặt lại nghiệp vụ `clearStaffProfiles` (clear staff profiles). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function clearStaffProfiles
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    clearStaffProfiles: (state) => {
      state.staffProfiles = [];
      state.profilesBuilding = null;
      state.profilesLoading = false;
    },

    /**
     * Lấy nghiệp vụ `fetchStaffProfileRequest` (fetch staff profile request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function fetchStaffProfileRequest
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    fetchStaffProfileRequest: (state) => {
      state.profileLoading = true;
      state.error = null;
      state.profile = null;
    },
    /**
     * Lấy nghiệp vụ `fetchStaffProfileSuccess` (fetch staff profile success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function fetchStaffProfileSuccess
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    fetchStaffProfileSuccess: (state, action) => {
      state.profileLoading = false;
      state.profile = action.payload || null;
    },
    /**
     * Lấy nghiệp vụ `fetchStaffProfileFailure` (fetch staff profile failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function fetchStaffProfileFailure
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    fetchStaffProfileFailure: (state, action) => {
      state.profileLoading = false;
      state.profile = null;
      state.error = action.payload;
    },
    /**
     * Xóa hoặc đặt lại nghiệp vụ `clearStaffProfile` (clear staff profile). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function clearStaffProfile
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    clearStaffProfile: (state) => {
      state.profile = null;
      state.error = null;
    },

    /**
     * Xóa hoặc đặt lại nghiệp vụ `clearStaffRoleRequestNotice` (clear staff role request notice). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
     *
     * @function clearStaffRoleRequestNotice
     * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
     * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
     */
    clearStaffRoleRequestNotice: (state) => {
      state.error = null;
      state.notice = null;
    },
  },
});

export const {
  approveStaffRoleRequest,
  clearStaffProfile,
  clearStaffProfiles,
  clearStaffRoleRequestNotice,
  fetchAdminStaffRoleRequestsFailure,
  fetchAdminStaffRoleRequestsRequest,
  fetchAdminStaffRoleRequestsSuccess,
  fetchManagerStaffRoleRequestsFailure,
  fetchManagerStaffRoleRequestsRequest,
  fetchManagerStaffRoleRequestsSuccess,
  fetchStaffProfileFailure,
  fetchStaffProfileRequest,
  fetchStaffProfileSuccess,
  fetchStaffProfilesFailure,
  fetchStaffProfilesRequest,
  fetchStaffProfilesSuccess,
  rejectStaffRoleRequest,
  staffRoleRequestActionFailure,
  staffRoleRequestActionSuccess,
  submitStaffRoleRequest,
  submitStaffRoleRequestFailure,
  submitStaffRoleRequestSuccess,
} = staffRoleRequestSlice.actions;

export default staffRoleRequestSlice.reducer;
