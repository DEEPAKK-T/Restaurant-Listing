const express = require('express');
const cors = require('cors');
const { json } = require('express');
const sequelize = require('../src/utils/database');
const authRoutes = require('../src/routes/authRoutes');
const businessRoutes = require('../src/routes/businessRoutes');

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(json());

// Routes
app.use(authRoutes);
app.use(businessRoutes);

// Sync Sequelize models with the database
sequelize.sync({ force: false }).then(() => {
  console.log('Database and tables synced');
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
