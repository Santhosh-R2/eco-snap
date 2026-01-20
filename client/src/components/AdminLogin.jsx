import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    InputAdornment,
    IconButton,
    CircularProgress
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    AdminPanelSettings
} from '@mui/icons-material';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import { toast, Toaster } from 'react-hot-toast';
import gsap from 'gsap';
import axios from '../baseUrl';
import eco from '../assets/eco.jpg';
import '../styles/adminLoginStyles.css';
import { useNavigate } from 'react-router-dom';
const AdminLogin = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const navRef = useRef(null);
    const leftPanelRef = useRef(null);
    const rightPanelRef = useRef(null);
    const formRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo(navRef.current,
            { y: -100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1 }
        )
        .fromTo(leftPanelRef.current, 
            { x: '-10%', opacity: 0 },
            { x: '0%', opacity: 1, duration: 1.2 },
            "-=0.8"
        )
        .fromTo(rightPanelRef.current,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 1 },
            "-=1"
        )
        .fromTo(textRef.current.children,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.2 },
            "-=0.5"
        )
        .fromTo(formRef.current,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8 },
            "-=0.6"
        );
    }, []);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('/admin/login', credentials);
            if (response.data) {
                toast.success('Login Successful!');
               navigate('/admin/dashboard');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-layout">
            <Toaster position="top-center" />

           
            <div className="split-container">
                <div className="left-panel" ref={leftPanelRef}>
                    <div className="brand-content" ref={textRef}>
                        <div className="tagline-badge">Sustainable Future</div>
                        
                        <Typography variant="h2" className="brand-title">
                            Revolutionizing <br/>
                            <span className="highlight-text">Eco Management</span>
                        </Typography>
                        
                        <Typography variant="body1" className="brand-desc">
                            Access the Eco Snap command center to monitor environmental metrics, 
                            manage waste disposal data, and oversee the green initiative ecosystem.
                        </Typography>
                        
                        <div className="image-card-container">
                           <img 
                                src={eco}
                                alt="Eco Snap Environment" 
                                className="project-image"
                           />
                           <div className="image-overlay"></div>
                        </div>
                    </div>
                </div>

                <div className="right-panel" ref={rightPanelRef}>
                    <div className="login-wrapper" ref={formRef}>
                        
                        <div className="form-header">
                            <div className="icon-circle">
                                <AdminPanelSettings sx={{ fontSize: 32, color: '#103926' }} />
                            </div>
                            <div>
                                <Typography variant="h5" className="form-title">
                                    Welcome Back
                                </Typography>
                                <Typography variant="body2" className="form-subtitle">
                                    Enter your details to access your account.
                                </Typography>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="input-group">
                                <label>Email Address</label>
                                <TextField
                                    fullWidth
                                    placeholder="admin@ecosnap.com"
                                    name="email"
                                    type="email"
                                    value={credentials.email}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    className="custom-input"
                                    InputProps={{
                                        sx: { borderRadius: '12px', backgroundColor: '#f9fafb' }
                                    }}
                                />
                            </div>

                            <div className="input-group">
                                <label>Password</label>
                                <TextField
                                    fullWidth
                                    placeholder="••••••••"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={credentials.password}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    className="custom-input"
                                    InputProps={{
                                        sx: { borderRadius: '12px', backgroundColor: '#f9fafb' },
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleClickShowPassword} edge="end">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </div>

                            <div className="form-footer-actions">
                                <Typography variant="body2" className="forgot-pass">
                                    Forgot Password?
                                </Typography>
                            </div>

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                className="submit-btn"
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;