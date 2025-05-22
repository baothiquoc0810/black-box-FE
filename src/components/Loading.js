import React from 'react';

const Loading = () => {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-2">Đang tải...</p>
          </div>
        </div>
      );
}

export default Loading;