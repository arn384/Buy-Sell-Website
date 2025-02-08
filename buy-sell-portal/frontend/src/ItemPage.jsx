import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';

function ItemPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await fetch(`http://localhost:5000/items/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setItem(data);
      } else {
        setError(data.error);
      }
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch item');
      setLoading(false);
    }
  };

  const addToCart = async () => {
    try {
      const response = await fetch('http://localhost:5000/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ itemId: id })
      });
      if (response.ok) {
        alert('Item added to cart successfully!');
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to add item to cart');
    }
  };

  if (loading) return <div className="text-center mt-4">Loading...</div>;
  if (error) return <div className="alert alert-danger m-4">Error: {error}</div>;
  if (!item) return <div className="alert alert-warning m-4">Item not found</div>;

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">
        <div className="card shadow">
          <div className="card-body">
            <h1 className="card-title display-5 mb-4">{item.name}</h1>
            <div className="row">
              <div className="col-md-6">
                <h2 className="h3 fw-bold mb-3">₹{item.price}</h2>
                <p className="text-secondary mb-3">{item.description}</p>
                <p className="text-muted mb-2">Category: {item.category}</p>
                <p className="text-muted mb-4">
                  Seller: {item.sellerId.firstName} {item.sellerId.lastName}
                </p>
                <button
                  onClick={addToCart}
                  className="btn btn-primary btn-lg"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemPage;