// index.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/buy-sell')
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
  });


// User Schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9._%+-]+@iiit\.ac\.in$/.test(v);
      },
      message: 'Email must be an IIIT email address'
    }
  },
  age: Number,
  contactNumber: String,
  password: String,
  cart: Array,
  reviews: Array
});

// Item Schema
const itemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  category: String,
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});
// Order Schema (add this with other schemas)
const orderSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    default: () => Math.random().toString(36).substr(2, 9)
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  amount: Number,
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);


const Item = mongoose.model('Item', itemSchema);
const User = mongoose.model('User', userSchema);

// JWT Secret
const JWT_SECRET = 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Register route
app.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, age, contactNumber, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      age,
      contactNumber,
      password: hashedPassword
    });

    await user.save();
    res.json({ message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Incorrect email or password' });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Incorrect email or password' });
    }

    // Create token
    const token = jwt.sign({ _id: user._id }, JWT_SECRET);
    res.json({ token, user: { 
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      age: user.age,
      contactNumber: user.contactNumber
    }});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected route to get user profile
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      age: user.age,
      contactNumber: user.contactNumber
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
app.put('/profile', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      age: user.age,
      contactNumber: user.contactNumber
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/items', authenticateToken, async (req, res) => {
  try {
    const { search, categories } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (categories) {
      const categoryArray = categories.split(',');
      query.category = { $in: categoryArray };
    }

    const items = await Item.find(query).populate('sellerId', 'firstName lastName email');

    // Now filter items where the seller's ID is not equal to the current user's ID
    const filteredItems = items.filter(item => item.sellerId._id.toString() !== req.user._id.toString());

    res.json(filteredItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single item
app.get('/items/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('sellerId', 'firstName lastName email');
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add item to cart
app.post('/cart/add', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user.cart.includes(itemId)) {
      user.cart.push(itemId);
      await user.save();
    }
    res.json({ message: 'Item added to cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cart items
app.get('/cart', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const cartItems = await Item.find({
      '_id': { $in: user.cart }
    }).populate('sellerId', 'firstName lastName email');
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove item from cart
app.delete('/cart/:itemId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(item => item.toString() !== req.params.itemId);
    await user.save();
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Place order for all items in cart
app.post('/orders/place', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const cartItems = await Item.find({ '_id': { $in: user.cart } });
    
    const orders = await Promise.all(cartItems.map(async (item) => {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(otp, 10);
      
      const order = new Order({
        buyerId: user._id,
        sellerId: item.sellerId,
        itemId: item._id,
        amount: item.price,
        otp: hashedOtp
      });
      
      await order.save();
      return {
        orderId: order._id,
        plainOtp: otp
      };
    }));

    // Clear cart after placing orders
    user.cart = [];
    await user.save();

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's orders (both buying and selling)
app.get('/orders', authenticateToken, async (req, res) => {
  try {
    const buyingOrders = await Order.find({ buyerId: req.user._id })
      .populate('itemId')
      .populate('sellerId', 'firstName lastName email');
    
    const sellingOrders = await Order.find({ sellerId: req.user._id })
      .populate('itemId')
      .populate('buyerId', 'firstName lastName email');
    
    res.json({ buyingOrders, sellingOrders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP and complete order
app.post('/orders/complete/:orderId', authenticateToken, async (req, res) => {
  try {
    const { otp } = req.body;
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const validOtp = await bcrypt.compare(otp, order.otp);
    if (!validOtp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    order.status = 'completed';
    await order.save();
    
    res.json({ message: 'Order completed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const axios = require('axios');

// Add these at the top of your file
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Use environment variable
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/support/chat', authenticateToken, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    
    const result = await model.generateContent(message);
    const response = await result.response;
    const botResponse = response.text();

    res.json({ 
      message: botResponse,
      sessionId: sessionId || Date.now().toString() 
    });
  } catch (error) {
    console.error('Support chat error:', error);
    res.status(500).json({ error: 'Failed to process support request' });
  }
});
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
