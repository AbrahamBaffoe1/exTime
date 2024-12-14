import React from 'react';
import './Preloader.css';

const Preloader = () => {
  return (
    <div className="preloader-container">
      <div className="preloader">
        <div className="preloader-circle"></div>
        <div className="preloader-circle"></div>
        <div className="preloader-circle"></div>
      </div>
      <p className="loading-text">Loading...</p>
    </div>
  );
};

export default Preloader;
