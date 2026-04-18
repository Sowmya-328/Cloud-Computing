import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Clock, CheckCircle } from 'lucide-react';

const EmployeeDashboard = () => {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profRes, attRes] = await Promise.all([
                    api.get('/employee/profile'),
                    api.get('/employee/attendance')
                ]);
                setProfile(profRes.data);
                setAttendance(attRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCheckIn = async () => {
        try {
            await api.post('/employee/checkin');
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.message || 'Error checking in');
        }
    };

    const handleCheckOut = async () => {
        try {
            await api.post('/employee/checkout');
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.message || 'Error checking out');
        }
    };

    if (loading) return <div>Loading...</div>;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = attendance.find(a => a.Date === todayStr);

    return (
        <div>
            <h2>Employee Dashboard</h2>
            <div className="grid grid-cols-2">
                <div className="stat-card">
                    <div className="stat-icon"><CheckCircle /></div>
                    <div className="stat-info">
                        <h3>Today's Status</h3>
                        <p>{(todayRecord && todayRecord.CheckIn !== '-') ? todayRecord.Status : (todayRecord && todayRecord.Status === 'Absent' ? 'Absent' : 'Not Checked In')}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><Clock /></div>
                    <div className="stat-info">
                        <h3>Shift Assigned</h3>
                        <p>{profile?.ShiftID === 1 ? 'Day (09:00 - 18:00)' : 'Night (18:00 - 00:00)'}</p>
                    </div>
                </div>
            </div>

            <div className="table-container" style={{padding: '2rem'}}>
                <h3 className="mb-4">Quick Check In/Out</h3>
                <div className="flex gap-4">
                    <button 
                        className="btn btn-success" 
                        onClick={handleCheckIn}
                        disabled={!!todayRecord && todayRecord.CheckIn !== '-'}
                    >
                        Check In Now
                    </button>
                    <button 
                        className="btn btn-danger" 
                        onClick={handleCheckOut}
                        disabled={!todayRecord || todayRecord.CheckIn === '-' || !!todayRecord.CheckOut}
                    >
                        Check Out
                    </button>
                </div>
                {todayRecord && (
                    <div className="mt-4" style={{marginTop: '1rem'}}>
                        <p>Checked in at: <strong>{todayRecord.CheckIn}</strong></p>
                        {todayRecord.CheckOut && <p>Checked out at: <strong>{todayRecord.CheckOut}</strong></p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeDashboard;
