import { useState, useCallback } from 'react';
import { useAnalysisContext } from '../context/AnalysisContext';

const STORAGE_KEY = 'brd-analysis-history';
const MAX_HISTORY = 5;

function readHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeHistory(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

/** Standalone save function (no hooks needed) — used by useAnalysis */
export function saveToHistory(analysisId, result) {
  const entry = {
    id: analysisId || crypto.randomUUID(),
    analysisId,
    result,
    fileName: result.metadata?.fileName || result.metadata?.projectName || 'Unknown',
    projectName: result.metadata?.projectName || '',
    overallScore: result.overallScore,
    healthGrade: result.healthGrade,
    analyzedAt: result.analyzedAt || new Date().toISOString(),
  };

  const current = readHistory();
  const filtered = current.filter(h => h.id !== entry.id);
  const updated = [entry, ...filtered].slice(0, MAX_HISTORY);
  writeHistory(updated);
  return entry;
}

export function useHistory() {
  const [history, setHistory] = useState(() => readHistory());
  const { dispatch } = useAnalysisContext();

  const refresh = useCallback(() => {
    setHistory(readHistory());
  }, []);

  const addToHistory = useCallback((analysisId, result) => {
    saveToHistory(analysisId, result);
    setHistory(readHistory());
  }, []);

  const loadFromHistory = useCallback((id) => {
    const current = readHistory();
    const entry = current.find(h => h.id === id);
    if (entry) {
      dispatch({ type: 'LOAD_HISTORY_ITEM', payload: { analysisId: entry.id, result: entry.result } });
      return true;
    }
    return false;
  }, [dispatch]);

  const deleteFromHistory = useCallback((id) => {
    const current = readHistory();
    const updated = current.filter(h => h.id !== id);
    writeHistory(updated);
    setHistory(updated);
  }, []);

  const clearHistory = useCallback(() => {
    writeHistory([]);
    setHistory([]);
  }, []);

  return {
    history,
    addToHistory,
    loadFromHistory,
    deleteFromHistory,
    clearHistory,
    refresh,
  };
}
