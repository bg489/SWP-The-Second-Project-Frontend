/**
 * @fileoverview Điều phối các tác vụ bất đồng bộ của slotSaga, gọi API và phát action kết quả về Redux.
 *
 * Luồng chính: Action yêu cầu -> Saga gọi API -> action thành công/thất bại -> reducer cập nhật giao diện.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
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

/**
 * Thực hiện nghiệp vụ `extractData` (extract data). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function extractData
 * @param {*} response - Giá trị `response` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const extractData = (response) => response?.data?.data || response?.data || null;

/**
 * Thực hiện nghiệp vụ `extractList` (extract list). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function extractList
 * @param {*} response - Giá trị `response` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const extractList = (response) => {
    const data = extractData(response);

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.slots)) return data.slots;

    return [];
};

/**
 * Lấy nghiệp vụ `getErrorMessage` (get error message). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function getErrorMessage
 * @param {*} error - Giá trị `error` được hàm sử dụng trong quá trình xử lý.
 * @param {*} fallback - Giá trị `fallback` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

/**
 * Xử lý nghiệp vụ `handleFetchSlotsByFloor` (handle fetch slots by floor). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchSlotsByFloor
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
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

/**
 * Xử lý nghiệp vụ `handleCreateSlot` (handle create slot). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleCreateSlot
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
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

/**
 * Xử lý nghiệp vụ `handleUpdateSlot` (handle update slot). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleUpdateSlot
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
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

/**
 * Xử lý nghiệp vụ `handleDeleteSlot` (handle delete slot). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleDeleteSlot
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
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

/**
 * Thực hiện nghiệp vụ `slotSaga` (slot saga). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function slotSaga
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
export default function* slotSaga() {
    yield takeEvery(fetchSlotsByFloorRequest.type, handleFetchSlotsByFloor);
    yield takeLatest(createSlotRequest.type, handleCreateSlot);
    yield takeLatest(updateSlotRequest.type, handleUpdateSlot);
    yield takeLatest(deleteSlotRequest.type, handleDeleteSlot);
}
