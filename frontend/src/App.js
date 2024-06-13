import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CartScreen from './screens/CartScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import OrdersScreen from './screens/OrdersScreen';
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminMedicineForm from './screens/AdminMedicineForm';
import axios from 'axios';
import AdminOrdersScreen from './screens/AdminOrdersScreen';
import AdminLoginScreen from './screens/AdminLoginScreen';
import SearchScreen from './screens/SearchScreen';
import Footer from './components/Footer'; // Import the Footer component
import AdminBannerForm from './screens/AdminBannerForm';

const App = () => {
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateAuthStatus = async () => {
      const token = localStorage.getItem('token');
      const adminToken = localStorage.getItem('adminToken');
      if (token) {
        setIsAuthenticated(true);
        await fetchCartItems(token);
      } else {
        setIsAuthenticated(false);
      }
      if (adminToken) {
        setIsAdminAuthenticated(true);
      } else {
        setIsAdminAuthenticated(false);
      }
      setIsLoading(false);
    };

    updateAuthStatus();
  }, []);

  const fetchCartItems = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const addToCart = (medicine) => {
    const itemExists = cartItems.find((item) => item._id === medicine._id);

    if (itemExists) {
      const updatedCartItems = cartItems.map((item) =>
        item._id === medicine._id ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCartItems(updatedCartItems);
    } else {
      setCartItems([...cartItems, { ...medicine, quantity: 1 }]);
    }
  };

  const removeFromCart = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/cart/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const updatedCartItems = cartItems.filter((item) => item._id !== id);
      setCartItems(updatedCartItems);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.delete('http://localhost:5000/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Cart cleared:', response.data);
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const handlePlaceOrder = (orderData) => {
    setOrders([...orders, orderData]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setIsAdminAuthenticated(false);
  };

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#e9f7ef' }}>
        <Header
          isAuthenticated={isAuthenticated}
          isAdminAuthenticated={isAdminAuthenticated}
          handleLogout={handleLogout}
        />
        <main style={{ flex: '1 0 auto', backgroundColor: '#e9f7ef', color: '#155724' }}>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Routes>
              <Route path="/admin/banners" element={isAdminAuthenticated ? <AdminBannerForm /> : <Navigate to="/adminlogin" />} />
              <Route path="/search" element={<SearchScreen />} />
              <Route path="/" element={<HomeScreen addToCart={addToCart} />} />
              <Route path="/checkout" element={<CheckoutScreen cartItems={cartItems} clearCart={clearCart} />} />
              <Route path="/cart" element={isAuthenticated ? <CartScreen cartItems={cartItems} removeFromCart={removeFromCart} /> : <Navigate to="/login" />} />
              <Route path="/login" element={<LoginScreen setIsAuthenticated={setIsAuthenticated} />} />
              <Route path="/register" element={<RegisterScreen />} />
              <Route path="/orders" element={isAuthenticated ? <OrdersScreen orders={orders} /> : <Navigate to="/login" />} />
              <Route path="/adminpage" element={isAdminAuthenticated ? <AdminMedicineForm /> : <Navigate to="/adminlogin" />} />
              <Route path="/adminorder" element={isAdminAuthenticated ? <AdminOrdersScreen /> : <Navigate to="/adminlogin" />} />
              <Route path="/adminlogin" element={<AdminLoginScreen setIsAdminAuthenticated={setIsAdminAuthenticated} />} />
            </Routes>
          )}
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
