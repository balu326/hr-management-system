// src/services/api.ts
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api';

class ApiService {
  public async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  // Authentication
  login = (email: string, password: string) => 
    this.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

  // Users
  getUsers = () => this.request('/users');
  getUserById = (id: string) => this.request(`/users/${id}`);
  createUser = (userData: any) => this.request('/users', { method: 'POST', body: JSON.stringify(userData) });
  updateUser = (id: string, userData: any) => this.request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) });
  deleteUser = (id: string) => this.request(`/users/${id}`, { method: 'DELETE' });

  // Attendance
  getAttendance = () => this.request('/attendance');
  createAttendance = (attendanceData: any) => this.request('/attendance', { method: 'POST', body: JSON.stringify(attendanceData) });

  // Leave requests
  getLeaves = () => this.request('/leaves');
  createLeave = (leaveData: any) => this.request('/leaves', { method: 'POST', body: JSON.stringify(leaveData) });
  updateLeaveStatus = (id: string, status: string) => this.request(`/leaves/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

  // Payroll
  getPayroll = () => this.request('/payroll');
  updatePayrollStatus = (id: string, status: string) => this.request(`/payroll/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

  // Files
  getFiles = () => this.request('/files');
  uploadFile = (fileData: any) => this.request('/files', { method: 'POST', body: fileData });

  // Announcements
  getAnnouncements = () => this.request('/announcements');
  createAnnouncement = (announcementData: any) => this.request('/announcements', { method: 'POST', body: JSON.stringify(announcementData) });
}

export const apiService = new ApiService();