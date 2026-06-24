import { all } from "redux-saga/effects";


import authSaga from "../features/backend/auth/authSaga";
import adminUserSaga from "../features/backend/adminUsers/adminUserSaga";
import buildingChangeSaga from "../features/backend/buildingChange/buildingChangeSaga";
import buildingSaga from "../features/backend/buildings/buildingSaga";
import floorSaga from "../features/backend/floors/floorSaga";
import slotSaga from "../features/backend/slots/slotSaga";
import parkingSaga from "../features/backend/parking/parkingSaga";

export default function* rootSaga() {
    yield all([
        authSaga(),
        adminUserSaga(),
        buildingChangeSaga(),
        buildingSaga(),
        floorSaga(),
        slotSaga(),
        parkingSaga(),
    ]);
}
