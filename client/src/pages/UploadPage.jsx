import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle } from 'lucide-react';
import DropZone from '../components/upload/DropZone';
import MetadataForm from '../components/upload/MetadataForm';
import AnalysisProgress from '../components/upload/AnalysisProgress';
import { useAnalysis } from '../hooks/useAnalysis';

export default function UploadPage() {
  const navigate = useNavigate();
  const { status, progress, error, uploadResult, uploadAndAnalyze, reset } = useAnalysis();
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({
    projectName: '',
    version: '',
    author: '',
    domain: '',
    department: '',
    maturityGate: '',
  });

  const isProcessing = status === 'uploading' || status === 'analyzing';
  const canSubmit = file && metadata.projectName.trim() && !isProcessing;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await uploadAndAnalyze(file, metadata);
      navigate('/dashboard');
    } catch {
      // Error is handled by context
    }
  };

  const handleReset = () => {
    setFile(null);
    setMetadata({ projectName: '', version: '', author: '', domain: '', department: '', maturityGate: '' });
    reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto px-4 py-8 sm:py-12"
    >
      {/* Hero */}
      <div className="text-center mb-8">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy-500 dark:text-white mb-3">
          BRD Quality Check
        </h2>
        <p className="text-navy-400 dark:text-gray-400 max-w-lg mx-auto">
          Upload your Business Requirements Document and get an AI-powered quality assessment
          against industry standards (BABOK v3, IEEE 29148).
        </p>
      </div>

      <div className="space-y-6">
        {/* File Upload */}
        <div>
          <h3 className="section-title mb-3">Upload Document</h3>
          <DropZone
            file={file}
            onFileSelect={setFile}
            onRemove={() => setFile(null)}
          />
        </div>

        {/* File Preview */}
        {uploadResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="card bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center gap-4 text-sm">
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-navy-400 dark:text-gray-400 block">Words</span>
                  <span className="font-semibold">{uploadResult.wordCount?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-navy-400 dark:text-gray-400 block">Pages</span>
                  <span className="font-semibold">{uploadResult.pageCount || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-navy-400 dark:text-gray-400 block">Headings</span>
                  <span className="font-semibold">{uploadResult.headingCount}</span>
                </div>
                <div>
                  <span className="text-navy-400 dark:text-gray-400 block">Format</span>
                  <span className="font-semibold">{file?.name.split('.').pop().toUpperCase()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Metadata */}
        <div>
          <h3 className="section-title mb-3">Document Information</h3>
          <MetadataForm metadata={metadata} onChange={setMetadata} />
        </div>

        {/* Progress */}
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AnalysisProgress status={status} progress={progress} />
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700 dark:text-red-400">Analysis Failed</p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
                <button onClick={handleReset} className="text-sm font-medium text-red-700 dark:text-red-400 underline mt-2">
                  Try again
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`btn-primary flex items-center gap-2 flex-1 justify-center ${
              !canSubmit ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Sparkles className="w-5 h-5" />
            {isProcessing ? 'Analyzing...' : 'Run Quality Check'}
          </button>
          {(file || status !== 'idle') && (
            <button onClick={handleReset} className="btn-outline">
              Reset
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
