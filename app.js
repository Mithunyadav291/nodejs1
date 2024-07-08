const express = require("express")
const connectToDb = require("./database/databaseConnection")
const app = express()
const Blog = require("./model/blogmodel.js")

connectToDb()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('view engine', 'ejs')

app.get("/", (req, res) => {

    res.send("<h1>huhu, this is home page</h1>")
})

app.get("/about", (req, res) => {
    const name = "Mithun Yadav"
    res.render("about.ejs", { name })
})
app.get("/createblog", (req, res) => {

    res.render("createblog.ejs")
})

app.post("/createblog", async (req, res) => {
    const { title, subtitle, description } = req.body
    console.log(title, subtitle, description)
    await Blog.create({
        title,
        subtitle,
        description
    })
    res.send("Blog created successfully")
})


app.listen(3000, () => {
    console.log("Nodejs project has started at port" + 3000)
})