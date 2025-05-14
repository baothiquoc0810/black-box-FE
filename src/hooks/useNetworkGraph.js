import { useRef } from 'react';
import { DataSet } from 'vis-data';

const useNetworkGraph = ({
  images,
  tagRelationships,
  onDeleteTagRelation,
  onDeleteImage,
  onDeleteTag,
  setSelectedImage,
  setShowPreview,
  setSelectedEdge
}) => {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const nodesRef = useRef(new DataSet([]));
  const edgesRef = useRef(new DataSet([]));

  const handleDeleteEdge = (selectedEdge) => {
    if (selectedEdge) {
      // Remove the edge
      edgesRef.current.remove(selectedEdge.id);

      // Check if either node is now isolated
      const fromNode = selectedEdge.from;
      const toNode = selectedEdge.to;

      // Only check tag nodes (not image nodes)
      if (fromNode.startsWith('tag_')) {
        const remainingEdges = edgesRef.current.get({
          filter: edge => edge.from === fromNode || edge.to === fromNode
        });
        if (remainingEdges.length === 0) {
          const tagToRemove = fromNode.replace('tag_', '');
          nodesRef.current.remove(fromNode);
          
          images.forEach(image => {
            if (image.tags.includes(tagToRemove)) {
              onDeleteTag(image.id, tagToRemove);
            }
          });
        }
      }

      if (toNode.startsWith('tag_')) {
        const remainingEdges = edgesRef.current.get({
          filter: edge => edge.from === toNode || edge.to === toNode
        });
        if (remainingEdges.length === 0) {
          const tagToRemove = toNode.replace('tag_', '');
          nodesRef.current.remove(toNode);
          
          images.forEach(image => {
            if (image.tags.includes(tagToRemove)) {
              onDeleteTag(image.id, tagToRemove);
            }
          });
        }
      }

      // Update tag relationships if it was a tag relationship edge
      if (selectedEdge.arrows) {
        const parentTag = selectedEdge.from.replace('tag_', '');
        const childTag = selectedEdge.to.replace('tag_', '');
        onDeleteTagRelation(parentTag, childTag);
      }

      // Handle tag-to-image edge deletion
      if (!selectedEdge.arrows) {  // If it's not a tag relationship edge (no arrows)
        const tagNode = selectedEdge.from.startsWith('tag_') ? selectedEdge.from : selectedEdge.to;
        const imageNode = selectedEdge.from.startsWith('image_') ? selectedEdge.from : selectedEdge.to;
        
        if (tagNode && imageNode) {
          const tagName = tagNode.replace('tag_', '');
          const imageId = parseInt(imageNode.replace('image_', ''));
          onDeleteTag(imageId, tagName);
        }
      }

      setSelectedEdge(null);
    }
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
    handleDeleteEdge,
    centerNetwork
  };
};

export default useNetworkGraph; 