/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const debug = require('debug')('library:author');
const Author = require('../models/author');

const router = express.Router();

router.get('/', async (req, res) => {
  const searchOptions = {};
  if (req.query.name !== null && req.query.name !== '') {
    // Case sensitive searching
    searchOptions.name = new RegExp(req.query.name, 'i');
  }
  try {
    const authors = await Author.find(searchOptions);
    res.render('authors', { authors, searchOptions: req.query });
  } catch (e) {
    res.redirect('/');
  }
});

router.get('/new', (req, res) => {
  res.render('authors/new', {
    author: new Author(),
  });
});

router.post('/', async (req, res) => {
  const author = new Author({
    name: req.body.name,
  });
  try {
    await author.save();
    res.redirect('/authors');
  } catch (e) {
    debug(e);
    res.render('authors/new', {
      author,
      errorMessage: 'Error creating author',
    });
  }
});

module.exports = router;
