import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../services/store.js';
import { runAnalysis } from '../services/analysisEngine.js';

const router = Router();

router.post('/analyze', async (req, res, next) => {
  try {
    const { uploadId, projectName, version, author, domain, department, maturityGate } = req.body;

    if (!uploadId) {
      return res.status(400).json({ error: 'uploadId is required' });
    }

    const uploadData = store.getUpload(uploadId);
    if (!uploadData) {
      return res.status(404).json({ error: 'Upload not found. Please upload the file again.' });
    }

    const analysisId = uuidv4();
    const metadata = { projectName, version, author, domain, department, maturityGate };

    store.saveAnalysis(analysisId, {
      status: 'processing',
      startedAt: new Date().toISOString(),
      metadata,
      result: null,
      error: null,
    });

    res.json({ analysisId, status: 'processing' });

    // Run analysis asynchronously
    runAnalysis(uploadData, metadata)
      .then(result => {
        store.saveAnalysis(analysisId, {
          status: 'complete',
          startedAt: store.getAnalysis(analysisId)?.startedAt,
          completedAt: new Date().toISOString(),
          metadata,
          result,
          error: null,
        });
      })
      .catch(err => {
        console.error('Analysis failed:', err);
        store.saveAnalysis(analysisId, {
          status: 'error',
          startedAt: store.getAnalysis(analysisId)?.startedAt,
          metadata,
          result: null,
          error: err.message,
        });
      });
  } catch (err) {
    next(err);
  }
});

router.get('/analysis/:id', (req, res) => {
  const analysis = store.getAnalysis(req.params.id);
  if (!analysis) {
    return res.status(404).json({ error: 'Analysis not found' });
  }
  res.json(analysis);
});

router.get('/analyses', (req, res) => {
  res.json(store.listAnalyses());
});

export default router;
