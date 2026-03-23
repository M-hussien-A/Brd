import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, FileCheck2, BarChart3 } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';

export default function Header() {
  const [isDark, setIsDark] = useDarkMode();
  const location = useLocation();

  return (
    <header className="bg-navy-500 dark:bg-navy-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-400 rounded-lg flex items-center justify-center">
              <FileCheck2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold leading-tight">BRD Quality Assurance</h1>
              <p className="text-navy-200 text-xs">Giza Systems</p>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-navy-400 dark:bg-navy-700 text-white'
                  : 'text-navy-200 hover:text-white hover:bg-navy-400/50'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              Upload
            </Link>
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/dashboard'
                  ? 'bg-navy-400 dark:bg-navy-700 text-white'
                  : 'text-navy-200 hover:text-white hover:bg-navy-400/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Link>

            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg text-navy-200 hover:text-white hover:bg-navy-400/50 transition-colors"
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
