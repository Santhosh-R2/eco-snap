import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
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
  Button // Import Button
} from '@mui/material';
import { Search, Add } from '@mui/icons-material'; // Import Add Icon
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from '../baseUrl';
import toast from 'react-hot-toast';

import '../styles/viewAllEmployees.css';

const ViewAllEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/admin/employees');
      const data = Array.isArray(response.data) ? response.data : (response.data.employees || []);
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employee list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleStatusChange = async (id, currentStatus) => {
    const updatedEmployees = employees.map(emp => 
        emp._id === id ? { ...emp, isActive: !currentStatus } : emp
    );
    setEmployees(updatedEmployees);

    try {
      await axios.put(`/admin/employee/${id}/status`, { isActive: !currentStatus });
      toast.success(`Employee ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status, reverting changes.');
      setEmployees(employees); 
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

  const filteredEmployees = employees.filter(emp =>
    (emp.name && emp.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (emp.employeeId && emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Box className="loading-box">
        <CircularProgress style={{ color: '#103926' }} />
        <Typography>Loading Employee Directory...</Typography>
      </Box>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="header-title">Employee Directory</h1>
          <p className="header-subtitle">Manage access and view employee details.</p>
        </div>

        {/* --- Action Buttons --- */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="search-bar-container">
                <Search className="search-icon" fontSize="small" />
                <input 
                    type="text" 
                    placeholder="Search employees..." 
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/admin/add-employee')} // Navigate to Add Page
                sx={{
                    bgcolor: '#103926',
                    textTransform: 'none',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    padding: '8px 16px',
                    '&:hover': { bgcolor: '#0d2e1f' }
                }}
            >
                Add Employee
            </Button>
        </div>
      </div>

      <TableContainer component={Paper} className="table-card" elevation={0}>
        <Table sx={{ minWidth: 700 }} aria-label="employee table">
          <TableHead className="custom-table-head">
            <TableRow>
              <TableCell className="header-cell">Employee Profile</TableCell>
              <TableCell className="header-cell">Contact Info</TableCell>
              <TableCell className="header-cell">Role</TableCell>
              <TableCell className="header-cell">Status</TableCell>
              <TableCell className="header-cell" align="center">Account Access</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <TableRow key={emp._id} className="body-row">
                  <TableCell className="body-cell">
                    <div className="profile-wrapper">
                      <Avatar 
                        src={emp.profileImage} 
                        alt={emp.name} 
                        className="employee-avatar"
                        sx={{ bgcolor: stringToColor(emp.name || 'U') }}
                      >
                        {emp.name ? emp.name.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                      <div className="employee-info">
                        <h4>{emp.name || 'Unknown'}</h4>
                        <div className="employee-id">ID: {emp.employeeId || 'N/A'}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="body-cell">
                    <div className="contact-text">{emp.email}</div>
                    <div className="contact-sub">{emp.phone || 'No phone provided'}</div>
                  </TableCell>

                  <TableCell className="body-cell">
                    <span className={`role-badge ${emp.role ? emp.role.toLowerCase() : 'default'}`}>
                        {emp.role || 'Employee'}
                    </span>
                  </TableCell>

                  <TableCell className="body-cell">
                    <div className={`status-indicator ${emp.isActive ? 'status-active' : 'status-inactive'}`}>
                        <span className="dot"></span>
                        {emp.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </TableCell>

                  <TableCell className="body-cell" align="center">
                    <Tooltip title={emp.isActive ? "Deactivate Account" : "Activate Account"}>
                        <Switch
                            checked={emp.isActive}
                            onChange={() => handleStatusChange(emp._id, emp.isActive)}
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
                  <Typography color="textSecondary">No employees found matching "{searchTerm}"</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ViewAllEmployees;