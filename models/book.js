/* eslint-disable indent */
const mongoose = require('mongoose');

const coverImageBasePath = 'uploads/bookCovers';

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    publishDate: {
        type: Date,
        required: true,
    },
    pageCount: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    coverImage: {
        type: Buffer,
        required: true,
    },
    coverImageType: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Authors',
    },
});

// eslint-disable-next-line consistent-return
bookSchema.virtual('coverImagePath').get(function () {
    if (this.coverImage && this.coverImageType) {
        return `data:${this.coverImageType};charset=utf8;base64,${this.coverImage.toString('utf8')}`;
    }
});

module.exports = mongoose.model('Books', bookSchema);
module.exports.coverImageBasePath = coverImageBasePath;
