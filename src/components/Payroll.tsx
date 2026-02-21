import { useState } from 'react';
import type { User } from '../types';
import { getUsers, getPayroll, updatePayrollStatus } from '../data/store';

interface PayrollProps {
  user: User;
}

export function Payroll({ user }: PayrollProps) {
  const isAdmin = user.role === 'admin';
  const users = getUsers();
  const [payroll, setPayroll] = useState(getPayroll());
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEmployee, setFilterEmployee] = useState('all');

  const employees = users.filter(u => u.role === 'employee');

  const filteredPayroll = payroll.filter(p => {
    const matchUser = isAdmin ? (filterEmployee === 'all' || p.employeeId === filterEmployee) : p.employeeId === user.id;
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchUser && matchStatus;
  }).sort((a, b) => b.year - a.year || b.month.localeCompare(a.month));

  const handleProcess = (id: string) => {
    updatePayrollStatus(id, 'processed');
    setPayroll(getPayroll());
  };

  const handlePay = (id: string) => {
    updatePayrollStatus(id, 'paid');
    setPayroll(getPayroll());
  };

  const totalPending = payroll.filter(p => p.status === 'pending').reduce((s, p) => s + p.netSalary, 0);
  const totalProcessed = payroll.filter(p => p.status === 'processed').reduce((s, p) => s + p.netSalary, 0);
  const totalPaid = payroll.filter(p => p.status === 'paid').reduce((s, p) => s + p.netSalary, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💰 {isAdmin ? 'Payroll Management' : 'My Payroll'}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage salary and compensation</p>
        </div>
      </div>

      {/* Stats */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
            <p className="text-sm text-amber-600 font-medium">Pending</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">${totalPending.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
            <p className="text-sm text-blue-600 font-medium">Processed</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">${totalProcessed.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
            <p className="text-sm text-green-600 font-medium">Paid</p>
            <p className="text-2xl font-bold text-green-700 mt-1">${totalPaid.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processed">Processed</option>
          <option value="paid">Paid</option>
        </select>
        {isAdmin && (
          <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="all">All Employees</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        )}
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {isAdmin && <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>}
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Basic</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Bonus</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                {isAdmin && <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayroll.map(record => {
                const emp = users.find(u => u.id === record.employeeId);
                return (
                  <tr key={record.id} className="hover:bg-gray-50 transition">
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{emp?.avatar}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{emp?.name}</p>
                            <p className="text-xs text-gray-500">{emp?.position}</p>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-600">{record.month} {record.year}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">${record.basicSalary.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-green-600 text-right">+${record.bonus.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-red-600 text-right">-${record.deductions.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-red-600 text-right">-${record.tax.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">${record.netSalary.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        record.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        record.status === 'processed' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>{record.status}</span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {record.status === 'pending' && (
                            <button onClick={() => handleProcess(record.id)} className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-medium transition cursor-pointer">Process</button>
                          )}
                          {record.status === 'processed' && (
                            <button onClick={() => handlePay(record.id)} className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-medium transition cursor-pointer">Pay</button>
                          )}
                          {record.status === 'paid' && (
                            <span className="text-xs text-gray-400">Paid: {record.paidOn}</span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredPayroll.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-2">💰</span>
            <p>No payroll records found</p>
          </div>
        )}
      </div>

      {/* Salary Summary for Employee */}
      {!isAdmin && filteredPayroll.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Salary Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Total Earned</p>
              <p className="text-xl font-bold text-gray-900">${filteredPayroll.filter(p => p.status === 'paid').reduce((s, p) => s + p.netSalary, 0).toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Avg Monthly</p>
              <p className="text-xl font-bold text-gray-900">${Math.round(filteredPayroll.reduce((s, p) => s + p.netSalary, 0) / filteredPayroll.length).toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Total Bonuses</p>
              <p className="text-xl font-bold text-green-600">${filteredPayroll.reduce((s, p) => s + p.bonus, 0).toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Total Tax</p>
              <p className="text-xl font-bold text-red-600">${filteredPayroll.reduce((s, p) => s + p.tax, 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
