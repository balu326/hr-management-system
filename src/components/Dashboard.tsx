import type { User } from '../types';
import { getUsers, getAttendance, getLeaves, getPayroll, getAnnouncements } from '../data/store';

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const isAdmin = user.role === 'admin';
  const users = getUsers();
  const employees = users.filter(u => u.role === 'employee');
  const attendance = getAttendance();
  const leaves = getLeaves();
  const payroll = getPayroll();
  const announcements = getAnnouncements();

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === today);
  const presentToday = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
  const totalPayroll = payroll.filter(p => p.status === 'pending').reduce((s, p) => s + p.netSalary, 0);

  const myAttendance = attendance.filter(a => a.employeeId === user.id);
  const myLeaves = leaves.filter(l => l.employeeId === user.id);
  const myPayroll = payroll.filter(p => p.employeeId === user.id);
  const myTodayAtt = myAttendance.find(a => a.date === today);

  const adminStats = [
    { label: 'Total Employees', value: employees.length, icon: '👥', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
    { label: 'Present Today', value: `${presentToday}/${employees.length}`, icon: '✅', color: 'from-green-500 to-emerald-500', bg: 'bg-green-50' },
    { label: 'Pending Leaves', value: pendingLeaves, icon: '📋', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
    { label: 'Pending Payroll', value: `$${totalPayroll.toLocaleString()}`, icon: '💰', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50' },
  ];

  const empStats = [
    { label: 'Today Status', value: myTodayAtt ? myTodayAtt.status.charAt(0).toUpperCase() + myTodayAtt.status.slice(1) : 'Not Checked In', icon: '📅', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
    { label: 'Leave Balance', value: `${20 - myLeaves.filter(l => l.status === 'approved').length} days`, icon: '🏖️', color: 'from-green-500 to-emerald-500', bg: 'bg-green-50' },
    { label: 'Pending Leaves', value: myLeaves.filter(l => l.status === 'pending').length, icon: '⏳', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
    { label: 'Last Salary', value: myPayroll.length > 0 ? `$${myPayroll[0].netSalary.toLocaleString()}` : 'N/A', icon: '💰', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50' },
  ];

  const stats = isAdmin ? adminStats : empStats;

  // Department distribution for admin
  const departments: Record<string, number> = {};
  employees.forEach(e => { departments[e.department] = (departments[e.department] || 0) + 1; });

  const recentLeaves = isAdmin
    ? leaves.filter(l => l.status === 'pending').slice(0, 5)
    : myLeaves.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute right-20 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2"></div>
        <div className="relative">
          <h1 className="text-2xl font-bold mb-1">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
          <p className="text-indigo-100/80">
            {isAdmin
              ? `You have ${pendingLeaves} pending leave requests and ${payroll.filter(p => p.status === 'pending').length} payroll items to process.`
              : `Here's your overview for today. Have a productive day!`}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center opacity-20`}></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity / Leaves */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isAdmin ? '📋 Pending Leave Requests' : '📋 My Recent Leave Requests'}
          </h2>
          {recentLeaves.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <span className="text-4xl block mb-2">📭</span>
              No leave requests found
            </div>
          ) : (
            <div className="space-y-3">
              {recentLeaves.map(leave => {
                const emp = users.find(u => u.id === leave.employeeId);
                return (
                  <div key={leave.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-lg">
                      {emp?.avatar || '👤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{isAdmin ? emp?.name : leave.type.charAt(0).toUpperCase() + leave.type.slice(1) + ' Leave'}</p>
                      <p className="text-xs text-gray-500">{leave.startDate} → {leave.endDate}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      leave.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Announcements */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📢 Announcements</h2>
            <div className="space-y-3">
              {announcements.slice(0, 3).map(ann => (
                <div key={ann.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${
                      ann.priority === 'high' ? 'bg-red-500' :
                      ann.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                    }`}></span>
                    <p className="text-sm font-medium text-gray-900">{ann.title}</p>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{ann.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{ann.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Department Breakdown (Admin Only) */}
          {isAdmin && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🏢 Departments</h2>
              <div className="space-y-3">
                {Object.entries(departments).map(([dept, count]) => (
                  <div key={dept} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{dept}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${(count / employees.length) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Info for Employee */}
          {!isAdmin && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ℹ️ My Info</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Department</span>
                  <span className="font-medium text-gray-900">{user.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Position</span>
                  <span className="font-medium text-gray-900">{user.position}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Join Date</span>
                  <span className="font-medium text-gray-900">{user.joinDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">{user.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
