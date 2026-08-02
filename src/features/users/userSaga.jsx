/**
 * @fileoverview Điều phối các tác vụ bất đồng bộ của userSaga, gọi API và phát action kết quả về Redux.
 *
 * Luồng chính: Action yêu cầu -> Saga gọi API -> action thành công/thất bại -> reducer cập nhật giao diện.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { call, put, takeEvery } from "redux-saga/effects";
import api from "../../services/api";
import {
    fetchUsersRequest,
    fetchUsersSuccess,
} from "./userSlice";

/**
 * Lấy nghiệp vụ `fetchUsersSaga` (fetch users saga). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function fetchUsersSaga
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* fetchUsersSaga() {
    try {
        const response = yield call(api.get, "/users");
        const users = response.data.data || response.data;
        yield put(fetchUsersSuccess(users));
    } catch {
        // Dự án đang chạy mock data, tự động fallback trả về dữ liệu mẫu khi chưa có API.
        const mockUsers = [
            { id: 1, name: "Lê Văn Tám", email: "tamtam@example.com", created_at: "2026-05-12" },
            { id: 2, name: "Trần Thế Anh", email: "anh.tt@example.com", created_at: "2026-05-18" },
            { id: 3, name: "Hoàng Khánh Vy", email: "vy.hk@example.com", created_at: "2026-05-22" },
            { id: 4, name: "Ngô Quốc Khánh", email: "khanh.nq@example.com", created_at: "2026-05-30" }
        ];
        yield put(fetchUsersSuccess(mockUsers));
    }
}

/**
 * Thực hiện nghiệp vụ `userSaga` (user saga). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function userSaga
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
export default function* userSaga() {
    yield takeEvery(fetchUsersRequest.type, fetchUsersSaga);
}
