const AdminLog = require("../models/adminLogSchema");
const adhandleLogin = require("../middleware/admiddlelog");
const Banner = require("../models/banner");
const router = require("express").Router();
const Contact = require('../models/contactSchema');
const Address = require("../models/footeraddressSchema");
const UserReg = require("../models/userRegSchema");
const multer = require("multer");
const Testimonial = require("../models/testiSchema");
const nodemailer = require("nodemailer");

let sess; // use for sent to the username of admin

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, './public/upload')
    },
    filename: (req, file, cb)=>{
        cb(null, Date.now()+"_"+file.originalname)
    }
});

const upload = multer({
    storage: storage,
    limits:{fileSize: 1024*1024*5}
});

router.get("/", (req, res)=>{
    res.render("admin/adminLogin.ejs", {
        errmsg: ""
    });
});

router.post("/adlogin", async (req, res)=>{
    // res.send("your page login");
    // console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;
    const admindetails = await AdminLog.findOne({username: username});
    // console.log(admindetails);
    if(admindetails !== null){
        if(admindetails.password == password){
            req.session.isAuth = true;
            // sess = req.session;  // it comes above global
            // sess.username = username; // i don't wanna username sent to the dashboard page if you can send syntax like that
            res.redirect("/admin/dashboard");
        }else {
        // res.redirect("/admin/");
        res.render("admin/adminLogin.ejs", {
            errmsg: "Your username and password are wrong"
        });
        }
    } else {
        // res.redirect("/admin/");
        res.render("admin/adminLogin.ejs", {
            errmsg: "Your username and password are wrong"
        });
    }
});

// here accept the middleware  =>  adhandleLogin, 
router.get("/dashboard", adhandleLogin, (req, res)=>{
    // res.render("admin/dashboard.ejs", {username: sess.username});  // dynamic username sent to the dashboard
    res.render("admin/dashboard.ejs");
});

router.get("/logout", (req, res)=>{
    req.session.destroy();
    // sess = null;
    res.redirect('/admin/');
});


router.get("/banner", async(req, res)=>{
    const bannerDetails = await Banner.findOne();
    // console.log(bannerDetails);
    res.render("admin/banner.ejs",{bannerDetails, mess: null});
});

router.get("/bannerupdate/:id", async (req, res)=>{
    // console.log(req.params.id);
    // const id = req.params.id;
    const bannerUpdate = await Banner.findById(req.params.id);
    res.render("admin/bannerupdate.ejs", {bannerUpdate});
});

router.post("/bannerupdate/:id", upload.single('bannerimg'), async (req, res)=>{
    // console.log(req.file);
    if(req.file){
        await Banner.findByIdAndUpdate(req.params.id,{
            title: req.body.title,
            desc: req.body.desc,
            ldesc: req.body.ldesc,
            bannerimg: req.file.filename
        });
    }else{
        await Banner.findByIdAndUpdate(req.params.id,{
            title: req.body.title,
            desc: req.body.desc,
            ldesc: req.body.ldesc
        });
    }
    
    // res.redirect('/admin/banner');
    const bannerDetails = await Banner.findOne();
    res.render("admin/banner.ejs", {bannerDetails, mess: "Successfully Updated"});
});


router.get('/contact', async (req, res)=>{
    const contactAll = await Contact.find().sort({postedDate: -1});
    const totalQueries = await Contact.count();
    const readQueries = await Contact.count({status: "Read"});
    const unreadQueries = await Contact.count({status: "Unread"});
    // console.log(contactAll);
    res.render("admin/contact.ejs", {contactAll, mess:null, totalQueries, readQueries, unreadQueries});
});

router.get('/statusupdate/:id',async (req, res)=>{
    // console.log(req.params.id);
    const statusid = await Contact.findById(req.params.id);
    // console.log(statusid);
    let newStatus=null;
    if(statusid.status == "Unread"){
        newStatus="Read";
    }else {
        newStatus="Unread";
    }
    await Contact.findByIdAndUpdate(statusid, {status:newStatus});
    res.redirect('/admin/contact/');
});

router.get("/contactdelete/:id", async (req, res)=>{
    // console.log(req.params.id);
    await Contact.findByIdAndDelete(req.params.id);
    // res.redirect('/admin/contact');
    const contactAll = await Contact.find();
    res.redirect('/admin/contact/');
});


router.post('/contactsearch', async(req, res)=>{
    // console.log(req.body);
    const searchValue = req.body.search
    const contactAll = await Contact.find({status: searchValue});
    const totalQueries = await Contact.count();
    const readQueries = await Contact.count({status: "Read"});
    const unreadQueries = await Contact.count({status: "Unread"});
    res.render('admin/contact.ejs', {contactAll, mess: null, totalQueries, readQueries, unreadQueries});
});


router.get("/address", async (req, res)=>{
    const addressDetails = await Address.findOne();
    res.render("admin/address.ejs", {addressDetails});
});

router.get("/addressupdate/:id", async (req, res)=>{
    const addressData = await Address.findById(req.params.id);
    // console.log(adrsupdatedata);
    res.render("admin/addressupdate.ejs",{addressData});
});

router.post('/adressupdate/:id', async (req, res)=>{
    await Address.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        address: req.body.address,
        phone: req.body.phone,
        telephone: req.body.phone,
        cdesc: req.body.cdesc
    });
    res.redirect('/admin/address');
});


router.get('/usersmng', async(req, res)=>{
    const userdata = await UserReg.find().sort({regDate: -1});
    const userCount = await UserReg.count();
    const userActive = await UserReg.count({status: 'active'});
    const userSuspended = await UserReg.count({status: 'suspended'});
    const userPublicRole = await UserReg.count({role: 'public'});
    const userPrivateRole = await UserReg.count({role: 'private'});
    res.render("admin/usersmng.ejs", {userdata, userCount, userActive, userSuspended, userPublicRole, userPrivateRole});
});

router.get("/userstatusupdate/:id", async (req, res)=>{
    const userdata = await UserReg.findById(req.params.id);
    let newStatus = null;
    if(userdata.status == 'suspended'){
        newStatus = "active"
    } else {
        newStatus = 'suspended'
    }
    await UserReg.findByIdAndUpdate(req.params.id, {
        status: newStatus
    });
    res.redirect('/admin/usersmng');
});

router.get('/userroleupdate/:id', async (req, res)=>{
    const userdata = await UserReg.findById(req.params.id);
    let newRole = null;
    if(userdata.role == 'public'){
        newRole = "private"
    } else {
        newRole = 'public'
    }
    await UserReg.findByIdAndUpdate(req.params.id, {
        role: newRole
    });
    res.redirect('/admin/usersmng');
});

router.get('/deleteuser/:id', async(req, res)=>{
    await UserReg.findByIdAndDelete(req.params.id);
    res.redirect('/admin/usersmng');
});

router.post("/usersearch", async(req, res)=>{
    let searchVal = '';
    // const {searchVal} = req.body;
    if(req.body.searchVal){
        searchVal = req.body.searchVal;
    }
    const userdata = await UserReg.find({username:searchVal,
        username:{$regex:'.*'+searchVal+'.*',$options:'i'}
    });
    const userCount = await UserReg.count();
    const userActive = await UserReg.count({status: 'active'});
    const userSuspended = await UserReg.count({status: 'suspended'});
    const userPublicRole = await UserReg.count({role: 'public'});
    const userPrivateRole = await UserReg.count({role: 'private'});
    res.render("admin/usersmng.ejs", {userdata, userCount, userActive, userSuspended, userPublicRole, userPrivateRole});
})

router.get('/testimonials', async(req, res)=>{
    const testiData = await Testimonial.find().sort({postedDate: -1});
    const testiCount = await Testimonial.count();
    const testiActive = await Testimonial.count({status: 'active'})
    const testiInactive = await Testimonial.count({status: 'inactive'})
    res.render('admin/testimonialsmng.ejs', {testiData, testiCount, testiActive, testiInactive});
});

router.get("/testidelete/:id", async(req, res)=>{
    await Testimonial.findByIdAndDelete(req.params.id);
    res.redirect("/admin/testimonials");
});

router.get('/testistatus/:id', async(req, res)=>{
    const testid = await Testimonial.findById(req.params.id);
    let newStatus = null;
    if(testid.status == "active"){
        newStatus = "inactive";
    }else {
        newStatus = "active"
    }
    await Testimonial.findByIdAndUpdate(req.params.id, {status: newStatus});
    res.redirect('/admin/testimonials');
});

router.get("/contactmail/:id", async (req, res)=>{
    const contactData = await Contact.findById(req.params.id);
    res.render("admin/contactmail.ejs", {contactData});
});

router.post("/sendmail", upload.single('emailimg'),async(req, res)=>{
    const {to, from, subject, body} = req.body;
    const path = req.file.path;

    async function main() {
    let testAccount = await nodemailer.createTestAccount();
    
  // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'msemitra27@gmail.com', // generated ethereal user
      pass: 'aootgtuibyatrsnd', // generated ethereal password
    }, 
    });

  // send mail with defined transport object
    let info = await transporter.sendMail({
    from: from, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: body, // plain text body
    attachments: [{
        path: path
    }]
    // html: "<b>Hello world?</b>", // html body
    });
    // console.log("Message sent: %s", info.messageId);
//   // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

//   // Preview only available when sending through an Ethereal account
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
// main().catch(console.error);
    main()
    res.redirect("/admin/contact/");
    
});

router.get("/socialmedia", (req, res)=>{
    res.render('admin/social-media.ejs');
});








// ---------------------- test -------------------------------- //  
// for banner details insert into the database
router.get("/bannertest", (req, res)=>{
    // const bannerDetails = new Banner({
    //     title: "Title",
    //     desc: "Desc",
    //     ldesc: "lDesc"
    // });
    // bannerDetails.save();
    res.send("Your admin log is saved in the databases");
});


// for admin login details insert into the database
router.get("/adtest", (req, res)=>{
    // const adminlgdt = new AdminLog({
    //     username:"admin",
    //     password: 123
    // });
    // adminlgdt.save();
    res.send("Your admin log is saved in the databases");
});


// router.get("/addressins", (req, res)=>{
//     const address = new Address({
//         name: "Indigo Pvt. Ltd.",
//         address: "mi road 6 jaipur, rajasthan",
//         phone: 79464313,
//         telephone: 46132132
//     });
//     address.save();
//     console.log(address);
//     res.send("Your address is saved");
// });

// get mail code setup

// npm install nodemailer

router.get("/getmail", async(req, res)=>{

// "use strict";
// const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
// async function main() { 
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'msemitra27@gmail.com', // generated ethereal user
      pass: 'aootgtuibyatrsnd', // generated ethereal password
    }, 
    });

  // send mail with defined transport object
    let info = await transporter.sendMail({
    from: 'msemitra27@gmail.com', // sender address
    to: "jitusablaniya@gmail.com", // list of receivers
    subject: "Hello ✔ Second Buddy Mail", // Subject line
    text: "Hello world? Hii", // plain text body
    html: "<b>Hello world?</b>", // html body
    });
});









module.exports = router; 