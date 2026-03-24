import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge';

const PAGE_SIZE = 20;
const SEVERITY_ORDER = { critical: 0, major: 1, minor: 2, info: 3 };

export default function FindingsTable({ findings, dimensions }) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState([]);
  const [dimensionFilter, setDimensionFilter] = useState('');
  const [sortField, setSortField] = useState('severity');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(0);
  const [expandedRow, setExpandedRow] = useState(null);

  const filtered = useMemo(() => {
    let result = [...findings];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(f =>
        f.title?.toLowerCase().includes(q) ||
        f.description?.toLowerCase().includes(q) ||
        f.recommendation?.toLowerCase().includes(q)
      );
    }

    if (severityFilter.length > 0) {
      result = result.filter(f => severityFilter.includes(f.severity));
    }

    if (dimensionFilter) {
      result = result.filter(f => f.dimensionId === dimensionFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'severity') {
        cmp = (SEVERITY_ORDER[a.severity] || 9) - (SEVERITY_ORDER[b.severity] || 9);
      } else if (sortField === 'dimension') {
        cmp = (a.dimensionId || '').localeCompare(b.dimensionId || '');
      } else if (sortField === 'title') {
        cmp = (a.title || '').localeCompare(b.title || '');
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [findings, search, severityFilter, dimensionFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const toggleSeverity = (s) => {
    setSeverityFilter(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
    setPage(0);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  return (
    <motion.section
      id="findings-table"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h2 className="section-title mb-4">All Findings</h2>
      <div className="card !p-0 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-navy-100 dark:border-navy-600 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search findings..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-accent-400 outline-none"
            />
          </div>

          <div className="flex gap-1.5">
            {['critical', 'major', 'minor', 'info'].map(s => (
              <button
                key={s}
                onClick={() => toggleSeverity(s)}
                className={`badge cursor-pointer transition-all ${
                  severityFilter.includes(s)
                    ? 'ring-2 ring-accent-400'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <SeverityBadge severity={s} />
              </button>
            ))}
          </div>

          <select
            value={dimensionFilter}
            onChange={e => { setDimensionFilter(e.target.value); setPage(0); }}
            className="text-sm border border-navy-200 dark:border-navy-600 rounded-lg px-3 py-2 bg-white dark:bg-navy-700 outline-none"
          >
            <option value="">All Dimensions</option>
            {dimensions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          <span className="text-sm text-navy-400 dark:text-gray-400">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy-50 dark:bg-navy-800 text-navy-400 dark:text-gray-400">
                <th className="px-4 py-3 text-left font-medium cursor-pointer" onClick={() => handleSort('severity')}>
                  <span className="flex items-center gap-1">Severity <SortIcon field="severity" /></span>
                </th>
                <th className="px-4 py-3 text-left font-medium cursor-pointer" onClick={() => handleSort('dimension')}>
                  <span className="flex items-center gap-1">Dimension <SortIcon field="dimension" /></span>
                </th>
                <th className="px-4 py-3 text-left font-medium cursor-pointer" onClick={() => handleSort('title')}>
                  <span className="flex items-center gap-1">Finding <SortIcon field="title" /></span>
                </th>
                <th className="px-4 py-3 text-left font-medium">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paged.map((f, i) => (
                  <motion.tr
                    key={f.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-t border-navy-100 dark:border-navy-600 hover:bg-navy-50/50 dark:hover:bg-navy-700/50 cursor-pointer"
                    onClick={() => setExpandedRow(expandedRow === f.id ? null : f.id)}
                  >
                    <td className="px-4 py-3"><SeverityBadge severity={f.severity} /></td>
                    <td className="px-4 py-3 text-navy-400 dark:text-gray-400 text-xs">
                      {dimensions.find(d => d.id === f.dimensionId)?.name || f.dimensionId}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-500 dark:text-white">{f.title}</p>
                      {expandedRow === f.id && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="text-navy-400 dark:text-gray-400 text-xs mt-1"
                        >
                          {f.description}
                          {f.location && <span className="block text-navy-300 mt-1">Location: {f.location}</span>}
                        </motion.p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-navy-400 dark:text-gray-400 text-xs max-w-xs">
                      {f.recommendation}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-navy-100 dark:border-navy-600 flex items-center justify-between">
            <span className="text-sm text-navy-400 dark:text-gray-400">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-600 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page < 3 ? i : page - 2 + i;
                if (p >= totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-accent-400 text-white'
                        : 'hover:bg-navy-100 dark:hover:bg-navy-600'
                    }`}
                  >
                    {p + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-600 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
