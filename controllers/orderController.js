const Category = require("../models/category")
const Product = require("../models/product")
const order = require("../models/ordermodel")
const address = require("../models/address")
const User = require('../models/userModel')
const Razorpay = require('razorpay');
require('dotenv').config()

// const placeorder =async(req,res)=>{
//     try {
//    let newAddress
//           if(req.body.address=="undefined"){
//             newAddress=new address({
//             firstname:req.body.firstname,
//             lastname:req.body.lastname,
//             country:req.body.country,
//             address:req.body.details,
//             city:req.body.city,
//             state:req.body.state,
//             zip:req.body.zip,
//             phone:req.body.phone,
//             email:req.body.email
//          })
//         }
       
//         else{
        
//           const addressId = req.body.address[1];
//            newAddress= await address.findById(addressId);
           
//            console.log(newAddress)
//         }
//         const userData = await User.findOne({_id:req.session.user_id})
//         const newOrder =new order({  
//             userId:req.session.user_id,
//             address:newAddress,
//             payment:{
//                 method:req.body.payment,
//                 amount:req.body.amount
               
                
//             },
//             offer:req.body.coupon,
//             products:userData.cart,
//         })
//         console.log(newOrder.payment.amount);
//         await newOrder.save();
//         await User.updateOne({_id:req.session.user_id},{$unset:{cart:1}})
//         const categories = await Category.find({isAvailable:1});
       
//         res.render("ordersuccess",{
//           user:req.session.username,
//           loggedIn:req.session.userLogged,
//           categories:categories,
//           orders:newOrder
//         })
       
        
//     } catch (error) {
//         console.log(error.message);
//     }
//   }

let newOrder
var newAddress
const placeorder =async(req,res)=>{
  try {
    console.log( "hello"  +req.body.reduction);
    console.log(req.body.address);
    if(req.body.payment===undefined||req.body.amount==="0"){
      res.redirect("/checkoutload")
    }
        if(req.body.address==undefined){
          newAddress=new address({
          firstname:req.body.firstname,
          lastname:req.body.lastname,
          country:req.body.country,
          address:req.body.details,
          city:req.body.city,
          state:req.body.state,
          zip:req.body.zip,
          phone:req.body.phone,
          email:req.body.email
       })
      }
      else{
      
        console.log(req.body.address);
         newAddress= await address.findOne({ _id: req.body.address });
         
         console.log(newAddress)
         
      }
      const userData = await User.findOne({_id:req.session.user_id})
       newOrder =new order({  
          userId:req.session.user_id,
          address:newAddress,
          payment:{
              method:req.body.payment,
              amount:req.body.amount,
             reduction:req.body.reduction
              
          },
          offer:req.body.coupon,
          products:userData.cart,
      })
      

      if(req.body.payment == "COD"){
        console.log("hello");
      console.log(newOrder.payment.amount);
      await newOrder.save();
      const productdata = await Product.find()
      for (let key of userData.cart.item) {
        for (let prod of productdata) {

            if (new String(prod._id).trim() == new String(key.productId._id).trim()) {
                prod.stock = prod.stock - key.quantity
                await prod.save()
            }
        }
    }

      
      await User.updateOne({_id:req.session.user_id},{$unset:{cart:1}})
      const categories = await Category.find({ isAvailable:1 });
     
      res.render("ordersuccess",{
        user:req.session.username,
        loggedIn:req.session.userLogged,
        categories:categories,
        
        orders:newOrder


      
      })
    }
      else if (req.body.payment == "wallet") {
        console.log("123");
        let walletAmount = parseInt(req.body.walamount);
        let totalAmount = parseInt(req.body.cost)
        req.session.totalWallet = walletAmount;
        console.log(req.session.totalWallet);
        if (walletAmount >= totalAmount) {
            console.log("asdfdgadgadg");
            await newOrder.save();
            let userWallet = await User.findOne({ _id: req.session.user_id })
            let minusAmt = userWallet.wallet - req.body.cost;
            let minuswalAmt = await User.updateOne({ _id: req.session.user_id }, { $set: { wallet: minusAmt } })
            console.log(minuswalAmt);
            await User.updateOne({ _id: req.session.user_id }, { $unset: { cart: 1 } })
  
            const productdata = await Product.find()
            for (let key of userData.cart.item) {
                for (let prod of productdata) {
  
                    if (new String(prod._id).trim() == new String(key.productId._id).trim()) {
                        prod.stock = prod.stock - key.quantity
                        await prod.save()
                    }
                }
            
          }
            const categories = await Category.find({ isAvailable:1 });
            
  
            res.render("ordersuccess", {
               user: req.session.username,
               loggedIn:req.session.userLogged,
               categories:categories,
              
               orders:newOrder 
              })
        }else{
          var razorpay = new Razorpay({
            key_id: process.env.key_id,
            key_secret: process.env.key_secret
        })
        let razorpayorder = await razorpay.orders.create({
            amount: req.body.cost * 100,
            currency: 'INR',
            receipt: newOrder._id.toString()
        })
  
        console.log('order Order created', razorpayorder);
        paymentDetails = razorpayorder;
        const productData = await Product.find()
        for (let key of userData.cart.item) {
            for (let prod of productData) {
  
                if (new String(prod._id).trim() == new String(key.productId._id).trim()) {
                    prod.stock = prod.stock - key.quantity
                    await prod.save()
                }
            }
        }
  
        const paymentId = paymentDetails.id;
        razorpay.payments.cancel(paymentId, function(error, payment) {
          if(error) {
            // handle the error
          } else {
            console.log('Payment cancelled:', payment);
            // additional code for handling cancelled payment
          }
        });
        


        }
      } else{
        console.log("ajsal");
        var razorpay = new Razorpay({
          key_id: process.env.key_id,
          key_secret: process.env.key_secret,
        });
        console.log(razorpay);
        let razorpayorder = await razorpay.orders.create({
          amount: req.body.cost * 100,
          currency: "INR",
          receipt: newOrder._id.toString(),
        })
        console.log("nadakko");
  
       console.log('order Order created', razorpayorder);
      paymentDetails = razorpayorder;
        console.log(newOrder+"asfasfasdfdsf");
  
      const productData = await Product.find()
      for (let key of userData.cart.item) {
          for (let prod of productData) {
              if (new String(prod._id).trim() == new String(key.productId._id).trim()) {
                  prod.stock = prod.stock - key.quantity
                  await prod.save()
              }
          }
      }
      res.render("confirmpayment", {
          userId: req.session.user_id,
          order_id: razorpayorder.id,
          total: req.body.amount,
          session: req.session,
          key_id: process.env.key_id,
          user: userData,
          orders: newOrder,
          orderId: newOrder._id.toString(),
  
      });
  
      }
    } 
  
  catch (error) {
        console.log(error.message);
    }
  }
  
  const loadordersuccess = async (req, res) => {
    try {
    
        newOrder.paymentDetails.reciept = paymentDetails.receipt;
        newOrder.paymentDetails.status = paymentDetails.status;
        newOrder.paymentDetails.createdAt = paymentDetails.created_at;
        console.log("confirmation");
        let minuswalAmt = await User.updateOne({ _id: req.session.user_id }, { $set: { wallet: 0 } });
        await newOrder.save();
        await User.updateOne({ _id: req.session.user_id }, { $unset: { cart: 1 } })
     
        res.render("ordersuccess", { user: req.session.user,  orders:newOrder })
  
    } catch (error) {
        console.log(error.message);
    }
  }

  const vieworders=async(req,res)=>{
    try {
        const id=req.query.id;
        console.log(id)
        const users=req.session.user_id
        const orderdetails=await order.findById({_id:id});
        console.log(orderdetails);
    
        await orderdetails.populate('products.item.productId')
        const categories = await Category.find({isAvailable:1});
       
        res.render("vieworders",{
          user:req.session.username,
          loggedIn:req.session.userLogged,
          orders:orderdetails,
          categories:categories
  
        });
    } catch (error) {
        
    }
  }
  
  const cancelorders=async(req,res)=>{
    try {
      const id=req.query.id;
      console.log(id);
      const users=req.session.user_id
      const orderdetails=await order.findById({_id:id});
      let state = "cancelled"
      await order.findByIdAndUpdate({_id: id},{$set:{status:"cancelled"}})
      if (state == "cancelled") {
        const productdata = await Product.find()
        const orderdata = await order.findById({ _id: id });
        for (let key of orderdata.products.item) {
          for (let prod of productdata) {
              console.log(key.productId);
              if (new String(prod._id).trim() == new String(key.productId).trim()) {
                  prod.stock = prod.stock + key.quantity
                  await prod.save()
              }
          }
      }
  }
  if (state == "cancelled" && orderdetails.payment.method != "COD") {
    userdetails = await User.findOne({ _id: orderdetails.userId });
    const walletData = userdetails.wallet;
    userData = await User.updateOne({ _id: orderdetails.userId }, { $set: { wallet: walletData + orderdetails.payment.amount } })


}


      res.redirect("/profileload")
  } catch (error) {
      console.log(error.message);
  }
}
  // const returnorders=async(req,res)=>{
  //   try {
  //       const id=req.query.id;
  //       const users=req.session.user_id
  //       const orderdetails=await order.findById({_id:id});
  //       //const addres = await address.findById({_id:users})
  //       const cancel= await order.findByIdAndUpdate({_id:id},{$set:{status:"returned"}})
  //       await orderdetails.populate('products.item.productId')
  
  //       res.redirect("/profileload")
  //   } catch (error) {
  //       console.log(error.message);
  //   }
  // }

  const returnorders = async (req, res) => {
    try {
        const id = req.query.id;
        const users = req.session.user_id
        console.log('users'+users);
        const orderdetails = await order.findById({ _id: id });
        const addres = await address.find({ userId: users })
        const cancel = await order.findByIdAndUpdate({ _id: id }, { $set: { status: "returned" } })
        await orderdetails.populate('products.item.productId')
        let state = "returned";
        if (state == "returned") {
            const productdata = await Product.find()
            const orderdata = await order.findById({ _id: id });
            for (let key of orderdata.products.item) {
                for (let prod of productdata) {
                    if (new String(prod._id).trim() == new String(key.productId).trim()) {
                        prod.stock = prod.stock + key.quantity
                        await prod.save()
                    }
                }
            }
        }
        if (state == "returned" && orderdetails.payment.method != "COD") {
            userdetails = await User.findOne({ _id: orderdetails.userId });
            console.log("hi" + userdetails.wallet);
        let walletData = userdetails.wallet;
            userData = await User.updateOne({ _id: orderdetails.userId }, { $set: { wallet: walletData + orderdetails.payment.amount } })
        }
        console.log(walletData);
        res.redirect("/profileload")
    } catch (error) {
        console.log(error.message);
    }
  }

  const ordersload = async (req,res)=>{
    try{
      const allorders = await order.find({}).populate("userId")
      const userData = await User.findById( req.session.admin_id );

      res.render("orders",{admin:userData, orders:allorders,orderdetail:allorders})

    }
    catch(error){
      console.log(error.message)
    }
  }
  const vieworderdetails= async(req,res)=>{
    try {
      const id=req.query.id;
      const orders= await order.findById({_id:id});
      const details =await orders.populate('products.item.productId')
      res.render("vieworderdetails",{orders:details});
      
    } catch (error) {
      console.log(error.message);
    }
  }

  const  updatestatus =async(req,res)=>{
    try {
      const status=req.body.status;
      const orderId=req.body.orderId;
      const orderdetails =await order.findByIdAndUpdate({_id:orderId},{$set:{status:status}})
      res.redirect("/admin/ordersload")
    } catch (error) {
      
    }
  }

  const sortorder = async (req, res) => {
    let { start, end } = req.body
    console.log(start, end);
    const allOrders = await order.find({
      createdAt: { $gte: start, $lte: end }
    }).populate("userId");
    console.log("hi" + allOrders);
    res.send({ orderDetail: allOrders });
  }
  
  module.exports = {
    placeorder,
    loadordersuccess,
    vieworders,
    cancelorders,
    returnorders,
    ordersload,
    updatestatus,
    vieworderdetails,
    sortorder
   
};