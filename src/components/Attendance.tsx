import { useState } from 'react';
import type { User, AttendanceRecord } from '../types';
import { getUsers, getAttendance, addAttendance } from '../data/store';

interface AttendanceProps {
  user: User;
}

export function Attendance({ user }: AttendanceProps) {
  const isAdmin = user.role === 'admin';
  const users = getUsers();
  const [attendance, setAttendance] = useState(getAttendance());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterEmployee, setFilterEmployee] = useState('all');

  const employees = users.filter(u => u.role === 'employee');
  const today = new Date().toISOString().split('T')[0];

  const filteredAttendance = attendance.filter(a => {
    const matchDate = a.date === selectedDate;
    const matchEmp = isAdmin ? (filterEmployee === 'all' || a.employeeId === filterEmployee) : a.employeeId === user.id;
    return matchDate && matchEmp;
  });

  const myTodayRecord = attendance.find(a => a.employeeId === user.id && a.date === today);

  const handleCheckIn = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const isLate = now.getHours() >= 10;
    const record: AttendanceRecord = {
      id: `att-${user.id}-${today}`,
      employeeId: user.id,
      date: today,
      checkIn: timeStr,
      checkOut: '',
      status: isLate ? 'late' : 'present',
      hoursWorked: 0,
    };
    addAttendance(record);
    setAttendance(getAttendance());
  };

  const handleCheckOut = () => {
    if (!myTodayRecord) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const [inH, inM] = myTodayRecord.checkIn.split(':').map(Number);
    const hoursWorked = Math.round(((now.getHours() * 60 + now.getMinutes()) - (inH * 60 + inM)) / 60 * 10) / 10;
    const updated = attendance.map(a =>
      a.id === myTodayRecord.id ? { ...a, checkOut: timeStr, hoursWorked, status: hoursWorked < 5 ? 'half-day' as const : a.status } : a
    );
    localStorage.setItem('hr_attendance', JSON.stringify(updated));
    setAttendance(updated);
  };

  // Stats
  const dateRecords = attendance.filter(a => a.date === selectedDate);
  const presentCount = dateRecords.filter(a => a.status === 'present').length;
  const lateCount = dateRecords.filter(a => a.status === 'late').length;
  const absentCount = dateRecords.filter(a => a.status === 'absent').length;
  const halfDayCount = dateRecords.filter(a => a.status === 'half-day').length;

  // Employee monthly summary
  const thisMonth = new Date().toISOString().slice(0, 7);
  const myMonthlyRecords = attendance.filter(a => a.employeeId === user.id && a.date.startsWith(thisMonth));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📅 {isAdmin ? 'Attendance Management' : 'My Attendance'}</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage attendance records</p>
        </div>
      </div>

      {/* Check In/Out for employees */}
      {!isAdmin && (
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Today's Attendance</h2>
              <p className="text-blue-100 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              {myTodayRecord && (
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span>Check-in: {myTodayRecord.checkIn || '—'}</span>
                  <span>Check-out: {myTodayRecord.checkOut || '—'}</span>
                  <span>Hours: {myTodayRecord.hoursWorked}h</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {!myTodayRecord ? (
                <button onClick={handleCheckIn} className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition cursor-pointer flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                  Check In
                </button>
              ) : !myTodayRecord.checkOut ? (
                <button onClick={handleCheckOut} className="px-6 py-3 bg-white text-red-600 rounded-xl font-semibold hover:shadow-lg transition cursor-pointer flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Check Out
                </button>
              ) : (
                <span className="px-6 py-3 bg-white/20 rounded-xl font-semibold">✅ Completed</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats (admin) */}
      {isAdmin && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-green-600">{presentCount}</p>
            <p className="text-sm text-gray-500">Present</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-amber-600">{lateCount}</p>
            <p className="text-sm text-gray-500">Late</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-red-600">{absentCount}</p>
            <p className="text-sm text-gray-500">Absent</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-blue-600">{halfDayCount}</p>
            <p className="text-sm text-gray-500">Half Day</p>
          </div>
        </div>
      )}

      {/* Monthly Summary for employee */}
      {!isAdmin && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-green-600">{myMonthlyRecords.filter(a => a.status === 'present').length}</p>
            <p className="text-sm text-gray-500">Present (Month)</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-amber-600">{myMonthlyRecords.filter(a => a.status === 'late').length}</p>
            <p className="text-sm text-gray-500">Late (Month)</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-red-600">{myMonthlyRecords.filter(a => a.status === 'absent').length}</p>
            <p className="text-sm text-gray-500">Absent (Month)</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-3xl font-bold text-indigo-600">{Math.round(myMonthlyRecords.reduce((s, a) => s + a.hoursWorked, 0))}h</p>
            <p className="text-sm text-gray-500">Total Hours</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        {isAdmin && (
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Employee</label>
            <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="all">All Employees</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {isAdmin && <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>}
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAttendance.map(record => {
                const emp = users.find(u => u.id === record.employeeId);
                return (
                  <tr key={record.id} className="hover:bg-gray-50 transition">
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{emp?.avatar}</span>
                          <span className="text-sm font-medium text-gray-900">{emp?.name}</span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-600">{record.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.checkIn || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.checkOut || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.hoursWorked}h</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        record.status === 'present' ? 'bg-green-100 text-green-700' :
                        record.status === 'late' ? 'bg-amber-100 text-amber-700' :
                        record.status === 'absent' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{record.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredAttendance.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-2">📅</span>
            <p>No attendance records for this date</p>
          </div>
        )}
      </div>
    </div>
  );
}
