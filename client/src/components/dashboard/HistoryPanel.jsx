import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Clock, Award } from 'lucide-react';
import { useHistory } from '../../hooks/useHistory';
import { useNavigate } from 'react-router-dom';

const gradeColors = {
  'A+': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'A': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'B+': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'B': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'C+': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'C': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'D': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'F': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function HistoryPanel({ onClose, activeId }) {
  const { history, loadFromHistory, deleteFromHistory, clearHistory } = useHistory();
  const navigate = useNavigate();

  const handleLoad = (id) => {
    loadFromHistory(id);
    navigate('/dashboard');
    onClose();
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteFromHistory(id);
  };

  const handleClear = () => {
    clearHistory();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-navy-800 rounded-xl shadow-xl border border-navy-100 dark:border-navy-600 overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-navy-100 dark:border-navy-600">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-navy-400 dark:text-navy-300" />
          <h3 className="font-heading font-semibold text-sm text-navy-500 dark:text-white">
            Analysis History
          </h3>
          <span className="text-xs bg-navy-100 dark:bg-navy-600 text-navy-400 dark:text-navy-300 px-1.5 py-0.5 rounded-full">
            {history.length}/5
          </span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-navy-100 dark:hover:bg-navy-600 transition-colors">
          <X className="w-4 h-4 text-navy-400 dark:text-navy-300" />
        </button>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {history.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-navy-200 dark:text-navy-500" />
            <p className="text-sm text-navy-300 dark:text-navy-500">No analyses yet</p>
            <p className="text-xs text-navy-300 dark:text-navy-500 mt-1">Upload a BRD to get started</p>
          </div>
        ) : (
          <AnimatePresence>
            {history.map((entry, i) => (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleLoad(entry.id)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-navy-50 dark:hover:bg-navy-700 transition-colors border-b border-navy-50 dark:border-navy-700 last:border-b-0 group ${
                  activeId === entry.id ? 'bg-navy-50 dark:bg-navy-700/50' : ''
                }`}
              >
                {/* Score circle */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-navy-50 dark:bg-navy-600 flex items-center justify-center">
                  <span className="font-heading text-sm font-bold text-navy-500 dark:text-white">
                    {Math.round(entry.overallScore)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-500 dark:text-white truncate">
                    {entry.projectName || entry.fileName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${gradeColors[entry.healthGrade] || 'bg-gray-100 text-gray-600'}`}>
                      {entry.healthGrade}
                    </span>
                    <span className="text-xs text-navy-300 dark:text-navy-500">
                      {new Date(entry.analyzedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => handleDelete(e, entry.id)}
                  className="flex-shrink-0 p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                  title="Remove from history"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      {history.length > 0 && (
        <div className="px-4 py-2.5 border-t border-navy-100 dark:border-navy-600">
          <button
            onClick={handleClear}
            className="w-full text-xs text-navy-300 dark:text-navy-500 hover:text-red-500 dark:hover:text-red-400 transition-colors py-1"
          >
            Clear All History
          </button>
        </div>
      )}
    </motion.div>
  );
}
