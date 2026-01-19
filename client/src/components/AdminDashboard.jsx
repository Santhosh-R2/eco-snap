import React, { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    CircularProgress
} from '@mui/material';
import {
    PeopleAlt,
    Badge as BadgeIcon,
    CheckCircle
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
        donationChart: { total: 0, pending: 0, completed: 0 },
        wasteChart: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/admin/dashboard-stats');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Summary Cards Data
    const summaryCards = [
        {
            title: 'Total Users',
            count: stats.counts.users,
            icon: <PeopleAlt sx={{ fontSize: 40, color: '#1a237e' }} />,
            color: '#e8eaf6'
        },
        {
            title: 'Total Employees',
            count: stats.counts.employees,
            icon: <BadgeIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
            color: '#fff3e0'
        },
        {
            title: 'Tasks Completed',
            count: stats.counts.completedTasks,
            icon: <CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />,
            color: '#e8f5e9'
        }
    ];

    // Data for Donation Chart (Doughnut)
    const donationData = {
        labels: ['Pending', 'Completed'],
        datasets: [
            {
                label: '# of Donations',
                data: [stats.donationChart.pending, stats.donationChart.completed],
                backgroundColor: [
                    '#ff9800', // Pending - Orange
                    '#4caf50', // Completed - Green
                ],
                borderColor: [
                    '#f57c00',
                    '#388e3c',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Data for Waste Request Chart (Bar) - Month-wise
    // Create an array of 12 months initialized to 0
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const completedWaste = new Array(12).fill(0);
    const pendingWaste = new Array(12).fill(0);

    // Populate data from API
    stats.wasteChart.forEach(item => {
        // item._id is the month number (1-12)
        const monthIndex = item._id - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
            completedWaste[monthIndex] = item.completed;
            pendingWaste[monthIndex] = item.pending;
        }
    });

    const wasteData = {
        labels: months,
        datasets: [
            {
                label: 'Completed',
                data: completedWaste,
                backgroundColor: '#4caf50',
            },
            {
                label: 'Pending',
                data: pendingWaste,
                backgroundColor: '#ff9800',
            },
        ],
    };

    const wasteOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Waste Requests (Mensal)' },
        },
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1a237e' }}>
                Dashboard Overview
            </Typography>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {summaryCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            backgroundColor: card.color,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            borderRadius: '16px'
                        }}>
                            <Box sx={{ mr: 2 }}>{card.icon}</Box>
                            <CardContent sx={{ p: '0 !important' }}>
                                <Typography variant="h6" color="textSecondary">
                                    {card.title}
                                </Typography>
                                <Typography variant="h4" fontWeight="bold">
                                    {card.count}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3}>
                {/* Donation Chart */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Donation Status
                        </Typography>
                        <Box sx={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                            <Doughnut data={donationData} options={{ maintainAspectRatio: false }} />
                        </Box>
                    </Paper>
                </Grid>

                {/* Waste Request Chart */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Waste Collection Statistics
                        </Typography>
                        <Box sx={{ height: '300px' }}>
                            <Bar data={wasteData} options={{ ...wasteOptions, maintainAspectRatio: false }} />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
