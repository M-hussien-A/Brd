import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { upload } from '../middleware/upload.js';
import { parseFile } from '../services/fileParser.js';
import { store } from '../services/store.js';

const router = Router();

router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { text, pageCount, wordCount } = await parseFile(req.file.path, req.file.mimetype);

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from the uploaded file' });
    }

    const uploadId = uuidv4();
    const headingCount = (text.match(/^#{1,3}\s.+|^[A-Z][A-Z\s]{5,}$/gm) || []).length;

    store.saveUpload(uploadId, {
      text,
      fileName: req.file.originalname,
      filePath: req.file.path,
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
    next(err);
  }
});

export default router;
