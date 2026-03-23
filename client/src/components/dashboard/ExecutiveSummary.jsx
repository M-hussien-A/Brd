import { motion } from 'framer-motion';
import { FileText, AlertTriangle, CheckCircle2, BookOpen, Calendar, User, Building2, Layers } from 'lucide-react';
import ScoreGauge from '../common/ScoreGauge';

export default function ExecutiveSummary({ result }) {
  const { overallScore, healthGrade, gradeColor, dimensions, findings, strengths, metadata } = result;

  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const majorCount = findings.filter(f => f.severity === 'major').length;

  const stats = [
    { label: 'Dimensions', value: dimensions.length, icon: Layers, color: 'text-blue-500' },
    { label: 'Total Findings', value: findings.length, icon: AlertTriangle, color: 'text-orange-500' },
    { label: 'Critical Issues', value: criticalCount, icon: AlertTriangle, color: 'text-red-500' },
    { label: 'Strengths', value: strengths.length, icon: CheckCircle2, color: 'text-green-500' },
  ];

  return (
    <motion.section
      id="executive-summary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="section-title mb-4">Executive Summary</h2>
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Score Gauge */}
          <div className="flex-shrink-0">
            <ScoreGauge
              score={overallScore}
              size={180}
              strokeWidth={14}
              label="Overall BRD Health"
              grade={healthGrade}
              gradeColor={gradeColor}
            />
          </div>

          {/* Metadata + Stats */}
          <div className="flex-1 w-full">
            {/* Document Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {metadata.projectName && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-navy-300" />
                  <span className="text-navy-400 dark:text-gray-400">Project:</span>
                  <span className="font-semibold">{metadata.projectName}</span>
                </div>
              )}
              {metadata.version && (
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-navy-300" />
                  <span className="text-navy-400 dark:text-gray-400">Version:</span>
                  <span className="font-semibold">{metadata.version}</span>
                </div>
              )}
              {metadata.author && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-navy-300" />
                  <span className="text-navy-400 dark:text-gray-400">Author:</span>
                  <span className="font-semibold">{metadata.author}</span>
                </div>
              )}
              {metadata.domain && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-navy-300" />
                  <span className="text-navy-400 dark:text-gray-400">Domain:</span>
                  <span className="font-semibold">{metadata.domain}</span>
                </div>
              )}
              {metadata.wordCount && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-navy-300" />
                  <span className="text-navy-400 dark:text-gray-400">Words:</span>
                  <span className="font-semibold">{metadata.wordCount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-navy-300" />
                <span className="text-navy-400 dark:text-gray-400">Analyzed:</span>
                <span className="font-semibold">{new Date(result.analyzedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="bg-navy-50 dark:bg-navy-800 rounded-lg p-3 text-center"
                >
                  <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                  <p className="font-heading text-2xl font-bold text-navy-500 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-navy-400 dark:text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
