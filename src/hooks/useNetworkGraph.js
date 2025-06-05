import { useRef, useEffect } from 'react';
import { DataSet } from 'vis-data';
import { createNetworkData } from '../utils/networkHelpers';
import { getTagName } from '../utils/commonHelper';

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

  const handleDeleteEdges = async (selectedEdgeIds) => {
    if (!selectedEdgeIds || selectedEdgeIds.length === 0) return;

    // Lấy thông tin đầy đủ của các edge từ edgesRef
    const edgesToDelete = selectedEdgeIds.map(edgeId => edgesRef.current.get(edgeId)).filter(Boolean);

    // Xử lý tag-to-image relationships trước
    for (const edge of edgesToDelete) {
      if (edge.arrows === undefined || (edge.arrows && !edge.arrows.to)) {
        const tagNode = edge.from.startsWith('tag_') ? edge.from : edge.to;
        const imageNode = edge.from.startsWith('image_') ? edge.from : edge.to;

        if (tagNode && imageNode) {
          const tagName = tagNode.replace('tag_', '');
          const imageId = imageNode.replace('image_', '');
          try {
            // Đợi mỗi lần xóa tag hoàn thành trước khi tiếp tục
            await onDeleteTag(imageId, tagName);
          } catch (error) {
            console.error('Error deleting tag:', error);
            // Có thể thêm xử lý lỗi ở đây nếu cần
          }
        }
      }
    }

    // Xử lý tag relationships
    for (const edge of edgesToDelete) {
      if (edge.arrows === 'to' || (edge.arrows && edge.arrows.to)) {
        const parentTag = edge.from.replace('tag_', '');
        const childTag = edge.to.replace('tag_', '');
        try {
          await onDeleteTagRelation(parentTag, childTag);
        } catch (error) {
          console.error('Error deleting tag relation:', error);
        }
      }
    }

    // Xóa tất cả các edge sau khi đã xử lý xong các tag
    edgesRef.current.remove(selectedEdgeIds);

    // Xử lý các node bị cô lập sau khi xóa edges
    const affectedNodes = new Set();
    edgesToDelete.forEach(edge => {
      affectedNodes.add(edge.from);
      affectedNodes.add(edge.to);
    });

    // Kiểm tra các tag nodes bị cô lập
    for (const nodeId of affectedNodes) {
      if (nodeId.startsWith('tag_')) {
        const remainingEdges = edgesRef.current.get({
          filter: edge => edge.from === nodeId || edge.to === nodeId
        });

        if (remainingEdges.length === 0) {
          nodesRef.current.remove(nodeId);
        }
      }
    }

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