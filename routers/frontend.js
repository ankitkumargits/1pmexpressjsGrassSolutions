const Banner = require("../models/banner");
const Contact = require("../models/contactSchema");
const Address = require("../models/footeraddressSchema");
const UserReg = require("../models/userRegSchema");
const router = require("express").Router();
const bcrypt = require('bcrypt');
const frHandleLogin = require("../middleware/frmiddlelog");
const Testimonial = require("../models/testiSchema");
const multer = require('multer');

let sess=null;

let storage = multer.diskStorage({
    destination: (req, file, callback)=>{
        callback(null, "./public/upload");
    },
    filename:(req, file, callback)=>{
        callback(null, Date.now()+"_"+file.originalname);
    }
});

const upload = multer({
    storage:storage,
    limits: {fileSize: 1024*1024*5}
});

// Img testing for url
router.get("/imgform", (req, res)=>{
    res.render("imgForm.ejs")
});
router.post("/uploadimg",upload.single('img'), (req, res)=>{
    console.log(req.file.filename);
    res.redirect("/imgform");
})


function handleRole(req, res, next){
    if(sess.role!=='public'){
        next();
    }else {
        res.send("You don't have any permission right now.")
    }
}

router.get("/", frHandleLogin, async (req, res)=>{
    const bannerdetails = await Banner.findOne();
    const addressDetails = await Address.findOne();
    const testiDetails = await Testimonial.find({status: 'active'});
    if (sess!==null){
        res.render("index.ejs", {bannerdetails, addressDetails, testiDetails, contactMess: null, username:sess.username});
    }else {
        res.render("index.ejs", {bannerdetails, addressDetails, testiDetails, contactMess: null, username:null});
    }
});


router.get("/banner", frHandleLogin, handleRole, async (req, res)=>{
    const bannerDetails = await Banner.findOne();
    const addressDetails = await Address.findOne();
    if (sess !== null){
        res.render("banner.ejs", {bannerDetails, addressDetails, username: sess.username});
    }else {
        res.render("banner.ejs", {bannerDetails, addressDetails, username: null});
    }
});

router.post('/submitcontact', async (req, res)=>{
    // console.log(req.body);
    const {email, query} = req.body;
    let dt = new Date().toLocaleString();
    const contactDetails = new Contact({
        email: email,
        query: query,
        status: "Unread",
        postedDate: dt
    });
    contactDetails.save();
    const bannerdetails = await Banner.findOne();
    const addressDetails = await Address.findOne();
    const testiDetails = await Testimonial.find();
    if (sess !== null){
        res.render("index.ejs", {bannerdetails, addressDetails, contactMess: "Your query is submitted successfully", username:sess.username, testiDetails});
    } else {
        res.render("index.ejs", {bannerdetails, addressDetails, contactMess: "Your query is submitted successfully", username:null, testiDetails});
    }
});


router.get('/userreg', async (req, res)=>{
    const addressDetails = await Address.findOne();
    if (sess!==null){
        res.render('userReg.ejs', {addressDetails, mess:null, username: sess.username});
    } else {
        res.render('userReg.ejs', {addressDetails, mess:null, username: null});
    }
    
});

router.post('/newuserreg', async (req, res)=>{
    const {username, password} = req.body;
    const bpassword = await bcrypt.hash(password, 10);
    const userExists = await UserReg.exists({username: username});
    if (userExists){
        const addressDetails = await Address.findOne();
        if (sess!== null){
            res.render('userReg.ejs', {addressDetails, mess:"Already you have an account Please login", username:sess.username});
        } else {
            res.render('userReg.ejs', {addressDetails, mess:"Already you have an account Please login", username:null});
        }
    } else {
        const dt = new Date().toLocaleString();
        const userRegData = new UserReg({
            username: username,
            password: bpassword,
            firstname: "",
            lastname: "",
            email: "",
            status: "suspended",
            role: "public",
            regDate: dt,
            profileImg:"../media/account.png"
        });
        await userRegData.save();
        const addressDetails = await Address.findOne();
        if (sess!== null){
            res.render("login.ejs", {addressDetails, mess:"Your account is created", username:sess.username});
        } else {
            res.render("login.ejs", {addressDetails, mess:"Your account is created", username:null});
        }
    }
});

router.get("/login", async (req, res)=>{
    const addressDetails = await Address.findOne();
    if(sess !== null){
        // res.render("login.ejs", {addressDetails, mess:null, username: sess.username});
        // You are directly goes to the home page without login every tab  like facebook
        res.redirect("/");
    } else {
        res.render("login.ejs", {addressDetails, mess:null, username: null});
    }
});

router.post('/userlogin', async (req, res)=>{
    const {username, password} = req.body;
    const userdata = await UserReg.findOne({username: username});
    if(userdata!==null){
        const pass = await bcrypt.compare(password, userdata.password);
        if(pass){
            if(userdata.status == "active"){
                req.session.isAuth = true;
                sess=req.session;
                sess.username=username;
                sess.role=userdata.role;
                res.redirect("/profile");
            } else {
                const addressDetails = await Address.findOne();
                // if(sess!== null){
                res.render("login.ejs", {addressDetails, mess:"Your account is suspended contact your admin", username: sess.username});
                // } else {
                //     res.render("login.ejs", {addressDetails, mess:"Your account is suspended contact your admin", username: null});
                // }
            }
        } else {
            const addressDetails = await Address.findOne();
            // if(sess!== null){
                res.render("login.ejs", {addressDetails, mess:"Please fill correct username and password", username: null});
            // } else {
            //     res.render("login.ejs", {addressDetails, mess:"Please fill correct username and password", username: null});
            // }
        }
    } else {
        const addressDetails = await Address.findOne();
        if(sess !== null){
            res.render("login.ejs", {addressDetails, mess:"Please fill correct username and password", username: sess.username});
        }else {
            res.render("login.ejs", {addressDetails, mess:"Please fill correct username and password", username: null});
        }
    }

});


router.get('/profile', frHandleLogin, async(req, res)=>{
    const addressDetails = await Address.findOne();
    let userData = null;
    if(sess !== null){
        userData = await UserReg.findOne({username: sess.username});
        res.render("profile.ejs", {addressDetails, username:sess.username, userData});
    }else {
        res.render("profile.ejs", {addressDetails, username:null, userData});
    }
});

router.post("/profileupdate/:id",upload.single('profileImg') , async(req, res)=>{
    if(sess !== null){
        await UserReg.findByIdAndUpdate(req.params.id, {
            firstname:req.body.fname,
            lastname: req.body.lname,
            email: req.body.email,
            dob:req.body.dob,
            profileImg: req.file.filename
        });
        res.redirect('/profile');
    }else {
        res.redirect('/login');
    }
});


router.get('/logout', (req, res)=>{
    req.session.destroy();
    sess=null;
    res.redirect("/login")
});


router.get('/testi', frHandleLogin, async (req, res)=>{
    const addressDetails = await Address.findOne();
    if(sess !== null){
    res.render("testimonial.ejs", {addressDetails, username:sess.username});
    }else {
        res.render("testimonial.ejs", {addressDetails, username:null});
    }
});

router.post('/testipost', upload.single('testiimg'),async (req, res)=>{
    const {quotes, name} = req.body;
    const dt = new Date().toLocaleString();
    if(req.file){
        const testidata = new Testimonial({quotes: quotes, name: name,testiimg: req.file.filename, status: 'inactive', postedDate: dt});
        await testidata.save();
    }else{
        const testidata = new Testimonial({quotes: quotes, name: name,
            testiimg: "../media/account.png", status: 'inactive', postedDate: dt});
        await testidata.save();
    }
    res.redirect('/')
}); 

router.get('/changepassword', async (req, res)=>{
    const addressDetails = await Address.findOne();
    if(sess !==null){
        res.render("changepassword.ejs", {addressDetails, username:sess.username, mess:null});
    }else{
        res.render("changepassword.ejs", {addressDetails, username:sess.username, mess:null});
    }
    
});
router.post("/changepassword/:username", async (req ,res)=>{
    const {currentpass, newpass} = req.body;
    const bnewpass = await bcrypt.hash(newpass, 10);
    const userData = await UserReg.findOne({username:req.params.username});
    const id = userData.id;
    const bpass = await bcrypt.compare(currentpass, userData.password);
    const addressDetails = await Address.findOne();
    if (bpass){
        await UserReg.findByIdAndUpdate(id, {
            password: bnewpass
        });
        res.render("changepassword.ejs", {addressDetails, username:sess.username, mess:"Successfully password changed"});
    }else{
        res.render("changepassword.ejs", {addressDetails, username:sess.username, mess:"Your password do not changed"});
    }
});

router.get("/forgotpassword", async(req, res)=>{
    const addressDetails = await Address.findOne();
    res.render("forgotpassword.ejs", {addressDetails,username: null, mess:null});
});

router.post("/forgotpassword", async(req, res)=>{
    const addressDetails = await Address.findOne();
    const userData = await UserReg.findOne({
        username:req.body.username, 
        dob: req.body.dob
    });
    const userId = userData.id;
    const bnewpass = await bcrypt.hash(req.body.newpassword, 10)
    if(userData){
        await UserReg.findByIdAndUpdate(userId, {
            password: bnewpass
        });
        res.render("forgotpassword.ejs", {addressDetails,username: null, mess:"Successfully changed"});
    }else {
        res.render("forgotpassword.ejs", {addressDetails,username: null, mess:"Invalid Inputs"});
    }
});

module.exports = router;