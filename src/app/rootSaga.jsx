import { all } from "redux-saga/effects";


import authSaga from "../features/backend/auth/authSaga";
import adminUserSaga from "../features/backend/adminUsers/adminUserSaga";

export default function* rootSaga() {
    yield all([authSaga(), adminUserSaga()]);
}