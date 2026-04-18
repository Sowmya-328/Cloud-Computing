import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Clock } from 'lucide-react';

const AdminDashboard = () => {
    const [employees, setEmployees] = useState([]);
    const [reports, setReports] = useState([]);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [empRes, repRes] = await Promise.all([
                    api.get('/admin/employees'),
                    api.get('/admin/reports')
                ]);
                setEmployees(empRes.data);
                setReports(repRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAttendance = reports.filter(r => r.Date === todayStr && r.Status !== 'Absent');

    const handleRemoveEmployee = async (id) => {
        if (!window.confirm("Are you sure you want to remove this employee from active rosters? (History will be retained)")) return;
        try {
            await api.delete(`/admin/delete-employee/${id}`);
            setEmployees(employees.filter(e => e.ID !== id));
            // Trigger refresh effectively for stats
            const repRes = await api.get('/admin/reports');
            setReports(repRes.data);
        } catch (err) {
            alert('Failed to remove employee: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div>
            <h2>Admin Dashboard</h2>
            <div className="grid grid-cols-2">
                <div className="stat-card">
                    <div className="stat-icon"><Users /></div>
                    <div className="stat-info">
                        <h3>Total Employees</h3>
                        <p>{employees.length}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><Clock /></div>
                    <div className="stat-info">
                        <h3>Present Today</h3>
                        <p>{todayAttendance.length}</p>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Role</th>
                            <th>Shift</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.ID}>
                                <td>{emp.Name} ({emp.Email})</td>
                                <td>{emp.Role}</td>
                                <td>{emp.ShiftID === 1 ? 'Day' : 'Night'}</td>
                                <td>
                                    <button 
                                        onClick={() => handleRemoveEmployee(emp.ID)}
                                        style={{ backgroundColor: 'var(--danger)', color: 'white', padding: '0.3rem 0.6rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
