import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <header className="navbar">
            <div style={{fontWeight: 600}}>Welcome, {user?.name}</div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2" style={{color: 'var(--text-muted)'}}>
                    <User size={18} />
                    <span>{user?.role}</span>
                </div>
                <button onClick={logout} className="btn btn-secondary" style={{padding: '0.5rem 1rem'}}>
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </header>
    );
};

export default Navbar;
