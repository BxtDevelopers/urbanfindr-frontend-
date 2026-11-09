'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter, AlertCircle } from 'lucide-react';

export default function DataTable({
  columns = [],
  data = [],
  searchKey = '',
  searchPlaceholder = 'Search records…',
  filterOptions = [],
  filterKey = '',
  emptyTitle = 'No records found',
  emptySubtitle = 'There are no items to display matching your criteria.',
  pageSize = 10,
  actions = null,
  onRowClick = null
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    let list = Array.isArray(data) ? [...data] : [];

    // Filter by category/status
    if (filterKey && activeFilter !== 'all') {
      list = list.filter((item) => {
        const val = String(item[filterKey] || '').toLowerCase();
        return val === activeFilter.toLowerCase();
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((item) => {
        if (searchKey && item[searchKey]) {
          return String(item[searchKey]).toLowerCase().includes(q);
        }
        return Object.values(item).some((v) => {
          if (typeof v === 'string' || typeof v === 'number') {
            return String(v).toLowerCase().includes(q);
          }
          return false;
        });
      });
    }

    return list;
  }, [data, searchTerm, searchKey, filterKey, activeFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
      {/* Top Controls Bar */}
      <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-800 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {filterOptions && filterOptions.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Filter size={14} className="text-stone-400" />
              <select
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-stone-800 transition-colors"
              >
                <option value="all">All statuses</option>
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {actions}
        </div>
      </div>

      {/* Table view for desktop, Card view for small mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-stone-50/80 border-b border-stone-100 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className={`p-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-12 text-center">
                  <div className="max-w-xs mx-auto space-y-2">
                    <AlertCircle size={28} className="mx-auto text-stone-300" />
                    <h4 className="font-bold text-stone-800 text-sm">{emptyTitle}</h4>
                    <p className="text-xs text-stone-400 leading-relaxed">{emptySubtitle}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row._id || row.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-emerald-50/40' : 'hover:bg-stone-50/60'
                  }`}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`p-3.5 align-middle ${col.className || ''}`}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {filteredData.length > pageSize && (
        <div className="p-3 bg-stone-50/50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, filteredData.length)} of {filteredData.length} entries
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 font-medium text-stone-700">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

