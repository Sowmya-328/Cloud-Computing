import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ApplyLeave = () => {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [myLeaves, setMyLeaves] = useState([]);

    const fetchMyLeaves = async () => {
        try {
            const { data } = await api.get('/employee/my-leaves');
            setMyLeaves(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMyLeaves();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        setError('');
        try {
            await api.post('/employee/apply-leave', { subject, description, fromDate, toDate });
            setMsg('Leave request submitted successfully');
            setSubject('');
            setDescription('');
            setFromDate('');
            setToDate('');
            fetchMyLeaves();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit leave request');
        }
    };

    return (
        <div>
            <h2>Apply for Leave</h2>
            <div className="table-container" style={{ padding: '2rem', marginBottom: '2rem' }}>
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
                {msg && <div style={{ color: 'var(--success)', marginBottom: '1rem' }}>{msg}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Subject</label>
                        <input type="text" className="form-input" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Reason / Description</label>
                        <textarea className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} required rows="3"></textarea>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>From Date</label>
                            <input type="date" className="form-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>To Date</label>
                            <input type="date" className="form-input" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Submit Leave Request</button>
                </form>
            </div>

            <div className="table-container">
                <h3 style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>My Leave Requests</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Description</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myLeaves.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>No leave requests found.</td></tr>
                        ) : myLeaves.map(leave => (
                            <tr key={leave.LeaveID}>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ApplyLeave;
