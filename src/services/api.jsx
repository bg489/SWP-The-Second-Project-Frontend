/**
 * @fileoverview Cung cấp lớp truy cập dữ liệu hoặc dữ liệu hỗ trợ cho frontend trong api.
 *
 * Luồng chính: Dữ liệu đầu vào -> xử lý theo trách nhiệm của module -> xuất kết quả cho lớp gọi.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import axios from "axios";

/**
 * Khai báo `api` để đọc cấu hình môi trường và cung cấp giá trị mặc định an toàn.
 * Phạm vi sử dụng: src/services/api.jsx.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

/* Callback nội bộ của lời gọi `use`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
