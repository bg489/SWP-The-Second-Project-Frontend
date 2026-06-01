import { all } from "redux-saga/effects";
import userSaga from "../features/users/userSaga";

export default function* rootSaga() {
    yield all([
        userSaga(),
    ]);
}