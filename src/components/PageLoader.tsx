import React from 'react';

const PageLoader: React.FC = () => (
  <div className='loader-container'>
    <div className='loader'></div>
    <style jsx>{`
      .loader-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        width: 100vw;
        position: fixed;
        top: 0;
        left: 0;
        background-color: rgba(255, 255, 255, 0.7);
        z-index: 9999;
      }
      .loader {
        width: 70px;
        height: 70px;
        border: 8px solid transparent;
        border-top: 8px solid #e8804c;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `}</style>
  </div>
);

export default PageLoader;
