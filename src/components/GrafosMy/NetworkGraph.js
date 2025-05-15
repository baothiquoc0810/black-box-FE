import React, { useEffect, useCallback } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { createNetworkData, createNetworkOptions } from '../../utils/networkHelpers';

const NetworkGraph = ({
  containerRef,
  networkRef,
  nodesRef,
  edgesRef,
  images,
  tagRelationships,
  setSelectedImage,
  setShowPreview,
  setSelectedEdges
}) => {
  const handleNetworkClick = useCallback((params) => {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      if (nodeId.startsWith('image_')) {
        const imageId = parseInt(nodeId.split('_')[1]);
        const image = images.find(img => img.id === imageId);
        if (image) {
          setSelectedImage(image);
          setShowPreview(true);
          setSelectedEdges(null);
        }
        return;
      }
    }

    if (params.edges.length > 0) {
      setSelectedEdges(params.edges);
      setShowPreview(false);
    } else {
      setSelectedEdges(null);
      setShowPreview(false);
    }
  }, [images, setSelectedImage, setShowPreview, setSelectedEdges]);

  const handleStabilization = useCallback((params) => {
    if (params.iterations === params.total) {
      networkRef.current.fit({
        animation: {
          duration: 1000,
          easingFunction: 'easeInOutQuad'
        }
      });
    }
  }, [networkRef]);

  useEffect(() => {
    const { nodes, edges } = createNetworkData(images, tagRelationships);
    nodesRef.current = new DataSet(nodes);
    edgesRef.current = new DataSet(edges);

    const data = {
      nodes: nodesRef.current,
      edges: edgesRef.current,
    };

    const options = createNetworkOptions();
    networkRef.current = new Network(containerRef.current, data, options);

    networkRef.current.on('click', handleNetworkClick);
    networkRef.current.on('stabilizationProgress', handleStabilization);

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, [images, tagRelationships, containerRef, edgesRef, handleNetworkClick, handleStabilization, networkRef, nodesRef]);

  return (
    <div 
      ref={containerRef} 
      id="mynetwork" 
      style={{ 
        width: '100%', 
        height: 'calc(90vh - 80px)',
        border: '1px solid #e9ecef',
        background: '#ffffff',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
      }} 
    />
  );
};

export default NetworkGraph; 