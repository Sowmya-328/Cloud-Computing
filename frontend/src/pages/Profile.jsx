import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        if (user.role === 'Employee') {
            api.get('/employee/profile')
                .then(res => setProfileData(res.data))
                .catch(console.error);
        } else {
            setProfileData({ ID: user.id || 1, Name: user.name, Email: user.email, Role: 'Admin', Address: 'Headquarters', JoiningDate: new Date().toISOString().split('T')[0] });
        }
    }, [user]);

    if (!profileData) return <div>Loading...</div>;

    return (
        <div>
            <h2>My Profile</h2>
            <div className="table-container" style={{padding: '2rem', maxWidth: '600px'}}>
                <div className="grid grid-cols-2" style={{gap: '1rem'}}>
                    <div>
                        <p className="mb-2" style={{color: 'var(--text-muted)', fontSize: '0.875rem'}}>Employee ID</p>
                        <p style={{fontSize: '1.125rem'}}>{profileData.ID || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-2" style={{color: 'var(--text-muted)', fontSize: '0.875rem'}}>Full Name</p>
                        <p style={{fontSize: '1.125rem'}}>{profileData.Name}</p>
                    </div>
                    <div>
                        <p className="mb-2" style={{color: 'var(--text-muted)', fontSize: '0.875rem'}}>Email Address</p>
                        <p style={{fontSize: '1.125rem'}}>{profileData.Email}</p>
                    </div>
                    <div>
                        <p className="mb-2" style={{color: 'var(--text-muted)', fontSize: '0.875rem'}}>Role</p>
                        <p style={{fontSize: '1.125rem'}}>{profileData.Role}</p>
                    </div>
                    <div>
                        <p className="mb-2" style={{color: 'var(--text-muted)', fontSize: '0.875rem'}}>Date of Joining</p>
                        <p style={{fontSize: '1.125rem'}}>{profileData.JoiningDate || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-2" style={{color: 'var(--text-muted)', fontSize: '0.875rem'}}>Physical Address</p>
                        <p style={{fontSize: '1.125rem'}}>{profileData.Address || '-'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
