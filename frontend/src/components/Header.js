import React, { useState } from 'react';
import { Navbar, Nav, Container, Form, FormControl, Button, Row, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';

const Header = ({ isAuthenticated, isAdminAuthenticated, handleLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate(); // Access the navigate function from useNavigate hook

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== '') {
      // Navigate to search page with search term in URL using navigate function
      navigate(`/search?term=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header>
      <Navbar expand="lg" collapseOnSelect style={{ backgroundColor: '#28a745', color: '#fff' }}>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand style={{ color: '#fff' }}>Medicine Delivery</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Row className="mx-auto w-100">
              <Col md={8}>
                <Form inline onSubmit={handleSearch} className="d-flex">
                  <FormControl
                    type="text"
                    placeholder="Search for medicines..."
                    className="mr-sm-2 flex-grow-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ borderColor: '#28a745' }}
                  />
                  <Button variant="outline-light" type="submit">Search</Button>
                </Form>
              </Col>
            </Row>
            <Nav className="ml-auto">
              {isAuthenticated && !isAdminAuthenticated && (
                <>
                  <LinkContainer to="/cart">
                    <Nav.Link style={{ color: '#fff' }}><i className="fas fa-shopping-cart"></i> Cart</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/orders">
                    <Nav.Link style={{ color: '#fff' }}><i className="fas fa-user"></i> Orders</Nav.Link>
                  </LinkContainer>
                  <Nav.Link onClick={handleLogout} style={{ color: '#fff' }}><i className="fas fa-sign-out-alt"></i> Logout</Nav.Link>
                </>
              )}
              {isAdminAuthenticated && (
                <>
                  <LinkContainer to="/adminpage">
                    <Nav.Link style={{ color: '#fff' }}><i className="fas fa-cogs"></i> upload</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/adminorder">
                    <Nav.Link style={{ color: '#fff' }}><i className="fas fa-tasks"></i> Orders</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/admin/banners">
                    <Nav.Link style={{ color: '#fff' }}><i className="fas fa-tasks"></i> banners</Nav.Link>
                  </LinkContainer>
                  <Nav.Link onClick={handleLogout} style={{ color: '#fff' }}><i className="fas fa-sign-out-alt"></i> Logout</Nav.Link>
                </>
              )}
              {!isAuthenticated && !isAdminAuthenticated && (
                <>
                  <LinkContainer to="/login">
                    <Nav.Link style={{ color: '#fff' }}><i className="fas fa-user"></i> Login</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/register">
                    <Nav.Link style={{ color: '#fff' }}><i className="fas fa-user"></i> Register</Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
