import React, {useState, useEffect} from 'react';
import { io } from "socket.io-client";
const SERVER_DOMAIN = 'localhost:3000';
const socket = io(`ws://${SERVER_DOMAIN}/`, {transports: ['websocket']});

const httpEndpoint = `http://${SERVER_DOMAIN}`;

const StockSubscriber = () => {
  const [stockPrices, setStockPrices] = useState([]);

  socket.removeAllListeners();

  socket.on('connect', () => {
    console.log('connected')
  });

  socket.on('connect_error', (e) => {
    console.log('connected_error', e)
  });

  socket.on('init', (value) => {
    console.log('on.init: ', value)
    setStockPrices(value);
  });

  socket.on('update', (update) => {
    console.log('on.update: ', update);
    setStockPrices((_stockPrices) => [update, ..._stockPrices]);
  });

  useEffect(() => {
    return () => socket.disconnect();
  }, [])

  return (<>
     <h3>Stocks</h3>
        <div>
        <ul>
          {stockPrices.map(({ _id, price, stock, recordedTime }) => (
            <li key={_id}>
              {stock} - £{price.toFixed(2)} at {new Date(recordedTime).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
  </>)
}


export default StockSubscriber;