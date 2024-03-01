const express = require('express');
const businessController = require('../controllers/businessController');

const router = express.Router();

router.use('/', businessController);

module.exports = router;