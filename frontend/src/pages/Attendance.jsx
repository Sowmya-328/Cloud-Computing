import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Attendance = () => {
    const { user } = useContext(AuthContext);
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                if (user.role === 'Admin') {
                    const { data } = await api.get('/admin/reports');
                    setRecords(data);
                } else {
                    const { data } = await api.get('/employee/attendance');
                    setRecords(data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchRecords();
    }, [user]);

    const exportCSV = () => {
        const headers = user.role === 'Admin' ? 'Employee,Date,CheckIn,CheckOut,WorkingHours,Status\n' : 'Date,CheckIn,CheckOut,WorkingHours,Status\n';
        const csv = records.map(r => {
            if (user.role === 'Admin') return `${r.EmployeeName},${r.Date || ''},${r.CheckIn || ''},${r.CheckOut || ''},${r.WorkingHours || ''},${r.Status}`;
            return `${r.Date || ''},${r.CheckIn || ''},${r.CheckOut || ''},${r.WorkingHours || ''},${r.Status}`;
        }).join('\n');
        
        const blob = new Blob([headers + csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Attendance-Log.csv`;
        a.click();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 style={{margin: 0}}>{user.role === 'Admin' ? 'Company Attendance Logs' : 'My Attendance Logs'}</h2>
                <button onClick={exportCSV} className="btn btn-secondary">Export Log (CSV)</button>
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            {user.role === 'Admin' && <th>Employee</th>}
                            <th>Date</th>
                            <th>Check-In</th>
                            <th>Check-Out</th>
                            <th>Working Hours</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map(r => (
                            <tr key={r.ID}>
                                {user.role === 'Admin' && <td>{r.EmployeeName}</td>}
                                <td>{r.Date}</td>
                                <td>{r.CheckIn || '-'}</td>
                                <td>{r.CheckOut || '-'}</td>
                                <td>{r.WorkingHours || '-'}</td>
                                <td>
                                    <span className={`badge badge-${r.Status.toLowerCase()}`}>
                                        {r.Status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {records.length === 0 && (
                            <tr>
                                <td colSpan={user.role === 'Admin' ? 6 : 5} style={{textAlign: 'center'}}>No records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Attendance;
