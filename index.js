const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require('mongoose');
const { Blog } = require("./models/blog.js");
const { Comment } = require("./models/blog.js");

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
app.use(methodOverride("_method"));

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

        res.redirect('/blogs'); // Redirect to home page or wherever appropriate
    } catch (error) {
        console.error('Error creating new blog:', error);
        res.status(500).send('Server Error');
    }
});

// 2-) Index route - to get data of all post
app.get("/blogs", async(req, res) => {
    let blogs = await Blog.find();
    // console.log(blogs);
    res.render("index.ejs", { blogs });
});

// 3-) Retrieve blog by id
app.get("/blogs/:id/", async(req, res) => {
    const { id } = req.params;

    try {
        const blog = await Blog.findById(id);
        // console.log(blog);

        if (!blog) {
            return res.status(400).send("Blog not found");
        }

        // console.log(blog.createdAt);
        res.render("blog.ejs", { blog });

    } catch (error) {
        // console.log(error);
        res.status(500).send("Server error");
    }
});

// 4-) Edit route
app.get("/blogs/:id/edit", async(req, res) => {
    const { id } = req.params;
    try {
        const blog = await Blog.findById(id);

        if (!blog) {
            res.status(400).send("Blog not Found !");
        }

        res.render("edit.ejs", { blog });
    } catch (error) {
        res.status(500).send("Server error");
    }
});

app.put('/blogs/:id', async(req, res) => {
    const { id } = req.params;
    const { title, content, tags } = req.body;

    try {
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).send('Blog not found');
        }

        blog.title = title;
        blog.content = content;
        blog.tags = tags.split(',').map(tag => tag.trim());

        await blog.save();

        res.redirect(`/blogs`);
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).send('Server Error');
    }
});

// 5-) Destroy route
app.get("/blogs/:id/destroy", async(req, res) => {
    const { id } = req.params;

    try {
        const blog = await Blog.findById(id);

        if (!blog) {
            res.status(400).send("Blog not found");
        }

        await Blog.findByIdAndDelete(id);
        res.redirect("/blogs");
    } catch (error) {
        res.status(500).send("server error");
    }
})

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

app.post("/blogs/:id/comment", async(req, res) => {
    const { id } = req.params;
    const { author, content } = req.body;

    try {
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).send('Blog post not found');
        }

        const newComment = new Comment({ author, content });
        blog.comments.push(newComment);

        await blog.save();
        res.redirect(`/blogs/${id}`);
    } catch (error) {
        res.status(500).send("Server error");
    }
})

app.get("/", (req, res) => {
    res.send("Hii, blogging community");
});

app.listen(port, () => {
    console.log(`listening to port ${port}`);
});