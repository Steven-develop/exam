import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <Link to="/dashboard" className="text-xl font-bold text-gray-800">
                            PMS
                        </Link>
                        <div className="hidden md:flex space-x-4">
                            <Link to="/employees" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                Employees
                            </Link>
                            <Link to="/departments" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium">
                                Departments
                            </Link>
                            <Link to="/positions" className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium">
                                Positions
                            </Link>
                            <Link to="/salaries" className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium">
                                Salaries
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700">Hello, {username}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;