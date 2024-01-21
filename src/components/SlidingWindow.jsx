import React from 'react';
import './SlidingWindow.css'; // create this CSS file for styling

const SlidingWindow = ({ isOpen, children }) => {
  return (
    <div className={`sliding-window ${isOpen ? 'open' : ''}`}>
      {children}
    </div>
  );
};

export { SlidingWindow };

