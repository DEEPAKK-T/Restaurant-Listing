const jwt = require("jsonwebtoken")
require("dotenv").config();
const jwtSecret = process.env.jwtSecret || "Deepak";



// Middleware to verify JWT and extract user information
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
    console.log("\n Token", token)
    const accessToken = token.split(' ')[1];
    console.log("\n AccessToken")
    jwt.verify(accessToken, jwtSecret, (err, user) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      req.user = user;
      console.log("\nDeepak req.user object inside authenticate middle", req.user)
      next();
    });
  };

module.exports = authenticateJWT;