import React, { useState } from 'react';
import ImageGrid from "./components/ImageGrid.js";
import GrafosMy from "./components/GrafosMy.js";
import TagRelationships from "./components/TagRelationships.js";
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';

function App() {
  const [images, setImages] = useState([]);
  const [tagRelationships, setTagRelationships] = useState([]);

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

  return (
    <div className="App">
      <Container fluid>
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
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
}

export default App;
