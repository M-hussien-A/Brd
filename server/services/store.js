import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

class InMemoryStore {
  constructor() {
    this.uploads = new Map();
    this.analyses = new Map();
  }

  saveUpload(id, data) {
    this.uploads.set(id, data);
  }

  getUpload(id) {
    return this.uploads.get(id);
  }

  saveAnalysis(id, data) {
    this.analyses.set(id, data);
    this._persist();
  }

  getAnalysis(id) {
    return this.analyses.get(id);
  }

  listAnalyses() {
    return Array.from(this.analyses.entries()).map(([id, data]) => ({
      id,
      fileName: data.result?.fileName,
      projectName: data.result?.metadata?.projectName,
      overallScore: data.result?.overallScore,
      healthGrade: data.result?.healthGrade,
      analyzedAt: data.result?.analyzedAt,
      status: data.status,
    }));
  }

  _persist() {
    try {
      const data = {};
      for (const [id, analysis] of this.analyses) {
        if (analysis.status === 'complete') {
          data[id] = analysis;
        }
      }
      fs.writeFileSync(
        path.join(dataDir, 'analyses.json'),
        JSON.stringify(data, null, 2)
      );
    } catch {
      // Silent fail on persistence
    }
  }

  _loadPersisted() {
    try {
      const filePath = path.join(dataDir, 'analyses.json');
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        for (const [id, analysis] of Object.entries(data)) {
          this.analyses.set(id, analysis);
        }
      }
    } catch {
      // Silent fail
    }
  }
}

export const store = new InMemoryStore();
store._loadPersisted();
