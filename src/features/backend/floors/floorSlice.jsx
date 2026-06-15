import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    floors: [],
    pagination: null,

    loading: false,
    error: null,

    creating: false,
    updatingId: null,
    deletingId: null,

    mutationError: null,
    mutationSuccess: null,
};

const floorSlice = createSlice({
    name: "floors",
    initialState,
    reducers: {
        fetchFloorsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },

        fetchFloorsSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.floors = action.payload.floors || [];
            state.pagination = action.payload.pagination || null;
        },

        fetchFloorsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        createFloorRequest: (state) => {
            state.creating = true;
            state.mutationError = null;
            state.mutationSuccess = null;
        },

        createFloorSuccess: (state, action) => {
            state.creating = false;
            state.mutationSuccess = "Tạo tầng thành công.";

            const createdFloor = action.payload;
            if (createdFloor?.id) {
                state.floors = [createdFloor, ...state.floors];
            }
        },

        createFloorFailure: (state, action) => {
            state.creating = false;
            state.mutationError = action.payload;
        },

        updateFloorRequest: (state, action) => {
            state.updatingId = action.payload.id;
            state.mutationError = null;
            state.mutationSuccess = null;
        },

        updateFloorSuccess: (state, action) => {
            state.updatingId = null;
            state.mutationSuccess = "Cập nhật tầng thành công.";

            const updatedFloor = action.payload;

            state.floors = state.floors.map((floor) =>
                Number(floor.id) === Number(updatedFloor.id) ? updatedFloor : floor
            );
        },

        updateFloorFailure: (state, action) => {
            state.updatingId = null;
            state.mutationError = action.payload;
        },

        deleteFloorRequest: (state, action) => {
            state.deletingId = action.payload.id;
            state.mutationError = null;
            state.mutationSuccess = null;
        },

        deleteFloorSuccess: (state, action) => {
            state.deletingId = null;
            state.mutationSuccess = "Xóa tầng thành công.";

            state.floors = state.floors.filter(
                (floor) => Number(floor.id) !== Number(action.payload)
            );
        },

        deleteFloorFailure: (state, action) => {
            state.deletingId = null;
            state.mutationError = action.payload;
        },

        clearFloorNotice: (state) => {
            state.error = null;
            state.mutationError = null;
            state.mutationSuccess = null;
        },
    },
});

export const {
    fetchFloorsRequest,
    fetchFloorsSuccess,
    fetchFloorsFailure,
    createFloorRequest,
    createFloorSuccess,
    createFloorFailure,
    updateFloorRequest,
    updateFloorSuccess,
    updateFloorFailure,
    deleteFloorRequest,
    deleteFloorSuccess,
    deleteFloorFailure,
    clearFloorNotice,
} = floorSlice.actions;

export default floorSlice.reducer;