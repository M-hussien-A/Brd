import { useCallback, useRef } from 'react';
import { useAnalysisContext } from '../context/AnalysisContext';
import { saveToHistory } from './useHistory';

export function useAnalysis() {
  const { state, dispatch } = useAnalysisContext();
  const pollingRef = useRef(null);

  const uploadAndAnalyze = useCallback(async (file, metadata) => {
    dispatch({ type: 'UPLOAD_START' });

    try {
      // Try the combined endpoint first (works on serverless)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectName', metadata.projectName || '');
      formData.append('version', metadata.version || '');
      formData.append('author', metadata.author || '');
      formData.append('domain', metadata.domain || '');
      formData.append('department', metadata.department || '');
      formData.append('maturityGate', metadata.maturityGate || '');

      dispatch({ type: 'ANALYSIS_START', payload: 'pending' });

      // Simulate progress while waiting
      let progress = 5;
      const progressInterval = setInterval(() => {
        progress = Math.min(progress + Math.random() * 3, 92);
        dispatch({ type: 'ANALYSIS_PROGRESS', payload: Math.round(progress) });
      }, 1500);

      const res = await fetch('/api/upload-and-analyze', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        let errorMsg = 'Analysis failed';
        try {
          const errData = await res.json();
          errorMsg = errData.error || errorMsg;
        } catch {
          errorMsg = `Server error (${res.status})`;
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();

      if (data.status === 'complete' && data.result) {
        dispatch({ type: 'ANALYSIS_START', payload: data.analysisId });
        dispatch({ type: 'ANALYSIS_COMPLETE', payload: data.result });
        saveToHistory(data.analysisId, data.result);
        return data.result;
      }

      // Fallback: if server returned analysisId but not complete, poll
      if (data.analysisId) {
        dispatch({ type: 'ANALYSIS_START', payload: data.analysisId });
        return pollForResult(data.analysisId, dispatch, pollingRef);
      }

      throw new Error('Unexpected response from server');
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

function pollForResult(analysisId, dispatch, pollingRef) {
  return new Promise((resolve, reject) => {
    let progress = 10;
    pollingRef.current = setInterval(async () => {
      try {
        progress = Math.min(progress + Math.random() * 8, 95);
        dispatch({ type: 'ANALYSIS_PROGRESS', payload: Math.round(progress) });

        const res = await fetch(`/api/analysis/${analysisId}`);
        const data = await res.json();

        if (data.status === 'complete') {
          clearInterval(pollingRef.current);
          dispatch({ type: 'ANALYSIS_COMPLETE', payload: data.result });
          saveToHistory(analysisId, data.result);
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
}
