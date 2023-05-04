const mongoose = require("mongoose")
const Product = require('../models/product')
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    is_admin: {
        type: Number,
        required: true
    },
   
    wishlist:
    [{ type: mongoose.Schema.Types.ObjectId,
       ref: 'Product' }],

       cart:{
        item:[{
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Product',
                required:true
            },
            quantity:{
                type:Number,
                required:true
            },
            oprice:{
                type:Number
            },
        }],
        totalprice:{
            type:Number,
            default:0
        }
    },
    wallet: {
        type: Number
    },
    is_verified: {
        type: Number,
        required: true,
        default:1
    },
    
    blocked: {
        type:Boolean,
        default:false

    }
});

userSchema.methods.updatecart = async function (id,Quantity){
    const cart = this.cart
    const products = await Product.findById(id)
    const index = cart.item.findIndex(objInItems => {
        return new String(objInItems.productId).trim() == new String(products._id).trim()
    })
    console.log(id);
    console.log(Quantity)
    console.log(index)
    console.log(cart.item[index].quantity);
    if(Quantity >cart.item[index].quantity ){
        cart.item[index].quantity +=1
        console.log(cart.item[index].quantity);
        cart.totalprice += products.oprice
    }else if (Quantity < cart.item[index].quantity) {
        cart.item[index].quantity -= 1
        cart.totalprice -= products.oprice
    }console.log(cart.totalprice);
     this.save()
     return cart.totalprice
}

userSchema.methods.removefromcart =async function (productId){
    const cart = this.cart
    const isExisting = cart.item.findIndex(objInItems => new String(objInItems.productId).trim() === new String(productId).trim())
    
    console.log(isExisting);
    if(isExisting >= 0){
         console.log("hi")
        const prod = await Product.findById(productId)
        console.log(prod);
        cart.totalprice -= prod.oprice * cart.item[isExisting].quantity
        cart.item.splice(isExisting,1)
       // console.log("User in schema:",this);
        return this.save()
    }
}

userSchema.methods.addtocart = async function (product) {
    const wishlist = this.wishlist
    console.log('this'+wishlist);
    const isExist = wishlist.findIndex(objInItems => new String(objInItems.productId).trim() === new String(product._id).trim())
    if (isExist >= 0) {
        wishlist.splice(isExist, 1)
    }
    console.log('isExist'+isExist);
    const cart = this.cart
    const isExisting = cart.item.findIndex(objInItems => {
        return new String(objInItems.productId).trim() == new String(product._id).trim()
    })
    console.log(isExisting);
    if (isExisting >= 0) {
        cart.item[isExisting].quantity += 1
    } else {
        cart.item.push({
            productId: product._id,
            quantity: 1, oprice: product.oprice
        })
    }
    cart.totalPrice += product.oprice
    console.log("User in schema:", this);
    return this.save()
}

module.exports = mongoose.model('user', userSchema)