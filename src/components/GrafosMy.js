import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Modal } from 'react-bootstrap';

const GrafosMy = ({ images, tagRelationships, onDeleteImage, onDeleteTag }) => {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const nodesRef = useRef(new DataSet([]));
  const edgesRef = useRef(new DataSet([]));
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Create nodes for images
    const imageNodes = images.map(image => ({
      id: `image_${image.id}`,
      image: image.src,
      title: image.name,
      shape: 'circularImage',
      size: 30,
      font: {
        size: 12
      },
      group: 'images',
    }));

    // Create nodes for tags and edges
    const tagNodes = [];
    const edges = [];
    const tagCount = {};

    // Count how many images have each tag
    images.forEach(image => {
      image.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    // Create tag nodes for tags that appear in multiple images
    Object.entries(tagCount).forEach(([tag, count]) => {
      if (count >= 2) {
        tagNodes.push({
          id: `tag_${tag}`,
          label: tag,
          title: tag,
          shape: 'circle',
          margin: 20,
          color: {
            background: '#e1f5fe',
            border: '#0288d1'
          },
          font: {
            size: 14,
            weight: 'bold'
          },
          group: 'tags',
        });

        // Create edges from tag to images
        images.forEach(image => {
          if (image.tags.includes(tag)) {
            edges.push({
              from: `tag_${tag}`,
              to: `image_${image.id}`,
              title: `Tagged as ${tag}`,
              color: '#0288d1',
            });
          }
        });
      }
    });

    // Add edges for tag relationships
    if (tagRelationships) {
      tagRelationships.forEach(rel => {
        if (nodesRef.current.get(`tag_${rel.parent}`) && nodesRef.current.get(`tag_${rel.child}`)) {
          edges.push({
            from: `tag_${rel.parent}`,
            to: `tag_${rel.child}`,
            arrows: 'to',
            dashes: true,
            width: 2,
            title: `${rel.parent} → ${rel.child}`
          });
        }
      });
    }

    nodesRef.current = new DataSet([...imageNodes, ...tagNodes]);
    edgesRef.current = new DataSet(edges);

    const data = {
      nodes: nodesRef.current,
      edges: edgesRef.current,
    };

    const options = {
      nodes: {
        shape: 'image',
        size: 30,
        font: {
          size: 12
        },
        borderWidth: 2,
        shadow: true,
      },
      edges: {
        width: 2,
        smooth: {
          type: 'continuous',
          roundness: 0.5
        },
        font: {
          size: 10
        }
      },
      physics: {
        enabled: true,
        solver: 'forceAtlas2Based',
        stabilization: {
          enabled: true,
          iterations: 200,  // Increase for better initial positioning
          updateInterval: 25
        },
        forceAtlas2Based: {
          gravitationalConstant: -50,
          centralGravity: 0.01,
          springLength: 100,
          springConstant: 0.08,
          damping: 0.4,
          avoidOverlap: 0.8
        }
      },
      interaction: {
        hover: true,
        dragNodes: true,
        dragView: true,
        zoomView: true
      }
    };

    networkRef.current = new Network(containerRef.current, data, options);

    // Add click event handler
    networkRef.current.on('click', function(params) {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        if (nodeId.startsWith('image_')) {
          const imageId = parseInt(nodeId.split('_')[1]);
          const image = images.find(img => img.id === imageId);
          if (image) {
            setSelectedImage(image);
            setShowPreview(true);
          }
        }
      }
    });

    // Center the network after it's stabilized
    networkRef.current.on('stabilizationProgress', function(params) {
      if (params.iterations === params.total) {
        networkRef.current.fit({
          animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad'
          }
        });
      }
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, [images, tagRelationships, onDeleteImage, onDeleteTag]);

  const centerNetwork = () => {
    networkRef.current.fit({
      animation: {
        duration: 1000,
        easingFunction: 'easeInOutQuad'
      }
    });
  };

  return (
    <div id="app">
      <div style={{ 
        padding: '15px',
        background: '#f8f9fa',
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        <Button 
          className="btn btn-primary" 
          onClick={centerNetwork}
          style={{
            backgroundColor: '#0288d1',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease-in-out'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <i className="fas fa-compress-arrows-alt me-2"></i>
          Center Network
        </Button>
      </div>
      <div 
        ref={containerRef} 
        id="mynetwork" 
        style={{ 
          width: '100%', 
          height: 'calc(90vh - 80px)', // Adjusted for better full-screen experience
          border: '1px solid #e9ecef',
          background: '#ffffff',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
        }} 
      />

      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedImage?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedImage && (
            <div>
              <img 
                src={selectedImage.src} 
                alt={selectedImage.name}
                style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
              <div className="mt-3">
                <h6>Tags:</h6>
                {selectedImage.tags.map((tag, index) => (
                  <span key={index} className="badge bg-primary me-1">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GrafosMy;