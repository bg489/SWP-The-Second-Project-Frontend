/**
 * @fileoverview Điều phối các tác vụ bất đồng bộ của adminUserSaga, gọi API và phát action kết quả về Redux.
 *
 * Luồng chính: Action yêu cầu -> Saga gọi API -> action thành công/thất bại -> reducer cập nhật giao diện.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import api from "../../../services/api";
import {
    createAdminUserFailure,
    createAdminUserRequest,
    createAdminUserSuccess,
    fetchAdminUsersFailure,
    fetchAdminUsersRequest,
    fetchAdminUsersSuccess,
    setAdminUserLockFailure,
    setAdminUserLockRequest,
    setAdminUserLockSuccess,
} from "./adminUserSlice";

/**
 * Thực hiện nghiệp vụ `extractData` (extract data). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function extractData
 * @param {*} response - Giá trị `response` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const extractData = (response) => {
    return response?.data?.data || response?.data || {};
};

/**
 * Xử lý nghiệp vụ `handleFetchAdminUsers` (handle fetch admin users). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchAdminUsers
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchAdminUsers(action) {
    try {
        const response = yield call([api, api.get], "/admin/users", {
            params: action.payload,
        });

        const data = extractData(response);

        yield put(
            fetchAdminUsersSuccess({
                users: data.users || data || [],
                pagination: data.pagination || null,
            })
        );
    } catch (error) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Không lấy được danh sách tài khoản.";

        yield put(fetchAdminUsersFailure(message));
    }
}

/**
 * Xử lý nghiệp vụ `handleCreateAdminUser` (handle create admin user). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleCreateAdminUser
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleCreateAdminUser(action) {
    try {
        const { refreshParams, ...payload } = action.payload || {};
        const response = yield call(
            [api, api.post],
            "/admin/users",
            payload,
            { timeout: 30000 }
        );

        yield put(createAdminUserSuccess(extractData(response)));
        yield put(fetchAdminUsersRequest(refreshParams || { page: 1, limit: 10 }));
    } catch (error) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Tạo tài khoản thất bại.";

        yield put(createAdminUserFailure(message));
    }
}

/**
 * Xử lý nghiệp vụ `handleSetAdminUserLock` (handle set admin user lock). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleSetAdminUserLock
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleSetAdminUserLock(action) {
    try {
        const { id, locked, refreshParams } = action.payload;

        const response = yield call(
            [api, api.patch],
            `/admin/users/${id}/${locked ? "lock" : "unlock"}`,
            {},
            { timeout: 15000 }
        );

        const updatedUser = extractData(response);

        yield put(setAdminUserLockSuccess(updatedUser));

        if (refreshParams) {
            yield put(fetchAdminUsersRequest(refreshParams));
        }
    } catch (error) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Không thể cập nhật trạng thái khóa của tài khoản.";

        yield put(setAdminUserLockFailure(message));
    }
}

/**
 * Thực hiện nghiệp vụ `adminUserSaga` (admin user saga). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function adminUserSaga
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
export default function* adminUserSaga() {
    yield takeLatest(fetchAdminUsersRequest.type, handleFetchAdminUsers);
    yield takeLatest(createAdminUserRequest.type, handleCreateAdminUser);
    yield takeEvery(
        setAdminUserLockRequest.type,
        handleSetAdminUserLock
    );
}
