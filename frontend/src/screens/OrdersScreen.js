import React, { useState, useEffect } from 'react';
import { Container,Row,Col, Table, Button, Image, Card, ListGroup,Form } from 'react-bootstrap';
import axios from 'axios';

const OrdersScreen = ({ userId }) => {
    const [orders, setOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchOrders = async () => {
        const accessToken = localStorage.getItem('token');

        try {
            const response = await axios.get('http://localhost:5000/api/orders', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const fetchedOrders = response.data;
            setOrders(fetchedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };
  
    useEffect(() => {
        fetchOrders();
    }, []);
    const filteredOrders = statusFilter === 'All' ? orders : orders.filter(order => order.status === statusFilter);

    return (
      <Container>
        <h2 className="my-4">Orders</h2>
        <Row>
          <Col md={3}>
            <h4>Filter by Status</h4>
            <Form.Control as="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Order placed">Order placed</option>
              <option value="On Delivery">On Delivery</option>
              <option value="Delivered">Delivered</option>
              {/* Add more options as needed */}
            </Form.Control>
          </Col>
          <Col md={9}>
            {filteredOrders.length === 0 ? (
              <p>No orders found</p>
            ) : (
              filteredOrders.map((order, index) => (
                <Card className="mb-4" key={index}>
                  <Card.Header as="h5">Order ID: {index + 1}</Card.Header>
                  <Card.Body>
                    <Card.Title>{order.name}</Card.Title>
                    <ListGroup variant="flush">
                      <ListGroup.Item><strong>Address:</strong> {order.address}</ListGroup.Item>
                      <ListGroup.Item><strong>Total Price:</strong> ${order.totalPrice.toFixed(2)}</ListGroup.Item>
                      <ListGroup.Item><strong>Status:</strong> {order.status}</ListGroup.Item>
                    </ListGroup>
                  </Card.Body>
                </Card>
              ))
            )}
          </Col>
        </Row>
      </Container>
    );
  };
  
  export default OrdersScreen;