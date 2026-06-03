// src/components/EmployeeForm.jsx
import React, { useState, useEffect } from 'react';

export default function EmployeeForm({ onSubmit, initialData, departments, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    position: '',
    telephone: '',
    gender: 'Male',
    hiredDate: '',
    departmentCode: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        address: initialData.address || '',
        position: initialData.position || '',
        telephone: initialData.telephone || '',
        gender: initialData.gender || 'Male',
        hiredDate: initialData.hiredDate ? initialData.hiredDate.split('T')[0] : '',
        departmentCode: initialData.departmentCode || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name *</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name *</label>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Position</label>
          <input type="text" name="position" value={formData.position} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Telephone</label>
          <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender *</label>
          <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Hired Date *</label>
          <input type="date" name="hiredDate" value={formData.hiredDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <select name="departmentCode" value={formData.departmentCode} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept.departmentCode} value={dept.departmentCode}>{dept.departmentName}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
      </div>
    </form>
  );
}