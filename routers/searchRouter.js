const express = require('express');
const searchRouter = express.Router();
const searchController = require('../controllers/searchController');
const { authenticateToken } = require('../middlewares/jwtAuthHandler');
const asyncErrorHandler = require('../handlers/asyncErrorHandler');

searchRouter.get('/search/filter', authenticateToken, asyncErrorHandler(searchController.filterUsers));

module.exports = {searchRouter};