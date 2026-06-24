import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import api from "../../../services/api";
import {
    fetchRegisterBuildingsFailure,
    fetchRegisterBuildingsRequest,
    fetchRegisterBuildingsSuccess,
    loginFailure,
    loginRequest,
    loginSuccess,
    logout,
    registerFailure,
    registerRequest,
    registerSuccess,
} from "./authSlice";

const backendToFrontendRole = {
    ADMIN: "ADMIN",
    USER: "USER",
    MANAGER: "PARKING_MANAGER",
    STAFF: "PARKING_STAFF",
    PARKING_MANAGER: "PARKING_MANAGER",
    PARKING_STAFF: "PARKING_STAFF",
};

const extractLoginData = (response) => {
    const payload = response?.data?.data || response?.data || {};

    const token = payload.token || payload.accessToken || payload.jwt;
    const user = payload.user || payload.currentUser || payload.account || payload;

    const backendRole = user?.role || payload.role || "USER";
    const frontendRole = backendToFrontendRole[backendRole] || "USER";

    return {
        token,
        user,
        backendRole,
        frontendRole,
    };
};

const extractListData = (response) => {
    const data = response?.data?.data || response?.data || [];

    if (Array.isArray(data)) return data;
    if (Array.isArray(data.buildings)) return data.buildings;
    if (Array.isArray(data.items)) return data.items;

    return [];
};

function* handleFetchRegisterBuildings() {
    try {
        const response = yield call([api, api.get], "/buildings");

        yield put(fetchRegisterBuildingsSuccess(extractListData(response)));
    } catch (error) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Không lấy được danh sách tòa nhà.";

        yield put(fetchRegisterBuildingsFailure(message));
    }
}

function* handleLogin(action) {
    try {
        const response = yield call([api, api.post], "/auth/login", action.payload);

        const { token, user, backendRole, frontendRole } =
            extractLoginData(response);

        if (!token) {
            throw new Error("Đăng nhập chưa hoàn tất. Vui lòng thử lại.");
        }

        localStorage.setItem("access_token", token);
        localStorage.setItem("auth_user", JSON.stringify(user));
        localStorage.setItem("auth_role", backendRole);
        localStorage.setItem("mock_role", frontendRole);

        yield put(
            loginSuccess({
                token,
                user,
                frontendRole,
            })
        );
    } catch (error) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.";

        localStorage.removeItem("access_token");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_role");

        yield put(loginFailure(message));
    }
}

function* handleRegister(action) {
    try {
        const response = yield call([api, api.post], "/auth/register", action.payload);

        const payload = response?.data?.data || response?.data || null;

        yield put(registerSuccess(payload));
    } catch (error) {
        const message =
            error?.response?.data?.message ||
            error?.message ||
            "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";

        yield put(registerFailure(message));
    }
}

function* handleLogout() {
    yield call(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_role");
        localStorage.removeItem("mock_role");
    });
}

export default function* authSaga() {
    yield takeLatest(loginRequest.type, handleLogin);
    yield takeLatest(registerRequest.type, handleRegister);
    yield takeLatest(fetchRegisterBuildingsRequest.type, handleFetchRegisterBuildings);
    yield takeEvery(logout.type, handleLogout);
}
