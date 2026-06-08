import { call, put, takeEvery } from "redux-saga/effects";
import api from "../../services/api";
import {
    fetchUsersRequest,
    fetchUsersSuccess,
    fetchUsersFailure,
} from "./userSlice";

function* fetchUsersSaga() {
    try {
        const response = yield call(api.get, "/users");
        const users = response.data.data || response.data;
        yield put(fetchUsersSuccess(users));
    } catch (error) {
        // Dự án đang chạy mock data, tự động fallback trả về dữ liệu mẫu khi chưa có API
        const mockUsers = [
            { id: 1, name: "Lê Văn Tám", email: "tamtam@example.com", created_at: "2026-05-12" },
            { id: 2, name: "Trần Thế Anh", email: "anh.tt@example.com", created_at: "2026-05-18" },
            { id: 3, name: "Hoàng Khánh Vy", email: "vy.hk@example.com", created_at: "2026-05-22" },
            { id: 4, name: "Ngô Quốc Khánh", email: "khanh.nq@example.com", created_at: "2026-05-30" }
        ];
        yield put(fetchUsersSuccess(mockUsers));
    }
}

export default function* userSaga() {
    yield takeEvery(fetchUsersRequest.type, fetchUsersSaga);
}