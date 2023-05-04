const User = require('../models/usermodel')
const Product = require('../models/product')
const Category = require("../models/category")


const wishlistload = async (req, res) => {
    try {
        userSession=req.session.user_id;
        if(userSession){
      
        const categories = await Category.find({isAvailable:1});
        const userData = await User.findById(req.session.user_id);
        const wishlistproducts = await Product.find({
          _id: { $in: userData.wishlist },
        });
        console.log(wishlistproducts);
        res.render("wishlist", {
          loggedIn: req.session.userLogged,
          wishlistproducts: wishlistproducts,
          categories: categories
        });
      } else {
        res.render("login", { access: "you must login to access the service" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  const addwishlist = async (req, res) => {
    try {
        userSession=req.session.user_id;
        if(userSession){
        const productid = req.query.productid;
        const categoryid = req.query.categoryid;
       
        const userData = await User.findById(req.session.user_id);
        if (userData.wishlist.includes(productid)) {
          const message = "Product already exists in wishlist";
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
          userData.wishlist.push(productid);
          await userData.save();
        }
        res.redirect(
          `/products?categoryid=${categoryid}&addedtowishlist=true`
        );
      } else {
        res.render("login", { access: "you must login to access the service" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const removefromwishlist = async (req, res) => {
    try {
      const productid = req.query.productid;
      const userData = await User.findById(req.session.user_id);
      if (userData.wishlist.includes(productid)) {
        await User.updateOne(
          { _id: req.session.user_id },
          { $pull: { wishlist: productid } }
        );
        console.log("Product removed from wishlist successfully!");
      }
      res.redirect("/wishlistload");
    } catch (error) {
      console.log(error.message);
    }
  };
  
  const addToCartremovefromwishlist = async (req, res) => {
    try {
        userSession = req.session.user_id;
        if (userSession) {
            const productId = req.query.id;
            const details = await Product.findOne({ _id: productId })
            console.log(productId)
            const product = await Product.find({ category: details.category});
            const userData = await User.findById({ _id: userSession})
            const productData = await Product.findById({ _id: productId})
            userSession = req.session.user_id
            const userDatas = await User.findById({ _id: req.session.user_id })
            if(details.quantity==0){
                const message = "Sorry!.. product is out of stock";
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
              }else{
            userDatas.addtocart(productData)
            res.redirect('wishlistload')
        }
        } else {
            res.redirect('loginLoad')
        }
    } catch (error) {
        console.log(error.message)
    }
}
module.exports = {
    
    wishlistload,
    addwishlist,
    removefromwishlist,
    addToCartremovefromwishlist 
};
  