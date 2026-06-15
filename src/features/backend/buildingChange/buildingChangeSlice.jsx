import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    buildings: [],
    buildingsLoading: false,
    buildingsError: null,

    myRequests: [],
    myLoading: false,

    adminRequests: [],
    adminLoading: false,

    submitLoading: false,
    actionId: null,

    error: null,
    notice: null,
};

const buildingChangeSlice = createSlice({
    name: "buildingChange",
    initialState,
    reducers: {
        fetchBuildingsRequest: (state) => {
            state.buildingsLoading = true;
            state.buildingsError = null;
        },

        fetchBuildingsSuccess: (state, action) => {
            state.buildingsLoading = false;
            state.buildings = action.payload || [];
        },

        fetchBuildingsFailure: (state, action) => {
            state.buildingsLoading = false;
            state.buildingsError = action.payload;
        },

        fetchMyBuildingChangeRequestsRequest: (state) => {
            state.myLoading = true;
            state.error = null;
        },

        fetchMyBuildingChangeRequestsSuccess: (state, action) => {
            state.myLoading = false;
            state.myRequests = action.payload || [];
        },

        fetchMyBuildingChangeRequestsFailure: (state, action) => {
            state.myLoading = false;
            state.error = action.payload;
        },

        submitBuildingChangeRequest: (state) => {
            state.submitLoading = true;
            state.error = null;
            state.notice = null;
        },

        submitBuildingChangeSuccess: (state, action) => {
            state.submitLoading = false;
            state.notice = "Gửi yêu cầu đổi tòa nhà thành công.";
            state.myRequests = [action.payload, ...state.myRequests];
        },

        submitBuildingChangeFailure: (state, action) => {
            state.submitLoading = false;
            state.error = action.payload;
        },

        fetchAdminBuildingChangeRequestsRequest: (state) => {
            state.adminLoading = true;
            state.error = null;
        },

        fetchAdminBuildingChangeRequestsSuccess: (state, action) => {
            state.adminLoading = false;
            state.adminRequests = action.payload || [];
        },

        fetchAdminBuildingChangeRequestsFailure: (state, action) => {
            state.adminLoading = false;
            state.error = action.payload;
        },

        approveBuildingChangeRequest: (state, action) => {
            state.actionId = action.payload.id;
            state.error = null;
            state.notice = null;
        },

        rejectBuildingChangeRequest: (state, action) => {
            state.actionId = action.payload.id;
            state.error = null;
            state.notice = null;
        },

        buildingChangeActionSuccess: (state, action) => {
            state.actionId = null;
            state.notice = "Cập nhật yêu cầu thành công.";

            const updatedRequest = action.payload;

            state.adminRequests = state.adminRequests
                .map((request) =>
                    Number(request.id) === Number(updatedRequest.id) ? updatedRequest : request
                )
                .filter((request) => request.status === "PENDING");
        },

        buildingChangeActionFailure: (state, action) => {
            state.actionId = null;
            state.error = action.payload;
        },

        clearBuildingChangeNotice: (state) => {
            state.error = null;
            state.notice = null;
        },
    },
});

export const {
    fetchBuildingsRequest,
    fetchBuildingsSuccess,
    fetchBuildingsFailure,
    fetchMyBuildingChangeRequestsRequest,
    fetchMyBuildingChangeRequestsSuccess,
    fetchMyBuildingChangeRequestsFailure,
    submitBuildingChangeRequest,
    submitBuildingChangeSuccess,
    submitBuildingChangeFailure,
    fetchAdminBuildingChangeRequestsRequest,
    fetchAdminBuildingChangeRequestsSuccess,
    fetchAdminBuildingChangeRequestsFailure,
    approveBuildingChangeRequest,
    rejectBuildingChangeRequest,
    buildingChangeActionSuccess,
    buildingChangeActionFailure,
    clearBuildingChangeNotice,
} = buildingChangeSlice.actions;

export default buildingChangeSlice.reducer;