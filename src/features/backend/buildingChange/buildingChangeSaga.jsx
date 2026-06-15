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

const extractData = (response) => response?.data?.data || response?.data || null;

const extractList = (response) => {
    const data = extractData(response);

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.buildings)) return data.buildings;

    return [];
};

const getErrorMessage = (error, fallback) => {
    return error?.response?.data?.message || error?.message || fallback;
};

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

function* handleApproveRequest(action) {
    try {
        const { id, adminNote } = action.payload;

        const response = yield call(
            [api, api.patch],
            `/building-change-requests/${id}/approve`,
            { adminNote }
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

function* handleRejectRequest(action) {
    try {
        const { id, adminNote } = action.payload;

        const response = yield call(
            [api, api.patch],
            `/building-change-requests/${id}/reject`,
            { adminNote }
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