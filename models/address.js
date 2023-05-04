const mongoose = require('mongoose')
const User = require('../models/usermodel')
const addressSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'user',
      required:true
    },
    firstname: {
      type: String,
      required: true
    },
    lastname: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zip: {
      type: String,
      required: true
    },
    phone: {
      type: Number,
      required: true
    },
    email: {
      type: String,
      required: true
    }
})




module.exports = mongoose.model('Address', addressSchema)