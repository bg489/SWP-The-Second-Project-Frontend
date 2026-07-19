import { call, put, takeLatest } from "redux-saga/effects";

import api from "../../../services/api";
import {
  approveStaffRoleRequest,
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
} from "./staffRoleRequestSlice";

const extractData = (response) => response?.data?.data ?? response?.data ?? null;

const extractList = (response) => {
  const data = extractData(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

function* handleFetchCandidates(action) {
  try {
    const response = yield call([api, api.get], "/staff-role-requests/candidates", {
      params: { q: action.payload?.q || undefined },
    });
    yield put(fetchStaffRoleCandidatesSuccess(extractData(response)));
  } catch (error) {
    yield put(
      fetchStaffRoleCandidatesFailure(
        getErrorMessage(error, "Không lấy được danh sách tài khoản trong tòa.")
      )
    );
  }
}

function* handleFetchManagerRequests() {
  try {
    const response = yield call([api, api.get], "/staff-role-requests/my");
    yield put(fetchManagerStaffRoleRequestsSuccess(extractList(response)));
  } catch (error) {
    yield put(
      fetchManagerStaffRoleRequestsFailure(
        getErrorMessage(error, "Không lấy được lịch sử đề nghị nhân viên.")
      )
    );
  }
}

function* handleSubmitRequest(action) {
  try {
    const response = yield call(
      [api, api.post],
      "/staff-role-requests",
      action.payload,
      { timeout: 30000 }
    );
    yield put(submitStaffRoleRequestSuccess(extractData(response)));
    yield put(fetchManagerStaffRoleRequestsRequest());
    yield put(fetchStaffRoleCandidatesRequest());
  } catch (error) {
    yield put(
      submitStaffRoleRequestFailure(
        getErrorMessage(error, "Gửi hồ sơ đề nghị nhân viên thất bại.")
      )
    );
  }
}

function* handleFetchAdminRequests(action) {
  try {
    const response = yield call([api, api.get], "/staff-role-requests", {
      params: action.payload,
    });
    yield put(fetchAdminStaffRoleRequestsSuccess(extractList(response)));
  } catch (error) {
    yield put(
      fetchAdminStaffRoleRequestsFailure(
        getErrorMessage(error, "Không lấy được hồ sơ đề nghị nhân viên.")
      )
    );
  }
}

function* handleApproveRequest(action) {
  try {
    const { id, adminNote } = action.payload;
    const response = yield call(
      [api, api.patch],
      `/staff-role-requests/${id}/approve`,
      { adminNote },
      { timeout: 20000 }
    );
    yield put(staffRoleRequestActionSuccess(extractData(response)));
  } catch (error) {
    yield put(
      staffRoleRequestActionFailure(
        getErrorMessage(error, "Duyệt hồ sơ đề nghị nhân viên thất bại.")
      )
    );
  }
}

function* handleRejectRequest(action) {
  try {
    const { id, adminNote } = action.payload;
    const response = yield call(
      [api, api.patch],
      `/staff-role-requests/${id}/reject`,
      { adminNote },
      { timeout: 20000 }
    );
    yield put(staffRoleRequestActionSuccess(extractData(response)));
  } catch (error) {
    yield put(
      staffRoleRequestActionFailure(
        getErrorMessage(error, "Từ chối hồ sơ đề nghị nhân viên thất bại.")
      )
    );
  }
}

export default function* staffRoleRequestSaga() {
  yield takeLatest(fetchStaffRoleCandidatesRequest.type, handleFetchCandidates);
  yield takeLatest(fetchManagerStaffRoleRequestsRequest.type, handleFetchManagerRequests);
  yield takeLatest(submitStaffRoleRequest.type, handleSubmitRequest);
  yield takeLatest(fetchAdminStaffRoleRequestsRequest.type, handleFetchAdminRequests);
  yield takeLatest(approveStaffRoleRequest.type, handleApproveRequest);
  yield takeLatest(rejectStaffRoleRequest.type, handleRejectRequest);
}
