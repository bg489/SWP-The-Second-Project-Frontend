import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import api from "../../../services/api";
import {
    fetchAdminUsersFailure,
    fetchAdminUsersRequest,
    fetchAdminUsersSuccess,
    updateAdminUserStatusFailure,
    updateAdminUserStatusRequest,
    updateAdminUserStatusSuccess,
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

function* handleUpdateAdminUserStatus(action) {
    try {
        const { id, role, status } = action.payload;

        const response = yield call(
            [api, api.patch],
            `/admin/users/${id}/role-status`,
            {
                role,
                status,
            }
        );

        const updatedUser = extractData(response);

        yield put(updateAdminUserStatusSuccess(updatedUser));
    } catch (error) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Cập nhật tài khoản thất bại.";

        yield put(updateAdminUserStatusFailure(message));
    }
}

export default function* adminUserSaga() {
    yield takeLatest(fetchAdminUsersRequest.type, handleFetchAdminUsers);
    yield takeEvery(
        updateAdminUserStatusRequest.type,
        handleUpdateAdminUserStatus
    );
}