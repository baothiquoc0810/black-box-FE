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
  const timeoutIdsRef = useRef([]); // Lưu trữ các timeout IDs
  const animationFrameIdRef = useRef(null); // Lưu trữ animation frame ID
  const isMountedRef = useRef(true); // Track component mount status
  
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
    // Kiểm tra nếu component đã unmount hoặc network không tồn tại
    if (!isMountedRef.current || !networkRef.current) {
      return false;
    }
    
    centerAttemptCountRef.current += 1;
    
    try {
      // Cancel previous animation frame if exists
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }

      animationFrameIdRef.current = requestAnimationFrame(() => {
        // Double check before executing
        if (isMountedRef.current && networkRef.current) {
          networkRef.current.redraw();
          networkRef.current.fit({
            animation: {
              duration: 1000,
              easingFunction: 'easeInOutQuad'
            },
            scale: 0.9
          });
        }
        animationFrameIdRef.current = null;
      });
      
      return true;
    } catch (error) {
      console.error("Error centering network:", error);
      return false;
    }
  }, [networkRef]);

  const attemptCenterWithRetry = useCallback(() => {
    if (!isMountedRef.current) return;
    
    centerAttemptCountRef.current = 0;
    
    // Clear existing timeouts
    timeoutIdsRef.current.forEach(id => clearTimeout(id));
    timeoutIdsRef.current = [];
    
    const initialTimeoutId = setTimeout(() => {
      if (!isMountedRef.current) return;
      centerNetwork();
      
      const retryDelays = [300, 700, 1500, 3000];
      
      retryDelays.forEach((delay, index) => {
        const timeoutId = setTimeout(() => {
          if (isMountedRef.current && centerAttemptCountRef.current < maxCenterAttempts) {
            centerNetwork();
          }
        }, delay);
        timeoutIdsRef.current.push(timeoutId);
      });
    }, 50);
    
    timeoutIdsRef.current.push(initialTimeoutId);
  }, [centerNetwork]);

  useEffect(() => {
    isMountedRef.current = true;
    
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
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
      
      // Clear all timeouts
      timeoutIdsRef.current.forEach(id => clearTimeout(id));
      timeoutIdsRef.current = [];
      
      // Cancel animation frame
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      
      // Destroy network
      if (networkRef.current) {
        try {
          networkRef.current.destroy();
          networkRef.current = null;
        } catch (error) {
          console.error("Error destroying network:", error);
        }
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

  // Set mounted status to false when component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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