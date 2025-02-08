import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

function ProfilePage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:5000/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setFormData(data);
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setIsEditing(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  if (!userData) {
    return <div className="text-center mt-4">Loading...</div>;
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <Navbar />
      <div className="container">
        <div className="card shadow">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="card-title">Profile Page</h1>
              <button
                onClick={handleLogout}
                className="btn btn-danger"
              >
                Logout
              </button>
            </div>

            {error && <div className="alert alert-danger mb-4">{error}</div>}

            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-success"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(userData);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h2 className="h4 mb-4">User Details</h2>
                <div className="row g-4">
                  <div className="col-md-6">
                    <p className="text-muted mb-1">First Name:</p>
                    <p className="fw-medium">{userData.firstName}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted mb-1">Last Name:</p>
                    <p className="fw-medium">{userData.lastName}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted mb-1">Email:</p>
                    <p className="fw-medium">{userData.email}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted mb-1">Age:</p>
                    <p className="fw-medium">{userData.age}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted mb-1">Contact Number:</p>
                    <p className="fw-medium">{userData.contactNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary mt-4"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;