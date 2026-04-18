import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Attendance from './pages/Attendance';
import Schedule from './pages/Schedule';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import ApplyLeave from './pages/ApplyLeave';
import LeaveRequests from './pages/LeaveRequests';

const AppContent = () => {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                
                {/* Protected Admin Routes */}
                <Route path="/admin" element={
                    <ProtectedRoute role="Admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                
                <Route path="/employee" element={
                    <ProtectedRoute role="Employee">
                        <EmployeeDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/attendance" element={
                    <ProtectedRoute>
                        <Attendance />
                    </ProtectedRoute>
                } />

                <Route path="/schedule" element={
                    <ProtectedRoute>
                        <Schedule />
                    </ProtectedRoute>
                } />

                <Route path="/reports" element={
                    <ProtectedRoute role="Admin">
                        <Reports />
                    </ProtectedRoute>
                } />

                <Route path="/leave-requests" element={
                    <ProtectedRoute role="Admin">
                        <LeaveRequests />
                    </ProtectedRoute>
                } />

                <Route path="/apply-leave" element={
                    <ProtectedRoute role="Employee">
                        <ApplyLeave />
                    </ProtectedRoute>
                } />

                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
