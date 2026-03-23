import { motion } from 'framer-motion';
import { AlertTriangle, ArrowUpRight } from 'lucide-react';

const IMPACT_COLORS = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export default function PriorityActions({ actions, dimensions }) {
  if (!actions?.length) return null;

  return (
    <motion.section
      id="priority-actions"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <h2 className="section-title mb-4">Priority Actions</h2>
      <div className="space-y-3">
        {actions.map((action, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className="card !p-4 flex gap-4"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-accent-400 rounded-full flex items-center justify-center text-white font-heading font-bold text-sm">
              {action.rank}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-semibold text-navy-500 dark:text-white">{action.title}</h3>
                <div className="flex gap-2 flex-shrink-0">
                  <span className={`badge ${IMPACT_COLORS[action.impact] || IMPACT_COLORS.medium}`}>
                    {action.impact} impact
                  </span>
                  <span className={`badge ${IMPACT_COLORS[action.effort] || IMPACT_COLORS.medium}`}>
                    {action.effort} effort
                  </span>
                </div>
              </div>
              <p className="text-sm text-navy-400 dark:text-gray-400">{action.description}</p>
              {action.dimensionId && (
                <span className="inline-block mt-2 text-xs text-navy-300 dark:text-navy-500">
                  Related: {dimensions?.find(d => d.id === action.dimensionId)?.name || action.dimensionId}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
