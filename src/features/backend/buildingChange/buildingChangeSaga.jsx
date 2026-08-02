/**
 * @fileoverview Điều phối các tác vụ bất đồng bộ của buildingChangeSaga, gọi API và phát action kết quả về Redux.
 *
 * Luồng chính: Action yêu cầu -> Saga gọi API -> action thành công/thất bại -> reducer cập nhật giao diện.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { call, put, takeLatest } from "redux-saga/effects";
import api from "../../../services/api";
import {
    approveBuildingChangeRequest,
    buildingChangeActionFailure,
    buildingChangeActionSuccess,
    fetchAdminBuildingChangeRequestsFailure,
    fetchAdminBuildingChangeRequestsRequest,
    fetchAdminBuildingChangeRequestsSuccess,
    fetchBuildingsFailure,
    fetchBuildingsRequest,
    fetchBuildingsSuccess,
    fetchMyBuildingChangeRequestsFailure,
    fetchMyBuildingChangeRequestsRequest,
    fetchMyBuildingChangeRequestsSuccess,
    rejectBuildingChangeRequest,
    submitBuildingChangeFailure,
    submitBuildingChangeRequest,
    submitBuildingChangeSuccess,
} from "./buildingChangeSlice";

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
    if (Array.isArray(data?.buildings)) return data.buildings;

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
const getErrorMessage = (error, fallback) => {
    return error?.response?.data?.message || error?.message || fallback;
};

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
 * Xử lý nghiệp vụ `handleFetchMyRequests` (handle fetch my requests). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchMyRequests
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchMyRequests() {
    try {
        const response = yield call([api, api.get], "/building-change-requests/my");
        yield put(fetchMyBuildingChangeRequestsSuccess(extractList(response)));
    } catch (error) {
        yield put(
            fetchMyBuildingChangeRequestsFailure(
                getErrorMessage(error, "Không lấy được yêu cầu đổi tòa nhà.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleSubmitRequest` (handle submit request). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleSubmitRequest
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleSubmitRequest(action) {
    try {
        const response = yield call(
            [api, api.post],
            "/building-change-requests",
            action.payload
        );

        yield put(submitBuildingChangeSuccess(extractData(response)));
    } catch (error) {
        yield put(
            submitBuildingChangeFailure(
                getErrorMessage(error, "Gửi yêu cầu đổi tòa nhà thất bại.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleFetchAdminRequests` (handle fetch admin requests). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleFetchAdminRequests
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleFetchAdminRequests(action) {
    try {
        const response = yield call([api, api.get], "/building-change-requests", {
            params: action.payload,
        });

        yield put(fetchAdminBuildingChangeRequestsSuccess(extractList(response)));
    } catch (error) {
        yield put(
            fetchAdminBuildingChangeRequestsFailure(
                getErrorMessage(error, "Không lấy được danh sách yêu cầu.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleApproveRequest` (handle approve request). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleApproveRequest
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleApproveRequest(action) {
    try {
        const { id, adminNote } = action.payload;

        const response = yield call(
            [api, api.patch],
            `/building-change-requests/${id}/approve`,
            { adminNote },
            { timeout: 15000 }
        );

        yield put(buildingChangeActionSuccess(extractData(response)));

        yield put(
            fetchAdminBuildingChangeRequestsRequest({
                status: "PENDING",
            })
        );
    } catch (error) {
        yield put(
            buildingChangeActionFailure(
                getErrorMessage(error, "Duyệt yêu cầu thất bại.")
            )
        );
    }
}

/**
 * Xử lý nghiệp vụ `handleRejectRequest` (handle reject request). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Có gọi API backend và xử lý dữ liệu phản hồi. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function handleRejectRequest
 * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
function* handleRejectRequest(action) {
    try {
        const { id, adminNote } = action.payload;

        const response = yield call(
            [api, api.patch],
            `/building-change-requests/${id}/reject`,
            { adminNote },
            { timeout: 15000 }
        );

        yield put(buildingChangeActionSuccess(extractData(response)));

        yield put(
            fetchAdminBuildingChangeRequestsRequest({
                status: "PENDING",
            })
        );
    } catch (error) {
        yield put(
            buildingChangeActionFailure(
                getErrorMessage(error, "Từ chối yêu cầu thất bại.")
            )
        );
    }
}

/**
 * Tạo nghiệp vụ `buildingChangeSaga` (building change saga). Hàm điều phối action Redux, tác vụ API và trạng thái thành công hoặc thất bại. Được thực thi như generator để Redux Saga có thể kiểm soát thứ tự tác vụ.
 *
 * @function buildingChangeSaga
 * @yields {*} Tác vụ trung gian để trình điều phối thực thi theo đúng thứ tự.
 */
export default function* buildingChangeSaga() {
    yield takeLatest(fetchBuildingsRequest.type, handleFetchBuildings);
    yield takeLatest(
        fetchMyBuildingChangeRequestsRequest.type,
        handleFetchMyRequests
    );
    yield takeLatest(submitBuildingChangeRequest.type, handleSubmitRequest);
    yield takeLatest(
        fetchAdminBuildingChangeRequestsRequest.type,
        handleFetchAdminRequests
    );
    yield takeLatest(approveBuildingChangeRequest.type, handleApproveRequest);
    yield takeLatest(rejectBuildingChangeRequest.type, handleRejectRequest);
}
