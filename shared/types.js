// ===== Dimension Definitions =====
export const DIMENSIONS = [
  { id: 'completeness', name: 'Completeness', weight: 0.15, description: 'All required BRD sections present (scope, objectives, requirements, constraints, assumptions, stakeholders, timeline, budget)' },
  { id: 'clarity', name: 'Clarity & Readability', weight: 0.10, description: 'Unambiguous language, defined acronyms, consistent terminology, appropriate detail level' },
  { id: 'requirements_quality', name: 'Requirements Quality', weight: 0.15, description: 'SMART criteria, testable/verifiable, no vague terms, proper use of shall/should/may' },
  { id: 'consistency', name: 'Consistency', weight: 0.10, description: 'No contradictions between sections, consistent naming, aligned scope-requirements-objectives' },
  { id: 'traceability', name: 'Traceability', weight: 0.08, description: 'Requirements have IDs, cross-references exist, requirements link to objectives' },
  { id: 'feasibility', name: 'Feasibility & Realism', weight: 0.10, description: 'Technical feasibility acknowledged, realistic timelines, resource awareness' },
  { id: 'stakeholder_coverage', name: 'Stakeholder Coverage', weight: 0.08, description: 'All stakeholder groups identified, roles defined, approval process clear' },
  { id: 'risk_constraints', name: 'Risk & Constraints', weight: 0.08, description: 'Risks identified with mitigations, constraints explicit, assumptions documented' },
  { id: 'acceptance_criteria', name: 'Acceptance Criteria', weight: 0.08, description: 'Measurable acceptance criteria for requirements, success metrics defined' },
  { id: 'standards_compliance', name: 'Standards Compliance', weight: 0.08, description: 'Follows organizational/industry standards, proper document structure, version control' },
];

// ===== Branding =====
export const BRAND_COLORS = {
  primary: '#1B3A5C',
  accent: '#E8792F',
  secondary: '#2C5F8A',
  lightBg: '#F5F7FA',
  darkBg: '#0F1923',
  cardLight: '#FFFFFF',
  cardDark: '#1A2A3C',
  textLight: '#1B3A5C',
  textDark: '#E5E7EB',
};

export const SEVERITY_COLORS = {
  critical: { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444', dot: '#DC2626' },
  major: { bg: '#FFF7ED', text: '#9A3412', border: '#F97316', dot: '#EA580C' },
  minor: { bg: '#FEF9C3', text: '#854D0E', border: '#EAB308', dot: '#CA8A04' },
  info: { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6', dot: '#2563EB' },
};

export const GRADE_THRESHOLDS = [
  { min: 95, grade: 'A+', color: '#059669' },
  { min: 90, grade: 'A', color: '#10B981' },
  { min: 85, grade: 'B+', color: '#3B82F6' },
  { min: 80, grade: 'B', color: '#6366F1' },
  { min: 75, grade: 'C+', color: '#F59E0B' },
  { min: 70, grade: 'C', color: '#EAB308' },
  { min: 60, grade: 'D', color: '#F97316' },
  { min: 0, grade: 'F', color: '#EF4444' },
];

export function getGrade(score) {
  for (const t of GRADE_THRESHOLDS) {
    if (score >= t.min) return t;
  }
  return GRADE_THRESHOLDS[GRADE_THRESHOLDS.length - 1];
}

export const DOMAINS = [
  'ITS', 'Telecom', 'Government', 'Healthcare', 'Finance', 'Education', 'Energy', 'Other'
];

export const MATURITY_GATES = [
  'BA Self-Review', 'Peer Review', 'TDM Gate', 'Client Review'
];
