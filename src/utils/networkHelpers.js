import { getTagName } from "./commonHelper";

export const createNetworkData = (images, tagRelationships) => {
  // Create nodes for images
  const imageNodes = images.map(image => ({
    id: `image_${image.id}`,
    image: image.pictureUrl,
    shape: 'circularImage',
    size: 30,
    font: {
      size: 12
    },
    group: 'images',
    title: image.pictureName,
    borderWidth: 2,
    borderWidthSelected: 3,
    color: {
      border: '#2B7CE9',
      background: '#ffffff',
      highlight: {
        border: '#2B7CE9',
        background: '#ffffff'
      },
      hover: {
        border: '#2B7CE9',
        background: '#ffffff'
      }
    }
  }));

  // Create nodes for tags and edges
  const tagNodes = [];
  const edges = [];
  const tagCount = {};
  const tagConnections = {}; // Track connections for each tag

  // Count how many images have each tag
  images.forEach(image => {
    if (image.tags) {
      image.tags.forEach(tag => {
        // Lấy tag name từ object tag
        const tagName = typeof tag === 'object' ? tag.name : tag;
        tagCount[tagName] = (tagCount[tagName] || 0) + 1;
        tagConnections[tagName] = 0;
      });
    }
  });

  // Create tag nodes for tags that appear in multiple images
  Object.entries(tagCount).forEach(([tagName, count]) => {
    if (count >= 2) {
      tagNodes.push({
        id: `tag_${tagName}`,
        label: tagName,
        title: tagName,
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
        if (image.tags) {
          // Kiểm tra xem image có tag này không
          const hasTag = image.tags.some(tag => {
            const currentTagName = getTagName(tag);
            return currentTagName === tagName;
          });

          if (hasTag) {
            edges.push({
              from: `tag_${tagName}`,
              to: `image_${image.id}`,
              title: `Tagged as ${tagName}`,
              color: '#0288d1',
            });
            tagConnections[tagName]++;
          }
        }
      });
    }
  });

  // Add edges for tag relationships
  if (tagRelationships) {
    tagRelationships.forEach(rel => {
      if (tagNodes.some(node => node.id === `tag_${rel.parent}`) &&
        tagNodes.some(node => node.id === `tag_${rel.child}`)) {
        edges.push({
          from: `tag_${rel.parent}`,
          to: `tag_${rel.child}`,
          arrows: 'to',
          dashes: true,
          width: 2,
          title: `${rel.parent} → ${rel.child}`
        });
        tagConnections[rel.parent]++;
        tagConnections[rel.child]++;
      }
    });
  }

  // Filter out tag nodes that have no connections
  const connectedTagNodes = tagNodes.filter(node => {
    const tag = node.id.replace('tag_', '');
    return tagConnections[tag] > 0;
  });

  return {
    nodes: [...imageNodes, ...connectedTagNodes],
    edges
  };
};

export const createNetworkOptions = () => {
  return {
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
        iterations: 200,
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
}; 