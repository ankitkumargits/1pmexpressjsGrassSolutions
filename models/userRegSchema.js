const mongoose = require("mongoose");


const userRegSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    dob:String,
    email: String,
    status: String,
    role: String,
    regDate: String,
    profileImg: String
});


const UserReg = mongoose.model('userreg', userRegSchema);

module.exports = UserReg;