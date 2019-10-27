var mongoose = require('mongoose');
User = require('../models/userModel');

var commentSchema = mongoose.Schema({
    /*userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }, */
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    movieId: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
    },
    create_date: {
        type: Date,
        default: Date.now
    }
});

// Export Comment model
var Comment = module.exports = mongoose.model('comment', commentSchema);
module.exports.get = function (callback, limit) {
    Comment.find(callback).limit(limit);
}
