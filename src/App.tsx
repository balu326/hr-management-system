import { useState, useEffect } from 'react';
import type { User, Page } from './types';
import { initializeData, getCurrentUser, logout as doLogout } from './data/apiStore';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { EmployeeList } from './components/EmployeeList';
import { Attendance } from './components/Attendance';
import { LeaveManagement } from './components/LeaveManagement';
import { Payroll } from './components/Payroll';
import { FileManager } from './components/FileManager';
import { Announcements } from './components/Announcements';
import { Settings } from './components/Settings';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeData();
    const saved = getCurrentUser();
    if (saved) setUser(saved);
    setIsLoading(false);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    doLogout();
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl mb-4 animate-pulse">
            <span className="text-3xl">🏢</span>
          </div>
          <p className="text-indigo-200 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard user={user} />;
      case 'employees': return user.role === 'admin' ? <EmployeeList /> : <Dashboard user={user} />;
      case 'attendance': return <Attendance user={user} />;
      case 'leave': return <LeaveManagement user={user} />;
      case 'payroll': return <Payroll user={user} />;
      case 'files': return <FileManager user={user} />;
      case 'announcements': return <Announcements user={user} />;
      case 'settings': return <Settings user={user} onUserUpdate={setUser} />;
      default: return <Dashboard user={user} />;
    }
  };

  const getPageTitle = () => {
    const titles: Record<Page, string> = {
      dashboard: 'Dashboard',
      employees: 'Employees',
      attendance: 'Attendance',
      leave: 'Leave Requests',
      payroll: 'Payroll',
      files: 'Documents',
      announcements: 'Announcements',
      settings: 'Settings',
    };
    return titles[currentPage] || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        user={user}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h2>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <button className="relative p-2 hover:bg-gray-100 rounded-xl transition cursor-pointer">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl">
                <span className="text-lg">{user.avatar}</span>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{user.name}</p>
                  <p className="text-xs text-gray-500 leading-tight capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-gray-100 text-center text-xs text-gray-400">
          © 2025 HR Manager Pro — Human Resource Management System
        </footer>
      </div>
    </div>
  );
}
