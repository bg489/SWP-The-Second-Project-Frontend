import { call, put, takeEvery } from "redux-saga/effects";
import api from "../../services/api";
import { mockManagerFloors, mockCarSlots } from "../../services/mockParkingData";
import {
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
    addSlotFailure
} from "./floorSlice";

// Mappers to translate between backend schema (snake_case/English) and frontend schema (Vietnamese UI)
const normalizeFloor = (f) => ({
    id: f.id,
    name: f.name,
    type: f.floor_type === "MOTORBIKE" ? "Xe máy" : (f.floor_type === "CAR" ? "Ô tô" : f.type),
    capacity: f.capacity || 0,
    slotsCount: f.slot_count || f.slotsCount || 0,
    currentCount: f.current_count || 0,
    status: f.status === "ACTIVE" ? "Đang hoạt động" :
            f.status === "MAINTENANCE" ? "Bảo trì" :
            f.status === "LOCKED" ? "Tạm đóng" :
            f.status === "INACTIVE" ? "Không hoạt động" : f.status || "Đang hoạt động",
    note: f.note || ""
});

const denormalizeFloor = (f) => ({
    id: f.id,
    name: f.name,
    floor_type: f.type === "Xe máy" ? "MOTORBIKE" : "CAR",
    capacity: f.type === "Xe máy" ? parseInt(f.capacity || 0) : 0,
    slot_count: f.type === "Ô tô" ? parseInt(f.slotsCount || 0) : 0,
    status: f.status === "Đang hoạt động" ? "ACTIVE" :
            f.status === "Bảo trì" ? "MAINTENANCE" :
            f.status === "Tạm đóng" ? "LOCKED" :
            f.status === "Không hoạt động" ? "INACTIVE" : "ACTIVE",
    note: f.note || ""
});

const normalizeSlot = (s) => ({
    id: s.slot_number || s.id,
    dbId: s.id,
    status: s.status === "VACANT" || s.status === "ACTIVE" || s.status === "FREE" || s.status === "trống" ? "trống" :
            s.status === "OCCUPIED" || s.status === "đang dùng" ? "đang dùng" :
            s.status === "RESERVED" || s.status === "đặt trước" ? "đặt trước" :
            s.status === "MAINTENANCE" || s.status === "bảo trì" ? "bảo trì" :
            s.status === "CONFLICT" || s.status === "xung đột" ? "xung đột" : "trống",
    plate: s.plate || null,
    checkInTime: s.check_in_time || s.checkInTime || null,
    warning: s.warning || null
});

// Sagas
function* fetchFloorsSaga() {
    try {
        const response = yield call(api.get, "/api/floors");
        const backendFloors = response.data.data || response.data;
        const normalized = backendFloors.map(normalizeFloor);
        yield put(fetchFloorsSuccess(normalized));
    } catch (error) {
        console.warn("API GET /api/floors failed. Falling back to mock data.", error.message);
        yield put(fetchFloorsSuccess(mockManagerFloors.map(normalizeFloor)));
    }
}

function* createFloorSaga(action) {
    try {
        const payload = denormalizeFloor(action.payload);
        const response = yield call(api.post, "/api/floors", payload);
        const createdFloor = response.data.data || response.data;
        yield put(createFloorSuccess(normalizeFloor(createdFloor)));
    } catch (error) {
        console.warn("API POST /api/floors failed. Falling back to mock creation.", error.message);
        const tempId = `FL-B${Math.floor(Math.random() * 1000) + 10}`;
        yield put(createFloorSuccess({
            ...action.payload,
            id: tempId,
            currentCount: 0
        }));
    }
}

function* updateFloorSaga(action) {
    try {
        const payload = denormalizeFloor(action.payload);
        const response = yield call(api.patch, `/api/floors/${action.payload.id}`, payload);
        const updatedFloor = response.data.data || response.data;
        yield put(updateFloorSuccess(normalizeFloor(updatedFloor)));
    } catch (error) {
        console.warn(`API PATCH /api/floors/${action.payload.id} failed. Falling back to mock update.`, error.message);
        yield put(updateFloorSuccess(action.payload));
    }
}

function* deleteFloorSaga(action) {
    const floorId = action.payload;
    try {
        yield call(api.delete, `/api/floors/${floorId}`);
        yield put(deleteFloorSuccess(floorId));
    } catch (error) {
        console.warn(`API DELETE /api/floors/${floorId} failed. Processing business rule validations locally.`, error.message);
        
        // Simulating the business rule validation: Do not allow deletion of a floor if it has slots in use
        // In the mock data, "FL-B3" has mock slots with status "đang dùng" (OCCUPIED)
        const inUseMock = mockCarSlots.some(s => s.status === "đang dùng");
        if (floorId === "FL-B3" && inUseMock) {
            const errorMsg = "Không thể xóa tầng hầm này vì đang có các ô đỗ (slots) đang được sử dụng hoặc có xe gửi!";
            yield put(deleteFloorFailure(errorMsg));
        } else {
            yield put(deleteFloorSuccess(floorId));
        }
    }
}

function* fetchSlotsSaga(action) {
    const floorId = action.payload;
    try {
        const response = yield call(api.get, `/api/floors/${floorId}/slots`);
        const backendSlots = response.data.data || response.data;
        const normalized = backendSlots.map(normalizeSlot);
        yield put(fetchSlotsSuccess(normalized));
    } catch (error) {
        console.warn(`API GET /api/floors/${floorId}/slots failed. Falling back to mock slots.`, error.message);
        // Fallback to mockCarSlots
        yield put(fetchSlotsSuccess(mockCarSlots.map(normalizeSlot)));
    }
}

function* addSlotSaga(action) {
    const { floorId, slotData } = action.payload;
    try {
        const response = yield call(api.post, `/api/floors/${floorId}/slots`, slotData);
        const createdSlot = response.data.data || response.data;
        yield put(addSlotSuccess(normalizeSlot(createdSlot)));
    } catch (error) {
        console.warn(`API POST /api/floors/${floorId}/slots failed. Falling back to mock creation.`, error.message);
        // Generate a new slot ID locally
        const mockNewSlot = {
            id: `C-${Math.floor(Math.random() * 90) + 31}`,
            status: "trống",
            plate: null,
            checkInTime: null
        };
        yield put(addSlotSuccess(mockNewSlot));
    }
}

export default function* floorSaga() {
    yield takeEvery(fetchFloorsRequest.type, fetchFloorsSaga);
    yield takeEvery(createFloorRequest.type, createFloorSaga);
    yield takeEvery(updateFloorRequest.type, updateFloorSaga);
    yield takeEvery(deleteFloorRequest.type, deleteFloorSaga);
    yield takeEvery(fetchSlotsRequest.type, fetchSlotsSaga);
    yield takeEvery(addSlotRequest.type, addSlotSaga);
}
