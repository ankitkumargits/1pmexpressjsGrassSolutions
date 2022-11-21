

const adhandleLogin = (req, res, next)=>{
    if(req.session.isAuth){
        next();
    } else {
        res.redirect("/admin/");
    }
}
module.exports = adhandleLogin;

// add this middleware to the dashboard route  