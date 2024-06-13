// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;
const jwtSecret = process.env.JWT_SECRET || 'default_secret';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true }
});

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }
});

const medicineSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  imageUrl: { type: String } // Add imageUrl field to store the path of the uploaded image
});


const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cart: [{
        medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
        count: { type: Number, default: 1 } // Default count is 1
    }]
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
    name: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    items: [{ 
      // Define the schema for each item in the order
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true }
    }],
    status: { type: String, default: 'Order placed' } // Default status
  });
  const adminSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
  });

  const bannerSchema = new mongoose.Schema({
    url: String,
  });
  
  const Banner = mongoose.model('Banner', bannerSchema);  
  const Admin = mongoose.model('Admin', adminSchema);
  const Order = mongoose.model('Order', orderSchema);
const User = mongoose.model('User', userSchema);
const Subcategory = mongoose.model('Subcategory', subcategorySchema);
const Medicine = mongoose.model('Medicine', medicineSchema);
const Category = mongoose.model('Category', categorySchema);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Destination folder to store the images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename for each image
  }
});

const upload = multer({ storage: storage });
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
  
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
  
  const authenticateAdmin = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], jwtSecret);
        req.admin = decoded.id;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

  app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Check if admin exists
      const admin = await Admin.findOne({ username });
  
      if (!admin) {
        return res.status(400).json({ message: 'Admin not found' });
      }
  
      // Check password
      if (admin.password !== password) {
        return res.status(400).json({ message: 'Invalid password' });
      }
  
      // Create and send JWT token
      const token = jwt.sign({ id: admin._id }, jwtSecret);
  
      res.json({ token });
  
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

  app.post('/api/cart', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { medicineId } = req.body;

    try {
        console.log('Request body:', req.body); // Add this log statement

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the item already exists in the cart
        const existingCartItem = user.cart.find(item => {
            console.log('Item:', item); // Add this log statement
            console.log('Medicine:', item.medicine); // Add this log statement
            return item.medicine.toString() === medicineId;
        });
                if (existingCartItem) {
            // If item exists, increment its count
            existingCartItem.count = (existingCartItem.count || 0) + 1;
        } else {
            // If item does not exist, add it to the cart with count 1
            user.cart.push({ medicine: medicineId, count: 1 });
        }

        await user.save();
        res.status(200).json(user.cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's cart items
app.get('/api/cart', authMiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId).populate('cart.medicine');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Remove item from cart
app.delete('/api/cart/:medicineId', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { medicineId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove the item from the cart
        user.cart = user.cart.filter(item => item.medicine.toString() !== medicineId);

        await user.save();
        res.status(200).json(user.cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.delete('/api/cart', authMiddleware, async (req, res) => {
  try {
    console.log('User object:', req.user); // Log the entire user object for debugging
    const userId = req.user.id; // Access the user ID from the authenticated user
    console.log(`Clearing cart for user: ${userId}`); // Logging user ID for debugging
    
    // Find the user by ID and update the cart field to an empty array
    const user = await User.findByIdAndUpdate(userId, { cart: [] }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Cart cleared', cart: user.cart });
  } catch (error) {
    console.error('Error clearing cart:', error); // Log the error for debugging
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/api/login', async (req, res) => {
    console.log(req.body)

    const { email, password } = req.body;
  
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  
      // Generate token
      const token = jwt.sign({ id: user._id },jwtSecret);
      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Register route
  app.post('/api/register', async (req, res) => {
    console.log('Request body:', req.body);
    const { fullName, email, password } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        // Create new user
        user = new User({
            fullName,
            email,
            password
        });

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user to database
        await user.save();
        console.log('User saved successfully:', user);

        // Generate token
        const token = jwt.sign({ id: user._id }, jwtSecret);
        res.json({ token });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

  
  app.post('/api/orders', authMiddleware, async (req, res) => {
    console.log(req.body, req.user.id);
  
    try {
      const orderData = { ...req.body, user: req.user.id }; // Add the user ID to the order data
      const order = new Order(orderData);
      await order.save();
      res.status(201).json(order);
    } catch (error) {
      console.error('Error saving order:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

// Route to fetch all orders from the database
app.get('/api/orders', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Assuming you have middleware to populate req.user with the authenticated user's details
        const orders = await Order.find({ user: userId });
        res.json(orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
// Route to fetch all orders (accessible only to admin)
app.get('/api/orders/admin', authenticateAdmin, async (req, res) => {
  try {
      const orders = await Order.find();
      res.json(orders);
  } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

// Route to update order status (accessible only to admin)
app.put('/api/orders/:orderId/status', authenticateAdmin, async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
      const order = await Order.findById(orderId);
      if (!order) {
          return res.status(404).json({ message: 'Order not found' });
      }

      order.status = status;
      await order.save();

      res.json(order);
  } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Server error' });
  }
});
// Routes
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/categories/:categoryId/subcategories', async (req, res) => {
  const { categoryId } = req.params;

  try {
    const subcategories = await Subcategory.find({ category: categoryId });
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/subcategories/:subcategoryId/medicines', async (req, res) => {
    const { subcategoryId } = req.params;
    try {
      const medicines = await Medicine.find({ subcategory: subcategoryId });
      res.json(medicines);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

app.post('/api/categories', authenticateAdmin,async (req, res) => {
  const category = new Category({
    name: req.body.name
  });

  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/subcategories/:categoryId',authenticateAdmin, async (req, res) => {
  const { categoryId } = req.params;

  try {
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const subcategory = new Subcategory({
      name: req.body.name,
      category: categoryId
    });

    const newSubcategory = await subcategory.save();
    res.status(201).json(newSubcategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/medicines', authenticateAdmin, upload.single('image'), async (req, res) => {
  console.log("Request Body:", req.body);
  console.log("Request File:", req.file);
  
  const medicine = new Medicine({
    category: req.body.category,
    subcategory: req.body.subcategory,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    quantity: req.body.quantity,
    imageUrl: req.file ? req.file.path : null // Save the path to the uploaded image in the database if it exists
  });

  try {
    const newMedicine = await medicine.save();
    res.status(201).json(newMedicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/medicines/search', async (req, res) => {
  try {
    const { searchTerm } = req.body;
    const regex = new RegExp(searchTerm, 'i'); // Case-insensitive regex for searching

    // Perform a search query on the Medicine model based on the name field
    const medicines = await Medicine.find({ name: regex });

    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/banner-images', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).send({ error: 'Image URL is required' });
  }

  const image = new Banner({ url });

  await image.save();
  res.status(201).send(image);
});

app.get('/api/banner-images', async (req, res) => {
  const images = await Banner.find();
  res.send(images);
});

app.delete('/api/banner-images/:id', async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
