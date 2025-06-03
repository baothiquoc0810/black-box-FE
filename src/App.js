import React, { useState, useEffect } from 'react';
import ImageGrid from "./components/ImageGrid.js";
import GrafosMy from "./components/GrafosMy/index.js";
import TagRelationships from "./components/TagRelationships.js";
import { Container, Tabs, Tab, Button, Dropdown } from 'react-bootstrap';
import Register from "./components/Register.js";
import Login from "./components/Login.js";
import AuthService from './services/authService';
import Loading from './components/Loading';
import UserService from './services/userService';
import TagService from './services/tagService';

function App() {
  const [images, setImages] = useState([]);
  const [tagRelationships, setTagRelationships] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);


  const loadUser = async () => {
    setIsUserLoading(true);
    try {
      const user = AuthService.getCurrentUser();
      try {
        const response = await AuthService.verifyUser(user.userId);
        if (response) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          await loadImages(user.userId);
        } else {
          setIsAuthenticated(false);
          AuthService.logout();
          setCurrentUser(null);
          setShowLogin(true);
        }
      } catch (error) {
        console.error('Error verifying user:', error);
        AuthService.logout();
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      // Nếu có lỗi khi load user, đăng xuất
      AuthService.logout();
      setCurrentUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsUserLoading(false);
      setIsLoading(false);

    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadUser();
    }
  }, [isAuthenticated]);

  const loadImages = async (userId) => {
    try {
      const fetchedImages = await UserService.getAllImages(userId);
      const imagesWithTags = await Promise.all(
        fetchedImages.map(async (picture) => {
          try {
            const tags = await TagService.getAllTags(picture.id);
            const processedTags = Array.isArray(tags) ? tags : [];
            return { ...picture, tags: processedTags };
          } catch (error) {
            console.error(`Error loading tags for image ${picture.id}:`, error);
            return { ...picture, tags: [] };
          }
        })
      );
      setImages(imagesWithTags || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages([]);
    }
  };

  const handleImageUpload = (newImage) => {
    setImages(prev => [...prev, newImage]);
  };

  const loadTagsForImage = async (imageId) => {
    try {
      const tags = await TagService.getAllTags(imageId);
      const processedTags = Array.isArray(tags) ? tags : [];

      setImages(prev => prev.map(img =>
        img.id === imageId
          ? { ...img, tags: processedTags }
          : img
      ));
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleAddTag = async (imageId, tag) => {
    try {
      console.log("Adding tag:", tag);
      await TagService.insertTag(imageId, tag);
      await loadTagsForImage(imageId);
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleDeleteImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleDeleteTag = async (imageId, tagToDelete) => {
    try {
      await TagService.deleteTag(imageId, tagToDelete);
      await loadTagsForImage(imageId);
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
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

  const handleRegisterSuccess = async (response) => {
    try {
      // Verify user ngay sau khi đăng ký thành công
      const verifyResponse = await AuthService.verifyUser(response.userId);
      if (verifyResponse) {
        setCurrentUser(response);
        setIsAuthenticated(true);
      } else {
        // Nếu verify thất bại
        AuthService.logout();
        setCurrentUser(null);
        setIsAuthenticated(false);
        setShowLogin(true);
      }
    } catch (error) {
      console.error('Error verifying user after register:', error);
      AuthService.logout();
      setCurrentUser(null);
      setIsAuthenticated(false);
      setShowLogin(true);
    }
  };

  const handleLoginSuccess = async (response) => {
    try {
      // Verify user ngay sau khi đăng nhập thành công
      const verifyResponse = await AuthService.verifyUser(response.userId);
      if (verifyResponse) {
        setCurrentUser(response);
        setIsAuthenticated(true);
      } else {
        // Nếu verify thất bại
        AuthService.logout();
        setCurrentUser(null);
        setIsAuthenticated(false);
        setShowLogin(true);
      }
    } catch (error) {
      console.error('Error verifying user after login:', error);
      AuthService.logout();
      setCurrentUser(null);
      setIsAuthenticated(false);
      setShowLogin(true);
    }
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
              {isUserLoading ? (
                <span className="ms-2">Loading...</span>
              ) : (
                <span className="ms-2">{currentUser?.username}</span>
              )}
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
            <div className="d-flex" style={{ height: 'calc(100vh - 120px)' }}>
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
