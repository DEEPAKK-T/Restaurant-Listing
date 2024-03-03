const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Review = sequelize.define('Review', {
  rating: { type: DataTypes.INTEGER, allowNull: false },
  comment: { type: DataTypes.TEXT, allowNull: false },
  businessId: {type: DataTypes.INTEGER, allowNull: false},
  userId: { type: DataTypes.INTEGER, allowNull: false },
  response: {type: DataTypes.TEXT}
});

module.exports = Review;