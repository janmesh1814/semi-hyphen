// 
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const secretKey = "secretKey";
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const { Blog } = require("./models/blog.js");
const { Comment } = require("./models/blog.js");
const User = require("./models/user.js");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

main()
    .then(() => {
        console.log("Connection Successful");
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/blogging', { useNewUrlParser: true, useUnifiedTopology: true });
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

// authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    // console.log(token);

    if (!token) {
        return res.status(401).send("Access Denied");
    }

    try {
        const verified = jwt.verify(token, secretKey);
        req.user = verified.user;
        next();
    } catch (error) {
        console.error("Invalid Token", error);
        res.status(400).send("Invalid Token");
    }
}

// 6-) token-based authentication
app.get("/", (req, res) => {
    res.render("login.ejs");
});

app.post("/login", async(req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send("User doesn't exist");
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send("Password does not match");
        }

        const token = jwt.sign({ user }, secretKey, { expiresIn: "300s" });
        res.cookie('token', token, { httpOnly: true }).redirect('/blogs');

    } catch (error) {
        res.status(500).send("Server error");
    }
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.post("/register", async(req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });

        if (user) {
            return res.status(400).send("Username already taken");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({
            username,
            password: hashedPassword
        });

        await user.save();

        const token = jwt.sign({ user }, secretKey, { expiresIn: "300s" });
        res.cookie('token', token, { httpOnly: true }).redirect('/blogs');
    } catch (error) {
        res.status(500).send("Server Error");
    }
});

// 1-) New route - to add new blog 
app.get("/blogs/new", (req, res) => {
    res.render("new.ejs");
});

app.post('/blogs', authenticateToken, async(req, res) => {
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
app.get("/blogs", authenticateToken, async(req, res) => {
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

app.put('/blogs/:id', authenticateToken, async(req, res) => {
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
app.get("/blogs/:id/destroy", authenticateToken, async(req, res) => {
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
app.post('/blogs/:id/like', authenticateToken, async(req, res) => {
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

app.post("/blogs/:id/comment", authenticateToken, async(req, res) => {
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

app.listen(port, () => {
    console.log(`listening to port ${port}`);
});