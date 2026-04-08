import { motion } from 'framer-motion';
import { Upload, Clock, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHistory } from '../../hooks/useHistory';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts';

const DIMENSION_NAMES = [
  'Completeness', 'Clarity', 'Requirements', 'Consistency', 'Traceability',
  'Feasibility', 'Stakeholders', 'Risks', 'Acceptance', 'Standards',
];

const emptyRadarData = DIMENSION_NAMES.map(name => ({ name, score: 0, ideal: 100 }));

const emptyBarData = DIMENSION_NAMES.map(name => ({
  name: name.length > 10 ? name.substring(0, 10) + '...' : name,
  critical: 0, major: 0, minor: 0, info: 0,
}));

const emptyPieData = [
  { name: 'No Data', value: 1, color: '#E2E8F0' },
];

const emptyDimensions = DIMENSION_NAMES.map((name, i) => ({
  id: `dim-${i}`,
  name,
  score: 0,
  grade: '--',
  findings: [],
  strengths: [],
}));

function EmptyGauge({ size = 160, label }) {
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={14} className="dark:stroke-navy-600" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-3xl font-bold text-navy-200 dark:text-navy-500">--</span>
          <span className="font-heading text-lg font-bold text-navy-200 dark:text-navy-500">--</span>
        </div>
      </div>
      {label && <span className="text-sm font-medium text-navy-300 dark:text-navy-500">{label}</span>}
    </div>
  );
}

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

export default function EmptyDashboard() {
  const navigate = useNavigate();
  const { history, loadFromHistory } = useHistory();

  const handleLoadHistory = (id) => {
    loadFromHistory(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-navy-500 to-navy-400 dark:from-navy-700 dark:to-navy-600 text-white text-center py-8"
      >
        <Upload className="w-10 h-10 mx-auto mb-3 opacity-80" />
        <h2 className="font-heading text-xl font-bold mb-2">No Document Analyzed Yet</h2>
        <p className="text-navy-200 mb-4 max-w-md mx-auto">
          Upload a BRD document to see quality scores, findings, and recommendations across 10 dimensions.
        </p>
        <button onClick={() => navigate('/')} className="bg-accent-400 hover:bg-accent-500 text-white font-semibold py-2.5 px-6 rounded-lg transition-all">
          Upload Document
        </button>
      </motion.div>

      {/* Recent Analyses from History */}
      {history.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-navy-400 dark:text-navy-300" />
            <h2 className="section-title !mb-0">Recent Analyses</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((entry, i) => (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => handleLoadHistory(entry.id)}
                className="card !p-4 text-left hover:shadow-lg hover:border-accent-300 dark:hover:border-accent-500 transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-navy-50 dark:bg-navy-600 flex items-center justify-center">
                    <span className="font-heading text-lg font-bold text-navy-500 dark:text-white">
                      {Math.round(entry.overallScore)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-sm font-semibold text-navy-500 dark:text-white truncate group-hover:text-accent-500 transition-colors">
                      {entry.projectName || entry.fileName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${gradeColors[entry.healthGrade] || 'bg-gray-100 text-gray-600'}`}>
                        {entry.healthGrade}
                      </span>
                      <span className="text-xs text-navy-300 dark:text-navy-500">
                        {new Date(entry.analyzedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>
      )}

      {/* Executive Summary Placeholder */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <h2 className="section-title mb-4">Executive Summary</h2>
        <div className="card">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <EmptyGauge size={180} label="Overall BRD Health" />
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Dimensions', 'Total Findings', 'Critical Issues', 'Strengths'].map((label, i) => (
                  <div key={i} className="bg-navy-50 dark:bg-navy-800 rounded-lg p-3 text-center">
                    <div className="w-5 h-5 mx-auto mb-1 bg-navy-200 dark:bg-navy-600 rounded" />
                    <p className="font-heading text-2xl font-bold text-navy-200 dark:text-navy-500">--</p>
                    <p className="text-xs text-navy-300 dark:text-navy-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Radar + Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="section-title mb-4">Quality Radar</h2>
          <div className="card">
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={emptyRadarData}>
                <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Radar name="Ideal" dataKey="ideal" stroke="#cbd5e1" fill="transparent" strokeDasharray="5 5" strokeWidth={1} />
                <Radar name="Score" dataKey="score" stroke="#E2E8F0" fill="#E2E8F0" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="section-title mb-4">Findings Distribution</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="card">
              <h3 className="text-sm font-semibold text-navy-300 dark:text-navy-500 mb-3">Findings by Dimension</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={emptyBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 5]} />
                  <Bar dataKey="critical" stackId="a" fill="#E2E8F0" />
                  <Bar dataKey="major" stackId="a" fill="#E2E8F0" />
                  <Bar dataKey="minor" stackId="a" fill="#E2E8F0" />
                  <Bar dataKey="info" stackId="a" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card flex items-center justify-center" style={{ minHeight: 150 }}>
              <div className="text-center">
                <div className="w-24 h-24 mx-auto rounded-full border-[16px] border-navy-100 dark:border-navy-600" />
                <p className="text-xs text-navy-300 dark:text-navy-500 mt-3">Severity Breakdown</p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Dimension Scorecard */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <h2 className="section-title mb-4">Dimension Scores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {emptyDimensions.map((dim, i) => (
            <div key={i} className="card !p-4 border-l-4 border-l-navy-200 dark:border-l-navy-600">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-heading text-sm font-semibold text-navy-400 dark:text-navy-400">{dim.name}</h3>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-navy-100 dark:bg-navy-600 text-navy-300 dark:text-navy-400">--</span>
              </div>
              <div className="flex items-center justify-between">
                <EmptyGauge size={48} />
                <div className="text-right text-xs text-navy-300 dark:text-navy-500">
                  <p>0 findings</p>
                  <p className="font-semibold text-navy-300 dark:text-navy-500 text-lg">--</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Findings Table */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <h2 className="section-title mb-4">All Findings</h2>
        <div className="card !p-0 overflow-hidden">
          <div className="p-4 border-b border-navy-100 dark:border-navy-600">
            <div className="h-9 bg-navy-50 dark:bg-navy-700 rounded-lg w-64" />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy-50 dark:bg-navy-800 text-navy-300 dark:text-navy-500">
                <th className="px-4 py-3 text-left font-medium">Severity</th>
                <th className="px-4 py-3 text-left font-medium">Dimension</th>
                <th className="px-4 py-3 text-left font-medium">Finding</th>
                <th className="px-4 py-3 text-left font-medium">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map(i => (
                <tr key={i} className="border-t border-navy-100 dark:border-navy-600">
                  <td className="px-4 py-3"><div className="h-5 w-16 bg-navy-100 dark:bg-navy-600 rounded-full" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-20 bg-navy-100 dark:bg-navy-600 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-48 bg-navy-100 dark:bg-navy-600 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-40 bg-navy-100 dark:bg-navy-600 rounded" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Priority Actions + Strengths */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <h2 className="section-title mb-4">Priority Actions</h2>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card !p-4 flex gap-4">
                <div className="w-8 h-8 bg-navy-200 dark:bg-navy-600 rounded-full flex items-center justify-center text-navy-300 dark:text-navy-500 font-bold text-sm">{i}</div>
                <div className="flex-1">
                  <div className="h-4 w-48 bg-navy-100 dark:bg-navy-600 rounded mb-2" />
                  <div className="h-3 w-full bg-navy-50 dark:bg-navy-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <h2 className="section-title mb-4">Strengths</h2>
          <div className="grid grid-cols-1 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card !p-4 bg-green-50/50 dark:bg-green-900/5 border-green-200/50 dark:border-green-800/30">
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-green-200 dark:bg-green-800/30 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-64 bg-green-100 dark:bg-green-900/10 rounded mb-1" />
                    <div className="h-3 w-20 bg-green-100 dark:bg-green-900/10 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Dimension Details */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <h2 className="section-title mb-4">Dimension Details</h2>
        <div className="space-y-2">
          {DIMENSION_NAMES.slice(0, 3).map((name, i) => (
            <div key={i} className="card !p-0 overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <EmptyGauge size={44} />
                  <div>
                    <h3 className="font-heading font-semibold text-navy-400 dark:text-navy-400">{name}</h3>
                    <p className="text-xs text-navy-300 dark:text-navy-500">0 findings · 0 strengths</p>
                  </div>
                </div>
                <span className="font-heading text-lg font-bold text-navy-200 dark:text-navy-500">--/100</span>
              </div>
            </div>
          ))}
          <div className="text-center text-sm text-navy-300 dark:text-navy-500 py-2">
            + {DIMENSION_NAMES.length - 3} more dimensions
          </div>
        </div>
      </motion.section>
    </div>
  );
}
