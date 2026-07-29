import { createSlice } from "@reduxjs/toolkit";
import { reconcileCollectionById } from "../../../utils/reconcileCollection";

const initialState = {
    slotsByFloor: {},
    activeFloorId: null,

    loading: false,
    error: null,

    creating: false,
    updatingId: null,
    deletingId: null,

    mutationError: null,
    mutationSuccess: null,
};

const slotSlice = createSlice({
    name: "slots",
    initialState,
    reducers: {
        fetchSlotsByFloorRequest: (state, action) => {
            if (!action.payload?.silent) {
                state.loading = true;
                state.error = null;
                state.activeFloorId = action.payload.floorId;
            }
        },

        fetchSlotsByFloorSuccess: (state, action) => {
            const { floorId, silent, slots } = action.payload;

            if (!silent) {
                state.loading = false;
                state.error = null;
            }
            state.slotsByFloor[floorId] = reconcileCollectionById(
                state.slotsByFloor[floorId] || [],
                slots || []
            );
        },

        fetchSlotsByFloorFailure: (state, action) => {
            const payload =
                typeof action.payload === "object"
                    ? action.payload
                    : { error: action.payload, silent: false };

            if (!payload.silent) {
                state.loading = false;
                state.error = payload.error;
            }
        },

        createSlotRequest: (state) => {
            state.creating = true;
            state.mutationError = null;
            state.mutationSuccess = null;
        },

        createSlotSuccess: (state, action) => {
            state.creating = false;
            state.mutationSuccess = "Thêm ô đỗ thành công.";

            const { floorId, slot } = action.payload;
            const oldSlots = state.slotsByFloor[floorId] || [];

            if (slot?.id) {
                state.slotsByFloor[floorId] = [slot, ...oldSlots];
            }
        },

        createSlotFailure: (state, action) => {
            state.creating = false;
            state.mutationError = action.payload;
        },

        updateSlotRequest: (state, action) => {
            state.updatingId = action.payload.id;
            state.mutationError = null;
            state.mutationSuccess = null;
        },

        updateSlotSuccess: (state, action) => {
            state.updatingId = null;
            state.mutationSuccess = "Cập nhật ô đỗ thành công.";

            const { floorId, slot } = action.payload;
            const oldSlots = state.slotsByFloor[floorId] || [];

            state.slotsByFloor[floorId] = oldSlots.map((item) =>
                Number(item.id) === Number(slot.id) ? slot : item
            );
        },

        updateSlotFailure: (state, action) => {
            state.updatingId = null;
            state.mutationError = action.payload;
        },

        deleteSlotRequest: (state, action) => {
            state.deletingId = action.payload.id;
            state.mutationError = null;
            state.mutationSuccess = null;
        },

        deleteSlotSuccess: (state, action) => {
            state.deletingId = null;
            state.mutationSuccess = "Xóa ô đỗ thành công.";

            const { floorId, id } = action.payload;
            const oldSlots = state.slotsByFloor[floorId] || [];

            state.slotsByFloor[floorId] = oldSlots.filter(
                (slot) => Number(slot.id) !== Number(id)
            );
        },

        deleteSlotFailure: (state, action) => {
            state.deletingId = null;
            state.mutationError = action.payload;
        },

        clearSlotNotice: (state) => {
            state.error = null;
            state.mutationError = null;
            state.mutationSuccess = null;
        },
    },
});

export const {
    fetchSlotsByFloorRequest,
    fetchSlotsByFloorSuccess,
    fetchSlotsByFloorFailure,
    createSlotRequest,
    createSlotSuccess,
    createSlotFailure,
    updateSlotRequest,
    updateSlotSuccess,
    updateSlotFailure,
    deleteSlotRequest,
    deleteSlotSuccess,
    deleteSlotFailure,
    clearSlotNotice,
} = slotSlice.actions;

export default slotSlice.reducer;
