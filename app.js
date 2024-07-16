require("dotenv").config();
const express = require("express");
const connectToDb = require("./database/databaseConnection");
const Blog = require("./model/blogModel");
const bcrypt = require('bcrypt');
const app = express();
const { multer, storage } = require('./middleware/multerConfig');
const User = require("./model/UserModel");
const upload = multer({ storage: storage });
const jwt = require("jsonwebtoken");
const isAuthenticated = require("./middleware/isAuthenticated");
const cookieParser = require('cookie-parser');
app.use(cookieParser());

connectToDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get("/", async (req, res) => {
    const blogs = await Blog.find() // always returns arrrays
    res.render("./blog/home.ejs", { blogs })
});



app.get("/about", isAuthenticated, (req, res) => {
    const name = "Mithun Yadav";
    res.render("about.ejs", { name });
});

app.get("/contact", (req, res) => {
    res.render("./blog/contact");

})

app.post("/contact", async (req, res) => {

    const { email, message } = req.body;
    await User.create({
        email,
        message
    });

    res.send("Your message sended successfully");
});

app.get("/createblog", isAuthenticated, (req, res) => {
    console.log(req.userId);
    res.render("./blog/createBlog");
});

app.post("/createblog", upload.single('image'), async (req, res) => {
    const fileName = req.file.filename;
    const { title, subtitle, description } = req.body;
    console.log(title, subtitle, description);

    await Blog.create({
        title,
        subtitle,
        description,
        image: fileName
    });

    res.send("Blog created successfully");
});

app.get("/blog/:id", async (req, res) => {
    const id = req.params.id;
    const blog = await Blog.findById(id);
    res.render("./blog/singleBlog", { blog });
});

app.get("/deleteblog/:id", async (req, res) => {
    const id = req.params.id;
    await Blog.findByIdAndDelete(id);
    res.redirect("/");
});

app.get("/editblog/:id", async (req, res) => {
    const id = req.params.id;
    const blog = await Blog.findById(id);
    res.render("./blog/editBlog", { blog });
});

app.post("/editblog/:id", async (req, res) => {
    const id = req.params.id;
    const { title, subtitle, description } = req.body;
    await Blog.findByIdAndUpdate(id, {
        title: title,
        subtitle: subtitle,
        description: description
    });
    res.redirect("/blog/" + id);
});

app.get("/register", (req, res) => {
    res.render("./authentication/register");
});

app.get("/login", (req, res) => {
    res.render("./authentication/login");
});

app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    console.log("Username:" + username + " Email:" + email + " Password:" + password);
    await User.create({
        username: username,
        email: email,
        password: bcrypt.hashSync(password, 12)
    });
    res.redirect("/login");
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("Email:" + email + " Password:" + password);
    const user = await User.find({ email: email });

    if (user.length === 0) {
        res.send("Invalid email");
    } else {
        const isMatched = bcrypt.compareSync(password, user[0].password);
        if (!isMatched) {
            res.send("Invalid password");
        } else {
            const token = jwt.sign({ userId: user[0]._id }, process.env.SECRET, {
                expiresIn: '20d'
            });
            res.cookie("token", token);
            res.send("logged in successfully");
        }
    }
});

// Handle search requests
app.get('/search', (req, res) => {
    const search = req.query.search || '';
    res.render("./blog/search.ejs", { search, Blogs: [] });
});

app.post('/search', async (req, res) => {
    const { search } = req.body;
    let Blogs;

    if (search) {
        Blogs = await Blog.find({
            $or: [{ title: { $regex: search, $options: "i" } }, { content: { $regex: search, $options: "i" } }]
        });
    } else {
        Blogs = await Blog.find();
    }

    if (Blogs.length === 0) {
        res.send("NO BLOGS<br /><a href='/register'>Register</a>&nbsp;<a href='/createblog'>Create blog</a>");
    } else {
        res.render("./blog/search.ejs", { Blogs, search });
    }
});



app.get('/logout', (req, res) => {
    res.clearCookie("token");
    res.render("./authentication/logout", { message: "You have been logged out." });
});

app.use(express.static("./storage"));
app.use(express.static("./public"));

app.listen(3000, () => {
    console.log("Nodejs project has started at port" + 3000);
});
