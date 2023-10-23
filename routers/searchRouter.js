const express = require('express');
const searchRouter = express.Router();
const searchController = require('../controllers/searchController');
const { authenticateToken } = require('../middlewares/jwtAuthHandler');

searchRouter.get('/search/filter', authenticateToken, searchController.filterUsers);

module.exports = {searchRouter};