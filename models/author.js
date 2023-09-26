/* eslint-disable indent */
const mongoose = require('mongoose');
const Book = require('./book');

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
});

// Check whhether any reference exist or not. If so then dont allow deletion
authorSchema.pre('remove', function (next) {
    Book.find({ author: this.id }, (err, books) => {
        if (err) {
            next(err);
        } else if (books.length > 0) {
            next(new Error('Book present by this Author'));
        } else {
            next();
        }
    });
});

module.exports = mongoose.model('Authors', authorSchema);
