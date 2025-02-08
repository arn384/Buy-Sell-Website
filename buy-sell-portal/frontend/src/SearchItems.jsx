import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

function SearchItems() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ['Clothing', 'Grocery', 'Electronics', 'Books', 'Sports', 'Other'];

  useEffect(() => {
    fetchItems();
  }, [search, selectedCategories]);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (selectedCategories.length) queryParams.append('categories', selectedCategories.join(','));

      const response = await fetch(`http://localhost:5000/items?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch items');
      }

      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError(error.message);
      setItems([]);
      setLoading(false);
    }
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  if (error) {
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-4">
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search items..."
            className="form-control form-control-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mb-4 d-flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`btn ${
                selectedCategories.includes(category)
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {items.map(item => (
              <div className="col-md-4" key={item._id}>
                <div 
                  className="card h-100 shadow-sm cursor-pointer"
                  onClick={() => navigate(`/item/${item._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-body">
                    <h5 className="card-title">{item.name}</h5>
                    <p className="card-text text-primary fw-bold">₹{item.price}</p>
                    <p className="card-text text-muted small">
                      Sold by: {item.sellerId.firstName} {item.sellerId.lastName}
                    </p>
                    <p className="card-text text-muted small">
                      Category: {item.category}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchItems;