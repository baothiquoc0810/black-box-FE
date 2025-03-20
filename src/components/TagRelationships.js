import React, { useState, useEffect } from 'react';
import { Form, Button, ListGroup } from 'react-bootstrap';

const TagRelationships = ({ images, onAddTagRelation }) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedParentTag, setSelectedParentTag] = useState('');
  const [selectedChildTag, setSelectedChildTag] = useState('');

  // Extract unique tags from images
  useEffect(() => {
    const tags = new Set();
    images.forEach(image => {
      image.tags.forEach(tag => tags.add(tag));
    });
    setAvailableTags(Array.from(tags));
  }, [images]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedParentTag && selectedChildTag && selectedParentTag !== selectedChildTag) {
      onAddTagRelation(selectedParentTag, selectedChildTag);
      setSelectedParentTag('');
      setSelectedChildTag('');
    }
  };

  return (
    <div className="mb-4 p-3 border rounded bg-light">
      <h5>Link Tags</h5>
      <Form onSubmit={handleSubmit}>
        <div className="d-flex gap-3 align-items-end">
          <Form.Group className="mb-0 flex-grow-1">
            <Form.Label>Parent Tag</Form.Label>
            <Form.Select
              value={selectedParentTag}
              onChange={(e) => setSelectedParentTag(e.target.value)}
            >
              <option value="">Select parent tag...</option>
              {availableTags.map(tag => (
                <option key={`parent-${tag}`} value={tag}>{tag}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-0 flex-grow-1">
            <Form.Label>Child Tag</Form.Label>
            <Form.Select
              value={selectedChildTag}
              onChange={(e) => setSelectedChildTag(e.target.value)}
              disabled={!selectedParentTag}
            >
              <option value="">Select child tag...</option>
              {availableTags
                .filter(tag => tag !== selectedParentTag)
                .map(tag => (
                  <option key={`child-${tag}`} value={tag}>{tag}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Button 
            type="submit" 
            variant="primary"
            disabled={!selectedParentTag || !selectedChildTag}
          >
            Link Tags
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default TagRelationships; 