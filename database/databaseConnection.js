const mongoose = require("mongoose")

async function connectToDb() {
    await mongoose.connect("mongodb://localhost:27017/nodejs");
    console.log("Database connected")
}

module.exports = connectToDb