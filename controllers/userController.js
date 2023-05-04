const User = require('../models/usermodel')
const Category = require("../models/category")
const Product = require("../models/product")
const bcrypt = require('bcrypt');
const smscontroller = require("../controllers/smsController");
const Banner = require('../models/bannerModel')
const session = require('express-session');
const { sendMessage } = require('fast-two-sms');

const loadRegister = async (req, res) => {
    try {
        res.render('registration',{active:1})
    }
    catch (error) {
        console.log(error.message)
    }
}

const insertUser = async (req,res,next) => {
    try {
        const name = req.body.name;
        const email =req.body.email;
        const phone = req.body.phone;
        const password =req.body.password;
    
        const validate = await User.findOne({$or:[{email:email},{name:name},{phone:phone}]})
        if(validate){
          res.render("registration",{message:"invalid user"})
        }
         else{
          req.newUser = {
            name:name,
            email:email,
            phone:phone,
            password:password,
            is_admin:0
          }
          console.log(req.newUser)
          next()
        }
      } catch (error) {
        console.log(error.message);
      } 
}

const loadotp= async(req,res)=>{
    try{
    const userData= req.newUser
    console.log(userData);
    const phone = userData.phone
    
    const otp= await smscontroller.sendMessage(phone)
    req.session.otp =otp
    console.log(req.session.otp)
    res.render("otp",{otp:otp,userData:userData})
    } catch(error){
        console.log(error.message);
    }

}
const verifyotp=async(req,res)=>{
    try{
        const userotp= req.body.otp
        const serverotp= req.session.otp
        console.log(userotp)
        console.log(serverotp)
        if(userotp == serverotp){
            const password = await bcrypt.hash(req.body.password,10)

            const user = new User({
                name:req.body.name,
                email:req.body.email,
                phone:req.body.phone,
                password:password,
                is_admin:0
              })
          await user.save().then(()=>console.log("registration successfull"))
          req.session.userLogged =true
          req.session.user_id = user.name
            
            res.redirect("/")

          
        }else{
            console.log("otp not match");
            res.render("otp",{message:"invalid OTP"})

        }
    } catch(error){
        console.log(error.message)
    }

}

const resendotp = async (req, res) => {
    try {
      const userData = req.newUser;
      console.log(userData);
  
      // Check if userData exists and has phone property
      if (!userData || !userData.phone) {
        throw new Error("Invalid user data");
      }
  
      const phone = userData.phone;
  
      // generate a new OTP and store it in the session
      const newotp = await smscontroller.sendMessage(phone);
      req.session.otp = newotp;
  
      // send the new OTP to the user's email or phone number
      console.log(req.session.otp);
      res.render("otp", { otp: newotp, userData: userData });
  
      res.status(200).json({ message: "OTP sent successfully." });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: "Something went wrong." });
    }
  };

// login user 
const loginLoad = async (req, res) => {
    try {
      if (req.session.userlogged) {
        res.redirect("/");
      } else {
        res.render('login',{active:0});
    }
  }catch (error) {
        console.log(error.message);
    }
 
};

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        console.log(email);
        const userData = await User.findOne({ email: email });
        console.log("user:"+userData)
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password)
           
            if (passwordMatch) {
                if(userData.is_verified){
                req.session.user_id = userData._id;
                req.session.username=userData.name;
                req.session.userlogged = true
              
                const status = await User.findByIdAndUpdate({_id:userData._id},{$set:{status:1}}); console.log(status);
                res.redirect('/')
                
                } else{
                    res.render('login', {message:"You have been temporarily blocked by the Administrator , Please login after sometime",active:0}) 
                }
            }
            else {
                res.render('login', { message: 'email or password is incorrect' ,active:0})
            }
        }
        else {
            res.render('login', { message: 'invalid user ',active:0 })
        }
    }
    catch (error) {
        console.log(error.message);
    }
}

const forgotload = async (req, res) => {
    res.render("forgotpassword", { message: "" });
  };
  const forgotpassword = async (req, res) => {
    try {
      const phone = req.body.phone;
      const userData = await User.findOne({ phone: phone });
      console.log(userData);
  
      const otp = await smscontroller.sendMessage(phone);
      req.session.otp = otp;
      console.log(req.session.otp);
      res.render("otpforpass", { otp: otp, userData: userData });
    } catch (error) {
      console.log(error.message);
    }
  };

  const forgototp = async (req, res) => {
    try {
      const userotp = req.body.otp;
      const serverotp = req.session.otp;
      console.log(userotp);
      console.log(serverotp);
      if (userotp == serverotp) {
        const password = req.body.password;
        console.log(password);
  
        res.render("newpassword", { oldpassword: password });
      } else {
        console.log("otp not match");
        res.render("otp", { message: "invalid OTP" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const newpasswordadd = async (req, res) => {
    try {
      const newpassword = await bcrypt.hash(req.body.password, 10);
      console.log(newpassword);
  
      const oldpassword = req.body.oldpassword;
      const user = await User.findOne({ password: oldpassword });
      console.log(newpassword)
      user.set({ password: newpassword });
      console.log(user);
      await user.save();
      res.redirect("/login");
    } catch (error) {
      console.log(error.message);
    }
  };


const loadHome = async (req, res) => {
    try {

            const categories= await Category.find({isAvailable:1})
            const products= await Product.find()
            const banner = await Banner.findOne({is_active:1});
            console.log(banner)
            // const completeUser = await userData.populate('cart.item.productId')
           res.render("home",{userData:req.session.username,loggedIn:req.session.userlogged,categories:categories,products:products,banner:banner}) 
    }
    catch (error) {
        console.log(error.message)
    }
}
const userLogout = async (req, res) => {
    try {
        req.session.user_id = "";
        req.session.username = null;
        req.session.userlogged= false;
        
        res.redirect('/')
    }
    catch (error) {
        console.log(error.message)
    }

}

const contactLoad = async (req, res) => {
  try {

          const categories= await Category.find({isAvailable:1})
          const products= await Product.find()
        
       
         res.render("contact",{userData:req.session.username,loggedIn:req.session.userlogged,categories:categories,products:products}) 
  }
  catch (error) {
      console.log(error.message)
  }
}




//product page

const productLoad = async (req, res) => {
  try {
    const categorize = req.query.categoryid;
  
  
    const pricemin = parseInt(req.query.priceMin)|| 100;
    const pricemax = parseInt(req.query.priceMax)|| 2000;
    console.log(categorize);
    console.log(pricemin);
    console.log(pricemax);
    req.session.priceMin = pricemin;
    req.session.priceMax = pricemax;

    const addedwishlist = req.query.addedtowishlist;
    const addedcart = req.query.addedtocart;
    const page = parseInt(req.query.page) || 1; // Current page number
    const pageSize = parseInt(req.query.pageSize) || 4; // Number of items per page
    const skip = (page - 1) * pageSize; // Number of items to skip
    let query = { isAvailable:1,oprice:{$gte: pricemin, $lte: pricemax} };
    
     if (categorize) {
      query.category = categorize
    }
    if (req.query.query) {
      query.name =  { $regex: req.query.query, $options: "i" };
    }
    const count = await Product.countDocuments(query); // Count the total number of matching documents
    const totalPages = Math.ceil(count / pageSize); // Calculate the total number of pages
    const products = await Product.find(query).sort({price:1}).skip(skip).limit(pageSize)
    const categories = await Category.find({ isAvailable:1 });
   
    if (addedwishlist || addedcart) {
      res.render("products", {
        loggedIn: req.session.userLogged,
        categories: categories,
        products: products,
        pricemin: pricemin,
        pricemax: pricemax,
        addedtowishlist: true,
        addedtocart: true,
        categorize:categorize,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
       
        query: req.query.query // Pass search query to EJS template
      });
    } else {
      res.render("products", {
        loggedIn: req.session.userLogged,
        categories: categories,
       products: products,
        pricemin: pricemin,
        pricemax: pricemax,
        addedtowishlist: false,
        addedtocart: false,
        categorize:categorize,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
        query: req.query.query // Pass search query to EJS template
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};


//product detail page
const productDetailLoad = async (req, res) => {
    try{
       const productid = req.query.id
       const products = await Product.findById(productid);
       const categories= await Category.find({isAvailable:1})
       const cat = await Category.find({_id:products.category})
       console.log('cat'+cat);
    
       res.render('product-detail',{loggedIn:req.session.userLogged,categories:categories,products:products,cat:cat})  
      }  catch (error) {
          console.log(error.message);
      }
  }



module.exports = {
    loadRegister,
    insertUser,
    loadotp,
    verifyotp,
    resendotp,
    loginLoad,
    verifyLogin,
    forgotload,
    forgotpassword,
    forgototp,
    newpasswordadd,
    loadHome,
    userLogout,
    productLoad,
    productDetailLoad   ,
    contactLoad
}
