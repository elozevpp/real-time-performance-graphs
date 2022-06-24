require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const { getDatabase } = require('./db');
const { startGeneration } = require('./util/generate-random-prices');

const PORT = process.env.PORT || 3000;

const availableStocks = {
  tesla: 'Tesla',
  apple: 'Apple',
  microsoft: 'Microsoft',
};

startGeneration(availableStocks.tesla, (newRecord) => {
  io.to('tesla').emit('update:tesla', newRecord);
});

startGeneration(availableStocks.apple, (newRecord) => {
  io.to('apple').emit('update:apple', newRecord);
});

startGeneration(availableStocks.microsoft, (newRecord) => {
  io.to('microsoft').emit('update:microsoft', newRecord);
});

const getAllStockPrices = async (stockName) => {
  const db = await getDatabase();

  const stockPricesCollection = await db.collection('stock-prices');
  const result = await stockPricesCollection.find({ stock: stockName }, { $sort: { recordedTime: -1 } }).toArray();
  return result;
}

app.use(cors({ origin: '*' }))

app.get('/', async (req, res) => {
  console.log('GET /')

  const result = await getAllStockPrices();
  return res.status(200).json(result);
});


io.on('connection', async (socket) => {
  console.log('WS user connected', socket.id);

  const stockPricesNow = await getAllStockPrices();

  socket.emit('init', stockPricesNow);

  socket.on('subscribe', async (stockId) => {
    console.log('subscribe to: ', stockId);
    const stockPricesNow = await getAllStockPrices(availableStocks[stockId]);
    socket.emit(`init:${stockId}`, stockPricesNow);
    socket.join(stockId);
  })

  socket.on('unsubscribe', (stockId) => {
    console.log('unsubscribe to: ', stockId);
    socket.leave(stockId);
  })
})



server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
