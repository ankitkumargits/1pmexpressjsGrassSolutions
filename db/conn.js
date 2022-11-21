const mongoose = require("mongoose");

const dbUrl = 'mongodb://127.0.0.1:27017/1pmexpress1'

const connectToMongo = () =>{
    mongoose.connect(dbUrl, ()=>{
        console.log("Your db is connected to the server => 1pmexpress1");
    })
}


module.exports = connectToMongo;