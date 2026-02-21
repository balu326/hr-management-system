import { useState } from 'react';
import type { User, LeaveRequest } from '../types';
import { getUsers, getLeaves, addLeave, updateLeaveStatus } from '../data/store';

interface LeaveManagementProps {
  user: User;
}

export function LeaveManagement({ user }: LeaveManagementProps) {
  const isAdmin = user.role === 'admin';
  const users = getUsers();
  const [leaves, setLeaves] = useState(getLeaves());
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({ type: 'casual' as LeaveRequest['type'], startDate: '', endDate: '', reason: '' });

  const filteredLeaves = leaves.filter(l => {
    const matchUser = isAdmin ? true : l.employeeId === user.id;
    const matchStatus = filterStatus === 'all' || l.status === filterStatus;
    return matchUser && matchStatus;
  }).sort((a, b) => b.appliedOn.localeCompare(a.appliedOn));

  const handleApply = () => {
    if (!formData.startDate || !formData.endDate || !formData.reason) return;
    const leave: LeaveRequest = {
      id: `lv-${Date.now()}`,
      employeeId: user.id,
      ...formData,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };
    addLeave(leave);
    setLeaves(getLeaves());
    setShowModal(false);
    setFormData({ type: 'casual', startDate: '', endDate: '', reason: '' });
  };

  const handleStatusChange = (id: string, status: LeaveRequest['status']) => {
    updateLeaveStatus(id, status);
    setLeaves(getLeaves());
  };

  const pendingCount = leaves.filter(l => isAdmin ? l.status === 'pending' : l.employeeId === user.id && l.status === 'pending').length;
  const approvedCount = leaves.filter(l => isAdmin ? l.status === 'approved' : l.employeeId === user.id && l.status === 'approved').length;
  const rejectedCount = leaves.filter(l => isAdmin ? l.status === 'rejected' : l.employeeId === user.id && l.status === 'rejected').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏖️ {isAdmin ? 'Leave Management' : 'My Leave Requests'}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage leave requests and approvals</p>
        </div>
        {!isAdmin && (
          <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition cursor-pointer flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Apply Leave
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
          <p className="text-sm text-gray-500">Approved</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
          <p className="text-sm text-gray-500">Rejected</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Leave List */}
      <div className="space-y-4">
        {filteredLeaves.map(leave => {
          const emp = users.find(u => u.id === leave.employeeId);
          const start = new Date(leave.startDate);
          const end = new Date(leave.endDate);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

          return (
            <div key={leave.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {isAdmin && (
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                      {emp?.avatar || '👤'}
                    </div>
                  )}
                  <div>
                    {isAdmin && <h3 className="font-semibold text-gray-900">{emp?.name}</h3>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        leave.type === 'sick' ? 'bg-red-100 text-red-700' :
                        leave.type === 'casual' ? 'bg-blue-100 text-blue-700' :
                        leave.type === 'annual' ? 'bg-green-100 text-green-700' :
                        leave.type === 'maternity' ? 'bg-pink-100 text-pink-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{leave.type} leave</span>
                      <span className="text-xs text-gray-500">{days} day{days > 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{leave.startDate} → {leave.endDate}</p>
                    <p className="text-sm text-gray-500 mt-1">📝 {leave.reason}</p>
                    <p className="text-xs text-gray-400 mt-1">Applied: {leave.appliedOn}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    leave.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>{leave.status}</span>
                  {isAdmin && leave.status === 'pending' && (
                    <div className="flex gap-2 ml-2">
                      <button onClick={() => handleStatusChange(leave.id, 'approved')} className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-sm font-medium transition cursor-pointer">✅ Approve</button>
                      <button onClick={() => handleStatusChange(leave.id, 'rejected')} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition cursor-pointer">❌ Reject</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLeaves.length === 0 && (
        <div className="text-center py-12 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
          <span className="text-5xl block mb-3">🏖️</span>
          <p className="text-lg">No leave requests found</p>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">🏖️ Apply for Leave</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as LeaveRequest['type']})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="annual">Annual Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} rows={3} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Enter reason for leave..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition cursor-pointer">Cancel</button>
              <button onClick={handleApply} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition cursor-pointer">Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
