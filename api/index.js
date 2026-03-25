import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { parseFileFromBuffer } from '../server/services/fileParserBuffer.js';
import { store } from '../server/services/store.js';
import { runAnalysis } from '../server/services/analysisEngine.js';

const app = express();

app.use(cors());
app.use(express.json());

// Use memory storage for serverless (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.xlsx', '.xls', '.txt', '.md'];
    const ext = file.originalname.toLowerCase().match(/\.[^.]+$/)?.[0];
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`Unsupported file type. Supported: PDF, DOCX, XLSX, TXT`));
  },
});

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Upload
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { text, pageCount, wordCount } = await parseFileFromBuffer(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from file' });
    }

    const uploadId = uuidv4();
    const headingCount = (text.match(/^#{1,3}\s.+|^[A-Z][A-Z\s]{5,}$/gm) || []).length;

    store.saveUpload(uploadId, {
      text,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      pageCount,
      wordCount,
      headingCount,
      uploadedAt: new Date().toISOString(),
    });

    res.json({
      uploadId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      wordCount,
      pageCount,
      headingCount,
      preview: text.substring(0, 500),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analyze
app.post('/api/analyze', async (req, res) => {
  try {
    const { uploadId, projectName, version, author, domain, department, maturityGate } = req.body;
    if (!uploadId) return res.status(400).json({ error: 'uploadId is required' });

    const uploadData = store.getUpload(uploadId);
    if (!uploadData) return res.status(404).json({ error: 'Upload not found' });

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

    // Run async
    runAnalysis(uploadData, metadata)
      .then(result => {
        store.saveAnalysis(analysisId, {
          status: 'complete',
          completedAt: new Date().toISOString(),
          metadata,
          result,
          error: null,
        });
      })
      .catch(err => {
        store.saveAnalysis(analysisId, {
          status: 'error',
          metadata,
          result: null,
          error: err.message,
        });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Poll analysis
app.get('/api/analysis/:id', (req, res) => {
  const analysis = store.getAnalysis(req.params.id);
  if (!analysis) return res.status(404).json({ error: 'Analysis not found' });
  res.json(analysis);
});

// List analyses
app.get('/api/analyses', (req, res) => {
  res.json(store.listAnalyses());
});

// Excel export
app.get('/api/analysis/:id/xlsx', async (req, res) => {
  try {
    const analysis = store.getAnalysis(req.params.id);
    if (!analysis || analysis.status !== 'complete') {
      return res.status(404).json({ error: 'Completed analysis not found' });
    }

    const XLSX = await import('xlsx');
    const result = analysis.result;
    const wb = XLSX.utils.book_new();

    const summaryData = [
      ['BRD Quality Assurance Report'], [],
      ['Project', result.metadata.projectName],
      ['Version', result.metadata.version || 'N/A'],
      ['Author', result.metadata.author || 'N/A'],
      ['Analyzed', result.analyzedAt],
      ['Overall Score', result.overallScore],
      ['Grade', result.healthGrade],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');

    const dimHeaders = ['Dimension', 'Score', 'Grade', 'Weight', 'Summary'];
    const dimRows = result.dimensions.map(d => [d.name, d.score, d.grade, d.weight, d.summary]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([dimHeaders, ...dimRows]), 'Dimensions');

    const findHeaders = ['ID', 'Severity', 'Dimension', 'Title', 'Description', 'Recommendation'];
    const findRows = result.findings.map(f => [f.id, f.severity, f.dimensionId, f.title, f.description, f.recommendation]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([findHeaders, ...findRows]), 'Findings');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="BRD-QA-Report.xlsx"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
