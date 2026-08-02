/**
 * @fileoverview Điều phối các tác vụ bất đồng bộ của buildingSaga, gọi API và phát action kết quả về Redux.
 *
 * Luồng chính: Action yêu cầu -> Saga gọi API -> action thành công/thất bại -> reducer cập nhật giao diện.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
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
    if (Array.isArray(data?.buildings)) return data.buildings;
    if (Array.isArray(data?.items)) return data.items;

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
 * Xử lý nghiệp vụ `handleFetchBuildings` (handle fetch buildings). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchBuildings
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
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

/**
 * Xử lý nghiệp vụ `handleCreateBuilding` (handle create building). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleCreateBuilding
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
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

/**
 * Xử lý nghiệp vụ `handleUpdateBuilding` (handle update building). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleUpdateBuilding
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
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

/**
 * Xử lý nghiệp vụ `handleDeleteBuilding` (handle delete building). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleDeleteBuilding
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
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

/**
 * Tạo nghiệp vụ `buildingSaga` (building saga). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function buildingSaga
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
export default function* buildingSaga() {
    yield takeLatest(fetchBuildingsRequest.type, handleFetchBuildings);
    yield takeLatest(createBuildingRequest.type, handleCreateBuilding);
    yield takeLatest(updateBuildingRequest.type, handleUpdateBuilding);
    yield takeLatest(deleteBuildingRequest.type, handleDeleteBuilding);
}