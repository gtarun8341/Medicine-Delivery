import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Card, Col, Row } from 'react-bootstrap';

const AdminBannerForm = () => {
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const fetchImages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/banner-images');
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching banner images:', error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleImageChange = (e) => {
    setNewImageUrl(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:5000/api/banner-images', { url: newImageUrl });
      setNewImageUrl('');
      fetchImages(); // Refresh the images list
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/banner-images/${id}`);
      setImages(images.filter(image => image._id !== id));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  return (
    <Container>
      <h1 className="mb-4">Manage Banner Images</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group as={Row} controlId="imageUrlInput">
          <Form.Label column sm="2">Enter Image URL:</Form.Label>
          <Col sm="8">
            <Form.Control type="text" value={newImageUrl} onChange={handleImageChange} />
          </Col>
          <Col sm="2">
            <Button variant="primary" type="submit">Add Image</Button>
          </Col>
        </Form.Group>
      </Form>

      <div className="mt-4">
        <h2>Current Images</h2>
        <Row>
          {images.map((image) => (
            <Col key={image._id} md="3" className="mb-3">
              <Card>
                <Card.Img variant="top" src={image.url} alt="Banner" style={{ width: '100%', height: '150px' }} />
                <Card.Body>
                  <Button variant="danger" onClick={() => handleDelete(image._id)}>Delete</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </Container>
  );
};

export default AdminBannerForm;
