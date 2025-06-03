import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { getTagName } from '../utils/commonHelper';

const TagRelationships = ({ images, onAddTagRelation }) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedParentTag, setSelectedParentTag] = useState('');
  const [selectedChildTag, setSelectedChildTag] = useState('');

  // Extract unique tags from images
  useEffect(() => {
    const tags = new Set();
    images.forEach(image => {
      if (image.tags) {
        image.tags.forEach(tag => {
          const tagName = getTagName(tag);
          if (tagName) tags.add(tagName);
        });
      }
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
    <div className="mb-4 p-3 border rounded bg-light" style={{ width: '20%', marginRight: '20px' }}>
      <h5 style={{ borderBottom: '1px solid #e9ecef', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Link Tags</h5>
      <Form onSubmit={handleSubmit}>
        <div className="d-flex gap-3 align-items-center flex-column">
          <Form.Group className="mb-0 flex-grow-1 w-100">
            <Form.Label className='d-flex align-self-start'>Parent Tag</Form.Label>
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
          <Form.Group className="mb-0 flex-grow-1 w-100">
            <Form.Label className='d-flex align-self-start'>Child Tag</Form.Label>
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