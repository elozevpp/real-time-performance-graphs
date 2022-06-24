const { getDatabase } = require('../db');
const uuid = require('uuid-mongodb');


const INTERVAL = 5000;

function randomNumberFromInterval(min, max) {
  return Math.random() * (max - min + 1) + min;
}

function getNewStockPrice(oldPrice) {
  const change = randomNumberFromInterval(-10, 10) / 100;
  return oldPrice + (oldPrice * change);
}

async function generateRandomPrices() {
  const db = await getDatabase();
  const stockPrices = db.collection('stock-prices');

  const latestStockPrice = await stockPrices.find({}, { sort: { recordedTime: -1 }}).toArray();
  const newPrice = getNewStockPrice(latestStockPrice[0].price);

  return newPrice;
}

async function insertNewPrice (stockName, newPrice) {
  const db = await getDatabase();
  const stockPrices = db.collection('stock-prices');

  const newRecord = { 
    _id: uuid.v4().toString,
    price: newPrice,
    stock: stockName,
    recordedTime: new Date()
  }

  await stockPrices.insertOne(newRecord);

  const [latestRecord] = await stockPrices.find({}, { sort: {recordedTime: -1 }, limit: 1}).toArray();
  return latestRecord;
}

const startGeneration = (stockName, cb) => {
  setTimeout(async () => {
    const newPrice = await generateRandomPrices();
    const newRecord = await insertNewPrice(stockName, newPrice);

    cb && cb(newRecord);
    startGeneration(stockName, cb);
  }, INTERVAL);
}


module.exports = {
  startGeneration
}