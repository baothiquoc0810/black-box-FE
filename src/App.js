import React, { useState, useEffect } from 'react';
import ImageGrid from "./components/ImageGrid.js";
import GrafosMy from "./components/GrafosMy/index.js";
import TagRelationships from "./components/TagRelationships.js";
import { Container, Tabs, Tab, Button, Dropdown } from 'react-bootstrap';
import Register from "./components/Register.js";
import Login from "./components/Login.js";
import AuthService from './services/authService';
import Loading from './components/Loading';

function App() {
  const [images, setImages] = useState([]);
  const [tagRelationships, setTagRelationships] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const user = AuthService.getCurrentUser();
    if (user){
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleImageUpload = (newImage) => {
    setImages(prev => [...prev, newImage]);
  };

  const handleAddTag = (imageId, tag) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, tags: [...img.tags, tag] }
        : img
    ));
  };

  const handleDeleteImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleDeleteTag = (imageId, tagToDelete) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, tags: img.tags.filter(tag => tag !== tagToDelete) }
        : img
    ));
  };

  const handleAddTagRelation = (parentTag, childTag) => {
    setTagRelationships(prev => {
      // Check if relationship already exists
      const exists = prev.some(
        rel => rel.parent === parentTag && rel.child === childTag
      );
      if (!exists) {
        return [...prev, { parent: parentTag, child: childTag }];
      }
      return prev;
    });
  };

  const handleDeleteTagRelation = (parentTag, childTag) => {
    setTagRelationships(prev => 
      prev.filter(rel => !(rel.parent === parentTag && rel.child === childTag))
    );
  };

  const handleRegisterSuccess = (response) => {
    setCurrentUser(response);
    setIsAuthenticated(true);
  };

  const handleLoginSuccess = (response) => {
    setCurrentUser(response);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return (
      <div>
        {showLogin ? (
          <>
            <Login onLoginSuccess={handleLoginSuccess} />
            <div className="text-center mt-3">
              <p>
                Chưa có tài khoản?{' '}
                <Button 
                  variant="link" 
                  onClick={() => setShowLogin(false)}
                >
                  Đăng ký ngay
                </Button>
              </p>
            </div>
          </>
        ) : (
          <>
            <Register onRegisterSuccess={handleRegisterSuccess} />
            <div className="text-center mt-3">
              <p>
                Đã có tài khoản?{' '}
                <Button 
                  variant="link" 
                  onClick={() => setShowLogin(true)}
                >
                  Đăng nhập
                </Button>
              </p>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="App">
      <Container fluid>
      <div className="d-flex justify-content-end p-2">
          <Dropdown align="end">
            <Dropdown.Toggle 
              variant="light" 
              id="dropdown-profile"
              className="d-flex align-items-center"
            >
              <i className="bi bi-person-circle me-2"></i>
              {currentUser?.username}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item>
                <i className="bi bi-person me-2"></i>
                Thông tin cá nhân
              </Dropdown.Item>
              <Dropdown.Item>
                <i className="bi bi-gear me-2"></i>
                Cài đặt
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Đăng xuất
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <Tabs defaultActiveKey="grid" className="mb-3">
          <Tab eventKey="grid" title="Grid View">
            <ImageGrid 
              images={images}
              onImageUpload={handleImageUpload}
              onAddTag={handleAddTag}
              onDeleteImage={handleDeleteImage}
              onDeleteTag={handleDeleteTag}
            />
          </Tab>
          <Tab eventKey="network" title="Network View">
            <div className="d-flex" style={{ height: 'calc(100vh - 120px)'}}>
            <TagRelationships 
              images={images} 
              onAddTagRelation={handleAddTagRelation}
            />
            <GrafosMy 
              images={images}
              tagRelationships={tagRelationships}
              onDeleteTagRelation={handleDeleteTagRelation}
              onDeleteImage={handleDeleteImage}
              onDeleteTag={handleDeleteTag}
            />
            </div>
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
}

export default App;
