const mongoose = require('mongoose');
const Blog = require("./models/blog.js");
main()
    .then(() => {
        console.log("Connection Successful");
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/blogging');
}

let blogs = [{
        "title": "Introduction to JavaScript",
        "author": "John Doe",
        "content": "JavaScript is a versatile programming language used for web development, among other things...",
        "createdAt": "2024-06-01T10:00:00Z",
        "updatedAt": "2024-06-01T10:00:00Z",
        "tags": ["JavaScript", "Programming", "Web Development"],
        "category": "Programming",
        "comments": [{
            "author": "Jane Smith",
            "content": "Great introduction! Very helpful.",
            "createdAt": "2024-06-01T12:00:00Z"
        }],
        "likes": 5,
    },
    {
        "title": "Healthy Eating Tips",
        "author": "Alice Johnson",
        "content": "Maintaining a balanced diet is crucial for overall health. Here are some tips to get started...",
        "createdAt": "2024-05-20T14:30:00Z",
        "updatedAt": "2024-05-21T09:00:00Z",
        "tags": ["Health", "Diet", "Nutrition"],
        "category": "Health",
        "comments": [{
                "author": "Bob Lee",
                "content": "Thanks for the tips! Very informative.",
                "createdAt": "2024-05-21T10:00:00Z"
            },
            {
                "author": "Tom Brown",
                "content": "I found this really helpful, thanks!",
                "createdAt": "2024-05-22T11:00:00Z"
            }
        ],
        "likes": 12,
    },
    {
        "title": "Travel Guide to Paris",
        "author": "Emily Davis",
        "content": "Paris is a beautiful city with a rich history and culture. This guide covers the best places to visit...",
        "createdAt": "2024-04-15T08:00:00Z",
        "updatedAt": "2024-04-15T08:00:00Z",
        "tags": ["Travel", "Paris", "Tourism"],
        "category": "Travel",
        "comments": [{
            "author": "Chris Green",
            "content": "Can't wait to visit Paris! Thanks for the guide.",
            "createdAt": "2024-04-16T09:00:00Z"
        }],
        "likes": 8,
    },
    {
        "title": "Understanding Machine Learning",
        "author": "Michael Brown",
        "content": "Machine learning is a branch of artificial intelligence that focuses on building systems that learn from data...",
        "createdAt": "2024-06-05T11:00:00Z",
        "updatedAt": "2024-06-05T11:00:00Z",
        "tags": ["Machine Learning", "AI", "Data Science"],
        "category": "Technology",
        "comments": [{
            "author": "Sara White",
            "content": "Great article on ML basics. Very insightful!",
            "createdAt": "2024-06-05T13:00:00Z"
        }],
        "likes": 15,
    },
    {
        "title": "Mastering the Art of Cooking",
        "author": "Gordon Ramsay",
        "content": "Cooking is an art and a science. Here are some tips and techniques to help you master the kitchen...",
        "createdAt": "2024-06-07T09:30:00Z",
        "updatedAt": "2024-06-07T09:30:00Z",
        "tags": ["Cooking", "Recipes", "Culinary Arts"],
        "category": "Food",
        "comments": [{
            "author": "Jamie Oliver",
            "content": "Fantastic tips, Gordon! Always learning something new.",
            "createdAt": "2024-06-07T10:30:00Z"
        }],
        "likes": 25,
    }
]

Blog.insertMany(blogs);