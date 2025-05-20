import React from 'react';
import { Button } from 'react-bootstrap';

const ControlPanel = ({ selectedEdges, onDeleteEdges, onCenterNetwork }) => {
  return (
    <div style={{ 
      padding: '15px',
      background: '#f8f9fa',
      borderBottom: '1px solid #e9ecef',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: '5px 5px 0px 0px'
    }}>
      <div>
        {selectedEdges?.length > 0 && (
          <Button 
            className="btn btn-danger"
            onClick={onDeleteEdges}
            style={{
              border: 'none',
              padding: '8px 20px',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Delete Connection
          </Button>
        )}
      </div>

      <Button 
        className="btn btn-primary" 
        onClick={onCenterNetwork}
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
  );
};

export default ControlPanel; 