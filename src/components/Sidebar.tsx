import type { User, Page } from '../types';

interface SidebarProps {
  user: User;
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onLogout: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const adminMenuItems: { page: Page; label: string; icon: string }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: '📊' },
  { page: 'employees', label: 'Employees', icon: '👥' },
  { page: 'attendance', label: 'Attendance', icon: '📅' },
  { page: 'leave', label: 'Leave Requests', icon: '🏖️' },
  { page: 'payroll', label: 'Payroll', icon: '💰' },
  { page: 'files', label: 'Documents', icon: '📁' },
  { page: 'announcements', label: 'Announcements', icon: '📢' },
  { page: 'settings', label: 'Settings', icon: '⚙️' },
];

const employeeMenuItems: { page: Page; label: string; icon: string }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: '📊' },
  { page: 'attendance', label: 'My Attendance', icon: '📅' },
  { page: 'leave', label: 'Leave Requests', icon: '🏖️' },
  { page: 'payroll', label: 'My Payroll', icon: '💰' },
  { page: 'files', label: 'My Documents', icon: '📁' },
  { page: 'announcements', label: 'Announcements', icon: '📢' },
  { page: 'settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar({ user, currentPage, onPageChange, onLogout, isMobileOpen, onMobileClose }: SidebarProps) {
  const menuItems = user.role === 'admin' ? adminMenuItems : employeeMenuItems;

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onMobileClose}></div>
      )}

      <aside className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand */}
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">🏢</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">HR Manager Pro</h1>
              <p className="text-slate-400 text-xs capitalize">{user.role} Panel</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.page}
              onClick={() => { onPageChange(item.page); onMobileClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                currentPage === item.page
                  ? 'bg-indigo-500/20 text-indigo-300 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-lg">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
              <p className="text-slate-400 text-xs truncate">{user.position}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-medium transition cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
