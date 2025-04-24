require('dotenv').config();
const { Sequelize } = require('sequelize');

// Define the connection URL
const DATABASE_URL = process.env.DATABASE_URL;

// Create a Sequelize instance
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'mysql',
  logging: false, // Set to true if you want to see SQL logs
});

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, connectToDatabase };
