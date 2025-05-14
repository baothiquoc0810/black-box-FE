import React from 'react';
import { Modal } from 'react-bootstrap';

const ImagePreviewModal = ({ show, onHide, image }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{image?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {image && (
          <div>
            <img 
              src={image.src} 
              alt={image.name}
              style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
            />
            <div className="mt-3">
              <h6>Tags:</h6>
              {image.tags.map((tag, index) => (
                <span key={index} className="badge bg-primary me-1">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ImagePreviewModal; 