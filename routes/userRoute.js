const express = require("express");
const user_route = express();
const session = require("express-session");
const nocache = require("nocache");
const ejs=require('ejs')

const config = require("../config/config");

user_route.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
  })
);

const auth = require("../middleware/auth");
const blockuser=require("../middleware/blockuser")

user_route.use(express.static('public/user'));

user_route.set("view engine", "ejs");
user_route.set("views", "./views/user");


user_route.use(express.json());
user_route.use(express.urlencoded({ extended: true }));
user_route.use(nocache());

const userController = require("../controllers/userController");
const smscontroller = require("../controllers/smsController");
const cartController = require("../controllers/cartController");
const wishlistController = require("../controllers/wishlistController");
const checkoutController = require("../controllers/checkoutController");
const profileController = require("../controllers/profileController");
const orderController = require("../controllers/orderController");

 user_route.get("/",blockuser,userController.loadHome);
 user_route.get("/login", auth.isLogout, userController.loginLoad);
 user_route.post("/login", userController.verifyLogin);
 user_route.get("/logout", auth.isLogin, userController.userLogout);
 user_route.get("/forgotpassword",userController.forgotload);
user_route.post("/forgotpassword",userController.forgotpassword);
user_route.post("/forgototp",userController.forgototp);
user_route.post("/newpasswordadd",userController.newpasswordadd);

user_route.get("/register",  userController.loadRegister);
user_route.post("/register", userController.insertUser);
user_route.post("/register",userController.insertUser,userController.loadotp)
user_route.post("/verifyotp",userController.verifyotp)
user_route.post("/resendotp",userController.insertUser,userController.resendotp)
user_route.get("/contact", userController.contactLoad);
user_route.get("/products", userController.productLoad);
user_route.get("/product-detail", userController.productDetailLoad);

user_route.get("/wishlistload", wishlistController.wishlistload)
user_route.get("/addwishlist", wishlistController.addwishlist)
user_route.get("/removefromwishlist", wishlistController.removefromwishlist)
user_route.get("/cartadding", wishlistController. addToCartremovefromwishlist)

user_route.get("/cartload",auth.isLogin,cartController.cartload)
user_route.get("/addcart",cartController.addcart)
user_route.post("/updatecart",cartController.updatecart)
user_route.get("/removefromcart",cartController.removefromcart)

user_route.get("/checkoutload",checkoutController.checkoutload)
user_route.get("/editcheckoutaddress",checkoutController.editcheckoutadd);
user_route.post("/editcheckoutaddress",checkoutController.updatecheckoutadd);
user_route.get("/deletecheckoutaddress",checkoutController.delcheckoutadd);
user_route.get("/addfromcheckout",auth.isLogin,checkoutController.addfromcheckout);
user_route.post("/applycoupon",checkoutController.applycoupon);
user_route.post("/addingaddress",checkoutController.addingnewaddress);

user_route.get("/profileload",profileController.profileload);
user_route.post("/addaddress",profileController.addnewaddress);
user_route.get("/editaddress",profileController.editaddress)
user_route.post("/editaddress",profileController.updateaddress)
user_route.get("/deleteaddress",profileController.deleteaddress);

user_route.post("/placeorder",orderController.placeorder)
user_route.get("/onlinepayment",orderController.loadordersuccess);
user_route.get("/vieworders",orderController.vieworders)
user_route.get("/cancelorders",orderController.cancelorders);
user_route.get("/returnorders",orderController.returnorders)

user_route.all("*", function(req, res){
  res.render('404')
});


module.exports = user_route;
