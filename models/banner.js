const mongoose = require("mongoose");


const bannerSchema = mongoose.Schema({
    title: String,
    desc: String,
    ldesc: String,
    bannerimg: String
});

const Banner = mongoose.model('banner', bannerSchema);

module.exports = Banner;