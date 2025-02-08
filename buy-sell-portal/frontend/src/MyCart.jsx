import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

function MyCart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/cart', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setCartItems(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:5000/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setCartItems(cartItems.filter(item => item._id !== itemId));
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const placeOrder = async () => {
    try {
      const response = await fetch('http://localhost:5000/orders/place', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setOrderSuccess(true);
        setOrders(data.orders);
        setCartItems([]);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to place order. Please try again.');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  if (loading) return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">
        <div className="text-center">Loading...</div>
      </div>
    </div>
  );

  if (orderSuccess) {
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-4">
          <div className="card">
            <div className="card-body">
              <h2 className="text-success h4 mb-4">Order Placed Successfully!</h2>
              <p className="mb-4">Please keep these OTPs safe for each order:</p>
              <div className="d-flex flex-column gap-2">
                {orders.map((order, index) => (
                  <div key={order.orderId} className="p-3 bg-light rounded">
                    <p className="fw-medium mb-1">Order {index + 1}</p>
                    <p className="text-primary mb-0">OTP: {order.plainOtp}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-muted">
                You can view your orders in the Orders History page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">
        <h1 className="display-5 mb-4">My Cart</h1>
        
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {cartItems.length === 0 ? (
          <div className="card text-center">
            <div className="card-body">
              <p className="text-muted">Your cart is empty</p>
            </div>
          </div>
        ) : (
          <>
            <div className="d-flex flex-column gap-3 mb-4">
              {cartItems.map(item => (
                <div key={item._id} className="card">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="h6 fw-bold mb-1">{item.name}</h3>
                      <p className="text-primary mb-1">₹{item.price}</p>
                      <p className="text-muted small mb-0">
                        Seller: {item.sellerId.firstName} {item.sellerId.lastName}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="btn btn-outline-danger btn-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="h5 mb-0">Total:</span>
                  <span className="h5 mb-0">₹{calculateTotal()}</span>
                </div>
                <button
                  onClick={placeOrder}
                  className="btn btn-primary w-100"
                >
                  Place Order
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyCart;