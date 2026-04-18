import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Clock } from 'lucide-react';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMsg('');
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        try {
            const res = await api.post('/auth/reset-password', { email: decodeURIComponent(token), newPassword });
            setMsg(res.data.message || 'Password reset successful!');
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired token. Please try again.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
                        <Clock size={32} color="var(--primary)" /> WorkPulse
                    </h1>
                    <p style={{color: 'var(--text-muted)'}}>Enter your new password</p>
                </div>
                {error && <div style={{color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}
                {msg && <div style={{color: 'var(--success)', marginBottom: '1rem', textAlign: 'center'}}>{msg}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>New Password</label>
                        <input 
                            type="password" 
                            className="form-input" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            required 
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input 
                            type="password" 
                            className="form-input" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{marginTop: '0.5rem'}}>
                        Reset Password
                    </button>
                </form>
                
                <div style={{textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem'}}>
                    <span style={{cursor: 'pointer', textDecoration: 'underline'}} onClick={() => navigate('/')}>
                        Back to Login
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
