/**
 * @fileoverview Điều phối các tác vụ bất đồng bộ của rootSaga, gọi API và phát action kết quả về Redux.
 *
 * Luồng chính: Action yêu cầu -> Saga gọi API -> action thành công/thất bại -> reducer cập nhật giao diện.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { all } from "redux-saga/effects";


import authSaga from "../features/backend/auth/authSaga";
import adminUserSaga from "../features/backend/adminUsers/adminUserSaga";
import buildingChangeSaga from "../features/backend/buildingChange/buildingChangeSaga";
import buildingSaga from "../features/backend/buildings/buildingSaga";
import floorSaga from "../features/backend/floors/floorSaga";
import slotSaga from "../features/backend/slots/slotSaga";
import parkingSaga from "../features/backend/parking/parkingSaga";
import staffRoleRequestSaga from "../features/backend/staffRoleRequests/staffRoleRequestSaga";

/**
 * Thực hiện nghiệp vụ `rootSaga` (root saga). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function rootSaga
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
export default function* rootSaga() {
    yield all([
        authSaga(),
        adminUserSaga(),
        buildingChangeSaga(),
        buildingSaga(),
        floorSaga(),
        slotSaga(),
        parkingSaga(),
        staffRoleRequestSaga(),
    ]);
}
