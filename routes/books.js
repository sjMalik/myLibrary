/* eslint-disable no-use-before-define */
const express = require('express');
const path = require('path');
const debug = require('debug')('library:book');
const fs = require('fs');

const Author = require('../models/author');
const Book = require('../models/book');

const uploadPath = path.join('public', Book.coverImageBasePath);
const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

const router = express.Router();

router.get('/new', async (req, res) => {
  const book = new Book();
  renderNewPage(res, book);
});

router.get('/', async (req, res) => {
  let query = Book.find();
  debug(req.query);
  if (req.query.title && req.query.title !== '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'));
  }
  if (req.query.publishedAfter && req.query.publishedAfter !== '') {
    query = query.gte('publishDate', req.query.publishedAfter);
  }
  if (req.query.publishedBefore && req.query.publishedBefore !== '') {
    query = query.lte('publishDate', req.query.publishedBefore);
  }
  try {
    const books = await query.exec();
    res.render('books/index', {
      books,
      searchOptions: req.query,
    });
  } catch (e) {
    debug(e);
    res.redirect('/');
  }
});

// take a single file with name 'cover'
router.post('/', async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    description: req.body.description,
    publishDate: req.body.publishDate,
    pageCount: req.body.pageCount,
  });

  saveCover(book, req.body.cover);

  try {
    await book.save();
    res.redirect('/books');
  } catch (e) {
    debug(e);
    if (book.coverImageName) {
      removeBookCover(book.coverImageName);
    }
    renderNewPage(res, book, true);
  }
});

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = { authors, book };
    if (hasError) {
      params.errorMessage = 'Error creating book';
    }
    res.render('books/new', params);
  } catch (e) {
    res.redirect('/books');
  }
}

function saveCover(book, coverEncoded) {
  if (!coverEncoded) return;
  const cover = JSON.parse(coverEncoded);
  if (cover && imageMimeTypes.includes(cover.type)) {
    // eslint-disable-next-line
    book.coverImage = new Buffer.from(cover.data, 'utf8');
    // eslint-disable-next-line
    book.coverImageType = cover.type;
  }
}

function removeBookCover(filename) {
  fs.unlink(path.join(uploadPath, filename), (err) => {
    debug(err);
  });
}

module.exports = router;
