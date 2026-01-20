import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  LocationOn,
  AssignmentInd,
  Warning,
  Map as MapIcon,
  Check
} from '@mui/icons-material';
import axios from '../baseUrl';
import toast from 'react-hot-toast';

// --- Leaflet Map Imports ---
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Import CSS
import '../styles/wasteRequest.css';

const WasteRequest = () => {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Bulk Selection State ---
  const [selectedRequestIds, setSelectedRequestIds] = useState([]);

  // Assignment Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  // 'selectedRequest' is used for Single Assign, 'selectedRequestIds' for Bulk
  const [selectedRequest, setSelectedRequest] = useState(null); 
  
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Map Dialog State
  const [openMapDialog, setOpenMapDialog] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState([0, 0]);
  const [mapUserAddress, setMapUserAddress] = useState('');

  // Filtered lists
  const [paymentedRequests, setPaymentedRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  const fetchData = async () => {
    try {
      const [reqResponse, empResponse] = await Promise.all([
        axios.get('/waste/requests'),
        axios.get('/admin/employees')
      ]);

      const allRequests = reqResponse.data;
      setRequests(allRequests);

      // Filter Requests
      setPaymentedRequests(allRequests.filter(r => r.status === 'Paymented'));
      setPendingRequests(allRequests.filter(r => r.status === 'pending'));

      // Filter Active Employees
      const empData = Array.isArray(empResponse.data) ? empResponse.data : [];
      const activeEmployees = empData.filter(emp => emp.isActive === true);
      setEmployees(activeEmployees);

      // Reset selection on refresh
      setSelectedRequestIds([]);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load waste requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Bulk Selection Handlers ---
  const handleToggleSelect = (id) => {
    setSelectedRequestIds(prev => {
        if (prev.includes(id)) {
            return prev.filter(item => item !== id);
        } else {
            return [...prev, id];
        }
    });
  };

  const handleSelectAll = () => {
    if (selectedRequestIds.length === paymentedRequests.length) {
        setSelectedRequestIds([]); // Deselect all
    } else {
        setSelectedRequestIds(paymentedRequests.map(r => r._id)); // Select all paymented
    }
  };

  // --- Map Handler ---
  const handleViewLocation = (request) => {
    const coords = request.userId?.location?.coordinates;
    if (coords && Array.isArray(coords) && coords.length === 2) {
        // Swap [Lng, Lat] to [Lat, Lng]
        const lat = coords[1];
        const lng = coords[0];
        if(lat !== 0 || lng !== 0) {
            setMapCoordinates([lat, lng]);
            setMapUserAddress(request.userId?.address || 'User Location');
            setOpenMapDialog(true);
        } else {
            toast.error("User coordinates are invalid.");
        }
    } else {
        toast.error("User location data is missing.");
    }
  };

  const handleCloseMapDialog = () => setOpenMapDialog(false);

  // --- Assignment Handlers ---

  // 1. Single Assign Click
  const handleAssignClick = (request) => {
    setSelectedRequest(request); // Set single request
    setOpenDialog(true);
    setSelectedEmployee('');
    setScheduledDate('');
  };

  // 2. Bulk Assign Click
  const handleBulkAssignClick = () => {
    setSelectedRequest(null); // Ensure single request is null
    setOpenDialog(true);
    setSelectedEmployee('');
    setScheduledDate('');
  }

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRequest(null);
  };

  const handleAssignSubmit = async () => {
    if (!selectedEmployee || !scheduledDate) {
      toast.error('Please select an employee and date');
      return;
    }

    setAssigning(true);
    try {
      // Determine which IDs to send (Single vs Bulk)
      const idsToAssign = selectedRequest ? [selectedRequest._id] : selectedRequestIds;

      // Your backend accepts 'requestIds' as an array
      await axios.post('/tasks/bulk', {
        employeeId: selectedEmployee,
        requestIds: idsToAssign, 
        scheduledDate: scheduledDate
      });

      toast.success(`${idsToAssign.length} Task(s) assigned successfully`);
      fetchData(); 
      handleCloseDialog();
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error(error.response?.data?.message || 'Failed to assign task');
    } finally {
      setAssigning(false);
    }
  };

  // Card Component
  const RequestCard = ({ request, statusType }) => {
    const isSelected = selectedRequestIds.includes(request._id);
    const isPaymented = statusType === 'Paymented';

    return (
        <div className={`waste-request-card ${isSelected ? 'selected' : ''}`}>
        <div className="waste-card-image-container">
            <img
            src={request.image || "https://via.placeholder.com/300x200?text=No+Image"}
            alt="Waste"
            className="waste-request-image"
            />
            
            {/* Checkbox for Paymented Requests Only */}
            {isPaymented && (
                <div className="waste-card-checkbox-container" onClick={() => handleToggleSelect(request._id)}>
                    <div className={`waste-custom-checkbox ${isSelected ? 'checked' : ''}`}>
                        <Check />
                    </div>
                </div>
            )}

            <div className={`waste-status-badge waste-status-${statusType.toLowerCase()}`}>
            <span className="waste-status-dot"></span>
            {statusType}
            </div>
        </div>

        <div className="waste-card-content">
            <div className="waste-user-info">
            <Avatar
                src={request.userId?.profileImage}
                sx={{ width: 40, height: 40, bgcolor: '#103926', fontSize: '1rem' }}
            >
                {request.userId?.name?.charAt(0) || 'U'}
            </Avatar>
            <div className="waste-user-details">
                <h4>{request.userId?.name || 'Unknown User'}</h4>
                <p>{new Date(request.createdAt).toLocaleDateString(undefined, {
                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
                })}</p>
            </div>
            </div>

            <div className="waste-info-row">
            <LocationOn fontSize="small" className="waste-info-icon" />
            <span>{request.userId?.address || 'No address provided'}</span>
            </div>

            {request.classification && (
            <div className="waste-info-row">
                <Warning fontSize="small" className="waste-info-icon" />
                <span>{request.classification}</span>
            </div>
            )}

            <div className="waste-action-area">
                {/* Always show View Location */}
                <button 
                    className="waste-location-btn"
                    onClick={() => handleViewLocation(request)}
                >
                    <MapIcon fontSize="small" />
                    View Location
                </button>

                {/* Only show Assign button if status is Paymented */}
                {isPaymented && (
                    <button
                        className="waste-assign-btn"
                        onClick={() => handleAssignClick(request)}
                    >
                        <AssignmentInd fontSize="small" />
                        Assign Employee
                    </button>
                )}
            </div>
        </div>
        </div>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10, flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress style={{ color: '#103926' }} />
        <Typography sx={{ mt: 2, color: '#666' }}>Loading Requests...</Typography>
      </Box>
    );
  }

  return (
    <div className="waste-requests-container">
      <div className="waste-page-header">
        <h1 className="waste-page-title">Waste Collection Requests</h1>
        <p className="waste-page-subtitle">Monitor incoming requests and assign collection tasks.</p>
      </div>

      {/* Section 1: Paymented Requests */}
      <div className="waste-section-container">
        <div className="waste-section-header">
          <div className="waste-section-title">
            <span style={{ color: '#047857', marginRight: '8px' }}>●</span>
            Verified Payment Requests
            <span className="waste-count-badge">{paymentedRequests.length}</span>
          </div>
          
          {/* Select All Button */}
          {paymentedRequests.length > 0 && (
              <button className="waste-select-all-btn" onClick={handleSelectAll}>
                  {selectedRequestIds.length === paymentedRequests.length ? 'Deselect All' : 'Select All'}
              </button>
          )}
        </div>

        {paymentedRequests.length > 0 ? (
          <div className="waste-requests-grid">
            {paymentedRequests.map(req => (
              <RequestCard key={req._id} request={req} statusType="Paymented" />
            ))}
          </div>
        ) : (
          <div className="waste-empty-state">
            <p>No verified payment requests at the moment.</p>
          </div>
        )}
      </div>

      {/* Section 2: Pending Requests */}
      <div className="waste-section-container">
        <div className="waste-section-header">
          <div className="waste-section-title">
            <span style={{ color: '#b91c1c', marginRight: '8px' }}>●</span>
            Pending Verification
            <span className="waste-count-badge">{pendingRequests.length}</span>
          </div>
        </div>

        {pendingRequests.length > 0 ? (
          <div className="waste-requests-grid">
            {pendingRequests.map(req => (
              <RequestCard key={req._id} request={req} statusType="Pending" />
            ))}
          </div>
        ) : (
          <div className="waste-empty-state">
            <p>No pending requests.</p>
          </div>
        )}
      </div>

      {/* --- Floating Bulk Action Bar --- */}
      <div className={`waste-bulk-action-bar ${selectedRequestIds.length > 0 ? 'visible' : ''}`}>
          <div className="waste-bulk-count">
              <span>{selectedRequestIds.length}</span> Requests Selected
          </div>
          <button className="waste-bulk-btn" onClick={handleBulkAssignClick}>
              Assign to Driver
          </button>
      </div>

      {/* --- Map Dialog --- */}
      <Dialog
        open={openMapDialog}
        onClose={handleCloseMapDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn sx={{ color: '#103926' }} />
            <Typography variant="h6" fontWeight="bold">User Location</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
            <Box className="waste-map-wrapper">
                {openMapDialog && (
                    <MapContainer 
                        center={mapCoordinates} 
                        zoom={15} 
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={mapCoordinates}>
                            <Popup>
                                <strong>User Address:</strong><br/>
                                {mapUserAddress}
                            </Popup>
                        </Marker>
                    </MapContainer>
                )}
            </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseMapDialog} variant="contained" sx={{ bgcolor: '#103926' }}>
                Close Map
            </Button>
        </DialogActions>
      </Dialog>

      {/* --- Assignment Dialog (Shared for Single & Bulk) --- */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #f3f4f6', pb: 2, fontWeight: 'bold', color: '#103926' }}>
          {selectedRequest ? 'Assign Collection Task' : `Bulk Assign (${selectedRequestIds.length} Tasks)`}
        </DialogTitle>
        <DialogContent className="waste-dialog-content-wrapper">
          <Box sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            <FormControl fullWidth>
              <InputLabel>Assign Driver / Collector</InputLabel>
              <Select
                value={selectedEmployee}
                label="Assign Driver / Collector"
                onChange={(e) => setSelectedEmployee(e.target.value)}
                sx={{ borderRadius: '12px' }}
              >
                {employees.length > 0 ? (
                    employees.map((emp) => (
                      <MenuItem key={emp._id} value={emp._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={emp.profileImage} sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                            {emp.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>{emp.name}</Typography>
                          <Typography variant="caption" color="textSecondary">({emp.role})</Typography>
                        </Box>
                      </MenuItem>
                    ))
                ) : (
                    <MenuItem disabled>No active employees available</MenuItem>
                )}
              </Select>
            </FormControl>

            <TextField
              label="Schedule Pickup Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDialog} sx={{ color: '#6b7280' }}>Cancel</Button>
          <Button
            onClick={handleAssignSubmit}
            variant="contained"
            disabled={assigning}
            sx={{
              bgcolor: '#103926',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: '#0d2e1f' }
            }}
          >
            {assigning ? <CircularProgress size={24} color="inherit" /> : 'Confirm Assignment'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default WasteRequest;