import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import ScoreGauge from '../common/ScoreGauge';
import SeverityBadge from '../common/SeverityBadge';

const SEVERITY_ORDER = { critical: 0, major: 1, minor: 2, info: 3 };

export default function DimensionDrillDown({ dimensions }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <motion.section
      id="dimension-drill-down"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      <h2 className="section-title mb-4">Dimension Details</h2>
      <div className="space-y-2">
        {dimensions.map((dim) => {
          const isOpen = expanded === dim.id;
          const sortedFindings = [...(dim.findings || [])].sort(
            (a, b) => (SEVERITY_ORDER[a.severity] || 9) - (SEVERITY_ORDER[b.severity] || 9)
          );

          return (
            <div key={dim.id} id={`drill-${dim.id}`} className="card !p-0 overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : dim.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-navy-50/50 dark:hover:bg-navy-600/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <ScoreGauge score={dim.score} size={44} strokeWidth={4} />
                  <div className="text-left">
                    <h3 className="font-heading font-semibold text-navy-500 dark:text-white">{dim.name}</h3>
                    <p className="text-xs text-navy-400 dark:text-gray-400">
                      {dim.findings?.length || 0} findings · {dim.strengths?.length || 0} strengths
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-heading text-lg font-bold ${
                    dim.score >= 80 ? 'text-green-500' : dim.score >= 50 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {dim.score}/100
                  </span>
                  {isOpen ? <ChevronDown className="w-5 h-5 text-navy-400" /> : <ChevronRight className="w-5 h-5 text-navy-400" />}
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-navy-100 dark:border-navy-600"
                  >
                    <div className="p-4 space-y-4">
                      {/* Summary */}
                      {dim.summary && (
                        <div>
                          <h4 className="text-sm font-semibold text-navy-400 dark:text-gray-400 mb-1">Assessment</h4>
                          <p className="text-sm text-navy-500 dark:text-gray-300">{dim.summary}</p>
                        </div>
                      )}

                      {/* Strengths */}
                      {dim.strengths?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">Strengths</h4>
                          <ul className="space-y-1">
                            {dim.strengths.map((s, i) => (
                              <li key={i} className="text-sm text-navy-500 dark:text-gray-300 flex gap-2">
                                <span className="text-green-500">+</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Findings */}
                      {sortedFindings.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-navy-400 dark:text-gray-400 mb-2">Findings</h4>
                          <div className="space-y-2">
                            {sortedFindings.map((f, i) => (
                              <div key={i} className="bg-navy-50 dark:bg-navy-800 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <SeverityBadge severity={f.severity} />
                                  <span className="font-medium text-sm text-navy-500 dark:text-white">{f.title}</span>
                                </div>
                                <p className="text-xs text-navy-400 dark:text-gray-400 ml-7">{f.description}</p>
                                {f.recommendation && (
                                  <p className="text-xs text-accent-400 ml-7 mt-1">
                                    Recommendation: {f.recommendation}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {dim.recommendations?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-accent-400 mb-2">Recommendations</h4>
                          <ul className="space-y-1">
                            {dim.recommendations.map((r, i) => (
                              <li key={i} className="text-sm text-navy-500 dark:text-gray-300 flex gap-2">
                                <span className="text-accent-400">&rarr;</span> {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
