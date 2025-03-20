import React from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { XCircle } from 'react-bootstrap-icons';

const ImageGrid = ({ images, onImageUpload, onAddTag, onDeleteImage, onDeleteTag }) => {
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now(),
          src: e.target.result,
          tags: [],
          name: file.name
        };
        onImageUpload(newImage);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Container className="mt-4">
      <div className="mb-4">
        <Form.Group>
          <Form.Label>Upload Image</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </Form.Group>
      </div>

      <Row xs={1} md={3} lg={4} className="g-4">
        {images.map((image) => (
          <Col key={image.id}>
            <Card className="position-relative">
              <div 
                className="position-absolute top-0 end-0 m-2 cursor-pointer"
                onClick={() => onDeleteImage(image.id)}
                style={{ 
                  cursor: 'pointer',
                  zIndex: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '50%'
                }}
              >
                <XCircle size={20} color="red" />
              </div>
              <Card.Img
                variant="top"
                src={image.src}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body>
                <Card.Title>{image.name}</Card.Title>
                <div className="mb-2">
                  {image.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="badge bg-primary me-1 position-relative"
                      style={{ paddingRight: '20px' }}
                    >
                      {tag}
                      <XCircle
                        size={12}
                        className="position-absolute"
                        style={{
                          right: '5px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTag(image.id, tag);
                        }}
                      />
                    </span>
                  ))}
                </div>
                <Form.Group className="d-flex">
                  <Form.Control
                    type="text"
                    placeholder="Add tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const tag = e.target.value.trim();
                        if (tag) {
                          onAddTag(image.id, tag);
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    variant="primary"
                    className="ms-2"
                    onClick={(e) => {
                      const input = e.target.previousElementSibling;
                      const tag = input.value.trim();
                      if (tag) {
                        onAddTag(image.id, tag);
                        input.value = '';
                      }
                    }}
                  >
                    Add
                  </Button>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ImageGrid; 