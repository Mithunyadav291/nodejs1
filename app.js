const express = require("express")
const connectToDb = require("./database/databaseConnection")
const Blog = require("./model/blogModel")
const bcrypt = require('bcrypt')

const app = express()
// const multer = require("./middleware/multerConfig").multer
// const storage = require("./middleware/multerConfig").storage

const { multer, storage } = require('./middleware/multerConfig')
const User = require("./model/Usermodel")
const upload = multer({ storage: storage })

connectToDb()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('view engine', 'ejs')

app.get("/", async (req, res) => {
    const blogs = await Blog.find() // always returns arrray 
    res.render("./blog/home", { blogs })
})

// app.get("/about", (req, res) => {
//     const name = "Mithun Yadav"
//     res.render("about.ejs", { name })
// })
app.get("/createblog", (req, res) => {
    res.render("./blog/createBlog")
})
app.get("/blog/:id", async (req, res) => {
    const id = req.params.id;
    const blog = await Blog.findById(id)

    res.render("./blog/newblog", { blog: blog })
})

app.get("/deleteblog/:id", async (req, res) => {
    const id = req.params.id;
    await Blog.findByIdAndDelete(id)
    res.redirect("/")
})

app.get("/editblog/:id", async (req, res) => {
    const id = req.params.id;
    const blog = await Blog.findById(id)
    res.render("./blog/editblog", { blog })
})

app.post("/editblog/:id", async (req, res) => {
    const id = req.params.id;
    const { title, subtitle, description } = req.body;
    await Blog.findByIdAndUpdate(id, {
        title: title,
        subtitle: subtitle,
        description: description
    })
    res.redirect("/blog/" + id)
})




app.post("/createblog", upload.single('image'), async (req, res) => {
    // const title = req.body.title 
    // const subtitle = req.body.subtitle 
    // const description  = req.body.description 
    const fileName = req.file.filename
    const { title, subtitle, description } = req.body
    console.log(title, subtitle, description, fileName)

    await Blog.create({
        title,
        subtitle,
        description,
        image: fileName
    })

    res.send("Blog created successfully")
})


app.get("/register", (req, res) => {
    res.render("./authentication/register")
})

app.post("/register", async (req, res) => {

    const { username, email, password } = req.body
    console.log(username, email, password)
    const hashedPassword = bcrypt.hashSync(password, 12);

    await User.create({
        username: username,
        email: email,
        password: hashedPassword
    })

    res.redirect("/login")
})

app.get("/login", (req, res) => {
    res.render("./authentication/login")
})

app.post("/login", async (req, res) => {

    const { email, password } = req.body
    const user = await User.findOne({
        email: email
    })

    if (user.length === 0) {
        res.send("Invalid email")
    }
    else {
        //check password
        const isMatched = bcrypt.compareSync(password, user.password);
        if (isMatched) {
            res.send("Logged In Successfully")
        } else {
            res.send("Invalid Password")
        }
    }

})

app.use(express.static("./storage"))

app.listen(3000, () => {
    console.log("Nodejs project has started at port  " + 3000)
})