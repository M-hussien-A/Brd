import { Router } from 'express';
import { store } from '../services/store.js';

const router = Router();

router.get('/analysis/:id/xlsx', async (req, res, next) => {
  try {
    const analysis = store.getAnalysis(req.params.id);
    if (!analysis || analysis.status !== 'complete') {
      return res.status(404).json({ error: 'Completed analysis not found' });
    }

    const XLSX = await import('xlsx');
    const result = analysis.result;
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['BRD Quality Assurance Report'],
      [],
      ['Project', result.metadata.projectName],
      ['Version', result.metadata.version || 'N/A'],
      ['Author', result.metadata.author || 'N/A'],
      ['Domain', result.metadata.domain || 'N/A'],
      ['Analyzed', result.analyzedAt],
      ['Overall Score', result.overallScore],
      ['Grade', result.healthGrade],
      ['Word Count', result.metadata.wordCount],
      ['Page Count', result.metadata.pageCount || 'N/A'],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');

    // Dimensions sheet
    const dimHeaders = ['Dimension', 'Score', 'Grade', 'Weight', 'Summary'];
    const dimRows = result.dimensions.map(d => [d.name, d.score, d.grade, d.weight, d.summary]);
    const dimSheet = XLSX.utils.aoa_to_sheet([dimHeaders, ...dimRows]);
    XLSX.utils.book_append_sheet(wb, dimSheet, 'Dimensions');

    // Findings sheet
    const findHeaders = ['ID', 'Severity', 'Dimension', 'Title', 'Description', 'Location', 'Recommendation'];
    const findRows = result.findings.map(f => [
      f.id, f.severity, f.dimensionId, f.title, f.description, f.location || '', f.recommendation,
    ]);
    const findSheet = XLSX.utils.aoa_to_sheet([findHeaders, ...findRows]);
    XLSX.utils.book_append_sheet(wb, findSheet, 'Findings');

    // Priority Actions sheet
    const actHeaders = ['Rank', 'Title', 'Description', 'Dimension', 'Impact', 'Effort'];
    const actRows = result.priorityActions.map(a => [
      a.rank, a.title, a.description, a.dimensionId, a.impact, a.effort,
    ]);
    const actSheet = XLSX.utils.aoa_to_sheet([actHeaders, ...actRows]);
    XLSX.utils.book_append_sheet(wb, actSheet, 'Priority Actions');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="BRD-QA-Report-${result.metadata.projectName || 'report'}.xlsx"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    next(err);
  }
});

export default router;
