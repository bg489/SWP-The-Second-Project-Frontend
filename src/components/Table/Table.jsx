/**
 * @fileoverview Cung cấp component giao diện tái sử dụng Table và hành vi hiển thị liên quan.
 *
 * Luồng chính: Props đầu vào -> xử lý trạng thái cục bộ khi cần -> trả về phần giao diện tái sử dụng.
 * Các chú thích bên dưới mô tả trách nhiệm của từng hàm và khối cấu hình quan trọng.
 */
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import Button from "../Button/Button";
import "./Table.css";

/**
 * Thực hiện nghiệp vụ `Table` (table). Hàm xử lý dữ liệu hoặc tương tác cần thiết để tạo giao diện React tương ứng.
 *
 * @function Table
 * @param {*} options - Giá trị `options` được hàm sử dụng trong quá trình xử lý.
 * @returns {JSX.Element} Cấu trúc giao diện React của component.
 */
const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "Không có dữ liệu hiển thị",
  pagination = null,
  pageSize = 10,
  className = "",
  tableClassName = "",
}) => {
  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const [localPage, setLocalPage] = useState(1);
  const usesExternalPagination = Boolean(pagination);
  const canPaginateLocally = !usesExternalPagination && pageSize > 0;
  const totalPages = canPaginateLocally
    ? Math.max(1, Math.ceil(rows.length / pageSize))
    : Math.max(1, Number(pagination?.totalPages || 1));
  const safeLocalPage = Math.min(localPage, totalPages);
  const currentPage = usesExternalPagination
    ? Number(pagination?.currentPage || pagination?.page || 1)
    : safeLocalPage;

  /* Callback nội bộ của lời gọi `useMemo`; nhận dữ liệu từng bước và trả kết quả cho lời gọi bao ngoài. */
  const visibleRows = useMemo(() => {
    if (!canPaginateLocally) return rows;

    const startIndex = (currentPage - 1) * pageSize;
    return rows.slice(startIndex, startIndex + pageSize);
  }, [canPaginateLocally, currentPage, pageSize, rows]);

  const paginationInfo = usesExternalPagination
    ? {
        currentPage,
        totalPages,
        totalItems: Number(pagination?.totalItems || pagination?.total || rows.length),
        onPageChange: pagination?.onPageChange,
      }
    : {
        currentPage,
        totalPages,
        totalItems: rows.length,
        onPageChange: setLocalPage,
      };

  const showPagination = paginationInfo.totalPages > 1;

  return (
    <div className={`table-container ${className}`}>
      <div className="table-wrapper">
        <table className={`custom-table ${tableClassName}`}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  style={{ width: col.width, minWidth: col.minWidth }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: Math.min(pageSize, 5) }).map((_, rIdx) => (
                <tr key={`skel-${rIdx}`}>
                  {columns.map((col, cIdx) => (
                    <td key={`skel-${rIdx}-${col.key || cIdx}`}>
                      <div className="table-skeleton-cell"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-empty-cell">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visibleRows.map((row, rIdx) => {
                const absoluteIndex = canPaginateLocally
                  ? (currentPage - 1) * pageSize + rIdx
                  : rIdx;

                return (
                  <tr key={row.id || absoluteIndex}>
                    {columns.map((col, cIdx) => (
                      <td
                        key={`${row.id || absoluteIndex}-${col.key || cIdx}`}
                        style={{ minWidth: col.minWidth }}
                      >
                        {col.render ? col.render(row, absoluteIndex) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <div className="table-pagination">
          <span className="pagination-info">
            Trang <strong>{paginationInfo.currentPage}</strong> trên{" "}
            <strong>{paginationInfo.totalPages}</strong> •{" "}
            <strong>{paginationInfo.totalItems}</strong> dòng
          </span>
          <div className="pagination-controls">
            <Button
              variant="outline"
              size="sm"
              disabled={paginationInfo.currentPage === 1 || loading}
              onClick={() => paginationInfo.onPageChange?.(paginationInfo.currentPage - 1)}
              icon={ChevronLeft}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={paginationInfo.currentPage === paginationInfo.totalPages || loading}
              onClick={() => paginationInfo.onPageChange?.(paginationInfo.currentPage + 1)}
              icon={ChevronRight}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
