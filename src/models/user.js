const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('businessOwner', 'user', 'admin'), allowNull: false },
});

module.exports = User;