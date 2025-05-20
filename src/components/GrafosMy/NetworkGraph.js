import React, { useEffect, useCallback, useState, useRef } from 'react';
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
  const centerAttemptCountRef = useRef(0);
  const maxCenterAttempts = 5;
  
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

  const centerNetwork = useCallback(() => {
    if (!networkRef.current) return;
    
    centerAttemptCountRef.current += 1;
    
    try {
      requestAnimationFrame(() => {
        networkRef.current.redraw();
        networkRef.current.fit({
          animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad'
          },
          scale: 0.9
        });
      });
      
      return true;
    } catch (error) {
      console.error("Error centering network:", error);
      return false;
    }
  }, [networkRef]);

  const attemptCenterWithRetry = useCallback(() => {
    centerAttemptCountRef.current = 0;
    
    setTimeout(() => {
      centerNetwork();
      
      const retryDelays = [300, 700, 1500, 3000];
      
      retryDelays.forEach((delay, index) => {
        setTimeout(() => {
          if (centerAttemptCountRef.current < maxCenterAttempts) {
            centerNetwork();
          }
        }, delay);
      });
    }, 50);
  }, [centerNetwork]);

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
    
    networkRef.current.once('stabilized', () => {
      attemptCenterWithRetry();
    });
    
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, [
    images, 
    tagRelationships, 
    containerRef, 
    edgesRef, 
    handleNetworkClick, 
    networkRef, 
    nodesRef, 
    centerNetwork,
    attemptCenterWithRetry
  ]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(90vh - 135px)' }}>
      <div 
        ref={containerRef} 
        id="mynetwork" 
        style={{ 
          width: '100%', 
          height: '100%',
          border: '1px solid #e9ecef',
          background: '#ffffff',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
          borderRadius: '0px 0px 5px 5px'
        }}
      />
    </div>
  );
};

export default NetworkGraph;