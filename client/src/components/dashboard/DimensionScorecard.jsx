import { motion } from 'framer-motion';
import ScoreGauge from '../common/ScoreGauge';

function getBorderColor(score) {
  if (score >= 80) return 'border-l-green-500';
  if (score >= 50) return 'border-l-yellow-500';
  return 'border-l-red-500';
}

export default function DimensionScorecard({ dimensions }) {
  return (
    <motion.section
      id="dimension-scores"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <h2 className="section-title mb-4">Dimension Scores</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {dimensions.map((dim, i) => (
          <motion.a
            key={dim.id}
            href={`#drill-${dim.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className={`card-hover border-l-4 ${getBorderColor(dim.score)} !p-4`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-heading text-sm font-semibold text-navy-500 dark:text-white leading-tight">
                {dim.name}
              </h3>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                dim.score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                dim.score >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {dim.grade}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <ScoreGauge score={dim.score} size={56} strokeWidth={5} />
              <div className="text-right text-xs text-navy-400 dark:text-gray-400">
                <p>{dim.findings.length} findings</p>
                <p className="font-semibold text-navy-500 dark:text-white text-lg">{dim.score}</p>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </motion.section>
  );
}
