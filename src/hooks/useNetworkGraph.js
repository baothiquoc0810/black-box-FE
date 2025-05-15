import { useRef, useEffect } from 'react';
import { DataSet } from 'vis-data';
import { createNetworkData } from '../utils/networkHelpers';

const useNetworkGraph = ({
  images,
  tagRelationships,
  onDeleteTagRelation,
  onDeleteImage,
  onDeleteTag,
  setSelectedImage,
  setShowPreview,
  setSelectedEdges
}) => {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const nodesRef = useRef(new DataSet([]));
  const edgesRef = useRef(new DataSet([]));

  useEffect(() => {
    const { nodes, edges } = createNetworkData(images, tagRelationships);

    // Cập nhật nodes và edges
    nodesRef.current.clear();
    nodesRef.current.add(nodes);

    edgesRef.current.clear();
    edgesRef.current.add(edges);

  }, [images, tagRelationships]);

  const handleDeleteEdges = (selectedEdgeIds) => {
    if (!selectedEdgeIds || selectedEdgeIds.length === 0) return;

    // Lấy thông tin đầy đủ của các edge từ edgesRef
    const edgesToDelete = selectedEdgeIds.map(edgeId => edgesRef.current.get(edgeId)).filter(Boolean);
    
    // Xóa tất cả các edge
    edgesRef.current.remove(selectedEdgeIds);

    // Xử lý các node bị cô lập sau khi xóa edges
    const affectedNodes = new Set();
    edgesToDelete.forEach(edge => {
      affectedNodes.add(edge.from);
      affectedNodes.add(edge.to);
    });

    // Kiểm tra các tag nodes bị cô lập
    affectedNodes.forEach(nodeId => {
      if (nodeId.startsWith('tag_')) {
        const remainingEdges = edgesRef.current.get({
          filter: edge => edge.from === nodeId || edge.to === nodeId
        });

        if (remainingEdges.length === 0) {
          const tagToRemove = nodeId.replace('tag_', '');
          nodesRef.current.remove(nodeId);
          
          images.forEach(image => {
            if (image.tags.includes(tagToRemove)) {
              onDeleteTag(image.id, tagToRemove);
            }
          });
        }
      }
    });

    // Xử lý tag relationships
    edgesToDelete.forEach(edge => {
      if (edge.arrows === 'to' || (edge.arrows && edge.arrows.to)) {
        const parentTag = edge.from.replace('tag_', '');
        const childTag = edge.to.replace('tag_', '');
        onDeleteTagRelation(parentTag, childTag);
      }
    });

    // Xử lý tag-to-image relationships
    edgesToDelete.forEach(edge => {
      if (edge.arrows === '' || (edge.arrows && !edge.arrows.to)) {
        const tagNode = edge.from.startsWith('tag_') ? edge.from : edge.to;
        const imageNode = edge.from.startsWith('image_') ? edge.from : edge.to;
        
        if (tagNode && imageNode) {
          const tagName = tagNode.replace('tag_', '');
          const imageId = parseInt(imageNode.replace('image_', ''));
          onDeleteTag(imageId, tagName);
        }
      }
    });

    setSelectedEdges(null);
  };

  const centerNetwork = () => {
    networkRef.current.fit({
      animation: {
        duration: 1000,
        easingFunction: 'easeInOutQuad'
      }
    });
  };

  return {
    containerRef,
    networkRef,
    nodesRef,
    edgesRef,
    handleDeleteEdges,
    centerNetwork
  };
};

export default useNetworkGraph; 