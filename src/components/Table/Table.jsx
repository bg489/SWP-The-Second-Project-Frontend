import "./Table.css";
import { useMemo, useState } from "react";
import Button from "../Button/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "Không có dữ liệu hiển thị",
  pagination = null,
  pageSize = 10,
}) => {
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
    <div className="table-container">
      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={col.key || idx} style={{ width: col.width }}>
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
                      <td key={`${row.id || absoluteIndex}-${col.key || cIdx}`}>
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
