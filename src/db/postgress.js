const initialOptions = {
    capsSql: true,
    schema: ['public', 'auth'],
    error(err, e) {
        if (e.cn) {
            console.error('Connection error:', err.message || err);
        }
        if (e.query) {
            // query string is available
            console.error('Query error:', e.query);
            if (e.params) {
              // query parameters are available
              console.error('Params error:', e.params);
            }
            console.error('', err);
            throw err;
          }
    }
}

const pgp = require('pg-promise')();
const dotenv = require('dotenv').config();
console.log("connection", {
  host: process.env.HOST,
  port: process.env.POSTGRES_POST,
  database: process.env.DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.PASSWORD,
});

const connection = {
  host: process.env.HOST,
  port: process.env.POSTGRES_POST,
  database: process.env.DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
};
  
  const db = pgp(connection);
  module.exports = db;

