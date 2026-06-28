import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    floors: [],
    slots: [],
    loading: false,
    error: null,
};

const floorSlice = createSlice({
    name: "floors",
    initialState,
    reducers: {
        // Fetch Floors
        fetchFloorsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchFloorsSuccess: (state, action) => {
            state.loading = false;
            state.floors = action.payload;
        },
        fetchFloorsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Create Floor
        createFloorRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        createFloorSuccess: (state, action) => {
            state.loading = false;
            state.floors.push(action.payload);
        },
        createFloorFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Update Floor
        updateFloorRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateFloorSuccess: (state, action) => {
            state.loading = false;
            const index = state.floors.findIndex(f => f.id === action.payload.id);
            if (index !== -1) {
                state.floors[index] = { ...state.floors[index], ...action.payload };
            }
        },
        updateFloorFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Delete Floor
        deleteFloorRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        deleteFloorSuccess: (state, action) => {
            state.loading = false;
            state.floors = state.floors.filter(f => f.id !== action.payload);
        },
        deleteFloorFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Fetch Slots
        fetchSlotsRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.slots = [];
        },
        fetchSlotsSuccess: (state, action) => {
            state.loading = false;
            state.slots = action.payload;
        },
        fetchSlotsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Add Slot
        addSlotRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        addSlotSuccess: (state, action) => {
            state.loading = false;
            state.slots.push(action.payload);
        },
        addSlotFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Local state modifications for testing/mock support
        updateSlotStatusLocal: (state, action) => {
            const { id, status, plate, checkInTime } = action.payload;
            const index = state.slots.findIndex(s => s.id === id);
            if (index !== -1) {
                state.slots[index] = {
                    ...state.slots[index],
                    status,
                    plate,
                    checkInTime,
                };
            }
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
    fetchSlotsRequest,
    fetchSlotsSuccess,
    fetchSlotsFailure,
    addSlotRequest,
    addSlotSuccess,
    addSlotFailure,
    updateSlotStatusLocal,
} = floorSlice.actions;

export default floorSlice.reducer;
