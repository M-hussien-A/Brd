import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, FileSpreadsheet, File, X, CheckCircle2 } from 'lucide-react';

const FILE_ICONS = {
  'application/pdf': FileText,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileText,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileSpreadsheet,
  'text/plain': File,
};

const ACCEPTED = '.pdf,.docx,.xlsx,.xls,.txt,.md';

export default function DropZone({ file, onFileSelect, onRemove }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    handleDrag(e);
    setIsDragging(true);
  };

  const handleDragOut = (e) => {
    handleDrag(e);
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    handleDrag(e);
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) onFileSelect(droppedFile);
  };

  const handleClick = () => inputRef.current?.click();
  const handleChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) onFileSelect(selected);
  };

  const Icon = file ? (FILE_ICONS[file.type] || File) : Upload;

  return (
    <motion.div
      layout
      className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
        isDragging
          ? 'border-accent-400 bg-accent-50 dark:bg-accent-900/20'
          : file
          ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
          : 'border-navy-200 dark:border-navy-600 hover:border-accent-400 hover:bg-navy-50/50 dark:hover:bg-navy-700/50'
      }`}
      onDragEnter={handleDragIn}
      onDragOver={handleDrag}
      onDragLeave={handleDragOut}
      onDrop={handleDrop}
      onClick={!file ? handleClick : undefined}
      whileHover={!file ? { scale: 1.01 } : {}}
      whileTap={!file ? { scale: 0.99 } : {}}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={handleChange}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {file ? (
          <motion.div
            key="file-info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-4"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-navy-500 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {file.name}
              </p>
              <p className="text-sm text-navy-400 dark:text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-navy-400 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="drop-prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-navy-300 dark:text-navy-500" />
            <p className="font-heading text-lg font-semibold text-navy-500 dark:text-white mb-1">
              Drop your BRD document here
            </p>
            <p className="text-sm text-navy-400 dark:text-gray-400 mb-4">
              or click to browse files
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              {['PDF', 'DOCX', 'XLSX', 'TXT'].map((fmt) => (
                <span key={fmt} className="badge bg-navy-100 dark:bg-navy-600 text-navy-500 dark:text-gray-300">
                  {fmt}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
