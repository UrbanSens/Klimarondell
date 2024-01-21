import React from 'react';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const HistogramPlot = ({ data }) => {
  // Prepare chart.js data format
  const chartData = {
    labels: data.map(item => item.healthcare || 'N/A'), // Use healthcare as labels for the x-axis
    datasets: [
      {
        label: 'Count',
        data: data.map(item => item.count),
        backgroundColor: data.map(item => `hsl(${item.count / Math.max(...data.map(i => i.count)) * 120}, 70%, 50%)`),
      }
    ]
  };

  // Prepare chart.js options
  const chartOptions = {
    plugins: {
      legend: {
        display: false // Set true if you want to display the label 'Count' above the chart
      },
      tooltip: {
        callbacks: {
          label: context => `Healthcare: ${context.label}\nCount: ${context.parsed.y}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Healthcare Category'
        }
      }
    }
  };

  return (
    <div className="histogram-plot">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default HistogramPlot;
