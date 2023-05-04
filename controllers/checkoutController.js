const User = require("../models/userModel");
const Category = require("../models/category");
const Product = require("../models/product");
const address = require("../models/address");
const coupon = require("../models/couponmodel");

const checkoutload = async (req, res) => {
  try {
    const userData = req.session.user_id;
    const useraddress = await address.find({ userId: userData });
    const userdetails = await User.findById({ _id: userData });
    const usercart = await userdetails.populate("cart.item.productId");
    const coupondata = await coupon.find({ isAvailable: 1 });
    console.log(coupondata);
    const categories = await Category.find();

    res.render("checkout", {
      loggedIn: req.session.userLogged,
      user: req.session.username,
      address: useraddress,
      checkoutdetails: usercart.cart,
      coupon: coupondata,
      categories: categories,
      wallet: userdetails.wallet,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const addingnewaddress = async (req, res) => {
  try {
    const newAddress = new address({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      country: req.body.country,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      phone: req.body.phone,
      email: req.body.email,
      userId: req.session.user_id,
    });
    const newaddress = await newAddress.save();
    if (newaddress) {
      res.redirect("/checkoutload");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editcheckoutadd = async (req, res) => {
  try {
    const id = req.query.id;
    const addressdata = await address.findById({ _id: id });
    const categories = await Category.find({ isAvailable: 1 });

    res.render("editcheckoutadd", {
      user: req.session.username,
      loggedIn: req.session.userLogged,
      address: addressdata,
      categories: categories
    });
  } catch (error) {
    console.log(error.message);
  }
};

const updatecheckoutadd = async (req, res) => {
  try {
    const id = req.body.id;
    console.log(id);
    const upadteAddres = await address.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          country: req.body.country,
          address: req.body.address,
          city: req.body.city,
          zip: req.body.zip,
          phone: req.body.phone,
        },
      }
    );
    console.log(upadteAddres);
    res.redirect("/checkoutload");
  } catch (error) {
    console.log(error.message);
  }
};

const delcheckoutadd = async (req, res) => {
  try {
    const id = req.query.id;
    const deleteAddress = await address.findByIdAndDelete({ _id: id });
    res.redirect("/checkoutload");
  } catch (error) {}
};
const addfromcheckout = async (req, res) => {
  try {
    const categories = await Category.find({ isAvailable: 1 });

    res.render("addressfromcheck", {
      user: req.session.username,
      loggedIn: req.session.userLogged,
      categories: categories,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const applycoupon = async (req, res) => {
  try {
    const totalprice = req.body.totalValue;
    console.log("total" + totalprice);
    console.log(req.body.coupon);
    userdata = await User.findById({ _id: req.session.user_id });
    offerdata = await coupon.findOne({ name: req.body.coupon });
    offerdata.usedby.push(userdata)
    console.log("asiya"+offerdata);

    console.log("fghdj");
    if (offerdata) {
      console.log("p333");
      console.log(offerdata.expirydate, Date.now());
      const date1 = new Date(offerdata.expirydate);
      const date2 = new Date(Date.now());
      if (date1.getTime() > date2.getTime()) {
        console.log("p4444");
        console.log(offerdata.usedby);
        if (offerdata.usedby.includes(userdata)) {
          messag = "coupon already used";
          console.log(messag);
          console.log("aziya");
        } else {
          console.log("eldf");
          console.log(
            userdata.cart.totalprice,
            offerdata.maximumvalue,
            offerdata.minimumvalue
          );
          if (userdata.cart.totalprice >= offerdata.minimumvalue) {
            console.log("COMMING");
            console.log("offerdata.name");
            await coupon.updateOne(
              { name: offerdata.name },
              { $push: { usedBy: userdata._id } }
            );
            console.log("kskdfthg");
            disc = (offerdata.discount * totalprice) / 100;
            if (disc > offerdata.maximumvalue) {
              disc = offerdata.maximumvalue;
            }
            console.log(disc);
            res.send({ offerdata, disc, state: 1 });
          } else {
            messag = "cannot apply";
            res.send({ messag, state: 0 });
          }
        }
      } else {
        console.log("hloo");
        messag = "coupon Expired";
        res.send({ messag, state: 0 });
      }
    } else {
      messag = "coupon not found";
      res.send({ messag, state: 0 });
    }
    res.send({ messag, state: 0 });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  checkoutload,
  editcheckoutadd,
  updatecheckoutadd,
  delcheckoutadd,
  addfromcheckout,
  applycoupon,
  addingnewaddress
};
