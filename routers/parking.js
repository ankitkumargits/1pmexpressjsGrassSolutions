const Parking = require("../models/parkingSchema");

const router = require("express").Router();

router.get("/", async (req, res)=>{
    const parkingData = await Parking.find();
    res.render("parking/home.ejs", {parkingData});
});
router.get("/adddetails", (req, res)=>{
    res.render("parking/adddetails");
});

router.post("/adddetails", (req, res)=>{
    let vehicleintime = new Date();
    const {vehicleno, vehicletype} = req.body;
    const parkingData = new Parking({
        vehicleNo: vehicleno,
        vehicleType:vehicletype,
        vehicleInTime: vehicleintime,
        vehicleOutTime: "",
        amount:0,
        status:"IN"
    });
    parkingData.save();
    res.redirect("/parking");
});

// router.get("/statusupdate/:id", (req, res)=>{
//     const id = req.params.id;
//     res.render("parking/parkingOut.ejs", {id});
// });

// router.post("/statusupdate/:id", async (req, res)=>{
router.get("/statusupdate/:id", async (req, res)=>{
    // const {vehicleouttime} = req.body;
    let  vehicleouttime = new Date();
    const parkingInData = await Parking.findById(req.params.id);
    let totalTime = new Date(new Date(vehicleouttime)-new Date(parkingInData.vehicleInTime))/(1000*60*60*24);
    let amount=null;
    if(parkingInData.vehicleType == 'twowheeler'){
        amount = totalTime* 20;
    }// threewheeler // fourwheeler // others
    else if(parkingInData.vehicleType == 'threewheeler'){
        amount = totalTime* 50;
    }
    else if(parkingInData.vehicleType == 'fourwheeler'){
        amount = totalTime* 80;
    }   
    else if(parkingInData.vehicleType == 'others'){
        amount = totalTime* 100; 
    }else {
        amount = 0;
    }
    amount = Math.round(amount)
    await Parking.findByIdAndUpdate(parkingInData, {amount: amount, status: "OUT", vehicleOutTime:vehicleouttime})
    res.redirect("/parking");
});

router.get("/takeprint/:id", async(req, res)=>{
    const parkingData = await Parking.findById(req.params.id);
    res.render("parking/takePrint.ejs", {parkingData});
});

module.exports = router;