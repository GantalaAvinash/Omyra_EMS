// services/api.js
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});


export const registerIntern = (data) => API.post('/interns/register', data)
export const loginIntern = (data) => API.post('/interns/login', data);
export const updateInternProfile = (internId,data) => API.put(`/interns/${internId}`, data);
export const fetchIntern = (internId) => API.get(`/interns/${internId}`)
export const markAttendance = (data) => API.post('/attendance/mark', data);
export const fetchInternAttendace = (id) => API.get(`/attendance/${id}`);
export const fetchInternDailyTask = (data) => API.get(`/admin/tasks/${data.designation}/${data.date}`);




// ======================
// Authentication
// ======================

/** Admin Login */
export const adminLogin = (data) => API.post('/admin/login', data);
// Admin Register
export const createAdmin = (data) => API.post('admin/create-admin', data);

export const assignTask = (data) => API.post('admin/tasks', data);
// Fetch admins
export const fetchAdmins = () => API.get('admin/');
/** Admin Password Update */
export const updateAdminPassword = (data) => API.patch(`/admin/password/${data._id}`,data)

// ======================
// Intern Management
// ======================

/** Fetch All Interns */
export const fetchInterns = () => API.get('/admin/interns');
export const fetchAllDailyTask = () => API.get('/admin/tasks');

/** Fetch All Interns */
export const fetchAttendance = () => API.get('/admin/attendance');

/** Fetch All Interns */
export const fetchInternAttendance = (id) => API.get(`/admin/attendance/${id}`);

/** Get Intern Details */
export const fetchInternDetails = (id) => API.get(`/admin/interns/${id}`);

/** Create a New Intern */
export const createIntern = (data) => API.post('/admin/intern/register', data);

/** Update Intern Details */
export const updateIntern = (id, data) => API.put(`/admin/interns/${id}`, data);

export const updateInternStatus = (id, data) => API.put(`admin/interns/status/${id}`, data);

/** Delete an Intern */
export const deleteIntern = (id) => API.delete(`/admin/interns/${id}`);

/** Update Intern Password */
export const updateInternPassword = (id, data) => API.put(`/admin/interns/${id}/password`, data);

export const fetchWorkingHours = (month, year) => API.get(`/admin/working-hours/?month=${month}&year=${year}`);




// ======================
// Attendance Management
// ======================

/** Generate Attendance Report */
export const fetchAttendanceReport = () => API.get('/admin/report');


// ======================
// Dashboard Metrics
// ======================

/** Fetch Dashboard Metrics */
export const fetchDashboardMetrics = () => API.get('/admin/dashboard');

/** Fetch Recent Activities */
export const fetchRecentActivities = () => API.get('/admin/recent-activities');

export default API;