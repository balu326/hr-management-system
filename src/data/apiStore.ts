// src/data/apiStore.ts
import { apiService } from '../services/api';
import type { User, AttendanceRecord, LeaveRequest, PayrollRecord, UploadedFile, Announcement } from '../types';

// Auth
export async function login(email: string, password: string): Promise<User | null> {
  try {
    const response = await apiService.login(email, password);
    if (response.user) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('current_user', JSON.stringify(response.user));
      return response.user;
    }
    return null;
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
}

export function getCurrentUser(): User | null { 
  const userStr = localStorage.getItem('current_user');
  return userStr ? JSON.parse(userStr) : null;
}

export function logout(): void { 
  localStorage.removeItem('auth_token');
  localStorage.removeItem('current_user');
}

// Users
export async function getUsers(): Promise<User[]> { 
  try {
    return await apiService.getUsers();
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return []; // Return empty array on error
  }
}

export async function saveUsers(_users: User[]): Promise<void> { 
  console.warn('saveUsers: Use updateUser for individual updates');
}

export async function addUser(user: User): Promise<void> { 
  try {
    await apiService.createUser(user);
  } catch (error) {
    console.error('Failed to add user:', error);
    throw error;
  }
}

export async function updateUser(user: User): Promise<void> { 
  try {
    await apiService.updateUser(user.id, user);
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
  }
}

export async function deleteUser(id: string): Promise<void> { 
  try {
    await apiService.deleteUser(id);
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw error;
  }
}

// Attendance
export async function getAttendance(): Promise<AttendanceRecord[]> { 
  try {
    return await apiService.getAttendance();
  } catch (error) {
    console.error('Failed to fetch attendance:', error);
    return [];
  }
}

export async function saveAttendance(_records: AttendanceRecord[]): Promise<void> { 
  console.warn('saveAttendance: Use addAttendance for individual records');
}

export async function addAttendance(record: AttendanceRecord): Promise<void> { 
  try {
    await apiService.createAttendance(record);
  } catch (error) {
    console.error('Failed to add attendance:', error);
    throw error;
  }
}

// Leaves
export async function getLeaves(): Promise<LeaveRequest[]> { 
  try {
    return await apiService.getLeaves();
  } catch (error) {
    console.error('Failed to fetch leaves:', error);
    return [];
  }
}

export async function saveLeaves(_leaves: LeaveRequest[]): Promise<void> { 
  console.warn('saveLeaves: Use addLeave/updateLeaveStatus for individual updates');
}

export async function addLeave(leave: LeaveRequest): Promise<void> { 
  try {
    await apiService.createLeave(leave);
  } catch (error) {
    console.error('Failed to add leave:', error);
    throw error;
  }
}

export async function updateLeaveStatus(id: string, status: LeaveRequest['status']): Promise<void> {
  try {
    await apiService.updateLeaveStatus(id, status);
  } catch (error) {
    console.error('Failed to update leave status:', error);
    throw error;
  }
}

// Payroll
export async function getPayroll(): Promise<PayrollRecord[]> { 
  try {
    return await apiService.getPayroll();
  } catch (error) {
    console.error('Failed to fetch payroll:', error);
    return [];
  }
}

export async function updatePayrollStatus(id: string, status: PayrollRecord['status']): Promise<void> {
  try {
    await apiService.updatePayrollStatus(id, status);
  } catch (error) {
    console.error('Failed to update payroll status:', error);
    throw error;
  }
}

// Files
export async function getFiles(): Promise<UploadedFile[]> { 
  try {
    return await apiService.getFiles();
  } catch (error) {
    console.error('Failed to fetch files:', error);
    return [];
  }
}

export async function saveFiles(_files: UploadedFile[]): Promise<void> { 
  console.warn('saveFiles: Use addFile/deleteFile for individual operations');
}

export async function addFile(file: UploadedFile): Promise<void> { 
  try {
    // For file uploads, we typically send FormData instead of JSON
    const formData = new FormData();
    if (file.dataUrl) {
      // If it's a file upload, convert the data URL to a blob
      const blob = dataURLToBlob(file.dataUrl);
      formData.append('file', blob, file.name);
    }
    // Add other metadata
    formData.append('name', file.name);
    formData.append('type', file.type);
    formData.append('size', file.size);
    formData.append('category', file.category);
    formData.append('employeeId', file.employeeId);
    
    await apiService.request('/files', { 
      method: 'POST', 
      body: formData,
      // Don't set Content-Type header for FormData, let browser set it with boundary
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
  } catch (error) {
    console.error('Failed to add file:', error);
    throw error;
  }
}

export async function deleteFile(id: string): Promise<void> { 
  try {
    await apiService.request(`/files/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Failed to delete file:', error);
    throw error;
  }
}

// Helper function to convert data URL to Blob
function dataURLToBlob(dataURL: string): Blob {
  const parts = dataURL.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const uInt8Array = new Uint8Array(raw.length);
  
  for (let i = 0; i < raw.length; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uInt8Array], { type: contentType });
}

// Announcements
export async function getAnnouncements(): Promise<Announcement[]> { 
  try {
    return await apiService.getAnnouncements();
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    return [];
  }
}

export async function saveAnnouncements(_announcements: Announcement[]): Promise<void> { 
  console.warn('saveAnnouncements: Use addAnnouncement/deleteAnnouncement for individual operations');
}

export async function addAnnouncement(announcement: Announcement): Promise<void> { 
  try {
    await apiService.createAnnouncement(announcement);
  } catch (error) {
    console.error('Failed to add announcement:', error);
    throw error;
  }
}

export async function deleteAnnouncement(id: string): Promise<void> { 
  try {
    await apiService.request(`/announcements/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Failed to delete announcement:', error);
    throw error;
  }
}

export function initializeData(): void {
  // No initialization needed when using API
  console.log('Using API for data storage');
}