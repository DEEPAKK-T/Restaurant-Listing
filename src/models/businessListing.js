const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const BusinessListing = sequelize.define('BusinessListing', {
  name: { type: DataTypes.STRING, allowNull: false },
  businessPhone: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  images: { type: DataTypes.ARRAY(DataTypes.STRING) },
});

module.exports = BusinessListing;