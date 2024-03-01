const Config = require("../../config/config")
const Sequelize = require("sequelize");

const sequelize = new Sequelize(Config.DBNAME, Config.USERNAME, Config.PASSWORD, {
    host: Config.HOST,
    dialect: Config.dialect,
  });

sequelize.sync({ force: false });
console.log("Connected to PostgresDB")

module.exports = sequelize;

