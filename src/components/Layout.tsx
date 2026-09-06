import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { LogOut, WifiOff, Menu, X, Home, FileText, Settings, Database, Activity, ScanFace, Moon, Sun } from 'lucide-react';
import AIChat from './AIChat';
import { PWAInstallButton } from './PWAInstallButton';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function Layout() {
  const { currentUser, isOnline, setOnlineStatus, setCurrentUser, darkMode, toggleDarkMode } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  if (!currentUser) {
    return <Outlet />;
  }

  const getNavLinks = () => {
    switch (currentUser.role) {
      case 'admin':
        return [
          { to: '/admin', label: 'Dashboard', icon: Home },
          { to: '/admin/rules', label: 'Grading Rules', icon: Settings },
          { to: '/admin/models', label: 'AI Models', icon: Activity },
        ];
      case 'officer':
        return [
          { to: '/officer', label: 'Lots History', icon: FileText },
          { to: '/officer/new-lot', label: 'New Assessment', icon: ScanFace },
        ];
      case 'farmer':
        return [
          { to: '/farmer', label: 'My Reports', icon: FileText },
        ];
      case 'reviewer':
        return [
          { to: '/reviewer', label: 'Disputes', icon: FileText },
        ];
      default:
        return [];
    }
  };

  const links = getNavLinks();

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
      <header className="print:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm z-30">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden mr-2 p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
          </button>
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shrink-0 hidden sm:flex">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-slate-900 dark:text-white tracking-tight leading-none">AgriVision AI</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-1 hidden sm:block">Onion Quality Assessment Platform</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 sm:space-x-6">
          <div className="hidden sm:flex flex-col items-end">
            {isOnline ? (
              <div className="flex items-center text-xs font-medium text-emerald-600">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> ONLINE / SYNCED
              </div>
            ) : (
              <div className="flex items-center text-xs font-medium text-amber-600">
                <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span> OFFLINE MODE
              </div>
            )}
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">v2.4.0-STABLE</span>
          </div>
          
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
          
          <div className="flex items-center space-x-3">
            <div className="mr-4 hidden sm:block"><PWAInstallButton /></div>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 uppercase">{currentUser.role}</p>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
               <span className="text-slate-500 font-bold text-sm">{currentUser.name.charAt(0)}</span>
            </div>
            
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-400 hover:text-emerald-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-2"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                setCurrentUser(null);
                navigate('/');
              }}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors ml-2"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-slate-200 bg-white absolute top-16 left-0 right-0 z-40 shadow-md">
            <div className="pt-2 pb-3 space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center pl-4 pr-4 py-3 text-sm font-medium",
                      isActive 
                        ? "bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700" 
                        : "border-l-4 border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800"
                    )}
                  >
                    <Icon className="mr-3 w-5 h-5 opacity-70" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="pt-4 pb-3 border-t border-slate-200">
              <div className="flex items-center px-4">
                <div className="ml-3">
                  <div className="text-sm font-bold text-slate-800">{currentUser.name}</div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{currentUser.role}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop sidebar navigation */}
        <nav className="print:hidden hidden sm:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 flex-col">
          <div className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "group flex items-center px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-150 ease-in-out",
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <Icon 
                    className={cn(
                      "mr-3 flex-shrink-0 h-5 w-5",
                      isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-500"
                    )} 
                  />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-slate-950 p-4 sm:p-6 lg:p-8 flex flex-col">
          <Outlet />
        </main>
      </div>
      <AIChat />
    </div>
  );
}
