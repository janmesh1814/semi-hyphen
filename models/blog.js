const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const commentSchema = new Schema({
    author: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const blogSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

    tags: [String],
    comments: [commentSchema],
    likes: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

blogSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Blog = mongoose.model('Blog', blogSchema);
const Comment = mongoose.model('Comment', commentSchema);
module.exports = { Blog, Comment };