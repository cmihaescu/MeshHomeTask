import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="container">
      <div className="profile-container">
        <h2>My Profile</h2>
        <div className="profile-info">
          <div className="profile-label">Name</div>
          <div className="profile-value">{user.name}</div>
        </div>
        <div className="profile-info">
          <div className="profile-label">Email</div>
          <div className="profile-value">{user.email}</div>
        </div>
        <div className="profile-info">
          <div className="profile-label">User ID</div>
          <div className="profile-value">{user.id}</div>
        </div>
        {user.createdAt && (
          <div className="profile-info">
            <div className="profile-label">Member Since</div>
            <div className="profile-value">{formatDate(user.createdAt)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
