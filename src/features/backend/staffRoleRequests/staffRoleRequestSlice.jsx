import { createSlice } from "@reduxjs/toolkit";

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

const staffRoleRequestSlice = createSlice({
  name: "staffRoleRequests",
  initialState,
  reducers: {
    fetchManagerStaffRoleRequestsRequest: (state) => {
      state.managerLoading = true;
      state.error = null;
    },
    fetchManagerStaffRoleRequestsSuccess: (state, action) => {
      state.managerLoading = false;
      state.managerRequests = action.payload || [];
    },
    fetchManagerStaffRoleRequestsFailure: (state, action) => {
      state.managerLoading = false;
      state.error = action.payload;
    },

    submitStaffRoleRequest: (state) => {
      state.submitting = true;
      state.error = null;
      state.notice = null;
    },
    submitStaffRoleRequestSuccess: (state, action) => {
      state.submitting = false;
      state.notice = "Đã gửi đề nghị tạo tài khoản Staff độc lập đến quản trị viên.";
      state.managerRequests = [action.payload, ...state.managerRequests];
    },
    submitStaffRoleRequestFailure: (state, action) => {
      state.submitting = false;
      state.error = action.payload;
    },

    fetchAdminStaffRoleRequestsRequest: (state) => {
      state.adminLoading = true;
      state.error = null;
    },
    fetchAdminStaffRoleRequestsSuccess: (state, action) => {
      state.adminLoading = false;
      state.adminRequests = action.payload || [];
    },
    fetchAdminStaffRoleRequestsFailure: (state, action) => {
      state.adminLoading = false;
      state.error = action.payload;
    },

    approveStaffRoleRequest: (state, action) => {
      state.actionId = action.payload.id;
      state.actionType = "APPROVE";
      state.error = null;
      state.notice = null;
    },
    rejectStaffRoleRequest: (state, action) => {
      state.actionId = action.payload.id;
      state.actionType = "REJECT";
      state.error = null;
      state.notice = null;
    },
    staffRoleRequestActionSuccess: (state, action) => {
      state.actionId = null;
      state.actionType = null;
      state.notice = action.payload?.status === "APPROVED"
        ? "Đã duyệt và tạo tài khoản Staff độc lập thành công."
        : "Đã từ chối hồ sơ tạo tài khoản Staff.";
      state.adminRequests = state.adminRequests.map((request) =>
        Number(request.id) === Number(action.payload?.id) ? action.payload : request
      );
    },
    staffRoleRequestActionFailure: (state, action) => {
      state.actionId = null;
      state.actionType = null;
      state.error = action.payload;
    },

    fetchStaffProfilesRequest: (state) => {
      state.profilesLoading = true;
      state.error = null;
      state.staffProfiles = [];
      state.profilesBuilding = null;
    },
    fetchStaffProfilesSuccess: (state, action) => {
      state.profilesLoading = false;
      state.profilesBuilding = action.payload?.building || null;
      state.staffProfiles = action.payload?.profiles || [];
    },
    fetchStaffProfilesFailure: (state, action) => {
      state.profilesLoading = false;
      state.staffProfiles = [];
      state.profilesBuilding = null;
      state.error = action.payload;
    },
    clearStaffProfiles: (state) => {
      state.staffProfiles = [];
      state.profilesBuilding = null;
      state.profilesLoading = false;
    },

    fetchStaffProfileRequest: (state) => {
      state.profileLoading = true;
      state.error = null;
      state.profile = null;
    },
    fetchStaffProfileSuccess: (state, action) => {
      state.profileLoading = false;
      state.profile = action.payload || null;
    },
    fetchStaffProfileFailure: (state, action) => {
      state.profileLoading = false;
      state.profile = null;
      state.error = action.payload;
    },
    clearStaffProfile: (state) => {
      state.profile = null;
      state.error = null;
    },

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
