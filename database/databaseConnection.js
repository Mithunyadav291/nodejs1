const mongoose = require("mongoose")

async function connectToDb() {
    await mongoose.connect("mongodb+srv://Mithun18:mithun890@cluster0.tzig1mj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    console.log("Database connected")
}

module.exports = connectToDb