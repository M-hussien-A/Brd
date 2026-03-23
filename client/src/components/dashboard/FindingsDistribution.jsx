import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';

const SEVERITY_COLORS = {
  critical: '#DC2626',
  major: '#EA580C',
  minor: '#CA8A04',
  info: '#2563EB',
};

export default function FindingsDistribution({ dimensions, findings }) {
  // Bar chart data: findings per dimension by severity
  const barData = dimensions.map(d => {
    const dimFindings = d.findings || [];
    return {
      name: d.name.length > 12 ? d.name.substring(0, 12) + '...' : d.name,
      fullName: d.name,
      critical: dimFindings.filter(f => f.severity === 'critical').length,
      major: dimFindings.filter(f => f.severity === 'major').length,
      minor: dimFindings.filter(f => f.severity === 'minor').length,
      info: dimFindings.filter(f => f.severity === 'info').length,
    };
  });

  // Pie chart data: severity distribution
  const severityCounts = Object.entries(SEVERITY_COLORS).map(([severity, color]) => ({
    name: severity.charAt(0).toUpperCase() + severity.slice(1),
    value: findings.filter(f => f.severity === severity).length,
    color,
  })).filter(s => s.value > 0);

  return (
    <motion.section
      id="findings-distribution"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h2 className="section-title mb-4">Findings Distribution</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stacked Bar */}
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-semibold text-navy-400 dark:text-gray-400 mb-3">Findings by Dimension</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 40, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="critical" stackId="a" fill={SEVERITY_COLORS.critical} name="Critical" />
              <Bar dataKey="major" stackId="a" fill={SEVERITY_COLORS.major} name="Major" />
              <Bar dataKey="minor" stackId="a" fill={SEVERITY_COLORS.minor} name="Minor" />
              <Bar dataKey="info" stackId="a" fill={SEVERITY_COLORS.info} name="Info" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="card">
          <h3 className="text-sm font-semibold text-navy-400 dark:text-gray-400 mb-3">Severity Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={severityCounts}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {severityCounts.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {severityCounts.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name}: {s.value}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
