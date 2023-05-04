const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    oprice:{
        type:Number,
        required:true
    },
    stock:{
        type:Number
    },
    image:{
        type:[String]
    },
    isAvailable:{
        type:Number,
        default:1
    }
})

module.exports = mongoose.model('Product',productSchema)