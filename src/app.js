const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api', routes);

app.use(errorHandler);

module.exports = app;
