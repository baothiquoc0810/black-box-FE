import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { XCircle } from 'react-bootstrap-icons';
import ImageService from '../services/imageService';
import UserService from '../services/userService';
import AuthService from '../services/authService';

const ImageGrid = ({ onImageUpload, onAddTag, onDeleteImage, onDeleteTag }) => {
  // Thêm state để lưu trữ images
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState({});
  const [uploadError, setUploadError] = useState(null);
  const [deletingImages, setDeletingImages] = useState({});
  const [deleteSuccess, setDeleteSuccess] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(true); 
  
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    handleGetAllImages();
  }, []);

  const handleGetAllImages = async () => {
    try {
      setIsLoadingImages(true);
      const fetchedImages = await UserService.getAllImages(currentUser.user.userId);
      console.log("images", fetchedImages);
      
      // Set images vào state
      setImages(fetchedImages || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages([]);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const setErrorWithTimeout = (errorMessage) => {
    setUploadError(errorMessage);
    setTimeout(() => {
      setUploadError(null);
    }, 3000);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    
    const previewUrl = URL.createObjectURL(file);
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    
    const previewImage = {
      id: tempId,
      src: previewUrl,
      tags: [],
      name: file.name,
      isUploading: true, 
      isPreview: true 
    };
    
    setPreviewImages(prev => [...prev, previewImage]);
    setUploadingImages(prev => ({ ...prev, [tempId]: true }));
    
    try {
      const response = await ImageService.uploadImage(file);
      
      setPreviewImages(prev => prev.filter(img => img.id !== tempId));
      setUploadingImages(prev => {
        const newState = { ...prev };
        delete newState[tempId];
        return newState;
      });
      
      URL.revokeObjectURL(previewUrl);
      
      const uploadedImage = {
        id: response.id,
        src: response.pictureUrl,
        tags: [],
        name: response.pictureName
      };
      
      // Thêm ảnh mới vào state images
      setImages(prev => [...prev, uploadedImage]);
      
      // Gọi callback nếu có
      if (onImageUpload) {
        onImageUpload(uploadedImage);
      }
      
    } catch (error) {
      console.error('Error uploading image:', error);
      
      setPreviewImages(prev => prev.filter(img => img.id !== tempId));
      setUploadingImages(prev => {
        const newState = { ...prev };
        delete newState[tempId];
        return newState;
      });
      
      URL.revokeObjectURL(previewUrl);
      
      let errorMessage = 'Failed to upload image';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Network error: Please check your connection or CORS settings';
      }
      
      setErrorWithTimeout(errorMessage);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleDeletePreview = (previewId) => {
    const previewImage = previewImages.find(img => img.id === previewId);
    if (previewImage) {
      URL.revokeObjectURL(previewImage.src);
    }
    
    setPreviewImages(prev => prev.filter(img => img.id !== previewId));
    setUploadingImages(prev => {
      const newState = { ...prev };
      delete newState[previewId];
      return newState;
    });
  };

  const handleDeleteImage = async (imageId) => {
    try {
      setDeletingImages(prev => ({ ...prev, [imageId]: true }));
      setDeleteSuccess(null);

      await ImageService.deleteImage(imageId);

      // Xóa ảnh khỏi state images
      setImages(prev => prev.filter(img => img.id !== imageId));

      // Gọi callback nếu có
      if (onDeleteImage) {
        onDeleteImage(imageId);
      }

      setDeleteSuccess('Image deleted successfully');

      setTimeout(() => {
        setDeleteSuccess(null);
      }, 3000);

    } catch (error) {
      console.error('Error deleting image:', error);
      setErrorWithTimeout('Failed to delete image. Please try again.');
    } finally {
      setDeletingImages(prev => {
        const newState = { ...prev };
        delete newState[imageId];
        return newState;
      });
    }
  };

  // Hàm để thêm tag
  const handleAddTag = async (imageId, tag) => {
    try {
      // Cập nhật state local trước
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, tags: [...(img.tags || []), tag] }
          : img
      ));

      // Gọi callback nếu có
      if (onAddTag) {
        onAddTag(imageId, tag);
      }
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  // Hàm để xóa tag
  const handleDeleteTag = async (imageId, tagToDelete) => {
    try {
      // Cập nhật state local trước
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, tags: (img.tags || []).filter(tag => tag !== tagToDelete) }
          : img
      ));

      // Gọi callback nếu có
      if (onDeleteTag) {
        onDeleteTag(imageId, tagToDelete);
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const allImages = [...images, ...previewImages];

  // Hiển thị loading khi đang tải images
  if (isLoadingImages) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading images...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {uploadError && (
        <Alert variant="danger" className="mt-2">
          {uploadError}
        </Alert>
      )}

      {deleteSuccess && (
        <Alert variant="success" className="mt-2">
          {deleteSuccess}
        </Alert>
      )}

      <div className="mb-4">
        <Form.Group>
          <Form.Label>Upload Image</Form.Label>
          <div className="d-flex align-items-center">
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </div>
        </Form.Group>
      </div>

      {allImages.length === 0 ? (
        <div className="text-center text-muted">
          <p>No images found. Upload your first image!</p>
        </div>
      ) : (
        <Row xs={1} md={3} lg={4} className="g-4">
          {allImages.map((image) => (
            <Col key={image.id}>
              <Card className="position-relative">
                {uploadingImages[image.id] && (
                  <div 
                    className="position-absolute top-50 start-50 translate-middle"
                    style={{ zIndex: 3 }}
                  >
                    <Spinner animation="border" variant="primary" />
                  </div>
                )}
                {deletingImages[image.id] && (
                  <div 
                    className="position-absolute top-50 start-50 translate-middle"
                    style={{ zIndex: 3 }}
                  >
                    <Spinner animation="border" variant="danger" />
                  </div>
                )}
                <div 
                  className="position-absolute top-0 end-0 m-2 cursor-pointer"
                  onClick={() => {
                    if (image.isPreview) {
                      handleDeletePreview(image.id);
                    } else {
                      handleDeleteImage(image.id);
                    }
                  }}
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
                  src={image.pictureUrl}
                  style={{ 
                    height: '200px', 
                    objectFit: 'cover',
                    opacity: (uploadingImages[image.id] || deletingImages[image.id]) ? 0.5 : 1 
                  }}
                />
                <Card.Body>
                  <Card.Title>{image.pictureName}</Card.Title>
                  <div className="mb-2">
                    {(image.tags || []).map((tag, index) => (
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
                            handleDeleteTag(image.id, tag);
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
                            handleAddTag(image.id, tag);
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
                          handleAddTag(image.id, tag);
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
      )}
    </Container>
  );
};

export default ImageGrid;