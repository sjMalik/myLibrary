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

router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author').exec();
    res.render('books/view', { book });
  } catch (e) {
    debug(e);
    res.redirect('/books');
  }
});

router.get('/:id/edit', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    await renderEditPage(res, book);
  } catch (e) {
    res.redirect(`/books/${req.params.id}`);
  }
});

router.put('/:id', async (req, res) => {
  debug(`/books/${req.params.id} PUT ${req.body}`);
  let book;
  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.description = req.body.description;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    if (req.body.cover && req.body.cover !== '') {
      saveCover(book, req.body.cover);
    }
    await book.save();
    res.redirect(`/books/${req.params.id}`);
  } catch (e) {
    debug(e);
    if (!book) {
      renderEditPage(res, book, true);
    } else {
      res.redirect('/books');
    }
  }
});

router.delete('/:id', async (req, res) => {
  let book;
  try {
    book = await Book.findOneAndDelete({ _id: req.params.id });
    res.redirect('/books');
  } catch (e) {
    if (!book) {
      res.redirect('/books');
    } else {
      res.redirect(`/books/${req.params.id}`);
    }
  }
});

async function renderNewPage(res, book, hasError = false) {
  await renderFormPage(res, book, 'new', hasError);
}

async function renderEditPage(res, book, hasError = false) {
  await renderFormPage(res, book, 'edit', hasError);
}

async function renderFormPage(res, book, form, hasError) {
  try {
    const authors = await Author.find({});
    const params = { authors, book };
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error updating book';
      } else if (form === 'new') {
        params.errorMessage = 'Error creating book';
      }
    }
    res.render(`books/${form}`, params);
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
