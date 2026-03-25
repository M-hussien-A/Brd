import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, FileCheck2, BarChart3 } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';
import GizaLogo from '../common/GizaLogo';

export default function Header() {
  const [isDark, setIsDark] = useDarkMode();
  const location = useLocation();

  return (
    <header className="bg-white dark:bg-navy-800 shadow-md dark:shadow-lg sticky top-0 z-50 border-b border-navy-100 dark:border-navy-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <GizaLogo size={36} />
            <div>
              <h1 className="font-heading text-lg font-bold leading-tight text-navy-500 dark:text-white">
                BRD Quality Assurance
              </h1>
              <p className="text-navy-300 dark:text-navy-400 text-xs">Giza Systems</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-navy-500 text-white dark:bg-navy-700'
                  : 'text-navy-400 hover:text-navy-500 hover:bg-navy-50 dark:text-navy-300 dark:hover:text-white dark:hover:bg-navy-700'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              Upload
            </Link>
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/dashboard'
                  ? 'bg-navy-500 text-white dark:bg-navy-700'
                  : 'text-navy-400 hover:text-navy-500 hover:bg-navy-50 dark:text-navy-300 dark:hover:text-white dark:hover:bg-navy-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Link>

            <div className="w-px h-6 bg-navy-200 dark:bg-navy-600 mx-1" />

            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg text-navy-400 hover:text-navy-500 hover:bg-navy-50 dark:text-navy-300 dark:hover:text-white dark:hover:bg-navy-700 transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
