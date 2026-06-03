import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getPositions, createPosition, updatePosition, deletePosition } from '../api';

const Positions = () => {
    const [positions, setPositions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPos, setEditingPos] = useState(null);
    const [formData, setFormData] = useState({
        positionCode: '',
        positionName: '',
        description: '',
        baseSalary: ''
    });

    useEffect(() => {
        fetchPositions();
    }, []);

    const fetchPositions = async () => {
        try {
            const response = await getPositions();
            setPositions(response.data);
        } catch (err) {
            console.error('Error fetching positions:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPos) {
                await updatePosition(editingPos.positionCode, formData);
            } else {
                await createPosition(formData);
            }
            setIsModalOpen(false);
            resetForm();
            fetchPositions();
        } catch (err) {
            console.error('Error saving position:', err);
            alert(err.response?.data?.error || 'Failed to save position');
        }
    };

    const handleEdit = (pos) => {
        setEditingPos(pos);
        setFormData({
            positionCode: pos.positionCode,
            positionName: pos.positionName,
            description: pos.description || '',
            baseSalary: pos.baseSalary || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (positionCode) => {
        if (window.confirm('Are you sure you want to delete this position?')) {
            try {
                await deletePosition(positionCode);
                fetchPositions();
            } catch (err) {
                console.error('Error deleting position:', err);
                alert(err.response?.data?.error || 'Failed to delete position');
            }
        }
    };

    const resetForm = () => {
        setEditingPos(null);
        setFormData({ positionCode: '', positionName: '', description: '', baseSalary: '' });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Positions</h1>
                    <button
                        onClick={() => {
                            resetForm();
                            setIsModalOpen(true);
                        }}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                        + Add Position
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {positions.map((pos) => (
                        <div key={pos.positionCode} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{pos.positionName}</h3>
                                    <p className="text-gray-600 mt-1">Code: {pos.positionCode}</p>
                                    {pos.baseSalary && (
                                        <p className="text-green-600 font-semibold mt-2">Base Salary: RWf{parseFloat(pos.baseSalary).toLocaleString()}</p>
                                    )}
                                    {pos.description && (
                                        <p className="text-gray-500 text-sm mt-2">{pos.description}</p>
                                    )}
                                </div>
                                <div className="space-x-2">
                                    <button
                                        onClick={() => handleEdit(pos)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(pos.positionCode)}
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
                            <h2 className="text-2xl font-bold mb-4">{editingPos ? 'Edit Position' : 'Add Position'}</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Position Code*</label>
                                    <input
                                        type="text"
                                        value={formData.positionCode}
                                        onChange={(e) => setFormData({ ...formData, positionCode: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                        disabled={!!editingPos}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Position Name*</label>
                                    <input
                                        type="text"
                                        value={formData.positionName}
                                        onChange={(e) => setFormData({ ...formData, positionName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.baseSalary}
                                        onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                    >
                                        {editingPos ? 'Update' : 'Create'}
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

export default Positions;