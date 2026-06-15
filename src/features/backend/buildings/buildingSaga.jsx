import { call, put, takeLatest } from "redux-saga/effects";
import api from "../../../services/api";
import {
    createBuildingFailure,
    createBuildingRequest,
    createBuildingSuccess,
    deleteBuildingFailure,
    deleteBuildingRequest,
    deleteBuildingSuccess,
    fetchBuildingsFailure,
    fetchBuildingsRequest,
    fetchBuildingsSuccess,
    updateBuildingFailure,
    updateBuildingRequest,
    updateBuildingSuccess,
} from "./buildingSlice";

const extractData = (response) => response?.data?.data || response?.data || null;

const extractList = (response) => {
    const data = extractData(response);

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.buildings)) return data.buildings;
    if (Array.isArray(data?.items)) return data.items;

    return [];
};

const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

function* handleFetchBuildings() {
    try {
        const response = yield call([api, api.get], "/buildings");
        yield put(fetchBuildingsSuccess(extractList(response)));
    } catch (error) {
        yield put(
            fetchBuildingsFailure(
                getErrorMessage(error, "Không lấy được danh sách tòa nhà.")
            )
        );
    }
}

function* handleCreateBuilding(action) {
    try {
        const response = yield call([api, api.post], "/buildings", action.payload);
        yield put(createBuildingSuccess(extractData(response)));
        yield put(fetchBuildingsRequest());
    } catch (error) {
        yield put(
            createBuildingFailure(getErrorMessage(error, "Tạo tòa nhà thất bại."))
        );
    }
}

function* handleUpdateBuilding(action) {
    try {
        const { id, ...payload } = action.payload;

        const response = yield call([api, api.patch], `/buildings/${id}`, payload);

        yield put(updateBuildingSuccess(extractData(response)));
        yield put(fetchBuildingsRequest());
    } catch (error) {
        yield put(
            updateBuildingFailure(getErrorMessage(error, "Cập nhật tòa nhà thất bại."))
        );
    }
}

function* handleDeleteBuilding(action) {
    try {
        const { id } = action.payload;

        yield call([api, api.delete], `/buildings/${id}`);

        yield put(deleteBuildingSuccess(id));
        yield put(fetchBuildingsRequest());
    } catch (error) {
        yield put(
            deleteBuildingFailure(getErrorMessage(error, "Xóa tòa nhà thất bại."))
        );
    }
}

export default function* buildingSaga() {
    yield takeLatest(fetchBuildingsRequest.type, handleFetchBuildings);
    yield takeLatest(createBuildingRequest.type, handleCreateBuilding);
    yield takeLatest(updateBuildingRequest.type, handleUpdateBuilding);
    yield takeLatest(deleteBuildingRequest.type, handleDeleteBuilding);
}