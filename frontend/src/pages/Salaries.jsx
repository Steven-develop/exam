import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getSalaries, createSalary, updateSalary, deleteSalary, getEmployees } from '../api';

const Salaries = () => {
    const [salaries, setSalaries] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSalary, setEditingSalary] = useState(null);
    const [formData, setFormData] = useState({
        employeeNumber: '',
        grossSalary: '',
        totalDeduction: '0',
        netSalary: '',
        monthOfPayment: ''
    });

    useEffect(() => {
        fetchSalaries();
        fetchEmployees();
    }, []);

    const fetchSalaries = async () => {
        try {
            const response = await getSalaries();
            setSalaries(response.data);
        } catch (err) {
            console.error('Error fetching salaries:', err);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await getEmployees();
            setEmployees(response.data);
        } catch (err) {
            console.error('Error fetching employees:', err);
        }
    };

    const calculateNetSalary = (gross, deduction) => {
        return (parseFloat(gross) - parseFloat(deduction)).toFixed(2);
    };

    const handleGrossChange = (value) => {
        const net = calculateNetSalary(value, formData.totalDeduction);
        setFormData({ ...formData, grossSalary: value, netSalary: net });
    };

    const handleDeductionChange = (value) => {
        const net = calculateNetSalary(formData.grossSalary, value);
        setFormData({ ...formData, totalDeduction: value, netSalary: net });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSalary) {
                await updateSalary(editingSalary.id, formData);
            } else {
                await createSalary(formData);
            }
            setIsModalOpen(false);
            resetForm();
            fetchSalaries();
        } catch (err) {
            console.error('Error saving salary:', err);
            alert(err.response?.data?.error || 'Failed to save salary record');
        }
    };

    const handleEdit = (salary) => {
        setEditingSalary(salary);
        setFormData({
            employeeNumber: salary.employeeNumber,
            grossSalary: salary.grossSalary,
            totalDeduction: salary.totalDeduction,
            netSalary: salary.netSalary,
            monthOfPayment: salary.monthOfPayment.split('T')[0]
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this salary record?')) {
            try {
                await deleteSalary(id);
                fetchSalaries();
            } catch (err) {
                console.error('Error deleting salary:', err);
                alert(err.response?.data?.error || 'Failed to delete salary record');
            }
        }
    };

    const resetForm = () => {
        setEditingSalary(null);
        setFormData({
            employeeNumber: '',
            grossSalary: '',
            totalDeduction: '0',
            netSalary: '',
            monthOfPayment: ''
        });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Salary Records</h1>
                    <button
                        onClick={() => {
                            resetForm();
                            setIsModalOpen(true);
                        }}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
                    >
                        + Add Salary
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Salary</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deduction</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {salaries.map((salary) => (
                                <tr key={salary.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {salary.firstName} {salary.lastName} ({salary.employeeNumber})
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(salary.monthOfPayment).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        RWF{parseFloat(salary.grossSalary).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        RWF{parseFloat(salary.totalDeduction).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                        RWF{parseFloat(salary.netSalary).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => handleEdit(salary)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(salary.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4">{editingSalary ? 'Edit Salary' : 'Add Salary'}</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee*</label>
                                    <select
                                        value={formData.employeeNumber}
                                        onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        required
                                        disabled={!!editingSalary}
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp.employeeNumber} value={emp.employeeNumber}>
                                                {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Month of Payment*</label>
                                    <input
                                        type="month"
                                        value={formData.monthOfPayment}
                                        onChange={(e) => setFormData({ ...formData, monthOfPayment: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gross Salary*</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.grossSalary}
                                        onChange={(e) => handleGrossChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Deduction</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.totalDeduction}
                                        onChange={(e) => handleDeductionChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Net Salary*</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.netSalary}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                    >
                                        {editingSalary ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Salaries;