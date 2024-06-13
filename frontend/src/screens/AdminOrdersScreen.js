import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Dropdown } from 'react-bootstrap';

const AdminOrdersScreen = () => {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('All');

    const fetchOrders = async () => {
        try {
            const accessToken = localStorage.getItem('adminToken');
            if (!accessToken) {
                console.error('Admin token not found');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/orders/admin', {
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

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const accessToken = localStorage.getItem('adminToken');
            if (!accessToken) {
                console.error('Admin token not found');
                return;
            }

            await axios.put(
                `http://localhost:5000/api/orders/${orderId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            // Update the local state or fetch orders again to reflect the changes
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };
    const filteredOrders = filter === 'All' ? orders : orders.filter(order => order.status === filter);
    return (
        <div className="container mt-4">
            <h2 className="mb-4">Admin Orders</h2>
            <Dropdown onSelect={(selectedKey) => setFilter(selectedKey)}>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                    Filter Orders
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    <Dropdown.Item eventKey="All">All</Dropdown.Item>
                    <Dropdown.Item eventKey="Order placed">Order Placed</Dropdown.Item>
                    <Dropdown.Item eventKey="On Delivery">On Delivery</Dropdown.Item>
                    <Dropdown.Item eventKey="Delivered">Delivered</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown> 
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Phone</th>
                        <th>Item name</th>
                        <th>Quantity</th>
                        <th>Total Price</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                {filteredOrders.map((order) => (
                        <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.name}</td>
                            <td>{order.address}</td>
                            <td>{order.phone}</td>
                            <td>
            {order.items.map((item) => (
                <p key={item._id}>{item.name}</p>
            ))}
        </td>
        <td>
            {order.items.map((item) => (
                <p key={item._id}>{item.quantity}</p>
            ))}
        </td>
                            <td>${order.totalPrice.toFixed(2)}</td>
                            <td>{order.status}</td>
                            <td>
                                <Dropdown>
                                    <Dropdown.Toggle variant="info" id="dropdown-basic">
                                        Change Status
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={() => handleStatusUpdate(order._id, 'Order Placed')}>Order Placed</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleStatusUpdate(order._id, 'On Delivery')}>On Delivery</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleStatusUpdate(order._id, 'Delivered')}>Delivered</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default AdminOrdersScreen;
