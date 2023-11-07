// HistogramPlot.jsx
import React, { useEffect, useRef } from 'react';
import './HistogramPlot.css'; // Import the CSS stylesheet
import Chart from 'chart.js';


const HistogramPlot = ({ data }) => {
  const maxValue = Math.max(...data.map(item => item.count));
  const scale = 100 / maxValue; // Scale bars to a maximum of 100% height

  return (
    <div className="histogram-plot">
      <div className="histogram-bar-container">
        {data.map((item, index) => {
          const height = `${item.count * scale}%`;
          return (
            <div
              key={index}
              className="histogram-bar"
              style={{
                backgroundColor: `hsl(${item.count / maxValue * 120}, 70%, 50%)`, // Color based on value
                height: height, // Dynamic height based on the item count
              }}
              title={`Healthcare: ${item.healthcare || 'N/A'}\nCount: ${item.count}`}
            >
              {item.count}
            </div>
          );
        })}
      </div>
      <div className="histogram-label-container">
        {data.map((item, index) => (
          <div key={index} className="histogram-label">
            {item.healthcare || 'N/A'}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistogramPlot;
