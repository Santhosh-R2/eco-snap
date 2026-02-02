import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AdminLogin from './components/AdminLogin'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './components/AdminDashboard'
import ViewAllEmployees from './components/ViewAllEmployees'
import ViewAllUsers from './components/ViewAllUsers'
import WasteRequest from './components/WasteRequest'
import ViewDonations from './components/ViewDonations'
import Tasks from './components/Tasks'
import Payment from './components/Payment'
import Complaints from './components/Complaints'
import NavigationHandler from './NavigationHandler'
import AddEmployee from './components/AddEmployee'; 

function App() {
  return (
    <Router>
      <NavigationHandler />
      <Routes>
        <Route path="/" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="employees" element={<ViewAllEmployees />} />
          <Route path="users" element={<ViewAllUsers />} />
          <Route path="waste-requests" element={<WasteRequest />} />
          <Route path="donations" element={<ViewDonations />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="payments" element={<Payment/>} />
          <Route path="complaints" element={<Complaints/>} />
          <Route path="add-employee" element={<AddEmployee />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App