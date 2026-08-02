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

const extractData = (response) => {
    return response?.data?.data || response?.data || {};
};

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

export default function* adminUserSaga() {
    yield takeLatest(fetchAdminUsersRequest.type, handleFetchAdminUsers);
    yield takeLatest(createAdminUserRequest.type, handleCreateAdminUser);
    yield takeEvery(
        setAdminUserLockRequest.type,
        handleSetAdminUserLock
    );
}
