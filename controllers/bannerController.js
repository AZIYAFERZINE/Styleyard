const banner = require("../models/bannerModel");

const loadBanner = async (req, res) => {
    try {
      const banners = await banner.find()
      res.render("banner", {banner: banners});
    } catch (error) {
      console.log(error.message);
    }
  };
  
  const loadAddBanner = async (req, res) => {
    try {    
      res.render("addBanner", { message: "" });
    } catch (error) {
      console.log(error.message);
    }
  }
    
  const addBanner = async (req, res) => {
    console.log("aaaaa");
    if (req.files.length != 0) {
      try {
        const bannerDetails = new banner({
          name: req.body.bName,
          image: req.files.map((x) => x.filename),
          description: req.body.bDescription
        });
        console.log("bbbb");
       
        const bannerData = await bannerDetails.save();
        if (bannerData) {
          res.redirect("/admin/banner");
        }
      } catch (error) {
        console.log(error.message);
      }
    } else {
      const bannerData = await banner.find();
 
      res.render("addBanner", { banners: bannerData, message: "file should be image" })
    }
  };  
  const hideBanner = async (req, res) => {
    try {
      const id = req.query.id;
      console.log(id);
      const bannerData = await banner.findOne({ _id: id });
      if (bannerData.is_active) {
        await banner.findByIdAndUpdate({ _id: id }, { $set: { is_active: 0 } }); console.log("hidden");
      }
      else { await banner.findByIdAndUpdate({ _id: id }, { $set: { is_active: 1 } }); console.log("unhidden"); }
      res.redirect("/admin/banner");
    } catch (error) {
      console.log(error.message);
    }
  };
    
  const editBanner = async (req, res) => {
    try {
      const id = req.query.id;
      const bannerData = await banner.findById({ _id: id });
      if (bannerData) {
        res.render("editBanner", { banner: bannerData, message: "" });
      } else {
        res.redirect("/admin/product");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  const editModifyBanner = async (req, res) => {
    if (req.files.length != 0) {
      try {
        const bannerData = await banner.findByIdAndUpdate({ _id: req.body.id }, {
          $set: {
            name: req.body.bName,
            image: req.files.map((x) => x.filename),
            description: req.body.bDescription,
          },
        }
        );
        res.redirect("/admin/banner")
      } catch (error) {
        console.log(error.message);
      }
    } else {
    //   const userData = await User.find();
      const bannerData = await banner.find()
      res.render("editBanner", {  banner: bannerData, message: "file should be image!!" })
    }
  };

  const deleteBanner = async (req, res) => {
    try {
      const id = req.query.id;
      const deletedBanner = await banner.findByIdAndDelete(id);
      if (deletedBanner) {
        res.redirect("/admin/banner");
      } else {
        res.redirect("/admin/banner?error=Banner not found");
      }
    } catch (error) {
      console.log(error.message);
      res.redirect("/admin/banner?error=Failed to delete banner");
    }
  };
  

  module.exports={
    loadBanner,
    loadAddBanner,
    addBanner,
    hideBanner,
    editBanner,
    editModifyBanner,
    deleteBanner
  }