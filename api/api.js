const express = require('express');
const api = express.Router();
const employeeRouter = require('./employeeRouter')
const menusRouter = require('./menusRouter');

api.use('/employees', employeeRouter);
api.use('/menus', menusRouter);

module.exports = api;
