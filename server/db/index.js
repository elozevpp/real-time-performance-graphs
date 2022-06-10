const { MongoClient } = require('mongodb');


const url = 'mongodb://root:root@db:27017';
const client = new MongoClient(url);
const dbName = 'data';
let db;

async function connect() {
  await client.connect();
  console.log('Mongo connection successful');
  db = client.db(dbName);

  return db;
}

async function getDatabase() {
  if (!db) {
    return connect();
  }

  return db;
}

module.exports = {
  getDatabase,
  connect
}