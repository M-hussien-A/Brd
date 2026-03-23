import { createContext, useContext, useReducer } from 'react';

const AnalysisContext = createContext(null);

const initialState = {
  uploadResult: null,
  analysisId: null,
  analysisResult: null,
  status: 'idle', // idle | uploading | analyzing | complete | error
  error: null,
  progress: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'UPLOAD_START':
      return { ...state, status: 'uploading', error: null, uploadResult: null, analysisResult: null };
    case 'UPLOAD_SUCCESS':
      return { ...state, uploadResult: action.payload, status: 'uploading' };
    case 'ANALYSIS_START':
      return { ...state, analysisId: action.payload, status: 'analyzing', progress: 0 };
    case 'ANALYSIS_PROGRESS':
      return { ...state, progress: action.payload };
    case 'ANALYSIS_COMPLETE':
      return { ...state, analysisResult: action.payload, status: 'complete', progress: 100 };
    case 'ANALYSIS_ERROR':
      return { ...state, error: action.payload, status: 'error' };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function AnalysisProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AnalysisContext.Provider value={{ state, dispatch }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysisContext() {
  const context = useContext(AnalysisContext);
  if (!context) throw new Error('useAnalysisContext must be used within AnalysisProvider');
  return context;
}
