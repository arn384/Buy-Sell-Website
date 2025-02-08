import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path ? 'text-primary' : 'text-muted';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Brand</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/search" className={`nav-link ${isActive('/search')}`}>
                Search Items
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/orders" className={`nav-link ${isActive('/orders')}`}>
                Orders History
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/deliver" className={`nav-link ${isActive('/deliver')}`}>
                Deliver Items
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/cart" className={`nav-link ${isActive('/cart')}`}>
                My Cart
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/support" className={`nav-link ${isActive('/support')}`}>
                Support
              </Link>
            </li>
            <li className="nav-item">
              <button
                onClick={handleLogout}
                className="btn btn-link text-danger"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
