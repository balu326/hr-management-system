import type { User, AttendanceRecord, LeaveRequest, PayrollRecord, UploadedFile, Announcement } from '../types';

const STORAGE_KEYS = {
  USERS: 'hr_users',
  ATTENDANCE: 'hr_attendance',
  LEAVES: 'hr_leaves',
  PAYROLL: 'hr_payroll',
  FILES: 'hr_files',
  ANNOUNCEMENTS: 'hr_announcements',
  CURRENT_USER: 'hr_current_user',
};

const defaultUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Sarah Johnson',
    email: 'admin@hrms.com',
    password: 'admin123',
    role: 'admin',
    department: 'Management',
    position: 'HR Director',
    phone: '+1 (555) 100-0001',
    avatar: '👩‍💼',
    joinDate: '2020-01-15',
    salary: 95000,
    status: 'active',
  },
  {
    id: 'emp-1',
    name: 'James Wilson',
    email: 'james@hrms.com',
    password: 'emp123',
    role: 'employee',
    department: 'Engineering',
    position: 'Senior Developer',
    phone: '+1 (555) 200-0001',
    avatar: '👨‍💻',
    joinDate: '2021-03-10',
    salary: 78000,
    status: 'active',
  },
  {
    id: 'emp-2',
    name: 'Emily Chen',
    email: 'emily@hrms.com',
    password: 'emp123',
    role: 'employee',
    department: 'Design',
    position: 'UI/UX Designer',
    phone: '+1 (555) 200-0002',
    avatar: '👩‍🎨',
    joinDate: '2021-06-22',
    salary: 72000,
    status: 'active',
  },
  {
    id: 'emp-3',
    name: 'Michael Brown',
    email: 'michael@hrms.com',
    password: 'emp123',
    role: 'employee',
    department: 'Marketing',
    position: 'Marketing Manager',
    phone: '+1 (555) 200-0003',
    avatar: '👨‍💼',
    joinDate: '2020-09-01',
    salary: 68000,
    status: 'active',
  },
  {
    id: 'emp-4',
    name: 'Sophia Martinez',
    email: 'sophia@hrms.com',
    password: 'emp123',
    role: 'employee',
    department: 'Finance',
    position: 'Financial Analyst',
    phone: '+1 (555) 200-0004',
    avatar: '👩‍💻',
    joinDate: '2022-01-12',
    salary: 65000,
    status: 'active',
  },
  {
    id: 'emp-5',
    name: 'David Lee',
    email: 'david@hrms.com',
    password: 'emp123',
    role: 'employee',
    department: 'Engineering',
    position: 'DevOps Engineer',
    phone: '+1 (555) 200-0005',
    avatar: '🧑‍💻',
    joinDate: '2022-04-18',
    salary: 82000,
    status: 'active',
  },
  {
    id: 'emp-6',
    name: 'Olivia Taylor',
    email: 'olivia@hrms.com',
    password: 'emp123',
    role: 'employee',
    department: 'Human Resources',
    position: 'HR Specialist',
    phone: '+1 (555) 200-0006',
    avatar: '👩',
    joinDate: '2021-11-05',
    salary: 58000,
    status: 'inactive',
  },
];

const defaultAttendance: AttendanceRecord[] = (() => {
  const records: AttendanceRecord[] = [];
  const employees = ['emp-1', 'emp-2', 'emp-3', 'emp-4', 'emp-5', 'emp-6'];
  const today = new Date();
  for (let d = 0; d < 15; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const dateStr = date.toISOString().split('T')[0];
    for (const empId of employees) {
      const statuses: AttendanceRecord['status'][] = ['present', 'present', 'present', 'late', 'present', 'half-day'];
      const status = d === 0 && empId === 'emp-6' ? 'absent' as const : statuses[Math.floor(Math.random() * statuses.length)];
      const checkInHour = status === 'late' ? 10 : 9;
      const checkInMin = Math.floor(Math.random() * 30);
      const hours = status === 'half-day' ? 4 : status === 'absent' ? 0 : 8 + Math.random();
      records.push({
        id: `att-${empId}-${dateStr}`,
        employeeId: empId,
        date: dateStr,
        checkIn: status === 'absent' ? '' : `${String(checkInHour).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')}`,
        checkOut: status === 'absent' ? '' : `${String(checkInHour + Math.floor(hours)).padStart(2, '0')}:${String(Math.floor(Math.random() * 59)).padStart(2, '0')}`,
        status,
        hoursWorked: Math.round(hours * 10) / 10,
      });
    }
  }
  return records;
})();

const defaultLeaves: LeaveRequest[] = [
  { id: 'lv-1', employeeId: 'emp-1', type: 'sick', startDate: '2024-12-20', endDate: '2024-12-22', reason: 'Flu and fever', status: 'approved', appliedOn: '2024-12-18' },
  { id: 'lv-2', employeeId: 'emp-2', type: 'annual', startDate: '2025-01-05', endDate: '2025-01-10', reason: 'Family vacation', status: 'pending', appliedOn: '2024-12-28' },
  { id: 'lv-3', employeeId: 'emp-3', type: 'casual', startDate: '2024-12-15', endDate: '2024-12-15', reason: 'Personal work', status: 'approved', appliedOn: '2024-12-12' },
  { id: 'lv-4', employeeId: 'emp-4', type: 'sick', startDate: '2025-01-02', endDate: '2025-01-03', reason: 'Dental surgery', status: 'pending', appliedOn: '2024-12-30' },
  { id: 'lv-5', employeeId: 'emp-5', type: 'annual', startDate: '2025-02-01', endDate: '2025-02-07', reason: 'International travel', status: 'pending', appliedOn: '2025-01-10' },
  { id: 'lv-6', employeeId: 'emp-1', type: 'casual', startDate: '2025-01-15', endDate: '2025-01-15', reason: 'Moving to new apartment', status: 'rejected', appliedOn: '2025-01-10' },
];

const defaultPayroll: PayrollRecord[] = (() => {
  const records: PayrollRecord[] = [];
  const employees = defaultUsers.filter(u => u.role === 'employee');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  for (const emp of employees) {
    for (let m = 0; m < 3; m++) {
      const now = new Date();
      const monthIndex = (now.getMonth() - m + 12) % 12;
      const year = now.getMonth() - m < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const basic = emp.salary / 12;
      const bonus = Math.floor(Math.random() * 500);
      const deductions = Math.floor(basic * 0.05);
      const tax = Math.floor(basic * 0.15);
      const net = basic + bonus - deductions - tax;
      records.push({
        id: `pay-${emp.id}-${year}-${monthIndex}`,
        employeeId: emp.id,
        month: months[monthIndex],
        year,
        basicSalary: Math.round(basic),
        bonus,
        deductions,
        tax,
        netSalary: Math.round(net),
        status: m === 0 ? 'pending' : 'paid',
        paidOn: m === 0 ? '' : `${year}-${String(monthIndex + 1).padStart(2, '0')}-28`,
      });
    }
  }
  return records;
})();

const defaultFiles: UploadedFile[] = [
  { id: 'file-1', employeeId: 'emp-1', name: 'resume_james.pdf', type: 'application/pdf', size: '245 KB', category: 'resume', uploadedOn: '2021-03-10' },
  { id: 'file-2', employeeId: 'emp-1', name: 'id_proof_james.jpg', type: 'image/jpeg', size: '1.2 MB', category: 'id-proof', uploadedOn: '2021-03-10' },
  { id: 'file-3', employeeId: 'emp-2', name: 'resume_emily.pdf', type: 'application/pdf', size: '198 KB', category: 'resume', uploadedOn: '2021-06-22' },
  { id: 'file-4', employeeId: 'emp-3', name: 'contract_michael.pdf', type: 'application/pdf', size: '512 KB', category: 'contract', uploadedOn: '2020-09-01' },
  { id: 'file-5', employeeId: 'emp-4', name: 'certificate_sophia.pdf', type: 'application/pdf', size: '389 KB', category: 'certificate', uploadedOn: '2022-01-12' },
];

const defaultAnnouncements: Announcement[] = [
  { id: 'ann-1', title: 'Holiday Notice', message: 'Office will remain closed on Dec 25th and Jan 1st for Christmas and New Year celebrations. Enjoy the holidays!', date: '2024-12-20', priority: 'high' },
  { id: 'ann-2', title: 'Annual Performance Review', message: 'Annual performance reviews will begin from January 15th. Please prepare your self-assessment forms.', date: '2025-01-05', priority: 'medium' },
  { id: 'ann-3', title: 'New Health Insurance Plan', message: 'We have partnered with a new health insurance provider. Check your email for enrollment details.', date: '2025-01-02', priority: 'medium' },
  { id: 'ann-4', title: 'Team Building Event', message: 'Join us for the quarterly team building event on Feb 10th at Central Park. Lunch will be provided.', date: '2025-01-20', priority: 'low' },
];

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function initializeData(): void {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    saveToStorage(STORAGE_KEYS.USERS, defaultUsers);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
    saveToStorage(STORAGE_KEYS.ATTENDANCE, defaultAttendance);
  }
  if (!localStorage.getItem(STORAGE_KEYS.LEAVES)) {
    saveToStorage(STORAGE_KEYS.LEAVES, defaultLeaves);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYROLL)) {
    saveToStorage(STORAGE_KEYS.PAYROLL, defaultPayroll);
  }
  if (!localStorage.getItem(STORAGE_KEYS.FILES)) {
    saveToStorage(STORAGE_KEYS.FILES, defaultFiles);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
    saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, defaultAnnouncements);
  }
}

// Users
export function getUsers(): User[] { return getFromStorage(STORAGE_KEYS.USERS, defaultUsers); }
export function saveUsers(users: User[]): void { saveToStorage(STORAGE_KEYS.USERS, users); }
export function addUser(user: User): void { const users = getUsers(); users.push(user); saveUsers(users); }
export function updateUser(user: User): void { const users = getUsers(); const i = users.findIndex(u => u.id === user.id); if (i >= 0) { users[i] = user; saveUsers(users); } }
export function deleteUser(id: string): void { saveUsers(getUsers().filter(u => u.id !== id)); }

// Auth
export function login(email: string, password: string): User | null {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (user) { saveToStorage(STORAGE_KEYS.CURRENT_USER, user); }
  return user || null;
}
export function getCurrentUser(): User | null { return getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null); }
export function logout(): void { localStorage.removeItem(STORAGE_KEYS.CURRENT_USER); }

// Attendance
export function getAttendance(): AttendanceRecord[] { return getFromStorage(STORAGE_KEYS.ATTENDANCE, defaultAttendance); }
export function saveAttendance(records: AttendanceRecord[]): void { saveToStorage(STORAGE_KEYS.ATTENDANCE, records); }
export function addAttendance(record: AttendanceRecord): void { const records = getAttendance(); records.push(record); saveAttendance(records); }

// Leaves
export function getLeaves(): LeaveRequest[] { return getFromStorage(STORAGE_KEYS.LEAVES, defaultLeaves); }
export function saveLeaves(leaves: LeaveRequest[]): void { saveToStorage(STORAGE_KEYS.LEAVES, leaves); }
export function addLeave(leave: LeaveRequest): void { const leaves = getLeaves(); leaves.push(leave); saveLeaves(leaves); }
export function updateLeaveStatus(id: string, status: LeaveRequest['status']): void {
  const leaves = getLeaves();
  const i = leaves.findIndex(l => l.id === id);
  if (i >= 0) { leaves[i].status = status; saveLeaves(leaves); }
}

// Payroll
export function getPayroll(): PayrollRecord[] { return getFromStorage(STORAGE_KEYS.PAYROLL, defaultPayroll); }
export function savePayroll(records: PayrollRecord[]): void { saveToStorage(STORAGE_KEYS.PAYROLL, records); }
export function updatePayrollStatus(id: string, status: PayrollRecord['status']): void {
  const records = getPayroll();
  const i = records.findIndex(r => r.id === id);
  if (i >= 0) { records[i].status = status; if (status === 'paid') records[i].paidOn = new Date().toISOString().split('T')[0]; savePayroll(records); }
}

// Files
export function getFiles(): UploadedFile[] { return getFromStorage(STORAGE_KEYS.FILES, defaultFiles); }
export function saveFiles(files: UploadedFile[]): void { saveToStorage(STORAGE_KEYS.FILES, files); }
export function addFile(file: UploadedFile): void { const files = getFiles(); files.push(file); saveFiles(files); }
export function deleteFile(id: string): void { saveFiles(getFiles().filter(f => f.id !== id)); }

// Announcements
export function getAnnouncements(): Announcement[] { return getFromStorage(STORAGE_KEYS.ANNOUNCEMENTS, defaultAnnouncements); }
export function saveAnnouncements(announcements: Announcement[]): void { saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, announcements); }
export function addAnnouncement(announcement: Announcement): void { const anns = getAnnouncements(); anns.push(announcement); saveAnnouncements(anns); }
export function deleteAnnouncement(id: string): void { saveAnnouncements(getAnnouncements().filter(a => a.id !== id)); }
