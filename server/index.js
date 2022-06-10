require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const { getDatabase } = require('./db');
const { startGeneration } = require('./util/generate-random-prices');

const PORT = process.env.PORT || 3000;

// startGeneration();

app.get('/', async (req, res) => {
  const db = await getDatabase();

  const stockPrices = await db.collection('stock-prices');
  const result = await stockPrices.find().toArray();

  return res.status(200).json(result);
});


io.on('connection', (socket) => {
  console.log('WS user connected', socket.id);
})


server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
