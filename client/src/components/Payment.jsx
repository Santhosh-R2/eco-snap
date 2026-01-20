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
    Paper
} from '@mui/material';
import {
    Search,
    CheckCircle,
    Pending,
    AttachMoney,
    DateRange
} from '@mui/icons-material';
import axios from '../baseUrl';
import toast from 'react-hot-toast';

import '../styles/payment.css';

const Payment = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('completed'); 
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const endpoint = `/payments/${activeTab}`; 
            
            const response = await axios.get(endpoint);
            console.log("Payments Data:", response.data);
            setPayments(response.data);
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error(`Failed to load ${activeTab} payments`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [activeTab]);

    const filteredPayments = payments.filter(pay => {
        const userName = pay.userId?.name?.toLowerCase() || '';
        const userEmail = pay.userId?.email?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();

        return userName.includes(search) || userEmail.includes(search);
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle fontSize="small" />;
            case 'pending': return <Pending fontSize="small" />;
            default: return null;
        }
    };

    return (
        <div className="payment-container">
            <div className="payment-header">
                <div className="payment-title">
                    <h1>Payment Transactions</h1>
                    <p className="payment-subtitle">View and monitor all financial records.</p>
                </div>
            </div>

            <div className="payment-controls">
                <div className="payment-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        Completed
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending
                    </button>
                </div>

                <div className="payment-search-box">
                    <Search sx={{ color: '#9ca3af' }} />
                    <input 
                        type="text" 
                        placeholder="Search by user or email..." 
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10, flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress style={{ color: '#103926' }} />
                    <Typography sx={{ mt: 2, color: '#666' }}>Loading Records...</Typography>
                </Box>
            ) : (
                <TableContainer component={Paper} className="payment-table-card" elevation={0}>
                    <Table sx={{ minWidth: 700 }} aria-label="payments table">
                        <TableHead className="payment-table-head">
                            <TableRow>
                                <TableCell className="head-cell">User Details</TableCell>
                                <TableCell className="head-cell">Amount</TableCell>
                                <TableCell className="head-cell">Payment Date</TableCell>
                                <TableCell className="head-cell">Billing Month</TableCell>
                                <TableCell className="head-cell">Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredPayments.length > 0 ? (
                                filteredPayments.map((pay) => (
                                    <TableRow key={pay._id} className="payment-row">
                                        <TableCell className="data-cell">
                                            <div className="user-profile">
                                                <Avatar 
                                                    src={pay.userId?.profileImage}
                                                    className="user-avatar"
                                                    sx={{ bgcolor: '#103926', fontSize: '0.8rem' }}
                                                >
                                                    {pay.userId?.name?.charAt(0) || 'U'}
                                                </Avatar>
                                                <div>
                                                    <div className="text-primary">{pay.userId?.name || 'Unknown User'}</div>
                                                    <div className="text-secondary">{pay.userId?.email || 'No Email'}</div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="data-cell">
                                            <div className="amount-text">
                                                ₹{pay.amount}
                                            </div>
                                        </TableCell>

                                        <TableCell className="data-cell">
                                            <div className="text-primary">
                                                {new Date(pay.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="text-secondary">
                                                {new Date(pay.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </TableCell>

                                        <TableCell className="data-cell">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4b5563' }}>
                                                <DateRange fontSize="small" sx={{ color: '#9ca3af' }} />
                                                <span>{pay.month} / {pay.year}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="data-cell">
                                            <div className={`status-pill status-${pay.status}`}>
                                                {getStatusIcon(pay.status)}
                                                {pay.status}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <div className="empty-state">
                                            <Typography variant="h6">No payments found</Typography>
                                            <p>No records available for the selected filter.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    );
};

export default Payment;