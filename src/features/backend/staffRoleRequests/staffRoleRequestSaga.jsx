/**
 * @fileoverview Điều phối các tác vụ bất đồng bộ của staffRoleRequestSaga, gọi API và phát action kết quả về Redux.
 *
 * Luồng chính: Action yêu cầu -> Saga gọi API -> action thành công/thất bại -> reducer cập nhật giao diện.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
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
} from "./staffRoleRequestSlice";

/**
 * Thực hiện nghiệp vụ `extractData` (extract data). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function extractData
 * @param {*} response - Giá trị `response` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const extractData = (response) => response?.data?.data ?? response?.data ?? null;

/**
 * Thực hiện nghiệp vụ `extractList` (extract list). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function extractList
 * @param {*} response - Giá trị `response` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const extractList = (response) => {
  const data = extractData(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

/**
 * Lấy nghiệp vụ `getErrorMessage` (get error message). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function getErrorMessage
 * @param {*} error - Giá trị `error` được hàm sử dụng trong quá trình xử lý.
 * @param {*} fallback - Giá trị `fallback` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

/**
 * Xử lý nghiệp vụ `handleFetchManagerRequests` (handle fetch manager requests). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchManagerRequests
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchManagerRequests(action) {
  try {
    const response = yield call([api, api.get], "/staff-role-requests/my", {
      params: action.payload || undefined,
    });
    yield put(fetchManagerStaffRoleRequestsSuccess(extractList(response)));
  } catch (error) {
    yield put(
      fetchManagerStaffRoleRequestsFailure(
        getErrorMessage(error, "Không lấy được lịch sử đề nghị tạo tài khoản Staff.")
      )
    );
  }
}

/**
 * Xử lý nghiệp vụ `handleSubmitRequest` (handle submit request). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleSubmitRequest
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleSubmitRequest(action) {
  try {
    const { refreshParams, ...payload } = action.payload || {};
    const response = yield call(
      [api, api.post],
      "/staff-role-requests",
      payload,
      { timeout: 30000 }
    );
    yield put(submitStaffRoleRequestSuccess(extractData(response)));
    yield put(fetchManagerStaffRoleRequestsRequest(
      refreshParams?.buildingId ? { buildingId: refreshParams.buildingId } : undefined
    ));
  } catch (error) {
    yield put(
      submitStaffRoleRequestFailure(
        getErrorMessage(error, "Gửi hồ sơ đề nghị tạo tài khoản Staff thất bại.")
      )
    );
  }
}

/**
 * Xử lý nghiệp vụ `handleFetchAdminRequests` (handle fetch admin requests). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchAdminRequests
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchAdminRequests(action) {
  try {
    const response = yield call([api, api.get], "/staff-role-requests", {
      params: action.payload,
    });
    yield put(fetchAdminStaffRoleRequestsSuccess(extractList(response)));
  } catch (error) {
    yield put(
      fetchAdminStaffRoleRequestsFailure(
        getErrorMessage(error, "Không lấy được hồ sơ tạo tài khoản Staff.")
      )
    );
  }
}

/**
 * Xử lý nghiệp vụ `handleFetchStaffProfiles` (handle fetch staff profiles). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchStaffProfiles
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchStaffProfiles(action) {
  try {
    const response = yield call([api, api.get], "/staff-role-requests/profiles", {
      params: action.payload,
    });
    yield put(fetchStaffProfilesSuccess(extractData(response)));
  } catch (error) {
    yield put(
      fetchStaffProfilesFailure(
        getErrorMessage(error, "Không lấy được danh sách hồ sơ nhân viên.")
      )
    );
  }
}

/**
 * Xử lý nghiệp vụ `handleFetchStaffProfile` (handle fetch staff profile). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchStaffProfile
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchStaffProfile(action) {
  try {
    const path = action.payload?.userId
      ? `/staff-role-requests/profiles/${action.payload.userId}`
      : "/staff-role-requests/profiles/me";
    const response = yield call([api, api.get], path);
    yield put(fetchStaffProfileSuccess(extractData(response)));
  } catch (error) {
    yield put(
      fetchStaffProfileFailure(
        getErrorMessage(error, "Không lấy được hồ sơ nhân viên.")
      )
    );
  }
}

/**
 * Xử lý nghiệp vụ `handleApproveRequest` (handle approve request). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleApproveRequest
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
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
        getErrorMessage(error, "Duyệt hồ sơ tạo tài khoản Staff thất bại.")
      )
    );
  }
}

/**
 * Xử lý nghiệp vụ `handleRejectRequest` (handle reject request). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleRejectRequest
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
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
        getErrorMessage(error, "Từ chối hồ sơ tạo tài khoản Staff thất bại.")
      )
    );
  }
}

/**
 * Thực hiện nghiệp vụ `staffRoleRequestSaga` (staff role request saga). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function staffRoleRequestSaga
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
export default function* staffRoleRequestSaga() {
  yield takeLatest(fetchManagerStaffRoleRequestsRequest.type, handleFetchManagerRequests);
  yield takeLatest(submitStaffRoleRequest.type, handleSubmitRequest);
  yield takeLatest(fetchAdminStaffRoleRequestsRequest.type, handleFetchAdminRequests);
  yield takeLatest(fetchStaffProfilesRequest.type, handleFetchStaffProfiles);
  yield takeLatest(fetchStaffProfileRequest.type, handleFetchStaffProfile);
  yield takeLatest(approveStaffRoleRequest.type, handleApproveRequest);
  yield takeLatest(rejectStaffRoleRequest.type, handleRejectRequest);
}
