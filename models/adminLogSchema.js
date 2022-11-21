const mongoose = require("mongoose");

const adminLogSchema = new mongoose.Schema({
    username: String,
    password: Number
});


const AdminLog = mongoose.model("adminlog", adminLogSchema);

module.exports = AdminLog;