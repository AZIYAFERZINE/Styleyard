const coupon = require("../models/couponmodel")

const couponload = async(req,res)=>{
    try{
      const coupons = await coupon.find()
      res.render("couponload",{coupons:coupons})
    }
    catch(error){
      console.log(error.message);
    }
  }
const addcoupon = async (req, res) => {
    try {
      const { name, discount, minimum,maximum ,expiry} = req.body;
      let coupons = await coupon.findOne({ name });
      if (coupons) {
        return res.status(400).json({ errors: [{ msg: 'Coupon already exists' }] });
      }
     const newcoupon = new coupon({
        name:name,
        discount:discount,
        minimumvalue:minimum,
        maximumvalue:maximum,
        expirydate:expiry
      });
  
      await newcoupon.save();
      console.log(coupons)
      res.redirect('/admin/couponload');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }
  const editcouponload = async (req, res) => {
    try {
      const coupons = await coupon.findById(req.query.couponid);
      if (!coupons) {
        return res.status(404).json({ errors: [{ msg: 'Coupon not found' }] });
      }
      res.render('editcoupon', { coupons });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  };
  const editcoupon = async (req, res) => {
    try {
      const { name, discount, minimum, maximum, expiry  } = req.body;  
      let coupons = await coupon.findById(req.query.couponid);
      if (!coupons) {
        return res.status(404).json({ errors: [{ msg: 'Coupon not found' }] });
      }  
      coupons.name = name;
      coupons.discount = discount;
      coupons.minimumvalue = minimum;
      coupons.maximumvalue = maximum;
      coupons.expirydate = expiry;
      await coupons.save(); 
      res.redirect('/admin/couponload');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  };

const deletecoupon = async (req, res) => {
    try {
      const couponId = req.query.couponid;
      const deletedCoupon = await coupon.deleteOne({ _id: couponId });
  
      if (deletedCoupon.n === 0) {
        return res.status(404).json({ errors: [{ msg: 'Coupon not found' }] });
      }
  
      res.redirect('/admin/couponload');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  };
  

  const availablecoupon =async (req,res)=>{
    try {
      const id=req.query.id;
      const allCoupon =await coupon.findOne({_id:id});
      if(allCoupon.isAvailable){
        await coupon.updateOne({_id:id},{$set:{isAvailable:0}})
      }else{
        await coupon.updateOne({_id:id},{$set:{isAvailable:1}})
  
      }
      res.redirect("/admin/couponload");
    } catch (error) {
      console.log(error.message);
    }
  };

  


module.exports={
    couponload,
    addcoupon,
    editcouponload,
    editcoupon,
    deletecoupon,
    availablecoupon,

}