export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  position: string;
  phone: string;
  avatar: string;
  joinDate: string;
  salary: number;
  status: 'active' | 'inactive';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  hoursWorked: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'sick' | 'casual' | 'annual' | 'maternity' | 'other';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  basicSalary: number;
  bonus: number;
  deductions: number;
  tax: number;
  netSalary: number;
  status: 'pending' | 'processed' | 'paid';
  paidOn: string;
}

export interface UploadedFile {
  id: string;
  employeeId: string;
  name: string;
  type: string;
  size: string;
  category: 'resume' | 'id-proof' | 'certificate' | 'contract' | 'other';
  uploadedOn: string;
  dataUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
}

export type Page =
  | 'dashboard'
  | 'employees'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'files'
  | 'announcements'
  | 'settings';
