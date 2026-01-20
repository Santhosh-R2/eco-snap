import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Tooltip,
    MenuItem,
    Select,
    FormControl
} from '@mui/material';
import {
    CheckCircle,
    Schedule,
    Error,
    Autorenew,
    Search,
    DeleteOutline,
    VolunteerActivism,
    HelpOutline
} from '@mui/icons-material';
import axios from '../baseUrl';
import toast from 'react-hot-toast';

import '../styles/Tasks.css';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchTasks = async () => {
        try {
            const response = await axios.get('/tasks');
            console.log("Tasks Data:", response.data); 
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle fontSize="small" />;
            case 'assigned': return <Schedule fontSize="small" />;
            case 'in-progress': return <Autorenew fontSize="small" />;
            case 'failed': return <Error fontSize="small" />;
            default: return <HelpOutline fontSize="small" />;
        }
    };

    const formatStatusClass = (status) => {
        return status ? `status-${status.replace('-', '')}` : 'status-unknown';
    };

    const filteredTasks = tasks.filter(task => {
        const isWaste = !!task.requestId;
        const isDonation = !!task.donationId;
        
        let user = null;
        if (isWaste && task.requestId?.userId) {
            user = task.requestId.userId;
        } else if (isDonation && task.donationId?.userId) {
            user = task.donationId.userId;
        }

        const employeeName = task.employeeId?.name?.toLowerCase() || '';
        const userName = user?.name?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch = employeeName.includes(searchLower) || userName.includes(searchLower);
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10, flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress style={{ color: '#103926' }} />
                <Typography sx={{ mt: 2, color: '#666' }}>Loading Task Manager...</Typography>
            </Box>
        );
    }

    return (
        <div className="tasks-container">
            <div className="tasks-header">
                <div className="tasks-title-group">
                    <h1>Task Management</h1>
                    <p className="tasks-subtitle">Monitor and track employee field assignments.</p>
                </div>

                <div className="tasks-controls">
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <Select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            sx={{ borderRadius: '12px', bgcolor: 'white' }}
                        >
                            <MenuItem value="all">All Statuses</MenuItem>
                            <MenuItem value="assigned">Assigned</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                        </Select>
                    </FormControl>

                    <div className="task-search-box">
                        <Search sx={{ color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Search employee or user..."
                            className="task-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <TableContainer component={Paper} className="tasks-table-card" elevation={0}>
                <Table sx={{ minWidth: 850 }} aria-label="tasks table">
                    <TableHead className="tasks-table-head">
                        <TableRow>
                            <TableCell className="task-head-cell">Task Type</TableCell>
                            <TableCell className="task-head-cell">Assigned Employee</TableCell>
                            <TableCell className="task-head-cell">Client Profile</TableCell>
                            <TableCell className="task-head-cell">Status</TableCell>
                            <TableCell className="task-head-cell">Date Assigned</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => {
                                const isWaste = !!task.requestId;
                                const isDonation = !!task.donationId;
                                
                                let user = null;
                                let address = "N/A";
                                
                                if (isWaste && task.requestId) {
                                    user = task.requestId.userId;
                                    address = user?.address || "No address"; 
                                } else if (isDonation && task.donationId) {
                                    user = task.donationId.userId;
                                    address = user?.address || "No address";
                                }

                                return (
                                    <TableRow key={task._id} className="task-row">
                                        <TableCell className="task-cell">
                                            {isWaste ? (
                                                <div className="task-type-badge type-waste">
                                                    <DeleteOutline fontSize="inherit" />
                                                    Waste Pickup
                                                </div>
                                            ) : isDonation ? (
                                                <div className="task-type-badge type-donation">
                                                    <VolunteerActivism fontSize="inherit" />
                                                    Donation
                                                </div>
                                            ) : (
                                                <div className="task-type-badge" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                                                    <HelpOutline fontSize="inherit" />
                                                    Unknown
                                                </div>
                                            )}
                                        </TableCell>

                                        <TableCell className="task-cell">
                                            <div className="employee-info">
                                                <Avatar 
                                                    className="employee-avatar"
                                                    sx={{ bgcolor: '#103926' }}
                                                    src={task.employeeId?.profileImage}
                                                >
                                                    {task.employeeId?.name?.charAt(0) || 'E'}
                                                </Avatar>
                                                <div>
                                                    <div className="text-primary">{task.employeeId?.name || 'Unassigned'}</div>
                                                    <div className="text-secondary" style={{fontSize: '0.75rem'}}>
                                                        {task.employeeId?.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="task-cell">
                                            {user ? (
                                                <div className="employee-info">
                                                    <Avatar 
                                                        src={user.profileImage}
                                                        className="employee-avatar"
                                                        sx={{ bgcolor: '#3b82f6', width: 32, height: 32 }}
                                                    >
                                                        {user.name?.charAt(0) || 'U'}
                                                    </Avatar>
                                                    <div>
                                                        <div className="text-primary">{user.name}</div>
                                                        <div className="text-secondary">{user.email || 'No Contact'}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-secondary">Unknown Client</span>
                                            )}
                                        </TableCell>

                                       

                                        <TableCell className="task-cell">
                                            <div className={`task-status-pill ${formatStatusClass(task.status)}`}>
                                                {getStatusIcon(task.status)}
                                                {task.status}
                                            </div>
                                        </TableCell>

                                        <TableCell className="task-cell">
                                            <div className="text-primary">
                                                {new Date(task.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="text-secondary">
                                                {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <div className="tasks-empty-state">
                                        <Typography variant="h6">No tasks found</Typography>
                                        <p>Try adjusting your search or filters.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default Tasks;