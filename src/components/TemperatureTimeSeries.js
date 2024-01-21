import React from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-moment';

const TemperatureTimeSeries = ({ data }) => {
  // Calculate median
  const values = data.map(d => d.value).sort((a, b) => a - b);
  let median;
  const half = Math.floor(values.length / 2);
  if (values.length % 2) {
    median = values[half];
  } else {
    median = (values[half - 1] + values[half]) / 2.0;
  }

  const chartData = {
    labels: data.map(d => d.timestamp),
    datasets: [
      {
        label: 'Temperature',
        data: data.map(d => d.value),
        fill: false,
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgba(255, 99, 132, 0.2)',
      },
      {
        label: 'Median Temperature',
        data: data.map(() => median),
        fill: false,
        borderDash: [10, 5],
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 2
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        type: 'time',
        time: {
          parser: 'YYYY-MM-DD HH:mm:ss',
          tooltipFormat: 'll',
          unit: 'day',
        },
        title: {
          display: true,
          text: 'Date',
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 7
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Temperature (°C)',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
      },
    },
    maintainAspectRatio: false,
  };

  return <Line data={chartData} options={chartOptions} />;
};

export default TemperatureTimeSeries;
