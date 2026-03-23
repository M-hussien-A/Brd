import { useState, useEffect } from 'react';
import { BarChart3, Target, Radar, AlertTriangle, ListChecks, ThumbsUp, Layers, FileText } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'executive-summary', label: 'Summary', icon: BarChart3 },
  { id: 'radar-chart', label: 'Radar', icon: Radar },
  { id: 'findings-distribution', label: 'Distribution', icon: Target },
  { id: 'dimension-scores', label: 'Dimensions', icon: Layers },
  { id: 'findings-table', label: 'Findings', icon: AlertTriangle },
  { id: 'priority-actions', label: 'Actions', icon: ListChecks },
  { id: 'strengths', label: 'Strengths', icon: ThumbsUp },
  { id: 'dimension-drill-down', label: 'Details', icon: FileText },
];

export default function Sidebar() {
  const [active, setActive] = useState(NAV_ITEMS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    NAV_ITEMS.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <aside className="hidden xl:block w-48 sticky top-16 h-[calc(100vh-4rem)] p-4 border-r border-navy-100 dark:border-navy-600 bg-white dark:bg-navy-800 overflow-y-auto">
      <nav className="space-y-1">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-accent-50 dark:bg-accent-900/20 text-accent-400 border-l-2 border-accent-400'
                  : 'text-navy-400 dark:text-gray-400 hover:text-navy-500 dark:hover:text-white hover:bg-navy-50 dark:hover:bg-navy-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
