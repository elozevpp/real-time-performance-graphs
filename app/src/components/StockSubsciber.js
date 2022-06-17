import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const SERVER_DOMAIN = 'localhost:3000';
const socket = io(`ws://${SERVER_DOMAIN}/`, { transports: ['websocket'] });

const httpEndpoint = `http://${SERVER_DOMAIN}`;

const StockSubscriber = () => {
  const [stockPrices, setStockPrices] = useState([]);

  socket.removeAllListeners();

  socket.on('connect', () => {
    console.log('connected');
  });

  socket.on('connect_error', (e) => {
    console.log('connected_error', e);
  });

  socket.on('init', (value) => {
    console.log('on.init: ', value);
    setStockPrices(value);
  });

  socket.on('update', (update) => {
    console.log('on.update: ', update);
    setStockPrices((_stockPrices) => [update, ..._stockPrices]);
  });

  useEffect(() => {
    return () => socket.disconnect();
  }, []);

  return (
    <div style={{ width: '90%', maxWidth: '1200px' }}>
      <h3>Stocks</h3>
      <div>
        <PerformanceChart stockPrices={stockPrices} />
      </div>
    </div>
  );
};

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Stock Performance',
    },
  },
  datasets: {
    line: {
      pointRadius: 0,
    },
  },
};

const PerformanceChart = ({ stockPrices }) => {
  const data = {
    labels: stockPrices.map(({ recordedTime }) =>
      new Date(recordedTime).toLocaleTimeString(),
    ),
    datasets: [
      {
        label: 'Tesla',
        data: stockPrices.map(({ price }) => price),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  return <Line options={options} data={data} />;
};

export default StockSubscriber;
