import React, { useState, useEffect } from 'react';
import api from '../services/api';

const LeaveRequests = () => {
    const [leaves, setLeaves] = useState([]);
    
    const fetchLeaves = async () => {
        try {
            const { data } = await api.get('/admin/leaves');
            setLeaves(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/admin/leaves/${id}`, { status });
            fetchLeaves();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    return (
        <div>
            <h2>Manage Leave Requests</h2>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Subject</th>
                            <th>Reason</th>
                            <th>From Date</th>
                            <th>To Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaves.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center' }}>No leave requests found.</td></tr>
                        ) : leaves.map(leave => (
                            <tr key={leave.LeaveID}>
                                <td>{leave.EmployeeName}</td>
                                <td>{leave.Subject}</td>
                                <td>{leave.Description}</td>
                                <td>{leave.FromDate}</td>
                                <td>{leave.ToDate}</td>
                                <td>
                                    <span style={{ 
                                        color: leave.Status === 'Approved' ? 'var(--success)' : 
                                               leave.Status === 'Rejected' ? 'var(--danger)' : 'var(--warning)' 
                                    }}>
                                        {leave.Status}
                                    </span>
                                </td>
                                <td>
                                    {leave.Status === 'Pending' ? (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn" style={{ backgroundColor: 'var(--success)', color: '#fff', padding: '0.25rem 0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => updateStatus(leave.LeaveID, 'Approved')}>✅ Accept</button>
                                            <button className="btn" style={{ backgroundColor: 'var(--danger)', color: '#fff', padding: '0.25rem 0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => updateStatus(leave.LeaveID, 'Rejected')}>❌ Decline</button>
                                        </div>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)' }}>Actioned</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeaveRequests;
