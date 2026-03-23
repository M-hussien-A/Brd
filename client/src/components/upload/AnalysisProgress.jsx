import { motion } from 'framer-motion';
import { Upload, FileSearch, Brain, CheckCircle2, Loader2 } from 'lucide-react';

const STEPS = [
  { key: 'upload', label: 'Uploading', icon: Upload },
  { key: 'parse', label: 'Parsing Document', icon: FileSearch },
  { key: 'analyze', label: 'AI Analysis', icon: Brain },
  { key: 'complete', label: 'Complete', icon: CheckCircle2 },
];

function getActiveStep(status, progress) {
  if (status === 'uploading') return 0;
  if (status === 'analyzing' && progress < 10) return 1;
  if (status === 'analyzing') return 2;
  if (status === 'complete') return 3;
  return -1;
}

export default function AnalysisProgress({ status, progress }) {
  const activeStep = getActiveStep(status, progress);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === activeStep;
          const isComplete = i < activeStep;
          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isComplete
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-accent-400 text-white'
                      : 'bg-navy-100 dark:bg-navy-600 text-navy-400 dark:text-navy-400'
                  }`}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  {isActive && !isComplete && status !== 'complete' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </motion.div>
                <span className={`text-xs mt-2 font-medium ${
                  isActive || isComplete ? 'text-navy-500 dark:text-white' : 'text-navy-300 dark:text-navy-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-3 h-0.5 rounded bg-navy-100 dark:bg-navy-600 relative overflow-hidden">
                  {isComplete && (
                    <motion.div
                      className="absolute inset-0 bg-green-500"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {status === 'analyzing' && (
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-navy-400 dark:text-gray-400">Analyzing dimensions...</span>
            <span className="font-semibold text-accent-400">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-navy-100 dark:bg-navy-600 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-400 to-accent-300 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
