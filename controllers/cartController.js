const User = require('../models/userModel')
const Product = require('../models/product')
const Category = require("../models/category")

const cartload = async (req, res) => {
    try {
        userSession=req.session.user_id;
        if(userSession){
        const categories = await Category.find({ isAvailable:1 });
      
        const userData = await User.findById(req.session.user_id);
        const cartproducts = await userData.populate("cart.item.productId");
        console.log(cartproducts.cart);
        res.render("cart", {
          loggedIn: req.session.userLogged,
          categories: categories,
          cartproducts: cartproducts.cart,
        });
      } else {
        res.render("login", { access: "you must login to access the service" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  const addcart = async (req, res) => {
    try {
        userSession=req.session.user_id;
      
        if(userSession){
        const productId = req.query.productId;
        console.log(productId);
        console.log("hello")
        // const addedfromproductdetails = req.query.productdetails;
        // const addedfromproductlist = req.query.productlist;
        const category_id = req.query.categoryid;
        console.log(category_id)

        const userData = await User.findById(req.session.user_id);
        const productdata = await Product.findById(productId);
        console.log(productdata);
    
        // Check if the product is already in the cart
        const cartItem = userData.cart.item.find((item) =>
          item.productId.equals(productId)
        );
        console.log(cartItem);
        console.log("hi");
  
        if (cartItem) {
          const message = "Product already exists in cart";
          const html = `
               <html>
                <head>
                  <script>
                      alert('${message}');
                     window.history.back();
                  </script>
                </head>
               <body></body>
              </html>
               `;
          res.send(html);
        } else {
          // If the product is not in the cart, add it
          const itemprice = productdata.oprice;
          console.log(itemprice);
          userData.cart.item.push({ productId, quantity: 1, oprice: itemprice });
          console.log(userData.cart.item)
  
          // Remove the product from the wishlist
          userData.wishlist = userData.wishlist.filter(
            (wish) => !wish.equals(productId)
          );
        
          //calculate total price
          userData.cart.totalprice += itemprice;
          await userData.save()
          res.redirect(`/product-detail?id=${productId}`)
  
      }
     } else {
        res.render("login", {
          access: "you must login to access the service",
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const updatecart = async (req, res) => {
    try {
      console.log("thisss");
      let { Quantity, _id } = req.body;
      console.log(Quantity);
      console.log(_id);
      console.log("hi");
  
      const userData = await User.findById(req.session.user_id);
      const productData = await Product.findById(_id);
      const oprice = productData.oprice;
      console.log(Quantity);
  
      let test = await userData.updatecart(_id, Quantity);
      console.log(test);
      res.json({ test, oprice });
      res.redirect("/cartload");
    } catch (error) {
      console.log(error);
    }
  };
  
  const removefromcart = async (req, res) => {
    try {
      const productId = req.query.productId;
      console.log(productId);
      const userData = await User.findById(req.session.user_id);
      console.log(userData);
      userData.removefromcart(productId);
      res.redirect("/cartload");
     
    } catch (error) {
      console.log(error);
    }
  };
  module.exports = {
    cartload,
    addcart,
    updatecart,
    removefromcart
  }