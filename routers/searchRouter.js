const express = require('express');
const searchRouter = express.Router();
const searchController = require('../controllers/searchController');
const { authenticateToken } = require('../middlewares/jwtAuthHandler');
const asyncErrorHandler = require('../handlers/asyncErrorHandler');

searchRouter.get('/search/filter', authenticateToken, asyncErrorHandler(searchController.filterUsers));
searchRouter.get('/search/user', authenticateToken, asyncErrorHandler(searchController.searchUsers));
searchRouter.get('/search/user/page', authenticateToken, asyncErrorHandler(searchController.searchUsersPaginated));

module.exports = {searchRouter};