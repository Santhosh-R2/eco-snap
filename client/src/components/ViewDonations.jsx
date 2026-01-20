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

// Reuse WasteRequest styles
import '../styles/wasteRequest.css';

const ViewDonations = () => {
  const [donations, setDonations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Bulk Selection State ---
  const [selectedDonationIds, setSelectedDonationIds] = useState([]);

  // Assignment Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [collectionDate, setCollectionDate] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Map Dialog State
  const [openMapDialog, setOpenMapDialog] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState([0, 0]);
  const [mapUserAddress, setMapUserAddress] = useState('');

  // Filtered lists
  const [availableDonations, setAvailableDonations] = useState([]);

  const fetchData = async () => {
    try {
      const [donResponse, empResponse] = await Promise.all([
        axios.get('/donations'),
        axios.get('/admin/employees')
      ]);

      const allDonations = donResponse.data;
      setDonations(allDonations);

      // Filter Donations for 'available' status
      setAvailableDonations(allDonations.filter(d => d.status === 'available'));

      // Filter Active Employees
      const empData = Array.isArray(empResponse.data) ? empResponse.data : [];
      const activeEmployees = empData.filter(emp => emp.isActive === true);
      setEmployees(activeEmployees);

      // Reset selection on refresh
      setSelectedDonationIds([]);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Bulk Selection Handlers ---
  const handleToggleSelect = (id) => {
    setSelectedDonationIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedDonationIds.length === availableDonations.length) {
      setSelectedDonationIds([]); // Deselect all
    } else {
      setSelectedDonationIds(availableDonations.map(d => d._id)); // Select all available
    }
  };

  // --- Map Handler ---
  const handleViewLocation = (donation) => {
    const coords = donation.userId?.location?.coordinates;
    if (coords && Array.isArray(coords) && coords.length === 2) {
      const lat = coords[1];
      const lng = coords[0];
      if (lat !== 0 || lng !== 0) {
        setMapCoordinates([lat, lng]);
        setMapUserAddress(donation.userId?.address || 'User Location');
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

  const handleAssignClick = (donation) => {
    setSelectedDonation(donation);
    setOpenDialog(true);
    setSelectedEmployee('');
    setCollectionDate('');
  };

  const handleBulkAssignClick = () => {
    setSelectedDonation(null);
    setOpenDialog(true);
    setSelectedEmployee('');
    setCollectionDate('');
  }

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDonation(null);
  };

  const handleAssignSubmit = async () => {
    if (!selectedEmployee || !collectionDate) {
      toast.error('Please select an employee and date');
      return;
    }

    setAssigning(true);
    try {
      const idsToAssign = selectedDonation ? [selectedDonation._id] : selectedDonationIds;

      await axios.post('/donations/assign', {
        employeeId: selectedEmployee,
        donationIds: idsToAssign,
        collectionDate: collectionDate
      });

      toast.success(`${idsToAssign.length} Donation(s) assigned successfully`);
      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error(error.response?.data?.message || 'Failed to assign donation task');
    } finally {
      setAssigning(false);
    }
  };

  // Card Component
  const DonationCard = ({ donation }) => {
    const isSelected = selectedDonationIds.includes(donation._id);

    return (
      <div className={`waste-request-card ${isSelected ? 'selected' : ''}`}>
        <div className="waste-card-image-container">
          <img
            src={donation.image || "https://via.placeholder.com/300x200?text=No+Item+Image"}
            alt="Donation"
            className="waste-request-image"
          />

          <div className="waste-card-checkbox-container" onClick={() => handleToggleSelect(donation._id)}>
            <div className={`waste-custom-checkbox ${isSelected ? 'checked' : ''}`}>
              <Check />
            </div>
          </div>

          <div className={`waste-status-badge waste-status-paymented`}>
            <span className="waste-status-dot"></span>
            {donation.status}
          </div>
        </div>

        <div className="waste-card-content">
          <div className="waste-user-info">
            <Avatar
              src={donation.userId?.profileImage}
              sx={{ width: 40, height: 40, bgcolor: '#103926', fontSize: '1rem' }}
            >
              {donation.userId?.name?.charAt(0) || 'U'}
            </Avatar>
            <div className="waste-user-details">
              <h4>{donation.userId?.name || 'Unknown User'}</h4>
              <p>{new Date(donation.createdAt).toLocaleDateString(undefined, {
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
              })}</p>
            </div>
          </div>

          <div className="waste-info-row">
            <strong>Item:</strong> {donation.itemType}
          </div>

          <div className="waste-info-row">
            <Typography variant="body2" color="textSecondary" noWrap>
              {donation.description || 'No description provided'}
            </Typography>
          </div>

          <div className="waste-info-row">
            <LocationOn fontSize="small" className="waste-info-icon" />
            <span>{donation.userId?.address || 'No address provided'}</span>
          </div>

          <div className="waste-action-area">
            <button
              className="waste-location-btn"
              onClick={() => handleViewLocation(donation)}
            >
              <MapIcon fontSize="small" />
              View Location
            </button>

            <button
              className="waste-assign-btn"
              onClick={() => handleAssignClick(donation)}
            >
              <AssignmentInd fontSize="small" />
              Assign Employee
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10, flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress style={{ color: '#103926' }} />
        <Typography sx={{ mt: 2, color: '#666' }}>Loading Donations...</Typography>
      </Box>
    );
  }

  return (
    <div className="waste-requests-container">
      <div className="waste-page-header">
        <h1 className="waste-page-title">Available Donations</h1>
        <p className="waste-page-subtitle">Manage item donations and assign collection tasks.</p>
      </div>

      <div className="waste-section-container">
        <div className="waste-section-header">
          <div className="waste-section-title">
            <span style={{ color: '#047857', marginRight: '8px' }}>●</span>
            Active Donations
            <span className="waste-count-badge">{availableDonations.length}</span>
          </div>

          {availableDonations.length > 0 && (
            <button className="waste-select-all-btn" onClick={handleSelectAll}>
              {selectedDonationIds.length === availableDonations.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {availableDonations.length > 0 ? (
          <div className="waste-requests-grid">
            {availableDonations.map(don => (
              <DonationCard key={don._id} donation={don} />
            ))}
          </div>
        ) : (
          <div className="waste-empty-state">
            <p>No available donations at the moment.</p>
          </div>
        )}
      </div>

      <div className={`waste-bulk-action-bar ${selectedDonationIds.length > 0 ? 'visible' : ''}`}>
        <div className="waste-bulk-count">
          <span>{selectedDonationIds.length}</span> Donations Selected
        </div>
        <button className="waste-bulk-btn" onClick={handleBulkAssignClick}>
          Assign to Driver
        </button>
      </div>

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
                    <strong>User Address:</strong><br />
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

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #f3f4f6', pb: 2, fontWeight: 'bold', color: '#103926' }}>
          {selectedDonation ? 'Assign Collection Task' : `Bulk Assign (${selectedDonationIds.length} Tasks)`}
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
              value={collectionDate}
              onChange={(e) => setCollectionDate(e.target.value)}
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

export default ViewDonations;