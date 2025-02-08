import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="container-fluid d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
      <h1 className="display-4 text-center mb-5">Welcome to IIIT Buy Sell Website</h1>
      <div className="d-flex gap-3">
        <button
          onClick={() => navigate('/login')}
          className="btn btn-primary btn-lg px-4"
        >
          Login
        </button>
        <button
          onClick={() => navigate('/signup')}
          className="btn btn-success btn-lg px-4"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default HomePage;