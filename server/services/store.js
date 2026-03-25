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
}

export const store = new InMemoryStore();
