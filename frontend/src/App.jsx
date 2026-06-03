import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Positions from './pages/Position';
import Salaries from './pages/Salaries';

function App() {
    const isAuthenticated = !!localStorage.getItem('token');

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={
                    isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
                } />
                <Route path="/employees" element={
                    isAuthenticated ? <Employees /> : <Navigate to="/login" />
                } />
                <Route path="/departments" element={
                    isAuthenticated ? <Departments /> : <Navigate to="/login" />
                } />
                <Route path="/positions" element={
                    isAuthenticated ? <Positions /> : <Navigate to="/login" />
                } />
                <Route path="/salaries" element={
                    isAuthenticated ? <Salaries /> : <Navigate to="/login" />
                } />
                <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Router>
    );
}

export default App;