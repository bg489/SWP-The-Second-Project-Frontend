/**
 * @fileoverview Khai báo chức năng frontend của module store.
 *
 * Luồng chính: Dữ liệu đầu vào -> xử lý theo trách nhiệm của module -> xuất kết quả cho lớp gọi.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

import rootSaga from "./rootSaga";
import authReducer from "../features/backend/auth/authSlice";
import adminUserReducer from "../features/backend/adminUsers/adminUserSlice";
import buildingChangeReducer from "../features/backend/buildingChange/buildingChangeSlice";
import buildingReducer from "../features/backend/buildings/buildingSlice";
import floorReducer from "../features/backend/floors/floorSlice";
import slotReducer from "../features/backend/slots/slotSlice";
import parkingReducer from "../features/backend/parking/parkingSlice";
import staffRoleRequestReducer from "../features/backend/staffRoleRequests/staffRoleRequestSlice";

/**
 * Khai báo `sagaMiddleware` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/app/store.jsx.
 */
const sagaMiddleware = createSagaMiddleware();

/**
 * Khai báo `store` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/app/store.jsx.
 */
export const store = configureStore({
    reducer: {
        auth: authReducer,
        adminUsers: adminUserReducer,
        buildingChange: buildingChangeReducer,
        buildings: buildingReducer,
        floors: floorReducer,
        slots: slotReducer,
        parking: parkingReducer,
        staffRoleRequests: staffRoleRequestReducer,
    },
    /**
     * Thực hiện nghiệp vụ `middleware` (middleware). Hàm đóng gói một bước xử lý để các phần khác có thể tái sử dụng nhất quán.
     *
     * @function middleware
     * @param {*} getDefaultMiddleware - Giá trị `getDefaultMiddleware` được hàm sử dụng trong quá trình xử lý.
     * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
     */
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ["parking/recognizePlateRequest"],
            },
            thunk: false,
        }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);
