import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { FaWhatsapp } from 'react-icons/fa'; // Import WhatsApp icon

import BannerCarousel from '../components/BannerCarousel'; // Import the BannerCarousel component

const HomeScreen = ({ addToCart }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [cartCount, setCartCount] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const fetchSubcategories = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/categories/${selectedCategory}/subcategories`);
          setSubcategories(response.data);
        } catch (error) {
          console.error('Error fetching subcategories:', error);
        }
      };

      fetchSubcategories();
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedSubcategory) {
      const fetchMedicines = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/subcategories/${selectedSubcategory}/medicines`);
          setMedicines(response.data);
        } catch (error) {
          console.error('Error fetching medicines:', error);
        }
      };

      fetchMedicines();
    }
  }, [selectedSubcategory]);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('http://localhost:5000/api/cart', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const cartItems = response.data.reduce((acc, item) => {
            acc[item._id] = item.added || 1;
            return acc;
          }, {});
          setCartCount(cartItems);
        }
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, []);

  const handleAddToCart = async (medicine) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to be logged in to add items to the cart.');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/cart',
        { medicineId: medicine._id },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const newCartCount = { ...cartCount };
      newCartCount[medicine._id] = (newCartCount[medicine._id] || 0) + 1;
      setCartCount(newCartCount);
      addToCart(medicine);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <BannerCarousel /> {/* Display the BannerCarousel component */}
        </Col>
      </Row>
      <Row>
        <Col md={3}>
          <h5 className="mb-3">Categories</h5>
          <ListGroup>
            {categories.map(category => (
              <ListGroup.Item
                key={category._id}
                active={category._id === selectedCategory}
                onClick={() => {
                  setSelectedCategory(category._id);
                  setSelectedSubcategory('');
                  setMedicines([]);
                }}
                action
                className={category._id === selectedCategory ? 'bg-success text-white' : ''}
              >
                {category.name}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        <Col md={3}>
          <h5 className="mb-3">Subcategories</h5>
          {selectedCategory ? (
            <ListGroup>
              {subcategories.map(subcategory => (
                <ListGroup.Item
                  key={subcategory._id}
                  active={subcategory._id === selectedSubcategory}
                  onClick={() => setSelectedSubcategory(subcategory._id)}
                  action
                  className={subcategory._id === selectedSubcategory ? 'bg-success text-white' : ''}
                >
                  {subcategory.name}
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p>Select a category first</p>
          )}
        </Col>

        <Col md={6}>
          <h5 className="mb-3">Medicines</h5>
          <Row>
            {medicines.map((medicine) => (
              <Col key={medicine._id} md={4} className="mb-4">
                <Card>
                  <Card.Img 
                    variant="top" 
                    src={`http://localhost:5000/${medicine.imageUrl.replace(/\\/g, '/')}`} 
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Title>{medicine.name}</Card.Title>
                    <Card.Text>{medicine.description}</Card.Text>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="mb-1">Price: ${medicine.price}</p>
                        <p className="mb-0">Quantity: {medicine.quantity}</p>
                        {cartCount[medicine._id] && <p>Added: {cartCount[medicine._id]}</p>}
                      </div>
                      <Button variant="primary" onClick={() => handleAddToCart(medicine)}>Add to Cart</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: '1000' }}>
        <a href="YOUR_WHATSAPP_LINK_HERE" target="_blank" rel="noopener noreferrer">
          <Button variant="success" style={{ borderRadius: '50%', width: '70px', height: '70px', padding: '0' }}>
            <FaWhatsapp size={40} color="white" />
          </Button>
        </a>
      </div>
    </Container>
  );
};

export default HomeScreen;
