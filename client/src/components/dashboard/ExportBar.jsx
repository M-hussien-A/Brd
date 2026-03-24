import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, Copy, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { generatePdf } from '../../utils/exportPdf';

export default function ExportBar({ result, analysisId, onRerun }) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handlePdf = () => {
    generatePdf(result);
  };

  const handleXlsx = async () => {
    try {
      const id = analysisId || result.id;
      const res = await fetch(`/api/analysis/${id}/xlsx`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BRD-QA-Report-${result.metadata?.projectName || 'report'}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Excel export failed:', err);
    }
  };

  const handleCopy = async () => {
    const summary = [
      `BRD Quality Report: ${result.metadata?.projectName || 'Unknown'}`,
      `Overall Score: ${result.overallScore}/100 (${result.healthGrade})`,
      `Total Findings: ${result.findings?.length || 0}`,
      '',
      'Dimension Scores:',
      ...(result.dimensions?.map(d => `  ${d.name}: ${d.score}/100 (${d.grade})`) || []),
      '',
      'Top Priority Actions:',
      ...(result.priorityActions?.slice(0, 5).map((a, i) => `  ${i + 1}. ${a.title}`) || []),
    ].join('\n');

    await navigator.clipboard.writeText(summary);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky bottom-0 z-40 bg-white/90 dark:bg-navy-800/90 backdrop-blur-sm border-t border-navy-100 dark:border-navy-600 py-3 px-4 mt-8"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap gap-3 justify-center">
        <button onClick={handlePdf} className="btn-primary flex items-center gap-2 !py-2.5 !px-5">
          <Download className="w-4 h-4" /> Export PDF
        </button>
        <button onClick={handleXlsx} className="btn-secondary flex items-center gap-2 !py-2.5 !px-5">
          <FileSpreadsheet className="w-4 h-4" /> Export Excel
        </button>
        <button onClick={handleCopy} className="btn-outline flex items-center gap-2 !py-2.5 !px-5">
          <Copy className="w-4 h-4" /> {copySuccess ? 'Copied!' : 'Copy Summary'}
        </button>
        {onRerun && (
          <button onClick={onRerun} className="btn-outline flex items-center gap-2 !py-2.5 !px-5">
            <RotateCcw className="w-4 h-4" /> Re-run Analysis
          </button>
        )}
      </div>
    </motion.div>
  );
}
