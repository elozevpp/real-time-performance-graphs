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

startGeneration((newRecord) => {
  console.log("🚀 ~ file: index.js ~ line 20 ~ startGeneration ~ newRecord", newRecord)
  io.to('tesla').emit('update', newRecord);
});

const getAllStockPrices = async () => {
  const db = await getDatabase();

  const stockPricesCollection = await db.collection('stock-prices');
  const result = await stockPricesCollection.find({}, { sort: { recordedTime: -1 }}).toArray();
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
    const stockPricesNow = await getAllStockPrices();
    socket.emit('init', stockPricesNow);
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
