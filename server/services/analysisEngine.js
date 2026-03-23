import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import { DIMENSIONS } from '../config/dimensions.js';

const client = new Anthropic();

export function chunkDocument(text, maxChars = 12000, overlap = 500) {
  if (text.length <= maxChars) return [text];

  const paragraphs = text.split(/\n\s*\n/);
  const chunks = [];
  let current = '';

  for (const para of paragraphs) {
    if (current.length + para.length > maxChars && current.length > 0) {
      chunks.push(current);
      const overlapText = current.slice(-overlap);
      current = overlapText + '\n\n' + para;
    } else {
      current += (current ? '\n\n' : '') + para;
    }
  }
  if (current.trim()) chunks.push(current);
  return chunks;
}

function buildPrompt(chunkText, chunkIndex, totalChunks, metadata) {
  const dimensionList = DIMENSIONS.map(
    (d, i) => `${i + 1}. **${d.name}** (ID: "${d.id}", Weight: ${d.weight})\n   Criteria: ${d.criteria.join('; ')}`
  ).join('\n');

  return `You are a senior Business Analyst and BRD quality auditor with deep expertise in BABOK v3 and IEEE 29148 standards. Analyze the following BRD content and evaluate it against 10 quality dimensions.

For each dimension, provide:
1. A score from 0 to 100
2. A 2-3 sentence summary of the assessment
3. Specific findings (issues found), each with severity (critical/major/minor/info), title, description, location if identifiable, and recommendation
4. Identified strengths
5. Specific recommendations for improvement

Document Metadata:
- Project: ${metadata.projectName || 'Unknown'}
- Version: ${metadata.version || 'N/A'}
- Domain: ${metadata.domain || 'N/A'}
- Department: ${metadata.department || 'N/A'}
- Maturity Gate: ${metadata.maturityGate || 'N/A'}

=== QUALITY DIMENSIONS TO EVALUATE ===
${dimensionList}

=== BRD CONTENT (Chunk ${chunkIndex + 1} of ${totalChunks}) ===
${chunkText}
=== END CONTENT ===

Respond with ONLY valid JSON matching this exact structure:
{
  "dimensions": [
    {
      "id": "<dimension_id>",
      "name": "<dimension_name>",
      "score": <0-100>,
      "summary": "<2-3 sentence assessment>",
      "findings": [
        {
          "severity": "critical|major|minor|info",
          "title": "<short title>",
          "description": "<detailed description>",
          "location": "<section or page if identifiable>",
          "recommendation": "<actionable fix>"
        }
      ],
      "strengths": ["<strength 1>", "<strength 2>"],
      "recommendations": ["<recommendation 1>", "<recommendation 2>"]
    }
  ],
  "overallObservations": "<2-3 sentence overall assessment>",
  "topPriorityActions": [
    {
      "rank": 1,
      "title": "<action title>",
      "description": "<why and how>",
      "dimensionId": "<related dimension id>",
      "impact": "high|medium|low",
      "effort": "high|medium|low"
    }
  ]
}

IMPORTANT:
- Be specific and actionable in findings and recommendations
- Reference actual content from the document when possible
- Score fairly: 70-80 is "good", 90+ is exceptional, below 50 indicates serious issues
- Every dimension MUST be evaluated even if this chunk has limited content for it
- Provide at least one finding or strength per dimension
- Return ONLY valid JSON, no markdown code fences`;
}

async function analyzeChunk(chunkText, chunkIndex, totalChunks, metadata) {
  const prompt = buildPrompt(chunkText, chunkIndex, totalChunks, metadata);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    temperature: 0.2,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text;
  const jsonStr = text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse Claude response as JSON');
  }
}

function aggregateResults(chunkResults, metadata, uploadData) {
  const dimensionMap = new Map();

  for (const dim of DIMENSIONS) {
    dimensionMap.set(dim.id, {
      id: dim.id,
      name: dim.name,
      weight: dim.weight,
      scores: [],
      findings: [],
      strengths: [],
      recommendations: [],
      summaries: [],
    });
  }

  for (const result of chunkResults) {
    if (!result.dimensions) continue;
    for (const dim of result.dimensions) {
      const agg = dimensionMap.get(dim.id);
      if (!agg) continue;
      agg.scores.push(dim.score);
      if (dim.findings) agg.findings.push(...dim.findings);
      if (dim.strengths) agg.strengths.push(...dim.strengths);
      if (dim.recommendations) agg.recommendations.push(...dim.recommendations);
      if (dim.summary) agg.summaries.push(dim.summary);
    }
  }

  const dimensions = [];
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [id, agg] of dimensionMap) {
    const score = agg.scores.length > 0
      ? Math.round(agg.scores.reduce((a, b) => a + b, 0) / agg.scores.length)
      : 0;

    const findings = deduplicateFindings(agg.findings).map((f, i) => ({
      id: `${id}-F${String(i + 1).padStart(3, '0')}`,
      dimensionId: id,
      ...f,
    }));

    const strengths = [...new Set(agg.strengths)];
    const recommendations = [...new Set(agg.recommendations)];
    const summary = agg.summaries.sort((a, b) => b.length - a.length)[0] || '';

    const gradeInfo = getGradeForScore(score);

    dimensions.push({
      id,
      name: agg.name,
      score,
      maxScore: 100,
      weight: agg.weight,
      grade: gradeInfo.grade,
      findings,
      strengths,
      recommendations,
      summary,
    });

    weightedSum += score * agg.weight;
    totalWeight += agg.weight;
  }

  const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  const gradeInfo = getGradeForScore(overallScore);

  const allFindings = dimensions.flatMap(d => d.findings);
  const priorityActions = collectPriorityActions(chunkResults, dimensions);
  const allStrengths = dimensions.flatMap(d =>
    d.strengths.map((s, i) => ({
      id: `${d.id}-S${i + 1}`,
      dimensionId: d.id,
      dimensionName: d.name,
      text: s,
    }))
  );

  return {
    id: uuidv4(),
    fileName: uploadData.fileName,
    analyzedAt: new Date().toISOString(),
    overallScore,
    healthGrade: gradeInfo.grade,
    gradeColor: gradeInfo.color,
    dimensions,
    findings: allFindings,
    priorityActions,
    strengths: allStrengths,
    metadata: {
      projectName: metadata.projectName || 'Unknown Project',
      version: metadata.version,
      author: metadata.author,
      domain: metadata.domain,
      department: metadata.department,
      maturityGate: metadata.maturityGate,
      uploadedAt: uploadData.uploadedAt,
      fileType: uploadData.fileType,
      pageCount: uploadData.pageCount,
      wordCount: uploadData.wordCount,
    },
  };
}

function deduplicateFindings(findings) {
  const seen = new Set();
  return findings.filter(f => {
    const key = (f.title || '').toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function collectPriorityActions(chunkResults, dimensions) {
  const actions = [];
  for (const result of chunkResults) {
    if (result.topPriorityActions) {
      actions.push(...result.topPriorityActions);
    }
  }

  const seen = new Set();
  const unique = actions.filter(a => {
    const key = (a.title || '').toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  unique.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return (impactOrder[a.impact] || 2) - (impactOrder[b.impact] || 2);
  });

  return unique.slice(0, 10).map((a, i) => ({ ...a, rank: i + 1 }));
}

function getGradeForScore(score) {
  const thresholds = [
    { min: 95, grade: 'A+', color: '#059669' },
    { min: 90, grade: 'A', color: '#10B981' },
    { min: 85, grade: 'B+', color: '#3B82F6' },
    { min: 80, grade: 'B', color: '#6366F1' },
    { min: 75, grade: 'C+', color: '#F59E0B' },
    { min: 70, grade: 'C', color: '#EAB308' },
    { min: 60, grade: 'D', color: '#F97316' },
    { min: 0, grade: 'F', color: '#EF4444' },
  ];
  for (const t of thresholds) {
    if (score >= t.min) return t;
  }
  return thresholds[thresholds.length - 1];
}

export async function runAnalysis(uploadData, metadata) {
  const chunks = chunkDocument(uploadData.text);
  const results = [];

  for (let i = 0; i < chunks.length; i += 3) {
    const batch = chunks.slice(i, i + 3);
    const batchResults = await Promise.allSettled(
      batch.map((chunk, j) => analyzeChunk(chunk, i + j, chunks.length, metadata))
    );
    for (const r of batchResults) {
      if (r.status === 'fulfilled') results.push(r.value);
      else console.error('Chunk analysis failed:', r.reason?.message);
    }
  }

  if (results.length === 0) {
    throw new Error('All chunk analyses failed. Please check your API key and try again.');
  }

  return aggregateResults(results, metadata, uploadData);
}
