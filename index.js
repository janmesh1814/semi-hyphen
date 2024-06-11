const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const mongoose = require('mongoose');
const Blog = require("./models/blog.js");
main()
    .then(() => {
        console.log("Connection Successful");
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/blogging', { useNewUrlParser: true, useUnifiedTopology: true });
};

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// 1-) New route - to add new blog 
app.get("/blogs/new", (req, res) => {
    res.render("new.ejs");
});

app.post('/blogs', async(req, res) => {
    try {
        const { title, author, content, tags } = req.body;

        // Split tags string into an array of tags
        const tagArray = tags.split(',').map(tag => tag.trim());

        // Create a new blog post
        const newBlog = new Blog({
            title,
            author,
            content,
            tags: tagArray
        });

        // Save the new blog post to the database
        await newBlog.save();

        res.redirect('/'); // Redirect to home page or wherever appropriate
    } catch (error) {
        console.error('Error creating new blog:', error);
        res.status(500).send('Server Error');
    }
});

// Route to increment likes for a blog post
app.post('/blogs/:id/like', async(req, res) => {
    const { id } = req.params;

    try {
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).send('Blog not found');
        }

        // Increment likes
        blog.likes += 1;
        await blog.save();

        res.redirect(`/blogs/${id}`);
    } catch (error) {
        console.error('Error incrementing likes:', error);
        res.status(500).send('Server Error');
    }
});


// 2-) Index route - to get data of all post
app.get("/blogs", async(req, res) => {
    let blogs = await Blog.find();
    // console.log(blogs);
    res.render("index.ejs", { blogs });
});

// 3-) retrieve blog by id
app.get("/blogs/:id/", async(req, res) => {
    const { id } = req.params;

    try {
        const blog = await Blog.findById(id);
        // console.log(blog);

        if (!blog) {
            return res.status(400).send("Blog not found");
        }
        res.render("blog.ejs", { blog });

    } catch (error) {
        // console.log(error);
        res.status(500).send("Server error");
    }
});

app.get("/", (req, res) => {
    res.send("Hii, blogging community");
});

app.listen(port, () => {
    console.log(`listening to port ${port}`);
});

// id, topic, data, poster_name, date