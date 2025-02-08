import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import Login from './Login';
import Signup from './Signup';
import ProfilePage from './ProfilePage';
import SearchItems from './SearchItems';
import ItemPage from './ItemPage';
import OrdersHistory from './OrdersHistory';
import DeliverItems from './DeliverItems';
import Support from './Support'; 
import MyCart from './MyCart';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/search"
          element={
            <PrivateRoute>
              <SearchItems />
            </PrivateRoute>
          }
        />
        <Route
          path="/item/:id"
          element={
            <PrivateRoute>
              <ItemPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <OrdersHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/deliver"
          element={
            <PrivateRoute>
              <DeliverItems />
            </PrivateRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <MyCart />
            </PrivateRoute>
          }
        />
        <Route 
          path="/support" 
          element={
            <PrivateRoute>
              <Support />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
