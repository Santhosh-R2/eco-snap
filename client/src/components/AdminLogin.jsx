import React, { useState } from 'react';
import {
    Box,
    Paper,
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
import { toast, Toaster } from 'react-hot-toast';
import axios from '../baseUrl';
import { styles } from '../styles/adminLoginStyles';

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('/admin/login', credentials);

            if (response.data) {
                toast.success('Login Successful!');
                localStorage.setItem('adminToken', response.data.token);
                // Navigate to dashboard logic here
                // window.location.href = '/dashboard'; 
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={styles.container}>
            <Toaster position="top-right" />
            <Paper elevation={3} sx={styles.paper}>
                <Box sx={styles.logo}>
                    <AdminPanelSettings sx={{ fontSize: 35, color: '#1a237e' }} />
                </Box>

                <Box>
                    <Typography variant="h5" sx={styles.title}>
                        Admin Login
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="center">
                        Welcome back! Please login to your account.
                    </Typography>
                </Box>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={credentials.email}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        InputProps={{
                            sx: { borderRadius: '8px' }
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={credentials.password}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        InputProps={{
                            sx: { borderRadius: '8px' },
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={handleClickShowPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        sx={{
                            ...styles.button,
                            backgroundColor: '#1a237e',
                            '&:hover': {
                                backgroundColor: '#0d47a1',
                            }
                        }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default AdminLogin;
