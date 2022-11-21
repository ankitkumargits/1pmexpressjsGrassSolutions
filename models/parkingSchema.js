const mongoose = require("mongoose");


const parkingSchema = new mongoose.Schema({
    vehicleNo: String,
    vehicleInTime: String,
    vehicleOutTime: String,
    vehicleType:String,
    amount:Number,
    status:String
});

const Parking = mongoose.model("parking", parkingSchema);

module.exports = Parking;   