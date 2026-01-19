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
  Tooltip
} from '@mui/material';
import { Search } from '@mui/icons-material';
import axios from '../baseUrl';
import toast from 'react-hot-toast';

// Import the external CSS
import '../styles/viewAllEmployees.css';

const ViewAllEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/admin/employees');
      // Ensure we are setting an array, even if API returns an object wrapper
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
    // Optimistic UI Update: Change state immediately for better UX
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
      // Revert changes if API fails
      setEmployees(employees); 
    }
  };

  // Helper to get random soft colors for avatars if no image exists
  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  // Filter logic
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
      {/* Header Section */}
      <div className="page-header">
        <div>
          <h1 className="header-title">Employee Directory</h1>
          <p className="header-subtitle">Manage access and view employee details.</p>
        </div>

        {/* Custom Search Bar */}
        <div className="search-bar-container">
            <Search className="search-icon" fontSize="small" />
            <input 
                type="text" 
                placeholder="Search by name, email or ID..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Table Section */}
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
                  {/* Profile Column */}
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

                  {/* Contact Column */}
                  <TableCell className="body-cell">
                    <div className="contact-text">{emp.email}</div>
                    <div className="contact-sub">{emp.phone || 'No phone provided'}</div>
                  </TableCell>

                  {/* Role Column */}
                  <TableCell className="body-cell">
                    <span className={`role-badge ${emp.role ? emp.role.toLowerCase() : 'default'}`}>
                        {emp.role || 'Employee'}
                    </span>
                  </TableCell>

                  {/* Status Column */}
                  <TableCell className="body-cell">
                    <div className={`status-indicator ${emp.isActive ? 'status-active' : 'status-inactive'}`}>
                        <span className="dot"></span>
                        {emp.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </TableCell>

                  {/* Actions Column */}
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