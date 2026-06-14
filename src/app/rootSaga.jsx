import { all } from "redux-saga/effects";
import userSaga from "../features/users/userSaga";
import floorSaga from "../features/floors/floorSaga";

export default function* rootSaga() {
    yield all([
        userSaga(),
        floorSaga(),
    ]);
}