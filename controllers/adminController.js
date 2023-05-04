const User = require("../models/userModel");
const Category = require('../models/category')
const Product = require('../models/product')
const order = require("../models/ordermodel");
const bcrypt = require("bcrypt");


const fs = require('fs');
const path = require('path');


const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
 try {
    const email = req.body.email;
    const password = req.body.password;
    console.log(req.body.email);

    const userData = await User.findOne({ email: email });

    if (userData) {

      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_admin === 0) {

          res.render("login", { message: "email and password incorrect" });
        } else {
          req.session.admin_id = userData._id;
          req.session.adminlogged = true;
          res.redirect("/admin/dashboard");
        }
      } else {
        res.render("login", { message: "email and password is incorrect" });
      }
    } else {
      res.render("login", { message: "email and password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//
// const loadDashboard = async (req,res)=>{
//   try {
//       const products = await Product.find()
//   let pds = [], qty = []
//   products.map(x => {
//     pds = [...pds, x.name]
//     qty = [...qty, x.stock]
//   })
//   const arr = [];
//   const orders = await order.find().populate('products.item.productId');
//   for (let Orders of orders) {
//     for (let product of Orders.products.item) {
//       const index = arr.findIndex(obj => obj.product == product.productId.name);
//       if (index !== -1) {
//         arr[index].quantity += product.quantity;
//       } else {
//         arr.push({ product: product.productId.name, quantity: product.quantity });
//       }
//     }
//   }
//   const key1 = [];
//   const key2 = [];
//   arr.forEach(obj => {
//     key1.push(obj.product);
//     key2.push(obj.quantity);
//   });
//   const sales = key2.reduce((value, number) => {
//     return value + number;
//   }, 0)
//   let totalRevenue =0
//   for(let Orders of orders){
//      totalRevenue += Orders.products.totalprice;
//    }

//       const userData = await User.findById({_id:req.session.admin_id});
//       const users = await User.find({is_admin:0});

//       res.render('dashboard',{admin:userData,key1,key2,pds,qty,sales,totalRevenue,users:users});
//   } catch (error) {
//       console.log(error.message);
      
//   }
// }

const loadDashboard = async (req, res) => {
  try {
    // Fetch all products
    const weeklySales = [10, 20, 30, 40, 50]; // example data, replace with your own data
    
    const products = await Product.find();
    let pds = [], qty = [];
    products.map(x => {
      pds = [...pds, x.name];
      qty = [...qty, x.stock];
    });

    // Fetch orders created within the last 7 days
    const aWeekAgo = new Date();
    aWeekAgo.setDate(aWeekAgo.getDate() - 7);
    const orders = await order.find({
      created_at: { $gte: aWeekAgo }
    }).populate('products.item.productId');

    // Calculate total sales and revenue for the week
    const arr = [];
    let totalRevenue = 0;
    for (let Orders of orders) {
      for (let product of Orders.products.item) {
        const index = arr.findIndex(obj => obj.product == product.productId.name);
        if (index !== -1) {
          arr[index].quantity += product.quantity;
        } else {
          arr.push({ product: product.productId.name, quantity: product.quantity });
        }
      }
      totalRevenue += Orders.products.totalprice;
    }

    // Prepare data for charts
    const key1 = [];
    const key2 = [];
    arr.forEach(obj => {
      key1.push(obj.product);
      key2.push(obj.quantity);
    });
    const sales = key2.reduce((value, number) => {
      return value + number;
    }, 0);

    

    // Fetch user data
    const userData = await User.findById({ _id: req.session.admin_id });
    const users = await User.find({ is_admin: 0 });

    res.render('dashboard', { admin: userData, key1, key2, pds, qty, sales, totalRevenue, users,weeklySales});
  } catch (error) {
    console.log(error.message);
  }
}


const loadSales = async (req,res)=>{
  try{
    const allorders = await order.find({}).populate("userId")
    const delorders = await order.find({status:"Delivered"}).populate("userId")
    const userData = await User.findById( req.session.admin_id );

    res.render("viewsales",{admin:userData, orders:allorders,orderdetail:allorders,delorders:delorders})

  }
  catch(error){
    console.log(error.message)
  }
}

const sortingorder = async (req, res) => {
  let { start, end } = req.body
  console.log(start, end);
  const allOrders = await order.find({
    createdAt: { $gte: start, $lte: end },status:"Delivered"
  }).populate("userId");
  // const delorders = await order.find({status:"Delivered"})
  console.log("hi" + allOrders);
  res.send({ orderDetail: allOrders ,delorders:delorders});
}

const logout = async (req, res) => {
  try {
    console.log(req.session.admin_id)
    
    req.session.adminlogged=true
    console.log( req.session.adminlogged);
    res.render("login")
} catch(error){
    console.log(error.message);
  }
};


const loadUsers = async (req, res) => {
try {
  const userData = await User.find({is_admin:0});

  res.render('users',{users:userData})
} catch (error) {
  console.log(error.message);
}
}


const blockUser = async(req,res)=>{
  try{
    const id = req.query.id
      const user = await User.findById({_id:id})
    if(user){
      user.blocked=!user.blocked
      await user.save()
      console.log(user);
      res.redirect("/admin/users")
    }else{
      res.status(404).json({message: "user not found"})
    }

  }
  catch (error) {
    console.log(error.message);
}


}

const loadCategory = async (req, res) => {
  try {
    var search = "";
    if (req.query.search) {
      search = req.query.search;
    var categoryData = await Category.find({ name: { $regex: ".*" + search + ".*" } });
    }
    if(!req.query.search){
       categoryData = await Category.find({});
    }      console.log(categoryData);

    res.render("category", { category: categoryData });
  } catch (error) {
    console.log(error);
  }
};

const addCategory = async (req, res) => {
    try {
      const newcategory = new Category({
        name: req.body.name,
        description: req.body.description
      });
      console.log(newcategory)
      await newcategory.save();
      
      res.redirect('/admin/category');
    } catch (err) {
      if (err.code === 11000) {
        res.redirect('/admin/category');
      } else {
       
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  const editcategoryload = async (req,res)=>{
    try {
        
        const id = req.query.id;
        const categories = await Category.findById({_id:id});
        console.log(categories);
        
        if(categories){
            
            res.render('editcategory',{category:categories});
            console.log(categories);
        }else{
            res.redirect('/admin/category')
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
const editCategory = async(req,res)=>{
  console.log("Entered Update");
    try {
        const id = req.body.id;
        console.log(id);
      const categories = await Category.findById({_id:id});
        console.log(categories);
        
            categories.name = req.body.name;
            categories.description = req.body.description;
            await categories.save();
            res.redirect('/admin/category');
        
         } catch (error) {
        console.log(error.message);
    }
}

const deleteCategory = async (req, res) => {
  const id = req.query.id;
  
    try {
      const categories = await Category.findByIdAndDelete({_id:id});
      console.log(categories);
      if (!categories) {
        return res.status(404).send("Category not found");
      }
      res.redirect('/admin/category');
    } catch (error) {
      console.log(error.message);
    }
};

const availableCategory =async (req,res)=>{
  try {
    const id=req.query.id;
    const allCategory =await Category.findOne({_id:id});
    if(allCategory.isAvailable){
      await Category.updateOne({_id:id},{$set:{isAvailable:0}})
    }else{
      await Category.updateOne({_id:id},{$set:{isAvailable:1}})

    }
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

const loadProducts = async (req, res) => {
  try {
    const productData = await Product.find();
    const categories= await Category.find({isAvailable:1})
   console.log(productData.categories)
   console.log(productData)
   console.log(categories)
    res.render("product", { Product:productData ,category:categories}); 
     
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
    // const details = await Product.findOne({ _id: productid });
    // const product = await Product.find({ category: details.category });
     res.render('product-detail',{categories:categories,products:products})  
    }  catch (error) {
        console.log(error.message);
    }
}

const loadAddProducts = async (req, res) => {
  try {
    const productData = await Product.find();
    const categories= await Category.find({isAvailable:1})
    console.log(categories)
    
    if(req.session.productadded){
    res.render("addproduct", { message:"you have succesfully added product", Product:productData ,categories:categories}); 
    }else{
      res.render("addproduct",{ message:"",Product:productData ,categories:categories})
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addProduct = async (req, res) => {
  try {
    
      const { name, description, price,oprice,stock, mycategory} = req.body;
      const imagePaths = req.files.map(file => file.filename);
      console.log(imagePaths)
    console.log(req.body.name)
    
      if(!imagePaths){
        return 
      }
      const newproduct = new Product({
            name,
            description,
            price,
            oprice,
            image: imagePaths,
            stock,
            category: mycategory
        }); 
        
        
        await newproduct.save();

      req.session.productadded = true;
      res.redirect('/admin/addProducts');
  } catch (err) {
      console.error(err);
  }
};



const editproductload = async(req,res)=>{
  try{
  const id = req.query.id
  const products = await Product.findById({_id:id});
 
  const categories = await Category.find({isAvailable:1})
  if(products){
  res.render('editproduct',{products:products,categories:categories,message:""});
    
}else{
    res.redirect('/admin/editproduct')
}
}
catch(error){
  console.log(error.message)
}
}

const editproduct = async(req,res)=>{
  try {
      const id = req.query.id;
      console.log(id);
      const products = await Product.findById({_id:id})
      // get existing images
      const existingImages = products.image;

      // get new image paths
      const newImagePaths = req.files.map(file => file.filename);

      // combine existing and new image paths
      const imagePaths = [...existingImages, ...newImagePaths];
      
          products.name = req.body.name;
          products.description = req.body.description;
          products.price = req.body.price;
          products.oprice = req.body.oprice;
          products.stock = req.body.stock;
          products.image = imagePaths;
          products.category = req.body.mycategory;
         

          await products.save();
          res.redirect('/admin/editproduct?id='+ products._id);
      
       } catch (error) {
      console.log(error.message);
  }
}

const deleteproduct = async(req, res) => {
const id = req.query.id;

try {
  const products = await Product.findByIdAndDelete({_id:id});
  console.log(products);
  if (!products) {
    return res.status(404).send("product not found");
  }
  res.redirect('/admin/products');
} catch (error) {
  console.log(error.message);
}
}
const deleteimage = async (req, res) => {
  try {
    let { pId, img } = req.body
    console.log(pId, img);
    await Product.updateOne({ _id: pId }, { $pull: { image: img } })
    const productData = Product.findOne({ _id: pId })
    console.log(productData);
    res.send({ newImage: productData.image });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  loadSales,
  sortingorder,
  logout,
  blockUser,
  loadUsers,
  loadProducts,
  loadAddProducts,
  addProduct,
  editproductload,
  editproduct,
  deleteproduct,
  loadCategory,
  addCategory,
  editcategoryload,
  editCategory,
  deleteCategory,
  availableCategory,
  productDetailLoad,
  deleteimage
};
 



