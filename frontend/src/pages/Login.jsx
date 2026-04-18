import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Clock } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Employee');
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMsg('');
        try {
            if (isForgotPassword) {
                const res = await api.post('/auth/forgot-password', { email });
                navigate(`/reset-password/${encodeURIComponent(email)}`);
            } else if (isLogin) {
                const data = await login(email, password);
                if (data.user.role === 'Admin') {
                    navigate('/admin');
                } else {
                    navigate('/employee');
                }
            } else {
                await api.post('/auth/register', { name, email, password, role, address: 'Online', shiftId: 1 });
                setMsg('Registration successful! Please login.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed (Is backend running?)');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
                        <Clock size={32} color="var(--primary)" /> WorkPulse
                    </h1>
                    <p style={{color: 'var(--text-muted)'}}>
                        {isForgotPassword ? 'Reset your password' : (isLogin ? 'Sign in to your account' : 'Create a new account')}
                    </p>
                </div>
                {error && <div style={{color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}
                {msg && <div style={{color: 'var(--success)', marginBottom: '1rem', textAlign: 'center'}}>{msg}</div>}
                <form onSubmit={handleSubmit}>
                    {!isLogin && !isForgotPassword && (
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="user@system.com"/>
                    </div>
                    {!isForgotPassword && (
                        <>
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"/>
                            </div>
                            {!isLogin && (
                                <div className="form-group">
                                    <label>Role</label>
                                    <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
                                        <option value="Employee">Employee</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                            )}
                        </>
                    )}
                    
                    <button type="submit" className="btn btn-primary" style={{marginTop: '0.5rem'}}>
                        {isForgotPassword ? 'Verify Email' : (isLogin ? 'Sign In' : 'Register')}
                    </button>
                </form>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem'}}>
                    {isForgotPassword ? (
                        <span style={{cursor: 'pointer', textDecoration: 'underline'}} onClick={() => setIsForgotPassword(false)}>Back to Login</span>
                    ) : (
                        <>
                            {isLogin && (
                                <span style={{cursor: 'pointer', textDecoration: 'underline', color: 'var(--primary)'}} onClick={() => setIsForgotPassword(true)}>Forgot Password?</span>
                            )}
                            <span style={{cursor: 'pointer', textDecoration: 'underline'}} onClick={() => setIsLogin(!isLogin)}>
                                {isLogin ? "Don't have an account? Register Here" : "Already have an account? Login"}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
