const jwt = require("jsonwebtoken")
const { jwtSecret }= require("../../config/config")


// Middleware to verify JWT and extract user information
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
    console.log("\n Token", token)
    const accessToken = token.split(' ')[1];
    console.log("\n AccessToken")
    jwt.verify(accessToken, jwtSecret, (err, user) => {
      if (err) return res.status(403).json({ error: 'Forbidden kjsdhajs' });
      req.user = user;
      next();
    });
  };

module.exports = authenticateJWT;