import { call, put, takeLatest } from "redux-saga/effects";
import api from "../../../services/api";
import {
    createFloorFailure,
    createFloorRequest,
    createFloorSuccess,
    deleteFloorFailure,
    deleteFloorRequest,
    deleteFloorSuccess,
    fetchFloorsFailure,
    fetchFloorsRequest,
    fetchFloorsSuccess,
    updateFloorFailure,
    updateFloorRequest,
    updateFloorSuccess,
} from "./floorSlice";

const extractData = (response) => response?.data?.data || response?.data || null;

const extractListPayload = (response) => {
    const data = extractData(response);

    if (Array.isArray(data)) {
        return {
            floors: data,
            pagination: null,
        };
    }

    return {
        floors: data?.floors || data?.items || data?.rows || [],
        pagination: data?.pagination || null,
    };
};

const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

function* handleFetchFloors(action) {
    try {
        const response = yield call([api, api.get], "/floors", {
            params: action.payload,
        });

        yield put(fetchFloorsSuccess(extractListPayload(response)));
    } catch (error) {
        yield put(
            fetchFloorsFailure(getErrorMessage(error, "Không lấy được danh sách tầng."))
        );
    }
}

function* handleCreateFloor(action) {
    try {
        const response = yield call([api, api.post], "/floors", action.payload);

        yield put(createFloorSuccess(extractData(response)));

        yield put(fetchFloorsRequest());
    } catch (error) {
        yield put(createFloorFailure(getErrorMessage(error, "Tạo tầng thất bại.")));
    }
}

function* handleUpdateFloor(action) {
    try {
        const { id, ...payload } = action.payload;

        const response = yield call([api, api.patch], `/floors/${id}`, payload);

        yield put(updateFloorSuccess(extractData(response)));

        yield put(fetchFloorsRequest());
    } catch (error) {
        yield put(
            updateFloorFailure(getErrorMessage(error, "Cập nhật tầng thất bại."))
        );
    }
}

function* handleDeleteFloor(action) {
    try {
        const { id } = action.payload;

        yield call([api, api.delete], `/floors/${id}`);

        yield put(deleteFloorSuccess(id));

        yield put(fetchFloorsRequest());
    } catch (error) {
        yield put(deleteFloorFailure(getErrorMessage(error, "Xóa tầng thất bại.")));
    }
}

export default function* floorSaga() {
    yield takeLatest(fetchFloorsRequest.type, handleFetchFloors);
    yield takeLatest(createFloorRequest.type, handleCreateFloor);
    yield takeLatest(updateFloorRequest.type, handleUpdateFloor);
    yield takeLatest(deleteFloorRequest.type, handleDeleteFloor);
}