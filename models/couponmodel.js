const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
},

discount:{
    type:Number,
    required:true
},
minimumvalue:{
    type:Number,
    required:true
},
maximumvalue:{
    type:Number,
    required:true
},
isAvailable:{
    type:Number,
    default:1
},
expirydate: {
    type: Date,
    required: true
},
usedby: {
    type: Array,
    required: true
},
deleted:{
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Coupon', couponSchema);