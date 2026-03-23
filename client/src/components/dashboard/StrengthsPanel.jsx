import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function StrengthsPanel({ strengths, dimensions }) {
  if (!strengths?.length) return null;

  // Group by dimension
  const grouped = {};
  for (const s of strengths) {
    const key = s.dimensionId || 'general';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  }

  return (
    <motion.section
      id="strengths"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <h2 className="section-title mb-4">Strengths</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(grouped).map(([dimId, items], gi) => {
          const dimName = dimensions?.find(d => d.id === dimId)?.name || dimId;
          return items.map((s, i) => (
            <motion.div
              key={`${dimId}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * (gi * items.length + i) }}
              className="card !p-4 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
            >
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-navy-500 dark:text-white">{s.text}</p>
                  <span className="text-xs text-green-600 dark:text-green-400 mt-1 block">{dimName}</span>
                </div>
              </div>
            </motion.div>
          ));
        })}
      </div>
    </motion.section>
  );
}
