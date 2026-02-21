import { useState } from 'react';
import type { User } from '../types';
import { getUsers, addUser, updateUser, deleteUser } from '../data/store';

export function EmployeeList() {
  const [users, setUsers] = useState(getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', department: '', position: '', phone: '', salary: '', status: 'active' as 'active' | 'inactive'
  });

  const departments = [...new Set(users.map(u => u.department))];
  const employees = users.filter(u => u.role === 'employee');
  const filtered = employees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = filterDept === 'all' || e.department === filterDept;
    return matchSearch && matchDept;
  });

  const openAdd = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: 'emp123', department: '', position: '', phone: '', salary: '', status: 'active' });
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setFormData({ name: u.name, email: u.email, password: u.password, department: u.department, position: u.position, phone: u.phone, salary: String(u.salary), status: u.status });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) return;
    if (editingUser) {
      const updated = { ...editingUser, ...formData, salary: Number(formData.salary) };
      updateUser(updated);
    } else {
      const avatars = ['👨‍💻','👩‍💻','🧑‍💻','👨‍💼','👩‍💼','🧑‍💼','👨‍🔬','👩‍🎨'];
      const newUser: User = {
        id: `emp-${Date.now()}`,
        ...formData,
        salary: Number(formData.salary),
        role: 'employee',
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        joinDate: new Date().toISOString().split('T')[0],
      };
      addUser(newUser);
    }
    setUsers(getUsers());
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      deleteUser(id);
      setUsers(getUsers());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">👥 Employees</h1>
          <p className="text-sm text-gray-500 mt-1">{employees.length} total employees</p>
        </div>
        <button onClick={openAdd} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition cursor-pointer flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(emp => (
          <div key={emp.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-2xl">
                  {emp.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{emp.name}</h3>
                  <p className="text-sm text-gray-500">{emp.position}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {emp.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-gray-400">📧</span> {emp.email}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-gray-400">🏢</span> {emp.department}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-gray-400">📞</span> {emp.phone}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-gray-400">💰</span> ${emp.salary.toLocaleString()}/year
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <button onClick={() => openEdit(emp)} className="flex-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium transition cursor-pointer">
                ✏️ Edit
              </button>
              <button onClick={() => handleDelete(emp.id)} className="flex-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition cursor-pointer">
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <span className="text-5xl block mb-3">🔍</span>
          <p className="text-lg">No employees found</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              {editingUser ? '✏️ Edit Employee' : '➕ Add New Employee'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="john@hrms.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Engineering" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Developer" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="+1 555-0000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary (Annual)</label>
                  <input type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="60000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition cursor-pointer">Cancel</button>
              <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition cursor-pointer">
                {editingUser ? 'Update' : 'Add Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
