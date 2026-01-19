import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AdminLogin from './components/AdminLogin'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './components/AdminDashboard'
import ViewAllEmployees from './components/ViewAllEmployees'
import ViewAllUsers from './components/ViewAllUsers'
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLogin />} />

        {/* Admin Section with Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="employees" element={<ViewAllEmployees />} />
          <Route path="users" element={<ViewAllUsers />} />
          <Route path="waste-requests" element={<h2>Waste Requests</h2>} />
          <Route path="donations" element={<h2>Donations</h2>} />
          <Route path="tasks" element={<h2>Tasks</h2>} />
          <Route path="payments" element={<h2>Payments</h2>} />
          <Route path="complaints" element={<h2>Complaints</h2>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App