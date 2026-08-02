/**
 * @fileoverview Điều phối các tác vụ bất đồng bộ của floorSaga, gọi API và phát action kết quả về Redux.
 *
 * Luồng chính: Action yêu cầu -> Saga gọi API -> action thành công/thất bại -> reducer cập nhật giao diện.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
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

/**
 * Thực hiện nghiệp vụ `extractData` (extract data). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function extractData
 * @param {*} response - Giá trị `response` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
const extractData = (response) => response?.data?.data || response?.data || null;

/**
 * Thực hiện nghiệp vụ `extractListPayload` (extract list payload). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại.
 *
 * @function extractListPayload
 * @param {*} response - Giá trị `response` được hàm sử dụng trong quá trình xử lý.
 * @returns {*} Kết quả đã được xử lý để lớp gọi tiếp tục sử dụng.
 */
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
 * Xử lý nghiệp vụ `handleFetchFloors` (handle fetch floors). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchFloors
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchFloors(action) {
    const { silent = false, ...params } = action.payload || {};

    try {
        const response = yield call([api, api.get], "/floors", {
            params,
        });

        yield put(fetchFloorsSuccess({
            ...extractListPayload(response),
            silent,
        }));
    } catch (error) {
        yield put(
            fetchFloorsFailure({
                error: getErrorMessage(error, "Không lấy được danh sách tầng."),
                silent,
            })
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleCreateFloor` (handle create floor). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleCreateFloor
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleCreateFloor(action) {
    try {
        const response = yield call([api, api.post], "/floors", action.payload);

        yield put(createFloorSuccess(extractData(response)));

        yield put(fetchFloorsRequest());
    } catch (error) {
        yield put(createFloorFailure(getErrorMessage(error, "Tạo tầng thất bại.")));
    }
}

/**
 * Xử lý nghiệp vụ `handleUpdateFloor` (handle update floor). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleUpdateFloor
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
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

/**
 * Xử lý nghiệp vụ `handleDeleteFloor` (handle delete floor). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleDeleteFloor
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
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

/**
 * Thực hiện nghiệp vụ `floorSaga` (floor saga). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function floorSaga
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
export default function* floorSaga() {
    yield takeLatest(fetchFloorsRequest.type, handleFetchFloors);
    yield takeLatest(createFloorRequest.type, handleCreateFloor);
    yield takeLatest(updateFloorRequest.type, handleUpdateFloor);
    yield takeLatest(deleteFloorRequest.type, handleDeleteFloor);
}
