import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import api from "../../../services/api";
import { fetchFloorsRequest } from "../floors/floorSlice";
import {
    createSlotFailure,
    createSlotRequest,
    createSlotSuccess,
    deleteSlotFailure,
    deleteSlotRequest,
    deleteSlotSuccess,
    fetchSlotsByFloorFailure,
    fetchSlotsByFloorRequest,
    fetchSlotsByFloorSuccess,
    updateSlotFailure,
    updateSlotRequest,
    updateSlotSuccess,
} from "./slotSlice";

const extractData = (response) => response?.data?.data || response?.data || null;

const extractList = (response) => {
    const data = extractData(response);

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.slots)) return data.slots;

    return [];
};

const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

function* handleFetchSlotsByFloor(action) {
    const { floorId, silent = false } = action.payload || {};

    try {
        const response = yield call([api, api.get], `/floors/${floorId}/slots`);

        yield put(
            fetchSlotsByFloorSuccess({
                floorId,
                silent,
                slots: extractList(response),
            })
        );
    } catch (error) {
        yield put(
            fetchSlotsByFloorFailure({
                error: getErrorMessage(error, "Không lấy được danh sách ô đỗ."),
                silent,
            })
        );
    }
}

function* handleCreateSlot(action) {
    try {
        const { floorId, ...payload } = action.payload;

        const response = yield call(
            [api, api.post],
            `/floors/${floorId}/slots`,
            payload
        );

        yield put(
            createSlotSuccess({
                floorId,
                slot: extractData(response),
            })
        );

        yield put(fetchSlotsByFloorRequest({ floorId }));

        // Cập nhật lại slotCount trong bảng floors
        yield put(fetchFloorsRequest());
    } catch (error) {
        yield put(
            createSlotFailure(getErrorMessage(error, "Thêm ô đỗ thất bại."))
        );
    }
}

function* handleUpdateSlot(action) {
    try {
        const { id, floorId, ...payload } = action.payload;

        const response = yield call([api, api.patch], `/slots/${id}`, payload);

        yield put(
            updateSlotSuccess({
                floorId,
                slot: extractData(response),
            })
        );

        yield put(fetchSlotsByFloorRequest({ floorId }));
    } catch (error) {
        yield put(
            updateSlotFailure(getErrorMessage(error, "Cập nhật ô đỗ thất bại."))
        );
    }
}

function* handleDeleteSlot(action) {
    try {
        const { id, floorId } = action.payload;

        yield call([api, api.delete], `/slots/${id}`);

        yield put(
            deleteSlotSuccess({
                id,
                floorId,
            })
        );

        yield put(fetchSlotsByFloorRequest({ floorId }));

        // Cập nhật lại slotCount trong bảng floors
        yield put(fetchFloorsRequest());
    } catch (error) {
        yield put(deleteSlotFailure(getErrorMessage(error, "Xóa ô đỗ thất bại.")));
    }
}

export default function* slotSaga() {
    yield takeEvery(fetchSlotsByFloorRequest.type, handleFetchSlotsByFloor);
    yield takeLatest(createSlotRequest.type, handleCreateSlot);
    yield takeLatest(updateSlotRequest.type, handleUpdateSlot);
    yield takeLatest(deleteSlotRequest.type, handleDeleteSlot);
}
