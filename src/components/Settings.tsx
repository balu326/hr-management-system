import { useState } from 'react';
import type { User } from '../types';
import { updateUser, getUsers } from '../data/store';

interface SettingsProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

export function Settings({ user, onUserUpdate }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    department: user.department,
    position: user.position,
  });
  const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' });
  const [saved, setSaved] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSaved, setPassSaved] = useState(false);

  const handleSaveProfile = () => {
    const updatedUser = { ...user, ...formData };
    updateUser(updatedUser);
    localStorage.setItem('hr_current_user', JSON.stringify(updatedUser));
    onUserUpdate(updatedUser);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = () => {
    setPassError('');
    if (passwordData.current !== user.password) {
      setPassError('Current password is incorrect');
      return;
    }
    if (passwordData.newPass.length < 4) {
      setPassError('New password must be at least 4 characters');
      return;
    }
    if (passwordData.newPass !== passwordData.confirm) {
      setPassError('Passwords do not match');
      return;
    }
    const updatedUser = { ...user, password: passwordData.newPass };
    updateUser(updatedUser);
    localStorage.setItem('hr_current_user', JSON.stringify(updatedUser));
    onUserUpdate(updatedUser);
    setPasswordData({ current: '', newPass: '', confirm: '' });
    setPassSaved(true);
    setTimeout(() => setPassSaved(false), 2000);
  };

  const handleResetData = () => {
    if (confirm('This will reset ALL data to defaults. Are you sure?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const _users = getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">⚙️ Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {['profile', 'security', 'system'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer capitalize ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-4xl">
              {user.avatar}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.position} • {user.department}</p>
              <p className="text-xs text-gray-400 mt-1">Joined: {user.joinDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled={user.role !== 'admin'} />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button onClick={handleSaveProfile} className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition cursor-pointer">Save Changes</button>
            {saved && <span className="text-green-600 text-sm font-medium">✅ Profile updated!</span>}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🔒 Change Password</h2>
          {passError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{passError}</div>
          )}
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" value={passwordData.current} onChange={e => setPasswordData({...passwordData, current: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" value={passwordData.newPass} onChange={e => setPasswordData({...passwordData, newPass: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" value={passwordData.confirm} onChange={e => setPasswordData({...passwordData, confirm: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button onClick={handleChangePassword} className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition cursor-pointer">Update Password</button>
            {passSaved && <span className="text-green-600 text-sm font-medium">✅ Password changed!</span>}
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 System Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{_users.length}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Active Employees</p>
                <p className="text-2xl font-bold text-gray-900">{_users.filter(u => u.role === 'employee' && u.status === 'active').length}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900">{(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-2">⚠️ Danger Zone</h2>
            <p className="text-sm text-gray-500 mb-4">Reset all data to default values. This action cannot be undone.</p>
            <button onClick={handleResetData} className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition cursor-pointer">Reset All Data</button>
          </div>
        </div>
      )}
    </div>
  );
}
