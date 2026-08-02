/**
 * @fileoverview Khai báo state, action và reducer Redux cho miền dữ liệu slotSlice.
 *
 * Luồng chính: Action được dispatch -> reducer tương ứng cập nhật state bất biến do Redux Toolkit quản lý.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { createSlice } from "@reduxjs/toolkit";
import { reconcileCollectionById } from "../../../utils/reconcileCollection";

/**
 * Khai báo `initialState` để mô tả trạng thái khởi tạo trước khi người dùng hoặc API tạo ra thay đổi.
 * Phạm vi sử dụng: src/features/backend/slots/slotSlice.jsx.
 */
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

/**
 * Khai báo `slotSlice` để giữ dữ liệu hoặc cấu hình mà các hàm trong module cùng sử dụng.
 * Phạm vi sử dụng: src/features/backend/slots/slotSlice.jsx.
 */
const slotSlice = createSlice({
    name: "slots",
    initialState,
    reducers: {
        /**
         * Lấy nghiệp vụ `fetchSlotsByFloorRequest` (fetch slots by floor request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchSlotsByFloorRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        fetchSlotsByFloorRequest: (state, action) => {
            if (!action.payload?.silent) {
                state.loading = true;
                state.error = null;
                state.activeFloorId = action.payload.floorId;
            }
        },

        /**
         * Lấy nghiệp vụ `fetchSlotsByFloorSuccess` (fetch slots by floor success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchSlotsByFloorSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
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

        /**
         * Lấy nghiệp vụ `fetchSlotsByFloorFailure` (fetch slots by floor failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function fetchSlotsByFloorFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
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

        /**
         * Tạo nghiệp vụ `createSlotRequest` (create slot request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createSlotRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createSlotRequest: (state) => {
            state.creating = true;
            state.mutationError = null;
            state.mutationSuccess = null;
        },

        /**
         * Tạo nghiệp vụ `createSlotSuccess` (create slot success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createSlotSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createSlotSuccess: (state, action) => {
            state.creating = false;
            state.mutationSuccess = "Thêm ô đỗ thành công.";

            const { floorId, slot } = action.payload;
            const oldSlots = state.slotsByFloor[floorId] || [];

            if (slot?.id) {
                state.slotsByFloor[floorId] = [slot, ...oldSlots];
            }
        },

        /**
         * Tạo nghiệp vụ `createSlotFailure` (create slot failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function createSlotFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        createSlotFailure: (state, action) => {
            state.creating = false;
            state.mutationError = action.payload;
        },

        /**
         * Cập nhật nghiệp vụ `updateSlotRequest` (update slot request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateSlotRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateSlotRequest: (state, action) => {
            state.updatingId = action.payload.id;
            state.mutationError = null;
            state.mutationSuccess = null;
        },

        /**
         * Cập nhật nghiệp vụ `updateSlotSuccess` (update slot success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateSlotSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateSlotSuccess: (state, action) => {
            state.updatingId = null;
            state.mutationSuccess = "Cập nhật ô đỗ thành công.";

            const { floorId, slot } = action.payload;
            const oldSlots = state.slotsByFloor[floorId] || [];

            /* Callback nội bộ của lời gọi `map`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
            state.slotsByFloor[floorId] = oldSlots.map((item) =>
                Number(item.id) === Number(slot.id) ? slot : item
            );
        },

        /**
         * Cập nhật nghiệp vụ `updateSlotFailure` (update slot failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function updateSlotFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        updateSlotFailure: (state, action) => {
            state.updatingId = null;
            state.mutationError = action.payload;
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `deleteSlotRequest` (delete slot request). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function deleteSlotRequest
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        deleteSlotRequest: (state, action) => {
            state.deletingId = action.payload.id;
            state.mutationError = null;
            state.mutationSuccess = null;
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `deleteSlotSuccess` (delete slot success). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function deleteSlotSuccess
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        deleteSlotSuccess: (state, action) => {
            state.deletingId = null;
            state.mutationSuccess = "Xóa ô đỗ thành công.";

            const { floorId, id } = action.payload;
            const oldSlots = state.slotsByFloor[floorId] || [];

            state.slotsByFloor[floorId] = oldSlots.filter(
                /* Callback nội bộ của lời gọi `filter`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
                (slot) => Number(slot.id) !== Number(id)
            );
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `deleteSlotFailure` (delete slot failure). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function deleteSlotFailure
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @param {*} action - Redux action chứa loại thao tác và payload đi kèm.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
        deleteSlotFailure: (state, action) => {
            state.deletingId = null;
            state.mutationError = action.payload;
        },

        /**
         * Xóa hoặc đặt lại nghiệp vụ `clearSlotNotice` (clear slot notice). Hàm cập nhật phần state Redux thuộc phạm vi của slice này.
         *
         * @function clearSlotNotice
         * @param {*} state - State hiện tại cần đọc hoặc cập nhật.
         * @returns {void} Hàm hoàn tất bằng tác động lên state, response hoặc luồng xử lý hiện tại.
         */
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
