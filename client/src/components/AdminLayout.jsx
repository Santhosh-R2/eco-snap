import React, { useState } from 'react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    CssBaseline,
    Menu,
    MenuItem,
    Avatar,
    Tooltip
} from '@mui/material';
import {
    Menu as MenuIcon,
    DashboardOutlined,
    PeopleOutline,
    DeleteOutline,
    VolunteerActivismOutlined,
    AssignmentOutlined,
    PaymentOutlined,
    ReportProblemOutlined,
    Logout,
    CleaningServices 
} from '@mui/icons-material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

import '../styles/adminLayoutStyles.css';

const drawerWidth = 260;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardOutlined />, path: '/admin/dashboard' },
    { text: 'Employees', icon: <PeopleOutline />, path: '/admin/employees' },
    { text: 'Users', icon: <PeopleOutline />, path: '/admin/users' },
    { text: 'Waste Requests', icon: <DeleteOutline />, path: '/admin/waste-requests' },
    { text: 'Donations', icon: <VolunteerActivismOutlined />, path: '/admin/donations' },
    { text: 'Tasks', icon: <AssignmentOutlined />, path: '/admin/tasks' },
    { text: 'Payments', icon: <PaymentOutlined />, path: '/admin/payments' },
    { text: 'Complaints', icon: <ReportProblemOutlined />, path: '/admin/complaints' },
];

const AdminLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/');
    };

    const drawer = (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="sidebar-header">
                <div className="logo-container">
                    <CleaningServices sx={{ color: '#103926', fontSize: 28 }} />
                    <Typography variant="h6" className="logo-text">
                        Eco Snap
                    </Typography>
                </div>
            </div>

            <List className="nav-list">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <ListItemIcon className="nav-icon">
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    className="nav-text"
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <div className="logout-container">
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout} className="logout-item">
                        <ListItemIcon sx={{ minWidth: '40px', color: '#ef4444' }}>
                            <Logout fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Sign Out"
                            primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                        />
                    </ListItemButton>
                </ListItem>
            </div>
        </div>
    );

    return (
        <Box className="layout-root">
            <CssBaseline />

            <AppBar position="fixed" className="admin-appbar" elevation={0}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        className="mobile-toggle"
                        sx={{ display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }} className="header-title">
                        {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
                    </Typography>

                    <div>
                        <Tooltip title="Account Settings">
                            <IconButton
                                onClick={handleMenu}
                                className="profile-btn"
                                size="small"
                            >
                                <Avatar
                                    sx={{ width: 32, height: 32, bgcolor: '#103926', fontSize: '0.9rem' }}
                                >
                                    A
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            PaperProps={{
                                elevation: 0,
                                sx: {
                                    overflow: 'visible',
                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                                    mt: 1.5,
                                    borderRadius: '12px',
                                    minWidth: '150px'
                                },
                            }}
                        >
                            <MenuItem onClick={handleLogout} dense sx={{ color: 'error.main' }}>Logout</MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                    }}
                    PaperProps={{ className: 'sidebar-paper' }}
                >
                    {drawer}
                </Drawer>

                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                    }}
                    open
                    PaperProps={{ className: 'sidebar-paper' }}
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box component="main" className="main-content">
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminLayout;