import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../api';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [formData, setFormData] = useState({
        departmentCode: '',
        departmentName: ''
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await getDepartments();
            setDepartments(response.data);
        } catch (err) {
            console.error('Error fetching departments:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDept) {
                await updateDepartment(editingDept.departmentCode, formData);
            } else {
                await createDepartment(formData);
            }
            setIsModalOpen(false);
            resetForm();
            fetchDepartments();
        } catch (err) {
            console.error('Error saving department:', err);
            alert(err.response?.data?.error || 'Failed to save department');
        }
    };

    const handleEdit = (dept) => {
        setEditingDept(dept);
        setFormData({
            departmentCode: dept.departmentCode,
            departmentName: dept.departmentName
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (departmentCode) => {
        if (window.confirm('Are you sure you want to delete this department?')) {
            try {
                await deleteDepartment(departmentCode);
                fetchDepartments();
            } catch (err) {
                console.error('Error deleting department:', err);
                alert(err.response?.data?.error || 'Failed to delete department');
            }
        }
    };

    const resetForm = () => {
        setEditingDept(null);
        setFormData({ departmentCode: '', departmentName: '' });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Departments</h1>
                    <button
                        onClick={() => {
                            resetForm();
                            setIsModalOpen(true);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        + Add Department
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.map((dept) => (
                        <div key={dept.departmentCode} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{dept.departmentName}</h3>
                                    <p className="text-gray-600 mt-1">Code: {dept.departmentCode}</p>
                                </div>
                                <div className="space-x-2">
                                    <button
                                        onClick={() => handleEdit(dept)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(dept.departmentCode)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-4">{editingDept ? 'Edit Department' : 'Add Department'}</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department Code*</label>
                                    <input
                                        type="text"
                                        value={formData.departmentCode}
                                        onChange={(e) => setFormData({ ...formData, departmentCode: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                        disabled={!!editingDept}
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department Name*</label>
                                    <input
                                        type="text"
                                        value={formData.departmentName}
                                        onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
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
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        {editingDept ? 'Update' : 'Create'}
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

export default Departments;