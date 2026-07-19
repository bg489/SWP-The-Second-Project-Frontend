import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  building: null,
  candidates: [],
  candidatesLoading: false,
  managerRequests: [],
  managerLoading: false,
  adminRequests: [],
  adminLoading: false,
  submitting: false,
  actionId: null,
  actionType: null,
  error: null,
  notice: null,
};

const staffRoleRequestSlice = createSlice({
  name: "staffRoleRequests",
  initialState,
  reducers: {
    fetchStaffRoleCandidatesRequest: (state) => {
      state.candidatesLoading = true;
      state.error = null;
    },
    fetchStaffRoleCandidatesSuccess: (state, action) => {
      state.candidatesLoading = false;
      state.building = action.payload?.building || null;
      state.candidates = action.payload?.users || [];
    },
    fetchStaffRoleCandidatesFailure: (state, action) => {
      state.candidatesLoading = false;
      state.error = action.payload;
    },

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
      state.notice = "Đã gửi hồ sơ đề nghị nhân viên đến quản trị viên.";
      state.managerRequests = [action.payload, ...state.managerRequests];
      state.candidates = state.candidates.filter(
        (candidate) => Number(candidate.id) !== Number(action.payload?.userId)
      );
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
        ? "Đã duyệt và cấp quyền nhân viên thành công."
        : "Đã từ chối hồ sơ đề nghị nhân viên.";
      state.adminRequests = state.adminRequests
        .map((request) =>
          Number(request.id) === Number(action.payload?.id) ? action.payload : request
        )
        .filter((request) => request.status === "PENDING");
    },
    staffRoleRequestActionFailure: (state, action) => {
      state.actionId = null;
      state.actionType = null;
      state.error = action.payload;
    },

    clearStaffRoleRequestNotice: (state) => {
      state.error = null;
      state.notice = null;
    },
  },
});

export const {
  approveStaffRoleRequest,
  clearStaffRoleRequestNotice,
  fetchAdminStaffRoleRequestsFailure,
  fetchAdminStaffRoleRequestsRequest,
  fetchAdminStaffRoleRequestsSuccess,
  fetchManagerStaffRoleRequestsFailure,
  fetchManagerStaffRoleRequestsRequest,
  fetchManagerStaffRoleRequestsSuccess,
  fetchStaffRoleCandidatesFailure,
  fetchStaffRoleCandidatesRequest,
  fetchStaffRoleCandidatesSuccess,
  rejectStaffRoleRequest,
  staffRoleRequestActionFailure,
  staffRoleRequestActionSuccess,
  submitStaffRoleRequest,
  submitStaffRoleRequestFailure,
  submitStaffRoleRequestSuccess,
} = staffRoleRequestSlice.actions;

export default staffRoleRequestSlice.reducer;
