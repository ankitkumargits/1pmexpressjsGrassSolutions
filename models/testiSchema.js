const mongoose = require('mongoose');


const testSchema = new mongoose.Schema({
    quotes: String,
    name: String,
    testiimg: String,
    status: String,
    postedDate: String,
});


const Testimonial = mongoose.model('testimonial', testSchema);


module.exports = Testimonial;