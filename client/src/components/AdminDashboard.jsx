import React, { useEffect, useState } from 'react';
import {
    CircularProgress,
    Box
} from '@mui/material';
import {
    PeopleAltOutlined,
    BadgeOutlined,
    AssignmentTurnedInOutlined
} from '@mui/icons-material';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import axios from '../baseUrl';

// Import the CSS file
import '../styles/adminDashboard.css';

// Register ChartJS components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        counts: { users: 0, employees: 0, completedTasks: 0 },
        donationChart: { total: 0, available: 0, assigned: 0, claimed: 0 },
        wasteChart: []
    });

    // Function to get current formatted date
    const getCurrentDate = () => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/admin/dashboard-stats');
                setStats(response.data);
                console.log(response);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // --- Chart Data Configuration ---

    // 1. Doughnut Chart Data (Donations)
    const donationData = {
        labels: ['Available', 'Assigned', 'Claimed'],
        datasets: [
            {
                data: [
                    stats.donationChart.available,
                    stats.donationChart.assigned,
                    stats.donationChart.claimed
                ],
                backgroundColor: [
                    '#3b82f6', // Blue for Available
                    '#fbbf24', // Amber for Assigned
                    '#10b981', // Emerald for Claimed
                ],
                hoverOffset: 4,
                borderWidth: 0,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { family: "'Inter', sans-serif", size: 12 }
                }
            }
        }
    };

    // 2. Bar Chart Data (Waste Requests - Month-wise)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const completedWaste = new Array(12).fill(0);
    const pendingWaste = new Array(12).fill(0);
    const scheduledWaste = new Array(12).fill(0);

    if (stats.wasteChart && Array.isArray(stats.wasteChart)) {
        stats.wasteChart.forEach(item => {
            const monthIndex = item._id - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
                completedWaste[monthIndex] = item.completed;
                pendingWaste[monthIndex] = item.pending;
                scheduledWaste[monthIndex] = item.scheduled;
            }
        });
    }

    const wasteData = {
        labels: months,
        datasets: [
            {
                label: 'Completed',
                data: completedWaste,
                backgroundColor: '#103926', // Brand Green
                borderRadius: 4,
                barPercentage: 0.6,
            },
            {
                label: 'Scheduled',
                data: scheduledWaste,
                backgroundColor: '#3b82f6', // Blue
                borderRadius: 4,
                barPercentage: 0.6,
            },
            {
                label: 'Pending',
                data: pendingWaste,
                backgroundColor: '#e5e7eb', // Light Gray
                borderRadius: 4,
                barPercentage: 0.6,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: { family: "'Inter', sans-serif", size: 12 }
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f3f4f6',
                    drawBorder: false,
                },
                ticks: {
                    font: { family: "'Inter', sans-serif" },
                    color: '#9ca3af'
                },
                stacked: true, // Enable stacking if desired, or false for side-by-side
            },
            x: {
                grid: { display: false },
                ticks: {
                    font: { family: "'Inter', sans-serif" },
                    color: '#9ca3af'
                },
                stacked: true, // Enable stacking
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <CircularProgress style={{ color: '#103926' }} />
                <p>Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Dashboard Overview</h1>
                    <p className="dashboard-subtitle">Welcome back! Here is your ecosystem summary.</p>
                </div>
                <div className="date-badge">
                    {getCurrentDate()}
                </div>
            </header>

            {/* KPI Stats Grid */}
            <div className="stats-grid">
                {/* User Card */}
                <div className="stat-card users">
                    <div className="stat-content">
                        <h4>Total Users</h4>
                        <div className="stat-number">{stats.counts.users}</div>
                    </div>
                    <div className="icon-box">
                        <PeopleAltOutlined fontSize="inherit" />
                    </div>
                </div>

                {/* Employee Card */}
                <div className="stat-card employees">
                    <div className="stat-content">
                        <h4>Active Employees</h4>
                        <div className="stat-number">{stats.counts.employees}</div>
                    </div>
                    <div className="icon-box">
                        <BadgeOutlined fontSize="inherit" />
                    </div>
                </div>

                {/* Task Card */}
                <div className="stat-card tasks">
                    <div className="stat-content">
                        <h4>Tasks Completed</h4>
                        <div className="stat-number">{stats.counts.completedTasks}</div>
                    </div>
                    <div className="icon-box">
                        <AssignmentTurnedInOutlined fontSize="inherit" />
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-layout">
                {/* Donation Doughnut Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Donation Status</h3>
                    </div>
                    <div className="chart-container">
                        <Doughnut data={donationData} options={doughnutOptions} />
                    </div>
                    {/* Optional: Add a summary text below/inside if needed */}
                    <div style={{ textAlign: 'center', marginTop: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
                        Total Donations: {stats.donationChart.total}
                    </div>
                </div>

                {/* Waste Request Bar Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Waste Collection Analytics</h3>
                    </div>
                    <div className="chart-container">
                        <Bar data={wasteData} options={barOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;