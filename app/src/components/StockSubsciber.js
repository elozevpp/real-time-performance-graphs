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

const availableStocks = {
  tesla: 'Tesla',
  apple: 'Apple',
  microsoft: 'Microsoft',
};

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
    setStockPrices((_stockPrices) => [..._stockPrices, update]);
  });

  useEffect(() => {
    return () => socket.disconnect();
  }, []);

  const onCheck = (e) => {
    const id = e.currentTarget.id;
    const checked = e.currentTarget.checked;

    if (checked) {
      socket.emit('subscribe', id);
    } else {
      socket.emit('unsubscribe', id);
    }
  };

  return (
    <div style={{ width: '90%', maxWidth: '1200px' }}>
      <h3>Subscribe to:</h3>
      {Object.keys(availableStocks).map((stock) => (
        <span style={{ fontSize: '16px' }}>
          {availableStocks[stock]}{' '}
          <input key={stock} id={stock} type="checkbox" onChange={onCheck} />{' '}
          {' | '}
        </span>
      ))}

      <div>
        <PerformanceChart stockPrices={stockPrices.reverse()} />
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

const PerformanceChart = ({ stockList }) => {
  const data = {
    labels: stockList.map(({ recordedTime }) =>
      new Date(recordedTime).toLocaleString(),
    ),
    datasets: [
      {
        label: 'Tesla',
        data: stockList.map(({ price }) => price),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  return <Line options={options} data={data} />;
};

export default StockSubscriber;
