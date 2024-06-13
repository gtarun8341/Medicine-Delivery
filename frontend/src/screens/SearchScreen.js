import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const SearchScreen = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [cartCount, setCartCount] = useState({});
  const location = useLocation();

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const searchTerm = new URLSearchParams(location.search).get('term'); // Get search term from URL
        const response = await axios.post('http://localhost:5000/api/medicines/search', { searchTerm });
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    };

    fetchSearchResults();
  }, [location.search]);

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
      newCartCount[medicine._id] = (newCartCount[medicine._id] || 0) + 1; // Increment count
      setCartCount(newCartCount);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Search Results</h2>
      <Row>
        {searchResults.map((medicine) => (
          <Col key={medicine._id} md={3} className="mb-4">
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
    </Container>
  );
};

export default SearchScreen;
