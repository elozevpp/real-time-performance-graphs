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

// const httpEndpoint = `http://${SERVER_DOMAIN}`;

const availableStocks = {
  tesla: 'Tesla',
  apple: 'Apple',
  microsoft: 'Microsoft',
};

const stockColors = {
  tesla: getRandomColor(),
  apple: getRandomColor(),
  microsoft: getRandomColor(),
};

const StockSubscriber = () => {
  const [stockPrices, setStockPrices] = useState({
    subscriptions: {},
  });
  const [latestStockPrice, setLatestStockPrice] = useState(' - ');

  socket.removeAllListeners();

  socket.on('connect', () => {
    console.log('connected');
  });

  socket.on('connect_error', (e) => {
    console.log('connected_error', e);
  });

  socket.on(`init:tesla`, (value) => {
    console.log('init:tesla: ', value);
    addSubscriptionToState('tesla', value);
  });

  socket.on(`init:apple`, (value) => {
    console.log('init:apple: ', value);
    addSubscriptionToState('apple', value);
  });

  socket.on(`init:microsoft`, (value) => {
    console.log('init:microsoft: ', value);
    addSubscriptionToState('microsoft', value);
  });

  socket.on('update:tesla', (value) => {
    console.log('update:tesla: ', value);
    updateSubscription('tesla', value);
  });

  socket.on('update:apple', (value) => {
    console.log('update:apple: ', value);
    updateSubscription('apple', value);
  });

  socket.on('update:microsoft', (value) => {
    console.log('update:microsoft: ', value);
    updateSubscription('microsoft', value);
  });

  socket.on('update', (update) => {
    console.log('on.update: ', update);
    setStockPrices((_stockPrices) => {
      _stockPrices.push(update);
      return _stockPrices;
    });
    setLatestStockPrice(update.price);
  });

  const updateSubscription = (subscriptionName, newValue) => {
    setStockPrices((_stockPrices) => {
      return {
        subscriptions: {
          ..._stockPrices.subscriptions,
          [subscriptionName]: [
            ..._stockPrices.subscriptions[subscriptionName],
            newValue,
          ],
        },
      };
    });
  };

  const addSubscriptionToState = (subscriptionName, subscriptionValues) => {
    setStockPrices((_stockPrices) => {
      return {
        subscriptions: {
          ..._stockPrices.subscriptions,
          [subscriptionName]: subscriptionValues,
        },
      };
    });
  };

  useEffect(() => {
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    console.log('State: ', stockPrices);
  }, [stockPrices]);

  const onCheck = (e) => {
    const { id, checked } = e.currentTarget;

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
        <h4>Latest stock price: {latestStockPrice}</h4>
        {Object.keys(availableStocks).map((stockName) => (
          <PerformanceChart
            key={stockName}
            prices={stockPrices.subscriptions[stockName]}
            stockName={availableStocks[stockName]}
            color={stockColors[stockName]}
          />
        ))}
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

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const PerformanceChart = ({ prices, stockName, color }) => {
  const data = {
    labels: prices.map(({ recordedTime }) =>
      new Date(recordedTime).toLocaleString(),
    ),
    datasets: [
      {
        label: stockName,
        data: prices.map(({ price }) => price),
        borderColor: color,
        backgroundColor: color,
      },
    ],
  };

  return <Line options={options} data={data} />;
};

PerformanceChart.defaultProps = {
  prices: [],
};

export default StockSubscriber;
