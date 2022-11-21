const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    name: String,
    address: String,
    phone: Number,
    telephone: Number,
    cdes: String
});


const Address = mongoose.model('address', addressSchema);

module.exports = Address;