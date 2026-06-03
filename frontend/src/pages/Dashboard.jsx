import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, Briefcase, DollarSign } from 'lucide-react';
import Navbar from '../components/Navbar';

const Dashboard = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    const cards = [
        { 
            title: 'Employees', 
            description: 'Manage employee records', 
            icon: Users, 
            path: '/employees', 
            color: 'bg-blue-500',
            bgHover: 'hover:bg-blue-600'
        },
        { 
            title: 'Departments', 
            description: 'Manage departments', 
            icon: Building2, 
            path: '/departments', 
            color: 'bg-green-500',
            bgHover: 'hover:bg-green-600'
        },
        { 
            title: 'Positions', 
            description: 'Manage job positions', 
            icon: Briefcase, 
            path: '/positions', 
            color: 'bg-purple-500',
            bgHover: 'hover:bg-purple-600'
        },
        { 
            title: 'Salaries', 
            description: 'Manage salary records', 
            icon: DollarSign, 
            path: '/salaries', 
            color: 'bg-orange-500',
            bgHover: 'hover:bg-orange-600'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Welcome, {username}!</h1>
                    <p className="text-gray-600 mt-2">Manage your organization's personnel data efficiently</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.title}
                                onClick={() => navigate(card.path)}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
                            >
                                <div className={`${card.color} p-5 text-white transition-colors ${card.bgHover}`}>
                                    <Icon className="w-10 h-10 mb-3" strokeWidth={1.5} />
                                    <h3 className="text-xl font-bold">{card.title}</h3>
                                </div>
                                <div className="p-5">
                                    <p className="text-gray-600">{card.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;