/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const debug = require('debug')('library:author');
const Author = require('../models/author');
const Book = require('../models/book');

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

router.get('/:id', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    const books = await Book.find({ author: author.id }).limit(6).exec();
    res.render('authors/view', { author, books });
  } catch (e) {
    debug(e);
    res.redirect('/');
  }
});

router.get('/:id/edit', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render('authors/edit', { author });
  } catch (e) {
    res.redirect('/authors');
  }
});

router.put('/:id', async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    await author.save();
    res.redirect(`/authors/${req.params.id}`);
  } catch (e) {
    if (!author) {
      res.redirect('/');
    } else {
      res.render('authors/edit', { author, errorMessage: 'Updating failed' });
    }
  }
});

router.delete('/:id', async (req, res) => {
  let author;
  try {
    const books = await Book.find({ author: req.params.id });
    if (books.length === 0) {
      await Author.findOneAndRemove({ _id: req.params.id });
      res.redirect('/authors');
    } else {
      res.redirect(`/authors/${req.params.id}`);
    }
  } catch (e) {
    debug(e);
    if (!author) {
      res.redirect('/');
    } else {
      res.redirect(`/authors/${req.params.id}`);
    }
  }
});

module.exports = router;
