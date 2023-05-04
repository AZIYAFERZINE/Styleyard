const User = require("../models/usermodel");
const Category = require("../models/category");
const Product = require("../models/product");
const address = require("../models/address");
const order = require("../models/ordermodel");

const profileload = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const user = await User.findOne({ _id: userid });
    const addid = await address.find({ userId: userid });
    console.log(addid);
    const orderdata = await order
      .find({ userId: userid })
      .sort({ createdAt: 1 })
      .populate("products.item.productId");
    console.log(orderdata);
    const categories = await Category.find({ deleted: false });

    res.render("profile", {
      loggedIn: req.session.userLogged,
      user: req.session.username,
      useraddress: addid,
      userData: user,
      order: orderdata,
      categories: categories,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const addnewaddress = async (req, res) => {
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
      res.redirect("/profileload");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const editaddress = async (req, res) => {
  try {
    const id = req.query.id;
    const add = await address.findOne({ _id: id });
    const categories = await Category.find({ isAvailable: 1 });

    res.render("editaddress", {
      user: req.session.username,
      loggedIn: req.session.userLogged,
      address: add,
      categories: categories,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const updateaddress = async (req, res) => {
  try {
    const id = req.body.id;
    console.log(id);
    const upadteAddress = await address.findByIdAndUpdate(
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
    console.log(upadteAddress);
    res.redirect("/profileload");
  } catch (error) {
    console.log(error.message);
  }
};
const deleteaddress = async (req, res) => {
  try {
    const id = req.query.id;
    const Address = await address.deleteOne({ _id: id });
    if (Address) {
      res.redirect("/profileload");
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  profileload,
  addnewaddress,
  editaddress,
  updateaddress,
  deleteaddress,
};
