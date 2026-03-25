import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

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

// In-memory store (lives for the duration of the serverless instance)
const uploads = new Map();
const analyses = new Map();

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Upload + Analyze combined (serverless-friendly: single request, single response)
app.post('/api/upload-and-analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Parse metadata from form fields
    const metadata = {
      projectName: req.body.projectName || 'Unknown Project',
      version: req.body.version || '',
      author: req.body.author || '',
      domain: req.body.domain || '',
      department: req.body.department || '',
      maturityGate: req.body.maturityGate || '',
    };

    // Parse file
    const { parseFileFromBuffer } = await import('../server/services/fileParserBuffer.js');
    const { text, pageCount, wordCount } = await parseFileFromBuffer(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from file' });
    }

    const headingCount = (text.match(/^#{1,3}\s.+|^[A-Z][A-Z\s]{5,}$/gm) || []).length;

    const uploadData = {
      text,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      pageCount,
      wordCount,
      headingCount,
      uploadedAt: new Date().toISOString(),
    };

    // Run analysis synchronously (required for serverless)
    const { runAnalysis } = await import('../server/services/analysisEngine.js');
    const result = await runAnalysis(uploadData, metadata);

    const analysisId = uuidv4();
    analyses.set(analysisId, {
      status: 'complete',
      completedAt: new Date().toISOString(),
      metadata,
      result,
      error: null,
    });

    res.json({
      analysisId,
      status: 'complete',
      result,
      uploadInfo: {
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        wordCount,
        pageCount,
        headingCount,
      },
    });
  } catch (err) {
    console.error('Upload and analyze error:', err);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

// Keep the separate endpoints for backward compatibility / local dev
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { parseFileFromBuffer } = await import('../server/services/fileParserBuffer.js');
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

    uploads.set(uploadId, {
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
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { uploadId, projectName, version, author, domain, department, maturityGate } = req.body;
    if (!uploadId) return res.status(400).json({ error: 'uploadId is required' });

    const uploadData = uploads.get(uploadId);
    if (!uploadData) return res.status(404).json({ error: 'Upload not found. In serverless mode, use /api/upload-and-analyze instead.' });

    const analysisId = uuidv4();
    const metadata = { projectName, version, author, domain, department, maturityGate };

    // Run synchronously for serverless
    const { runAnalysis } = await import('../server/services/analysisEngine.js');
    const result = await runAnalysis(uploadData, metadata);

    analyses.set(analysisId, {
      status: 'complete',
      completedAt: new Date().toISOString(),
      metadata,
      result,
      error: null,
    });

    res.json({ analysisId, status: 'complete', result });
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

app.get('/api/analysis/:id', (req, res) => {
  const analysis = analyses.get(req.params.id);
  if (!analysis) return res.status(404).json({ error: 'Analysis not found' });
  res.json(analysis);
});

app.get('/api/analyses', (req, res) => {
  const list = Array.from(analyses.entries()).map(([id, data]) => ({
    id,
    status: data.status,
    projectName: data.result?.metadata?.projectName,
    overallScore: data.result?.overallScore,
  }));
  res.json(list);
});

app.get('/api/analysis/:id/xlsx', async (req, res) => {
  try {
    const analysis = analyses.get(req.params.id);
    if (!analysis || analysis.status !== 'complete') {
      return res.status(404).json({ error: 'Completed analysis not found' });
    }

    const XLSX = await import('xlsx');
    const result = analysis.result;
    const wb = XLSX.utils.book_new();

    const summaryData = [
      ['BRD Quality Assurance Report'], [],
      ['Project', result.metadata.projectName],
      ['Overall Score', result.overallScore],
      ['Grade', result.healthGrade],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');

    const dimHeaders = ['Dimension', 'Score', 'Grade', 'Summary'];
    const dimRows = result.dimensions.map(d => [d.name, d.score, d.grade, d.summary]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([dimHeaders, ...dimRows]), 'Dimensions');

    const findHeaders = ['Severity', 'Dimension', 'Title', 'Description', 'Recommendation'];
    const findRows = result.findings.map(f => [f.severity, f.dimensionId, f.title, f.description, f.recommendation]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([findHeaders, ...findRows]), 'Findings');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="BRD-QA-Report.xlsx"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

export default app;
