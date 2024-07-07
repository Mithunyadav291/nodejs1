const express = require("express")
const app = express()

app.set('view engine', 'ejs')

app.get("/", (req, res) => {

    res.send("<h1>huhu, this is home page</h1>")
})

app.get("/about", (req, res) => {
    const name = "Manish Basnet"
    res.render("about.ejs", { name })
})


app.listen(3000, () => {
    console.log("Nodejs project has started at port" + 3000)
})