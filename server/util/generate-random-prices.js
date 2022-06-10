const { getDatabase } = require('../db');
const uuid = require('uuid-mongodb');


const INTERVAL = 35000;

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

async function insertNewPrice (newPrice) {
  const db = await getDatabase();
  const stockPrices = db.collection('stock-prices');

  await stockPrices.insertOne({ 
    _id: uuid.v4().toString,
    price: newPrice,
    stock: 'Tesla',
    recordedTime: new Date()
  });
}

const startGeneration = () => {
  setTimeout(async () => {
    const newPrice = await generateRandomPrices();
    await insertNewPrice(newPrice);
    startGeneration();
  }, INTERVAL);
}


module.exports = {
  startGeneration
}