import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white dark:bg-navy-700 shadow-lg rounded-lg p-3 border border-navy-100 dark:border-navy-600">
      <p className="font-semibold text-navy-500 dark:text-white text-sm">{data.name}</p>
      <p className="text-accent-400 font-bold">{data.score}/100</p>
      <p className="text-xs text-navy-400 dark:text-gray-400">Grade: {data.grade}</p>
    </div>
  );
}

export default function DimensionRadarChart({ dimensions }) {
  const data = dimensions.map(d => ({
    name: d.name.replace(' & ', '\n& ').replace('Feasibility & Realism', 'Feasibility'),
    fullName: d.name,
    score: d.score,
    ideal: 100,
    grade: d.grade,
  }));

  return (
    <motion.section
      id="radar-chart"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="section-title mb-4">Quality Radar</h2>
      <div className="card">
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid stroke="#94a3b8" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
            />
            <Radar
              name="Ideal"
              dataKey="ideal"
              stroke="#cbd5e1"
              fill="transparent"
              strokeDasharray="5 5"
              strokeWidth={1}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#E8792F"
              fill="#1B3A5C"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-6 mt-2">
          <div className="flex items-center gap-2 text-sm text-navy-400 dark:text-gray-400">
            <div className="w-4 h-0.5 bg-navy-500 rounded" /> Actual Score
          </div>
          <div className="flex items-center gap-2 text-sm text-navy-400 dark:text-gray-400">
            <div className="w-4 h-0.5 border-t-2 border-dashed border-gray-400 rounded" /> Ideal (100)
          </div>
        </div>
      </div>
    </motion.section>
  );
}
