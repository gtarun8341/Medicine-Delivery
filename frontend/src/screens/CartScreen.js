import React, { useEffect, useState } from 'react';
import { Container,Row,Col, Table, Button, Image, Card, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CartScreen = ({ removeFromCart }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState({});
  const [loading, setLoading] = useState(true); // Add loading state

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
          
          const cartItemsData = response.data;

          console.log('Cart Items Data:', cartItemsData); // Log cart items data

          if (Array.isArray(cartItemsData)) {
            setCartItems(cartItemsData);
            const counts = cartItemsData.reduce((acc, item) => {
              acc[item.medicine._id] = item.count || 1; // Update to store count directly
              return acc;
            }, {});
            console.log('Counts:', counts); // Log cart item counts
            setCartCount(counts);
          } else {
            console.error('Error fetching cart items: Response data is not an array');
          }
        }
      } catch (error) {
        console.error('Error fetching cart items:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchCartItems();
  }, []);

  // Handle removal of item from cart
  const handleRemoveFromCart = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to be logged in to remove items from the cart.');
        return;
      }

      await axios.delete(`http://localhost:5000/api/cart/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update cart items and counts after removal
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const updatedCartItems = response.data;
      setCartItems(updatedCartItems);
      const counts = updatedCartItems.reduce((acc, item) => {
        acc[item.medicine._id] = item.count || 1; // Update to store count directly
        return acc;
      }, {});
      setCartCount(counts);
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  // Check if loading
  if (loading) {
    return <p>Loading...</p>;
  }

  // Calculate total price
  const totalPrice = cartItems.reduce((acc, item) => acc + item.medicine.price * cartCount[item.medicine._id], 0);

  return (
    <Container>
      <h2 className="my-4">Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div>
          <Row>
            <Col md={8}>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Added</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.medicine._id}>
                      <td><Image src={`http://localhost:5000/${item.medicine.imageUrl.replace(/\\/g, '/')}`} style={{ width: '50px', height: '50px' }} /></td>
                      <td>{item.medicine.name}</td>
                      <td>${item.medicine.price}</td>
                      <td>{cartCount[item.medicine._id]}</td> {/* Update to access count using item.medicine._id */}
                      <td>${item.medicine.price * (cartCount[item.medicine._id] || 0)}</td> {/* Update to use medicine price */}
                      <td>
                        <Button variant="danger" onClick={() => handleRemoveFromCart(item.medicine._id)}>Remove</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
            <Col md={4}>
              <Card>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <h4 className="mb-3">Order Summary</h4>
                    <p><strong>Items:</strong> {cartItems.length}</p>
                    <p><strong>Total Price:</strong> ${totalPrice.toFixed(2)}</p>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Link to="/checkout">
                      <Button variant="primary" block>Proceed to Checkout</Button>
                    </Link>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </Container>
  );
};

export default CartScreen;