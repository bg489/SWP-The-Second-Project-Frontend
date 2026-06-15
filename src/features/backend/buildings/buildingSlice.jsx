import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    buildings: [],
    loading: false,
    error: null,

    creating: false,
    updatingId: null,
    deletingId: null,

    mutationError: null,
    mutationSuccess: null,
};

const buildingSlice = createSlice({
    name: "buildings",
    initialState,
    reducers: {
        fetchBuildingsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        fetchBuildingsSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.buildings = action.payload || [];
        },

        fetchBuildingsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        createBuildingRequest: (state) => {
            state.creating = true;
            state.mutationError = null;
            state.mutationSuccess = null;
        },

        createBuildingSuccess: (state, action) => {
            state.creating = false;
            state.mutationSuccess = "Tạo tòa nhà thành công.";

            const createdBuilding = action.payload;
            if (createdBuilding?.id) {
                state.buildings = [createdBuilding, ...state.buildings];
            }
        },

        createBuildingFailure: (state, action) => {
            state.creating = false;
            state.mutationError = action.payload;
        },

        updateBuildingRequest: (state, action) => {
            state.updatingId = action.payload.id;
            state.mutationError = null;
            state.mutationSuccess = null;
        },

        updateBuildingSuccess: (state, action) => {
            state.updatingId = null;
            state.mutationSuccess = "Cập nhật tòa nhà thành công.";

            const updatedBuilding = action.payload;

            state.buildings = state.buildings.map((building) =>
                Number(building.id) === Number(updatedBuilding.id)
                    ? updatedBuilding
                    : building
            );
        },

        updateBuildingFailure: (state, action) => {
            state.updatingId = null;
            state.mutationError = action.payload;
        },

        deleteBuildingRequest: (state, action) => {
            state.deletingId = action.payload.id;
            state.mutationError = null;
            state.mutationSuccess = null;
        },

        deleteBuildingSuccess: (state, action) => {
            state.deletingId = null;
            state.mutationSuccess = "Xóa tòa nhà thành công.";

            state.buildings = state.buildings.filter(
                (building) => Number(building.id) !== Number(action.payload)
            );
        },

        deleteBuildingFailure: (state, action) => {
            state.deletingId = null;
            state.mutationError = action.payload;
        },

        clearBuildingNotice: (state) => {
            state.error = null;
            state.mutationError = null;
            state.mutationSuccess = null;
        },
    },
});

export const {
    fetchBuildingsRequest,
    fetchBuildingsSuccess,
    fetchBuildingsFailure,
    createBuildingRequest,
    createBuildingSuccess,
    createBuildingFailure,
    updateBuildingRequest,
    updateBuildingSuccess,
    updateBuildingFailure,
    deleteBuildingRequest,
    deleteBuildingSuccess,
    deleteBuildingFailure,
    clearBuildingNotice,
} = buildingSlice.actions;

export default buildingSlice.reducer;