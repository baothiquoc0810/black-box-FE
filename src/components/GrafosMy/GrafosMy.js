import React, { useState } from 'react';
import NetworkGraph from './NetworkGraph';
import ControlPanel from './ControlPanel';
import ImagePreviewModal from './ImagePreviewModal';
import useNetworkGraph from '../../hooks/useNetworkGraph';
import 'bootstrap/dist/css/bootstrap.min.css';

const GrafosMy = ({ images, tagRelationships, onDeleteTagRelation, onDeleteImage, onDeleteTag }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState(null);

  const {
    containerRef,
    networkRef,
    nodesRef,
    edgesRef,
    handleDeleteEdge,
    centerNetwork
  } = useNetworkGraph({
    images,
    tagRelationships,
    onDeleteTagRelation,
    onDeleteImage,
    onDeleteTag,
    setSelectedImage,
    setShowPreview,
    setSelectedEdge
  });

  const handleDeleteEdgeClick = () => {
    handleDeleteEdge(selectedEdge);
  };

  return (
    <div id="app">
      <ControlPanel 
        selectedEdge={selectedEdge}
        onDeleteEdge={handleDeleteEdgeClick}
        onCenterNetwork={centerNetwork}
      />
      
      <NetworkGraph 
        containerRef={containerRef}
        networkRef={networkRef}
        nodesRef={nodesRef}
        edgesRef={edgesRef}
        images={images}
        tagRelationships={tagRelationships}
        setSelectedImage={setSelectedImage}
        setShowPreview={setShowPreview}
        setSelectedEdge={setSelectedEdge}
      />

      <ImagePreviewModal 
        show={showPreview}
        onHide={() => setShowPreview(false)}
        image={selectedImage}
      />
    </div>
  );
};

export default GrafosMy; 