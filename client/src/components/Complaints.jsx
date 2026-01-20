import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Avatar,
    Chip,
    Button
} from '@mui/material';
import {
    Person,
    Badge,
    ReportProblem,
    CheckCircle,
    Cancel,
    AccessTime
} from '@mui/icons-material';
import axios from '../baseUrl';
import toast from 'react-hot-toast';

import '../styles/Complaints.css';

const Complaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('user'); 
    const [processingId, setProcessingId] = useState(null); 
    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const endpoint = `/complaints/${activeTab}`;
            const response = await axios.get(endpoint);

            const pendingComplaints = response.data.filter(c => c.status === 'pending');
            setComplaints(pendingComplaints);
        } catch (error) {
            console.error('Error fetching complaints:', error);
            toast.error('Failed to load complaints');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, [activeTab]);

    const handleUpdateStatus = async (id, newStatus) => {
        setProcessingId(id);
        try {
            await axios.put(`/complaints/${id}`, { status: newStatus });
            
            toast.success(`Complaint marked as ${newStatus}`);
            
            setComplaints(prev => prev.filter(c => c._id !== id));
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to update status');
        } finally {
            setProcessingId(null);
        }
    };

    const renderCardContent = (complaint) => {
        const isUserTab = activeTab === 'user';
                
        const complainantName = isUserTab ? complaint.userId?.name : complaint.employeeId?.name;
        const complainantImg = isUserTab ? complaint.userId?.profileImage : complaint.employeeId?.profileImage;
        const complainantLabel = isUserTab ? "User" : "Employee";
        
        const defendantName = isUserTab ? complaint.employeeId?.name : complaint.userId?.name;
        const defendantImg = isUserTab ? complaint.employeeId?.profileImage : complaint.userId?.profileImage;
        const defendantLabel = isUserTab ? "Against Employee" : "Against User";

        return (
            <div className="complaint-card" key={complaint._id}>
                <div className="card-header">
                    <Typography variant="caption" color="textSecondary">
                        ID: {complaint._id.slice(-6).toUpperCase()} • {new Date(complaint.createdAt).toLocaleDateString()}
                    </Typography>
                    <div className="status-badge">
                        <span className="status-dot"></span> Pending
                    </div>
                </div>

                <div className="profiles-row">
                    <div className="profile-box">
                        <Avatar src={complainantImg} sx={{ width: 40, height: 40, bgcolor: '#103926' }}>
                            {complainantName?.charAt(0)}
                        </Avatar>
                        <div>
                            <div className="profile-label">{complainantLabel}</div>
                            <div className="profile-name">{complainantName || 'Unknown'}</div>
                        </div>
                    </div>

                    <div className="vs-badge">VS</div>

                    <div className="profile-box" style={{ flexDirection: 'row-reverse', textAlign: 'right' }}>
                        <Avatar src={defendantImg} sx={{ width: 40, height: 40, bgcolor: '#d32f2f' }}>
                            {defendantName?.charAt(0)}
                        </Avatar>
                        <div>
                            <div className="profile-label">{defendantLabel}</div>
                            <div className="profile-name">{defendantName || 'Unknown'}</div>
                        </div>
                    </div>
                </div>

                <div className="issue-content">
                    <div className="issue-label">
                        <ReportProblem fontSize="small" color="error" />
                        Reported Issue:
                    </div>
                    <div className="issue-text">
                        "{complaint.description || "No description provided."}"
                    </div>
                    {complaint.wasteRequestId && (
                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#6b7280' }}>
                            Related Request ID: {complaint.wasteRequestId._id || complaint.wasteRequestId}
                        </Typography>
                    )}
                </div>

                <div className="card-actions">
                    <button 
                        className="btn-dismiss"
                        onClick={() => handleUpdateStatus(complaint._id, 'rejected')}
                        disabled={processingId === complaint._id}
                    >
                        {processingId === complaint._id ? '...' : 'Dismiss'}
                    </button>
                    
                    <button 
                        className="btn-resolve"
                        onClick={() => handleUpdateStatus(complaint._id, 'resolved')}
                        disabled={processingId === complaint._id}
                    >
                        {processingId === complaint._id ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            <>
                                <CheckCircle fontSize="small" />
                                Mark Resolved
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="complaints-container">
            <div className="complaints-header">
                <div className="complaints-title">
                    <h1>Grievance Redressal</h1>
                    <p className="complaints-subtitle">Review and resolve reported issues.</p>
                </div>
            </div>

            <div className="complaints-tabs">
                <button 
                    className={`comp-tab-btn ${activeTab === 'user' ? 'active' : ''}`}
                    onClick={() => setActiveTab('user')}
                >
                    <Person fontSize="small" />
                    User Complaints
                </button>
                <button 
                    className={`comp-tab-btn ${activeTab === 'employee' ? 'active' : ''}`}
                    onClick={() => setActiveTab('employee')}
                >
                    <Badge fontSize="small" />
                    Employee Complaints
                </button>
            </div>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                    <CircularProgress style={{ color: '#103926' }} />
                </Box>
            ) : (
                <div className="complaints-grid">
                    {complaints.length > 0 ? (
                        complaints.map(complaint => renderCardContent(complaint))
                    ) : (
                        <div className="comp-empty-state">
                            <CheckCircle sx={{ fontSize: 40, color: '#10b981', mb: 2 }} />
                            <Typography variant="h6" color="textPrimary">All Caught Up!</Typography>
                            <Typography variant="body2" color="textSecondary">
                                There are no pending complaints in this category.
                            </Typography>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Complaints;