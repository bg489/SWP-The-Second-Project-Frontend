import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

import rootSaga from "./rootSaga";
import authReducer from "../features/backend/auth/authSlice";
import adminUserReducer from "../features/backend/adminUsers/adminUserSlice";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
    reducer: {
        auth: authReducer,
        adminUsers: adminUserReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: false,
        }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);