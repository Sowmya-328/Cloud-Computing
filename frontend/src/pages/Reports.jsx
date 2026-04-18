import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [totalEmployees, setTotalEmployees] = useState(0);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch reports and employees count
                const [repRes, empRes] = await Promise.all([
                    api.get('/admin/reports'),
                    api.get('/admin/employees')
                ]);
                setReports(repRes.data);
                setTotalEmployees(empRes.data.length);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    // Calculate chart data: Attendance by Day (Last 7 Days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        let present = 0;
        let late = 0;
        
        let absent = 0;
        
        reports.forEach(r => {
            if (r.Date === dateStr) {
                if (r.Status === 'Present') present += 1;
                if (r.Status === 'Late') late += 1;
                if (r.Status === 'Absent') absent += 1;
            }
        });
        
        chartData.push({
            date: dateStr,
            present,
            late,
            absent
        });
    }

    return (
        <div>
            <h2>Analytics & Reports</h2>
            
            <div className="table-container" style={{padding: '2rem', marginBottom: '2rem', height: '400px'}}>
                <h3 className="mb-4">Attendance Over Last 7 Days</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px'}} />
                        <Legend />
                        <Bar dataKey="present" fill="var(--success)" name="Present" />
                        <Bar dataKey="late" fill="var(--warning)" name="Late" />
                        <Bar dataKey="absent" fill="var(--danger)" name="Absent" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="table-container">
                 <h3 style={{padding: '1.5rem', borderBottom: '1px solid var(--border)'}}>Full Export Log</h3>
                 <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Employee</th>
                            <th>Status</th>
                            <th>Total Hrs</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(r => (
                            <tr key={r.ID}>
                                <td>{r.Date}</td>
                                <td>{r.EmployeeName}</td>
                                <td>
                                    <span className={`badge badge-${r.Status.toLowerCase()}`}>
                                        {r.Status}
                                    </span>
                                </td>
                                <td>{r.WorkingHours || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>
        </div>
    );
};

export default Reports;
