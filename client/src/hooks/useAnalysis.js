import { useCallback, useRef } from 'react';
import { useAnalysisContext } from '../context/AnalysisContext';

export function useAnalysis() {
  const { state, dispatch } = useAnalysisContext();
  const pollingRef = useRef(null);

  const uploadAndAnalyze = useCallback(async (file, metadata) => {
    dispatch({ type: 'UPLOAD_START' });

    try {
      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || 'Upload failed');
      }
      const uploadData = await uploadRes.json();
      dispatch({ type: 'UPLOAD_SUCCESS', payload: uploadData });

      // Start analysis
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId: uploadData.uploadId, ...metadata }),
      });
      if (!analyzeRes.ok) {
        const err = await analyzeRes.json();
        throw new Error(err.error || 'Analysis start failed');
      }
      const { analysisId } = await analyzeRes.json();
      dispatch({ type: 'ANALYSIS_START', payload: analysisId });

      // Poll for results
      return new Promise((resolve, reject) => {
        let progress = 5;
        pollingRef.current = setInterval(async () => {
          try {
            progress = Math.min(progress + Math.random() * 8, 95);
            dispatch({ type: 'ANALYSIS_PROGRESS', payload: Math.round(progress) });

            const res = await fetch(`/api/analysis/${analysisId}`);
            const data = await res.json();

            if (data.status === 'complete') {
              clearInterval(pollingRef.current);
              dispatch({ type: 'ANALYSIS_COMPLETE', payload: data.result });
              resolve(data.result);
            } else if (data.status === 'error') {
              clearInterval(pollingRef.current);
              dispatch({ type: 'ANALYSIS_ERROR', payload: data.error });
              reject(new Error(data.error));
            }
          } catch (err) {
            clearInterval(pollingRef.current);
            dispatch({ type: 'ANALYSIS_ERROR', payload: err.message });
            reject(err);
          }
        }, 2000);
      });
    } catch (err) {
      dispatch({ type: 'ANALYSIS_ERROR', payload: err.message });
      throw err;
    }
  }, [dispatch]);

  const reset = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  return {
    ...state,
    uploadAndAnalyze,
    reset,
  };
}
