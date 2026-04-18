import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Schedule = () => {
    const { user } = useContext(AuthContext);
    const [schedules, setSchedules] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [form, setForm] = useState({ employeeId: '', workDate: '', taskDescription: '', shiftId: '' });

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                if (user.role === 'Admin') {
                    // Admin might want to assign schedule and also see all schedules
                    const [empRes, shiftRes] = await Promise.all([
                        api.get('/admin/employees'),
                        api.get('/admin/shifts')
                    ]);
                    setEmployees(empRes.data);
                    setShifts(shiftRes.data);
                } else {
                    const { data } = await api.get('/employee/schedule');
                    setSchedules(data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchSchedules();
    }, [user]);

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/assign-schedule', form);
            alert('Schedule assigned!');
            setForm({ employeeId: '', workDate: '', taskDescription: '', shiftId: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Error occurred');
        }
    };

    return (
        <div>
            <h2>{user.role === 'Admin' ? 'Assign Schedules' : 'My Schedule'}</h2>
            
            {user.role === 'Admin' && (
                <div className="table-container" style={{padding: '2rem'}}>
                    <form onSubmit={handleAssign}>
                        <div className="grid grid-cols-2">
                            <div className="form-group">
                                <label>Employee</label>
                                <select className="form-input" value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} required>
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => <option key={emp.ID} value={emp.ID}>{emp.ID} - {emp.Name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" className="form-input" value={form.workDate} onChange={e => setForm({...form, workDate: e.target.value})} required/>
                            </div>
                            <div className="form-group">
                                <label>Shift</label>
                                <select className="form-input" value={form.shiftId} onChange={e => setForm({...form, shiftId: e.target.value})} required>
                                    <option value="">Select Shift</option>
                                    {shifts.map(sh => <option key={sh.ShiftID} value={sh.ShiftID}>{sh.ShiftName}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Task Description</label>
                            <input type="text" className="form-input" value={form.taskDescription} onChange={e => setForm({...form, taskDescription: e.target.value})} required placeholder="Enter tasks for the day" />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{width: 'auto'}}>Assign Schedule</button>
                    </form>
                </div>
            )}

            {user.role === 'Employee' && (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Task Description</th>
                                <th>Shift</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map(sch => (
                                <tr key={sch.ScheduleID}>
                                    <td>{sch.WorkDate}</td>
                                    <td>{sch.TaskDescription}</td>
                                    <td>{sch.ShiftID === 1 ? 'Day Shift' : 'Night Shift'}</td>
                                </tr>
                            ))}
                            {schedules.length === 0 && (
                                <tr>
                                    <td colSpan="3" style={{textAlign: 'center'}}>No schedules assigned.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Schedule;
