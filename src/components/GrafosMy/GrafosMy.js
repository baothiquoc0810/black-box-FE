import React, { useState } from 'react';
import NetworkGraph from './NetworkGraph';
import ControlPanel from './ControlPanel';
import ImagePreviewModal from './ImagePreviewModal';
import useNetworkGraph from '../../hooks/useNetworkGraph';
import 'bootstrap/dist/css/bootstrap.min.css';

const GrafosMy = ({ images, tagRelationships, onDeleteTagRelation, onDeleteImage, onDeleteTag }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedEdges, setSelectedEdges] = useState([]);

  const {
    containerRef,
    networkRef,
    nodesRef,
    edgesRef,
    handleDeleteEdges,
    centerNetwork
  } = useNetworkGraph({
    images,
    tagRelationships,
    onDeleteTagRelation,
    onDeleteImage,
    onDeleteTag,
    setSelectedImage,
    setShowPreview,
    setSelectedEdges
  });

  const handleDeleteEdgesClick = () => {
    handleDeleteEdges(selectedEdges);
  };

  return (
    <div id="app">
      <ControlPanel 
        selectedEdges={selectedEdges}
        onDeleteEdges={handleDeleteEdgesClick}
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
        setSelectedEdges={setSelectedEdges}
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