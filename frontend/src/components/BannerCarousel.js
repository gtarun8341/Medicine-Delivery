import React, { useState, useEffect } from 'react';
import { Carousel } from 'react-bootstrap';
import axios from 'axios';

const BannerCarousel = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/banner-images');
        setImages(response.data);
      } catch (error) {
        console.error('Error fetching banner images:', error);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="container my-4">
      <Carousel
        controls={true}
        indicators={true}
        interval={2000} // Auto scroll interval in milliseconds
        pause="hover" // Pause on hover
        fade // Optional: adds a fading effect
      >
        {images.map((image, index) => (
          <Carousel.Item key={index}>
            <img
              className="d-block w-100"
              src={image.url}
              alt={`Slide ${index + 1}`}
              style={{
                height: '300px',
                objectFit: 'cover',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              }}
            />
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default BannerCarousel;
