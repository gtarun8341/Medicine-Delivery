import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebook, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#28a745', // Green background
        color: '#fff', // White text
        padding: '20px',
        flexShrink: '0',
        width: '100%',
      }}
    >
      <Container>
        <Row className="justify-content-md-center">
          <Col md={4}>
            <h5 style={{ color: '#d4edda' }}>Contact Us</h5> {/* Light green color for the headings */}
            <p>Email: example@example.com</p>
            <p>Phone: 123-456-7890</p>
          </Col>
          <Col md={4}>
            <h5 style={{ color: '#d4edda' }}>About Us</h5>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla fringilla justo sit amet massa maximus placerat.</p>
          </Col>
          <Col md={4}>
            <h5 style={{ color: '#d4edda' }}>Follow Us</h5>
            <p>
              <a href="https://www.facebook.com/example" target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}>
                <FaFacebook size={30} />
              </a>
              <a href="https://www.instagram.com/example" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', marginLeft: '10px' }}>
                <FaInstagram size={30} />
              </a>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
