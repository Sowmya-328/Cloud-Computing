import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, CheckSquare, Calendar, PieChart, User, Clock, FileText } from 'lucide-react';

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2 style={{margin: 0, fontSize: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <Clock size={24} /> WorkPulse
                </h2>
            </div>
            <nav className="sidebar-nav">
                {user?.role === 'Admin' ? (
                    <>
                        <NavLink to="/admin" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                            <LayoutDashboard size={20} /> Dashboard
                        </NavLink>
                        <NavLink to="/attendance" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                            <CheckSquare size={20} /> Attendance
                        </NavLink>
                        <NavLink to="/schedule" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                            <Calendar size={20} /> Schedule
                        </NavLink>
                        <NavLink to="/reports" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                            <PieChart size={20} /> Reports
                        </NavLink>
                        <NavLink to="/leave-requests" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                            <FileText size={20} /> Leave Requests
                        </NavLink>
                        <NavLink to="/profile" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                            <User size={20} /> Profile
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavLink to="/employee" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                            <LayoutDashboard size={20} /> Dashboard
                        </NavLink>
                        <NavLink to="/attendance" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                            <CheckSquare size={20} /> My Attendance
                        </NavLink>
                        <NavLink to="/schedule" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                            <Calendar size={20} /> My Schedule
                        </NavLink>
                        <NavLink to="/apply-leave" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                            <FileText size={20} /> Apply Leave
                        </NavLink>
                        <NavLink to="/profile" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                            <User size={20} /> Profile
                        </NavLink>
                    </>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
