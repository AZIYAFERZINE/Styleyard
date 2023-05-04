const express = require("express")
const admin_route = express();
const session = require("express-session");
const nocache = require("nocache")
const config = require("../config/config");
const ejs=require('ejs')
const multer = require('multer');

admin_route.use(session({ 
    secret: config.sessionSecret,
    resave:false,
    saveUninitialized:true,    
}));
admin_route.use(express.static('public/admin'));
const auth = require("../middleware/adminAuth");
const adminController = require("../controllers/adminController");
const acouponController = require("../controllers/acouponController");
const bannerController= require("../controllers/bannerController")
const orderController = require("../controllers/orderController");

admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');
admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended: true }));
admin_route.use(nocache());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

admin_route.get('/', auth.isLogout, adminController.loadLogin);
admin_route.post('/', adminController.verifyLogin);
admin_route.get('/logout', auth.isLogin, adminController.logout);

admin_route.get('/dashboard', auth.isLogin, adminController.loadDashboard);
admin_route.get('/salesreport', auth.isLogin,adminController.loadSales)
admin_route.post('/updatingeorder',adminController.sortingorder)
admin_route.get('/users',  adminController.loadUsers);
admin_route.get('/blockuser',adminController.blockUser)

admin_route.get('/category', adminController.loadCategory)
admin_route.post('/category', adminController.addCategory)
admin_route.get('/deleteCategory', adminController.deleteCategory)
admin_route.get("/editCategory",adminController.editcategoryload )
admin_route.post('/editCategory', adminController.editCategory)
admin_route.get("/availCategory", adminController.availableCategory)

admin_route.get('/products', adminController.loadProducts)
admin_route.get('/addProducts', adminController.loadAddProducts)
admin_route.post('/addProducts', upload.array("productpic"),adminController.addProduct)
admin_route.get("/product-detail", adminController.productDetailLoad);
admin_route.get("/editproduct",adminController.editproductload)
admin_route.post("/editproduct",upload.array("productpic"),adminController.editproduct)
admin_route.get("/deleteproduct",adminController.deleteproduct)
admin_route.post("/deleteimage",adminController.deleteimage)

admin_route.get("/banner",bannerController.loadBanner);
admin_route.get("/add-Banners",bannerController.loadAddBanner);
admin_route.post("/add-Banners",upload.array('bImage',3),bannerController.addBanner);
admin_route.get("/hide-banner",bannerController.hideBanner)
admin_route.get("/edit-banner",bannerController.editBanner);
admin_route.get("/delete-banner" ,bannerController.deleteBanner)
admin_route.post("/edit-banner",upload.array('bImage',3),bannerController.editModifyBanner);

admin_route.get("/couponload",acouponController.couponload)
admin_route.post("/addcoupon",acouponController.addcoupon)
admin_route.get ("/editcouponload",acouponController.editcouponload)
admin_route.post("/editcoupon",acouponController.editcoupon)
admin_route.get("/deletecoupon",acouponController.deletecoupon)
admin_route.get("/availcoupon", acouponController.availablecoupon)

admin_route.get("/ordersload",orderController.ordersload)
admin_route.get("/vieworderdetails",orderController.vieworderdetails)
admin_route.post('/updateorder',orderController.sortorder)
admin_route.post("/updatestatus",orderController.updatestatus);

admin_route.all("*", function(req, res){
  res.render('404')
});

module.exports = admin_route;
