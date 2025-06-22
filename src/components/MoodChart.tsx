import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { MoodData } from '../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MoodChartProps {
  data: MoodData[];
  title: string;
}

export const MoodChart: React.FC<MoodChartProps> = ({ data, title }) => {
  const chartData = {
    labels: data.map((item) => item.date),
    datasets: [
      {
        label: 'Mood Score',
        data: data.map((item) => item.score),
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div style={{ height: '300px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};