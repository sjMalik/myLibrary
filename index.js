/* eslint-disable import/no-extraneous-dependencies */
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  require('dotenv').config();
}

const express = require('express');
const ejsLayout = require('express-ejs-layouts');
const path = require('path');
const mongoose = require('mongoose');
const debug = require('debug')('library:server');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .then(() => debug('Mongodb connected'))
  .catch((e) => {
    debug(e);
  });

const indexRoute = require('./routes');
const authorRoute = require('./routes/authors');
const bookRoute = require('./routes/books');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.set('layout', 'layouts/layout');
app.use(ejsLayout);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/', indexRoute);
app.use('/authors', authorRoute);
app.use('/books', bookRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  debug(`App listening on port ${PORT}`);
});
