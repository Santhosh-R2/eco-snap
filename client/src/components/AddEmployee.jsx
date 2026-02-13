import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { CloudUpload, Visibility, VisibilityOff } from '@mui/icons-material';
import axios from '../baseUrl';
import toast from 'react-hot-toast';

import '../styles/addEmployee.css';

const AddEmployee = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const [showPassword, setShowPassword] = useState(false);

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

    const [errors, setErrors] = useState({});

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case "name":
                if (!/^[A-Za-z\s]+$/.test(value)) error = "Name must contain only alphabets.";
                break;
            case "email":
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email format.";
                break;
            case "phone":
                if (!/^\d{10}$/.test(value)) error = "Phone number must be exactly 10 digits.";
                break;
            case "wardNumber":
                if (!/^\d+$/.test(value)) error = "Ward number must be numeric.";
                break;
            case "employeeId":
                if (!/^[A-Za-z0-9-]+$/.test(value)) error = "Invalid format (Alphanumeric & hyphens only).";
                break;
            case "password":
                if (value.length < 6) error = "Password must be at least 6 characters.";
                break;
            default:
                break;
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if ((name === 'phone' || name === 'wardNumber') && !/^\d*$/.test(value)) return;
        if (name === 'name' && !/^[A-Za-z\s]*$/.test(value)) return;

        setFormData({ ...formData, [name]: value });

        const errorMsg = validateField(name, value);
        setErrors({ ...errors, [name]: errorMsg });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast.error("Please upload a valid image file.");
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            if (key !== 'role' && key !== 'profileImage' && key !== 'address') {
                const error = validateField(key, formData[key]);
                if (error) newErrors[key] = error;
            }
        });
        
        ['name', 'email', 'password', 'phone', 'employeeId', 'wardNumber'].forEach(field => {
            if (!formData[field]) newErrors[field] = `${field} is required`;
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Please fix the errors in the form.");
            return;
        }

        setLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (imageFile) data.append('profileImage', imageFile);

        try {
            await axios.post('/admin/employee', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Employee created successfully!');
            navigate('/admin/employees'); 
        } catch (error) {
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
                    
                    <div className="add-employee-image-section">
                        <div className="add-employee-avatar-wrapper">
                            <img 
                                src={imagePreview || "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"} 
                                alt="Profile Preview" 
                                className="add-employee-avatar"
                            />
                        </div>
                        <label className="add-employee-upload-btn">
                            <CloudUpload fontSize="small" />
                            Upload Photo
                            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                        </label>
                    </div>

                    <div className="add-employee-form-grid">
                        <div className="add-employee-form-group">
                            <label className="add-employee-label">Full Name <span style={{color:'red'}}>*</span></label>
                            <input 
                                type="text" 
                                name="name" 
                                className={`add-employee-input ${errors.name ? 'input-error-add-emp' : ''}`} 
                                placeholder="Enter full name" 
                                value={formData.name} 
                                onChange={handleChange} 
                            />
                            {errors.name && <span className="error-text-add-emp">{errors.name}</span>}
                        </div>

                        <div className="add-employee-form-group">
                            <label className="add-employee-label">Email Address <span style={{color:'red'}}>*</span></label>
                            <input 
                                type="email" 
                                name="email" 
                                className={`add-employee-input ${errors.email ? 'input-error-add-emp' : ''}`} 
                                placeholder="employee@ecosnap.com" 
                                value={formData.email} 
                                onChange={handleChange} 
                            />
                            {errors.email && <span className="error-text-add-emp">{errors.email}</span>}
                        </div>

                        <div className="add-employee-form-group">
                            <label className="add-employee-label">Password <span style={{color:'red'}}>*</span></label>
                            <div className="password-input-wrapper">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="password" 
                                    className={`add-employee-input ${errors.password ? 'input-error-add-emp' : ''}`} 
                                    placeholder="Create password" 
                                    value={formData.password} 
                                    onChange={handleChange}
                                />
                                <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                </span>
                            </div>
                            {errors.password && <span className="error-text-add-emp">{errors.password}</span>}
                        </div>

                        <div className="add-employee-form-group">
                            <label className="add-employee-label">Phone Number <span style={{color:'red'}}>*</span></label>
                            <input 
                                type="tel" 
                                name="phone" 
                                maxLength="10" 
                                className={`add-employee-input ${errors.phone ? 'input-error-add-emp' : ''}`} 
                                placeholder="9876543210" 
                                value={formData.phone} 
                                onChange={handleChange} 
                            />
                            {errors.phone && <span className="error-text-add-emp">{errors.phone}</span>}
                        </div>

                        <div className="add-employee-form-group">
                            <label className="add-employee-label">Employee ID <span style={{color:'red'}}>*</span></label>
                            <input 
                                type="text" 
                                name="employeeId" 
                                className={`add-employee-input ${errors.employeeId ? 'input-error-add-emp' : ''}`} 
                                placeholder="EMP-12345" 
                                value={formData.employeeId} 
                                onChange={handleChange} 
                            />
                            {errors.employeeId && <span className="error-text-add-emp">{errors.employeeId}</span>}
                        </div>

                        <div className="add-employee-form-group">
                            <label className="add-employee-label">Assigned Ward <span style={{color:'red'}}>*</span></label>
                            <input 
                                type="text" 
                                name="wardNumber" 
                                className={`add-employee-input ${errors.wardNumber ? 'input-error-add-emp' : ''}`} 
                                placeholder="e.g. 12" 
                                value={formData.wardNumber} 
                                onChange={handleChange} 
                            />
                            {errors.wardNumber && <span className="error-text-add-emp">{errors.wardNumber}</span>}
                        </div>

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
                        <button type="button" className="add-employee-btn-cancel" onClick={() => navigate('/admin/employees')}>
                            Cancel
                        </button>
                        <button type="submit" className="add-employee-btn-submit" disabled={loading}>
                            {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Employee'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEmployee;