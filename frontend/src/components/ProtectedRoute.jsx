import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div className="app-layout"><div className="page-content">Loading...</div></div>;

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (role && user.role !== role) {
        return <Navigate to={user.role === 'Admin' ? '/admin' : '/employee'} />;
    }

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Navbar />
                <div className="page-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ProtectedRoute;
