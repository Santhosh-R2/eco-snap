import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import axios from '../baseUrl';
import toast from 'react-hot-toast';

import '../styles/addEmployee.css';

const AddEmployee = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        phone: '',
        address: '',
        wardNumber: '',
        employeeId: '',
    });

    // Image State
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('role', 'employee'); // Force role
        data.append('phone', formData.phone);
        data.append('address', formData.address);
        data.append('wardNumber', formData.wardNumber);
        data.append('employeeId', formData.employeeId);
        
        if (imageFile) {
            data.append('profileImage', imageFile);
        }

        try {
            await axios.post('/users/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Employee created successfully!');
            navigate('/admin/employees'); // Redirect back to list
        } catch (error) {
            console.error('Registration error:', error);
            const msg = error.response?.data?.message || 'Failed to create employee';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-employee-container">
            <div className="add-employee-header">
                <h1 className="add-employee-title">Add New Employee</h1>
                <p className="add-employee-subtitle">Create a new account for a staff member.</p>
            </div>

            <div className="add-employee-card">
                <form onSubmit={handleSubmit}>
                    
                    {/* Image Upload */}
                    <div className="add-employee-image-section">
                        <div className="add-employee-avatar-wrapper">
                            <img 
                                src={imagePreview || "https://via.placeholder.com/150?text=Upload"} 
                                alt="Profile Preview" 
                                className="add-employee-avatar"
                            />
                        </div>
                        <label className="add-employee-upload-btn">
                            <CloudUpload fontSize="small" />
                            Upload Photo
                            <input 
                                type="file" 
                                accept="image/*" 
                                hidden 
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>

                    <div className="add-employee-form-grid">
                        {/* Name */}
                        <div className="add-employee-form-group">
                            <label className="add-employee-label">Full Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                className="add-employee-input"
                                placeholder="Enter full name"
                                value={formData.name} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        {/* Email */}
                        <div className="add-employee-form-group">
                            <label className="add-employee-label">Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                className="add-employee-input"
                                placeholder="employee@ecosnap.com"
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        {/* Password */}
                        <div className="add-employee-form-group">
                            <label className="add-employee-label">Password</label>
                            <input 
                                type="password" 
                                name="password" 
                                className="add-employee-input"
                                placeholder="Create a secure password"
                                value={formData.password} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        {/* Phone */}
                        <div className="add-employee-form-group">
                            <label className="add-employee-label">Phone Number</label>
                            <input 
                                type="tel" 
                                name="phone" 
                                className="add-employee-input"
                                placeholder="+91 98765 43210"
                                value={formData.phone} 
                                onChange={handleChange} 
                            />
                        </div>

                        {/* Employee ID */}
                        <div className="add-employee-form-group">
                            <label className="add-employee-label">Employee ID</label>
                            <input 
                                type="text" 
                                name="employeeId" 
                                className="add-employee-input"
                                placeholder="EMP-001"
                                value={formData.employeeId} 
                                onChange={handleChange} 
                            />
                        </div>

                         {/* Ward Number */}
                         <div className="add-employee-form-group">
                            <label className="add-employee-label">Assigned Ward</label>
                            <input 
                                type="number" 
                                name="wardNumber" 
                                className="add-employee-input"
                                placeholder="e.g. 12"
                                value={formData.wardNumber} 
                                onChange={handleChange} 
                            />
                        </div>

                        {/* Address */}
                        <div className="add-employee-form-group add-employee-full-width">
                            <label className="add-employee-label">Address</label>
                            <textarea 
                                name="address" 
                                className="add-employee-input"
                                placeholder="Residential Address"
                                rows="3"
                                value={formData.address} 
                                onChange={handleChange} 
                                style={{ resize: 'none' }}
                            ></textarea>
                        </div>
                    </div>

                    <div className="add-employee-actions">
                        <button 
                            type="button" 
                            className="add-employee-btn-cancel"
                            onClick={() => navigate('/admin/employees')}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="add-employee-btn-submit"
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Employee'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddEmployee;