import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    contactNumber: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Signup successful!');
        navigate('/login');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-sm" style={{width: '500px'}}>
        <div className="card-body p-4">
          <h2 className="card-title text-center mb-4">Sign Up</h2>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="firstName"
                  name="firstName"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="lastName"
                  name="lastName"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email (IIIT only)</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                onChange={handleChange}
                required
                pattern=".*@iiit\.ac\.in$"
              />
            </div>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label htmlFor="age" className="form-label">Age</label>
                <input
                  type="number"
                  className="form-control"
                  id="age"
                  name="age"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-8 mb-3">
                <label htmlFor="contactNumber" className="form-label">Contact Number</label>
                <input
                  type="tel"
                  className="form-control"
                  id="contactNumber"
                  name="contactNumber"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                onChange={handleChange}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-success w-100"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;