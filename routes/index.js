const express = require('express');
const debug = require('debug')('library:home');

const Book = require('../models/book');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: 'desc' }).limit(10).exec();
    res.render('index', { books });
  } catch (e) {
    debug(e);
  }
});

module.exports = router;
