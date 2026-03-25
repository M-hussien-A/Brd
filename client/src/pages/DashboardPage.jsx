import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAnalysis } from '../hooks/useAnalysis';
import ExecutiveSummary from '../components/dashboard/ExecutiveSummary';
import DimensionScorecard from '../components/dashboard/DimensionScorecard';
import DimensionRadarChart from '../components/dashboard/DimensionRadarChart';
import FindingsDistribution from '../components/dashboard/FindingsDistribution';
import FindingsTable from '../components/dashboard/FindingsTable';
import PriorityActions from '../components/dashboard/PriorityActions';
import StrengthsPanel from '../components/dashboard/StrengthsPanel';
import DimensionDrillDown from '../components/dashboard/DimensionDrillDown';
import ExportBar from '../components/dashboard/ExportBar';
import Sidebar from '../components/layout/Sidebar';
import EmptyDashboard from '../components/dashboard/EmptyDashboard';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { analysisResult, analysisId, status, reset } = useAnalysis();

  if (!analysisResult) {
    return <EmptyDashboard />;
  }

  const result = analysisResult;

  const handleRerun = () => {
    reset();
    navigate('/');
  };

  return (
    <div className="flex">
      <Sidebar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-24"
      >
        <ExecutiveSummary result={result} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <DimensionRadarChart dimensions={result.dimensions} />
          <FindingsDistribution dimensions={result.dimensions} findings={result.findings} />
        </div>

        <DimensionScorecard dimensions={result.dimensions} />

        <FindingsTable findings={result.findings} dimensions={result.dimensions} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <PriorityActions actions={result.priorityActions} dimensions={result.dimensions} />
          <StrengthsPanel strengths={result.strengths} dimensions={result.dimensions} />
        </div>

        <DimensionDrillDown dimensions={result.dimensions} />

        <ExportBar result={result} analysisId={analysisId} onRerun={handleRerun} />
      </motion.div>
    </div>
  );
}
