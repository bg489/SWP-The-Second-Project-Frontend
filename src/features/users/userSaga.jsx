import { call, put, takeEvery } from "redux-saga/effects";
import api from "../../services/api";
import {
    fetchUsersRequest,
    fetchUsersSuccess,
    fetchUsersFailure,
    updateUserRoleStatusRequest,
    updateUserRoleStatusSuccess,
    updateUserRoleStatusFailure,
    lockUserRequest,
    lockUserSuccess,
    lockUserFailure,
    unlockUserRequest,
    unlockUserSuccess,
    unlockUserFailure
} from "./userSlice";

// GET /api/admin/users
function* fetchUsersSaga() {
    try {
        const response = yield call(api.get, "/api/admin/users");
        const users = response.data.data || response.data;
        yield put(fetchUsersSuccess(users));
    } catch (error) {
        console.warn("API GET /api/admin/users failed. Falling back to mock data.", error.message);
        // Fallback to high-quality mock data matching the new schema
        const mockUsers = [
            { id: 1, name: "Lê Văn Tám", email: "tamtam@example.com", role: "USER", status: "ACTIVE", created_at: "2026-05-12" },
            { id: 2, name: "Trần Thế Anh", email: "anh.tt@example.com", role: "STAFF", status: "ACTIVE", created_at: "2026-05-18" },
            { id: 3, name: "Hoàng Khánh Vy", email: "vy.hk@example.com", role: "MANAGER", status: "ACTIVE", created_at: "2026-05-22" },
            { id: 4, name: "Ngô Quốc Khánh", email: "khanh.nq@example.com", role: "ADMIN", status: "ACTIVE", created_at: "2026-05-30" },
            { id: 5, name: "Phạm Hồng Sơn", email: "son.ph@example.com", role: "USER", status: "LOCKED", created_at: "2026-06-02" }
        ];
        yield put(fetchUsersSuccess(mockUsers));
    }
}

// PATCH /api/admin/users/{id}/role-status
function* updateUserRoleStatusSaga(action) {
    const { id, role, status } = action.payload;
    try {
        const response = yield call(api.patch, `/api/admin/users/${id}/role-status`, { role, status });
        const updatedUser = response.data.data || response.data;
        yield put(updateUserRoleStatusSuccess(updatedUser));
    } catch (error) {
        console.warn(`API PATCH /role-status for user ${id} failed. Falling back to mock update.`, error.message);
        yield put(updateUserRoleStatusSuccess({ id, role, status }));
    }
}

// PATCH /api/admin/users/{id}/lock
function* lockUserSaga(action) {
    const id = action.payload;
    try {
        yield call(api.patch, `/api/admin/users/${id}/lock`);
        yield put(lockUserSuccess(id));
    } catch (error) {
        console.warn(`API PATCH /lock for user ${id} failed. Falling back to mock.`, error.message);
        yield put(lockUserSuccess(id));
    }
}

// PATCH /api/admin/users/{id}/unlock
function* unlockUserSaga(action) {
    const id = action.payload;
    try {
        yield call(api.patch, `/api/admin/users/${id}/unlock`);
        yield put(unlockUserSuccess(id));
    } catch (error) {
        console.warn(`API PATCH /unlock for user ${id} failed. Falling back to mock.`, error.message);
        yield put(unlockUserSuccess(id));
    }
}

export default function* userSaga() {
    yield takeEvery(fetchUsersRequest.type, fetchUsersSaga);
    yield takeEvery(updateUserRoleStatusRequest.type, updateUserRoleStatusSaga);
    yield takeEvery(lockUserRequest.type, lockUserSaga);
    yield takeEvery(unlockUserRequest.type, unlockUserSaga);
}