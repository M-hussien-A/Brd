import { FileText, Tag, User, Building2, Layers, ShieldCheck } from 'lucide-react';

const DOMAINS = ['ITS', 'Telecom', 'Government', 'Healthcare', 'Finance', 'Education', 'Energy', 'Other'];
const MATURITY_GATES = ['BA Self-Review', 'Peer Review', 'TDM Gate', 'Client Review'];

export default function MetadataForm({ metadata, onChange }) {
  const update = (field) => (e) => onChange({ ...metadata, [field]: e.target.value });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-navy-500 dark:text-gray-300 mb-1.5">
          <FileText className="w-4 h-4" /> Project Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={metadata.projectName || ''}
          onChange={update('projectName')}
          placeholder="e.g., Smart Parking System"
          className="w-full px-4 py-2.5 rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-700 text-navy-500 dark:text-white placeholder-navy-300 dark:placeholder-navy-500 focus:ring-2 focus:ring-accent-400 focus:border-transparent outline-none transition-all"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-navy-500 dark:text-gray-300 mb-1.5">
          <Tag className="w-4 h-4" /> Version
        </label>
        <input
          type="text"
          value={metadata.version || ''}
          onChange={update('version')}
          placeholder="e.g., 2.1"
          className="w-full px-4 py-2.5 rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-700 text-navy-500 dark:text-white placeholder-navy-300 dark:placeholder-navy-500 focus:ring-2 focus:ring-accent-400 focus:border-transparent outline-none transition-all"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-navy-500 dark:text-gray-300 mb-1.5">
          <User className="w-4 h-4" /> Author
        </label>
        <input
          type="text"
          value={metadata.author || ''}
          onChange={update('author')}
          placeholder="e.g., Ahmed Hassan"
          className="w-full px-4 py-2.5 rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-700 text-navy-500 dark:text-white placeholder-navy-300 dark:placeholder-navy-500 focus:ring-2 focus:ring-accent-400 focus:border-transparent outline-none transition-all"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-navy-500 dark:text-gray-300 mb-1.5">
          <Building2 className="w-4 h-4" /> Domain
        </label>
        <select
          value={metadata.domain || ''}
          onChange={update('domain')}
          className="w-full px-4 py-2.5 rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-700 text-navy-500 dark:text-white focus:ring-2 focus:ring-accent-400 focus:border-transparent outline-none transition-all"
        >
          <option value="">Select domain...</option>
          {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-navy-500 dark:text-gray-300 mb-1.5">
          <Layers className="w-4 h-4" /> Department
        </label>
        <input
          type="text"
          value={metadata.department || ''}
          onChange={update('department')}
          placeholder="e.g., Digital Solutions"
          className="w-full px-4 py-2.5 rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-700 text-navy-500 dark:text-white placeholder-navy-300 dark:placeholder-navy-500 focus:ring-2 focus:ring-accent-400 focus:border-transparent outline-none transition-all"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-navy-500 dark:text-gray-300 mb-1.5">
          <ShieldCheck className="w-4 h-4" /> Maturity Gate
        </label>
        <select
          value={metadata.maturityGate || ''}
          onChange={update('maturityGate')}
          className="w-full px-4 py-2.5 rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-700 text-navy-500 dark:text-white focus:ring-2 focus:ring-accent-400 focus:border-transparent outline-none transition-all"
        >
          <option value="">Select gate...</option>
          {MATURITY_GATES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
    </div>
  );
}
