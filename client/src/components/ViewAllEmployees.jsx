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
  Chip,
  Switch,
  IconButton,
  InputBase,
  CircularProgress
} from '@mui/material';
import { Search, DeleteOutline, EditOutlined } from '@mui/icons-material';
import axios from '../baseUrl';
import toast from 'react-hot-toast';

const ViewAllEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/admin/employees');
      console.log(response);
      setEmployees(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleStatusChange = async (id, currentStatus) => {
    try {
      await axios.put(`/admin/employee/${id}/status`, { isActive: !currentStatus });
      toast.success(`Employee ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchEmployees(); // Refresh list to reflect changes
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Filter employees based on search
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress style={{ color: '#103926' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
          Manage Employees
        </Typography>

        {/* Search Bar */}
        <Paper
          component="form"
          sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 300, borderRadius: '20px' }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <IconButton sx={{ p: '10px' }} aria-label="search">
            <Search />
          </IconButton>
        </Paper>
      </Box>

      {/* Table Section */}
      <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Employee</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Details</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#64748b', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.map((emp) => (
              <TableRow
                key={emp._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={emp.profileImage} alt={emp.name} sx={{ bgcolor: '#1a237e' }}>
                      {emp.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{emp.name}</Typography>
                      <Typography variant="caption" color="textSecondary">ID: {emp.employeeId || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{emp.email}</Typography>
                  <Typography variant="caption" color="textSecondary">{emp.phone}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={emp.role}
                    size="small"
                    sx={{
                      backgroundColor: '#e0e7ff',
                      color: '#3730a3',
                      textTransform: 'capitalize',
                      fontWeight: 500
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={emp.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    color={emp.isActive ? 'success' : 'default'}
                    variant={emp.isActive ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Switch
                    checked={emp.isActive}
                    onChange={() => handleStatusChange(emp._id, emp.isActive)}
                    color="success"
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
            {filteredEmployees.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">No employees found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ViewAllEmployees;