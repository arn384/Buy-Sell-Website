import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

function DeliverItems() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpInput, setOtpInput] = useState({});
  const [error, setError] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setOrders(data.sellingOrders.filter(order => order.status === 'pending'));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5000/orders/complete/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ otp: otpInput[orderId] })
      });

      const data = await response.json();
      
      if (response.ok) {
        setOrders(orders.filter(order => order._id !== orderId));
        setOtpInput(prev => {
          const newInput = { ...prev };
          delete newInput[orderId];
          return newInput;
        });
        setError(prev => {
          const newError = { ...prev };
          delete newError[orderId];
          return newError;
        });
      } else {
        setError(prev => ({ ...prev, [orderId]: data.error }));
      }
    } catch (error) {
      setError(prev => ({ ...prev, [orderId]: 'Failed to verify OTP' }));
    }
  };

  if (loading) return <div className="text-center mt-4">Loading...</div>;

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">
        <h1 className="display-5 mb-4">Deliver Items</h1>
        
        <div className="row g-4">
          {orders.length === 0 ? (
            <div className="col-12">
              <div className="card text-center">
                <div className="card-body">
                  <p className="text-muted">No pending deliveries</p>
                </div>
              </div>
            </div>
          ) : (
            orders.map(order => (
              <div key={order._id} className="col-12">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start flex-wrap">
                      <div>
                        <h3 className="h5 fw-bold">{order.itemId.name}</h3>
                        <p className="text-primary mb-2">₹{order.amount}</p>
                        <p className="text-muted small mb-1">
                          Buyer: {order.buyerId.firstName} {order.buyerId.lastName}
                        </p>
                        <p className="text-muted small">
                          Transaction ID: {order.transactionId}
                        </p>
                      </div>
                      
                      <div className="d-flex gap-2 mt-3 mt-md-0">
                        <input
                          type="text"
                          placeholder="Enter OTP"
                          className="form-control"
                          value={otpInput[order._id] || ''}
                          onChange={(e) => setOtpInput(prev => ({
                            ...prev,
                            [order._id]: e.target.value
                          }))}
                        />
                        <button
                          onClick={() => handleOtpSubmit(order._id)}
                          className="btn btn-success"
                        >
                          Verify & Complete
                        </button>
                      </div>
                    </div>
                    {error[order._id] && (
                      <p className="text-danger small mt-2 mb-0">{error[order._id]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DeliverItems;