import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Navbar from './Navbar';

function OrdersHistory() {
  const [orders, setOrders] = useState({ buyingOrders: [], sellingOrders: [] });
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);

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
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const renderOrderList = (orderList, type) => (
    <div className="d-flex flex-column gap-3">
      {orderList.map(order => (
        <div key={order._id} className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <div>
                <h3 className="h5 fw-bold mb-2">{order.itemId.name}</h3>
                <p className="text-primary mb-2">₹{order.amount}</p>
                <p className="text-muted small mb-1">
                  {type === 'buying' ? 'Seller' : 'Buyer'}:{' '}
                  {type === 'buying'
                    ? `${order.sellerId.firstName} ${order.sellerId.lastName}`
                    : `${order.buyerId.firstName} ${order.buyerId.lastName}`}
                </p>
                <p className="text-muted small mb-1">
                  Date: {format(new Date(order.createdAt), 'PPP')}
                </p>
                <p className="text-muted small mb-1">
                  Status: {order.status === 'pending' ? '🕒 Pending' : '✅ Completed'}
                </p>
                {type === 'buying' && order.status === 'pending' && (
                  <p className="small text-primary fw-bold mt-2 mb-0">
                    Transaction ID: {order.transactionId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) return <div className="text-center mt-4">Loading...</div>;

  const pendingBuyingOrders = orders.buyingOrders.filter(o => o.status === 'pending');
  const completedBuyingOrders = orders.buyingOrders.filter(o => o.status === 'completed');
  const sellingOrders = orders.sellingOrders;

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">
        <h1 className="display-5 mb-4">Orders History</h1>
        
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Orders
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed Orders
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'selling' ? 'active' : ''}`}
              onClick={() => setActiveTab('selling')}
            >
              Items Sold
            </button>
          </li>
        </ul>

        {activeTab === 'pending' && (
          <>
            <h2 className="h4 mb-3">Pending Orders</h2>
            {renderOrderList(pendingBuyingOrders, 'buying')}
          </>
        )}

        {activeTab === 'completed' && (
          <>
            <h2 className="h4 mb-3">Completed Orders</h2>
            {renderOrderList(completedBuyingOrders, 'buying')}
          </>
        )}

        {activeTab === 'selling' && (
          <>
            <h2 className="h4 mb-3">Items Sold</h2>
            {renderOrderList(sellingOrders, 'selling')}
          </>
        )}
      </div>
    </div>
  );
}

export default OrdersHistory;