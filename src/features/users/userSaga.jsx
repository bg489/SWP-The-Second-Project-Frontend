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
        yield put(
            fetchUsersFailure(
                error.response?.data?.message || error.message || "Lỗi gọi API users"
            )
        );
    }
}

export default function* userSaga() {
    yield takeEvery(fetchUsersRequest.type, fetchUsersSaga);
}