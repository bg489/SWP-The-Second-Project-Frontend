import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsersRequest } from "./userSlice";

function UserList() {
    const dispatch = useDispatch();
    const { users, loading, error } = useSelector((state) => state.users);

    useEffect(() => {
        dispatch(fetchUsersRequest());
    }, [dispatch]);

    return (
        <div className="card">
            <div className="card-header">
                <h2>Danh sách Users</h2>
                <button onClick={() => dispatch(fetchUsersRequest())}>
                    Tải lại
                </button>
            </div>

            {loading && <p>Đang tải users...</p>}

            {error && <p className="error">Lỗi: {error}</p>}

            {!loading && !error && users.length === 0 && (
                <p>Chưa có user nào trong database.</p>
            )}

            {!loading && !error && users.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Ngày tạo</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.created_at}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default UserList;