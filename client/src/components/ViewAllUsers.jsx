import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Switch,
    CircularProgress,
    Tooltip,
    Typography
} from '@mui/material';
import { Search } from '@mui/icons-material';
import axios from '../baseUrl';
import toast from 'react-hot-toast';

import '../styles/viewAllUsers.css';

const ViewAllUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/admin/users');
            console.log(response);
            const data = Array.isArray(response.data) ? response.data : (response.data.users || []);
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load user database');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleStatusChange = async (id, currentStatus) => {
        const updatedUsers = users.map(user => 
            user._id === id ? { ...user, isActive: !currentStatus } : user
        );
        setUsers(updatedUsers);

        try {
            await axios.put(`/admin/user/${id}/status`, { isActive: !currentStatus });
            toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
            setUsers(users); 
        }
    };

    const stringToColor = (string) => {
        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00ffffff).toString(16).toUpperCase();
        return '#' + '00000'.substring(0, 6 - c.length) + c;
    };

    const filteredUsers = users.filter(user =>
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="loading-wrapper">
                <CircularProgress style={{ color: '#103926' }} />
                <p style={{ marginTop: '1rem' }}>Loading User Data...</p>
            </div>
        );
    }

    return (
        <div className="users-container">
            <div className="users-header">
                <div className="users-title">
                    <h2>Citizen Management</h2>
                    <p className="users-subtitle">Monitor and manage registered citizens.</p>
                </div>

                <div className="user-search-box">
                    <Search sx={{ color: '#9ca3af' }} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="search-input-field"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <TableContainer component={Paper} className="users-table-card" elevation={0}>
                <Table sx={{ minWidth: 750 }} aria-label="users table">
                    <TableHead className="users-table-head">
                        <TableRow>
                            <TableCell className="head-cell">User Profile</TableCell>
                            <TableCell className="head-cell">Contact Info</TableCell>
                            <TableCell className="head-cell">Address</TableCell>
                            <TableCell className="head-cell">Status</TableCell>
                            <TableCell className="head-cell" align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <TableRow key={user._id} className="table-row-hover">
                                    <TableCell className="data-cell">
                                        <div className="user-profile-group">
                                            <Avatar 
                                                src={user.profileImage} 
                                                alt={user.name}
                                                className="user-avatar"
                                                sx={{ bgcolor: stringToColor(user.name || 'U') }}
                                            >
                                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                            </Avatar>
                                            <div className="user-text-info">
                                                <h4>{user.name}</h4>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="data-cell">
                                        <div className="contact-main">{user.email}</div>
                                    </TableCell>

                                    <TableCell className="data-cell">
                                        <Tooltip title={user.address || "No Address Provided"}>
                                            <div className="address-text">
                                                {user.address || 'N/A'}
                                            </div>
                                        </Tooltip>
                                    </TableCell>

                                    <TableCell className="data-cell">
                                        <div className={`status-pill ${user.isActive ? 'active' : 'inactive'}`}>
                                            <span className="status-dot"></span>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </div>
                                    </TableCell>

                                    <TableCell className="data-cell" align="center">
                                        <Tooltip title={user.isActive ? "Deactivate User" : "Activate User"}>
                                            <Switch
                                                checked={user.isActive}
                                                onChange={() => handleStatusChange(user._id, user.isActive)}
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                                        color: '#103926',
                                                    },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                        backgroundColor: '#103926',
                                                    },
                                                }}
                                            />
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                    <Typography color="textSecondary">No users found.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default ViewAllUsers;