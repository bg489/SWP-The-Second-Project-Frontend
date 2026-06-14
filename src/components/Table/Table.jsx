import React from "react";
import "./Table.css";
import Button from "../Button/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = "Không có dữ liệu hiển thị",
  pagination = null // { currentPage, totalPages, onPageChange }
}) => {
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
              // Skeleton loading
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`skel-${rIdx}`}>
                  {columns.map((col, cIdx) => (
                    <td key={`skel-${rIdx}-${cIdx}`}>
                      <div className="table-skeleton-cell"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-empty-cell">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr key={row.id || rIdx}>
                  {columns.map((col, cIdx) => (
                    <td key={`${row.id || rIdx}-${col.key || cIdx}`}>
                      {col.render ? col.render(row, rIdx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="table-pagination">
          <span className="pagination-info">
            Trang <strong>{pagination.currentPage}</strong> trên <strong>{pagination.totalPages}</strong>
          </span>
          <div className="pagination-controls">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1 || loading}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              icon={ChevronLeft}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === pagination.totalPages || loading}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
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
