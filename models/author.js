/* eslint-disable indent */
const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
});

// Check whhether any reference exist or not. If so then dont allow deletion
// authorSchema.pre('findOneAndRemove', async function (next) {
//     try {
//         const books = Book.find({ author: this.id });
//         if (books.length > 0) {
//             next(new Error('This author has books still'));
//         } else {
//             next();
//         }
//     } catch (e) {
//         next(e);
//     }
//     Book.find({ author: this.id }, (err, books) => {
//         debug(books);
//       if (err) {
//         next(err);
//       } else if (books.length > 0) {
//         next(new Error('This author has books still'));
//       } else {
//         next();
//       }
//     });
//   });

module.exports = mongoose.model('Authors', authorSchema);
