import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth APIs
export const register = (username, password) => api.post('/register', { username, password });
export const login = (username, password) => api.post('/login', { username, password });

// Employee APIs
export const getEmployees = () => api.get('/employees');
export const createEmployee = (employee) => api.post('/employees', employee);
export const updateEmployee = (employeeNumber, employee) => api.put(`/employees/${employeeNumber}`, employee);
export const deleteEmployee = (employeeNumber) => api.delete(`/employees/${employeeNumber}`);

// Department APIs
export const getDepartments = () => api.get('/departments');
export const createDepartment = (department) => api.post('/departments', department);
export const updateDepartment = (departmentCode, department) => api.put(`/departments/${departmentCode}`, department);
export const deleteDepartment = (departmentCode) => api.delete(`/departments/${departmentCode}`);

// Position APIs
export const getPositions = () => api.get('/positions');
export const createPosition = (position) => api.post('/positions', position);
export const updatePosition = (positionCode, position) => api.put(`/positions/${positionCode}`, position);
export const deletePosition = (positionCode) => api.delete(`/positions/${positionCode}`);

// Salary APIs
export const getSalaries = () => api.get('/salaries');
export const createSalary = (salary) => api.post('/salaries', salary);
export const updateSalary = (id, salary) => api.put(`/salaries/${id}`, salary);
export const deleteSalary = (id) => api.delete(`/salaries/${id}`);

export default api;