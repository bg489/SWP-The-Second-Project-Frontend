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

const sagaMiddleware = createSagaMiddleware();

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
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: false,
        }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);
