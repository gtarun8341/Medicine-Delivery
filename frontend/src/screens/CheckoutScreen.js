import React, { useEffect, useState } from 'react';
import { Container,Row,Col, Table, Button, Image, Card, ListGroup,Form } from 'react-bootstrap';
import axios from 'axios';

const CheckoutScreen = ({ cartItems, clearCart }) => {
  const [totalPrice, setTotalPrice] = useState(0);

  // Update total price whenever cart items change
  useEffect(() => {
    const calculateTotalPrice = () => {
      const total = cartItems.reduce((acc, item) => {
        if (item && item.medicine && item.medicine.price) {
          return acc + item.medicine.price * item.count;
        }
        return acc;
      }, 0);
      setTotalPrice(total);
    };

    calculateTotalPrice();
  }, [cartItems]);

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');

    const orderData = {
      name: document.getElementById('formName').value,
      address: document.getElementById('formAddress').value,
      email: document.getElementById('formEmail').value,
      phone: document.getElementById('formPhone').value,
      totalPrice: totalPrice, // Use the totalPrice state directly
      items: cartItems.map(item => ({
        name: item.medicine.name,
        price: item.medicine.price,
        quantity: item.count,
      })),
    };

    try {
      console.log("Order Data:", orderData); 
      const response = await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const newOrder = response.data;
      console.log("New Order:", newOrder); 
      await clearCart();  // Ensure cart is cleared after order is placed
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  if (cartItems.length === 0) {
    return <p>Your cart is empty</p>;
  }

  return (
    <Container>
      <h2 className="my-4">Checkout</h2>
      <Row>
        <Col md={8}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                item && item.medicine ? (
                  <tr key={item.medicine._id}>
                    <td>{item.medicine.name}</td>
                    <td>${item.medicine.price}</td>
                    <td>{item.count}</td>
                    <td>${item.medicine.price * item.count}</td>
                  </tr>
                ) : null
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
                <Button variant="primary" type="button" onClick={handleCheckout} block>
                  Place Order
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
      <Form>
        <Form.Group controlId="formName">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" placeholder="Enter your name" />
        </Form.Group>
        <Form.Group controlId="formAddress">
          <Form.Label>Address</Form.Label>
          <Form.Control type="text" placeholder="Enter your address" />
        </Form.Group>
        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" placeholder="Enter your email" />
        </Form.Group>
        <Form.Group controlId="formPhone">
          <Form.Label>Phone</Form.Label>
          <Form.Control type="text" placeholder="Enter your phone number" />
        </Form.Group>
      </Form>
    </Container>
  );
};

export default CheckoutScreen;